var videoDirectory = "/storage/videos";
var m3uPath = "/storage/.kodi/userdata/playlists/video/videos.m3u"; // m3u 静态播放列表, 由 bash coreelec.sh 生成

// 全局变量
var initStep = 0;
var currentPlayerId = 1;
var currentplaylistid = 1;
var kodiPlaylistMap = [];
var sortedFileList = [];
var currentAddIndex = 0;
var lastSyncedVolume = -1;
var ignoreNextVolumeChange = false;
var volumeBeforeMute = -1;
var isMutedFlag = false;  // 静音标志，用于阻止静音期间的音量事件更新 UI

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

// 直接播放 m3u 文件
function playM3U() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: {
            item: { file: m3uPath }
        },
        id: "init"
    };
    local.send(JSON.stringify(msg));
}

// 获取播放列表项目
function playListGetItems() {
    var msg = {
        jsonrpc: "2.0",
        method: "Playlist.GetItems",
        params: {
            playlistid: currentPlayerId,
            properties: ["title", "file", "playcount"]
        },
        id: "GetCurrentListAllItems"
    };
    local.send(JSON.stringify(msg));
}

// 获取当前音量并更新 Values 面板
function syncVolume() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.GetProperties",
        params: { properties: ["volume"] },
        id: "GetVolume"
    };
    local.send(JSON.stringify(msg));
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
            
            var isMutedParam = local.values.getChild("isMuted");
            var wasMuted = isMutedParam && isMutedParam.get() === true;
            if (wasMuted && newVol > 0) {
                script.log("Volume adjusted while muted, unmuting first.");
                // 取消静音
                var unmuteMsg = {
                    jsonrpc: "2.0",
                    method: "Application.SetMute",
                    params: { mute: false },
                    id: "Application.SetMute"
                };
                local.send(JSON.stringify(unmuteMsg));
                isMutedParam.set(false);
                isMutedFlag = false;
                volumeBeforeMute = intVol;
                if (Math.abs(intVol - lastSyncedVolume) > 0.5) {
                    setVolume(intVol);
                    lastSyncedVolume = intVol;
                }
                script.log("Unmuted and set volume to: " + intVol);
            } else {
                if (Math.abs(intVol - lastSyncedVolume) > 0.5) {
                    setVolume(intVol);
                    lastSyncedVolume = intVol;
                    script.log("Sent SetVolume command: " + intVol);
                } else {
                    script.log("Volume change too small or equal to last synced, skipping send.");
                }
            }
        }
    } else {
        script.log("Module value triggered : " + value.name);
        if (value.name === "init") {
            script.log("INIT button pressed, starting initialization...");
            init();
        }
    }
}

// 指定索引播放
function playIndex(Index) {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: {
            playerid: currentPlayerId,
            to: Index
        },
        id: "Player.Open.FilePath"
    };
    local.send(JSON.stringify(msg));
}

// 指定全路径播放
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
    local.send(JSON.stringify(msg));
}

// 播放/暂停
function playPause(isPaused) {
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
    local.send(JSON.stringify(msg));
}

// 停止播放
function stopPlay() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Stop",
        params: { playerid: currentPlayerId },
        id: "Player.Stop"
    };
    local.send(JSON.stringify(msg));
    script.log("Stop playback");
}

// 步进快进/快退
function seek(Step) {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {seconds: Step}
        },
        id: "Seek"
    };
    local.send(JSON.stringify(msg));
    script.log("Seek: " + Step);
}

// 跳转到百分比
function seekToParameters(Parameters){
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Seek",
        params: {
            playerid: currentPlayerId,
            value: {percentage: Parameters}
        },
        id: "SeekToParameters"
    };
    local.send(JSON.stringify(msg));
    script.log("Seek to Parameters: " + Parameters);
}

// 跳转到时间
function seekToTime(Hours, Minutes, Seconds, Milliseconds){
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
    local.send(JSON.stringify(msg));
    script.log("Seek to Time: " + Hours + ":" + Minutes + ":" + Seconds + "." + Milliseconds);
}

// 跳转到预定义步进
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
    local.send(JSON.stringify(msg));
    script.log("Seek to Predefined: " + Step);
}

// 设置循环模式
function setLoop(Mode) {
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
    local.values.getChild("isLooped").set(Mode !== "off");
    script.log("Setup Loop Mode: " + Mode);
}

// 设置随机播放
function setRandom(Mode) {
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
    local.values.getChild("Random").set(Mode);
    script.log("Setup Random Mode: " + Mode);
}

// 设置音量
function setVolume(Volume) {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: Volume },
        id: "SetVolume"
    };
    local.send(JSON.stringify(msg));
    script.log("Set volume: " + Volume);
}

// 音量 +5%
function volumeUP() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: "increment" },
        id: "VolumeUp"
    };
    local.send(JSON.stringify(msg));
    script.log("Volume UP");
}

// 音量 -5%
function volumeDown() {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetVolume",
        params: { volume: "decrement" },
        id: "VolumeDown"
    };
    local.send(JSON.stringify(msg));
    script.log("Volume DOWN");
}

// 静音
function mute(Mute) {
    var msg = {
        jsonrpc: "2.0",
        method: "Application.SetMute",
        params: { mute: Mute },
        id: "Application.SetMute"
    };
    local.send(JSON.stringify(msg));
    var isMutedParam = local.values.getChild("isMuted");
    if (isMutedParam) isMutedParam.set(Mute);
    isMutedFlag = Mute;
    
    var volParam = local.values.getChild("Volume");
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
        setVolume(Math.round(restoreVol));
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
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.ShowNotification",
        params: {
            title: Title,
            message: util.readFile(Message),
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

// ========== 模块初始化 ==========
function init() {
    initStep = 0;
    sortedFileList = [];
    kodiPlaylistMap = [];

    syncVolume();

    initStep = 1;
    getDirectoryFiles();
    script.log("Step 1: Getting directory files for display...");
}

// ========== WebSocket 消息接收 ==========
function wsMessageReceived(message) {
    var data = JSON.parse(message);

    if (data.id === "init" && !data.error) {
        if (initStep === 2) {
            initStep = 3;
            playM3U();
            script.log("Step 3: Playing m3u playlist...");
        }
        else if (initStep === 3) {
            initStep = 4;
            playListGetItems();
            script.log("Step 4: Getting playlist items for display...");
        }
        else if (initStep === 4) {
            initStep = 0;
            script.log("Initialization complete.");
        }
        return;
    }

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
        var itemsValue = local.values.getChild("Items");
        if (itemsValue) itemsValue.set(output);
        script.log("============ UI Items (sorted by label) ============");
        script.log(output);

        initStep = 2;
        playM3U();
        script.log("Step 2.5: Playing m3u playlist...");
        return;
    }

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
        var itemsValue = local.values.getChild("Items");
        if (itemsValue) itemsValue.set(output);
        script.log("============ Playlist Items (actual playing order from m3u) ============");
        script.log(output);
        kodiPlaylistMap = [];
        for (var i = 0; i < items.length; i++) {
            kodiPlaylistMap.push({
                name: items[i].label,
                path: items[i].file,
                realIndex: i
            });
        }
        if (initStep === 4) initStep = 0;
        return;
    }

    if (data.id === "GetVolume" && data.result && data.result.volume !== undefined) {
        var volumeValue = local.values.getChild("Volume");
        if (volumeValue) {
            ignoreNextVolumeChange = true;
            volumeValue.set(data.result.volume);
            lastSyncedVolume = data.result.volume;
        }
        script.log("Volume synced: " + data.result.volume);
        return;
    }

    if (data.method === "Player.OnPlay") {
        var videoFile = data.params.data.item.title;
        var playingValue = local.values.getChild("Playing");
        if (playingValue) playingValue.set(videoFile);
        var pausedValue = local.values.getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        script.log("Kodi state: Playing - " + videoFile);
    }
    if (data.method === "Player.OnPause") {
        var pausedValue = local.values.getChild("isPaused");
        if (pausedValue) pausedValue.set(true);
        script.log("Kodi state: Paused");
    }
    if (data.method === "Player.OnResume") {
        var pausedValue = local.values.getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        script.log("Kodi state: Resumed");
    }
    if (data.method === "Player.OnStop") {
        var playingValue = local.values.getChild("Playing");
        if (playingValue) playingValue.set("[Stopped]");
        var pausedValue = local.values.getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        var itemsValue = local.values.getChild("Items");
        if (itemsValue) itemsValue.set("(stopped)");
        script.log("Kodi state: Stopped");
    }
    if (data.method === "Application.OnVolumeChanged") {
        var newVol = data.params.data.volume;
        var volumeValue = local.values.getChild("Volume");
        // 关键修改：如果处于静音状态，忽略该事件，保持 UI 显示 0
        if (isMutedFlag) {
            script.log("Volume event ignored because muted, UI volume remains 0.");
            return;
        }
        if (volumeValue) {
            ignoreNextVolumeChange = true;
            volumeValue.set(newVol);
            lastSyncedVolume = newVol;
        }
        script.log("Volume: " + newVol);
    }
}