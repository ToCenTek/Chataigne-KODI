var secIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = true;
var syncStatusValue = null;
var sysHelperName = "OS";
var allIps = [];
var ackCount = 0;
var posMs = [];
var localPort = 9527;

var lastFile = "/storage/videos/4K_29.97-Chimei-inn-RoastDuck.mp4";
var driftPhase = 0;

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
    udpSend("OPEN", lastFile);
    udpSend("PLAY");
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
        if (parts.length >= 3) {
            var ms = Number(parts[1]);
            if (!isNaN(ms)) posMs.push(ms);
        }
    } else {
        ackCount++;
        if (ackCount <= 5) script.log("ACK: " + data);
    }
}

function update(deltaTime) {
    driftPhase++;
    if (allIps.length < 2) return;
    // Phase 1: UDP POS 查询所有 KODI 位置
    if (driftPhase % 2 === 1) {
        posMs = [];
        for (var i = 0; i < allIps.length; i++) {
            local.sendTo(allIps[i].split(":")[0], 9527, "POS\n");
        }
    }
    // Phase 2: 计算漂移（dataReceived 已收集 POS 响应）
    if (driftPhase % 2 === 0 && posMs.length >= 2) {
        var minMs = posMs[0], maxMs = posMs[0];
        for (var i = 1; i < posMs.length; i++) {
            if (posMs[i] < minMs) minMs = posMs[i];
            if (posMs[i] > maxMs) maxMs = posMs[i];
        }
        var dv = maxMs - minMs;
        var dc = local.values.getChild("Status").getChild("Drift");
        if (dc) dc.set("" + dv + "ms");
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