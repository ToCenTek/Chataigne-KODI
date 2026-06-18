var videoDirectory = "/storage/videos";
var m3uPath = "/storage/.kodi/userdata/playlists/video/videos.m3u";

// 全局变量
var initStep = 0;
var currentPlayerId = 1;
var currentplaylistid = 1;
var kodiPlaylistMap = [];
var sortedFileList = [];
var playlistAddIndex = 0;
var playlistStep = 0;
var lastSyncedVolume = -1;
var ignoreNextVolumeChange = false;
var volumeBeforeMute = -1;
var isMutedFlag = false;
var currentLoopMode = "off";
var ignoreNextPlayingChange = false;
var progBaseTick = 0;
var progBasePct = 0;
var progPerTick = 0;
var progTotalMs = 0;
var progFps = 0;
var progQueryTick = -100;

// 同步相关变量
var secondaryIps = [];
var httpUser = "kodi";
var httpPass = "tocentek";
var syncEnabled = false;
var syncInterval = 500;
var syncThreshold = 300;
var syncStatusValue = null;
var syncStatusText = "";
var sysHelperName = "OS";
var syncTickCount = 0;
var driftPriTime = null;
var driftFilePath = "/Users/yhc/Documents/Chataigne/modules/KODI/kodi_drift.txt";

// 通过 OS 模块执行 shell 命令（依赖名为"OS"的模块提供 launchProcess）
function execShell(cmd) {
    var helper = root.modules.getChild(sysHelperName);
    if (helper == null) {
        script.log("OS module not found, create one named '" + sysHelperName + "'");
        return false;
    }
    if (helper.launchProcess) {
        helper.launchProcess(cmd);
        return true;
    }
    script.log("OS module '" + sysHelperName + "' has no launchProcess method");
    return false;
}

// 去除字符串首尾空白（JUCE ES3 不支持 String.trim()）
function trimStr(s) {
    if (s == null) return "";
    var start = 0;
    var end = s.length - 1;
    while (start <= end && s.charAt(start) <= " ") start++;
    while (end >= start && s.charAt(end) <= " ") end--;
    if (start > end) return "";
    return s.substring(start, end + 1);
}

// 从 IP 行中提取纯地址（去掉 [漂移值] 部分）
function extractIp(raw) {
    var idx = raw.indexOf("[");
    if (idx >= 0) return trimStr(raw.substring(0, idx));
    return trimStr(raw);
}

// 解析 Values.Synchronizer.KODIs.Secondary 的多行文本，按换行分割成 IP 数组
function parseSecondaryIps(str) {
    if (str == null || str === "") { secondaryIps = []; return; }
    var items = str.split("\n");
    var result = [];
    for (var i = 0; i < items.length; i++) {
        var p = extractIp(items[i]);
        if (p.length > 0) result.push(p);
    }
    secondaryIps = result;
}

// 将 msg 对象转为完全无空格的单行 JSON（launchProcess 按空格分割参数，不能有空格）
function compactJson(msg) {
    var j = JSON.stringify(msg);
    j = j.split("\n").join("");
    j = j.split("\r").join("");
    j = j.split(" ").join("");
    return j;
}

// 通过 curl 向指定 KODI 发送 HTTP POST JSON-RPC 请求（用于同步等 HTTP 操作）
// 注意：launchProcess 按空格分割参数，所有值不得含空格
function httpPost(host, port, msg) {
    var jsonStr = compactJson(msg);
    var auth = "";
    if (httpUser.length > 0) {
        auth = " -u " + httpUser + ":" + httpPass;
    }
    var url = "http://" + host + ":" + port + "/jsonrpc";
    var cmd = "/usr/bin/curl -s --max-time 3" + auth + " -X POST -H Content-Type:application/json -d " + jsonStr + " " + url;
    execShell(cmd);
}

// 通过 curl 将 JSON-RPC 响应保存到文件（同步时用于读取 KODI 播放位置）
function httpGetToFile(host, port, msg, outFile) {
    var jsonStr = compactJson(msg);
    var auth = "";
    if (httpUser.length > 0) {
        auth = " -u " + httpUser + ":" + httpPass;
    }
    var url = "http://" + host + ":" + port + "/jsonrpc";
    var cmd = "/usr/bin/curl -s --max-time 3" + auth + " -X POST -H Content-Type:application/json -d " + jsonStr + " -o " + outFile + " " + url;
    execShell(cmd);
}

// 从本地文件读取并解析 JSON（httpGetToFile 的结果），校验首字符是否为 { 或 [ 以防读取空文件
function readJSONFile(filePath) {
    var content = util.readFile(filePath);
    if (content == null || content.length === 0) return null;
    var c = content.length > 0 ? content.charAt(0) : "";
    if (c !== "{" && c !== "[") return null;
    return JSON.parse(content);
}

// 将 KODI 时间对象 {hours,minutes,seconds,milliseconds} 转换为毫秒
function timeToMs(t) {
    if (t == null) return 0;
    var ms = (t.milliseconds !== undefined) ? t.milliseconds : 0;
    return (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000 + ms;
}

// 将 drift 值同步到 UI
function updateDriftDisplay(dv) {
    var dp2 = local.values.getChild("Synchronizer");
    if (!dp2) return;
    var kc = dp2.getChild("KODIs");
    if (!kc) return;
    var dc = kc.getChild("Drift");
    if (dc != null && dc.set) dc.set("" + dv + "ms");
}

// 向副机发起一次 seek（将主设备当前位置 +200ms 推送过去）
function doSeekAll(priTime, totalTime) {
    if (!priTime || !totalTime) return;
    var totalMs = timeToMs(totalTime);
    if (totalMs <= 0) return;
    var priMs = timeToMs(priTime) + 200;
    if (priMs > totalMs) priMs = totalMs;
    var pct = (priMs / totalMs) * 100;
    var seekMsg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: { percentage: pct }
        },
        id: "SyncSeek"
    };
    for (var i = 0; i < secondaryIps.length; i++) {
        var parts = secondaryIps[i].split(":");
        var host = parts[0];
        var port = 8080;
        if (parts.length > 1) {
            var p = parseInt(parts[1]);
            if (!isNaN(p)) port = p;
        }
        httpPost(host, port, seekMsg);
    }
}

// 向主 KODI（WebSocket）和所有副 KODI（HTTP POST）发送相同消息
function sendAll(msg) {
    local.send(JSON.stringify(msg));
    if (!syncEnabled) return;
    for (var i = 0; i < secondaryIps.length; i++) {
        var parts = secondaryIps[i].split(":");
        var host = parts[0];
        var port = 8080;
        if (parts.length > 1) {
            var parsedPort = parseInt(parts[1]);
            if (!isNaN(parsedPort)) port = parsedPort;
        }
        httpPost(host, port, msg);
    }
}

// 更新同步状态文字到 Values.Synchronizer.Sync Status 和日志
function updateSyncStatus(text) {
    syncStatusText = text;
    if (syncStatusValue == null) syncStatusValue = local.values.getChild("Synchronizer").getChild("Sync Status");
    if (syncStatusValue) syncStatusValue.set(text);
    script.log("Sync: " + text);
}

// 强制发送到所有 KODI（不检查 syncEnabled）
function sendAllForced(msg) {
    local.send(JSON.stringify(msg));
    for (var i = 0; i < secondaryIps.length; i++) {
        var parts = secondaryIps[i].split(":");
        var host = parts[0];
        var port = 8080;
        if (parts.length > 1) {
            var parsedPort = parseInt(parts[1]);
            if (!isNaN(parsedPort)) port = parsedPort;
        }
        httpPost(host, port, msg);
    }
}

// 获取目录下的文件列表（仅用于 UI 显示）
function getDirectoryFiles() {
    var msg = {
        jsonrpc: "2.0",
        method: "Files.GetDirectory",
        params: {
            directory: videoDirectory,
            media: "video",
            properties: ["playcount", "runtime", "file", "lastplayed"]
        },
        sort: { method: "label", order: "ascending" },
        id: "GetDirectory"
    };
    local.send(JSON.stringify(msg));
}

// 清空并重建播放列表（通过 Playlist.Clear + 逐条 Playlist.Add）
function buildPlaylistFromM3U() {
    playlistStep = 1;
    playlistAddIndex = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Playlist.Clear",
        params: { playlistid: 1 },
        id: "PlaylistClear"
    };
    sendAllForced(msg);
    script.log("Building playlist: clearing...");
}

// 递推添加下一文件到播放列表；全部添加完后调用 openManagedPlaylist()
function addNextPlaylistFile() {
    if (playlistAddIndex < sortedFileList.length) {
        var filePath = sortedFileList[playlistAddIndex].file;
        playlistAddIndex++;
        var msg = {
            jsonrpc: "2.0",
            method: "Playlist.Add",
            params: {
                playlistid: 1,
                item: { file: filePath }
            },
            id: "PlaylistAdd"
        };
        sendAllForced(msg);
    } else {
        playlistStep = 0;
        openManagedPlaylist();
        script.log("All files added to playlist, starting playback...");
    }
}

// 启动已构建好的托管播放列表（Player.Open with playlistid: 1）
function openManagedPlaylist() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: {
            item: { playlistid: 1 }
        },
        id: "init"
    };
    sendAllForced(msg);
    script.log("Opening managed playlist...");
}

// 请求当前播放列表的全部项目，响应由 wsMessageReceived 处理并更新 Items
function playListGetItems() {
    var msg = {
        jsonrpc: "2.0",
        method: "Playlist.GetItems",
        params: {
            playlistid: currentplaylistid,
            properties: ["title", "file", "playcount"]
        },
        id: "GetCurrentListAllItems"
    };
    local.send(JSON.stringify(msg));
}

// 同步获取音量和播放器状态（音量/静音/活跃播放器）
function syncAll() {
    var volMsg = {
        jsonrpc: "2.0",
        method: "Application.GetProperties",
        params: { properties: ["volume", "muted"] },
        id: "GetAllState"
    };
    local.send(JSON.stringify(volMsg));
    var playersMsg = {
        jsonrpc: "2.0",
        method: "Player.GetActivePlayers",
        id: "GetActivePlayers"
    };
    local.send(JSON.stringify(playersMsg));
}

// 从 UI 面板重新加载所有同步设置（IP 列表、HTTP 认证、同步开关等）
function reloadSyncSettings() {
    var val;
    secondaryIps = [];
    val = local.values.getChild("Synchronizer").getChild("KODIs");
    if (val != null) {
        var secVal = val.getChild("Secondary");
        if (secVal) parseSecondaryIps(secVal.get());
    }
    val = local.values.getChild("Synchronizer").getChild("HTTP User");
    if (val) httpUser = val.get();
    val = local.values.getChild("Synchronizer").getChild("HTTP Pass");
    if (val) {
        var pw = val.get();
        httpPass = (pw != null && pw.length > 0) ? pw : "tocentek";
    }
    val = local.parameters.getChild("Sync Enabled");
    if (val) syncEnabled = val.get();
    var syncContainer = local.values.getChild("Synchronizer");
    if (syncContainer) syncContainer.setCollapsed(!syncEnabled);
    val = local.values.getChild("Synchronizer").getChild("Sync Interval");
    if (val) syncInterval = val.get();
    val = local.values.getChild("Synchronizer").getChild("Sync Threshold");
    if (val) syncThreshold = val.get();
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
    script.log("Secondary KODIs: " + JSON.stringify(secondaryIps));
}

// ========== 监听 Values 面板值变化 ==========
function moduleValueChanged(value) {
    if (value.isParameter()) {
        var paramName = value.name;
        if (paramName.toLowerCase() !== "playing") {
            script.log("moduleValueChanged: " + paramName + " > " + value.get());
        }
        if (paramName.toLowerCase() === "volume") {
            if (ignoreNextVolumeChange) {
                ignoreNextVolumeChange = false;
                script.log("Volume change from KODI, ignoring send.");
                return;
            }
            var newVol = value.get();
            var intVol = Math.round(newVol);
            script.log("Volume slider changed: " + newVol + " -> intVol=" + intVol + ", lastSyncedVolume=" + lastSyncedVolume);
            
            var isMutedParam = local.values.getChild("Info").getChild("isMuted");
            var wasMuted = isMutedParam && isMutedParam.get() === true;
            if (wasMuted && newVol > 0) {
                script.log("Volume adjusted while muted, unmuting first.");
                var unmuteMsg = {
                    jsonrpc: "2.0",
                    method: "Application.SetMute",
                    params: { mute: false },
                    id: "Application.SetMute"
                };
                sendAll(unmuteMsg);
                isMutedParam.set(false);
                isMutedFlag = false;
                volumeBeforeMute = intVol;
                if (Math.abs(intVol - lastSyncedVolume) > 0.5) {
                    var volMsg = {
                        jsonrpc: "2.0",
                        method: "Application.SetVolume",
                        params: { volume: intVol },
                        id: "SetVolume"
                    };
                    sendAll(volMsg);
                    lastSyncedVolume = intVol;
                }
                script.log("Unmuted and set volume to: " + intVol);
            } else {
                if (Math.abs(intVol - lastSyncedVolume) > 0.5) {
                    var volMsg = {
                        jsonrpc: "2.0",
                        method: "Application.SetVolume",
                        params: { volume: intVol },
                        id: "SetVolume"
                    };
                    sendAll(volMsg);
                    lastSyncedVolume = intVol;
                    script.log("Sent SetVolume command: " + intVol);
                } else {
                    script.log("Volume change too small or equal to last synced, skipping send.");
                }
            }
        } else if (paramName.toLowerCase() === "httpuser") {
            httpUser = value.get();
        } else if (paramName.toLowerCase() === "httppass") {
            httpPass = value.get();
        } else if (paramName.toLowerCase() === "syncinterval") {
            syncInterval = value.get();
        } else if (paramName.toLowerCase() === "syncthreshold") {
            syncThreshold = value.get();
        } else if (paramName.toLowerCase() === "secondary") {
            parseSecondaryIps(value.get());
            script.log("Secondary KODIs: " + JSON.stringify(secondaryIps));
        } else if (paramName.toLowerCase() === "playing") {
            if (ignoreNextPlayingChange) {
                ignoreNextPlayingChange = false;
                return;
            }
            var pct = value.get();
            // 用户拖动后重置模拟起点，防止反弹
            progBaseTick = syncTickCount;
            progBasePct = pct;
            progQueryTick = syncTickCount - 60;
            var seekMsg = {
                jsonrpc: "2.0",
                method: "Player.Seek",
                params: {
                    playerid: currentPlayerId,
                    value: { percentage: pct }
                },
                id: "SeekFromSlider"
            };
            local.send(JSON.stringify(seekMsg));
        }
    } else {
        script.log("Module value triggered : " + value.name);
        if (value.name.toLowerCase() === "play/pause" || value.name.toLowerCase() === "play_pause") {
            var pausedVal = local.values.getChild("Info").getChild("isPaused");
            var isPaused = pausedVal ? pausedVal.get() : false;
            playPause(!isPaused);
        }
    }
}

// 跳转到播放列表的指定索引位置
function playIndex(Index) {
    if (Index == null || Index < 0) Index = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: {
            playerid: currentPlayerId,
            to: Index
        },
        id: "Player.Open.FilePath"
    };
    sendAll(msg);
}

// 下一曲
function nextTrack() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: { playerid: currentPlayerId, to: "next" },
        id: "Player.GoTo"
    };
    sendAll(msg);
    script.log("Next track");
}

// 上一曲
function prevTrack() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: { playerid: currentPlayerId, to: "previous" },
        id: "Player.GoTo"
    };
    sendAll(msg);
    script.log("Previous track");
}

// 按文件路径直接播放，播放列表会被替换为单文件列表
function playFile(FilePath) {
    if (FilePath == "") {
        script.log("Warning: Please enter a valid file path.");
        return;
    }
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: { item: { file: FilePath } },
        id: "Player.Open.FilePath"
    };
    sendAll(msg);
    // Player.Open 文件会替换播放列表，立即刷新 Items 显示
    playListGetItems();
}

// 切换播放/暂停状态（isPaused=true=暂停, false=播放）
function playPause(isPaused) {
    if (isPaused == null) isPaused = false;
    var state = isPaused ? 0 : 1;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetSpeed",
        params: {
            playerid: currentPlayerId,
            speed: state
        },
        id: "Player.SetSpeed"
    };
    sendAll(msg);
}

// 停止播放
function stopPlay() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Stop",
        params: { playerid: currentPlayerId },
        id: "Player.Stop"
    };
    sendAll(msg);
    script.log("Stop playback");
}

// 按秒数步进快进（正数）/快退（负数）
function seek(Step) {
    if (Step == null) Step = 30;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {seconds: Step}
        },
        id: "Seek"
    };
    sendAll(msg);
    script.log("Seek: " + Step);
}

// 按百分比跳转
function seekToParameters(Parameters){
    if (Parameters == null) Parameters = 50;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {percentage: Parameters}
        },
        id: "SeekToParameters"
    };
    sendAll(msg);
    script.log("Seek to Parameters: " + Parameters);
}

// 按指定时间点跳转（时/分/秒/毫秒）
function seekToTime(Hours, Minutes, Seconds, Milliseconds){
    if (Hours == null) Hours = 0;
    if (Minutes == null) Minutes = 0;
    if (Seconds == null) Seconds = 0;
    if (Milliseconds == null) Milliseconds = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {
                time: {
                    hours: Hours,
                    minutes: Minutes,
                    seconds: Seconds,
                    milliseconds: Milliseconds
                }
            }
        },
        id: "SeekToTime"
    };
    sendAll(msg);
    script.log("Seek to Time: " + Hours + ":" + Minutes + ":" + Seconds + "." + Milliseconds);
}

// 按 KODI 预定义步进跳转（bigforward/smallforward/bigbackward/smallbackward）
function seekToPredefined(Step) {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {"step": Step}
        },
        id: "SeekTo"
    };
    sendAll(msg);
    script.log("Seek to Predefined: " + Step);
}

// 循环模式设置（one=单曲循环, all=列表循环, off=不循环）
function setLoop(Mode) {
    if (Mode == null) Mode = "off";
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetRepeat",
        params: {
            playerid: currentPlayerId,
            repeat: Mode
        },
        id: "Player.SetRepeat.Loop"
    };
    sendAllForced(msg);
    currentLoopMode = Mode;
    var loopParam = local.values.getChild("Info").getChild("isLooped");
    if (loopParam) loopParam.set(Mode !== "off");
    script.log("Setup Loop Mode: " + Mode);
}

// 随机播放开关
function setRandom(Mode) {
    if (Mode == null) Mode = false;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetShuffle",
        params: {
            playerid: currentPlayerId,
            shuffle: Mode
        },
        id: "Player.SetShuffle.Random"
    };
    sendAllForced(msg);
    var randParam = local.values.getChild("Info").getChild("Random");
    if (randParam) randParam.set(Mode);
    script.log("Setup Random Mode: " + Mode);
}

// 设置音量（0-100）
function setVolume(Volume) {
    if (Volume == null) Volume = 50;
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: Volume },
        id: "SetVolume"
    };
    sendAll(msg);
    script.log("Set volume: " + Volume);
}

// 音量递增 5%（KODI 内部处理具体增量）
function volumeUP() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: "increment" },
        id: "VolumeUp"
    };
    sendAll(msg);
    script.log("Volume UP");
}

// 音量递减 5%
function volumeDown() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: "decrement" },
        id: "VolumeDown"
    };
    sendAll(msg);
    script.log("Volume DOWN");
}

// 静音切换，记录静音前音量用于恢复
function mute(Mute) {
    if (Mute == null) Mute = false;
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetMute",
        params: { mute: Mute },
        id: "Application.SetMute"
    };
    sendAll(msg);
    var isMutedParam = local.values.getChild("Info").getChild("isMuted");
    if (isMutedParam) isMutedParam.set(Mute);
    isMutedFlag = Mute;

    var volParam = local.values.getChild("Info").getChild("Volume");
    if (Mute) {
        var currentVol = volParam ? volParam.get() : lastSyncedVolume;
        if (currentVol < 0) currentVol = 50;
        volumeBeforeMute = currentVol;
        if (volParam) {
            ignoreNextVolumeChange = true;
            volParam.set(0);
        }
        script.log("Mute on, volumeBeforeMute saved: " + volumeBeforeMute);
    } else {
        var restoreVol = (volumeBeforeMute >= 0) ? volumeBeforeMute : 50;
        if (volParam) {
            ignoreNextVolumeChange = true;
            volParam.set(restoreVol);
        }
        var volMsg = {
            jsonrpc: "2.0",
            method: "Application.SetVolume",
            params: { volume: Math.round(restoreVol) },
            id: "SetVolume"
        };
        sendAll(volMsg);
        lastSyncedVolume = Math.round(restoreVol);
        script.log("Mute off, restored volume: " + restoreVol);
        volumeBeforeMute = -1;
    }
    script.log("Mute: " + Mute);
}

// 重启KODI
function restartKODI() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.Quit",
        id: "RestartKODI"
    };
    local.send(JSON.stringify(msg));
    script.log("Restarting KODI...");
}

// 待机
function standby() {
    var msg = {
        jsonrpc: "2.0",
        method: "System.Suspend",
        id: "System.Suspend"
    };
    local.send(JSON.stringify(msg));
    script.log("System Suspend");
}

// 重启设备
function reboot() {
    var msg = {
        jsonrpc: "2.0",
        method: "System.Reboot",
        id: "System.Reboot"
    };
    local.send(JSON.stringify(msg));
    script.log("System Reboot");
}

// 关机
function shutdown() {
    var msg = {
        jsonrpc: "2.0",
        method: "System.Shutdown",
        id: "System.Shutdown"
    };
    local.send(JSON.stringify(msg));
    script.log("System Shutdown");
}

// 显示调试信息
function showInfo(Show) {
    if (Show == null) Show = false;
    var msg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting: "debug.showloginfo",
            value: Show
        },
        id: "debug.showloginfo"
    };
    local.send(JSON.stringify(msg));
    script.log("Toggle debug info: " + Show);
}

// 显示通知
function showNotification(Title, Message, Displaytime, Image) {
    if (Title == null) Title = "";
    if (Message == null) Message = "";
    if (Displaytime == null) Displaytime = 5000;
    if (Image == null) Image = "";
    var messageText = Message;
    var content = util.readFile(Message);
    if (content !== undefined && content !== null && content.length > 0) {
        messageText = content;
    }
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.ShowNotification",
        params: {
            title: Title,
            message: messageText,
            displaytime: Displaytime,
            image: Image
        },
        id: "GUI.ShowNotification"
    };
    local.send(JSON.stringify(msg));
    script.log("ShowNotification: " + messageText);
}

// 激活窗口
function activateWindow(Window) {
    if (Window == null) return;
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.ActivateWindow",
        params: {
            window: Window
        },
        id: "activateWindow"
    };
    local.send(JSON.stringify(msg));
    script.log("GUI.ActivateWindow: " + Window);
}

// 发送原始 JSON 命令
function sendJSON(jsonText) {
    if (jsonText == null) jsonText = "";
    if (jsonText === "") {
        script.log("Warning: JSON string is empty.");
        return;
    }
    var parsed = JSON.parse(jsonText);
    sendAll(parsed);
    script.log("sendJSON: " + jsonText);
}

// 批量设置语言、时区、时间格式（仅当前连接的 KODI）
function setRegionLanguage(ChineseLanguage, ChineseTimezone, RegionFormat24H) {
    if (ChineseLanguage == null) ChineseLanguage = true;
    if (ChineseTimezone == null) ChineseTimezone = true;
    if (RegionFormat24H == null) RegionFormat24H = true;

    // 1. 设置字体（先设字体防止中文乱码）
    var fontVal = ChineseLanguage ? "Arial" : "Default";
    var fontMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "lookandfeel.font", value: fontVal },
        id: "SetFont"
    };
    local.send(JSON.stringify(fontMsg));

    // 2. 设置语言
    var langId = ChineseLanguage ? "resource.language.zh_cn" : "resource.language.en_gb";
    var langMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "locale.language", value: langId },
        id: "SetLang"
    };
    local.send(JSON.stringify(langMsg));

    // 3. 设置时区国家（China 或 Britain(UK)）
    var tzCountry = ChineseTimezone ? "China" : "Britain(UK)";
    var tzCountryMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "locale.timezonecountry", value: tzCountry },
        id: "SetTZCountry"
    };
    local.send(JSON.stringify(tzCountryMsg));

    // 4. 设置时区（Asia/Shanghai 或 Europe/London）
    var tzVal = ChineseTimezone ? "Asia/Shanghai" : "Europe/London";
    var tzMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "locale.timezone", value: tzVal },
        id: "SetTZ"
    };
    local.send(JSON.stringify(tzMsg));

    // 5. 地区格式（country 带格式后缀，use24hourclock=regional 跟随）
    var regionBase = ChineseTimezone ? "Beijing" : "UK";
    var regionSuffix = RegionFormat24H ? " (24h)" : " (12h)";

    var clockMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "locale.use24hourclock", value: "regional" },
        id: "Set24HClock"
    };
    local.send(JSON.stringify(clockMsg));

    var regionMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "locale.country", value: regionBase + regionSuffix },
        id: "SetCountry"
    };
    local.send(JSON.stringify(regionMsg));

    // 6. 刷新 UI 使所有设置生效
    var refreshMsg = {
        jsonrpc: "2.0",
        method: "GUI.ActivateWindow",
        params: { window: "home" },
        id: "RefreshUI"
    };
    local.send(JSON.stringify(refreshMsg));

    script.log("SetRegion: lang=" + (ChineseLanguage?"CN":"EN") + " tz=" + (ChineseTimezone?"CN":"UK") + " fmt=" + (RegionFormat24H?"24H":"12H"));
}

// 视频缩放
function setVideoZoom(Zoom) {
    if (Zoom == null) Zoom = 1.0;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetViewMode",
        params: { viewmode: { zoom: Zoom } },
        id: "SetZoom"
    };
    local.send(JSON.stringify(msg));
    script.log("VideoZoom: " + Zoom);
}

// 纵向偏移
function setVerticalShift(Shift) {
    if (Shift == null) Shift = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetViewMode",
        params: { viewmode: { verticalshift: Shift } },
        id: "SetVShift"
    };
    local.send(JSON.stringify(msg));
    script.log("VShift: " + Shift);
}

// 画面宽高比（像素比）
function setPixelRatio(Ratio) {
    if (Ratio == null) Ratio = 1.0;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetViewMode",
        params: { viewmode: { pixelratio: Ratio } },
        id: "SetPixRatio"
    };
    local.send(JSON.stringify(msg));
    script.log("PixelRatio: " + Ratio);
}

// 非线性拉伸
function setNonlinearStretch(Stretch) {
    if (Stretch == null) Stretch = false;
    var msg = {
        jsonrpc: "2.0",
        method: "Player.SetViewMode",
        params: { viewmode: { nonlinearstretch: Stretch } },
        id: "SetNLStretch"
    };
    local.send(JSON.stringify(msg));
    script.log("NLStretch: " + Stretch);
}

// 测试 launchProcess 是否工作
function testLaunch() {
    execShell("/usr/bin/touch /tmp/chataigne_test.txt");
    var json = compactJson({jsonrpc:"2.0",method:"Player.GetProperties",params:{playerid:1,properties:["time","speed"]},id:"test"});
    var cmd = "/usr/bin/curl -s --max-time 3 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + json + " -o /tmp/chataigne_curl_test.txt http://10.0.0.53:8080/jsonrpc";
    script.log("test cmd: " + cmd);
    execShell(cmd);
    script.log("Test launch: commands sent");
}

// 调试：查询主 KODI 播放位置并显示同步状态
function debugPositions() {
    var queryMsg = {
        jsonrpc: "2.0",
        method: "Player.GetProperties",
        params: {
            playerid: currentPlayerId,
            properties: ["time", "speed"]
        },
        id: "DebugGetPrimary"
    };
    local.send(JSON.stringify(queryMsg));
    script.log("Querying primary position...");
    // 副机位置：通过 Mac 的 curl 查并用 logger 记录
    for (var i = 0; i < secondaryIps.length; i++) {
        var ip = secondaryIps[i];
        var parts = ip.split(":");
        var host = parts[0];
        var port = 8080;
        if (parts.length > 1) {
            var p = parseInt(parts[1]);
            if (!isNaN(p)) port = p;
        }
        var secQuery = '{\"jsonrpc\":\"2.0\",\"method\":\"Player.GetProperties\",\"params\":{\"playerid\":' + currentPlayerId + ',\"properties\":[\"time\",\"speed\"]},\"id\":\"sec\"}';
        var cmd = "/usr/bin/curl -s --max-time 3 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + secQuery + " http://" + host + ":" + port + "/jsonrpc";
        script.log("Secondary " + host + ":" + port + " - query via curl manually.");
    }
    script.log("--- To see both positions, run in terminal: ---");
    script.log("curl -s -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d '{\"jsonrpc\":\"2.0\",\"method\":\"Player.GetProperties\",\"params\":{\"playerid\":1,\"properties\":[\"time\",\"speed\"]},\"id\":\"p\"}' http://10.0.0.41:8080/jsonrpc");
    if (secondaryIps.length > 0) {
        var sip = secondaryIps[0].split(":")[0];
        script.log("curl -s -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d '{\"jsonrpc\":\"2.0\",\"method\":\"Player.GetProperties\",\"params\":{\"playerid\":1,\"properties\":[\"time\",\"speed\"]},\"id\":\"s\"}' http://" + sip + ":8080/jsonrpc");
    }
}

// 强制全屏
function forceFullscreenAndClean() {
    var fsAction = {
        jsonrpc: "2.0",
        method: "Input.ExecuteAction",
        params: { "action": "fullscreen" },
        id: 1
    };
    local.send(JSON.stringify(fsAction));
}

// 3D 模式: 通过 GUI.SetStereoscopicMode(mode) 设置。
// KODI 20 不再支持 Settings.SetSettingValue 方式。
// 模式: off, split_vertical(SBS), split_horizontal(TAB), monoscopic(Flat)。
// 循环: next, previous。
var trackedStereoIdx = 0;
var stereoModes = ["off", "split_vertical", "split_horizontal", "anaglyph_cyan_red", "anaglyph_green_magenta", "anaglyph_yellow_blue", "monoscopic"];
var stereoNames = ["off", "sbs", "tab", "anaglyph_cyan_red", "anaglyph_green_magenta", "anaglyph_yellow_blue", "monoscopic"];

// 循环切换 3D 模式：Off → SBS → TAB → Off
function cycleStereoMode() {
    trackedStereoIdx = (trackedStereoIdx + 1) % 3;
    var mode = stereoModes[trackedStereoIdx];
    var name = stereoNames[trackedStereoIdx];
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.SetStereoscopicMode",
        params: { mode: mode },
        id: "SetStereoMode"
    };
    local.send(JSON.stringify(msg));
    script.log("Cycle 3D: " + name + " (mode=" + mode + ")");
}

// 设置 3D 模式并同步所有 KODI，Swap 参数实验性尝试 video.stereoscopicinvert
function setStereoMode(Mode, Swap) {
    if (Mode == null) Mode = "off";
    if (Swap == null || !Swap) Swap = false;
    if (Swap && Mode === "off") Swap = false;
    var modeVal = Mode;
    if (Mode === "sbs") modeVal = "split_vertical";
    else if (Mode === "tab") modeVal = "split_horizontal";
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.SetStereoscopicMode",
        params: { mode: modeVal },
        id: "SetStereoMode"
    };
    sendAll(msg);
    if (Mode === "off") trackedStereoIdx = 0;
    else if (Mode === "sbs") trackedStereoIdx = 1;
    else if (Mode === "tab") trackedStereoIdx = 2;
    script.log("Set 3D mode: " + Mode + " (mode=" + modeVal + ")");

    // 实验性: 通过 video.stereoscopicinvert 尝试 swap。
    // KODI 20 可能不支持此设置 (Settings API 返回 -32602)。
    var invertVal = (Swap === true);
    var swapMsg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting: "video.stereoscopicinvert",
            value: invertVal
        },
        id: "SetStereoInvert"
    };
    sendAll(swapMsg);
    script.log("Swap=" + Swap + ": trying video.stereoscopicinvert=" + invertVal + " (may fail on KODI 20)");
}

// ========== 宽高比（通过 Input.ExecuteAction 模拟遥控器按键） ==========
function cycleAspectRatio() {
    var msg = {
        jsonrpc: "2.0",
        method: "Input.ExecuteAction",
        params: { action: "aspectratio" },
        id: "SetAspect"
    };
    local.send(JSON.stringify(msg));
    script.log("Cycle aspect ratio");
}

// 向指定 host 列表发送消息（HTTP POST）
function sendToHosts(msg, hosts) {
    for (var i = 0; i < hosts.length; i++) {
        var parts = hosts[i].split(":");
        var host = parts[0];
        var port = 8080;
        if (parts.length > 1) {
            var parsedPort = parseInt(parts[1]);
            if (!isNaN(parsedPort)) port = parsedPort;
        }
        httpPost(host, port, msg);
    }
}

// 向指定副机列表循环切换宽高比 N 次
function sendAspectToHosts(count, hostList) {
    var msg = {
        jsonrpc: "2.0",
        method: "Input.ExecuteAction",
        params: { action: "aspectratio" },
        id: "SetAspect"
    };
    for (var n = 0; n < count; n++) {
        sendToHosts(msg, hostList);
    }
    script.log("Aspect: cycled " + count + " time(s) to " + hostList.length + " host(s)");
}

// 循环切换所有 KODI 的宽高比 N 次（主 KODI 走 WebSocket，副 KODI 走 HTTP）
function setAspectRatio(Count) {
    if (Count == null || Count < 1) Count = 1;
    for (var n = 0; n < Count; n++) {
        var msg = {
            jsonrpc: "2.0",
            method: "Input.ExecuteAction",
            params: { action: "aspectratio" },
            id: "SetAspect"
        };
        local.send(JSON.stringify(msg));
        if (syncEnabled) {
            for (var i = 0; i < secondaryIps.length; i++) {
                var parts = secondaryIps[i].split(":");
                var host = parts[0];
                var port = 8080;
                if (parts.length > 1) {
                    var parsedPort = parseInt(parts[1]);
                    if (!isNaN(parsedPort)) port = parsedPort;
                }
                httpPost(host, port, msg);
            }
        }
    }
    script.log("Aspect: cycled " + Count + " time(s) to all");
}

// 设置指定副 KODI 的宽高比（通过多行文本参数输入 IP:port 列表）
function setAspectSecondaries(Count, hostsStr) {
    if (hostsStr == null || hostsStr === "") {
        script.log("No secondary hosts specified.");
        return;
    }
    if (Count == null || Count < 1) Count = 1;
    var items = hostsStr.split("\n");
    var hosts = [];
    for (var i = 0; i < items.length; i++) {
        var p = trimStr(items[i]);
        if (p.length > 0) hosts.push(p);
    }
    if (hosts.length === 0) {
        script.log("No secondary hosts specified.");
        return;
    }
    sendAspectToHosts(Count, hosts);
}

var launcherFileParam = null;

// 在主机（Mac）终端中运行 kodi_init.sh 或 kodi_update.sh 脚本，
// Linux 端通过 x-terminal-emulator 启动，macOS 端通过 launchFile 打开 .command 文件
function runCoreelecScript(ScriptFile, UpdatePlaylist) {
    if (UpdatePlaylist == null) UpdatePlaylist = true;
    var moduleDir = "/Users/yhc/Documents/Chataigne/modules/KODI";
    var suffix = UpdatePlaylist ? "update" : "init";
    // Linux: open script in default terminal
    execShell("x-terminal-emulator -e /bin/bash '" + moduleDir + "/kodi_" + suffix + ".sh'");
    // macOS: .command file opens in Terminal.app via launchFile
    if (launcherFileParam == null) {
        launcherFileParam = script.addFileParameter("__coreelec_launcher", "", "");
        launcherFileParam.setAttribute("saveMode", false);
    }
    launcherFileParam.set(moduleDir + "/kodi_" + suffix + ".command");
    launcherFileParam.launchFile("");
    script.log("Running CoreELEC script (update=" + UpdatePlaylist + ")");
}

// 切换同步开关（同时折叠/展开 Synchronizer 容器）
function toggleSync() {
    syncEnabled = !syncEnabled;
    var syncParam = local.parameters.getChild("Sync Enabled");
    if (syncParam) syncParam.set(syncEnabled);
    var syncContainer = local.values.getChild("Synchronizer");
    if (syncContainer) syncContainer.setCollapsed(!syncEnabled);
    updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
    script.log("Sync toggled: " + (syncEnabled ? "ON" : "OFF"));
}

// 手动 ReSync
function reSync() {
    if (!syncEnabled || secondaryIps.length === 0) {
        script.log("ReSync: sync not enabled or no secondary KODIs");
        return;
    }
    updateSyncStatus("Resyncing...");
    var qMsg = {
        jsonrpc: "2.0",
        method: "Player.GetProperties",
        params: {
            playerid: currentPlayerId,
            properties: ["time", "speed", "totaltime"]
        },
        id: "SyncReSync"
    };
    local.send(JSON.stringify(qMsg));
}

// 核心定时器：每 500ms 检测一次漂移（仅显示，不修正）
function update(deltaTime) {
    syncTickCount++;

    // 首次获取影片时长（只查一次）
    if (progTotalMs === 0 && syncTickCount % 10 === 0) {
        var posMsg = {
            jsonrpc: "2.0",
            method: "Player.GetProperties",
            params: {
                playerid: currentPlayerId,
                properties: ["time", "speed", "totaltime", "videostreams"]
            },
            id: "PosUpdate"
        };
        local.send(JSON.stringify(posMsg));
    }

    // 本地模拟进度条（不校准，全靠 perTick 计算）
    if (progTotalMs > 0 && progPerTick > 0) {
        var elapsedTicks = syncTickCount - progBaseTick;
        var simPct = progBasePct + elapsedTicks * progPerTick;
        if (simPct > 100) simPct = 100;
        var progCtrl = local.values.getChild("Info").getChild("Playing");
        if (progCtrl) {
            ignoreNextPlayingChange = true;
            progCtrl.set(simPct);
        }
    }

    // 检查漂移文件
    checkDriftFile();

    // 同步相关
    if (!syncEnabled || secondaryIps.length === 0) return;
    if (driftPriTime != null) return;
    var qMsg = {
        jsonrpc: "2.0",
        method: "Player.GetProperties",
        params: {
            playerid: currentPlayerId,
            properties: ["time", "speed"]
        },
        id: "DriftQuery"
    };
    local.send(JSON.stringify(qMsg));
}

// 读取并用漂移值更新 UI（不执行任何修正）
function checkDriftFile() {
    if (driftPriTime == null) return;
    var dContent = util.readFile(driftFilePath);
    if (dContent == null || dContent.length === 0 || dContent.charAt(0) !== "{") return;
    var dData = JSON.parse(dContent);
    if (!dData.result || !dData.result.time || dData.result.speed <= 0) {
        execShell("/bin/rm " + driftFilePath);
        driftPriTime = null;
        return;
    }
    var sMs = timeToMs(dData.result.time);
    var pMs = timeToMs(driftPriTime);
    execShell("/bin/rm " + driftFilePath);
    if (pMs <= 0) { driftPriTime = null; return; }

    var dv = pMs - sMs;
    var absDv = dv > 0 ? dv : -dv;
    updateDriftDisplay(absDv);
    script.log("Drift: " + absDv + "ms");
    driftPriTime = null;
}

// ========== 模块初始化：加载设置、同步状态、获取文件列表 ==========
function init() {
    initStep = 0;
    sortedFileList = [];
    kodiPlaylistMap = [];
    reloadSyncSettings();
    syncAll();
    initStep = 1;
    script.setUpdateRate(2);
    getDirectoryFiles();
    script.log("Step 1: Getting directory files for display...");
}

// ========== WebSocket 消息接收：处理 KODI 返回的 JSON-RPC 响应和事件通知 ==========
function wsMessageReceived(message) {
    var data = JSON.parse(message);

    // 处理 Playlist.Clear 响应：清除后开始逐条添加文件
    if (data.id === "PlaylistClear" && !data.error) {
        if (playlistStep === 1) {
            playlistStep = 2;
            addNextPlaylistFile();
        }
        return;
    }

    // 处理 Playlist.Add 响应
    if (data.id === "PlaylistAdd" && !data.error) {
        if (playlistStep === 2) {
            addNextPlaylistFile();
        }
        return;
    }

    // 3D: 记录设置结果
    if (data.id === "SetStereoMode") {
        if (data.error) {
            script.log("SetStereoMode error: " + JSON.stringify(data.error));
        } else {
            script.log("SetStereoMode OK");
        }
        return;
    }

    //
    if (data.id === "SetAspect") {
        if (data.error) script.log("SetAspect error: " + JSON.stringify(data.error));
        return;
    }

    // 3D Swap: 尝试结果 (实验性)
    if (data.id === "SetStereoInvert") {
        if (data.error) {
            script.log("Swap via video.stereoscopicinvert failed: " + JSON.stringify(data.error));
        } else {
            script.log("Swap via video.stereoscopicinvert OK");
        }
        return;
    }

    // 处理统一 id="init" 的响应
    if (data.id === "init" && !data.error) {
        if (initStep === 2) {
            initStep = 3;
            setLoop("all");
            playListGetItems();
            script.log("Step 3: Setting loop and getting playlist items...");
        }
        else if (initStep === 3) {
            initStep = 0;
            script.log("Initialization complete.");
        }
        return;
    }

    // 处理 GetDirectory 响应
    if (data.id === "GetDirectory" && data.result && data.result.files) {
        var files = data.result.files;
        var n = files.length;
        for (var i = 0; i < n - 1; i++) {
            var minIdx = i;
            for (var j = i + 1; j < n; j++) {
                if (files[j].label < files[minIdx].label) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                var temp = files[i];
                files[i] = files[minIdx];
                files[minIdx] = temp;
            }
        }
        sortedFileList = files;
        script.log("Sorted files (UI display only):");
        for (var i = 0; i < sortedFileList.length; i++) {
            script.log("  " + i + ": " + sortedFileList[i].label);
        }
        var output = "";
        for (var i = 0; i < sortedFileList.length; i++) {
            output += i + ": " + sortedFileList[i].label;
            if (i < sortedFileList.length - 1) output += "\n";
        }
        var itemsValue = local.values.getChild("Info").getChild("Items");
        if (itemsValue) itemsValue.set(output);
        script.log("============ UI Items (sorted by label) ============");
        script.log(output);

        initStep = 2;
        buildPlaylistFromM3U();
        script.log("Step 2: Building playlist from m3u...");
        return;
    }

    // 处理 GetItems 响应
    if (data.id === "GetCurrentListAllItems" && data.result && data.result.items) {
        var items = data.result.items;
        var output = "";
        if (items.length === 0) {
            output = "(empty)";
        } else {
            for (var i = 0; i < items.length; i++) {
                output += i + ": " + items[i].label;
                if (i < items.length - 1) output += "\n";
            }
        }
        var itemsValue = local.values.getChild("Info").getChild("Items");
        if (itemsValue) itemsValue.set(output);
        script.log("============ Playlist Items ============");
        script.log(output);
        kodiPlaylistMap = [];
        for (var i = 0; i < items.length; i++) {
            kodiPlaylistMap.push({
                name: items[i].label,
                path: items[i].file,
                realIndex: i
            });
        }
        if (initStep === 3) initStep = 0;
        return;
    }

    // 完整状态同步响应
    if (data.id === "GetAllState" && data.result) {
        if (data.result.volume !== undefined) {
            var volumeValue = local.values.getChild("Info").getChild("Volume");
            if (volumeValue) {
                ignoreNextVolumeChange = true;
                volumeValue.set(data.result.volume);
                lastSyncedVolume = data.result.volume;
            }
            script.log("Volume synced: " + data.result.volume);
        }
        if (data.result.muted !== undefined) {
            var isMutedParam = local.values.getChild("Info").getChild("isMuted");
            if (isMutedParam) isMutedParam.set(data.result.muted);
            isMutedFlag = data.result.muted;
            script.log("Mute synced: " + data.result.muted);
        }
        return;
    }

    // 
    if (data.id === "GetActivePlayers" && data.result) {
        if (data.result.length > 0) {
            currentPlayerId = data.result[0].playerid;
            var getProps = {
                jsonrpc: "2.0",
                method: "Player.GetProperties",
                params: {
                    playerid: currentPlayerId,
                    properties: ["speed", "repeat", "shuffled"]
                },
                id: "GetPlayerProps"
            };
            local.send(JSON.stringify(getProps));
            var getItem = {
                jsonrpc: "2.0",
                method: "Player.GetItem",
                params: {
                    playerid: currentPlayerId,
                    properties: ["file", "title"]
                },
                id: "GetPlayerItem"
            };
            local.send(JSON.stringify(getItem));
        } else {
            var fileValue = local.values.getChild("Info").getChild("File");
            if (fileValue) fileValue.set("[Stopped]");
        }
        return;
    }

    //
    if (data.id === "GetPlayerProps" && data.result) {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(data.result.speed === 0);
        var loopValue = local.values.getChild("Info").getChild("isLooped");
        if (loopValue) loopValue.set(data.result.repeat === "one");
        currentLoopMode = data.result.repeat;
        var randValue = local.values.getChild("Info").getChild("Random");
        if (randValue) randValue.set(data.result.shuffled);
        script.log("Player state synced: repeat=" + data.result.repeat + " shuffled=" + data.result.shuffled);
        return;
    }

    //
    if (data.id === "GetPlayerItem" && data.result && data.result.item) {
        var filePath = data.result.item.file;
        if (filePath == null || filePath === "") filePath = data.result.item.title;
            var fileValue = local.values.getChild("Info").getChild("File");
            if (fileValue) fileValue.set(filePath);
            script.log("Now playing synced: " + filePath);
        return;
    }

    // 调试位置查询响应
    if (data.id === "DebugGetPrimary" && data.result) {
        var t = data.result.time;
        var pos = (t.hours * 3600 + t.minutes * 60 + t.seconds) + "." + t.milliseconds;
        script.log("=== Primary position: " + pos + "s ===");
        script.log("Secondary KODIs: " + JSON.stringify(secondaryIps));
        script.log("Sync status: " + syncStatusText);
        if (secondaryIps.length > 0) {
            script.log("Tip: Use the Aspect > Set Aspect Secondaries command to query secondary positions via HTTP.");
        }
        return;
    }

    // 漂移检测：保存主设备位置，启动副机 curl 查询
    // 更新播放进度条（远程校准 + 更新模拟参数）
    if (data.id === "PosUpdate" && !data.error && data.result) {
        var t = data.result.time;
        var tt = data.result.totaltime;
        if (t && tt && data.result.speed > 0) {
            var tMs = timeToMs(t);
            var ttMs = timeToMs(tt);
            if (ttMs > 0) {
                progTotalMs = ttMs;
                progBaseTick = syncTickCount;
                progBasePct = (tMs / ttMs) * 100;
                progPerTick = 500 / ttMs * 100;
                var pct = progBasePct;
                var progCtrl = local.values.getChild("Info").getChild("Playing");
                if (progCtrl) {
                    ignoreNextPlayingChange = true;
                    progCtrl.set(pct);
                }
                // 获取帧率
                if (data.result.videostreams && data.result.videostreams.length > 0) {
                    progFps = data.result.videostreams[0].fps;
                }
            }
        } else if (data.result && data.result.speed === 0) {
            // 暂停时不更新模拟
        }
        return;
    }

    if (data.id === "DriftQuery") {
        if (!data.error && data.result && data.result.time && data.result.speed > 0) {
            driftPriTime = data.result.time;
            if (secondaryIps.length > 0) {
                var host = secondaryIps[0].split(":")[0];
                var qJson = compactJson({jsonrpc:"2.0",method:"Player.GetProperties",params:{playerid:1,properties:["time","speed"]},id:"DriftSec"});
                var cmd = "/usr/bin/curl -s --max-time 3 -u " + httpUser + ":" + httpPass + " -X POST -H Content-Type:application/json -d " + qJson + " -o " + driftFilePath + " http://" + host + ":8080/jsonrpc";
                execShell(cmd);
            }
        }
        return;
    }

    // 手动 reSync（seek 备用）
    if (data.id === "SyncReSync") {
        if (!data.error && data.result && data.result.time && data.result.speed > 0) {
            doSeekAll(data.result.time, data.result.totaltime);
            script.log("ReSync: seek fired");
        }
        return;
    }

    // 处理其他事件（仅更新 UI，无任何自动重载逻辑）
    if (data.method === "Player.OnPlay") {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        if (data.params && data.params.data && data.params.data.player) {
            currentPlayerId = data.params.data.player.playerid;
        }
        // 主动查询当前文件路径
        var getItem = {
            jsonrpc: "2.0",
            method: "Player.GetItem",
            params: {
                playerid: currentPlayerId,
                properties: ["file", "title"]
            },
            id: "GetPlayerItem"
        };
        local.send(JSON.stringify(getItem));
        // 刷新播放列表（Player.Open File 会替换列表）
        playListGetItems();
        progTotalMs = 0; progPerTick = 0; progFps = 0;
        progQueryTick = syncTickCount - 60; // 触发立即校准
        script.log("Kodi state: Playing");
    }
    //
    if (data.method === "Player.OnPause") {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(true);
        script.log("Kodi state: Paused");
    }
    //
    if (data.method === "Player.OnResume") {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        script.log("Kodi state: Resumed");
    }
    //
    if (data.method === "Player.OnStop") {
        var fileValue = local.values.getChild("Info").getChild("File");
        if (fileValue) fileValue.set("[Stopped]");
        var progValue = local.values.getChild("Info").getChild("Playing");
        if (progValue) progValue.set(0);
        progTotalMs = 0; progPerTick = 0; progFps = 0;
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        var end = data.params && data.params.data && data.params.data.end;
        if (end === true) {
            script.log("Playlist ended naturally, rebuilding playlist...");
            initStep = 2;
            kodiPlaylistMap = [];
            buildPlaylistFromM3U();
        } else {
            script.log("Kodi state: Stopped (by user)");
        }
    }
    //
    if (data.method === "Application.OnVolumeChanged") {
        var newVol = data.params.data.volume;
        var volumeValue = local.values.getChild("Info").getChild("Volume");
        if (isMutedFlag) {
            script.log("Volume event ignored because muted.");
            return;
        }
        if (volumeValue) {
            ignoreNextVolumeChange = true;
            volumeValue.set(newVol);
            lastSyncedVolume = newVol;
        }
        script.log("Volume: " + newVol);
    }

    // 同步状态机已移除，不再需要推进
}

// ========== 监听 Parameters 面板值变化（Trigger 点击、开关切换等） ==========
function moduleParameterChanged(param) {
    var paramName = param.name;
    script.log("moduleParameterChanged: " + paramName);
    if (paramName.toLowerCase() === "initialization") {
        script.log("Initialization button pressed, starting initialization...");
        var infoContainer = local.values.getChild("Info");
        if (infoContainer) infoContainer.setCollapsed(false);
        init();
    } else if (paramName === "Add Secondary") {
        addSecondary();
    } else if (paramName.substring(0, 10) === "Secondary_") {
        rebuildSecondaryManager();
    } else if (paramName.toLowerCase() === "syncenabled") {
        syncEnabled = param.get();
        updateSyncStatus(syncEnabled ? "Ready" : "Disabled");
        var syncContainer = local.values.getChild("Synchronizer");
        if (syncContainer) syncContainer.setCollapsed(!syncEnabled);
        script.log("Sync " + (syncEnabled ? "enabled" : "disabled"));
    }
}
