# KODI 控制模块 (WebSocket)

| 项目 | 内容 |
|------|------|
| **模块名称** | KODI |
| **类型** | WebSocket Client |
| **版本** | 1.0.0 |
| **路径** | ToCenTek |
| **描述** | 通过 WebSocket 控制 KODI，基于 KODI Websocket API v13.0.0 |
| **官网** | https://kodi.wiki |
| **下载地址** | "" |

---

## 功能概览

- ✅ 播放固定的 m3u 播放列表（避免顺序乱序）
- ✅ 获取视频目录文件列表并排序显示
- ✅ 实时同步音量变化
- ✅ 播放控制：播放/暂停、停止、按索引播放、按路径播放
- ✅ 多种跳转模式：秒数步进、百分比、绝对时间、预定义步进
- ✅ 播放模式：循环（单曲/全部/关闭）、随机播放
- ✅ 音量控制：绝对音量、±5%、静音
- ✅ 系统控制：重启 KODI、待机、重启设备、关机、调试信息开关
- ✅ 窗口管理：激活指定窗口（全屏视频、主界面、设置等）、强制全屏
- ✅ 通知功能：右上角弹窗通知

---

## 配置要求

### 1. KODI 设置
- 开启 **允许通过 HTTP 远程控制**（设置 → 服务 → 控制）
- WebSocket 端口默认为 `9090`，HTTP 端口为 `8080`

### 2. 模块配置（在 Chataigne 中）
- `Protocol`: Lines
- `autoAdd`: false
- `serverPath`: 修改为你的 KODI 设备 IP 和端口，例如 `192.168.1.100:9090`

### 3. 脚本内置变量（`kodi.js` 顶部）
```javascript
var videoDirectory = "/storage/videos";                                  // 视频目录
var m3uPath = "/storage/.kodi/userdata/playlists/video/videos.m3u";    // m3u 列表文件
var currentPlayerId = 1;                                                // 播放器 ID
```
> ⚠️ 请确保 `videos.m3u` 文件存在，且内部条目顺序为你期望的播放顺序。

### 4. 生成 m3u 播放列表（`coreelec.sh`）
本模块依赖一个静态 m3u 文件来控制播放顺序。模块同目录下提供了 `coreelec.sh` 脚本，用于自动生成或更新 `videos.m3u` 文件。

**脚本功能**：
- 扫描 `videoDirectory`（默认为 `/storage/videos`）中的所有视频文件
- 按照你指定的顺序（例如文件名排序、自定义列表等）生成 m3u 文件
- 自动覆盖原有的 m3u 文件，确保播放列表始终为最新状态

**使用方法**：

```bash
# 添加执行权限（如果尚未添加）
chmod +x coreelec.sh

# 运行脚本（首次生成或普通更新）
./coreelec.sh          # Linux 环境
bash coreelec.sh       # macOS 环境（避免权限问题）

# 更新播放列表（推荐使用 update 参数，可避免权限问题）
bash coreelec.sh update
```

> 💡 **说明**：
> - 在 macOS 上，直接执行 `./coreelec.sh` 可能因权限策略而失败，建议使用 `bash coreelec.sh` 或 `bash coreelec.sh update`。
> - `update` 参数会强制重新扫描目录并生成新的 m3u 文件，覆盖原有内容。
> - Linux 环境下两种方式均可，`./coreelec.sh` 更简便。

执行后，脚本会在 `/storage/.kodi/userdata/playlists/video/` 目录下生成 `videos.m3u` 文件，模块即可使用该文件进行播放。

---

## UI 参数（Values）

| 参数名 | 类型 | 读写 | 描述 |
|--------|------|------|------|
| `INIT` | `Trigger` | 只写 | 触发器，点击后执行初始化（同步音量、加载文件列表、播放 m3u） |
| `isPlaying` | `Boolean` | 只读 | 当前是否正在播放（未实现，保留） |
| `isPaused` | `Boolean` | 只读 | 是否已暂停 |
| `isLooped` | `Boolean` | 只读 | `true` = 单曲循环，`false` = 不循环（取决于 KODI 设置） |
| `Random` | `Boolean` | 只读 | 随机播放是否开启 |
| `Playing` | `String` | 只读 | 当前正在播放的文件名（来自 `Player.OnPlay` 事件） |
| `Items` | `String` | 只读 | 多行文本，显示文件列表（先排序目录，后显示实际播放顺序） |
| `isMuted` | `Boolean` | 只读 | 是否静音 |
| `Volume` | `Float` | 读写 | 音量值 (0.0–100.0)，滑动条控件，修改后实时同步到 KODI |

---

## 命令（Commands）

### 初始化

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Initialization` | `init` | 无 | 同步音量 → 获取目录 → 播放 m3u → 显示播放列表 |

### 系统 & 通知

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Send Raw JSON` | `sendJSON` | `JSON`: String | 发送原始 JSON-RPC 命令字符串 |
| `Show Notification` | `showNotification` | `Title`, `Message`(File), `Displaytime`(ms), `Image`(File) | 显示右上角通知 |
| `Restart KODI` | `restartKODI` | 无 | 仅重启 KODI 应用程序 |
| `Standby` | `standby` | 无 | 系统待机 |
| `Reboot` | `reboot` | 无 | 重启设备 |
| `Shutdown` | `shutdown` | 无 | 关机 |
| `Show Info` | `showInfo` | `Show`: Boolean | 切换 KODI 调试信息显示 |
| `Activate Window` | `activateWindow` | `Window`: Enum（见下方枚举） | 激活指定窗口 |
| `Fullscreen` | `forceFullscreenAndClean` | 无 | 模拟全屏键，强制回到全屏视频 |

**Activate Window 支持的窗口枚举**：  
`fullscreenvideo`, `home`, `systeminfo`, `settings`, `profiles`, `filemanager`, `addonbrowser`, `videos`, `movies`, `movietitles`, `moviegenres`, `tvshows`, `tvshowtitles`, `musicvideos`, `videoplaylist`, `music`, `artists`, `albums`, `songs`, `genres`, `pvr`, `programs`, `pictures`, `loginscreen`

### 播放控制

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Play \|\| Pause` | `playPause` | `isPaused`: Boolean | `true`=暂停，`false`=播放 |
| `Stop` | `stopPlay` | 无 | 停止播放，回到系统界面 |
| `Index` | `playIndex` | `Index`: Integer | 播放播放列表中指定索引的媒体项 |
| `File` | `playFile` | `FilePath`: String | 播放指定路径的媒体文件 |

### 跳转 (Seek)

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Seek` | `seek` | `Step`: Integer (秒) | 快进/快退，正值向前，负值向后 |
| `Seek To Parameters` | `seekToParameters` | `Parameters`: Integer (0-100) | 按百分比跳转 |
| `Seek To Time` | `seekToTime` | `Hours`, `Minutes`, `Seconds`, `Milliseconds` | 按绝对时间跳转 |
| `Seek To Predefined` | `seekToPredefined` | `Step`: Enum (`bigforward`, `smallforward`, `bigbackward`, `smallbackward`) | 使用 KODI 预定义步进 |

### 播放模式

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Loop` | `setLoop` | `Mode`: Enum (`one`, `all`, `off`) | 设置循环模式：单曲/全部/关闭 |
| `Random` | `setRandom` | `Random`: Boolean | 启用/禁用随机播放 |

### 音量控制

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Set Volume` | `setVolume` | `Volume`: Integer (0-100) | 设置绝对音量 |
| `Volume UP` | `volumeUP` | 无 | 音量增加 5% |
| `Volume Down` | `volumeDown` | 无 | 音量减少 5% |
| `Mute` | `mute` | `Mute`: Boolean | 静音/取消静音 |

---

## 使用流程

### 首次使用
1. 确保 KODI 已开启 WebSocket 服务，并正确配置 `serverPath`。
2. （可选）运行脚本生成初始 m3u 播放列表：
   ```bash
   bash coreelec.sh update   # macOS 推荐
   ./coreelec.sh             # Linux
   ```
3. 在 Chataigne 中加载本模块。
4. 点击 Values 面板中的 **INIT** 触发器。
5. 观察日志输出，确认初始化成功：
   ```
   Volume synced: xx
   Sorted files (UI display only): ...
   Step 3: Playing m3u playlist...
   ============ Playlist Items (actual playing order from m3u) ============
   ```

### 日常操作
- **播放/暂停**：使用 `Play || Pause` 命令或绑定 `isPaused` 切换控件。
- **音量调节**：滑动 `Volume` 滑块，或调用 `Volume UP`/`Down`/`Set Volume`。
- **切换视频**：使用 `Index` 命令跳转到播放列表中的其他视频。
- **进度跳转**：使用 `Seek`、`Seek To Parameters`、`Seek To Time` 等命令。
- **窗口管理**：若界面被其他窗口遮挡，可调用 `Fullscreen` 或 `Activate Window`（选择 `fullscreenvideo`）回到视频全屏。

### 更新播放列表
当视频目录内容发生变化（新增、删除或重命名文件）时，需要重新生成 m3u 文件：
```bash
bash coreelec.sh update   # 推荐，避免权限问题
```
然后再次点击 INIT 重新加载播放列表即可。

---

## 重要说明

1. **播放列表顺序**  
   本模块采用静态 m3u 文件方式播放，**播放顺序完全由 m3u 文件中的条目顺序决定**。模块启动时会从 `videoDirectory` 获取文件列表并按名称排序显示在 `Items` 中（仅作展示），但实际播放的是 m3u 文件内容。如需修改顺序，请直接编辑 m3u 文件或修改 `coreelec.sh` 中的排序逻辑。

2. **音量同步**  
   - 初始化时自动获取一次当前音量。
   - 之后音量变化会通过 KODI 的 `Application.OnVolumeChanged` 事件自动更新到 UI。
   - 手动滑动 `Volume` 滑块会立即发送 `SetVolume` 命令，同步到 KODI。

3. **进度条（Position）**  
   由于 KODI 不会主动推送播放进度，本模块**未实现实时进度条**。如需进度显示，可自行添加轮询调用 `Player.GetProperties`（会增加网络开销）。

4. **触发器和参数**  
   - 命令中的 `Message` 参数类型为 `File`，你可以浏览选择一个文本文件，文件内容将作为通知消息。
   - `Image` 参数可留空或填写图片文件路径（需 KODI 可访问）。

5. **兼容性**  
   基于 KODI v19+ 测试。某些 API 在旧版本上可能不可用（如 `Settings.SetSettingValue`），但大部分核心功能正常工作。

6. **脚本执行环境**  
   - **macOS**：由于安全策略，直接执行 `./coreelec.sh` 可能失败，请使用 `bash coreelec.sh` 或 `bash coreelec.sh update`。
   - **Linux**：两种方式均可，推荐直接 `./coreelec.sh`。

---

## 版本历史

- **1.0.0** (2026-06-15) – 初始发布，支持 m3u 播放、文件列表显示、音量同步、播放控制、跳转、循环、随机、系统控制、窗口管理、通知。

---

## 附录：常见 JSON-RPC 示例

```json
// 播放 m3u 列表
{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":"/storage/.kodi/userdata/playlists/video/videos.m3u"}},"id":"init"}

// 跳转到 50% 进度
{"jsonrpc":"2.0","method":"Player.Seek","params":{"playerid":1,"value":{"percentage":50}},"id":1}

// 显示通知
{"jsonrpc":"2.0","method":"GUI.ShowNotification","params":{"title":"Hello","message":"World","displaytime":3000},"id":1}
```

---

## 故障排查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 点击 INIT 无反应 | WebSocket 未连接 | 检查 `serverPath` 是否正确，KODI 是否开启 WebSocket 服务 |
| 播放列表顺序错乱 | m3u 文件顺序不符合预期 | 手动编辑 m3u 文件，或修改 `coreelec.sh` 排序逻辑后重新生成 |
| 音量无法同步 | KODI 事件推送被禁用 | 在 KODI 设置中确保“允许事件推送”开启 |
| 通知不显示 | KODI 版本过低或通知被皮肤禁用 | 更新 KODI 或切换至默认皮肤 Estuary |
| 激活窗口无效 | 窗口名称错误或当前上下文不支持 | 使用 `Fullscreen` 命令替代 |
| m3u 文件不存在 | 未运行 `coreelec.sh` | 执行 `bash coreelec.sh update` 生成播放列表 |
| macOS 执行脚本报错 | 权限或执行方式不当 | 使用 `bash coreelec.sh update` 代替 `./coreelec.sh` |

---

**文档结束**