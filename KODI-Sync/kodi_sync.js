var secIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = true;
var syncStatusValue = null;
var sysHelperName = "OS";
var driftQueryInt = 0;
var allIps = [];
var ackCount = 0;

function execShell(cmd) {
    var helper = root.modules.getChild(sysHelperName);
    if (helper == null) { script.log("OS module not found"); return false; }
    if (helper.launchProcess) { helper.launchProcess(cmd); return true; }
    script.log("OS module has no launchProcess"); return false;
}

function udpSend(cmd, val) {
    var msg = cmd;
    if (val != null) msg += ":" + val;
    msg += "\\n";
    // Python UDP 广播（正确设置 SO_BROADCAST）
    var py = "__import__('socket');s=__import__('socket').socket(2,2);s.setsockopt(65535,32,1);s.sendto(b'" + msg + "',('255.255.255.255',9527))";
    execShell("/opt/homebrew/bin/python3 -c " + py);
    execShell("/usr/bin/python3 -c " + py);
}

function playAll() { udpSend("PLAY"); }
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
    var text = data.toString();
    script.log("ACK[" + ackCount + "]: " + text.substring(0,80));
}

function init() {
    script.log("KODI Sync init");
    reloadIps();
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
    script.setUpdateRate(2);
}

function moduleValueChanged(value) {
    var n = value.name.toLowerCase();
    if (n === "secondaries" || n === "httpuser" || n === "httppass") reloadIps();
}