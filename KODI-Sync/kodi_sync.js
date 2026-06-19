var secIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = true;
var syncStatusValue = null;
var sysHelperName = "OS";
var allIps = [];
var ackCount = 0;
var posMs = [];
var posReady = 0;
var localPort = 9527;

var lastFile = "/storage/videos/4K_29.97-Chimei-inn-RoastDuck.mp4";
var driftPhase = 0;
var syncPhase = 0;
var syncRefPct = 0;
var syncTries = 0;
var syncMinPct = 0;
var syncWait = 0;

function execShell(cmd) {
    var helper = root.modules.getChild("OS");
    if (helper == null) { script.log("OS module missing"); return false; }
    if (helper.launchProcess) { helper.launchProcess(cmd); return true; }
    return false;
}

function udpSend(cmd, val) {
    var msg = cmd;
    if (val != null) msg += ":" + val;
    for (var i = 0; i < allIps.length; i++) {
        local.sendTo(allIps[i].split(":")[0], 9527, msg + "\n");
    }
}

function playAll() {
    udpSend("PLAYSYNC", lastFile);
}

function pauseAll() { udpSend("PAUSE"); }
function stopAll() { udpSend("STOP"); }
function seekAll(Percentage) { udpSend("SEEK", Percentage != null ? Percentage : 50); }
function setVolumeAll(Volume) { udpSend("VOLUME", Volume != null ? Math.round(Volume) : 50); }
function muteAll(Mute) { udpSend("MUTE", (Mute != null && Mute) ? "1" : "0"); }
function set3DModeAll(Mode) { udpSend("3D", Mode || "off"); }
function setAspectAll(Count) {
    for (var n = 0; n < (Count || 1); n++) udpSend("ASPECT");
}

function updateSyncStatus(text) {
    if (syncStatusValue == null) syncStatusValue = local.values.getChild("Status").getChild("Sync Status");
    if (syncStatusValue) syncStatusValue.set(text);
    script.log("Sync: " + text);
}

function reloadIps() {
    secIps = []; allIps = [];
    var cont = local.values.getChild("Status");
    if (cont) {
        var secVal = cont.getChild("Secondaries");
        if (secVal) {
            var lines = secVal.get().split("\n");
            for (var i = 0; i < lines.length; i++) {
                var ip = lines[i];
                if (ip.length > 0) secIps.push(ip);
            }
        }
        var uVal = cont.getChild("HTTP User");
        if (uVal) httpUser = uVal.get();
        var pVal = cont.getChild("HTTP Pass");
        if (pVal) { var pw = pVal.get(); httpPass = (pw && pw.length > 0) ? pw : "tocentek"; }
    }
    for (var i = 0; i < secIps.length; i++) allIps.push(secIps[i]);
}

function reSync() {
    if (allIps.length < 2) return;
    syncPhase = 1;
    updateSyncStatus("Syncing...");
    for (var i = 0; i < allIps.length; i++) {
        local.sendTo(allIps[i].split(":")[0], 9527, "PAUSE\n");
    }
}

function toggleSync() {
    syncEnabled = !syncEnabled;
    var syncParam = local.parameters.getChild("Sync Enabled");
    if (syncParam) syncParam.set(syncEnabled);
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
}

function timeToMs(t) {
    if (t == null) return 0;
    return (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000 + (t.milliseconds || 0);
}

function dataReceived(data) {
    if (data.length > 4 && data.substring(0, 4) === "POS:") {
        var parts = data.split(":");
        if (parts.length >= 4) {
            var tag = parts[1];
            var ms = parseFloat(parts[2]);
            if (ms > 0) {
                var firstMatch = -1;
                for (var j = 0; j < allIps.length; j++) {
                    if (allIps[j].split(":")[0] === tag && (firstMatch < 0 || posMs[j] == null)) {
                        if (posMs[j] == null) { firstMatch = j; break; }
                        if (firstMatch < 0) firstMatch = j;
                    }
                }
                if (firstMatch >= 0) { posMs[firstMatch] = ms; posReady++; }
            }
        }
    } else {
        ackCount++;
        if (ackCount <= 5) script.log("ACK: " + data);
    }
}

function update(deltaTime) {
    driftPhase++;
    if (allIps.length < 2) return;
    // ── 漂移监控（正常运行时的 POS 轮询）──
    if (syncPhase === 0) {
        if (driftPhase % 2 === 1) {
            posMs = []; posReady = 0;
            for (var i = 0; i < allIps.length; i++) {
                local.sendTo(allIps[i].split(":")[0], 9527, "POS:" + allIps[i].split(":")[0] + "\n");
            }
        }
        if (driftPhase % 2 === 0 && posReady >= allIps.length) {
            var parts = [];
            for (var i = 1; i < allIps.length; i++) {
                var d = parseFloat(posMs[i]) - parseFloat(posMs[0]);
                parts.push("" + (d > 0 ? Math.floor(d + 0.5) : Math.ceil(d - 0.5)));
            }
            var dc = local.values.getChild("Status").getChild("Drift");
            if (dc) dc.set(parts.join(", "));
        }
        return;
    }
    // ── ReSync 状态机（暂停→校准→恢复）──
    if (syncPhase === 1) {
        syncPhase = 2; syncWait = 0; posMs = []; posReady = 0;
        for (var i = 0; i < allIps.length; i++) {
            local.sendTo(allIps[i].split(":")[0], 9527, "POS:" + allIps[i].split(":")[0] + "\n");
        }
        return;
    }
    if (syncPhase === 2) {
        syncWait++;
        if (posReady >= allIps.length) {
            syncRefPct = posMs[0]; syncMinPct = posMs[0];
            for (var i = 1; i < allIps.length; i++) {
                if (posMs[i] < syncMinPct) syncMinPct = posMs[i];
            }
            syncPhase = 3; syncTries = 0;
            for (var i = 0; i < allIps.length; i++) {
                local.sendTo(allIps[i].split(":")[0], 9527, "SEEK:" + syncMinPct + "\n");
            }
        } else if (syncWait > 6) {
            // 超时恢复
            for (var i = 0; i < allIps.length; i++) { local.sendTo(allIps[i].split(":")[0], 9527, "PLAY\n"); }
            syncPhase = 0; updateSyncStatus("Timeout");
        }
        return;
    }
    if (syncPhase === 3) {
        syncPhase = 4; syncWait = 0; posMs = []; posReady = 0;
        for (var i = 0; i < allIps.length; i++) {
            local.sendTo(allIps[i].split(":")[0], 9527, "POS:" + allIps[i].split(":")[0] + "\n");
        }
        return;
    }
    if (syncPhase === 4) {
        syncWait++;
        if (posReady >= allIps.length) {
            var minP = posMs[0], maxP = posMs[0];
            for (var i = 1; i < allIps.length; i++) {
                if (posMs[i] < minP) minP = posMs[i];
                if (posMs[i] > maxP) maxP = posMs[i];
            }
            if (maxP - minP < 100) {
                for (var i = 0; i < allIps.length; i++) { local.sendTo(allIps[i].split(":")[0], 9527, "PLAY\n"); }
                syncPhase = 0; updateSyncStatus("Synced");
            } else {
                syncTries++;
                if (syncTries < 3) {
                    syncPhase = 3; syncWait = 0; posMs = []; posReady = 0;
                    for (var i = 0; i < allIps.length; i++) {
                        local.sendTo(allIps[i].split(":")[0], 9527, "SEEK:" + syncRefPct + "\n");
                    }
                } else {
                    for (var i = 0; i < allIps.length; i++) { local.sendTo(allIps[i].split(":")[0], 9527, "PLAY\n"); }
                    syncPhase = 0; updateSyncStatus("Sync failed");
                }
            }
        } else if (syncWait > 6) {
            for (var i = 0; i < allIps.length; i++) { local.sendTo(allIps[i].split(":")[0], 9527, "PLAY\n"); }
            syncPhase = 0; updateSyncStatus("Timeout");
        }
        return;
    }
}

function init() {
    script.log("KODI Sync init");
    reloadIps();
    // 通知插件模块的接收端口
    for (var i = 0; i < allIps.length; i++) {
        local.sendTo(allIps[i].split(":")[0], 9527, "PORT:" + localPort + "\n");
    }
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
    script.setUpdateRate(2);
}

function moduleValueChanged(value) {
    var n = value.name.toLowerCase();
    if (n === "secondaries" || n === "httpuser" || n === "httppass") reloadIps();
}