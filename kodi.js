var videoDirectory = "/storage/videos";

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
// (sync removed)

// (sync removed from main module)

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

function syncAll() {
    local.send(JSON.stringify({jsonrpc:"2.0",method:"Application.GetProperties",params:{properties:["volume","muted"]},id:"GetAllState"}));
    local.send(JSON.stringify({jsonrpc:"2.0",method:"Player.GetActivePlayers",id:"GetActivePlayers"}));
}

function timeToMs(t) {
    if (t == null) return 0;
    return (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000 + (t.milliseconds || 0);
}
function reloadSyncSettings() {}

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
        } else if (paramName.toLowerCase() === "playing") {
            if (ignoreNextPlayingChange) {
                ignoreNextPlayingChange = false;
                return;
            }
            var pct = value.get();
            // 用户拖动后重置模拟起点，防止反弹
            progBaseTick = progTick;
            progBasePct = pct;
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
    local.send(JSON.stringify(msg));
}

// 下一曲
function nextTrack() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: { playerid: currentPlayerId, to: "next" },
        id: "Player.GoTo"
    };
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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
    local.send(JSON.stringify(msg));
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

// ========== 视频校准 ==========
function openVideoSettings() {
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.ActivateWindow",
        params: { window: "settings", parameters: ["videosettings"] },
        id: "VidSet"
    };
    local.send(JSON.stringify(msg));
    script.log("Video settings opened (navigate to Video Calibration)");
}

function setOverscanZoom(Zoom) {
    if (Zoom == null) Zoom = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "lookandfeel.skinzoom", value: Zoom },
        id: "SkinZoom"
    };
    local.send(JSON.stringify(msg));
    script.log("Overscan zoom set to " + Zoom);
}

function resetCalibration() {
    setOverscanZoom(0);
    script.log("Calibration reset");
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
    local.send(JSON.stringify(msg));
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

// 循环切换宽高比 N 次（仅当前 KODI）
function setAspectRatio(Count) {
    if (Count == null || Count < 1) Count = 1;
    for (var n = 0; n < Count; n++) {
        local.send(JSON.stringify({
            jsonrpc: "2.0", method: "Input.ExecuteAction",
            params: { action: "aspectratio" }, id: "SetAspect"
        }));
    }
    script.log("Aspect: cycled " + Count + " time(s)");
}

var progTick = 0;

function update(deltaTime) {
    progTick++;
    if (progTotalMs === 0 && progTick % 10 === 0) {
        local.send(JSON.stringify({
            jsonrpc: "2.0", method: "Player.GetProperties",
            params: { playerid: currentPlayerId, properties: ["time", "speed", "totaltime", "videostreams"] },
            id: "PosUpdate"
        }));
    }
    if (progTotalMs > 0 && progPerTick > 0) {
        var simPct = progBasePct + (progTick - progBaseTick) * progPerTick;
        if (simPct > 100) simPct = 100;
        var progCtrl = local.values.getChild("Info").getChild("Playing");
        if (progCtrl) {
            ignoreNextPlayingChange = true;
            progCtrl.set(simPct);
        }
    }
}

// ========== 模块初始化：加载设置、同步状态、获取文件列表 ==========
function init() {
    initStep = 0;
    sortedFileList = [];
    kodiPlaylistMap = [];
    var osMod = root.modules.getItemWithName("OS");
    if (osMod == null) {
        osMod = root.modules.addItem("OS");
        if (osMod && osMod.name !== "OS") osMod.setName("OS");
        if (osMod) script.log("OS module auto-loaded");
    }
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
        var output = "";
        for (var i = 0; i < sortedFileList.length; i++) {
            output += i + ": " + sortedFileList[i].label;
            if (i < sortedFileList.length - 1) output += "\n";
        }
        var itemsValue = local.values.getChild("Info").getChild("Items");
        if (itemsValue) itemsValue.set(output);
        script.log("Files: " + output.split("\n").length + " items");

        initStep = 2;
        buildPlaylistFromM3U();
        script.log("Step 2: Building playlist...");
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
        script.log("Playlist: " + (items.length > 0 ? items.length + " items" : "(empty)"));
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

    // 获取位置更新进度条模拟参数
    if (data.id === "PosUpdate" && !data.error && data.result) {
        var t = data.result.time;
        var tt = data.result.totaltime;
        if (t && tt && data.result.speed > 0) {
            var tMs = timeToMs(t);
            var ttMs = timeToMs(tt);
            if (ttMs > 0) {
                progTotalMs = ttMs;
                progBaseTick = progTick;
                progBasePct = (tMs / ttMs) * 100;
                progPerTick = 500 / ttMs * 100;
                var progCtrl = local.values.getChild("Info").getChild("Playing");
                if (progCtrl) {
                    ignoreNextPlayingChange = true;
                    progCtrl.set(progBasePct);
                }
                if (data.result.videostreams && data.result.videostreams.length > 0) {
                    progFps = data.result.videostreams[0].fps;
                }
            }
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
        progTick = 0; progBaseTick = 0; progBasePct = 0;
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
    }
}
