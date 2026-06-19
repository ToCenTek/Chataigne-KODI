# KODI 控制模块 (WebSocket)

| 项目 | 内容 |
|------|------|
| **模块名称** | KODI |
| **类型** | WebSocket Client |
| **版本** | 1.2.0 |
| **路径** | ToCenTek |
| **描述** | 通过 WebSocket 控制 KODI，基于 KODI Websocket API v13.0.0 |
| **官网** | https://kodi.wiki |

---

## 功能概览

- ✅ 从指定目录获取视频文件列表，排序后构建播放列表
- ✅ 播放控制：播放/暂停、停止、下一曲/上一曲、按索引/按路径播放
- ✅ 多种跳转：秒数步进、百分比、绝对时间、预定义步进
- ✅ 播放模式：循环（单曲/全部/关闭）、随机播放
- ✅ 音量控制：绝对音量、±5%、静音
- ✅ 3D 模式：循环/设置 7 种 3D 模式
- ✅ 宽高比：循环切换多种宽高比
- ✅ 视频画面：缩放、纵向偏移、像素宽高比、非线性拉伸
- ✅ Region & Language：批量设置语言/时区/时间格式
- ✅ 进度条：播放进度百分比滑块（可拖动 seek）
- ✅ 系统控制：重启 KODI、待机、重启设备、关机
- ✅ 窗口管理：激活指定窗口、强制全屏
- ✅ 通知功能：右上角弹窗通知
- ✅ 播放列表索引映射（文件 → 实际索引）
- ✅ 视频校准：按键遥控、导航到校准界面、重置校准

---

## 配置要求

### 1. KODI 设置

- 开启 **允许通过 HTTP 远程控制**（设置 → 服务 → 控制）
- WebSocket 端口默认为 `9090`，HTTP 端口为 `8080`
- HTTP Basic Auth（如设置）：用户名 `kodi`，密码 `tocentek`

### 2. 模块配置（在 Chataigne 中）

- `Protocol`: Lines
- `autoAdd`: false
- `serverPath`: 修改为你的 KODI 设备 IP 和端口，例如 `192.168.1.100:9090`

### 3. 脚本内置变量（`kodi.js` 顶部）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `videoDirectory` | `/storage/videos` | 视频文件目录，`Initialization` 从此目录读取文件列表 |

---

## UI 参数（Values）

| 参数名 | 类型 | 读写 | 描述 |
|--------|------|------|------|
| `isPaused` | `Boolean` | 只读 | 是否已暂停 |
| `Play/Pause` | `Trigger` | 只写 | 切换播放/暂停 |
| `File` | `String` | 只读 | 当前播放的媒体文件路径 |
| `Playing` | `Float` | 读写 | 播放进度百分比 0–100，可拖动 seek |
| `Items` | `String` | 只读 | 多行文本，显示当前播放列表内容 |
| `isLooped` | `Boolean` | 只读 | `false`=不循环/循环列表，`true`=单曲循环 |
| `isMuted` | `Boolean` | 只读 | 是否静音 |
| `Volume` | `Float` | 读写 | 音量值 0.0–100.0，滑动条实时同步到 KODI |

---

## 命令（Commands）

### 主菜单

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Initialization` | 触发 | 无 | 初始化：同步音量/播放状态 → 从 `videoDirectory` 获取文件列表 → 清空播放列表 → 逐条添加文件 → 开始播放 |
| `Send Raw JSON` | 事件 | JSON: String | 发送原始 JSON-RPC 命令字符串到 KODI |

### 播放控制

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Play \|\| Pause` | 事件 | `isPaused`: Boolean | true=暂停，false=播放 |
| `Stop` | 触发 | 无 | 停止播放 |
| `Next` | 触发 | 无 | 下一曲 |
| `Previous` | 触发 | 无 | 上一曲 |
| `Index` | 事件 | `Index`: Integer | 按当前播放列表中的索引播放指定媒体项 |
| `File` | 事件 | `FilePath`: String | **按路径播放文件。注意: 这会丢弃当前播放列表内容和索引映射，播放单一文件后 KODI 会结束。如需恢复列表请重新执行 Initialization。** |

### 跳转（Seek）

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Seek` | 事件 | `Step`: Integer (秒) | 快进/快退，正值向前，负值向后 |
| `Seek To Parameters` | 事件 | `Parameters`: Integer (0–100) | 按百分比跳转 |
| `Seek To Time` | 事件 | `Hours`, `Minutes`, `Seconds`, `Milliseconds` | 按绝对时间跳转 |
| `Seek To Predefined` | 事件 | `Step`: Enum | KODI 预定义步进（bigforward/smallforward/bigbackward/smallbackward） |

### 播放模式

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Loop` | 事件 | `Mode`: Enum (one/all/off) | 设置循环模式 |
| `Random` | 事件 | `Random`: Boolean | 启用/禁用随机播放 |

### 音量控制

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Set Volume` | 事件 | `Volume`: Integer (0–100) | 设置绝对音量 |
| `Volume UP` | 触发 | 无 | 音量 +5% |
| `Volume Down` | 触发 | 无 | 音量 -5% |
| `Mute` | 事件 | `Mute`: Boolean | 静音/取消静音 |

### 3D / 画面

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Cycle 3D Mode` | 触发 | 无 | 循环切换 7 种 3D 模式 |
| `Set 3D Mode` | 事件 | `Mode`: Enum, `Swap`: Boolean | 指定 3D 模式 + 交换左右眼 |
| `Cycle Aspect` | 触发 | 无 | 循环切换宽高比 |
| `Set Aspect` | 事件 | `Count`: Integer | 循环 N 次 |
| `Set Zoom` | 事件 | `Zoom`: Float | 视频缩放 |
| `Set Vertical Shift` | 事件 | `Shift`: Float | 纵向偏移 |
| `Set Pixel Ratio` | 事件 | `Ratio`: Float | 像素宽高比 |
| `Set Non-linear Stretch` | 触发 | 无 | 非线性拉伸开关 |

### 系统 & 通知

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Restart KODI` | 触发 | 无 | 重启 KODI 应用程序 |
| `Standby` | 触发 | 无 | 系统待机 |
| `Reboot` | 触发 | 无 | 重启设备 |
| `Shutdown` | 触发 | 无 | 关机 |
| `Show Info` | 事件 | `Show`: Boolean | 切换 KODI 调试信息显示 |
| `Show Notification` | 事件 | `Title`, `Message`, `Displaytime`, `Image` | 显示右上角弹窗通知 |
| `Fullscreen` | 触发 | 无 | 强制回到全屏视频 |
| `Activate Window` | 事件 | `Window`: Enum | 激活指定窗口（fullscreenvideo/home/settings 等） |

### Region & Language

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Region & Language` | 事件 | `Chinese Language`: Boolean, `Chinese Timezone`: Boolean, `24H Format`: Boolean | 批量设置语言/时区/时间格式 |

### 视频校准（Calibration）

| 命令名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| `Remote Control` | 事件 | `Action`: Enum | 发送按键/动作到 KODI。支持 ↑↓←→ Enter Back Menu OSD Info Context Menu Fullscreen Zoom 等 17 种动作 |
| `Navigate Calibration` | 事件 | `Steps`: String, `Delay`: Integer | 按逗号分隔的动作序列导航到视频校准界面。默认: `osd,left,left,left,select,select,up,select` |
| `Reset Calibration` | 触发 | 无 | 重置过扫描校准为默认值 |

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

- **播放控制**: `Play || Pause` / `Stop` / `Next` / `Previous`
- **切换视频**: `Index`（按列表索引）或 `File`（⚠ 会丢弃当前列表）
- **音量**: 拖动 `Volume` 滑块，或 `Volume UP` / `Volume Down` / `Set Volume`
- **进度**: `Seek`（秒数步进） / `Seek To Parameters`（百分比） / `Seek To Time`（绝对时间）
- **播放列表更新**: 目录文件变更后，执行 `Initialization` 重建
- **校准**: 播放视频 → `Remote Control(OSD)` → 导航 → `Remote Control(↑↓←→Enter)`

---

## 重要说明

1. **播放列表构建**  
   模块通过 `Files.GetDirectory` 读取 `videoDirectory` 中的文件列表，按文件名排序后通过 `Playlist.Add` 逐条添加到 KODI 播放列表。不依赖 .m3u 文件。

2. **`File` 命令（按路径播放）**  
   此命令直接调用 `Player.Open` 打开指定文件，**会清空当前播放列表**，导致索引映射丢失。播放结束后 KODI 不会自动恢复列表。如需回到列表播放，请重新执行 `Initialization`。

3. **音量同步**  
   初始化时自动获取当前音量。之后音量变化通过 KODI 事件自动更新到 UI。拖动 `Volume` 滑块立即发送 `SetVolume` 命令。

4. **进度条**  
   `Playing` 滑块是基于本地帧计数模拟的，非轮询。`Player.GetProperties` 仅在状态变化时触发一次用于校准。

5. **视频校准**  
   KODI 21 JSON-RPC 未暴露单方向过扫描值的直接设置接口，需通过 `Navigate Calibration` 导航到校准界面后手动调整，或用 `Remote Control` 发送按键操作。

---

## 版本历史

- **1.2.0** (2026-06-19) – 新增视频校准（Remote Control / Navigate / Reset）；清理 sync 残留和外部脚本；重构日志；文档全面补全
- **1.1.0** (2026-06-19) – 新增 3D 模式、宽高比循环、视频画面控制、Region & Language、进度条、播放列表索引映射
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
| 校准导航失败 | 皮肤不同导致菜单路径差异 | 调整 `Navigate Calibration` 的 `Steps` 参数 |

---

**文档结束**
