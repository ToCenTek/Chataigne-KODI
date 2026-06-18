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

// 同步相关变量
var secondaryIps = [];
var httpUser = "kodi";
var httpPass = "";
var syncEnabled = false;
var syncInterval = 2000;
var syncThreshold = 8;
var syncStatusValue = null;
var syncStatusText = "";
var syncGotPrimaryResponse = false;
var syncPrimaryTime = null;
var syncPrimarySpeed = 0;
var sysHelperName = "OS";

// 同步状态机变量（与 sync.js 声明的全局变量相同，作用域隔离）
var SYNC_IDLE = 0;
var SYNC_WAIT_PRIMARY = 1;
var SYNC_CHECK = 2;
var SYNC_WAIT_SECONDARY = 3;
var SYNC_DONE = 4;
var syncState = SYNC_IDLE;
var syncLastCycleTime = 0;
var syncSecondaryIndex = 0;
var syncLastSeekMs = -1;
var syncCurHost = "";
var syncCurPort = 8080;
var syncTempPrefix = "/tmp/kodi_sync_";

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

// 解析 Values.Synchronizer.KODIs.Secondary 的多行文本，按换行分割成 IP 数组
function parseSecondaryIps(str) {
    if (str == null || str === "") { secondaryIps = []; return; }
    var items = str.split("\n");
    var result = [];
    for (var i = 0; i < items.length; i++) {
        var p = trimStr(items[i]);
        if (p.length > 0) result.push(p);
    }
    secondaryIps = result;
}

// 通过 curl 向指定 KODI 发送 HTTP POST JSON-RPC 请求（用于同步等 HTTP 操作）
function httpPost(host, port, msg) {
    var jsonStr = JSON.stringify(msg);
    jsonStr = jsonStr.split("'").join("'\\''");
    var auth = "";
    if (httpUser.length > 0) {
        var u = httpUser.split("'").join("'\\''");
        var p = httpPass.split("'").join("'\\''");
        auth = " -u '" + u + ":" + p + "'";
    }
    var url = "http://" + host + ":" + port + "/jsonrpc";
    var cmd = "curl -s --max-time 3" + auth + " -X POST -H 'Content-Type: application/json' -d '" + jsonStr + "' '" + url + "'";
    execShell(cmd);
}

// 通过 curl GET 请求将 JSON-RPC 响应保存到文件（同步时用于读取 KODI 播放位置）
function httpGetToFile(host, port, msg, outFile) {
    var jsonStr = JSON.stringify(msg);
    jsonStr = jsonStr.split("'").join("'\\''");
    var auth = "";
    if (httpUser.length > 0) {
        var u = httpUser.split("'").join("'\\''");
        var p = httpPass.split("'").join("'\\''");
        auth = " -u '" + u + ":" + p + "'";
    }
    var url = "http://" + host + ":" + port + "/jsonrpc";
    var cmd = "curl -s --max-time 3" + auth + " -X POST -H 'Content-Type: application/json' -d '" + jsonStr + "' -o '" + outFile + "' '" + url + "'";
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

// 多设备同步状态机：IDLE → WAIT_PRIMARY → CHECK → WAIT_SECONDARY → DONE
// 周期轮询所有 KODI 的播放位置，漂移超过 syncThreshold 则 seek 纠偏
function advanceSyncState() {
    if (!syncEnabled || secondaryIps.length === 0) {
        syncState = SYNC_IDLE;
        syncLastCycleTime = 0;
        return;
    }

    var now = new Date() - 0;

    // IDLE / DONE: 检查时间间隔
    if (syncState === SYNC_IDLE || syncState === SYNC_DONE) {
        if (syncLastCycleTime === 0) {
            syncLastCycleTime = now;
            return;
        }
        if (now - syncLastCycleTime < syncInterval) return;
        syncLastCycleTime = now;
        syncGotPrimaryResponse = false;
        syncPrimaryTime = null;
        syncState = SYNC_WAIT_PRIMARY;
        var posMsg = {
            jsonrpc: "2.0",
            method: "Player.GetProperties",
            params: {
                playerid: currentPlayerId,
                properties: ["time", "speed"]
            },
            id: "SyncGetPrimary"
        };
        local.send(JSON.stringify(posMsg));
        updateSyncStatus("Polling...");
        return;
    }

    // WAIT_PRIMARY: 等待 wsMessageReceived 设置 syncGotPrimaryResponse
    if (syncState === SYNC_WAIT_PRIMARY) {
        if (!syncGotPrimaryResponse) return;
        syncGotPrimaryResponse = false;
        if (syncPrimarySpeed === 0 || syncPrimaryTime == null) {
            syncState = SYNC_DONE;
            updateSyncStatus("Idle (not playing)");
            return;
        }
        var primaryMs = timeToMs(syncPrimaryTime);
        if (syncLastSeekMs >= 0 && Math.abs(primaryMs - syncLastSeekMs) < syncThreshold) {
            syncState = SYNC_DONE;
            return;
        }
        syncLastSeekMs = primaryMs;
        syncSecondaryIndex = 0;
        syncState = SYNC_CHECK;
        return;
    }

    // CHECK: 启动 HTTP 获取副设备位置
    if (syncState === SYNC_CHECK) {
        if (syncSecondaryIndex >= secondaryIps.length) {
            syncState = SYNC_DONE;
            updateSyncStatus("In sync");
            return;
        }
        var ip = secondaryIps[syncSecondaryIndex];
        var parts = ip.split(":");
        syncCurHost = parts[0];
        syncCurPort = 8080;
        if (parts.length > 1) {
            var parsedPort = parseInt(parts[1]);
            if (!isNaN(parsedPort)) syncCurPort = parsedPort;
        }
        var getMsg = {
            jsonrpc: "2.0",
            method: "Player.GetProperties",
            params: {
                playerid: currentPlayerId,
                properties: ["time", "speed"]
            },
            id: "SyncGetSecondary"
        };
        var outFile = syncTempPrefix + syncSecondaryIndex + ".json";
        httpGetToFile(syncCurHost, syncCurPort, getMsg, outFile);
        syncState = SYNC_WAIT_SECONDARY;
        return;
    }

    // WAIT_SECONDARY: 读取 HTTP 结果文件
    if (syncState === SYNC_WAIT_SECONDARY) {
        var outFile = syncTempPrefix + syncSecondaryIndex + ".json";
        var data = readJSONFile(outFile);
        if (data == null || data.error || data.result == null || data.result.time == null) {
            syncSecondaryIndex++;
            syncState = SYNC_CHECK;
            return;
        }
        var secondaryTime = data.result.time;
        var secondarySpeed = data.result.speed;
        if (secondarySpeed !== 0 && syncPrimaryTime != null) {
            var drift = Math.abs(timeToMs(syncPrimaryTime) - timeToMs(secondaryTime));
            if (drift > syncThreshold) {
                var seekMsg = {
                    jsonrpc: "2.0",
                    method: "Player.Seek",
                    params: {
                        playerid: currentPlayerId,
                        value: { time: syncPrimaryTime }
                    },
                    id: "SyncSeek"
                };
                httpPost(syncCurHost, syncCurPort, seekMsg);
                script.log("Sync: corrected " + syncCurHost + " drift=" + drift + "ms");
            }
        }
        syncSecondaryIndex++;
        syncState = SYNC_CHECK;
        return;
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
    local.send(JSON.stringify(msg));
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
        local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    if (val) httpPass = val.get();
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
        script.log("moduleValueChanged: " + paramName + " > " + value.get());
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
        }
    } else {
        script.log("Module value triggered : " + value.name);
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
var stereoModes = ["off", "split_vertical", "split_horizontal"];
var stereoNames = ["off", "sbs", "tab"];

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
    var modeVal = "off";
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

// 强制立即触发一次同步轮询
function reSync() {
    if (!syncEnabled || secondaryIps.length === 0) {
        script.log("ReSync: sync not enabled or no secondary KODIs");
        return;
    }
    syncLastCycleTime = new Date() - syncInterval - 1;
    syncState = SYNC_IDLE;
    updateSyncStatus("Resyncing...");
    advanceSyncState();
}

// ========== 模块初始化：加载设置、同步状态、获取文件列表 ==========
function init() {
    initStep = 0;
    sortedFileList = [];
    kodiPlaylistMap = [];
    reloadSyncSettings();
    syncAll();
    initStep = 1;
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
            var playingValue = local.values.getChild("Info").getChild("Playing");
            if (playingValue) playingValue.set("[Stopped]");
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
        var playingValue = local.values.getChild("Info").getChild("Playing");
        if (playingValue) playingValue.set(filePath);
        script.log("Now playing synced: " + filePath);
        return;
    }

    // 同步位置检查响应：将主设备位置存入共享变量
    if (data.id === "SyncGetPrimary" && !data.error) {
        syncPrimaryTime = data.result.time;
        syncPrimarySpeed = data.result.speed;
        syncGotPrimaryResponse = true;
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
        var playingValue = local.values.getChild("Info").getChild("Playing");
        if (playingValue) playingValue.set("[Stopped]");
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

    // 每次收到消息都推进同步状态机
    advanceSyncState();
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
    } else if (paramName === "Play/Pause") {
        var pausedVal = local.values.getChild("Info").getChild("isPaused");
        var isPaused = pausedVal ? pausedVal.get() : false;
        playPause(!isPaused);
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
