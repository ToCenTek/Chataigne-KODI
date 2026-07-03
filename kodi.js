var videoDirectory = "/storage/videos";

// 全局变量
var initStep = 0;
var currentPlayerId = 1;
var currentplaylistid = 0;
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
var progAccumMs = 0;
var progTotalMs = 0;
var progFps = 0;
var _posUpdateTimer = 0;  // PosUpdate 轮询计时器
var _vic_pending_ip = "";  // used by messageBoxCallback for dialog result
var audioOutputList = [];   // 从 KODI 获取的音频设备列表 [{label, value, shortLabel}, ...]
var _discoveredDevices = [];  // Zeroconf 发现的 KODI 设备 [{name, ip, port}, ...]
var _seekPending = -1;  // 防抖：待发送的进度值，-1=无
var _seekTimer = 0;     // 防抖：剩余等待秒数
var _isPaused = false;  // 播放暂停状态，用于暂停时停止进度条模拟

// 将毫秒转为 MM:SS 或 HH:MM:SS
function pad2(i) {
    if (i < 0) i = 0;
    if (i > 99) i = 99;
    var t = Math.floor(i / 10);
    var o = i % 10;
    return String.fromCharCode(48 + t) + String.fromCharCode(48 + o);
}

function pad3(i) {
    if (i < 0) i = 0;
    if (i > 999) i = 999;
    var h = Math.floor(i / 100);
    var r = i % 100;
    var t = Math.floor(r / 10);
    var o = r % 10;
    return String.fromCharCode(48 + h) + String.fromCharCode(48 + t) + String.fromCharCode(48 + o);
}

function formatTime(millis) {
    if (millis == null || millis <= 0) return '00:00.000';
    var total = Math.floor(millis / 1000);
    var h = Math.floor(total / 3600);
    var mn = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var ml = Math.floor(millis % 1000);
    if (h > 0) return pad2(h) + ':' + pad2(mn) + ':' + pad2(s) + '.' + pad3(ml);
    return pad2(mn) + ':' + pad2(s) + '.' + pad3(ml);
}

var _posCtrl = null;  // Position 控件缓存

function updatePosition(curMs, totalMs) {
    if (_posCtrl == null) {
        _posCtrl = local.values.getChild('Info').getChild('Position');
        if (_posCtrl == null) return;
    }
    if (totalMs <= 0) { _posCtrl.set('00:00.000'); return; }
    _posCtrl.set(formatTime(curMs) + '  /  ' + formatTime(totalMs));
}

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
    local.parameters.setCollapsed(true); 
}

// 清空并重建播放列表（通过 Playlist.Clear + 逐条 Playlist.Add）
function buildPlaylistFromM3U() {
    playlistStep = 1;
    playlistAddIndex = 0;
    var msg = {
        jsonrpc: "2.0",
        method: "Playlist.Clear",
        params: { playlistid: currentplaylistid },
        id: "PlaylistClear"
    };
    local.send(JSON.stringify(msg));

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
                playlistid: currentplaylistid,
                item: { file: filePath }
            },
            id: "PlaylistAdd"
        };
        local.send(JSON.stringify(msg));
    } else {
        playlistStep = 0;
        openManagedPlaylist();

    }
}

// 启动已构建好的托管播放列表（Player.Open with playlistid: 1）
function openManagedPlaylist() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.Open",
        params: {
            item: { playlistid: currentplaylistid }
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


// {"jsonrpc":"2.0","method":"Settings.GetSettings","id":1}
// 查询 KODI 当前可用的音频输出设备列表，存入全局 audioOutputList 供其它函数使用
function getSettings() {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.GetSettings",
        params: { level: "basic" },
        id: "GetAudioOutputsList"
    }));
}

// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","id":1}
// 按设备名切换（必须是 audioOutputList 中某个元素的 label 或 shortLabel）
// 切换声道数 (1=2.0, 2=2.1, ..., 10=7.1)
function switchAudioChannels(num) {
    if (num == null || num < 1) num = 1;
    if (num > 10) num = 10;
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "audiooutput.channels", value: num },
        id: "SetAudioChannels"
    }));
    script.log("Switch Audio Channels: " + num);
}

// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","id":1}
function chooseAudioOutput(device) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {setting: "audiooutput.audiodevice", value: device},
        id: "SetAudioOutput"
    }));
    script.log("Choose Audio Output: " + device);
}

// 处理 GetAudioOutputsList 响应：填充 audioOutputList
// 处理 GetCurrentAudio 响应：切到下一个设备

function timeToMs(t) {
    if (t == null) return 0;
    return (t.hours * 3600 + t.minutes * 60 + t.seconds) * 1000 + (t.milliseconds || 0);
}

// 跳转到播放列表的指定索引位置
function playIndex(Index) {
    if (Index == null || Index < 0) Index = 0;
    script.log("playIndex: " + Index + " (player=" + currentPlayerId + ")");
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: {
            playerid: currentPlayerId,
            to: Index
        },
        id: "Player.GoTo"
    };
    local.send(JSON.stringify(msg));
    // sccript.log("Playing index: " + Index);
}

// 下一曲
function nextTrack() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: { 
            playerid: currentPlayerId,
            to: "next" 
        },
        id: "Player.GoTo"
    };
    local.send(JSON.stringify(msg));
    script.log("Next track");
}

// 上一曲
// {"jsonrpc": "2.0","method": "Player.GoTo","params": { "playerid": 0,"to": "previous" },"id": "Player.GoTo"}
function prevTrack() {
    var msg = {
        jsonrpc: "2.0",
        method: "Player.GoTo",
        params: { 
            playerid: currentPlayerId,
            to: "previous" 
        },
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
    script.log("Playing: " + FilePath);
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
    script.log("Loop: " + Mode);

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
        local.send(JSON.stringify(volMsg));
        lastSyncedVolume = Math.round(restoreVol);
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

// ShowPlayerProcessInfo 播放进程信息
// {"jsonrpc":"2.0","method":"Input.ShowPlayerProcessInfo","id":1}
function showPlayerProcessInfo() {
    var msg = {
        jsonrpc: "2.0",
        method: "Input.ShowPlayerProcessInfo",
        id: "Input.ShowPlayerProcessInfo"
    };
    local.send(JSON.stringify(msg));
}
// 显示调试信息
function showDebugInfo(Show) {
    if (Show == null) Show = false;
    var msg = {
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: { setting: "debug.showloginfo", value: Show },
        id: "debug.showloginfo"
    };
    local.send(JSON.stringify(msg));
}

// 显示通知
function showNotification(Title, Message, Displaytime, Image) {
    if (Title == null) Title = "";
    if (Message == null) Message = "";
    if (Displaytime == null) Displaytime = 5000;
    // if (Image == null) Image = "";
    if (Title.length > 0 && Title.charAt(0) === '/') {
        var title = util.readFile(Title);
        if (title !== undefined && title !== null && title.length > 0) {
            Title = title;
        }
    }
    // var messageText = Message;
    if (Message.length > 0 && Message.charAt(0) === '/') {
        var content = util.readFile(Message);
        if (content !== undefined && content !== null && content.length > 0) {
            // messageText = content;
            Message = content;
        }
    }
    var msg = {
        jsonrpc: "2.0",
        method: "GUI.ShowNotification",
        params: {
            title: Title,
            // message: messageText,
            message: Message,
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
    JSON.parse(jsonText);
    local.send(jsonText);
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

// {"jsonrpc":"2.0","method":"Input.ExecuteAction","id":1}
// ========== 视频校准 & 按键输入 ==========
function remoteControl(Action) {
    if (Action == null || Action.length === 0) Action = "osd";
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Input.ExecuteAction",
        params: { action: Action },
        id: "Input"
    }));
    script.log("Remote: " + Action);
}

// {"jsonrpc":"2.0","method":"GUI.ActivateWindow","id":1}
function navigateCalibration() {
    // 直接打开视频校准窗口 (screencalibration 是 KODI JSON-RPC 的合法 window 名)
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "GUI.ActivateWindow",
        params: { window: "screencalibration" },
        id: "NavigateCalibration"
    }));
    script.log("Navigate to video calibration screen");
}

function resetCalibration() {
    remoteControl("resetcalibration");
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
    script.log("action fullscreen");
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
    local.send(JSON.stringify(swapMsg));
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
// {"jsonrpc":"2.0","method":"Input.ExecuteAction","id":1}
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

// {"jsonrpc":"2.0","method":"Player.GetProperties","id":1}
function update(deltaTime) {
    // 节流：用户拖进度条时每 100ms 最多发一次 seek
    if (_seekPending >= 0) {
        _seekTimer = _seekTimer - deltaTime;
        if (_seekTimer <= 0) {
            local.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "Player.Seek",
                params: { playerid: currentPlayerId, value: { percentage: _seekPending } },
                id: "SeekFromSlider"
            }));
            _seekPending = -1;
        }
    }
    // 未获取到总时长时每 5 秒轮询一次
    if (progTotalMs === 0) {
        _posUpdateTimer = _posUpdateTimer + deltaTime;
        if (_posUpdateTimer >= 3) {
            _posUpdateTimer = 0;
            local.send(JSON.stringify({
                jsonrpc: "2.0", method: "Player.GetProperties",
                params: { playerid: currentPlayerId, properties: ["time", "speed", "totaltime", "videostreams"] },
                id: "PosUpdate"
            }));
        }
    }
    if (progTotalMs > 0 && !_isPaused && _seekPending < 0) {
        progAccumMs = progAccumMs + deltaTime * 1000;
        if (progAccumMs > progTotalMs) progAccumMs = progTotalMs;
        var curPct = progAccumMs / progTotalMs * 100;
        var progCtrl = local.values.getChild("Info").getChild("Playing");
        if (progCtrl) {
            ignoreNextPlayingChange = true;
            progCtrl.set(curPct);
            updatePosition(progAccumMs, progTotalMs);
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

    }
    initStep = 1;
    script.setUpdateRate(30);
    getDirectoryFiles();

    local.scripts.kodi.setCollapsed(true);
    local.values.commands.setCollapsed(true);
    local.values.calibration.setCollapsed(true);
    // local.parameters.setCollapsed(true); 

}

// From serverPath extract KODI IP address
function getKodiIP() {
    var serverPath = local.parameters.getChild('serverPath');
    if (serverPath == null) return '10.0.0.53';
    var sp = serverPath.get();
    if (sp == null || sp === '') return '10.0.0.53';
    var colonIdx = sp.indexOf(':');
    if (colonIdx > 0) return sp.substring(0, colonIdx);
    return sp;
}

function queryOutputResolution() {
    var osMod = root.modules.getItemWithName('OS');
    if (osMod == null) {
        script.log('VIC: OS module not found');
        return;
    }
    var ip = getKodiIP();

    // Wait for HDMI to settle then query VIC
    clearVIC();
    util.delayThreadMS(1500);
    var output = doSSHQuery(osMod, ip);
    if (output != null && output.length > 0) {
        if (parseAndSetVIC(output)) return;
    }

    // SSH failed -> show dialog (user needs to install key)
    script.log('VIC: SSH failed, prompting user...');
    promptManualSSHSetup(ip);
}

function doSSHQuery(osMod, ip) {
    var cmd = '/usr/bin/ssh -o BatchMode=yes -o ConnectTimeout=3 root@' + ip + ' cat /sys/class/amhdmitx/amhdmitx0/config';
    return osMod.launchProcess(cmd, true);
}

function parseAndSetVIC(output) {
    var lines = output.split('\n');
    var resolution = '';
    for (var li = 0; li < lines.length; li++) {
        var line = lines[li];
        if (line.indexOf('VIC:') >= 0 && line.indexOf('cur_') < 0) {
            var parts = line.split(' ');
            resolution = parts[parts.length - 1];
            break;
        }
    }
    if (resolution === '') {
        script.log('VIC: no VIC line in output');
        return false;
    }
    script.log('Output Resolution: ' + resolution);
    var resCtrl = local.values.getChild('Info').getChild('outputResolution');
    if (resCtrl) resCtrl.set(resolution);
    return true;
}

function clearVIC() {
    var resCtrl = local.values.getChild('Info').getChild('outputResolution');
    if (resCtrl) resCtrl.set('');
}


function promptManualSSHSetup(ip) {
    // showOkCancelBox is ASYNC - returns 0 immediately
    // When user clicks a button, messageBoxCallback(id, result) is called
    // result: 0 = first button (Enter Password), 1 = second (Cancel)
    _vic_pending_ip = ip;
    util.showOkCancelBox(
        'vic_auth',
        "ssh root@" + ip + " 需要密钥 / needs SSH key",
        "root 用户初始密码: coreelec\nDefault password: coreelec\n\n请按 Enter Password 安装密钥\nPress [Enter Password] to install key",
        'warning',
        'Enter Password',
        'Cancel'
    );
    script.log('VIC: dialog shown, waiting for user response...');
}

function openTerminalWithCommand(cmd) {
    var om = root.modules.getItemWithName('OS');
    if (om == null) return;

    var plat = om.launchProcess('uname -s', true);
    if (plat != null && plat.indexOf('Darwin') >= 0) {
        // macOS: launchCommand uses system() → /bin/sh
        var appleScript = "osascript -e 'tell application \"Terminal\" to do script \"" + cmd + "\"' -e 'tell application \"Terminal\" to activate'";
        om.launchCommand(appleScript);
    } else if (plat != null && plat.indexOf("Linux") >= 0) {
        // Linux (Debian系): 依次检测可用终端, 用第一个找到的
        var terms = ["x-terminal-emulator", "xterm", "st", "gnome-terminal", "xfce4-terminal", "lxterminal"];
        var foundTerm = null;
        for (var ti = 0; ti < terms.length; ti++) {
            var result = om.launchProcess("command -v " + terms[ti] + " 2>/dev/null", true);
            if (result != null && result.length > 0) {
                foundTerm = terms[ti];
                break;
            }
        }
        if (foundTerm != null) {
            script.log("VIC: found terminal: " + foundTerm);
            if (foundTerm === "gnome-terminal") {
                om.launchProcess("DISPLAY=:0 " + foundTerm + " -- sh -c \"" + cmd + "\"", false);
            } else {
                om.launchProcess("DISPLAY=:0 " + foundTerm + " -e sh -c \"" + cmd + "\"", false);
            }
        } else {
            script.log("VIC: no terminal emulator found on Linux");
        }
    }
}
// 调整显示刷新率及分辨率: 这个设置本质是帧率匹配，但因为刷新率和分辨率是打包的，所以切刷新率的时候分辨率也可能跟着变。
// {"jsonrpc":"2.0","method":"Input.ShowPlayerProcessInfo","id":1}
function adjustRefreshRate(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoplayer.adjustrefreshrate",
            value: num
        },
        id: "videoplayer.adjustrefreshrate"
    }));
    script.log("videoplayer.adjustrefreshrate: " + num);
}

// 最小化黑边
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoplayer.errorinaspect","value":0},"id":1}
function minumiseBlackBars(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoplayer.errorinaspect",
            value: num
        },
        id: "videoplayer.errorinaspect"
    }));
    script.log("Remote: " + num);
}


// 将 4:3 视频显示为
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoplayer.stretch43","value":0},"id":1}
function display43as(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoplayer.stretch43",
            value: num
        },
        id: "videoplayer.adjustresolution"
    }));
    script.log("videoplayer.stretch4:3: " + num);
}

//高品质缩放器
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoplayer.hqscalers","value":20},"id":1}
function highQualityScaler(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoplayer.hqscalers",
            value: num
        },
        id: "videoplayer.hqscalers"
    }));
    script.log("videoplayer.hqscalers: " + num);
}

// 硬件解码
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoplayer.useamcodec","value":true},"id":1}
function useHardwareDecoder(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoplayer.useamcodec",
            value: num
        },
        id: "videoplayer.useamcodec"
    }));
    script.log("use Hardware Decoder: " + num);
}

// 设置桌面 GUI 分辨率, 已移除 GUI 中的命令, 因为会导致死机
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoscreen.resolution","value":29},"id":1}
function setDesktopResolution(num) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoscreen.resolution",
            value: num
        },
        id: "videoscreen.resolution"
    }));
    script.log("videoscreen.resolution: " + num);
}

// 使其它显示器空白显示
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoscreen.blankdisplays","value":true},"id":1}
function setBlankDisplays(bool) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoscreen.blankdisplays",
            value: bool
        },
        id: "videoscreen.blankdisplays"
    }));
    script.log("videoscreen.blankdisplays: " + bool);
}

// 允许 3:2 折刷新率：
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoscreen.whitelistpulldown","value":true},"id":1}
function setPullDown(bool) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoscreen.whitelistpulldown",
            value: bool
        },
        id: "videoscreen.whitelistpulldown"
    }));
    script.log("videoscreen.whitelistpulldown: " + bool);
}

// 允许双倍刷新率：
// {"jsonrpc":"2.0","method":"Settings.SetSettingValue","params":{"setting":"videoscreen.whitelistdoublerefreshrate","value":true},"id":1}
function setDoubleRefreshRate(bool) {
    local.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "Settings.SetSettingValue",
        params: {
            setting:"videoscreen.whitelistdoublerefreshrate",
            value: bool
        },
        id: "videoscreen.whitelistdoublerefreshrate"
    }));
    script.log("videoscreen.whitelistdou: " + bool);
}



// ============================================================================
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

    // 收听音频设备
    // if (data.id === "audiooutput.audiodevice"){
    //     listAudioDevices();
    // }

    // 处理统一 id="init" 的响应
    if (data.id === "init" && !data.error) {
        if (initStep === 2) {
            initStep = 3;
            setLoop("all");
            playListGetItems();

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

        initStep = 2;
        buildPlaylistFromM3U();

        return;
    }

    // 处理 GetItems 响应
    // 处理获取音频设备列表响应
        if (data.id === "GetAudioOutputsList" && data.result && data.result.settings) {
            audioOutputList = [];
            for (var gsi = 0; gsi < data.result.settings.length; gsi++) {
                if (data.result.settings[gsi].id !== "audiooutput.audiodevice") continue;
                var gsOpts = data.result.settings[gsi].options;
                if (!gsOpts) break;
                for (var gsoi = 0; gsoi < gsOpts.length; gsoi++) {
                    var gsLabel = gsOpts[gsoi].label;
                    var gsValue = gsOpts[gsoi].value;
                    var gsShort = gsLabel
                        .replace(new RegExp("^ALSA: "), "")
                        .replace(new RegExp(",?[ ]+CARD=[^,|]+"), "")
                        .replace(new RegExp("[ ]+\\([A-Z]+\\)"), "");
                    audioOutputList.push({ label: gsLabel, value: gsValue, shortLabel: gsShort });
                }
                script.log("Audio outputs loaded: " + audioOutputList.length);
                break;
            }
            return;
        }
        // 处理获取当前音频设备响应：切到下一个
        if (data.id === "GetCurrentAudio" && data.result && data.result.value) {
            var curValue = data.result.value;
            var curIdx = -1;
            for (var gci = 0; gci < audioOutputList.length; gci++) {
                if (audioOutputList[gci].value === curValue) { curIdx = gci; break; }
            }
            if (audioOutputList.length === 0) return;
            var nextIdx = (curIdx + 1) % audioOutputList.length;
            var next = audioOutputList[nextIdx];
            local.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "Settings.SetSettingValue",
                params: { setting: "audiooutput.audiodevice", value: next.value },
                id: "SetAudioOutput"
            }));
            script.log("Switch Audio Output: " + next.label + " (" + (curIdx+1) + " -> " + (nextIdx+1) + "/" + audioOutputList.length + ")");
            return;
        }
        // 处理切换设备响应
        if (data.id === "SetAudioOutput" && data.result) {
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
        var itemsValue = local.values.getChild("Info").getChild("Items");
        if (itemsValue) itemsValue.set(output);

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
    if (data.id === "GetPlayerProps" && data.result) {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(data.result.speed === 0);
        var loopValue = local.values.getChild("Info").getChild("isLooped");
        if (loopValue) loopValue.set(data.result.repeat === "one");
        currentLoopMode = data.result.repeat;
        var randValue = local.values.getChild("Info").getChild("Random");
        if (randValue) randValue.set(data.result.shuffled);

        return;
    }

    //
    if (data.id === "GetPlayerItem" && data.result && data.result.item) {
        var filePath = data.result.item.file;
        if (filePath == null || filePath === "") filePath = data.result.item.title;
            var fileValue = local.values.getChild("Info").getChild("File");
            if (fileValue) fileValue.set(filePath);

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
                progAccumMs = tMs;
                var progCtrl = local.values.getChild("Info").getChild("Playing");
                if (progCtrl) {
                    ignoreNextPlayingChange = true;
                    progCtrl.set(tMs / ttMs * 100);
                updatePosition(tMs, ttMs);
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
        _isPaused = false;
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
        progTotalMs = 0; progFps = 0; progAccumMs = 0;
        updatePosition(0, 0);
        queryOutputResolution();
        script.log("Kodi state: Playing");
    }
    //
    if (data.method === "Player.OnPause") {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(true);
        _isPaused = true;
        script.log("Kodi state: Paused");
    }
    //
    //
    if (data.method === "Player.OnResume") {
        var pausedValue = local.values.getChild("Info").getChild("isPaused");
        if (pausedValue) pausedValue.set(false);
        _isPaused = false;

    }
    //
    if (data.method === "Player.OnStop") {
        var fileValue = local.values.getChild("Info").getChild("File");
        if (fileValue) fileValue.set("[Stopped]");
        var progValue = local.values.getChild("Info").getChild("Playing");
        if (progValue) progValue.set(0);
        progTotalMs = 0; progFps = 0; progAccumMs = 0;
        updatePosition(0, 0);
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
// ========== Zeroconf 扫描与设备选择（跨平台，macOS 用 Python 调 dns-sd / Linux avahi-browse）==========
function scanNetwork() {
    script.log('Scan: discovering...');
    _discoveredDevices = [];
    var osMod = root.modules.getItemWithName('OS');
    if (osMod == null) {
        osMod = root.modules.addItem('OS');
        if (osMod && osMod.name !== 'OS') osMod.setName('OS');
    }

    var plat = osMod.launchProcess('uname -s', true);
    var isMac = (plat != null && plat.indexOf('Darwin') >= 0);

    var cmd = '';
    if (isMac) {
        // macOS: 写 Python 脚本到临时文件 → 执行 → 读输出 → 删文件
        var py = 'import subprocess,socket,time,re\n';
        py += 'p=subprocess.Popen(["dns-sd","-Z","_xbmc-jsonrpc-h._tcp","local"],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)\n';
        py += 'time.sleep(3)\n';
        py += 'p.terminate()\n';
        py += 'o=p.communicate()[0].decode()\n';
        py += 's=set()\n';
        py += 'for m in re.finditer(r"SRV\\s+0\\s+0\\s+(\\d+)\\s+(\\S+)",o):\n';
        py += '    h=m.group(2).rstrip(".")\n';
        py += '    n=h.replace(".local","")\n';
        py += '    try:\n';
        py += '        ip=socket.gethostbyname(h)\n';
        py += '        k=ip+":"+m.group(1)\n';
        py += '        if k not in s:\n';
        py += '            s.add(k)\n';
        py += '            print("=;"+n+";"+ip+";"+m.group(1))\n';
        py += '    except:\n';
        py += '        pass\n';
        util.writeFile('/tmp/scan_kodi.py', py, true);
        cmd = '/usr/bin/python3 /tmp/scan_kodi.py';
    } else {
        cmd = 'timeout 2 avahi-browse -p -r _xbmc-jsonrpc-h._tcp';
    }

    var output = osMod.launchProcess(cmd, true);
    if (isMac) {
        osMod.launchCommand('rm /tmp/scan_kodi.py', true);
    }
    if (output == null || output.length == 0) {
        script.log('Scan: no devices found');
        return;
    }

    var lines = output.split('\n');
    var seen = {};

    for (var li = 0; li < lines.length; li++) {
        var line = lines[li];
        if (line.length == 0 || line.charAt(0) != '=') continue;
        var parts = line.split(';');
        if (isMac) {
            if (parts.length < 4) continue;
            var name = parts[1];
            var ip = parts[2];
            var port = parts[3];
        } else {
            if (parts.length < 9) continue;
            var name = parts[3];
            var ip = parts[7];
            var port = parts[8];
        }
        var key = ip + ':' + port;
        if (seen[key] != null) continue;
        seen[key] = true;
        _discoveredDevices.push({name: name, ip: ip, port: port});
    }

    script.log('Scan: found ' + _discoveredDevices.length + ' device(s)');
    if (_discoveredDevices.length == 0) return;

    var kodis = local.parameters.getChild('kodis');
    if (kodis) {
        kodis.clear(false, true);
        for (var di = 0; di < _discoveredDevices.length; di++) {
            var dev = _discoveredDevices[di];
            var label = dev.name + ' (' + dev.ip + ':' + dev.port + ')';
            var devPath = dev.ip + ':9090';
            var p = kodis.addStringParameter('kodi' + di, label, devPath);
            p.setName('KODI ' + di);
            var t = kodis.addTrigger('select' + di, '选择并连接到这台设备: ' + dev.name);
            t.setName('Select ' + di);
        }
        kodis.setCollapsed(false);
        if (_discoveredDevices.length == 1) {
            var firstDev = _discoveredDevices[0];
            var sp = local.parameters.getChild('serverPath');
            if (sp) sp.set(firstDev.ip + ':9090');
        }
    }
}

function selectKODIDevice(index) {
    if (index < 0 || index >= _discoveredDevices.length) return;
    var dev = _discoveredDevices[index];
    var sp = local.parameters.getChild('serverPath');
    if (sp) {
        sp.set(dev.ip + ':9090');
        script.log('Selected: ' + dev.name + ' (' + dev.ip + ':9090)');
    }
    var kodis = local.parameters.getChild('kodis');
    if (kodis) kodis.setCollapsed(true);
}

// ========== 监听 Parameters 面板值变化 ==========
function scriptParameterChanged(param) {
    script.log('scriptParam: ' + param.name);
    var lc = param.name.toLowerCase();
    if (lc.substring(0, 6) === 'select') {
        var idx = parseInt(param.name.substring(6), 10);
        if (idx >= 0) {
            var kodiParam = local.parameters.getChild('kodis').getChild('kodi' + idx);
            if (kodiParam) {
                var sp = local.parameters.getChild('serverPath');
                if (sp) sp.set(kodiParam.get());
                script.log('Set serverPath: ' + kodiParam.get());
            }
        }
    }
}

function moduleParameterChanged(param) {
    var paramName = param.name;
    script.log('moduleParam: ' + paramName);
    if (paramName == null) return;
    var lc = paramName.toLowerCase();
    if (lc === 'scan') { scanNetwork(); return; }
    if (lc === 'init') {
        var infoContainer = local.values.getChild('Info');
        if (infoContainer) infoContainer.setCollapsed(false);
        init();
        return;
    }
    if (lc.substring(0, 6) === 'select') {
        var lastC = paramName.charAt(paramName.length - 1);
        var idx = parseInt(lastC, 10);
        script.log('select: dev=' + idx);
        if (idx >= 0 && idx < _discoveredDevices.length) {
            var dev = _discoveredDevices[idx];
            var sp = local.parameters.getChild('serverPath');
            if (sp) {
                sp.set(dev.ip + ':9090');
                script.log('Set serverpath: ' + dev.ip + ':9090');
            }
            var ko = local.parameters.getChild('kodis');
            if (ko) ko.setCollapsed(true);
        } else {
            script.log('Invalid idx: ' + idx + ' (len=' + _discoveredDevices.length + ')');
        }
        return;
    }
}

// ========== 监听 Values 面板值变化 ==========
function moduleValueChanged(value) {
    // 模块中的参数变化
    if (value.isParameter()) {
        var paramName = value.name;
        // 音量逻辑
        if (paramName.toLowerCase() === "volume") {
            if (ignoreNextVolumeChange) {
                ignoreNextVolumeChange = false;
                script.log("Volume change from KODI, ignoring send.");
                return;
            }
            var newVol = value.get();
            var intVol = Math.round(newVol);
            script.log("Volume slider changed: " + newVol + " -> intVol=" + intVol + ", lastSyncedVolume=" + lastSyncedVolume);
            // 
            var isMutedParam = local.values.getChild("Info").getChild("isMuted");   // 获取 values 中的 Info 容器中的子参数地址
            var wasMuted = isMutedParam && isMutedParam.get() === true;
            if (wasMuted && newVol > 0) {
                script.log("Volume adjusted while muted, unmuting first.");
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
                    var volMsg = {
                        jsonrpc: "2.0",
                        method: "Application.SetVolume",
                        params: { volume: intVol },
                        id: "SetVolume"
                    };
                    local.send(JSON.stringify(volMsg));
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
                    local.send(JSON.stringify(volMsg));
                    lastSyncedVolume = intVol;
                    script.log("Sent SetVolume command: " + intVol);
                } else {
                    script.log("Volume change too small or equal to last synced, skipping send.");
                }
            }
        // 进度条
        } else if (paramName.toLowerCase() === "playing") {
            if (ignoreNextPlayingChange) {
                ignoreNextPlayingChange = false;
                return;
            }
            var pct = value.get();
            progAccumMs = pct / 100 * progTotalMs;
            _seekPending = pct;
            _seekTimer = 0.1;
        // 
        } else {
            var cname = paramName.toLowerCase();
            if (cname === "seek") {
                seekToParameters(value.get());
            } else if (cname === "index") {
                playIndex(value.get());
            } else if (cname === "file" && value.getParent && value.getParent().name === "commands") {
                if (value.get() === "") return;
                playFile(value.get());
            } else if (cname === "mute") {
                mute(value.get());
            } else if (cname === "loop") {
                setLoop(value.get());
            } else if (cname === "random") {
                setRandom(value.get());
            } else if (cname === "debuginfo") {
                showDebugInfo(value.get());
            } else if (cname === "3d") {
                setStereoMode(value.get(), false);
            } else if (cname === "audiodevice") {
                chooseAudioOutput(value.get());
            } else if (cname == "adjust") {
                adjustRefreshRate(value.get());
            } else if(cname === "minumiseblackbars") {
                minumiseBlackBars(value.get());
            } else if(cname === "display43as") {
                display43as(value.get());
            } else if (cname === "highqualityscaler"){
                highQualityScaler(value.get() * 10);
            } else if (cname === "hardwaredecoder") {
                useHardwareDecoder(value.get());
            } else if (cname === "guiresolution") {
                setDesktopResolution(value.get());
            } else if (cname === "otherblankdisplays") {
                setBlankDisplays(value.get());
            } else if (cname === "allow32refreshrate") {
                setPullDown(value.get());
            } else if (cname === "allowdoublerefreshrate") {
                setDoubleRefreshRate(value.get());
            }
        }
    // 模块中的按钮点击
    } else {
        var tname = value.name.toLowerCase();
        if (tname === "play/pause" || tname === "play_pause") {
            var pausedVal = local.values.getChild("info").getChild("isPaused");
            var isPaused = pausedVal ? pausedVal.get() : false;
            playPause(!isPaused);
        } else if (tname === "next") {
            nextTrack();
        } else if (tname === "previous") {
            prevTrack();
        } else if (tname === "fullscreen") {
            forceFullscreenAndClean();
        } else if (tname === "showinfo") { 
            showPlayerProcessInfo();
        } else if (tname === "toggleinfo") {
            remoteControl("right");
        } else if (tname === "videocalibration") {  // 校准
            navigateCalibration();
            local.parameters.setCollapsed(true);    // 折叠 Parameters
            local.scripts.kodi.setCollapsed(true);       // 折叠 Scripts 中的 Kodi 子容器
            local.values.getChild("Info").setCollapsed(true);   // 折叠 Values 中的 Info 子容器
            // local.values.getChild("Commands").setCollapsed(true);   // 折叠 Vlaues 中的 Commands 子容器
            local.values.commands.setCollapsed(true);   // 折叠 Values 中的 Commands 子容器(不用getChild()也可以)
            local.parameters.setCollapsed(true);    // 折叠 Parameters
        } else if (tname === "up") {        // 上
            remoteControl("up");
        } else if (tname === "down") {      // 下
            remoteControl("down");
        } else if (tname === "left") {      // 左
            remoteControl("left");
        } else if (tname === "right") {     // 右
            remoteControl("right");
        } else if (tname === "enter") {     // 确定
            remoteControl("select");
        } else if (tname === "back") {      // 返回
            remoteControl("back");
            local.values.getChild("Info").setCollapsed(false);  // 展开 Info
        } 
    }
}

function messageBoxCallback(id, result) {
    if (id === 'vic_auth') {
        if (result == 1) {
            script.log('VIC: user clicked Enter Password, opening Terminal...');
            var tip = getKodiIP();
            openTerminalWithCommand('ssh-copy-id -f root@' + tip + ' && echo && echo "Done! Press Enter to close this window." && read x');
        } else {
            script.log('VIC: user cancelled SSH setup');
        }
    }
}
