# Chataigne 自定义模块开发手册

> **版本:** 1.0  
> **适用:** Chataigne v1.10.3  
> **JS 引擎:** JUCE 8 内置 JavaScript（ES3 子集）  
> **来源:** 基于 C++ 源码分析（`benkuper/Chataigne`、`benkuper/juce_organicui`）、官方 Notion 文档、社区模块及 KODI 模块开发经验。  
> **辅助工具:** [ScriptObjectExplorer](https://github.com/eLandon/Chataigne_ScriptObjectExplorer) — 运行时查看任意对象的方法/属性列表。

---

## 目录

1. [模块结构](#1-模块结构)
2. [module.json 完整参考](#2-modulejson-完整参考)
3. [JavaScript 引擎限制](#3-javascript-引擎限制)
4. [脚本入口函数（回调）](#4-脚本入口函数回调)
5. [ControllableContainer API](#5-controllablecontainer-api)
6. [参数/值对象 API](#6-参数值对象-api)
7. [Script 对象 API](#7-script-对象-api)
8. [Util 对象 API](#8-util-对象-api)
9. [根级对象访问](#9-根级对象访问)
10. [管理器 API](#10-管理器-api)
11. [命令回调系统](#11-命令回调系统)
12. [协议专用发送方法](#12-协议专用发送方法)
13. [协议专用接收回调](#13-协议专用接收回调)
14. [自动化 API](#14-自动化-api)
15. [映射过滤器脚本](#15-映射过滤器脚本)
16. [Parameters 与 Values](#16-parameters-与-values)
17. [设计模式与最佳实践](#17-设计模式与最佳实践)
18. [已知限制与解决方法](#18-已知限制与解决方法)
19. [扩展 Chataigne（C++）](#19-扩展-chataignec)
20. [快速参考卡](#20-快速参考卡)

---

## 1. 模块结构

```
MyModule/
├── module.json        # 模块定义（必需）
├── icon.png           # 模块图标（可选，推荐 64×64）
├── *.js               # module.json 引用的脚本文件
└── ...                # 其他资源文件
```

**安装路径:**

| 平台 | 路径 |
|------|------|
| macOS | `~/Documents/Chataigne/modules/` |
| Windows | `C:\Users\<用户>\Documents\Chataigne\modules\` |
| Linux | `~/Chataigne/modules/` |

---

## 2. module.json 完整参考

### 2.1 顶层字段

```json
{
    "name": "MyModule",                          // 必需。模块显示名称
    "type": "WebSocket Client",                  // 必需。连接类型

    "path": "Category/Subcategory",              // 模块菜单中的路径

    "version": "1.0.0",                          // 版本号
    "description": "功能描述。\n支持换行。",       // 模块浏览器中显示
    "url": "https://github.com/user/repo",        // 项目主页
    "downloadURL": "https://.../archive/main.zip",// 直接下载链接

    "hasInput": true,                            // 是否有输入值（默认 true）
    "hasOutput": true,                           // 是否有输出值（默认 true）

    "hideDefaultCommands": false,                // 隐藏默认连接命令
    "hideDefaultParameters": ["autoAdd"],        // 隐藏特定默认参数

    "defaults": { /* 协议特定覆盖 */ },
    "parameters": { /* 见 2.2 */ },
    "values":     { /* 见 2.2 */ },
    "commands":   { /* 见 2.3 */ },
    "scripts": ["script.js"]                     // JS 文件数组
}
```

**连接类型（`"type"`）:**

| 类型 | 说明 |
|------|------|
| `WebSocket Client` | 持久 WS 连接到服务器 |
| `WebSocket Server` | 接受客户端 WS 连接 |
| `TCP Client` | 持久 TCP 套接字 |
| `TCP Server` | 接受 TCP 连接 |
| `UDP Client` | UDP 通信 |
| `UDP Server` | UDP 接收器 |
| `HTTP` | HTTP 客户端 |
| `OSC` | OSC 协议 |
| `MIDI` | MIDI 输入/输出 |
| `MIDI File` | MIDI 文件播放器 |
| `Serial` | 串口 |
| `HID` | 人机交互设备 |
| `ArtNet` | Art-Net 网络 DMX |
| `DMX` | DMX 控制器 |
| `Kinect` | Microsoft Kinect |
| `Generic` | 无网络——纯逻辑模块 |

**常用 `hideDefaultParameters` 值:**

| 参数 | 说明 |
|------|------|
| `"autoAdd"` | 隐藏自动添加开关 |
| `"protocol"` | 隐藏协议选择器 |
| `"messageStructure"` | 隐藏消息结构 |
| `"firstValueIsTheName"` | 隐藏名称-值模式 |
| `"useHierarchy"` | 隐藏层级模式 |
| `"autoFeedback"` | 隐藏反馈开关 |

### 2.2 Parameters / Values — 字段类型

`parameters` 和 `values` 使用相同的结构。每个键定义一个字段或嵌套容器。

#### 快速参考表

| 类型 | JSON `"type"` | JS `.get()` 返回 |
|------|---------------|------------------|
| 容器 | `"Container"` | 子容器 (object) |
| 触发器 | `"Trigger"` | —（无存储值） |
| 布尔 | `"Boolean"` | `true` / `false` |
| 整数 | `"Integer"` | number (int) |
| 浮点 | `"Float"` | number (double) |
| 字符串 | `"String"` | string |
| 枚举 | `"Enum"` | string（选项的值） |
| 文件 | `"File"` | string（文件路径） |
| 颜色 | `"Color"` | `[R, G, B, A]` (0–1) |
| 目标 | `"Target"` | target 引用对象 |

---

#### Container（容器）

将子参数/容器分组。支持嵌套。

```json
"MyGroup": {
    "type": "Container",
    "collapsed": true,
    "childParam1": { "type": "Boolean", "default": false }
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Container"` | — | 必需。 |
| `collapsed` | Boolean | `false` | 启动时在 UI 中折叠。 |
| `index` | Integer | — | 兄弟节点中的插入位置。 |
| `userAddable` | Boolean | `false` | 显示 "+" 按钮（需 C++ 修改，见 §19）。 |

所有子字段定义为嵌套键。

---

#### Trigger（触发器）

UI 中的按钮。无存储值。点击时触发 `moduleParameterChanged()`。

```json
"MyButton": {
    "type": "Trigger",
    "description": "点击执行操作。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Trigger"` | — | 必需。 |
| `description` | String | `""` | 提示文字（`\n` 换行）。 |
| `shortName` | String | — | 脚本用的紧凑标识符。 |

---

#### Boolean（布尔）

复选框 / 开关。

```json
"MyToggle": {
    "type": "Boolean",
    "default": true,
    "description": "启用功能 X。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Boolean"` | — | 必需。 |
| `default` | Boolean | `false` | 初始状态。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值（不保存完整数据）。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### Integer（整数）

数字步进器 / 输入框。

```json
"MyCount": {
    "type": "Integer",
    "default": 5,
    "min": 0,
    "max": 100,
    "description": "条目数量。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Integer"` | — | 必需。 |
| `default` | Integer | `0` | 初始值。 |
| `min` | Integer | — | 最小值（约束）。 |
| `max` | Integer | — | 最大值（约束）。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `hexMode` | Boolean | `false` | 以十六进制显示值。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### Float（浮点）

小数输入，可选滑块样式。

```json
"MyVolume": {
    "type": "Float",
    "default": 0.5,
    "min": 0.0,
    "max": 1.0,
    "ui": "slider",
    "description": "音量级别。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Float"` | — | 必需。 |
| `default` | Float | `0.0` | 初始值。 |
| `min` | Float | — | 最小值（约束）。 |
| `max` | Float | — | 最大值（约束）。 |
| `ui` | String | — | 设为 `"slider"` 显示为滑块。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### String（字符串）

文本输入框。

```json
"MyName": {
    "type": "String",
    "default": "hello",
    "multiline": true,
    "description": "在此输入文本。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"String"` | — | 必需。 |
| `default` | String | `""` | 初始文本。 |
| `multiline` | Boolean | `false` | 允许多行输入。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### Enum（枚举）

下拉选择框。

```json
"MyMode": {
    "type": "Enum",
    "options": {
        "关闭": "off",
        "开启": "on",
        "自动": "auto"
    },
    "default": "off",
    "description": "选择模式。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Enum"` | — | 必需。 |
| `options` | Object | `{}` | **必需。** `"标签": "值"` 映射。 |
| `default` | String | — | 必须是选项的**值**（不是标签）。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### File（文件）

文件或目录浏览器。

```json
"MyFile": {
    "type": "File",
    "default": "/path/to/default.txt",
    "description": "选择文件。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"File"` | — | 必需。 |
| `default` | String | `""` | 默认文件路径。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

**注意:** 在命令参数中（非 parameters/values），`File` 类型给用户显示文件浏览器。回调接收文件路径字符串。

---

#### Color（颜色）

颜色选择器。返回/接受 RGBA 数组（0-1）。

```json
"MyColor": {
    "type": "Color",
    "default": [1.0, 0.0, 0.0, 1.0],
    "description": "选择颜色。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Color"` | — | 必需。 |
| `default` | Array | `[1,1,1,1]` | `[R, G, B, A]` 各分量 0–1。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### Target（目标）

项目中参数或容器的引用。UI 中显示目标选择器。

```json
"MyTarget": {
    "type": "Target",
    "allowedType": "parameter",
    "description": "选择目标参数。"
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"Target"` | — | 必需。 |
| `allowedType` | String | — | 限制: `"parameter"`, `"container"` 等。 |
| `allowedTarget` | String | — | 进一步限制目标类型。 |
| `default` | String | `""` | 默认目标地址。 |
| `description` | String | `""` | 提示文字。 |
| `shortName` | String | — | 紧凑标识符。 |
| `readOnly` | Boolean | `false` | 禁止用户编辑。 |
| `saveValueOnly` | Boolean | `true` | 仅保存值。 |
| `enabled` | Boolean | `true` | 初始启用/禁用。 |

---

#### 通用属性（所有类型）

每个参数类型都支持以下可选属性:

| 属性 | 类型 | 默认值 | 适用 | 说明 |
|------|------|--------|------|------|
| `description` | String | `""` | 全部 | 悬停提示文字。`\n` 换行。 |
| `shortName` | String | — | 全部 | 脚本用的紧凑标识符。JS 中用作 `.name`。未设置时使用键名。 |
| `readOnly` | Boolean | `false` | 全部 | 用户无法在 UI 中编辑。 |
| `saveValueOnly` | Boolean | `true` | 全部 | 为 false 时随项目保存完整参数元数据。 |
| `enabled` | Boolean | `true` | 全部 | 为 false 时参数初始禁用（灰色）。 |

### 2.3 命令 — 结构

```json
"commands": {
    "命令名": {
        "menu": "子菜单名",       // "" 表示根菜单
        "description": "提示文字。",
        "callback": "functionName", // 要调用的 JS 函数名
        "parameters": {
            "参数1": { "type": "Integer", "default": 0 },
            "参数2": { "type": "String", "default": "" }
        }
    }
}
```

**回调函数接收:** `(参数1, 参数2, ..., 命令索引)`

- 参数按**定义顺序**传递
- 最后一个参数是命令索引（0-based）
- 多个命令可以共享同一个回调函数
- 命令可以无参数

---

## 3. JavaScript 引擎限制

Chataigne 使用 **JUCE 8 内置 JavaScript 引擎**，约等于 **ES3**，有一些额外补充。**不是** Node.js、不是浏览器、不是现代 ES6+。

### 3.1 不可用的功能

| 功能 | 状态 | 替代方案 |
|------|:----:|----------|
| `let`, `const` | **✗** | 一律用 `var` |
| 箭头函数 `()=>{}` | **✗** | 用 `function(){}` |
| 模板字面量 `` `x${y}` `` | **✗** | `"x" + y` |
| 解构 `{a,b}=obj` | **✗** | `var a = obj.a; var b = obj.b` |
| 展开/剩余 `...args` | **✗** | 函数内用 `arguments` 对象 |
| `Promise`, `async`/`await` | **✗** | 回调、事件驱动 |
| `try`/`catch`/`finally` | **✗** | 访问前先判 `null`/`undefined` |
| `for...in` | **✗** | 用索引 `for` 循环 |
| `for...of` | **✗** | 用索引 `for` 循环 |
| 正则字面量 `/pattern/g` | **✗** | 用 `indexOf()`, `split()`, `substring()` |
| `Array.forEach/map/filter/reduce` | **✗** | 手写 `for` 循环 |
| `String.trim()` | **✗** | 手写 trim 函数（见 §3.2） |
| `String.startsWith()` | **✗** | `s.indexOf(prefix) === 0` |
| `String.endsWith()` | **✗** | `s.lastIndexOf(suffix) === s.length - suffix.length` |
| `String.includes()` | **✗** | `s.indexOf(substr) !== -1` |
| `Number.isNaN()` | **✗** | 全局 `isNaN()` |
| `Object.keys()` | **✗** | 容器上使用 `getControllables()` |
| `Date.getTime()` | **✗** | 改用 `util.getTimestamp()`（秒）或 `util.getTime()`（运行秒） |
| `Date.valueOf()` | **✗** | 用 `new Date() - 0` |
| `JSON.parse()`, `JSON.stringify()` | **✔** | 可用 |
| `parseInt()`, `parseFloat()` | **✔** | 可用 |
| `Math.*`（全部标准函数） | **✔** | 可用 |
| 标准 ES3 Array/String 方法 | **✔** | 可用 |

### 3.2 必备 Polyfill

JUCE JS 引擎是 ES3 子集，很多 ES5+ 的全局函数缺失。以下 polyfill 代码可以直接复制到模块脚本开头:

#### `trimStr(s)`

**用途:** 替代缺失的 `String.trim()`。去除字符串首尾空白字符。

```javascript
function trimStr(s) {
    if (s == null) return "";
    var start = 0, end = s.length - 1;
    while (start <= end && s.charAt(start) <= " ") start++;
    while (end >= start && s.charAt(end) <= " ") end--;
    if (start > end) return "";
    return s.substring(start, end + 1);
}
```

#### `startsWith(s, prefix)` / `endsWith(s, suffix)`

**用途:** 替代缺失的 `String.startsWith()` / `String.endsWith()`。用 `indexOf` / `lastIndexOf` 实现，无正则依赖。

```javascript
function startsWith(s, prefix) {
    return s.indexOf(prefix) === 0;
}

function endsWith(s, suffix) {
    if (suffix.length > s.length) return false;
    return s.lastIndexOf(suffix) === s.length - suffix.length;
}
```

#### `now()` — ⚠ 不可用

**原意:** 替代缺失的 `Date.getTime()`，尝试 `new Date() - 0` 获取毫秒时间戳。

**实际:** `new Date() - 0` 在 JUCE JS 引擎中**始终返回 `0`**，不可用于计时。

**替代方案:**

| 用途 | 正确方法 |
|------|---------|
| Unix 时间戳（秒） | `util.getTimestamp()` |
| 系统运行时间（秒） | `util.getTime()` |
| 增量计时 | `update(deltaTime)` 的参数 `deltaTime`（秒） |
| 帧计数 | 手动维护一个计数器（如 `progTick++`）与 `update()` 配合 |

```javascript
// ❌ 无效
var ts = new Date() - 0;  // 始终为 0

// ✅ 正确
var ts = util.getTimestamp();  // Unix 秒
```

---

## 4. 脚本入口函数（回调）

如果脚本中**定义了**这些函数，Chataigne 会自动调用。

### 4.1 模块级回调

| 方法 | 描述 |
|------|------|
| `init()` | 脚本加载完成后调用一次，用于初始化变量、日志记录 |
| `update(deltaTime)` | 按设置频率周期调用（`script.setUpdateRate(hz)`），`deltaTime` 为秒 |
| `moduleParameterChanged(param)` | Parameters 面板中参数/触发器变化时调用 |
| `moduleValueChanged(value)` | Values 面板中值变化时调用 |
| `scriptParameterChanged(param)` | `script.add*()` 创建的本地方参数变化时调用 |

```javascript
function init() {
    // 脚本已加载完毕，module.json 参数已创建，项目状态已就绪
    // 适合在此处初始化数据、读取设置、启动连接
    script.log("Script loaded successfully");
}

function update(deltaTime) {
    // deltaTime: 距上次调用的秒数（浮点数）
    // 更新频率由 script.setUpdateRate(hz) 设置，0 为禁用
    script.log("Delta time : " + deltaTime);
}

function moduleParameterChanged(param) {
    // param: 被修改的 Parameters 面板中的参数/触发器对象
    script.log("Param changed : " + param.name);
    if (param.name === "MyButton") {
        // 按钮被点击
    }
}

function moduleValueChanged(value) {
    // value: Values 面板中变化的值对象
    if (value.isParameter()) {
        script.log("Module value changed : " + value.name + " > " + value.get());
    } else {
        script.log("Module value triggered : " + value.name);
    }
}

function scriptParameterChanged(param) {
    // 仅适用于 script.add*Parameter() 添加的本地参数，不适用于 module.json 定义
    script.log("Script param changed : " + param.name);
}
```

### 4.2 消息框回调

```javascript
function messageBoxCallback(id, result) {
    // 用户对消息框做出选择后触发
    // id:     传给 show*Box() 的标识字符串
    // result: "ok" / "cancel" / "yes" / "no"
    script.log("Message box callback : " + id + " > " + result);
}
```

### 4.3 协议专用回调（完整列表见 §13）

```javascript
// WebSocket 客户端 — 收到文本消息时调用
function wsMessageReceived(client, message) {
    script.log("Message received: " + message);
}

// WebSocket — 收到二进制数据时调用
function wsDataReceived(data) {
    script.log("Data received : " + data.length);
}

// TCP / UDP / 串口（Lines 模式）— 收到一行数据时调用
function dataReceived(data) {
    script.log("Received data : " + data);
}

// OSC — 收到 OSC 消息时调用
function oscEvent(address, args, originIp) {
    script.log("OSC Message received " + address + ", " + args.length + " arguments");
}

// MIDI Note On
function noteOnEvent(channel, pitch, velocity) {
    script.log("Note on received " + channel + ", " + pitch + ", " + velocity);
}

// MIDI Note Off
function noteOffEvent(channel, pitch, velocity) {
    script.log("Note off received " + channel + ", " + pitch + ", " + velocity);
}

// MIDI Control Change
function ccEvent(channel, number, value) {
    script.log("ControlChange received " + channel + ", " + number + ", " + value);
}

// MIDI System Exclusive
function sysExEvent(data) {
    script.log("Sysex Message received, " + data.length + " bytes");
    for (var i = 0; i < data.length; i++) {
        script.log(" > " + data[i]);
    }
}

// MIDI Channel Pressure
function channelPressureEvent(channel, value) {
    script.log("Channel Pressure received " + channel + ", " + value);
}

// MIDI After Touch
function afterTouchEvent(channel, note, value) {
    script.log("After Touch received " + channel + ", " + note + ", " + value);
}

// MQTT — 收到消息时调用
function dataEvent(data, topic) {
    script.log("MQTT Message received " + topic + " : " + data);
}

// DMX — 收到一组 DMX 值时调用
function dmxEvent(values) {
    script.log("Received dmx : " + values.length + " values");
}

// HTTP — 收到响应时调用
function dataEvent(data, requestURL) {
    script.log("Data received, request URL : " + requestURL + "\nContent :\n" + data);
}

// OS 模块 — 进程非阻塞输出时调用
function processDataReceived(data, originCommand) {
    script.log("Data received", data, originCommand);
}
```

### 4.4 命令回调

命令回调由 `module.json` 中命令的 `"callback"` 字段定义。参数按命令参数定义顺序传入，最后一个是可选的命令索引:

```javascript
function myCommand(param1, param2, *[commandIndex]*) {
    // param1: 命令第 1 个参数的值
    // param2: 命令第 2 个参数的值
    // commandIndex: 可选，命令索引（从 0 开始），同一命令被多次调用时区分
    script.log("Command called: param1=" + param1 + " param2=" + param2);
    // 可返回值，供后续映射使用
    return param1;
}
```

---

## 5. ControllableContainer API

每个容器对象（`local`、`local.parameters`、`local.values`、`root.modules`、任何子容器）都暴露以下方法。

### 5.1 导航与检查

```javascript
container.getChild("name")
// 按名称返回子参数、触发器或子容器。
// 未找到时返回 null。

container.getParent()
// 返回父容器。根容器返回 null。

container.getContainers()
// 返回所有子容器的数组。
// 不包括参数或触发器。

container.getControllables(includeParameters, includeTriggers)
// 返回所有子参数和/或触发器的数组。
//   includeParameters: true/false — 是否包含非触发器参数
//   includeTriggers: true/false — 是否包含触发器
// 示例: getControllables(true, false) → 只有参数，不含触发器

container.getControlAddress([reference])
// 返回 OSC 风格的地址字符串，例如 "/module/param"
// 可选 reference: 用于相对地址的根容器

container.getScriptControlAdress()
// 返回脚本可寻址路径，例如 "local.parameters.myParam"
// 注意: API 中有拼写错误 "Adress"（一个 d）

container.isParameter()
// 如果此对象是参数（不是容器）则返回 true。
// 遍历子项时用于区分容器和参数。

container.select()
// 在 UI 面板中高亮/选中此容器。
```

### 5.2 属性（只读）

```javascript
container.name        // 短名称/脚本标识符
container.niceName    // UI 中显示的友好名称
```

### 5.3 动态添加参数（运行时）

```javascript
// 每个方法返回新创建的参数对象。

container.addTrigger(name, description)
container.addBoolParameter(name, description, default)
container.addIntParameter(name, description, default, min, max)
container.addFloatParameter(name, description, default, min, max)
container.addStringParameter(name, description, default)
container.addEnumParameter(name, description, label1, value1, label2, value2, ...)
container.addTargetParameter(name, description)
container.addPoint2DParameter(name, description)
container.addPoint3DParameter(name, description)
container.addColorParameter(name, description, default)
container.addFileParameter(name, description, directoryMode)
container.addAutomation(name)
container.addContainer(name)
```

**重要:** 通过 `container.add*()` 添加的参数是**运行时**参数，不在 module.json 中定义。项目保存/重新加载时它们会持久保存（Chataigne 序列化整个参数树），但恢复时来自保存的数据，不是来自 module.json。脚本重载时这些参数**存活**（与 `script.add*()` 参数不同，后者会被销毁重建）。

### 5.4 删除与清空

```javascript
container.removeContainer(name)   // 按名称删除子容器
container.removeParameter(name)    // 按名称删除子参数/触发器
container.clear(clearContainers, clearControllables)
// 删除所有子项。
// clearContainers: true/false（默认 true）— 是否清空子容器
// clearControllables: true/false（默认 true）— 是否清空参数/触发器
```

### 5.5 序列化

```javascript
var json = container.getJSONData()
// 返回表示此容器完整状态的 JavaScript 对象。
// 包括所有子参数的值、折叠状态等。
// 适用于保存/恢复容器状态。

container.loadJSONData(json)
// 从 JSON 对象恢复容器状态（由 getJSONData() 返回）。
```

### 5.6 UI 控制

```javascript
container.setCollapsed(value)
// true  → 在 UI 中折叠容器
// false → 在 UI 中展开容器
// 已知问题: 箭头图标变化但容器不一定实际展开。
//            用户可能需要手动点击箭头。

container.setName(name, shortName)
// 更改显示名称。可选第二个参数设置脚本标识符。
```

### 5.7 对象元数据

```javascript
container.setAttribute(key, value)
// 设置容器的元数据属性。
// 示例: param.setAttribute("saveMode", false)

param.reset()
// 将所有值重置为默认值。
```

---

## 6. 参数/值对象 API

每个参数、触发器或值对象（由 `getChild()`、`getControllables()` 或 `add*Parameter()` 返回）有:

```javascript
param.get()
// 返回当前值。
// 类型取决于参数类型:
//   Trigger   → undefined（无存储值）
//   Boolean   → true / false
//   Integer   → number (int)
//   Float     → number (double)
//   String    → string
//   Enum      → number（选项对应的值，不是标签名。例如 OS 模块中 osType: 0=Win, 1=MacOS, 2=Linux）
//   Color     → [R, G, B, A] 浮点数组 0–1
//   Target    → target 对象（或 null）
//   File      → string（文件路径）

param.set(newValue)
// 设置值。触发 UI 更新和回调函数。
// 类型必须与参数类型匹配。

param.name
// 字符串: 参数名称。

param.niceName
// 字符串: UI 显示名称。

param.isParameter()
// 返回 true（参数）或 false（容器）。

param.setAttribute(key, value)
// 设置元数据。常用属性:
//   "saveMode": false    — 不随项目保存此参数值
//   "readOnly": true     — 禁止用户编辑

param.getControlAddress()
// 返回 OSC 风格地址字符串。

param.getScriptControlAdress()
// 返回脚本控制地址（注意拼写 "Adress"）。

param.reset()
// 重置为默认值。

param.select()
// 在 UI 面板中高亮/选中。
```

### Enum 参数专用方法

```javascript
myEnumParam.get()
// 返回值取决于 Chataigne 版本:
//   1.6.x → 返回选中的 key（字符串，如 "MacOS"）
//   1.7.x → 返回选中的 data（值，如 1）
// 如果你的代码需要兼容两种版本，用 getKey() 或 getData() 替代

myEnumParam.getKey()
// 返回当前选中的 key（标签名，字符串），适用于 1.7.x
// 示例: "MacOS"

myEnumParam.getData()
// 返回当前选中的 data（值），适用于 1.6.x
// 示例: 1

myEnumParam.set(key)
// 按 key 设置选项
// 示例: myEnumParam.set("Option 1")

myEnumParam.setData(data)
// 按 data 值设置选项
// 示例: myEnumParam.setData(3)

myEnumParam.addOption(label, value)
// 动态添加选项
// 示例: myEnumParam.addOption("新选项", 42)

myEnumParam.removeOptions()
// 移除所有选项

myEnumParam.setNext([loop])
// 切换到下一个选项。loop=true 时循环（末尾跳到开头）

myEnumParam.setPrevious([loop])
// 切换到上一个选项。loop=true 时循环

myEnumParam.getAllOptions()
// 返回所有选项数组。每个元素是 {key: "...", value: ...}

myEnumParam.getOptionAt(index)
// 返回指定索引处的选项对象 {key, value}

myEnumParam.getIndex()
// 返回当前选中项的索引（从 0 开始）
```

### File 参数专用方法

```javascript
myFileParam.get()
// 返回文件路径字符串

myFileParam.getAbsolutePath()
// 返回文件的绝对路径

myFileParam.readFile([asJSON])
// 读取文件内容。asJSON=true 时解析为对象
// 示例: var content = myFileParam.readFile();
//       var obj = myFileParam.readFile(true);

myFileParam.writeFile(data, [overwriteIfExists])
// 写入文件。data 可以是字符串或对象（自动 JSON 化）
// overwriteIfExists 默认为 false

myFileParam.launchFile(arguments)
// 用系统默认程序打开文件
// 可选 arguments 字符串传递给启动的应用程序
```

---

## 7. Script 对象 API

`script` 对象代表脚本容器本身。

### 7.1 日志

```javascript
script.log("普通消息");       // 白色文本
script.logWarning("警告");     // 黄色
script.logError("错误消息");   // 红色
```

### 7.2 执行控制

```javascript
script.setUpdateRate(rateInHz)
// 设置 update() 的调用频率。
//   0  → 不调用 update()（默认）
//   30 → 每秒调用 30 次
//   事件驱动模块用 0。

script.setExecutionTimeout(seconds)
// 单次脚本执行的最大时间，超时自动终止。
// 默认: ~5 秒。防止死循环卡住 Chataigne。
```

### 7.3 文件路径

```javascript
script.getScriptDirectory()
// 返回脚本文件所在目录的绝对路径。
// 示例: "/Users/me/Documents/Chataigne/modules/MyModule"

script.getScriptPath()
// 返回脚本文件的绝对路径。
// 示例: "/Users/me/Documents/Chataigne/modules/MyModule/script.js"
```

### 7.4 环境

```javascript
script.refreshEnvironment()
// 重新同步 root、local 等环境对象。
// 动态创建/删除对象后使用，确保 JS 引用有效。
```

### 7.5 脚本本地参数

通过 `script.add*()` 添加的参数出现在**脚本编辑器自己的参数面板**中。它们**每次脚本重载时都会重建**，与 `container.add*()` 不同。

```javascript
script.addTrigger(name, desc)
script.addBoolParameter(name, desc, default)
script.addIntParameter(name, desc, default, min, max)
script.addFloatParameter(name, desc, default, min, max)
script.addStringParameter(name, desc, default)
script.addEnumParameter(name, desc, label1, val1, ...)
script.addTargetParameter(name, desc)
script.addFileParameter(name, desc, directoryMode)
script.addColorParameter(name, desc, default)
script.addPoint2DParameter(name, desc)
script.addPoint3DParameter(name, desc)
script.addAutomation(name)
```

---

## 8. Util 对象 API

`util` 对象提供系统级工具函数。

### 8.1 系统信息

```javascript
util.getAppVersion()
// 返回 Chataigne 版本字符串，例如 "1.10.3"

util.getOSInfos()
// 返回对象:
// { name: "macOS", type: "MacOSX", computerName: "...",
//   language: "zh", username: "user" }

util.getEnvironmentVariable(key)
// 返回操作系统环境变量值，例如 "PATH"

util.getTime()
// 返回系统运行时间（秒，浮点数）

util.getTimestamp()
// 返回 Unix 时间戳（秒，从 1970-01-01）
```

### 8.2 线程

```javascript
util.delayThreadMS(milliseconds)
// 阻塞脚本线程指定的毫秒数。
// 小心使用: 这会冻结 Chataigne 的脚本执行。
// 仅用于非常短的延迟 (<100ms)
```

### 8.3 文件系统

```javascript
util.fileExists(path)           // true/false
util.directoryExists(path)      // true/false

util.listFiles(path, recursive, returnNameOnly)
// 返回目录中的文件名（或完整路径）数组。
// recursive: true = 包含子目录
// returnNameOnly: true = 仅文件名，false = 完整路径

util.listDirectories(path, recursive, returnNameOnly)
// 同 listFiles，但返回目录。

util.getNonExistentFile(directory, fileName)
// 在指定目录中返回一个不存在的文件路径。
// 自动附加编号后缀以避免覆盖。

util.getFileName(path, withExtension)
// 从路径中提取文件名。
// getFileName("/a/b/c.txt", true)  → "c.txt"
// getFileName("/a/b/c.txt", false) → "c"

util.getFilePath(relativePath)
// 将相对路径解析为绝对路径（相对于项目文件）。

util.getDocumentsDirectory()     // ~/Documents
util.getDesktopDirectory()       // ~/Desktop
util.getCurrentFileDirectory()   // 当前脚本文件所在目录（模块脚本中即为模块目录）
util.getCurrentFilePath()        // .noisette 项目文件的完整路径
util.getParentDirectory(path)    // 给定路径的父目录

util.readFile(path, asJSON)
// 读取文本文件。返回字符串内容。
// 如果 asJSON 为 true，则解析 JSON 并返回对象。
// 文件不存在时返回 null。

util.writeFile(path, data, overwriteIfExists)
// 写入文件。data 可以是字符串或 JS 对象（自动 JSON 化）。
// overwrite: true = 替换现有，false = 存在则不写

util.createDirectory(folderPath)
// 创建目录（包括中间目录）。

util.launchFile(path, arguments)
// 用系统默认程序打开文件或应用程序。
// 可选 arguments 字符串传递给启动的应用程序。

util.killApp(path, hardKill)
// 按名称终止进程。
// hardKill: true = 强制终止，false = 优雅退出
```

### 8.4 数据转换

```javascript
util.getFloatFromBytes(b1, b2, b3, b4)
// 将 4 字节（大端序）转换为浮点数。

util.floatToHexSeq(float, bigEndian)
// 将浮点数转换为十六进制字符串序列。

util.getInt32FromBytes(b1, b2, b3, b4)
// 将 4 字节（大端序）转换为 int32。

util.getInt64FromBytes(b1, b2, b3, b4, b5, b6, b7, b8)
// 将 8 字节（大端序）转换为 int64。

util.doubleToHexSeq(double, bigEndian)
// 将双精度浮点数转换为十六进制字符串序列。

util.colorToHex(r, g, b, a)
// 或: colorToHex([r, g, b, a])
// 将颜色分量 (0–1) 转换为十六进制字符串:
//   "RRGGBB" 或 "AARRGGBB"

util.hexStringToInt(hexString)
// 将十六进制字符串 ("00"–"FF") 转换为整数 0–255。

util.encodeHMAC_SHA1(text, key)
// 返回 HMAC-SHA1 哈希的十六进制字符串。

util.toBase64(string)
// 将 UTF-8 字符串进行 Base64 编码。

util.fromBase64(string)
// 解码 Base64 字符串为原始数据。
```

### 8.5 剪贴板

```javascript
util.copyToClipboard(data1, data2, ...)
// 将所有参数拼接为字符串并复制到剪贴板。

util.getFromClipboard()
// 返回剪贴板内容为字符串。
```

### 8.6 UI 对话框

```javascript
util.showMessageBox(title, message, icon, buttonText)
// 简单信息对话框，只有一个按钮。
// icon: "info"（默认）、"warning"、"question"

util.showOkCancelBox(id, title, message, icon, btn1Text, btn2Text)
// 确定/取消对话框。触发 messageBoxCallback(id, result)。
// result: "ok" 或 "cancel"

util.showYesNoCancelBox(id, title, message, icon, btn1, btn2, btn3)
// 是/否/取消对话框。触发 messageBoxCallback(id, result)。
// result: "yes"、"no" 或 "cancel"
```

### 8.7 自省

```javascript
util.getObjectProperties(object, includeParams, includeObjects)
// 返回对象上可用的属性名数组。

util.getObjectMethods(object)
// 返回对象上可用的方法名数组。
```

### 8.8 网络

```javascript
util.getIPs()
// 返回所有本地 IP 地址的数组。
```

---

## 9. 根级对象访问

`root` 对象指向 Chataigne 引擎根，可访问完整运行时层次结构。

```javascript
// 模块访问
root.modules                      // 模块管理器
root.modules.getChild("Name")     // 按名称获取模块
root.modules.getItemWithName("Name") // 同上，不区分大小写

// 时间线
root.sequences                    // 序列时间线
root.mapping                      // 映射时间线

// 逻辑
root.states                       // 状态机
root.customVariables              // 自定义变量
root.masterCueManager             // Cue 管理器
root.masterAudioManager           // 音频管理器

// 引擎
root.engine                       // Chataigne 引擎属性
```

所有根属性都实现了 `ControllableContainer` API（§5）和管理器特定方法（§10）。

`local` 对象的作用域取决于脚本运行位置:

| 脚本类型 | `local` 指向 |
|----------|-------------|
| 模块脚本 | 模块本身（即 `root.modules.getItemWithName("模块名")`） |
| 条件脚本 | 条件（Condition）对象 |
| 映射过滤器/输出 | 过滤器（Filter）或输出（Output）对象 |

在模块脚本中，`local` 等同于模块对象，可通过它访问模块的参数、值和发送数据:

```javascript
local.parameters.getChild("paramName")   // 模块参数
local.values.getChild("valueName")       // 模块值
local.send(JSON.stringify({...}))        // 发送数据（对协议模块）
```

---

## 10. 管理器 API

管理器（`root.modules`、`root.customVariables`、`root.states` 等）支持所有容器方法，外加:

```javascript
manager.addItem([type])
// 添加新项目。某些管理器（Module、Layer）需要类型字符串。
// CustomVariables: addItem() → 创建新变量组

manager.removeItem(item)
// 按对象引用或名称字符串删除项目。

manager.removeAll()
// 删除所有项目。

manager.getItems()
// 返回所有项目的数组。

manager.getItemWithName(name)
// 按名称查找项目（匹配 niceName、shortName，不区分大小写）。

manager.getItemAt(index)
// 返回索引处的项目（0-based）。

manager.getItemIndex(item)
// 返回指定项目的索引。

manager.getItemBefore(item)
manager.getItemAfter(item)
// 导航: 获取相邻项目。

manager.reorderItems()
// 重新排序所有项目（程序化重排后使用）。
```

### 10.1 状态机专用

```javascript
root.states.addTransition(sourceStateName, destStateName)
// 在两个状态之间添加转换（按名称）。
```

---

## 11. 命令回调系统

### 11.1 命令如何工作

module.json 中定义的命令可从以下位置调用:
- 状态机动作
- 映射输出
- Cue 触发器
- 编排时间线
- UI（命令面板）

触发时，Chataigne 按**定义顺序**将参数值传给 `"callback"` 指定的 JS 函数。

```json
"commands": {
    "发送消息": {
        "menu": "",
        "callback": "sendMessage",
        "parameters": {
            "文本": { "type": "String", "default": "hello" },
            "次数": { "type": "Integer", "default": 1 }
        }
    },
    "播放": {
        "menu": "Player",
        "callback": "play"
    }
}
```

```javascript
function sendMessage(文本, 次数, commandIndex) {
    // 文本 = 第一个参数值
    // 次数 = 第二个参数值
    // commandIndex = 0（列表中的第一个命令）
    for (var i = 0; i < 次数; i++) {
        script.log(文本);
    }
}

function play(commandIndex) {
    // 无自定义参数，只有 commandIndex
    // commandIndex = 1（第二个命令）
}
```

### 11.2 参数链接

命令支持将参数链接到映射输入:

```javascript
command.linkParamToMappingIndex(parameter, index)
// 将命令参数链接到映射输入索引（1-based）。

command.setParamLink(parameter, linkDef)
// 使用完整定义创建链接:
// linkDef = { type: "input", value: index }
// type 可以是: "input", "index", "index0", "list"

command.unlinkParam(parameter)
// 移除参数链接。
```

---

## 12. 协议专用发送方法

`local` 对象根据模块类型提供协议特定的发送方法。

### 12.1 WebSocket / TCP / UDP / 串口（字符串）

```javascript
local.send(message)
// 通过模块连接发送字符串。
// WebSocket: 发送文本帧
// TCP/UDP: 使用配置的消息结构发送
// 串口: 作为 ASCII 发送
```

### 12.2 UDP（直接寻址）

```javascript
local.sendTo(ip, port, message)
// 向指定的 IP:端口发送字符串，忽略模块的输出配置。

local.sendBytesTo(ip, port, byte1, byte2, ...)
// 向指定的 IP:端口发送原始字节。
```

### 12.3 原始字节（串口/TCP/UDP）

```javascript
local.sendBytes(byte1, byte2, byteArray, ...)
// 发送原始字节。接受单个字节和/或字节数组。
```

### 12.4 OSC

```javascript
local.send(address, arg1, arg2, ...)
// 使用指定地址和类型化参数发送 OSC 消息。

local.sendTo(ip, port, address, arg1, ...)
// 向指定的 IP:端口发送 OSC，忽略模块配置。

local.match(address, pattern)
// 检查 OSC 地址是否匹配通配符模式。返回 true/false。

local.register(pattern, callbackFunction)
// 注册 JS 函数，当收到匹配模式的 OSC 消息时调用。
// 是全局 oscEvent() 的替代方案。
```

### 12.5 MIDI

```javascript
local.sendNoteOn(channel, pitch, velocity)
local.sendNoteOff(channel, pitch)
local.sendCC(channel, number, value)
local.sendSysex(byte1, byte2, ...)
local.sendPitchWheel(channel, value)
local.sendChannelPressure(channel, value)
local.sendAfterTouch(channel, note, value)
local.sendProgramChange(channel, program)
```

### 12.6 DMX

```javascript
local.send(startChannel, value1, value2, ..., valueN)
// 从 startChannel 开始发送 DMX 值。

local.sendUniverse(net, subnet, universe, startChannel, value1, ...)
// 向特定 Universe 发送 DMX 值。
```

### 12.7 HTTP

```javascript
local.sendGET(url, dataType, extraHeaders, payload)
local.sendPOST(url, param1, value1, ...)
local.sendPUT(url, param1, value1, ...)
local.sendPATCH(url, param1, value1, ...)
local.sendDELETE(url, param1, value1, ...)
```

### 12.8 系统（OS 模块）

```javascript
local.launchApp(appPath, arguments)
local.launchCommand(command, silentMode)
local.launchProcess(command, blocking)
// blocking: false → 非阻塞，结果通过 processDataReceived() 获取

local.getRunningProcesses()
// 返回运行中进程的名称数组。

local.isProcessRunning(process)
// 检查指定进程是否正在运行。
```

---

## 13. 协议专用接收回调

如果脚本中**定义了**这些函数，Chataigne 会自动调用。

### 13.1 OSC

```javascript
function oscEvent(address, args, originIp) {
    // address: 字符串，例如 "/track/1/volume"
    // args: 值数组（数字、字符串、blob）
    // originIp: 发送者 IP 地址字符串
}
```

### 13.2 WebSocket

```javascript
function wsMessageReceived(client, message) {
    // client: 远程端标识符
    // message: 字符串消息内容
}

function wsDataReceived(data) {
    // 二进制的 WebSocket 帧
    // data: 字节数组
}
```

### 13.3 TCP/UDP/串口（字符串协议）

```javascript
function dataReceived(data) {
    // data: 字符串（"Lines" 协议时，不包含末尾换行符）
    // data: 字节数组（原始协议时）
}
```

### 13.4 MIDI

```javascript
function noteOnEvent(channel, pitch, velocity) { }
function noteOffEvent(channel, pitch, velocity) { }
function ccEvent(channel, number, value) { }
function sysExEvent(data) { }          // data: 字节数组
function channelPressureEvent(channel, value) { }
function afterTouchEvent(channel, note, value) { }
```

### 13.5 HTTP

```javascript
function dataEvent(data, requestURL) {
    // data: 响应体字符串
    // requestURL: 请求的 URL
}
```

### 13.6 DMX

```javascript
function dmxEvent(values) {
    // values: 512 通道的 DMX 值数组（从通道 1 开始）
}
```

### 13.7 MQTT

```javascript
function dataEvent(data, topic) {
    // data: 消息载荷字符串
    // topic: MQTT 主题字符串
}
```

### 13.8 OS 模块（进程输出）

```javascript
function processDataReceived(data, originCommand) {
    // data: 启动进程的 stdout/stderr 输出
    // originCommand: 启动的命令字符串
    // 仅当 launchProcess(command, false)（非阻塞）时调用
}
```

---

## 14. 自动化 API

自动化对象（通过 `container.addAutomation()` 创建）支持:

```javascript
automation.addKey(position, value)
// 在标准化位置 (0–1) 添加关键帧。

automation.setLength(length, stretch, stickToEnd)
// 设置自动化长度。
// stretch: 保持相对关键帧位置
// stickToEnd: 保持最后一个关键帧在末端

automation.getAtPosition(position)
// 返回标准化位置 (0–1) 处的插值。

automation.getKeyAtPosition(position)
// 返回最接近指定位置的关键帧。

automation.getKeysBetween(start, end)
// 返回 start 和 end 位置（均为 0–1）之间的所有关键帧。
```

---

## 15. 映射过滤器脚本

过滤器脚本在映射的过滤器链中运行，可对输入值进行数学转换或高级逻辑处理。

### 15.1 filter() 回调

有两个版本的 `filter` 回调:

**新版 (支持多路复用/多输入):**

```javascript
function filter(inputs, minValues, maxValues, multiplexIndex) {
    // inputs:      输入值数组（多路复用时多个值）
    // minValues:   每个输入的最小值
    // maxValues:   每个输入的最大值
    // multiplexIndex: 当前多路复用通道索引
    // 必须返回与 inputs 长度相同的输出值数组
    var result = [];
    for (var i = 0; i < inputs.length; i++) {
        result[i] = inputs[i];  // 直通
    }
    return result;
}
```

**旧版 (单输入):**

```javascript
function filter(inputValue, min, max) {
    // inputValue:  来自输入或前一个过滤器的值
    // min, max:    inputValue 的范围
    // 必须返回一个值
    return inputValue;
}
```

> ⚠ 新版推荐: 旧版签名已不再更新，过滤器现在原生支持多路复用和多输入。

### 15.2 脚本参数

过滤器脚本中可用 `script.add*()` 添加参数，参数出现在过滤器参数面板中:

```javascript
var multiplier = script.addFloatParameter("Multiplier", "乘数", 2, 0, 10);
```

### 15.3 完整示例

[动图: 创建一个映射 → 添加 Script 过滤器 → 配置参数]

以下示例从自定义变量读取 `masterVolume`，将淡入淡出序列的输出从 [0;1] 重新映射到 [0; masterVolume]:

```javascript
var multiplier = script.addFloatParameter("Multiplier", "乘数", 2, 0, 10);

function filter(inputs, minValues, maxValues, multiplexIndex) {
    var result = [];
    for (var i = 0; i < inputs.length; i++) {
        result[i] = inputs[i] * multiplier.get();
    }
    return result;
}
```

> 💡 提示: 在 Chataigne 中右键参数 → **Copy Script Control Address** 可快速获取脚本地址，然后用 `.get()` 读取当前值。

---

## 15a. 条件脚本

条件脚本用于复杂或多步骤的判断逻辑。

### 特定方法

```javascript
local.setValid(true);   // 将条件设为有效（激活）
local.setValid(false);  // 设为无效
```

[动图: 在条件中选择 Script 类型 → 编写条件脚本]

---

## 16. Parameters 与 Values

| 方面 | Parameters | Values |
|------|------------|--------|
| **用途** | 用户配置 | 运行时数据/反馈 |
| **谁修改** | 用户在 UI 中编辑 | 脚本从设备更新 |
| **随项目保存** | 是（总是） | 是（除非 `saveValueOnly: false`） |
| **随预设保存** | 是 | 是（每个预设单独保存） |
| **回调** | `moduleParameterChanged()` | `moduleValueChanged()` |
| **UI 位置** | 模块 Parameters 面板 | 模块 Values 面板 |
| **可有触发器** | 是 | 是 |
| **默认折叠** | `"collapsed": true/false` | `"collapsed": true/false` |
| **只读** | `"readOnly": true` | `"readOnly": true` |

**设计原则:**

```
PARAMETERS: 用户在演出前/演出中配置的内容
             → IP 地址、端口、启用开关、阈值

VALUES:     模块从设备读取的内容
             → 播放位置、音量、状态、传感器读数
```

---

## 17. 设计模式与最佳实践

### 17.1 单文件规则

> **关键:** `"scripts"` 数组中的多个脚本文件**不共享函数作用域**。
> 每个文件运行在自己的隔离作用域中。
> 把所有逻辑放在**一个文件**里。

```json
"scripts": ["kodi.js"]    // ← 单个文件
```

### 17.2 事件驱动优于时间驱动

避免 `update(deltaTime)`。使用协议/事件回调:

```
设备 → WebSocket → wsMessageReceived()
                       ↓
               处理数据并更新 Values
                       ↓
               推进状态机
```

对于周期性任务（轮询），使用回调驱动的状态机，而不是 `update()`。

### 17.3 空安全访问

每次 `getChild()` 都可能返回 `null`。始终先检查:

```javascript
function safeGet(container, name) {
    if (container == null) return null;
    return container.getChild(name);
}

function safeVal(param, fallback) {
    if (param == null) return fallback;
    return param.get();
}

// 使用:
var vol = safeVal(safeGet(local.values, "Volume"), 0);
```

### 17.4 命名规范

由于 JS 没有模块系统，使用前缀避免冲突:
- 容器名: `"Info"`、`"Synchronizer"`（PascalCase）
- 参数名: `"Sync Enabled"`、`"HTTP User"`（自然语言）
- JS 函数: `reloadSyncSettings()`、`sendAll()`（camelCase）
- JS 变量: `syncEnabled`、`secondaryIps`（camelCase）

### 17.5 日志模式

```javascript
// 版本
script.log("Module v" + version + " loaded");

// 初始化
script.log("init(): starting...");

// 参数变化
script.log("moduleParameterChanged: " + param.name + " = " + param.get());

// 错误
if (data == null) { script.logError("Received null data"); return; }

// 警告
if (val < 0) { script.logWarning("Negative value: " + val); }
```

### 17.6 模块发现

```javascript
// 检查 OS 模块是否存在
var osMod = root.modules.getChild("OS");
if (osMod == null) {
    script.logWarning("未找到 OS 模块，创建一个并命名为 'OS'");
}

// 检查其他自定义模块
var other = root.modules.getItemWithName("MyOtherModule");
```

### 17.7 启动顺序模式

```javascript
var initStep = 0;  // 0 = 空闲, 1 = 加载中, 2 = 就绪

function init() {
    initStep = 1;
    loadSettings();
    connect();
}

function connect() {
    // 发送初始化消息
    local.send(JSON.stringify({...}));
}

function wsMessageReceived(message) {
    var data = JSON.parse(message);
    // ... 处理 ...
    if (initStep === 1) {
        initStep = 2;
        script.log("模块就绪");
    }
    advanceStateMachine(data);
}
```

### 17.8 条件同步模式

```javascript
var syncEnabled = false;

function startSync() {
    if (!syncEnabled) return;
    // ... 开始同步循环 ...
}

function moduleParameterChanged(param) {
    if (param.name === "Sync Enabled") {
        syncEnabled = param.get();
        if (syncEnabled) startSync();
        else stopSync();
    }
}
```

---

## 18. 已知限制与解决方法

### 18.1 `userCanAddControllables` 无法设置

**问题:** C++ 标志 `ControllableContainer::userCanAddControllables` 控制容器标题栏是否显示 "+" 按钮，用于动态添加/删除条目。此标志无法从 module.json 或 JavaScript 设置——需要修改 C++ 代码。

**解决方法:** 修改 `Chataigne/Source/Module/Module.cpp`（见 §19.1）。

### 18.2 `setCollapsed()` 视觉缺陷

**问题:** `container.setCollapsed(false)` 更改箭头图标，但容器可能不会实际展开。用户可能需要手动点击箭头。

**状态:** Chataigne 已知问题（通过 OrganicUI）。无解决方法。

### 18.3 `launchProcess` 限制

**问题:** `helper.launchProcess(cmd)` 按空格分割命令字符串（无 shell 解析）。Shell 功能（`>`, `|`, `&&`, `;`、内置命令）**不生效**，即使第二个参数为 `true`。

**解决方法:** 打开文件/应用用 `util.launchFile()`。复杂命令请编写 shell 脚本并执行。

### 18.4 OS 模块名称依赖

**问题:** 使用 `root.modules.getChild("OS")` 时，OS 模块必须恰好命名为 "OS"（默认名）。用户重命名后脚本就会失效。

**解决方法:** 把期望的名称存储为模块参数，让用户可以配置。

### 18.5 无 `try/catch` 错误处理

**问题:** 没有异常处理机制。任何运行时错误都会静默停止脚本。

**解决方法:** 使用前验证所有输入:
- `JSON.parse()` 输入 → 确保是有效的 JSON（检查 null）
- 文件路径 → 先用 `util.fileExists()` 检查
- 数组索引 → 先检查 `.length`
- WebSocket 消息 → 检查每个属性是否为 null

**JSON 验证模式:**
```javascript
function safeParse(str) {
    if (str == null || str === "") return null;
    // 无法使用 try/catch。手动检查基本结构
    if (str.charAt(0) !== "{" && str.charAt(0) !== "[") return null;
    return JSON.parse(str);
}
```

### 18.6 `for...in` 不可用

**问题:** 无法遍历对象属性。

**解决方法:** 对于 Chataigne 容器子项，使用 `getContainers()` 和 `getControllables()`。对于工具对象，使用 `util.getObjectProperties()`。对于手动数组，使用索引 `for` 循环。

### 18.7 `Date.getTime()` 不可用

**问题:** JUCE 的 Date 对象在 JS 引擎中不支持 `getTime()` 或 `valueOf()`。`new Date() - 0` **始终返回 `0`**，不可用于计时（详见 §3.2）。

**解决方法:** 改用 `util.getTimestamp()`（Unix 秒）或 `util.getTime()`（系统运行秒）。增量计时用 `update(deltaTime)` 的 `deltaTime` 参数。

### 18.8 API 拼写错误

**问题:** `getScriptControlAdress()` 拼写错误（一个 'd'，应为 `getScriptControlAddress`）。

**解决方法:** 使用确切的 API 拼写: `getScriptControlAdress()`。

### 18.9 多脚本作用域隔离

**问题:** 一个脚本文件中定义的函数和变量**不能**从同一模块的另一个脚本文件访问。

**解决方法:** 把所有代码放在一个脚本文件中。

### 18.10 自定义模块无内置 HTTP

**问题:** 自定义模块（WebSocket、TCP 等）的 `local.send*()` 没有内置 HTTP 方法。

**解决方法 A — 用其他 Chataigne 模块:** 在项目中添加任意内置模块（HTTP、OSC、MIDI 等），在脚本中通过 `root.modules` 控制它:

```javascript
var httpMod = root.modules.getChild("HTTP");
if (httpMod != null) {
    httpMod.parameters.getChild("baseAddress").set("http://192.168.1.100");
    // ... 配置并在 HTTP 模块上触发命令
}
```

任何 Chataigne 内置模块都可以这样用——只要有对应模块，就不需要 OS 级命令。

**解决方法 B — OS 模块 + curl:** 对于简单的即发即忘请求，不需要配置额外模块:
```javascript
var osMod = root.modules.getChild("OS");
if (osMod && osMod.launchProcess) {
    osMod.launchProcess("curl -s --max-time 3 'http://192.168.1.100/api'");
}
```

**注意:** OS 模块方式不能解析响应。需要请求/响应模式的场景请用 HTTP 模块。

---

## 19. 扩展 Chataigne（C++）

以下修改需要从源码重新编译 Chataigne。

### 19.1 为 module.json 添加 `userAddable` 支持

**文件:** `Chataigne/Source/Module/Module.cpp`
**函数:** `Module::createControllablesForContainer()`

在容器创建处（`if (p.value.getProperty("type", "") == "Container")` 块内，约第 300 行）找到:

```cpp
// 在这行之后:
childCC->editorIsCollapsed = p.value.getProperty("collapsed", false);

// 添加这行:
childCC->userCanAddControllables = p.value.getProperty("userAddable", false);
```

然后在 module.json 中使用:
```json
"KODIs": {
    "type": "Container",
    "userAddable": true
}
```

**效果:** 容器标题栏显示 "+" 按钮。点击后弹出参数类型菜单，用户添加条目（IP:port 用 String），每条有 "✕" 删除按钮。

### 19.2 向 JavaScript 暴露 C++ 属性

**模式**（在 `ControllableContainer.cpp` 构造函数中）:
```cpp
scriptObject.getDynamicObject()->setMethod("methodName",
    [](const juce::var::NativeFunctionArgs& a) -> juce::var {
        auto* cc = ScriptTarget::getObjectFromJS<ControllableContainer>(a);
        if (cc == nullptr) return juce::var();
        // ... 实现 ...
        return juce::var(result);
    });
```

要向 JS 暴露 `userCanAddControllables`:
```cpp
// 在 ControllableContainer 构造函数中:
scriptObject.getDynamicObject()->setMethod("setUserAddable",
    [](const juce::var::NativeFunctionArgs& a) -> juce::var {
        auto* cc = ScriptTarget::getObjectFromJS<ControllableContainer>(a);
        if (cc == nullptr || a.arguments.size() < 1) return juce::var();
        cc->userCanAddControllables = (int)a.arguments[0] > 0;
        return juce::var();
    });
```

### 19.3 C++ 源文件映射

| C++ 文件 | 绑定的内容 |
|----------|-----------|
| `juce_organicui/controllable/ControllableContainer.cpp` | 所有容器方法（§5） |
| `juce_organicui/script/ScriptTarget.cpp` | Script 对象方法（§7） |
| `Chataigne/Source/Module/Module.cpp` | 模块回调、`local.send()`、命令分发 |
| `Chataigne/Source/Module/ModuleManager.cpp` | 管理器方法（§10） |
| `juce_organicui/script/ScriptUtil.cpp` | `util` 对象方法（§8） |

---

## 20. 快速参考卡

### module.json 骨架

```json
{
    "name": "MyModule",
    "type": "WebSocket Client",
    "path": "Custom",
    "version": "1.0.0",
    "description": "功能描述。",
    "hideDefaultCommands": true,
    "parameters": { "容器": { "type": "Container",
        "按钮": { "type": "Trigger" }
    }},
    "values": { "状态": { "type": "String", "readOnly": true }},
    "commands": { "执行": {
        "menu": "",
        "callback": "doThing",
        "parameters": { "次数": { "type": "Integer", "default": 1 }}
    }},
    "scripts": ["script.js"]
}
```

### JS 入口函数

```javascript
function init() { /* 启动 */ }
function update(dt) { /* 避免 */ }
function moduleParameterChanged(p) { /* 参数变了 */ }
function moduleValueChanged(v) { /* 值变了 */ }
function wsMessageReceived(c, m) { /* WS 消息 */ }
function messageReceived(d) { /* TCP/UDP/串口 */ }
function oscEvent(a, args, ip) { /* OSC */ }
function dataReceived(d) { /* TCP/UDP/串口 */ }
function dataEvent(d, src) { /* HTTP/MQTT */ }
function noteOnEvent(ch, p, v) { /* MIDI */ }
function processDataReceived(d, cmd) { /* OS */ }
```

### 容器方法速查

```javascript
c.getChild("name")                    // 获取子项
c.getParent()                         // 获取父项
c.getContainers()                     // 所有子容器
c.getControllables(true, true)        // 所有参数 + 触发器
c.addContainer("name")                // 添加子容器
c.addStringParameter("n","d","def")   // 添加字符串参数
c.addIntParameter("n","d",0,0,100)    // 添加整数参数
c.addTrigger("n","d")                 // 添加触发器按钮
c.removeContainer("name")             // 删除容器
c.removeParameter("name")             // 删除参数
c.setCollapsed(true/false)            // 折叠/展开
c.select()                            // 在 UI 中选中
```

### 参数方法速查

```javascript
p.get()                               // 获取值
p.set(val)                            // 设置值
p.name                                // 名称
p.niceName                            // 显示名
p.isParameter()                       // 是否为参数
```

### Script 方法速查

```javascript
script.log("消息")                     // 日志
script.logWarning("警告")              // 黄色日志
script.logError("错误")                // 红色日志
script.setUpdateRate(0)                // 禁用 update()
script.getScriptDirectory()           // 脚本文件夹路径
```

### Util 方法速查

```javascript
util.readFile(p)                      // 读取文本文件
util.writeFile(p, d, true)            // 写入文本文件
util.fileExists(p)                    // 检查文件存在
util.listFiles(d, true, false)        // 列出文件
util.getOSInfos()                     // 系统信息对象
util.showMessageBox(t, m, "info","OK")// 对话框
util.launchFile(p)                    // 用系统程序打开
util.getTimestamp()                   // Unix 时间戳
```

### 跨模块访问

```javascript
var m = root.modules.getChild("Name")
var p = m.parameters.getChild("Param")
p.get()
```

### 时间戳（JUCE 安全）

```javascript
var now = new Date() - 0;             // 自 epoch 起的毫秒数
```

### 安全访问模式

```javascript
function sv(param, fallback) {
    return param ? param.get() : fallback;
}
function sg(container, name) {
    return container ? container.getChild(name) : null;
}
```

---

*手册结束*
## 2. ES3 限制（JUCE JavaScript 引擎）

Chataigne 基于 JUCE 框架，其 JavaScript 引擎仅支持 **ES3 子集**。以下语法**不支持**：

### ❌ 不支持

```javascript
// ES6 语法全部不支持
let x = 1;              // 必须用 var
const y = 2;            // 必须用 var
() => {}                // 箭头函数
`模板字符串 ${x}`       // 模板字面量
class Foo {}            // 类
Promise / async / await // 异步
try { } catch(e) { }    // 异常捕获
for (let x of arr) {}   // for...of
for (let x in obj) {}   // for...in（部分支持）
[...arr]                // 解构
{x, y} = obj            // 解构赋值
import / export         // 模块导入
Symbol / Map / Set      // ES6 类型
Array.includes()        // ES7+
String.trim()           // ES5+（可用 split+join 替代）
String.startsWith()     // ES6+
```

### ✅ 支持

```javascript
var x = 1;              // var 声明
function foo() {}       // 函数声明
if / else / for / while // 控制流
=== / !==              // 严格比较
|| / &&                // 逻辑运算
+ - * / %              // 算术运算
typeof / instanceof    // 类型检查
JSON.stringify()       // JSON 序列化（Chataigne 扩展支持）
JSON.parse()           // JSON 解析
Array.push() / pop() / splice()
String.substring() / indexOf() / charAt() / split() / length
Object.keys()          // 可能不支持
```

## 3. 脚本 API 参考

### 3.1 全局函数（脚本中直接定义）

#### `init()`
脚本加载完成后调用一次。

```javascript
function init() {
    script.log("Module loaded");
    var p = local.parameters.getChild("myParam");
    if (p) var val = p.get();
}
```

#### `update(deltaTime)`
定时调用，频率由 `script.setUpdateRate(rate)` 设置（rate = Hz）。

```javascript
function update(deltaTime) {
    // deltaTime 单位为秒
    // 每 tick 执行一次
}
```

#### `moduleValueChanged(value)`
当 value 面板中的参数值变化时调用。

```javascript
function moduleValueChanged(value) {
    if (value.isParameter()) {
        var name = value.name.toLowerCase();
        if (name === "volume") {
            var newVal = value.get();
        }
    } else {
        // 触发器被点击
    }
}
```

#### `moduleParameterChanged(param)`
当 parameters 面板中的参数变化时调用（含触发器）。

```javascript
function moduleParameterChanged(param) {
    var name = param.name;
    if (name === "MyTrigger") {
        // 触发器被点击
    }
}
```

#### `wsMessageReceived(message)`
WebSocket 类型模块收到消息时调用。

```javascript
function wsMessageReceived(message) {
    var data = JSON.parse(message);
    if (data.id === "SomeId") {
        // 处理响应
    }
}
```

#### `dataReceived(data)`
UDP/Serial 类型模块收到数据时调用。data 为字符串，无需 `.toString()`。

```javascript
function dataReceived(data) {
    script.log("收到: " + data);
    // data 已经是字符串，不要再调用 .toString()
}
```

#### `oscEvent(address, args, originIp)`
OSC 类型模块收到 OSC 消息时调用。

#### `dataEvent(data, requestURL)`
HTTP 类型模块收到响应时调用。

### 3.2 全部 API 参考表

#### 生命周期回调

| 函数 | 触发时机 | 说明 |
|------|---------|------|
| `init()` | 脚本加载、参数创建后 | 读取配置、发握手、初始化数据 |
| `update(deltaTime)` | 按 `setUpdateRate(Hz)` 频率 | 定时任务，deltaTime 单位为秒 |
| `moduleCleanedUp()` | 模块销毁时 | 关闭连接、释放资源 |

#### 值/参数变化回调

| 函数 | 触发时机 | 说明 |
|------|---------|------|
| `moduleValueChanged(value)` | values 面板中的值变化 | value.isParameter() 区分参数/触发器 |
| `moduleParameterChanged(param)` | parameters 面板中的值变化 | 含 Trigger 点击 |

#### 协议接收回调

| 函数 | 适用模块类型 | data 类型 | 说明 |
|------|------------|-----------|------|
| `dataReceived(data)` | UDP / TCP / Serial | **String** | 收到数据。**data 已是字符串，不要调用 .toString()** |
| `wsMessageReceived(message)` | WebSocket Client | String | 收到文本消息 |
| `wsDataReceived(data)` | WebSocket Client | 二进制 | 收到二进制数据 |
| `oscEvent(address, args, originIp)` | OSC | - | 收到 OSC 消息 |
| `dataEvent(data, requestURL)` | HTTP | String | HTTP 响应到达 |
| `processDataReceived(data, cmd)` | OS Module | String | OS 模块进程输出 |
| `noteOnEvent(channel, pitch, velocity)` | MIDI | - | MIDI Note On |
| `ccEvent(channel, number, value)` | MIDI | - | MIDI CC |

#### 连接状态回调

| 函数 | 适用类型 |
|------|---------|
| `wsConnected()` / `wsDisconnected()` | WebSocket Client |
| `tcpConnected()` / `tcpDisconnected()` | TCP Client/Server |

#### 发送方法（`local.*`）

| 方法 | 适用类型 | 说明 |
|------|---------|------|
| `local.send(message)` | WebSocket / UDP / OSC | 通过模块输出配置发送 |
| `local.sendTo(ip, port, message)` | **UDP 专用** | 直接发到指定 IP:port，**忽略输出配置** |
| `local.sendBytesTo(ip, port, b1, b2, ...)` | UDP | 发送字节到指定地址 |
| `local.sendGET(url)` | HTTP | GET 请求 |
| `local.sendPOST(url, data)` | HTTP | POST 请求 |

`local.sendTo()` 是 UDP 模块发送的首选方式。它不需要配置 remoteHost/remotePort，直接指定目标。

#### `script` 对象

| 方法 | 说明 |
|------|------|
| `script.log(msg)` | 输出到 Chataigne 日志 |
| `script.setUpdateRate(Hz)` | 设置 update() 调用频率 |
| `script.showDialog(title, msg)` | 显示对话框（可能不存在） |
| `script.addFileParameter(name, desc)` | 动态添加文件参数 |
| `script.sharedData` | 模块间共享数据 |

#### `local` 对象

`local` 指向当前模块实例。

| 表达式 | 说明 |
|--------|------|
| `local.parameters` | 自定义参数容器（module.json 中定义的） |
| `local.values` | 自定义值容器（module.json 中定义的） |
| `local.outputs` | 模块输出（可能为 null） |

#### `local.parameters` / `local.values` 子项方法

| 方法 | 说明 |
|------|------|
| `.getChild("name")` | 按名称获取子项 |
| `.get()` | 获取当前值 |
| `.set(val)` | 设置值 |
| `.name` | 脚本名称 |
| `.niceName` | UI 显示名称 |
| `.isParameter()` | true=参数, false=触发器 |
| `.getControlAddress()` | 获取控制地址 |
| `.setAttribute("key", val)` | 设置属性（readonly, enabled 等） |

**注意：** 容器不支持 `getChild(index)`（数字索引），也不支持 `getItems()`。只能通过 `getChild("name")` 按名称访问。

#### `util` 对象

| 方法 | 说明 |
|------|------|
| `util.readFile(path)` | 读取文件内容 |
| `util.readFile(path, true)` | 读取并解析为 JSON |
| `util.writeFile(path, data, overwrite)` | 写入文件 |
| `util.listFiles(path)` | 列出目录文件 |
| `util.getCurrentFileDirectory()` | 获取会话文件目录 |
| `util.launchFile(path, args)` | 启动文件 |
| `util.getFileName(path)` | 获取文件名 |
| `util.getParentDirectory(path)` | 获取父目录 |

#### `root` 对象

| 方法 | 说明 |
|------|------|
| `root.modules.getChild("name")` | 按名称获取模块 |
| `root.modules.getItemWithName("name")` | 按友好名称查找 |
| `root.modules.addItem("UDP")` | 创建**空白内置模块**（不是社区模块） |
| `root.modules.removeItem(module)` | 删除模块 |

### 3.3 内置 UDP 参数说明

UDP 类型模块具有以下内置参数。它们**不属于** `local.parameters`（后者只包含 module.json 中自定义的），而是在模块的 C++ 协议层中。

| 参数名 | UI 位置 | 类型 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| `localPort` | Parameters → Input → Local Port | Int | 10000 | UDP 接收端口 |
| `remoteHost` | Parameters → Output → Remote Host | String | 255.255.255.255 | 目标地址 |
| `remotePort` | Parameters → Output → Remote Port | Int | 8888 | 目标端口 |
| `broadcast` | Parameters → Output → Broadcast | Bool | false | 启用广播模式 |
| `autoAdd` | Parameters → Auto Add | Bool | false | 自动添加 |

**关键限制：** `local.parameters.getChild("localPort")` **返回 null**。脚本中无法直接访问这些内置参数。

**解决方案：** 在 module.json 中自定义一个参数来让用户配置，脚本通过自定义参数读写。

```json
"parameters": {
    "Receive Port": {
        "type": "Integer",
        "default": 9528
    }
}
```

```javascript
// 脚本中通过自定义参数访问
var rp = local.parameters.getChild("Receive Port");
var port = rp.get(); // 用户设置的端口
```

**`hideDefaultParameters: false`** 会让这些内置参数在 UI 中可见，但脚本仍无法访问它们。

## 4. `execShell` 与 `launchProcess`

### 4.1 工作原理

```javascript
function execShell(cmd) {
    var helper = root.modules.getChild("OS");
    if (helper == null) return false;
    if (helper.launchProcess) {
        helper.launchProcess(cmd); // 异步执行
        return true;
    }
    return false;
}
```

### 4.2 关键限制

`launchProcess(cmd)` 将命令字符串**按空格分割**成 argv 数组然后执行。这意味着：

- ❌ **不支持 shell 特性**：`|` `>` `<` `&&` `||` `$VAR` 都会被当作普通参数传给程序
- ❌ **不支持引号**：`echo "hello world"` 会被分割成 `echo`、`"hello`、`world"`（三个参数）
- ✅ **程序名与每个参数之间不能有空格**

### 4.3 实例

```javascript
// ✅ 正确：每个参数无空格
execShell("/usr/bin/curl -s http://10.0.0.53:8080/jsonrpc");

// ✅ 正确：JSON 使用 compactJson 去掉空格
var json = JSON.stringify(msg);
json = json.split(" ").join(""); // 移除所有空格
execShell("/usr/bin/curl -d " + json + " http://host");

// ❌ 错误：import socket 有空格
execShell("/usr/bin/python3 -c import socket;s.sendto()"); // import 和 socket; 被分割

// ✅ 正确：用 __import__ 替代 import（无空格）
execShell("/usr/bin/python3 -c __import__('socket');s=...");

// ❌ 错误：使用 echo 重定向到文件
execShell("echo hello > /tmp/file.txt"); // > 被当作参数传给 echo

// ✅ 正确：用 util.writeFile 写文件
util.writeFile("/tmp/script.py", code, true);
execShell("/usr/bin/python3 /tmp/script.py");
```

## 5. UDP 模块注意事项

### 5.1 发送与接收端口

- **发送端口**：由 OS 自动分配（随机高位端口）
- **接收端口**：由模块的 `localPort` 参数指定
- 两者**不需要**相同
- 插件回 ACK 时，需要知道模块的接收端口

### 5.2 ACK 反馈机制

```javascript
// 模块端：告诉插件用哪个端口发 ACK
function sendPort() {
    for (var i = 0; i < allIps.length; i++) {
        local.sendTo(allIps[i], 9527, "PORT:" + rcvPort + "\n");
    }
}

// 插件端：接收 PORT 命令后存储端口
// 发 ACK 时：sock.sendto("ACK:CMD\n", (senderIP, ACK_PORT))
```

### 5.3 local.send vs local.sendTo

```javascript
local.send(msg)                 // 用模块输出的配置发送
local.sendTo(ip, port, msg)     // 直接发到指定 IP:port（忽略输出配置）
```

- `local.sendTo` 是 UDP 发送命令的首选方式
- 它可以直接指定目标地址和端口
- 不需要配置模块的 remoteHost/remotePort

## 6. 参数访问规则

| 参数来源 | 访问方式 | 说明 |
|---------|---------|------|
| module.json 中定义的 parameters | `local.parameters.getChild("name")` | ✅ 可读写 |
| module.json 中定义的 values | `local.values.getChild("name")` | ✅ 可读写 |
| 内置 UDP 参数（localPort 等） | `local.parameters.getChild("name")` | ❌ 不可访问 |
| 嵌套容器中的参数 | `local.parameters.getChild("父容器").getChild("参数名")` | ✅ 嵌套容器可访问 |

## 7. 常用模式

### 7.1 防死循环（Flag 控制）

```javascript
var ignoreNextChange = false;

function moduleValueChanged(value) {
    if (value.name.toLowerCase() === "volume") {
        if (ignoreNextChange) {
            ignoreNextChange = false;
            return; // 跳过自己引起的更改
        }
        // 用户拖动了滑块
        sendVolumeCommand(value.get());
    }
}

// 脚本更新值时，设置标志位
function updateVolumeDisplay(val) {
    ignoreNextChange = true;
    local.values.getChild("Volume").set(val);
}
```

### 7.2 compactJson（消除空格）

```javascript
function compactJson(msg) {
    var j = JSON.stringify(msg);
    j = j.split("\n").join("");
    j = j.split("\r").join("");
    j = j.split(" ").join("");
    return j;
}
```

### 7.3 遍历子项
