# Chataigne 自定义模块开发须知

## 1. 基础

### 1.1 模块文件结构
```
模块目录/
├── module.json      # 模块定义（参数、值、命令）
├── script.js        # 模块脚本（逻辑代码）
├── icon.png         # 图标（可选）
└── *.noisette       # 会话文件（可选）
```

### 1.2 module.json 结构

```json
{
    "name": "模块名",           // 显示名称
    "type": "模块类型",          // HTTP / UDP / WebSocket Client / OSC / Serial / ArtNet
    "path": "分类路径",          // 如 "ToCenTek"，在菜单中的分组
    "version": "1.0.0",
    "description": "描述",
    "hasInput": true,           // 是否有输入（接收）
    "hasOutput": true,          // 是否有输出（发送）
    "hideDefaultParameters": false, // 是否隐藏内置模块参数
    "hideDefaultCommands": true,    // 是否隐藏内置命令
    "parameters": { ... },      // 自定义参数
    "values": { ... },          // 自定义值（显示在面板上）
    "commands": { ... },        // 自定义命令
    "scripts": ["script.js"],   // 脚本文件列表
    "defaults": {               // 内置参数默认值（可能不生效）
        "localPort": 9528,
        "remoteHost": "10.0.0.255"
    }
}
```

### 1.3 模块类型

| 类型 | 说明 | 内置参数 | 通信方式 |
|------|------|---------|---------|
| WebSocket Client | WebSocket 客户端 | serverPath | local.send(), wsMessageReceived() |
| HTTP | HTTP 客户端 | baseAddress | local.sendGET(), dataEvent() |
| UDP | UDP 通信 | localPort, remoteHost, remotePort, broadcast | local.send(), local.sendTo(), dataReceived() |
| OSC | OSC 协议 | localPortIn, remoteHost, remotePortOut | local.send(), oscEvent() |
| Serial | 串口 | port, baudRate | local.send(), dataReceived() |
| ArtNet | Art-Net 灯光 | universe | local.send() |

### 1.4 生命周期

```
1. 模块构造
2. 参数创建（module.json 中的 parameters/values 被创建）
3. 脚本加载（JS 文件被解析执行）
4. init() 调用（如果存在）
5. 连接建立（协议连接）
6. 正常运行
7. 断开连接
8. 脚本卸载
9. 模块销毁
```

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

不支持 `getItems()` 或 `getChild(index)`。只能通过 `getChild("name")` 按名称访问。
