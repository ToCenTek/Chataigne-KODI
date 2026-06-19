# KODI JSON-RPC API 参考 (v13.5.0)

> 从当前连接的 KODI 21 (Omega) 自动提取。共 174 个方法。

---

## Addons — 插件管理

### Addons.ExecuteAddon

**执行插件**

Executes the given addon with the given parameters (if possible)

**参数:**

  - `addonid` (string, 必需): 
  - `params` (object | array | string, 可选): 
  - `wait` (boolean, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Addons.ExecuteAddon", "params": {"addonid": "..."}, "id": 1}
```

**返回:** `string`

---

### Addons.GetAddonDetails

**获取插件详情**

Gets the details of a specific addon

**参数:**

  - `addonid` (string, 必需): 
  - `properties` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Addons.GetAddonDetails", "params": {"addonid": "..."}, "id": 1}
```

**返回:** object
  - `addon`: object
  - `limits`: object

---

### Addons.GetAddons

**获取插件列表**

Gets all available addons

**参数:**

  - `type` (?, 可选): 
  - `content` (?, 可选): Content provided by the addon. Only considered for plugins and scripts.
  - `enabled` (boolean | all, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `installed` (boolean | all, 可选): 

**返回:** object
  - `addons`: array
  - `limits`: object

---

### Addons.SetAddonEnabled

Enables/Disables a specific addon

**参数:**

  - `addonid` (string, 必需): 
  - `enabled` (?, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Addons.SetAddonEnabled", "params": {"addonid": "..."}, "id": 1}
```

**返回:** `string`

---

## Application — 应用程序

### Application.GetProperties

**获取应用程序属性(音量/静音等)**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

**返回:** `?`

---

### Application.Quit

Quit application

**返回:** `string`

---

### Application.SetMute

**设置静音**

Toggle mute/unmute

**参数:**

  - `mute` (?, 必需): 

**返回:** `boolean`

---

### Application.SetVolume

**设置音量**

Set the current volume

**参数:**

  - `volume` (integer(范围:0~100) | increment | decrement, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume": "increment"}, "id": 1}
```

**返回:** `integer`

---

## AudioLibrary — 音频库

### AudioLibrary.Clean

**清理音频库**

Cleans the audio library from non-existent items

**参数:**

  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**返回:** `string`

---

### AudioLibrary.Export

Exports all items from the audio library

**参数:**

  - `options` (object | object, 可选): 

**返回:** `string`

---

### AudioLibrary.GetAlbumDetails

Retrieve details about a specific album

**参数:**

  - `albumid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `albumdetails`: object

---

### AudioLibrary.GetAlbums

**获取专辑列表**

Retrieve all albums from specified artist (and role) or that has songs of the specified genre

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Albums'}], 可选): 
  - `includesingles` (boolean, 可选): 
  - `allroles` (boolean, 可选): Whether or not to include all roles when filtering by artist, rather than the default of excluding other contributions. When true it overrides any role filter value.

**返回:** object
  - `albums`: array
  - `limits`: object

---

### AudioLibrary.GetArtistDetails

Retrieve details about a specific artist

**参数:**

  - `artistid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `artistdetails`: object

---

### AudioLibrary.GetArtists

**获取艺术家列表**

Retrieve all artists. For backward compatibility by default this implicitly does not include those that only contribute other roles, however absolutely all artists can be returned using allroles=true

**参数:**

  - `albumartistsonly` (?, 可选): Whether or not to only include album artists rather than the artists of only individual songs as well. If the parameter is not passed or is passed as null the GUI setting will be used
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Artists'}], 可选): 
  - `allroles` (boolean, 可选): Whether or not to include all artists irrespective of the role they contributed. When true it overrides any role filter value.

**返回:** object
  - `artists`: array
  - `limits`: object

---

### AudioLibrary.GetAvailableArt

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item` (object | object, 必需): 
  - `arttype` (string, 可选): 

**返回:** object
  - `availableart`: array

---

### AudioLibrary.GetAvailableArtTypes

Retrieve a list of potential art types for a media item

**参数:**

  - `item` (object | object, 必需): 

**返回:** object
  - `availablearttypes`: array

---

### AudioLibrary.GetGenres

Retrieve all genres

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `genres`: array
  - `limits`: object

---

### AudioLibrary.GetProperties

Retrieves the values of the music library properties

**参数:**

  - `properties` (array, 必需): 

**返回:** `?`

---

### AudioLibrary.GetRecentlyAddedAlbums

Retrieve recently added albums

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `albums`: array
  - `limits`: object

---

### AudioLibrary.GetRecentlyAddedSongs

Retrieve recently added songs

**参数:**

  - `albumlimit` (?, 可选): The amount of recently added albums from which to return the songs
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `songs`: array

---

### AudioLibrary.GetRecentlyPlayedAlbums

Retrieve recently played albums

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `albums`: array
  - `limits`: object

---

### AudioLibrary.GetRecentlyPlayedSongs

Retrieve recently played songs

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `songs`: array

---

### AudioLibrary.GetRoles

Retrieve all contributor roles

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `roles`: array

---

### AudioLibrary.GetSongDetails

Retrieve details about a specific song

**参数:**

  - `songid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `songdetails`: object

---

### AudioLibrary.GetSongs

**获取歌曲列表**

Retrieve all songs from specified album, artist or genre

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Songs'}], 可选): 
  - `includesingles` (boolean, 可选): Only songs from albums are returned when false, but overridden when singlesonly parameter is true
  - `allroles` (boolean, 可选): Whether or not to include all roles when filtering by artist, rather than default of excluding other contributors. When true it overrides any role filter value.
  - `singlesonly` (boolean, 可选): Only singles are returned when true, and overrides includesingles parameter

**返回:** object
  - `limits`: object
  - `songs`: array

---

### AudioLibrary.GetSources

Get all music sources, including unique ID

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `sources`: array

---

### AudioLibrary.Scan

**扫描音频库**

Scans the audio sources for new library items

**参数:**

  - `directory` (string, 可选): 
  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**返回:** `string`

---

### AudioLibrary.SetAlbumDetails

Update the given album with the given details

**参数:**

  - `albumid` (?, 必需): 
  - `title` (?, 可选): 
  - `artist` (null | array, 可选): 
  - `description` (?, 可选): 
  - `genre` (null | array, 可选): 
  - `theme` (null | array, 可选): 
  - `mood` (null | array, 可选): 
  - `style` (null | array, 可选): 
  - `type` (?, 可选): 
  - `albumlabel` (?, 可选): 
  - `rating` (?, 可选): 
  - `year` (?, 可选): 
  - `userrating` (?, 可选): 
  - `votes` (?, 可选): 
  - `musicbrainzalbumid` (?, 可选): 
  - `musicbrainzreleasegroupid` (?, 可选): 
  - `sortartist` (?, 可选): 
  - `displayartist` (?, 可选): 
  - `musicbrainzalbumartistid` (null | array, 可选): 
  - `art` (null | object, 可选): 
  - `isboxset` (?, 可选): 
  - `releasedate` (?, 可选): 
  - `originaldate` (?, 可选): 

**返回:** `string`

---

### AudioLibrary.SetArtistDetails

Update the given artist with the given details

**参数:**

  - `artistid` (?, 必需): 
  - `artist` (?, 可选): 
  - `instrument` (null | array, 可选): 
  - `style` (null | array, 可选): 
  - `mood` (null | array, 可选): 
  - `born` (?, 可选): 
  - `formed` (?, 可选): 
  - `description` (?, 可选): 
  - `genre` (null | array, 可选): 
  - `died` (?, 可选): 
  - `disbanded` (?, 可选): 
  - `yearsactive` (null | array, 可选): 
  - `musicbrainzartistid` (?, 可选): 
  - `sortname` (?, 可选): 
  - `type` (?, 可选): 
  - `gender` (?, 可选): 
  - `disambiguation` (?, 可选): 
  - `art` (null | object, 可选): 

**返回:** `string`

---

### AudioLibrary.SetSongDetails

Update the given song with the given details

**参数:**

  - `songid` (?, 必需): 
  - `title` (?, 可选): 
  - `artist` (null | array, 可选): 
  - `genre` (null | array, 可选): 
  - `year` (?, 可选): 
  - `rating` (?, 可选): 
  - `track` (?, 可选): 
  - `disc` (?, 可选): 
  - `duration` (?, 可选): 
  - `comment` (?, 可选): 
  - `musicbrainztrackid` (?, 可选): 
  - `musicbrainzartistid` (?, 可选): 
  - `playcount` (?, 可选): 
  - `lastplayed` (?, 可选): 
  - `userrating` (?, 可选): 
  - `votes` (?, 可选): 
  - `displayartist` (?, 可选): 
  - `sortartist` (?, 可选): 
  - `mood` (?, 可选): 
  - `art` (null | object, 可选): 
  - `disctitle` (?, 可选): 
  - `releasedate` (?, 可选): 
  - `originaldate` (?, 可选): 
  - `bpm` (?, 可选): 
  - `songvideourl` (?, 可选): 

**返回:** `string`

---

## Favourites — 收藏夹

### Favourites.AddFavourite

Add a favourite with the given details

**参数:**

  - `title` (string, 必需): 
  - `type` (?, 必需): 
  - `path` (?, 可选): Required for media, script and androidapp favourites types
  - `window` (?, 可选): Required for window favourite type
  - `windowparameter` (?, 可选): 
  - `thumbnail` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Favourites.AddFavourite", "params": {"title": "..."}, "id": 1}
```

**返回:** `string`

---

### Favourites.GetFavourites

Retrieve all favourites

**参数:**

  - `type` (null | media | window | script | androidapp | unknown, 可选): 
  - `properties` (?, 可选): 

**返回:** object
  - `favourites`: array
  - `limits`: object

---

## Files — 文件系统

### Files.GetDirectory

**获取目录文件列表**

Get the directories and files in the given directory

**参数:**

  - `directory` (string, 必需): 
  - `media` (?, 可选): 
  - `properties` (?, 可选): 
  - `sort` (?, 可选): 
  - `limits` (?, 可选): Limits are applied after getting the directory content thus retrieval is not faster when they are applied.

**示例:**

```json
{"jsonrpc": "2.0", "method": "Files.GetDirectory", "params": {"directory": "..."}, "id": 1}
```

**返回:** object
  - `files`: array
  - `limits`: object

---

### Files.GetFileDetails

**获取文件详情**

Get details for a specific file

**参数:**

  - `file` (string, 必需): Full path to the file
  - `media` (?, 可选): 
  - `properties` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Files.GetFileDetails", "params": {"file": "..."}, "id": 1}
```

**返回:** object
  - `filedetails`: object

---

### Files.GetSources

**获取文件源**

Get the sources of the media windows

**参数:**

  - `media` (?, 必需): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `sources`: array

---

### Files.PrepareDownload

**准备下载文件**

Provides a way to download a given file (e.g. providing an URL to the real file location)

**参数:**

  - `path` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Files.PrepareDownload", "params": {"path": "..."}, "id": 1}
```

**返回:** object
  - `details`: any
  - `mode`: redirect | direct
  - `protocol`: http

---

### Files.SetFileDetails

Update the given specific file with the given details

**参数:**

  - `file` (string, 必需): Full path to the file
  - `media` (?, 必需): File type to update correct database. Currently only "video" is supported.
  - `playcount` (?, 可选): 
  - `lastplayed` (?, 可选): Setting a valid lastplayed without a playcount will force playcount to 1.
  - `resume` (null | object, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Files.SetFileDetails", "params": {"file": "..."}, "id": 1}
```

**返回:** `string`

---

## GUI — 图形界面

### GUI.ActivateScreenSaver

Activates currently used screensaver

**返回:** `string`

---

### GUI.ActivateWindow

**激活指定窗口**

Activates the given window

**参数:**

  - `window` (?, 必需): 
  - `parameters` (array, 可选): 

**返回:** `string`

---

### GUI.GetProperties

**获取 GUI 属性**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

**返回:** `?`

---

### GUI.GetStereoscopicModes

**获取 3D 模式列表**

Returns the supported stereoscopic modes of the GUI

**返回:** object
  - `stereoscopicmodes`: array

---

### GUI.SetFullscreen

**设置全屏**

Toggle fullscreen/GUI

**参数:**

  - `fullscreen` (?, 必需): 

**返回:** `boolean`

---

### GUI.SetStereoscopicMode

**设置 3D 模式**

Sets the stereoscopic mode of the GUI to the given mode

**参数:**

  - `mode` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "GUI.SetStereoscopicMode", "params": {"mode": "..."}, "id": 1}
```

**返回:** `string`

---

### GUI.ShowNotification

**显示通知弹窗**

Shows a GUI notification

**参数:**

  - `title` (string, 必需): 
  - `message` (string, 必需): 
  - `image` (info | warning | error | string, 可选): 
  - `displaytime` (integer, 可选): The time in milliseconds the notification will be visible

**示例:**

```json
{"jsonrpc": "2.0", "method": "GUI.ShowNotification", "params": {"title": "...", "message": "..."}, "id": 1}
```

**返回:** `string`

---

## Input — 输入控制

### Input.Back

**返回键**

Goes back in GUI

**返回:** `string`

---

### Input.ButtonEvent

Send a button press event

**参数:**

  - `button` (string, 必需): Button name
  - `keymap` (string, 必需): Keymap name (KB, XG, R1, or R2)
  - `holdtime` (integer, 可选): Number of milliseconds to simulate button hold.

**示例:**

```json
{"jsonrpc": "2.0", "method": "Input.ButtonEvent", "params": {"button": "...", "keymap": "..."}, "id": 1}
```

**返回:** `string`

---

### Input.ContextMenu

**上下文菜单键**

Shows the context menu

**返回:** `string`

---

### Input.Down

**方向键下**

Navigate down in GUI

**返回:** `string`

---

### Input.ExecuteAction

**执行指定动作(按键/遥控)**

Execute a specific action

**参数:**

  - `action` (?, 必需): 

**返回:** `string`

---

### Input.Home

**Home 键**

Goes to home window in GUI

**返回:** `string`

---

### Input.Info

**信息键**

Shows the information dialog

**返回:** `string`

---

### Input.Left

**方向键左**

Navigate left in GUI

**返回:** `string`

---

### Input.Right

**方向键右**

Navigate right in GUI

**返回:** `string`

---

### Input.Select

**确认/选择键**

Select current item in GUI

**返回:** `string`

---

### Input.SendText

**发送文本**

Send a generic (unicode) text

**参数:**

  - `text` (string, 必需): Unicode text
  - `done` (boolean, 可选): Whether this is the whole input or not (closes an open input dialog if true).

**示例:**

```json
{"jsonrpc": "2.0", "method": "Input.SendText", "params": {"text": "..."}, "id": 1}
```

**返回:** `string`

---

### Input.ShowCodec

Show codec information of the playing item

**返回:** `string`

---

### Input.ShowOSD

Show the on-screen display for the current player

**返回:** `string`

---

### Input.ShowPlayerProcessInfo

Show player process information of the playing item, like video decoder, pixel format, pvr signal strength, ...

**返回:** `string`

---

### Input.Up

**方向键上**

Navigate up in GUI

**返回:** `string`

---

## JSONRPC — JSON-RPC 系统

### JSONRPC.Introspect

**获取 API 自省信息**

Enumerates all actions and descriptions

**参数:**

  - `getdescriptions` (boolean, 可选): 
  - `getmetadata` (boolean, 可选): 
  - `filterbytransport` (boolean, 可选): 
  - `filter` (object, 可选): 

**返回:** `object`

---

### JSONRPC.NotifyAll

Notify all other connected clients

**参数:**

  - `sender` (string, 必需): 
  - `message` (string, 必需): 
  - `data` (any, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.NotifyAll", "params": {"sender": "...", "message": "..."}, "id": 1}
```

**返回:** `any`

---

### JSONRPC.Permission

**获取权限**

Retrieve the clients permissions

**返回:** object
  - `controlgui`: boolean
  - `controlnotify`: boolean
  - `controlplayback`: boolean
  - `controlpower`: boolean
  - `controlpvr`: boolean
  - `controlsystem`: boolean
  - `executeaddon`: boolean
  - `manageaddon`: boolean
  - `navigate`: boolean
  - `readdata`: boolean
  - `removedata`: boolean
  - `updatedata`: boolean
  - `writefile`: boolean

---

### JSONRPC.Ping

**测试连接(返回 pong)**

Ping responder

**返回:** `string`

---

### JSONRPC.Version

**获取版本**

Retrieve the JSON-RPC protocol version.

**返回:** object
  - `version`: object

---

## PVR — PVR/电视

### PVR.AddTimer

Adds a timer to record the given show one times or a timer rule to record all showings of the given show or adds a reminder timer or reminder timer rule

**参数:**

  - `broadcastid` (?, 必需): the broadcast id of the item to record
  - `timerrule` (boolean, 可选): controls whether to create a timer rule or a onetime timer
  - `reminder` (boolean, 可选): controls whether to create a reminder timer or a recording timer

**返回:** `string`

---

### PVR.DeleteTimer

Deletes a onetime timer or a timer rule

**参数:**

  - `timerid` (?, 必需): the id of the onetime timer or timer rule to delete

**返回:** `string`

---

### PVR.GetBroadcastDetails

Retrieves the details of a specific broadcast

**参数:**

  - `broadcastid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `broadcastdetails`: object

---

### PVR.GetBroadcastIsPlayable

Retrieves whether or not a broadcast is playable

**参数:**

  - `broadcastid` (?, 必需): the id of the broadcast to check for playability

**返回:** `boolean`

---

### PVR.GetBroadcasts

Retrieves the program of a specific channel

**参数:**

  - `channelid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 

**返回:** object
  - `broadcasts`: array
  - `limits`: object

---

### PVR.GetChannelDetails

Retrieves the details of a specific channel

**参数:**

  - `channelid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `channeldetails`: object

---

### PVR.GetChannelGroupDetails

Retrieves the details of a specific channel group

**参数:**

  - `channelgroupid` (?, 必需): 
  - `channels` (object, 可选): 

**返回:** object
  - `channelgroupdetails`: object

---

### PVR.GetChannelGroups

Retrieves the channel groups for the specified type

**参数:**

  - `channeltype` (?, 必需): 
  - `limits` (?, 可选): 

**返回:** object
  - `channelgroups`: array
  - `limits`: object

---

### PVR.GetChannels

Retrieves the channel list

**参数:**

  - `channelgroupid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `channels`: array
  - `limits`: object

---

### PVR.GetClients

Retrieves the enabled PVR clients and their capabilities

**参数:**

  - `limits` (?, 可选): 

**返回:** object
  - `clients`: array
  - `limits`: object

---

### PVR.GetProperties

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

**返回:** `?`

---

### PVR.GetRecordingDetails

Retrieves the details of a specific recording

**参数:**

  - `recordingid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `recordingdetails`: object

---

### PVR.GetRecordings

Retrieves the recordings

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `recordings`: array

---

### PVR.GetTimerDetails

Retrieves the details of a specific timer

**参数:**

  - `timerid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `timerdetails`: object

---

### PVR.GetTimers

Retrieves the timers

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `timers`: array

---

### PVR.Record

Toggle recording of a channel

**参数:**

  - `record` (?, 可选): 
  - `channel` (current | integer(默认:-1), 可选): 

**返回:** `string`

---

### PVR.Scan

Starts a channel scan

**参数:**

  - `clientid` (?, 可选): Specify a PVR client id to avoid UI dialog, optional in kodi 19, required in kodi 20

**返回:** `string`

---

### PVR.ToggleTimer

Creates or deletes a onetime timer or timer rule for a given show. If it exists, it will be deleted. If it does not exist, it will be created

**参数:**

  - `broadcastid` (?, 必需): the broadcast id of the item to toggle a onetime timer or time rule for
  - `timerrule` (boolean, 可选): controls whether to create / delete a timer rule or a onetime timer

**返回:** `string`

---

## Player — 播放器

### Player.AddSubtitle

Add subtitle to the player

**参数:**

  - `playerid` (?, 必需): 
  - `subtitle` (string, 必需): Local path or remote URL to the subtitle file to load

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.AddSubtitle", "params": {"subtitle": "..."}, "id": 1}
```

**返回:** `string`

---

### Player.GetActivePlayers

**获取当前活跃播放器**

Returns all active players

**返回:** `array`

---

### Player.GetAudioDelay

Get the audio delay for the current playback

**返回:** object
  - `offset`: number

---

### Player.GetItem

**获取当前播放项信息**

Retrieves the currently played item

**参数:**

  - `playerid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `item`: object

---

### Player.GetPlayers

Get a list of available players

**参数:**

  - `media` (string, 可选): 

**返回:** `array`

---

### Player.GetProperties

**获取播放器属性**

Retrieves the values of the given properties

**参数:**

  - `playerid` (?, 必需): 
  - `properties` (array, 必需): 

**返回:** `?`

---

### Player.GetViewMode

Get view mode of video player

**返回:** object
  - `nonlinearstretch`: boolean
  - `pixelratio`: number
  - `verticalshift`: number
  - `viewmode`: normal | zoom | stretch4x3 | widezoom | stretch16x9 | original | stretch16x9nonlin | zoom120width | zoom110width
  - `zoom`: number

---

### Player.GoTo

**跳转到(下一曲/上一曲/指定)**

Go to previous/next/specific item in the playlist

**参数:**

  - `playerid` (?, 必需): 
  - `to` (previous | next | integer(默认:-1), 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.GoTo", "params": {"to": "previous"}, "id": 1}
```

**返回:** `string`

---

### Player.Move

**移动播放**

If picture is zoomed move viewport left/right/up/down otherwise skip previous/next

**参数:**

  - `playerid` (?, 必需): 
  - `direction` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.Move", "params": {"direction": "..."}, "id": 1}
```

**返回:** `string`

---

### Player.Open

**打开并播放媒体**

Start playback of either the playlist with the given ID, a slideshow with the pictures from the given directory or a single file or an item from the database.

**参数:**

  - `item` (object | [{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | object | object | object | object | object, 可选): 
  - `options` (object, 可选): 

**返回:** `string`

---

### Player.PlayPause

**播放/暂停**

Pauses or unpause playback and returns the new state

**参数:**

  - `playerid` (?, 必需): 
  - `play` (?, 可选): 

**返回:** `?`

---

### Player.Rotate

**旋转视频**

Rotates current picture

**参数:**

  - `playerid` (?, 必需): 
  - `value` (string, 可选): 

**返回:** `string`

---

### Player.Seek

**跳转(秒数或百分比)**

Seek through the playing item

**参数:**

  - `playerid` (?, 必需): 
  - `value` (object | object | object | object, 必需): 

**返回:** object
  - `percentage`: number(范围:0.0~100.0; 默认:0.0)
  - `time`: object
  - `totaltime`: object

---

### Player.SetAudioDelay

Set the audio delay for the current playback

**参数:**

  - `playerid` (?, 必需): 
  - `offset` (number | increment | decrement, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetAudioDelay", "params": {"offset": "increment"}, "id": 1}
```

**返回:** object
  - `offset`: number

---

### Player.SetAudioStream

**切换音频流**

Set the audio stream played by the player

**参数:**

  - `playerid` (?, 必需): 
  - `stream` (previous | next | integer, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetAudioStream", "params": {"stream": "previous"}, "id": 1}
```

**返回:** `string`

---

### Player.SetPartymode

**设置派对模式**

Turn partymode on or off

**参数:**

  - `playerid` (?, 必需): 
  - `partymode` (?, 必需): 

**返回:** `string`

---

### Player.SetRepeat

**设置循环模式**

Set the repeat mode of the player

**参数:**

  - `playerid` (?, 必需): 
  - `repeat` (off | one | all | cycle, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetRepeat", "params": {"repeat": "off"}, "id": 1}
```

**返回:** `string`

---

### Player.SetShuffle

**设置随机播放**

Shuffle/Unshuffle items in the player

**参数:**

  - `playerid` (?, 必需): 
  - `shuffle` (?, 必需): 

**返回:** `string`

---

### Player.SetSpeed

**设置播放速度**

Set the speed of the current playback

**参数:**

  - `playerid` (?, 必需): 
  - `speed` (-32 | -16 | -8 | -4 | -2 | -1 | 0 | 1 | 2 | 4 | 8 | 16 | 32 | increment | decrement, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"speed": -32}, "id": 1}
```

**返回:** `?`

---

### Player.SetSubtitle

**切换字幕流**

Set the subtitle displayed by the player

**参数:**

  - `playerid` (?, 必需): 
  - `subtitle` (previous | next | off | on | integer, 必需): 
  - `enable` (boolean, 可选): Whether to enable subtitles to be displayed after setting the new subtitle

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetSubtitle", "params": {"subtitle": "previous"}, "id": 1}
```

**返回:** `string`

---

### Player.SetTempo

Set the tempo of the current playback

**参数:**

  - `playerid` (?, 必需): 
  - `tempo` (number | increment | decrement, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetTempo", "params": {"tempo": "increment"}, "id": 1}
```

**返回:** `?`

---

### Player.SetVideoStream

Set the video stream played by the player

**参数:**

  - `playerid` (?, 必需): 
  - `stream` (previous | next | integer, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetVideoStream", "params": {"stream": "previous"}, "id": 1}
```

**返回:** `string`

---

### Player.SetViewMode

Set view mode of video player

**参数:**

  - `viewmode` (object | normal | zoom | stretch4x3 | widezoom | stretch16x9 | original | stretch16x9nonlin | zoom120width | zoom110width, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.SetViewMode", "params": {"viewmode": "normal"}, "id": 1}
```

**返回:** `string`

---

### Player.Stop

**停止播放**

Stops playback

**参数:**

  - `playerid` (?, 必需): 

**返回:** `string`

---

### Player.Zoom

Zoom current picture

**参数:**

  - `playerid` (?, 必需): 
  - `zoom` (in | out | integer(范围:1~10), 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Player.Zoom", "params": {"zoom": "in"}, "id": 1}
```

**返回:** `string`

---

## Playlist — 播放列表

### Playlist.Add

**播放列表添加项**

Add item(s) to playlist

**参数:**

  - `playlistid` (?, 必需): 
  - `item` ([{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array, 必需): 

**返回:** `string`

---

### Playlist.Clear

**清空播放列表**

Clear playlist

**参数:**

  - `playlistid` (?, 必需): 

**返回:** `string`

---

### Playlist.GetItems

**获取播放列表项**

Get all items from playlist

**参数:**

  - `playlistid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `items`: array
  - `limits`: object

---

### Playlist.GetPlaylists

Returns all existing playlists

**返回:** `array`

---

### Playlist.GetProperties

**获取播放列表属性**

Retrieves the values of the given properties

**参数:**

  - `playlistid` (?, 必需): 
  - `properties` (array, 必需): 

**返回:** `?`

---

### Playlist.Insert

**插入项**

Insert item(s) into playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid` (?, 必需): 
  - `position` (?, 必需): 
  - `item` ([{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array, 必需): 

**返回:** `string`

---

### Playlist.Remove

**移除项**

Remove item from playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid` (?, 必需): 
  - `position` (?, 必需): 

**返回:** `string`

---

### Playlist.Swap

**交换项位置**

Swap items in the playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid` (?, 必需): 
  - `position1` (?, 必需): 
  - `position2` (?, 必需): 

**返回:** `string`

---

## Profiles — 配置文件

### Profiles.GetCurrentProfile

Retrieve the current profile

**参数:**

  - `properties` (?, 可选): 

**返回:** `?`

---

### Profiles.GetProfiles

Retrieve all profiles

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `profiles`: array

---

### Profiles.LoadProfile

Load the specified profile

**参数:**

  - `profile` (string, 必需): Profile name
  - `prompt` (boolean, 可选): Prompt for password
  - `password` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Profiles.LoadProfile", "params": {"profile": "..."}, "id": 1}
```

**返回:** `string`

---

## Settings — 设置

### Settings.GetCategories

Retrieves all setting categories

**参数:**

  - `level` (?, 可选): 
  - `section` (string, 可选): 
  - `properties` (?, 可选): 

**返回:** object
  - `categories`: array

---

### Settings.GetSections

Retrieves all setting sections

**参数:**

  - `level` (?, 可选): 
  - `properties` (?, 可选): 

**返回:** object
  - `sections`: array

---

### Settings.GetSettingValue

**获取设置值**

Retrieves the value of a setting

**参数:**

  - `setting` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSettingValue", "params": {"setting": "..."}, "id": 1}
```

**返回:** object
  - `value`: [{'type': 'boolean'}, {'type': 'integer'}, {'type': 'number'}, {'type': 'string'}, {'$ref': 'Setting.Value.List'}](默认:None)

---

### Settings.GetSettings

**获取设置列表**

Retrieves all settings

**参数:**

  - `level` (?, 可选): 
  - `filter` (object, 可选): 

**返回:** object
  - `settings`: array

---

### Settings.GetSkinSettingValue

Retrieves the value of the specified skin setting

**参数:**

  - `setting` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSkinSettingValue", "params": {"setting": "..."}, "id": 1}
```

**返回:** object
  - `value`: [{'type': 'boolean'}, {'type': 'string'}]

---

### Settings.GetSkinSettings

Retrieves all skin settings of the currently used skin

**返回:** object
  - `settings`: array
  - `skin`: string

---

### Settings.ResetSettingValue

**重置设置为默认**

Resets the value of a setting

**参数:**

  - `setting` (string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Settings.ResetSettingValue", "params": {"setting": "..."}, "id": 1}
```

**返回:** `string`

---

### Settings.SetSettingValue

**设置值**

Changes the value of a setting

**参数:**

  - `setting` (string, 必需): 
  - `value` (?, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Settings.SetSettingValue", "params": {"setting": "..."}, "id": 1}
```

**返回:** `boolean`

---

### Settings.SetSkinSettingValue

Changes the value of the specified skin setting

**参数:**

  - `setting` (string, 必需): 
  - `value` (boolean | string, 必需): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "Settings.SetSkinSettingValue", "params": {"setting": "..."}, "id": 1}
```

**返回:** `boolean`

---

## System — 系统

### System.EjectOpticalDrive

**弹出光驱**

Ejects or closes the optical disc drive (if available)

**返回:** `string`

---

### System.GetProperties

**获取系统属性**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

**返回:** `?`

---

### System.Hibernate

Puts the system running Kodi into hibernate mode

**返回:** `string`

---

### System.Reboot

**重启**

Reboots the system running Kodi

**返回:** `string`

---

### System.Shutdown

Shuts the system running Kodi down

**返回:** `string`

---

### System.Suspend

**待机**

Suspends the system running Kodi

**返回:** `string`

---

## Textures — 纹理

### Textures.GetTextures

Retrieve all textures

**参数:**

  - `properties` (?, 可选): 
  - `filter` (?, 可选): 

**返回:** object
  - `textures`: array

---

### Textures.RemoveTexture

Remove the specified texture

**参数:**

  - `textureid` (?, 必需): Texture database identifier

**返回:** `string`

---

## VideoLibrary — 视频库

### VideoLibrary.Clean

**清理视频库**

Cleans the video library for non-existent items

**参数:**

  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog
  - `content` (string, 可选): Content type to clean for
  - `directory` (string, 可选): Path to the directory to clean up; performs a global cleanup if not specified

**返回:** `string`

---

### VideoLibrary.Export

Exports all items from the video library

**参数:**

  - `options` (object | object, 可选): 

**返回:** `string`

---

### VideoLibrary.GetAvailableArt

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item` (object | object | object | object | object | object, 必需): 
  - `arttype` (string, 可选): 

**返回:** object
  - `availableart`: array

---

### VideoLibrary.GetAvailableArtTypes

Retrieve a list of potential art types for a media item

**参数:**

  - `item` (object | object | object | object | object | object, 必需): 

**返回:** object
  - `availablearttypes`: array

---

### VideoLibrary.GetEpisodeDetails

**获取剧集详情**

Retrieve details about a specific tv show episode

**参数:**

  - `episodeid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `episodedetails`: object

---

### VideoLibrary.GetEpisodes

**获取剧集列表**

Retrieve all tv show episodes

**参数:**

  - `tvshowid` (?, 可选): 
  - `season` (integer, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Episodes'}], 可选): 

**返回:** object
  - `episodes`: array
  - `limits`: object

---

### VideoLibrary.GetGenres

Retrieve all genres

**参数:**

  - `type` (string, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetGenres", "params": {"type": "..."}, "id": 1}
```

**返回:** object
  - `genres`: array
  - `limits`: object

---

### VideoLibrary.GetInProgressTVShows

Retrieve all in progress tvshows

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `tvshows`: array

---

### VideoLibrary.GetMovieDetails

**获取电影详情**

Retrieve details about a specific movie

**参数:**

  - `movieid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `moviedetails`: object

---

### VideoLibrary.GetMovieSetDetails

Retrieve details about a specific movie set

**参数:**

  - `setid` (?, 必需): 
  - `properties` (?, 可选): 
  - `movies` (object, 可选): 

**返回:** object
  - `setdetails`: object

---

### VideoLibrary.GetMovieSets

Retrieve all movie sets

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `sets`: array

---

### VideoLibrary.GetMovies

**获取电影列表**

Retrieve all movies

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Movies'}], 可选): 

**返回:** object
  - `limits`: object
  - `movies`: array

---

### VideoLibrary.GetMusicVideoDetails

Retrieve details about a specific music video

**参数:**

  - `musicvideoid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `musicvideodetails`: object

---

### VideoLibrary.GetMusicVideos

Retrieve all music videos

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.MusicVideos'}], 可选): 

**返回:** object
  - `limits`: object
  - `musicvideos`: array

---

### VideoLibrary.GetRecentlyAddedEpisodes

**获取最近添加剧集**

Retrieve all recently added tv episodes

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `episodes`: array
  - `limits`: object

---

### VideoLibrary.GetRecentlyAddedMovies

**获取最近添加电影**

Retrieve all recently added movies

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `movies`: array

---

### VideoLibrary.GetRecentlyAddedMusicVideos

Retrieve all recently added music videos

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `musicvideos`: array

---

### VideoLibrary.GetSeasonDetails

**获取季度详情**

Retrieve details about a specific tv show season

**参数:**

  - `seasonid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `seasondetails`: object

---

### VideoLibrary.GetSeasons

**获取季度列表**

Retrieve all tv seasons

**参数:**

  - `tvshowid` (?, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**返回:** object
  - `limits`: object
  - `seasons`: array

---

### VideoLibrary.GetTVShowDetails

**获取电视剧详情**

Retrieve details about a specific tv show

**参数:**

  - `tvshowid` (?, 必需): 
  - `properties` (?, 可选): 

**返回:** object
  - `tvshowdetails`: object

---

### VideoLibrary.GetTVShows

**获取电视剧列表**

Retrieve all tv shows

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.TVShows'}], 可选): 

**返回:** object
  - `limits`: object
  - `tvshows`: array

---

### VideoLibrary.GetTags

Retrieve all tags

**参数:**

  - `type` (string, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**示例:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetTags", "params": {"type": "..."}, "id": 1}
```

**返回:** object
  - `limits`: object
  - `tags`: array

---

### VideoLibrary.RefreshEpisode

Refresh the given episode in the library

**参数:**

  - `episodeid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

**返回:** `string`

---

### VideoLibrary.RefreshMovie

Refresh the given movie in the library

**参数:**

  - `movieid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

**返回:** `string`

---

### VideoLibrary.RefreshMusicVideo

Refresh the given music video in the library

**参数:**

  - `musicvideoid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

**返回:** `string`

---

### VideoLibrary.RefreshTVShow

Refresh the given tv show in the library

**参数:**

  - `tvshowid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `refreshepisodes` (boolean, 可选): Whether or not to refresh all episodes belonging to the TV show.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

**返回:** `string`

---

### VideoLibrary.RemoveEpisode

Removes the given episode from the library

**参数:**

  - `episodeid` (?, 必需): 

**返回:** `string`

---

### VideoLibrary.RemoveMovie

Removes the given movie from the library

**参数:**

  - `movieid` (?, 必需): 

**返回:** `string`

---

### VideoLibrary.RemoveMusicVideo

Removes the given music video from the library

**参数:**

  - `musicvideoid` (?, 必需): 

**返回:** `string`

---

### VideoLibrary.RemoveTVShow

Removes the given tv show from the library

**参数:**

  - `tvshowid` (?, 必需): 

**返回:** `string`

---

### VideoLibrary.Scan

**扫描视频库(新增/更新文件)**

Scans the video sources for new library items

**参数:**

  - `directory` (string, 可选): 
  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**返回:** `string`

---

### VideoLibrary.SetEpisodeDetails

Update the given episode with the given details

**参数:**

  - `episodeid` (?, 必需): 
  - `title` (?, 可选): 
  - `playcount` (?, 可选): 
  - `runtime` (?, 可选): Runtime in seconds
  - `director` (null | array, 可选): 
  - `plot` (?, 可选): 
  - `rating` (?, 可选): 
  - `votes` (?, 可选): 
  - `lastplayed` (?, 可选): 
  - `writer` (null | array, 可选): 
  - `firstaired` (?, 可选): 
  - `productioncode` (?, 可选): 
  - `season` (?, 可选): 
  - `episode` (?, 可选): 
  - `originaltitle` (?, 可选): 
  - `thumbnail` (?, 可选): 
  - `fanart` (?, 可选): 
  - `art` (null | object, 可选): 
  - `resume` (null | object, 可选): 
  - `userrating` (?, 可选): 
  - `ratings` (?, 可选): 
  - `dateadded` (?, 可选): 
  - `uniqueid` (null | object, 可选): 

**返回:** `string`

---

### VideoLibrary.SetMovieDetails

Update the given movie with the given details

**参数:**

  - `movieid` (?, 必需): 
  - `title` (?, 可选): 
  - `playcount` (?, 可选): 
  - `runtime` (?, 可选): Runtime in seconds
  - `director` (null | array, 可选): 
  - `studio` (null | array, 可选): 
  - `year` (?, 可选): linked with premiered. Overridden by premiered parameter
  - `plot` (?, 可选): 
  - `genre` (null | array, 可选): 
  - `rating` (?, 可选): 
  - `mpaa` (?, 可选): 
  - `imdbnumber` (?, 可选): 
  - `votes` (?, 可选): 
  - `lastplayed` (?, 可选): 
  - `originaltitle` (?, 可选): 
  - `trailer` (?, 可选): 
  - `tagline` (?, 可选): 
  - `plotoutline` (?, 可选): 
  - `writer` (null | array, 可选): 
  - `country` (null | array, 可选): 
  - `top250` (?, 可选): 
  - `sorttitle` (?, 可选): 
  - `set` (?, 可选): 
  - `showlink` (null | array, 可选): 
  - `thumbnail` (?, 可选): 
  - `fanart` (?, 可选): 
  - `tag` (null | array, 可选): 
  - `art` (null | object, 可选): 
  - `resume` (null | object, 可选): 
  - `userrating` (?, 可选): 
  - `ratings` (?, 可选): 
  - `dateadded` (?, 可选): 
  - `premiered` (?, 可选): linked with year. Overrides year
  - `uniqueid` (null | object, 可选): 

**返回:** `string`

---

### VideoLibrary.SetMovieSetDetails

Update the given movie set with the given details

**参数:**

  - `setid` (?, 必需): 
  - `title` (?, 可选): 
  - `art` (null | object, 可选): 
  - `plot` (?, 可选): 

**返回:** `string`

---

### VideoLibrary.SetMusicVideoDetails

Update the given music video with the given details

**参数:**

  - `musicvideoid` (?, 必需): 
  - `title` (?, 可选): 
  - `playcount` (?, 可选): 
  - `runtime` (?, 可选): Runtime in seconds
  - `director` (null | array, 可选): 
  - `studio` (null | array, 可选): 
  - `year` (?, 可选): linked with premiered. Overridden by premiered parameter
  - `plot` (?, 可选): 
  - `album` (?, 可选): 
  - `artist` (null | array, 可选): 
  - `genre` (null | array, 可选): 
  - `track` (?, 可选): 
  - `lastplayed` (?, 可选): 
  - `thumbnail` (?, 可选): 
  - `fanart` (?, 可选): 
  - `tag` (null | array, 可选): 
  - `art` (null | object, 可选): 
  - `resume` (null | object, 可选): 
  - `rating` (?, 可选): 
  - `userrating` (?, 可选): 
  - `dateadded` (?, 可选): 
  - `premiered` (?, 可选): linked with year. Overrides year
  - `uniqueid` (null | object, 可选): 

**返回:** `string`

---

### VideoLibrary.SetSeasonDetails

Update the given season with the given details

**参数:**

  - `seasonid` (?, 必需): 
  - `art` (null | object, 可选): 
  - `userrating` (?, 可选): 
  - `title` (?, 可选): 

**返回:** `string`

---

### VideoLibrary.SetTVShowDetails

Update the given tvshow with the given details

**参数:**

  - `tvshowid` (?, 必需): 
  - `title` (?, 可选): 
  - `playcount` (?, 可选): 
  - `studio` (null | array, 可选): 
  - `plot` (?, 可选): 
  - `genre` (null | array, 可选): 
  - `rating` (?, 可选): 
  - `mpaa` (?, 可选): 
  - `imdbnumber` (?, 可选): 
  - `premiered` (?, 可选): 
  - `votes` (?, 可选): 
  - `lastplayed` (?, 可选): 
  - `originaltitle` (?, 可选): 
  - `sorttitle` (?, 可选): 
  - `episodeguide` (?, 可选): 
  - `thumbnail` (?, 可选): 
  - `fanart` (?, 可选): 
  - `tag` (null | array, 可选): 
  - `art` (null | object, 可选): 
  - `userrating` (?, 可选): 
  - `ratings` (?, 可选): 
  - `dateadded` (?, 可选): 
  - `runtime` (?, 可选): Runtime in seconds
  - `status` (?, 可选): Valid values: 'returning series', 'in production', 'planned', 'cancelled', 'ended'
  - `uniqueid` (null | object, 可选): 

**返回:** `string`

---

## XBMC — 系统(兼容)

### XBMC.GetInfoBooleans

Retrieve info booleans about Kodi and the system

**参数:**

  - `booleans` (array, 必需): 

**返回:** `object`

---

### XBMC.GetInfoLabels

Retrieve info labels about Kodi and the system

**参数:**

  - `labels` (array, 必需): See http://kodi.wiki/view/InfoLabels for a list of possible info labels

**返回:** `object`

---

