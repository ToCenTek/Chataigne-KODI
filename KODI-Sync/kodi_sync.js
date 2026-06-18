var secIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = true;
var syncStatusValue = null;
var sysHelperName = "OS";
var driftQueryInt = 0;
var allIps = [];

function execShell(cmd) {
    var helper = root.modules.getChild(sysHelperName);
    if (helper == null) { script.log("OS module not found"); return false; }
    if (helper.launchProcess) { helper.launchProcess(cmd); return true; }
    script.log("OS module has no launchProcess"); return false;
}

function compactJson(msg) {
    var j = JSON.stringify(msg);
    j = j.split("\n").join(""); j = j.split("\r").join(""); j = j.split(" ").join("");
    return j;
}

function udpBroadcast(msg) {
    var jsonStr = JSON.stringify(msg);
    // python3 -c + b''，launchProcess 无 shell 引号问题
    var py = "import socket;s=socket.socket(2,2);s.setsockopt(65535,32,1);s.sendto(b'" + jsonStr + "',('255.255.255.255',9527))";
    execShell("/usr/bin/python3 -c " + py);
}

function updateSyncStatus(text) {
    if (syncStatusValue == null) syncStatusValue = local.values.getChild("Status").getChild("Sync Status");
    if (syncStatusValue) syncStatusValue.set(text);
    script.log("Sync: " + text);
}

function reloadIps() {
    secIps = [];
    allIps = [];
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
    script.log("Sync: " + allIps.length + " KODIs");
}

function broadcastObj(msg) {
    if (!syncEnabled) return;
    udpBroadcast(msg);
}

function playAll() { script.log("playAll called, syncEnabled=" + syncEnabled + " ips=" + allIps.length); broadcastObj({jsonrpc:"2.0",method:"Player.SetSpeed",params:{playerid:1,speed:1},id:"cs"}); }
function pauseAll() { script.log("pauseAll called"); broadcastObj({jsonrpc:"2.0",method:"Player.SetSpeed",params:{playerid:1,speed:0},id:"cs"}); }
function stopAll() { broadcastObj({jsonrpc:"2.0",method:"Player.Stop",params:{playerid:1},id:"cs"}); }
function seekAll(Percentage) {
    if (Percentage == null) Percentage = 50;
    broadcastObj({jsonrpc:"2.0",method:"Player.Seek",params:{playerid:1,value:{percentage:Percentage}},id:"cs"});
}
function setVolumeAll(Volume) {
    if (Volume == null) Volume = 50;
    broadcastObj({jsonrpc:"2.0",method:"Application.SetVolume",params:{volume:Math.round(Volume)},id:"cs"});
}
function muteAll(Mute) {
    if (Mute == null) Mute = true;
    broadcastObj({jsonrpc:"2.0",method:"Application.SetMute",params:{mute:Mute},id:"cs"});
}

function set3DModeAll(Mode) {
    if (Mode == null) Mode = "off";
    var modeVal = Mode;
    if (Mode === "sbs") modeVal = "split_vertical";
    else if (Mode === "tab") modeVal = "split_horizontal";
    broadcastObj({jsonrpc:"2.0",method:"GUI.SetStereoscopicMode",params:{mode:modeVal},id:"cs"});
}

function setAspectAll(Count) {
    if (Count == null || Count < 1) Count = 1;
    for (var n = 0; n < Count; n++) {
        broadcastObj({jsonrpc:"2.0",method:"Input.ExecuteAction",params:{action:"aspectratio"},id:"cs"});
    }
}

function sendToAll(JSONText) {
    if (JSONText == null || JSONText === "") return;
    var parsed = JSON.parse(JSONText);
    udpBroadcast(parsed);
}

function toggleSync() {
    syncEnabled = !syncEnabled;
    var syncParam = local.parameters.getChild("Sync Enabled");
    if (syncParam) syncParam.set(syncEnabled);
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
}

function reSync() {
    if (!syncEnabled || allIps.length < 2) {
        script.log("ReSync: need 2+ KODIs");
        return;
    }
    updateSyncStatus("Resyncing...");
    // 通过 HTTP 查询第一个 KODI 的位置，然后广播 seek 到所有
    if (allIps.length > 0) {
        var host = allIps[0].split(":")[0];
        var qJson = compactJson({jsonrpc:"2.0",method:"Player.GetProperties",params:{playerid:1,properties:["time","speed","totaltime"]},id:"pos"});
        var outFile = "/tmp/kodi_sync_pos.txt";
        execShell("/usr/bin/curl -s --max-time 3 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + qJson + " -o " + outFile + " http://" + host + ":8080/jsonrpc");
        // 延迟后读取文件并 seek
        var content = util.readFile(outFile);
        if (content && content.charAt(0) === "{") {
            var d = JSON.parse(content);
            if (d && d.result && d.result.time && d.result.totaltime && d.result.speed > 0) {
                var totalMs = timeToMs(d.result.totaltime);
                if (totalMs > 0) {
                    var priMs = timeToMs(d.result.time) + 200;
                    if (priMs > totalMs) priMs = totalMs;
                    var pct = (priMs / totalMs) * 100;
                    broadcastObj({jsonrpc:"2.0",method:"Player.Seek",params:{playerid:1,value:{percentage:pct}},id:"cs"});
                    updateSyncStatus("Synced");
                }
            }
            execShell("/bin/rm " + outFile);
        }
    }
}

function update(deltaTime) {
    if (!syncEnabled || allIps.length === 0) return;
    driftQueryInt++;
    // 每 60 tick (30秒) 查询漂移
    if (driftQueryInt >= 60) {
        driftQueryInt = 0;
        for (var i = 0; i < allIps.length && i < 2; i++) {
            var ip = allIps[i];
            var host = ip.split(":")[0];
            var qJson = compactJson({jsonrpc:"2.0",method:"Player.GetProperties",params:{playerid:1,properties:["time","speed"]},id:"DriftUpd"});
            var cmd = "/usr/bin/curl -s --max-time 3 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + qJson + " -o /tmp/kodi_drift_" + i + ".txt http://" + host + ":8080/jsonrpc";
            execShell(cmd);
        }
        // 对比漂移
        var c1 = util.readFile("/tmp/kodi_drift_0.txt");
        var c2 = util.readFile("/tmp/kodi_drift_1.txt");
        if (c1 && c2 && c1.charAt(0) === "{" && c2.charAt(0) === "{") {
            var d1 = JSON.parse(c1);
            var d2 = JSON.parse(c2);
            if (d1 && d1.result && d1.result.time && d2 && d2.result && d2.result.time && d1.result.speed > 0 && d2.result.speed > 0) {
                var ms1 = timeToMs(d1.result.time);
                var ms2 = timeToMs(d2.result.time);
                var dv = ms1 > ms2 ? ms1 - ms2 : ms2 - ms1;
                var dc = local.values.getChild("Status").getChild("Drift");
                if (dc && dc.set) dc.set("" + dv + "ms");
                script.log("Drift: " + dv + "ms");
            }
            execShell("/bin/rm /tmp/kodi_drift_0.txt /tmp/kodi_drift_1.txt");
        }
    }
}

function timeToMs(t) {
    if (t == null) return 0;
    return (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000 + (t.milliseconds || 0);
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

// NoType 模块无 WebSocket 连接，不需要 wsMessageReceived
