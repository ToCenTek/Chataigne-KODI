# KODI 控制模块 (WebSocket)

| 项目 | 内容 |
|------|------|
| **模块名称** | KODI |
| **类型** | WebSocket Client |
| **版本** | 1.1.0 |
| **路径** | ToCenTek |
| **描述** | 通过 WebSocket 控制 KODI，基于 KODI Websocket API v13.0.0 |
| **官网** | https://kodi.wiki |

---

## 功能概览

- ✅ 从指定目录获取视频文件列表，排序后构建播放列表
- ✅ 播放控制：播放/暂停、停止、下一曲/上一曲、按索引/路径播放
- ✅ 多种跳转模式：秒数步进、百分比、绝对时间、预定义步进
- ✅ 播放模式：循环（单曲/全部/关闭）、随机播放
- ✅ 音量控制：绝对音量、±5%、静音
- ✅ 3D 模式：循环/设置 7 种 3D 模式
- ✅ 宽高比：循环切换多种宽高比
- ✅ 视频画面控制：缩放、纵向偏移、像素宽高比、非线性拉伸
- ✅ Region & Language：批量设置中文/英文、中国/英国时区、12/24 小时制
- ✅ 进度条：播放进度百分比滑块（可拖动 seek）
- ✅ 系统控制：重启 KODI、待机、重启设备、关机
- ✅ 窗口管理：激活指定窗口、强制全屏
- ✅ 通知功能：右上角弹窗通知
- ✅ 播放列表索引映射（m3u → 实际索引）

---

## 配置要求

### 1. KODI 设置

- 开启 **允许通过 HTTP 远程控制**（设置 → 服务 → 控制）
- WebSocket 端口默认为 `9090`，HTTP 端口为 `8080`
- HTTP Basic Auth（如设置）：用户名 `kodi`，密码 `tocentek`（可在模块 `defaults.serverPath` 中配置地址）

### 2. 模块配置（在 Chataigne 中）

- `Protocol`: Lines
- `autoAdd`: false
- `serverPath`: 修改为你的 KODI 设备 IP 和端口，例如 `192.168.1.100:9090`

---

## UI 参数（Values）

| 参数名 | 类型 | 读写 | 描述 |
|--------|------|------|------|
| `isPaused` | `Boolean` | 只读 | 是否已暂停 |
| `Play/Pause` | `Trigger` | 只写 | 切换播放/暂停 |
| `File` | `String` | 只读 | 当前播放的媒体文件路径 |
| `Playing` | `Float` | 读写 | 播放进度百分比 0–100，可拖动 seek |
| `Items` | `String` | 只读 | 多行文本，显示当前播放列表 |
| `isLooped` | `Boolean` | 只读 | 循环模式：`false`=不循环/循环列表，`true`=单曲循环 |
| `Volume` | `Float` | 读写 | 音量值 0.0–100.0，滑动条实时同步到 KODI |
| `isMuted` | `Boolean` | 只读 | 是否静音 |

---

## 命令（Commands）

### 主菜单

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Initialization` | `init` | 无 | 初始化：同步状态 → 获取目录文件 → 构建播放列表 → 开始播放 |
| `Send Raw JSON` | `sendJSON` | `JSON`: String | 发送原始 JSON-RPC 命令 |

### 播放控制

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Play \|\| Pause` | `playPause` | `isPaused`: Boolean | `true`=暂停，`false`=播放 |
| `Stop` | `stopPlay` | 无 | 停止播放 |
| `Next` | `nextTrack` | 无 | 下一曲 |
| `Previous` | `prevTrack` | 无 | 上一曲 |
| `Index` | `playIndex` | `Index`: Integer | 播放指定索引的媒体项 |
| `File` | `playFile` | `FilePath`: String | 播放指定路径的媒体文件 |

### 跳转 (Seek)

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Seek` | `seek` | `Step`: Integer (秒) | 快进/快退，正值向前，负值向后 |
| `Seek To Parameters` | `seekToParameters` | `Parameters`: Integer (0–100) | 按百分比跳转 |
| `Seek To Time` | `seekToTime` | `Hours`, `Minutes`, `Seconds`, `Milliseconds` | 按绝对时间跳转 |
| `Seek To Predefined` | `seekToPredefined` | `Step`: Enum | KODI 预定义步进 |

### 播放模式

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Loop` | `setLoop` | `Mode`: Enum (`one`, `all`, `off`) | 循环模式 |
| `Random` | `setRandom` | `Random`: Boolean | 随机播放 |

### 音量控制

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Set Volume` | `setVolume` | `Volume`: Integer (0–100) | 设置绝对音量 |
| `Volume UP` | `volumeUP` | 无 | 音量 +5% |
| `Volume Down` | `volumeDown` | 无 | 音量 -5% |
| `Mute` | `mute` | `Mute`: Boolean | 静音/取消静音 |

### 3D / 画面

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Cycle 3D Mode` | `cycle3DMode` | 无 | 循环切换 7 种 3D 模式 |
| `Set 3D Mode` | `set3DMode` | `Mode`: Enum, `Swap`: Boolean | 指定 3D 模式 + 交换左右眼 |
| `Cycle Aspect` | `cycleAspect` | 无 | 循环切换宽高比 |
| `Set Aspect` | `setAspect` | `Count`: Integer | 循环 N 次（同步全部 KODI） |
| `Set Zoom` | `setZoom` | `Zoom`: Float | 视频缩放 |
| `Set Vertical Shift` | `setVShift` | `Shift`: Float | 纵向偏移 |
| `Set Pixel Ratio` | `setPixelRatio` | `Ratio`: Float | 像素宽高比 |
| `Set Non-linear Stretch` | `setNonlinStretch` | 无 | 非线性拉伸开关 |

### 系统 & 通知

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Restart KODI` | `restartKODI` | 无 | 重启 KODI |
| `Standby` | `standby` | 无 | 系统待机 |
| `Reboot` | `reboot` | 无 | 重启设备 |
| `Shutdown` | `shutdown` | 无 | 关机 |
| `Show Info` | `showInfo` | `Show`: Boolean | 切换调试信息 |
| `Show Notification` | `showNotification` | `Title`, `Message`, `Displaytime`, `Image` | 右上角弹窗 |
| `Fullscreen` | `forceFullscreenAndClean` | 无 | 强制回到全屏视频 |
| `Activate Window` | `activateWindow` | `Window`: Enum | 激活指定窗口 |

### Region & Language

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Region & Language` | `setRegionLanguage` | `Chinese Language`, `Chinese Timezone`, `24H Format` | 批量设置语言/时区/时间格式 |

### 视频校准 (Calibration)

| 命令名 | 回调 | 参数 | 说明 |
|--------|------|------|------|
| `Video Calibration` | `openVideoSettings` | 无 | 打开播放中视频设置界面（内含过扫描校准） |
| `Set Overscan Zoom` | `setOverscanZoom` | `Zoom`: Integer (-20~20) | 界面缩放补偿过扫描（负值缩小，正值放大） |
| `Reset Calibration` | `resetCalibration` | 无 | 重置过扫描补偿为默认值 |

---

## 使用流程

### 首次使用

1. 确保 KODI 已开启 WebSocket 服务，配置 `serverPath`
2. 在 Chataigne 中加载模块
3. 执行 `Initialization` 命令
4. 观察日志确认初始化成功：
   ```
   Volume synced: 100
   Files: N items
   Building playlist: clearing...
   All files added to playlist, starting playback...
   Playlist: N items
   ```

### 日常操作

- **播放/暂停**：使用 `Play || Pause` 命令或 `isPaused` 值
- **音量调节**：拖动 `Volume` 滑块，或调用音量命令
- **切换视频**：`Index`、`Next`、`Previous`、`File`
- **进度跳转**：`Seek`、`Seek To Parameters`、`Seek To Time`
- **播放列表更新**：目录文件变更后，执行 `Initialization` 重建播放列表

---

## 版本历史

- **1.1.0** (2026-06-19) – 新增 3D 模式、宽高比循环、视频画面控制、Region & Language、进度条、播放列表索引映射；移除 SSH 依赖和外部脚本
- **1.0.0** (2026-06-15) – 初始发布

---

## 故障排查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 连接失败 | WebSocket 未连接 | 检查 `serverPath` 和 KODI WebSocket 服务 |
| 音量不同步 | 事件推送未开启 | KODI 设置中开启"允许事件推送" |
| 通知不显示 | KODI 版本或皮肤 | 更新 KODI 或切换至默认皮肤 Estuary |
| 激活窗口无效 | 窗口名称错误 | 尝试 `Fullscreen` 命令 |
| 文件列表为空 | 目录路径错误 | 检查 `videoDirectory` 变量（`kodi.js` 顶部） |

---

**文档结束**
