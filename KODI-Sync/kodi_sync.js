var secIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = true;
var syncStatusValue = null;
var sysHelperName = "OS";
var allIps = [];
var rcvPort = 9528;
var ackCount = 0;

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

function sendPort() {
    udpSend("PORT", rcvPort);
    script.log("PORT sent: " + rcvPort);
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
    ackCount++;
    if (ackCount <= 5) script.log("ACK: " + data);
}

function update(deltaTime) {
    script.log("update called");
    driftPhase++;
    if (driftTick % 2 !== 0) return;
    if (allIps.length < 2) return;
    // 查询所有 KODI 的位置
    var cJson = '{"jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["time","speed"]},"id":"d"}';
    for (var i = 0; i < allIps.length; i++) {
        var h = allIps[i].split(":")[0];
        execShell("/usr/bin/curl -s --max-time 2 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + cJson + " -o /tmp/kodi_d_" + i + ".txt http://" + h + ":8080/jsonrpc");
    }
    // 读取所有结果，找最大最小值
    var minMs = -1, maxMs = -1;
    for (var i = 0; i < allIps.length; i++) {
        var c = util.readFile("/tmp/kodi_d_" + i + ".txt");
        if (c && c.charAt(0) === "{") {
            var d = JSON.parse(c);
            if (d && d.result && d.result.time && d.result.speed > 0) {
                var ms = timeToMs(d.result.time);
                if (minMs < 0 || ms < minMs) minMs = ms;
                if (maxMs < 0 || ms > maxMs) maxMs = ms;
            }
        }
    }
    if (minMs >= 0 && maxMs >= 0) {
        var dv = maxMs - minMs;
        var dc = local.values.getChild("Status").getChild("Drift");
        if (dc) dc.set("" + dv + "ms");
    }
}

function init() {
    script.log("KODI Sync init");
    var rp = local.parameters.getChild("Receive Port");
    if (rp) rcvPort = rp.get();
    reloadIps();
    sendPort();
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
    script.setUpdateRate(2);
}

function moduleValueChanged(value) {
    var n = value.name.toLowerCase();
    if (n === "receive port") {
        rcvPort = value.get();
        sendPort();
    } else if (n === "secondaries" || n === "httpuser" || n === "httppass") reloadIps();
}