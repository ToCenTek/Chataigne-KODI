# KODI JSON-RPC API 参考 (v13.5.0)

> 从当前 KODI 21 (Omega) 自动提取，174 个方法均含实测请求与响应。

---

## 目录

- [Addons — 插件管理](#addons)
- [Application — 应用程序](#application)
- [AudioLibrary — 音频库](#audiolibrary)
- [Favourites — 收藏夹](#favourites)
- [Files — 文件系统](#files)
- [GUI — 图形界面](#gui)
- [Input — 输入控制](#input)
- [JSONRPC — JSON-RPC 系统](#jsonrpc)
- [PVR — PVR/电视](#pvr)
- [Player — 播放器](#player)
- [Playlist — 播放列表](#playlist)
- [Profiles — 配置文件](#profiles)
- [Settings — 设置](#settings)
- [System — 系统](#system)
- [Textures — 纹理](#textures)
- [VideoLibrary — 视频库](#videolibrary)
- [XBMC — 系统(兼容)](#xbmc)

---

<a id="addons"></a>
## Addons — 插件管理

<a id="addonsexecuteaddon"></a>
### Addons.ExecuteAddon

**执行插件**

Executes the given addon with the given parameters (if possible)

**参数:**

  - `addonid`: 插件 ID; 类型: string; 必需
  - `params`: 类型: array | object | string; 可选
  - `wait`: 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Addons.ExecuteAddon", "params": {"addonid": "script.jsonrobin", "wait": false}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="addonsgetaddondetails"></a>
### Addons.GetAddonDetails

**获取插件详情**

Gets the details of a specific addon

**参数:**

  - `addonid`: 插件 ID; 类型: string; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Addons.GetAddonDetails", "params": {"addonid": "script.jsonrobin", "properties": ["name", "version"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="addonsgetaddons"></a>
### Addons.GetAddons

**获取插件**

Gets all available addons

**参数:**

  - `type`: 类型; 类型: ?; 可选
  - `content`: Content provided by the addon. Only considered for plugins and scripts.; 类型: ?; 可选
  - `enabled`: 启用状态 (true=启用, false=禁用); 可选值: all; 类型: all | boolean; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `installed`: 类型: all | boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Addons.GetAddons", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="addonssetaddonenabled"></a>
### Addons.SetAddonEnabled

**启用/禁用插件**

Enables/Disables a specific addon

**参数:**

  - `addonid`: 插件 ID; 类型: string; 必需
  - `enabled`: 启用状态 (true=启用, false=禁用); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Addons.SetAddonEnabled", "params": {"addonid": "script.jsonrobin", "enabled": true}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="application"></a>
## Application — 应用程序

<a id="applicationgetproperties"></a>
### Application.GetProperties

**获取应用程序属性**

Retrieves the values of the given properties

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume", "muted"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "muted": false,
    "volume": 80
  }
}
```

---

<a id="applicationquit"></a>
### Application.Quit

**退出 KODI**

Quit application

**请求:**

```json
{"jsonrpc": "2.0", "method": "Application.Quit", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="applicationsetmute"></a>
### Application.SetMute

**设置静音**

Toggle mute/unmute

**参数:**

  - `mute`: 静音开关 (true=静音, false=取消静音, toggle=切换); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Application.SetMute", "params": {"mute": true}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": true
}
```

---

<a id="applicationsetvolume"></a>
### Application.SetVolume

**设置音量**

Set the current volume

**参数:**

  - `volume`: 音量值 (0~100, increment=递增, decrement=递减); 可选值: increment, decrement; 类型: increment | decrement | integer(范围:0~100); 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume": "increment"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": 73
}
```

---

<a id="audiolibrary"></a>
## AudioLibrary — 音频库

<a id="audiolibraryclean"></a>
### AudioLibrary.Clean

**清理库**

Cleans the audio library from non-existent items

**参数:**

  - `showdialogs`: Whether or not to show the progress bar or any other GUI dialog; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Clean", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibraryexport"></a>
### AudioLibrary.Export

**导出库**

Exports all items from the audio library

**参数:**

  - `options`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Export", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetalbumdetails"></a>
### AudioLibrary.GetAlbumDetails

**获取专辑详情**

Retrieve details about a specific album

**参数:**

  - `albumid`: 专辑 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbumDetails", "params": {"albumid": 1, "properties": ["title", "artist"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarygetalbums"></a>
### AudioLibrary.GetAlbums

**获取专辑**

Retrieve all albums from specified artist (and role) or that has songs of the specified genre

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Albums'}] | object; 可选
  - `includesingles`: 类型: boolean; 可选
  - `allroles`: Whether or not to include all roles when filtering by artist, rather than the default of excluding other contributions. When true it overrides any role filter value.; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetartistdetails"></a>
### AudioLibrary.GetArtistDetails

**获取艺术家详情**

Retrieve details about a specific artist

**参数:**

  - `artistid`: 艺术家 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetArtistDetails", "params": {"artistid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "artistdetails": {
      "artist": "[缺失]",
      "artistid": 1,
      "label": "[缺失]"
    }
  }
}
```

---

<a id="audiolibrarygetartists"></a>
### AudioLibrary.GetArtists

**获取艺术家**

Retrieve all artists. For backward compatibility by default this implicitly does not include those that only contribute other roles, however absolutely all artists can be returned using allroles=true

**参数:**

  - `albumartistsonly`: Whether or not to only include album artists rather than the artists of only individual songs as well. If the parameter is not passed or is passed as null the GUI setting will be used; 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Artists'}] | object; 可选
  - `allroles`: Whether or not to include all artists irrespective of the role they contributed. When true it overrides any role filter value.; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetArtists", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetavailableart"></a>
### AudioLibrary.GetAvailableArt

**获取可用艺术图**

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: object; 必需
  - `arttype`: 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetAvailableArt", "params": {"item": {"artist": "test"}}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "AudioLibrary.GetAvailableArt",
      "stack": {
        "message": "Received value does not match any of the union type definitions",
        "name": "item",
        "type": "object"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarygetavailablearttypes"></a>
### AudioLibrary.GetAvailableArtTypes

**获取可用艺术图类型**

Retrieve a list of potential art types for a media item

**参数:**

  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: object; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetAvailableArtTypes", "params": {"item": {"artist": "test"}}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "AudioLibrary.GetAvailableArtTypes",
      "stack": {
        "message": "Received value does not match any of the union type definitions",
        "name": "item",
        "type": "object"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarygetgenres"></a>
### AudioLibrary.GetGenres

**获取分类**

Retrieve all genres

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetGenres", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetproperties"></a>
### AudioLibrary.GetProperties

**获取属性**

Retrieves the values of the music library properties

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetProperties", "params": {"properties": ["library", "artist"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "AudioLibrary.GetProperties",
      "stack": {
        "message": "array element at index 0 does not match",
        "name": "properties",
        "property": {
          "message": "Received value does not match any of the defined enum values",
          "name": "Audio.Property.Name",
          "type": "string"
        },
        "type": "array"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarygetrecentlyaddedalbums"></a>
### AudioLibrary.GetRecentlyAddedAlbums

**最近添加专辑**

Retrieve recently added albums

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyAddedAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetrecentlyaddedsongs"></a>
### AudioLibrary.GetRecentlyAddedSongs

**最近添加歌曲**

Retrieve recently added songs

**参数:**

  - `albumlimit`: The amount of recently added albums from which to return the songs; 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyAddedSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetrecentlyplayedalbums"></a>
### AudioLibrary.GetRecentlyPlayedAlbums

**最近播放专辑**

Retrieve recently played albums

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyPlayedAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetrecentlyplayedsongs"></a>
### AudioLibrary.GetRecentlyPlayedSongs

**最近播放歌曲**

Retrieve recently played songs

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyPlayedSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetroles"></a>
### AudioLibrary.GetRoles

**获取角色**

Retrieve all contributor roles

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRoles", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetsongdetails"></a>
### AudioLibrary.GetSongDetails

**获取歌曲详情**

Retrieve details about a specific song

**参数:**

  - `songid`: 歌曲 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetSongDetails", "params": {"songid": 1, "properties": ["title", "artist"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarygetsongs"></a>
### AudioLibrary.GetSongs

**获取歌曲**

Retrieve all songs from specified album, artist or genre

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Songs'}] | object; 可选
  - `includesingles`: Only songs from albums are returned when false, but overridden when singlesonly parameter is true; 类型: boolean; 可选
  - `allroles`: Whether or not to include all roles when filtering by artist, rather than default of excluding other contributors. When true it overrides any role filter value.; 类型: boolean; 可选
  - `singlesonly`: Only singles are returned when true, and overrides includesingles parameter; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarygetsources"></a>
### AudioLibrary.GetSources

**获取源**

Get all music sources, including unique ID

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetSources", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibraryscan"></a>
### AudioLibrary.Scan

**扫描库**

Scans the audio sources for new library items

**参数:**

  - `directory`: 目录路径; 类型: string; 可选
  - `showdialogs`: Whether or not to show the progress bar or any other GUI dialog; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="audiolibrarysetalbumdetails"></a>
### AudioLibrary.SetAlbumDetails

**设置专辑详情**

Update the given album with the given details

**参数:**

  - `albumid`: 专辑 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `artist`: 类型: array | null; 可选
  - `description`: 类型: ?; 可选
  - `genre`: 类型: array | null; 可选
  - `theme`: 类型: array | null; 可选
  - `mood`: 类型: array | null; 可选
  - `style`: 类型: array | null; 可选
  - `type`: 类型; 类型: ?; 可选
  - `albumlabel`: 类型: ?; 可选
  - `rating`: 类型: ?; 可选
  - `year`: 类型: ?; 可选
  - `userrating`: 类型: ?; 可选
  - `votes`: 类型: ?; 可选
  - `musicbrainzalbumid`: 类型: ?; 可选
  - `musicbrainzreleasegroupid`: 类型: ?; 可选
  - `sortartist`: 类型: ?; 可选
  - `displayartist`: 类型: ?; 可选
  - `musicbrainzalbumartistid`: 类型: array | null; 可选
  - `art`: 类型: null | object; 可选
  - `isboxset`: 类型: ?; 可选
  - `releasedate`: 类型: ?; 可选
  - `originaldate`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.SetAlbumDetails", "params": {"albumid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="audiolibrarysetartistdetails"></a>
### AudioLibrary.SetArtistDetails

**设置艺术家详情**

Update the given artist with the given details

**参数:**

  - `artistid`: 艺术家 ID; 类型: ?; 必需
  - `artist`: 类型: ?; 可选
  - `instrument`: 类型: array | null; 可选
  - `style`: 类型: array | null; 可选
  - `mood`: 类型: array | null; 可选
  - `born`: 类型: ?; 可选
  - `formed`: 类型: ?; 可选
  - `description`: 类型: ?; 可选
  - `genre`: 类型: array | null; 可选
  - `died`: 类型: ?; 可选
  - `disbanded`: 类型: ?; 可选
  - `yearsactive`: 类型: array | null; 可选
  - `musicbrainzartistid`: 类型: ?; 可选
  - `sortname`: 类型: ?; 可选
  - `type`: 类型; 类型: ?; 可选
  - `gender`: 类型: ?; 可选
  - `disambiguation`: 类型: ?; 可选
  - `art`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.SetArtistDetails", "params": {"artistid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="audiolibrarysetsongdetails"></a>
### AudioLibrary.SetSongDetails

**设置歌曲详情**

Update the given song with the given details

**参数:**

  - `songid`: 歌曲 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `artist`: 类型: array | null; 可选
  - `genre`: 类型: array | null; 可选
  - `year`: 类型: ?; 可选
  - `rating`: 类型: ?; 可选
  - `track`: 类型: ?; 可选
  - `disc`: 类型: ?; 可选
  - `duration`: 类型: ?; 可选
  - `comment`: 类型: ?; 可选
  - `musicbrainztrackid`: 类型: ?; 可选
  - `musicbrainzartistid`: 类型: ?; 可选
  - `playcount`: 类型: ?; 可选
  - `lastplayed`: 类型: ?; 可选
  - `userrating`: 类型: ?; 可选
  - `votes`: 类型: ?; 可选
  - `displayartist`: 类型: ?; 可选
  - `sortartist`: 类型: ?; 可选
  - `mood`: 类型: ?; 可选
  - `art`: 类型: null | object; 可选
  - `disctitle`: 类型: ?; 可选
  - `releasedate`: 类型: ?; 可选
  - `originaldate`: 类型: ?; 可选
  - `bpm`: 类型: ?; 可选
  - `songvideourl`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.SetSongDetails", "params": {"songid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="favourites"></a>
## Favourites — 收藏夹

<a id="favouritesaddfavourite"></a>
### Favourites.AddFavourite

**添加收藏**

Add a favourite with the given details

**参数:**

  - `title`: 标题; 类型: string; 必需
  - `type`: 类型; 类型: ?; 必需
  - `path`: 路径; 类型: ?; 可选
  - `window`: 要激活的窗口名称; 类型: ?; 可选
  - `windowparameter`: 类型: ?; 可选
  - `thumbnail`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Favourites.AddFavourite", "params": {"title": "Test", "type": "media"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "Favourites.AddFavourite",
      "stack": {
        "message": "Missing parameter",
        "name": "path",
        "type": "string"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="favouritesgetfavourites"></a>
### Favourites.GetFavourites

**获取收藏**

Retrieve all favourites

**参数:**

  - `type`: 类型; 可选值: media, window, script, androidapp, unknown; 类型: media | window | script | androidapp | unknown | null; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Favourites.GetFavourites", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="files"></a>
## Files — 文件系统

<a id="filesgetdirectory"></a>
### Files.GetDirectory

**获取目录**

Get the directories and files in the given directory

**参数:**

  - `directory`: 目录路径; 类型: string; 必需
  - `media`: 媒体类型 (video=视频, music=音乐, pictures=图片, files=文件, programs=程序); 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Files.GetDirectory", "params": {"directory": "/storage/videos"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "files": [
      {
        "file": "/storage/videos/4K_29.97-Chimei-inn-RoastDuck.mp4",
        "filetype": "file",
        "label": "4K_29.97-Chimei-inn-RoastDuck.mp4",
        "type": "unknown"
      },
      {
        "file": "/storage/videos/test_sbs.mp4",
        "filetype": "file",
        "label": "test_sbs.mp4",
        "type": "unknown"
      }
    ],
    "limits": {
      "end": 2,
      "start": 0,
      "total": 2
    }
  }
}
```

---

<a id="filesgetfiledetails"></a>
### Files.GetFileDetails

**获取文件详情**

Get details for a specific file

**参数:**

  - `file`: 文件路径; 类型: string; 必需
  - `media`: 媒体类型 (video=视频, music=音乐, pictures=图片, files=文件, programs=程序); 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Files.GetFileDetails", "params": {"file": "/storage/videos/test_sbs.mp4", "media": "video"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "filedetails": {
      "label": "test_sbs.mp4",
      "type": "unknown"
    }
  }
}
```

---

<a id="filesgetsources"></a>
### Files.GetSources

**获取源**

Get the sources of the media windows

**参数:**

  - `media`: 媒体类型 (video=视频, music=音乐, pictures=图片, files=文件, programs=程序); 类型: ?; 必需
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Files.GetSources", "params": {"media": "video"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "limits": {
      "end": 2,
      "start": 0,
      "total": 2
    },
    "sources": [
      {
        "file": "/storage/videos/",
        "label": "Videos"
      },
      {
        "file": "/storage/tvshows/",
        "label": "TV Shows"
      }
    ]
  }
}
```

---

<a id="filespreparedownload"></a>
### Files.PrepareDownload

**准备下载**

Provides a way to download a given file (e.g. providing an URL to the real file location)

**参数:**

  - `path`: 路径; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Files.PrepareDownload", "params": {"path": "/storage/videos/test_sbs.mp4"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "details": {
      "path": "vfs/%2fstorage%2fvideos%2ftest_sbs.mp4"
    },
    "mode": "redirect",
    "protocol": "http"
  }
}
```

---

<a id="filessetfiledetails"></a>
### Files.SetFileDetails

**设置文件详情**

Update the given specific file with the given details

**参数:**

  - `file`: 文件路径; 类型: string; 必需
  - `media`: 媒体类型 (video=视频, music=音乐, pictures=图片, files=文件, programs=程序); 类型: ?; 必需
  - `playcount`: 类型: ?; 可选
  - `lastplayed`: Setting a valid lastplayed without a playcount will force playcount to 1.; 类型: ?; 可选
  - `resume`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Files.SetFileDetails", "params": {"file": "/storage/videos/test_sbs.mp4", "media": "video"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="gui"></a>
## GUI — 图形界面

<a id="guiactivatescreensaver"></a>
### GUI.ActivateScreenSaver

**激活屏保**

Activates currently used screensaver

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.ActivateScreenSaver", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="guiactivatewindow"></a>
### GUI.ActivateWindow

**激活窗口**

Activates the given window

**参数:**

  - `window`: 要激活的窗口名称; 类型: ?; 必需
  - `parameters`: 类型: array; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.ActivateWindow", "params": {"window": "home"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="guigetproperties"></a>
### GUI.GetProperties

**获取 GUI 属性**

Retrieves the values of the given properties

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.GetProperties", "params": {"properties": ["currentwindow", "fullscreen"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "currentwindow": {
      "id": 12005,
      "label": "全屏视频"
    },
    "fullscreen": true
  }
}
```

---

<a id="guigetstereoscopicmodes"></a>
### GUI.GetStereoscopicModes

**获取 3D 模式列表**

Returns the supported stereoscopic modes of the GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.GetStereoscopicModes", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="guisetfullscreen"></a>
### GUI.SetFullscreen

**全屏切换**

Toggle fullscreen/GUI

**参数:**

  - `fullscreen`: 全屏 (true=全屏, false=窗口); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.SetFullscreen", "params": {"fullscreen": true}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": true
}
```

---

<a id="guisetstereoscopicmode"></a>
### GUI.SetStereoscopicMode

**设置 3D 模式**

Sets the stereoscopic mode of the GUI to the given mode

**参数:**

  - `mode`: 模式; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.SetStereoscopicMode", "params": {"mode": "off"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="guishownotification"></a>
### GUI.ShowNotification

**显示通知**

Shows a GUI notification

**参数:**

  - `title`: 标题; 类型: string; 必需
  - `message`: 消息内容; 类型: string; 必需
  - `image`: 图片路径; 可选值: info, warning, error; 类型: info | warning | error | string; 可选
  - `displaytime`: 显示时间 (毫秒); 类型: integer; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "GUI.ShowNotification", "params": {"title": "Test", "message": "Hello"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="input"></a>
## Input — 输入控制

<a id="inputback"></a>
### Input.Back

**返回**

Goes back in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Back", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputbuttonevent"></a>
### Input.ButtonEvent

**按钮事件**

Send a button press event

**参数:**

  - `button`: 按钮代码; 类型: string; 必需
  - `keymap`: 按键映射 (KB=键盘, GAME=游戏手柄); 类型: string; 必需
  - `holdtime`: Number of milliseconds to simulate button hold.; 类型: integer; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ButtonEvent", "params": {"button": "select", "keymap": "KB"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="inputcontextmenu"></a>
### Input.ContextMenu

**上下文菜单**

Shows the context menu

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ContextMenu", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputdown"></a>
### Input.Down

**方向键下**

Navigate down in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Down", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputexecuteaction"></a>
### Input.ExecuteAction

**执行指定动作**

Execute a specific action

**参数:**

  - `action`: 要执行的动作名称; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ExecuteAction", "params": {"action": "osd"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="inputhome"></a>
### Input.Home

**主页**

Goes to home window in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Home", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputinfo"></a>
### Input.Info

**信息**

Shows the information dialog

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Info", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputleft"></a>
### Input.Left

**方向键左**

Navigate left in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Left", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputright"></a>
### Input.Right

**方向键右**

Navigate right in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Right", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputselect"></a>
### Input.Select

**确认**

Select current item in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Select", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputsendtext"></a>
### Input.SendText

**发送文本**

Send a generic (unicode) text

**参数:**

  - `text`: 要发送的文本; 类型: string; 必需
  - `done`: Whether this is the whole input or not (closes an open input dialog if true).; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.SendText", "params": {"text": "..."}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="inputshowcodec"></a>
### Input.ShowCodec

**显示编码信息**

Show codec information of the playing item

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ShowCodec", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputshowosd"></a>
### Input.ShowOSD

**显示 OSD**

Show the on-screen display for the current player

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ShowOSD", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputshowplayerprocessinfo"></a>
### Input.ShowPlayerProcessInfo

**显示播放器进程信息**

Show player process information of the playing item, like video decoder, pixel format, pvr signal strength, ...

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.ShowPlayerProcessInfo", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="inputup"></a>
### Input.Up

**方向键上**

Navigate up in GUI

**请求:**

```json
{"jsonrpc": "2.0", "method": "Input.Up", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="jsonrpc"></a>
## JSONRPC — JSON-RPC 系统

<a id="jsonrpcintrospect"></a>
### JSONRPC.Introspect

**自省**

Enumerates all actions and descriptions

**参数:**

  - `getdescriptions`: 类型: boolean; 可选
  - `getmetadata`: 类型: boolean; 可选
  - `filterbytransport`: 类型: boolean; 可选
  - `filter`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.Introspect", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="jsonrpcnotifyall"></a>
### JSONRPC.NotifyAll

**通知所有**

Notify all other connected clients

**参数:**

  - `sender`: 类型: string; 必需
  - `message`: 消息内容; 类型: string; 必需
  - `data`: 类型: any; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.NotifyAll", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="jsonrpcpermission"></a>
### JSONRPC.Permission

**获取权限**

Retrieve the clients permissions

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.Permission", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="jsonrpcping"></a>
### JSONRPC.Ping

**测试连接**

Ping responder

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.Ping", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="jsonrpcversion"></a>
### JSONRPC.Version

**获取版本**

Retrieve the JSON-RPC protocol version.

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.Version", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvr"></a>
## PVR — PVR/电视

<a id="pvraddtimer"></a>
### PVR.AddTimer

**添加定时器**

Adds a timer to record the given show one times or a timer rule to record all showings of the given show or adds a reminder timer or reminder timer rule

**参数:**

  - `broadcastid`: 广播 ID; 类型: ?; 必需
  - `timerrule`: controls whether to create a timer rule or a onetime timer; 类型: boolean; 可选
  - `reminder`: controls whether to create a reminder timer or a recording timer; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.AddTimer", "params": {"broadcastid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrdeletetimer"></a>
### PVR.DeleteTimer

**删除定时器**

Deletes a onetime timer or a timer rule

**参数:**

  - `timerid`: 定时器 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.DeleteTimer", "params": {"timerid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetbroadcastdetails"></a>
### PVR.GetBroadcastDetails

**获取播放详情**

Retrieves the details of a specific broadcast

**参数:**

  - `broadcastid`: 广播 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetBroadcastDetails", "params": {"broadcastid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetbroadcastisplayable"></a>
### PVR.GetBroadcastIsPlayable

**检查是否可播放**

Retrieves whether or not a broadcast is playable

**参数:**

  - `broadcastid`: 广播 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetBroadcastIsPlayable", "params": {"broadcastid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetbroadcasts"></a>
### PVR.GetBroadcasts

**获取播放列表**

Retrieves the program of a specific channel

**参数:**

  - `channelid`: 频道 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetBroadcasts", "params": {"channelid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetchanneldetails"></a>
### PVR.GetChannelDetails

**获取频道详情**

Retrieves the details of a specific channel

**参数:**

  - `channelid`: 频道 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetChannelDetails", "params": {"channelid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetchannelgroupdetails"></a>
### PVR.GetChannelGroupDetails

**获取频道组详情**

Retrieves the details of a specific channel group

**参数:**

  - `channelgroupid`: 频道组 (alltv=所有电视, allradio=所有广播, 或自定义组名); 类型: ?; 必需
  - `channels`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetChannelGroupDetails", "params": {"channelgroupid": "alltv"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetchannelgroups"></a>
### PVR.GetChannelGroups

**获取频道组**

Retrieves the channel groups for the specified type

**参数:**

  - `channeltype`: 频道类型 (tv=电视, radio=广播); 类型: ?; 必需
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetChannelGroups", "params": {"channeltype": "tv"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetchannels"></a>
### PVR.GetChannels

**获取频道**

Retrieves the channel list

**参数:**

  - `channelgroupid`: 频道组 (alltv=所有电视, allradio=所有广播, 或自定义组名); 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetChannels", "params": {"channelgroupid": "alltv"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetclients"></a>
### PVR.GetClients

**获取客户端**

Retrieves the enabled PVR clients and their capabilities

**参数:**

  - `limits`: 分页限制 {start, end}; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetClients", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvrgetproperties"></a>
### PVR.GetProperties

**获取属性**

Retrieves the values of the given properties

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetProperties", "params": {"properties": ["available", "recording"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetrecordingdetails"></a>
### PVR.GetRecordingDetails

**获取录制详情**

Retrieves the details of a specific recording

**参数:**

  - `recordingid`: 录制 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetRecordingDetails", "params": {"recordingid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgetrecordings"></a>
### PVR.GetRecordings

**获取录制**

Retrieves the recordings

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetRecordings", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvrgettimerdetails"></a>
### PVR.GetTimerDetails

**获取定时器详情**

Retrieves the details of a specific timer

**参数:**

  - `timerid`: 定时器 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetTimerDetails", "params": {"timerid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="pvrgettimers"></a>
### PVR.GetTimers

**获取定时器**

Retrieves the timers

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetTimers", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvrrecord"></a>
### PVR.Record

**录制**

Toggle recording of a channel

**参数:**

  - `record`: 类型: ?; 可选
  - `channel`: 类型: current | integer(默认:-1); 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.Record", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvrscan"></a>
### PVR.Scan

**扫描**

Starts a channel scan

**参数:**

  - `clientid`: Specify a PVR client id to avoid UI dialog, optional in kodi 19, required in kodi 20; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="pvrtoggletimer"></a>
### PVR.ToggleTimer

**切换定时器**

Creates or deletes a onetime timer or timer rule for a given show. If it exists, it will be deleted. If it does not exist, it will be created

**参数:**

  - `broadcastid`: 广播 ID; 类型: ?; 必需
  - `timerrule`: controls whether to create / delete a timer rule or a onetime timer; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.ToggleTimer", "params": {"broadcastid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="player"></a>
## Player — 播放器

<a id="playeraddsubtitle"></a>
### Player.AddSubtitle

**添加字幕**

Add subtitle to the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `subtitle`: 字幕流 ID; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.AddSubtitle", "params": {"playerid": 1, "subtitle": "..."}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playergetactiveplayers"></a>
### Player.GetActivePlayers

**获取活跃播放器**

Returns all active players

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playergetaudiodelay"></a>
### Player.GetAudioDelay

**获取音频延迟**

Get the audio delay for the current playback

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetAudioDelay", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playergetitem"></a>
### Player.GetItem

**获取当前项**

Retrieves the currently played item

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetItem", "params": {"playerid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "item": {
      "label": "4K_29.97-Chimei-inn-RoastDuck.mp4",
      "type": "unknown"
    }
  }
}
```

---

<a id="playergetplayers"></a>
### Player.GetPlayers

**获取播放器列表**

Get a list of available players

**参数:**

  - `media`: 媒体类型 (video=视频, music=音乐, pictures=图片, files=文件, programs=程序); 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetPlayers", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playergetproperties"></a>
### Player.GetProperties

**获取播放器属性**

Retrieves the values of the given properties

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid": 1, "properties": ["speed", "repeat", "shuffled"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "repeat": "all",
    "shuffled": false,
    "speed": 1
  }
}
```

---

<a id="playergetviewmode"></a>
### Player.GetViewMode

**获取视图模式**

Get view mode of video player

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetViewMode", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playergoto"></a>
### Player.GoTo

**跳转到**

Go to previous/next/specific item in the playlist

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `to`: 跳转目标 (previous=上一曲, next=下一曲, first=第一首, last=最后一首); 可选值: previous, next; 类型: integer(默认:-1) | previous | next; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GoTo", "params": {"playerid": 1, "to": "previous"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playermove"></a>
### Player.Move

**移动**

If picture is zoomed move viewport left/right/up/down otherwise skip previous/next

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `direction`: 方向 (left=左, right=右, up=上, down=下); 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Move", "params": {"playerid": 1, "direction": "left"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playeropen"></a>
### Player.Open

**打开媒体**

Start playback of either the playlist with the given ID, a slideshow with the pictures from the given directory or a single file or an item from the database.

**参数:**

  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: [{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | object; 可选
  - `options`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Open", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playerplaypause"></a>
### Player.PlayPause

**播放/暂停**

Pauses or unpause playback and returns the new state

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `play`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.PlayPause", "params": {"playerid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "speed": 0
  }
}
```

---

<a id="playerrotate"></a>
### Player.Rotate

**旋转**

Rotates current picture

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `value`: 设置值; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Rotate", "params": {"playerid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="playerseek"></a>
### Player.Seek

**跳转**

Seek through the playing item

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `value`: 设置值; 类型: object; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Seek", "params": {"playerid": 1, "value": {"percentage": 50}}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "percentage": 25.938140869140625,
    "time": {
      "hours": 0,
      "milliseconds": 571,
      "minutes": 0,
      "seconds": 57
    },
    "totaltime": {
      "hours": 0,
      "milliseconds": 955,
      "minutes": 3,
      "seconds": 41
    }
  }
}
```

---

<a id="playersetaudiodelay"></a>
### Player.SetAudioDelay

**设置音频延迟**

Set the audio delay for the current playback

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `offset`: 类型: increment | decrement | number; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetAudioDelay", "params": {"playerid": 1, "offset": "increment"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "offset": 0.02500000037252903
  }
}
```

---

<a id="playersetaudiostream"></a>
### Player.SetAudioStream

**切换音频**

Set the audio stream played by the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `stream`: 类型: integer | previous | next; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetAudioStream", "params": {"playerid": 1, "stream": "previous"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersetpartymode"></a>
### Player.SetPartymode

**派对模式**

Turn partymode on or off

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `partymode`: 派对模式 (toggle=切换, true=开启, false=关闭); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetPartymode", "params": {"playerid": 1, "partymode": true}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersetrepeat"></a>
### Player.SetRepeat

**设置循环**

Set the repeat mode of the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `repeat`: 循环模式 (one=单曲, all=全部, off=关闭); 可选值: off, one, all; 类型: cycle | off | one | all; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetRepeat", "params": {"playerid": 1, "repeat": "off"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersetshuffle"></a>
### Player.SetShuffle

**设置随机**

Shuffle/Unshuffle items in the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `shuffle`: 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetShuffle", "params": {"playerid": 1, "shuffle": true}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersetspeed"></a>
### Player.SetSpeed

**设置速度**

Set the speed of the current playback

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `speed`: 速度 (increment=加速, decrement=减速); 可选值: -32, -16, -8, -4, -2, -1, 0, 1, 2, 4, 8, 16, 32; 类型: -32 | -16 | -8 | -4 | -2 | -1 | 0 | 1 | 2 | 4 | 8 | 16 | 32 | increment | decrement; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"playerid": 1, "speed": "increment"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "speed": 2
  }
}
```

---

<a id="playersetsubtitle"></a>
### Player.SetSubtitle

**切换字幕**

Set the subtitle displayed by the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `subtitle`: 字幕流 ID; 可选值: previous, next, off, on; 类型: integer | previous | next | off | on; 必需
  - `enable`: Whether to enable subtitles to be displayed after setting the new subtitle; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetSubtitle", "params": {"playerid": 1, "subtitle": "previous"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersettempo"></a>
### Player.SetTempo

**设置播放速率**

Set the tempo of the current playback

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `tempo`: 播放速率 (increment=加快, decrement=减慢); 可选值: increment, decrement; 类型: increment | decrement | number; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetTempo", "params": {"playerid": 1, "tempo": "increment"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="playersetvideostream"></a>
### Player.SetVideoStream

**切换视频流**

Set the video stream played by the player

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `stream`: 类型: integer | previous | next; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetVideoStream", "params": {"playerid": 1, "stream": "previous"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playersetviewmode"></a>
### Player.SetViewMode

**设置视图模式**

Set view mode of video player

**参数:**

  - `viewmode`: 类型: normal | zoom | stretch4x3 | widezoom | stretch16x9 | original | stretch16x9nonlin | zoom120width | zoom110width | object; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.SetViewMode", "params": {"viewmode": "normal"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playerstop"></a>
### Player.Stop

**停止**

Stops playback

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Stop", "params": {"playerid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playerzoom"></a>
### Player.Zoom

**缩放**

Zoom current picture

**参数:**

  - `playerid`: 播放器 ID (1=视频播放器); 类型: ?; 必需
  - `zoom`: 缩放 (in=放大, out=缩小, level1~9=级别, normal=正常); 可选值: in, out; 类型: in | out | integer(范围:1~10); 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Zoom", "params": {"playerid": 1, "zoom": "in"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32100,
    "message": "Failed to execute method."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="playlist"></a>
## Playlist — 播放列表

<a id="playlistadd"></a>
### Playlist.Add

**添加项**

Add item(s) to playlist

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: [{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.Add", "params": {"playlistid": 0, "item": {"file": "/storage/videos/test_sbs.mp4"}}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playlistclear"></a>
### Playlist.Clear

**清空**

Clear playlist

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.Clear", "params": {"playlistid": 0}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playlistgetitems"></a>
### Playlist.GetItems

**获取项**

Get all items from playlist

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params": {"playlistid": 0}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "items": [],
    "limits": {
      "end": 0,
      "start": 0,
      "total": 0
    }
  }
}
```

---

<a id="playlistgetplaylists"></a>
### Playlist.GetPlaylists

**获取播放列表**

Returns all existing playlists

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.GetPlaylists", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="playlistgetproperties"></a>
### Playlist.GetProperties

**获取属性**

Retrieves the values of the given properties

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.GetProperties", "params": {"playlistid": 0, "properties": ["type", "size"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "size": 0,
    "type": "audio"
  }
}
```

---

<a id="playlistinsert"></a>
### Playlist.Insert

**插入**

Insert item(s) into playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `position`: 位置索引 (从 0 开始); 类型: ?; 必需
  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: [{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.Insert", "params": {"playlistid": 0, "position": 0, "item": {"file": "/storage/videos/test_sbs.mp4"}}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playlistremove"></a>
### Playlist.Remove

**移除**

Remove item from playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `position`: 位置索引 (从 0 开始); 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.Remove", "params": {"playlistid": 0, "position": 0}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="playlistswap"></a>
### Playlist.Swap

**交换**

Swap items in the playlist. Does not work for picture playlists (aka slideshows).

**参数:**

  - `playlistid`: 播放列表 ID (0=当前视频播放列表); 类型: ?; 必需
  - `position1`: 第一个交换项的位置; 类型: ?; 必需
  - `position2`: 第二个交换项的位置; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Playlist.Swap", "params": {"playlistid": 0, "position1": 0, "position2": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="profiles"></a>
## Profiles — 配置文件

<a id="profilesgetcurrentprofile"></a>
### Profiles.GetCurrentProfile

**获取当前配置**

Retrieve the current profile

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Profiles.GetCurrentProfile", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="profilesgetprofiles"></a>
### Profiles.GetProfiles

**获取配置列表**

Retrieve all profiles

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Profiles.GetProfiles", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="profilesloadprofile"></a>
### Profiles.LoadProfile

**加载配置**

Load the specified profile

**参数:**

  - `profile`: 配置名称; 类型: string; 必需
  - `prompt`: Prompt for password; 类型: boolean; 可选
  - `password`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Profiles.LoadProfile", "params": {"profile": "Default"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="settings"></a>
## Settings — 设置

<a id="settingsgetcategories"></a>
### Settings.GetCategories

**获取分类**

Retrieves all setting categories

**参数:**

  - `level`: 级别 (basic=基本, advanced=高级, expert=专家); 类型: ?; 可选
  - `section`: 类型: string; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetCategories", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="settingsgetsections"></a>
### Settings.GetSections

**获取分区**

Retrieves all setting sections

**参数:**

  - `level`: 级别 (basic=基本, advanced=高级, expert=专家); 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSections", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="settingsgetsettingvalue"></a>
### Settings.GetSettingValue

**获取设置值**

Retrieves the value of a setting

**参数:**

  - `setting`: 设置项 ID; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSettingValue", "params": {"setting": "lookandfeel.skinzoom"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "value": 0
  }
}
```

---

<a id="settingsgetsettings"></a>
### Settings.GetSettings

**获取设置**

Retrieves all settings

**参数:**

  - `level`: 级别 (basic=基本, advanced=高级, expert=专家); 类型: ?; 可选
  - `filter`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSettings", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="settingsgetskinsettingvalue"></a>
### Settings.GetSkinSettingValue

**获取皮肤设置值**

Retrieves the value of the specified skin setting

**参数:**

  - `setting`: 设置项 ID; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSkinSettingValue", "params": {"setting": "skinstring"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="settingsgetskinsettings"></a>
### Settings.GetSkinSettings

**获取皮肤设置**

Retrieves all skin settings of the currently used skin

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSkinSettings", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="settingsresetsettingvalue"></a>
### Settings.ResetSettingValue

**重置设置**

Resets the value of a setting

**参数:**

  - `setting`: 设置项 ID; 类型: string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.ResetSettingValue", "params": {"setting": "lookandfeel.skinzoom"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="settingssetsettingvalue"></a>
### Settings.SetSettingValue

**设置值**

Changes the value of a setting

**参数:**

  - `setting`: 设置项 ID; 类型: string; 必需
  - `value`: 设置值; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.SetSettingValue", "params": {"setting": "lookandfeel.skinzoom", "value": 0}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": true
}
```

---

<a id="settingssetskinsettingvalue"></a>
### Settings.SetSkinSettingValue

**设置皮肤设置值**

Changes the value of the specified skin setting

**参数:**

  - `setting`: 设置项 ID; 类型: string; 必需
  - `value`: 设置值; 类型: boolean | string; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.SetSkinSettingValue", "params": {"setting": "skinstring", "value": "Estuary"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="system"></a>
## System — 系统

<a id="systemejectopticaldrive"></a>
### System.EjectOpticalDrive

**弹出光驱**

Ejects or closes the optical disc drive (if available)

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.EjectOpticalDrive", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="systemgetproperties"></a>
### System.GetProperties

**获取系统属性**

Retrieves the values of the given properties

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.GetProperties", "params": {"properties": ["version", "os"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "System.GetProperties",
      "stack": {
        "message": "array element at index 0 does not match",
        "name": "properties",
        "property": {
          "message": "Received value does not match any of the defined enum values",
          "name": "System.Property.Name",
          "type": "string"
        },
        "type": "array"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="systemhibernate"></a>
### System.Hibernate

**休眠**

Puts the system running Kodi into hibernate mode

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.Hibernate", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="systemreboot"></a>
### System.Reboot

**重启**

Reboots the system running Kodi

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.Reboot", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="systemshutdown"></a>
### System.Shutdown

**关机**

Shuts the system running Kodi down

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.Shutdown", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="systemsuspend"></a>
### System.Suspend

**待机**

Suspends the system running Kodi

**请求:**

```json
{"jsonrpc": "2.0", "method": "System.Suspend", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="textures"></a>
## Textures — 纹理

<a id="texturesgettextures"></a>
### Textures.GetTextures

**获取纹理**

Retrieve all textures

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `filter`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "Textures.GetTextures", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="texturesremovetexture"></a>
### Textures.RemoveTexture

**移除纹理**

Remove the specified texture

**参数:**

  - `textureid`: 纹理 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "Textures.RemoveTexture", "params": {"textureid": 0}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "Textures.RemoveTexture",
      "stack": {
        "message": "Value between 1 (inclusive) and 2147483647 (inclusive) expected but 0 received",
        "name": "textureid",
        "type": "integer"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrary"></a>
## VideoLibrary — 视频库

<a id="videolibraryclean"></a>
### VideoLibrary.Clean

**清理库**

Cleans the video library for non-existent items

**参数:**

  - `showdialogs`: Whether or not to show the progress bar or any other GUI dialog; 类型: boolean; 可选
  - `content`: Content type to clean for; 类型: string; 可选
  - `directory`: 目录路径; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Clean", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibraryexport"></a>
### VideoLibrary.Export

**导出库**

Exports all items from the video library

**参数:**

  - `options`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Export", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetavailableart"></a>
### VideoLibrary.GetAvailableArt

**获取可用艺术图**

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: object; 必需
  - `arttype`: 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetAvailableArt", "params": {"item": {"movieid": 1}}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "availableart": []
  }
}
```

---

<a id="videolibrarygetavailablearttypes"></a>
### VideoLibrary.GetAvailableArtTypes

**获取可用艺术图类型**

Retrieve a list of potential art types for a media item

**参数:**

  - `item`: 要播放/添加的媒体项 (支持 file/playlistid/movieid 等格式); 类型: object; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetAvailableArtTypes", "params": {"item": {"movieid": 1}}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "availablearttypes": []
  }
}
```

---

<a id="videolibrarygetepisodedetails"></a>
### VideoLibrary.GetEpisodeDetails

**获取剧集详情**

Retrieve details about a specific tv show episode

**参数:**

  - `episodeid`: 剧集 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetEpisodeDetails", "params": {"episodeid": 1, "properties": ["title", "showtitle"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygetepisodes"></a>
### VideoLibrary.GetEpisodes

**获取剧集**

Retrieve all tv show episodes

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 可选
  - `season`: 类型: integer; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Episodes'}] | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetEpisodes", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetgenres"></a>
### VideoLibrary.GetGenres

**获取分类**

Retrieve all genres

**参数:**

  - `type`: 类型; 类型: string; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetGenres", "params": {"type": "movie"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "genres": [],
    "limits": {
      "end": 0,
      "start": 0,
      "total": 0
    }
  }
}
```

---

<a id="videolibrarygetinprogresstvshows"></a>
### VideoLibrary.GetInProgressTVShows

**获取进行中剧集**

Retrieve all in progress tvshows

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetInProgressTVShows", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetmoviedetails"></a>
### VideoLibrary.GetMovieDetails

**获取电影详情**

Retrieve details about a specific movie

**参数:**

  - `movieid`: 电影 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", "params": {"movieid": 1, "properties": ["title", "year"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygetmoviesetdetails"></a>
### VideoLibrary.GetMovieSetDetails

**获取电影合集详情**

Retrieve details about a specific movie set

**参数:**

  - `setid`: 合集 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `movies`: 类型: object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieSetDetails", "params": {"setid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygetmoviesets"></a>
### VideoLibrary.GetMovieSets

**获取电影合集**

Retrieve all movie sets

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieSets", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetmovies"></a>
### VideoLibrary.GetMovies

**获取电影**

Retrieve all movies

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Movies'}] | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetmusicvideodetails"></a>
### VideoLibrary.GetMusicVideoDetails

**获取音乐视频详情**

Retrieve details about a specific music video

**参数:**

  - `musicvideoid`: 音乐视频 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMusicVideoDetails", "params": {"musicvideoid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygetmusicvideos"></a>
### VideoLibrary.GetMusicVideos

**获取音乐视频**

Retrieve all music videos

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.MusicVideos'}] | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMusicVideos", "params": {"properties": ["title", "artist"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "limits": {
      "end": 0,
      "start": 0,
      "total": 0
    },
    "musicvideos": []
  }
}
```

---

<a id="videolibrarygetrecentlyaddedepisodes"></a>
### VideoLibrary.GetRecentlyAddedEpisodes

**最近添加剧集**

Retrieve all recently added tv episodes

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetRecentlyAddedEpisodes", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetrecentlyaddedmovies"></a>
### VideoLibrary.GetRecentlyAddedMovies

**最近添加电影**

Retrieve all recently added movies

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetRecentlyAddedMovies", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygetrecentlyaddedmusicvideos"></a>
### VideoLibrary.GetRecentlyAddedMusicVideos

**最近添加音乐视频**

Retrieve all recently added music videos

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetRecentlyAddedMusicVideos", "params": {"properties": ["title"]}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "limits": {
      "end": 0,
      "start": 0,
      "total": 0
    },
    "musicvideos": []
  }
}
```

---

<a id="videolibrarygetseasondetails"></a>
### VideoLibrary.GetSeasonDetails

**获取季度详情**

Retrieve details about a specific tv show season

**参数:**

  - `seasonid`: 季度 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetSeasonDetails", "params": {"seasonid": 1, "properties": ["season", "tvshowid"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygetseasons"></a>
### VideoLibrary.GetSeasons

**获取季度**

Retrieve all tv seasons

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 可选
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetSeasons", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygettvshowdetails"></a>
### VideoLibrary.GetTVShowDetails

**获取电视剧详情**

Retrieve details about a specific tv show

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetTVShowDetails", "params": {"tvshowid": 1, "properties": ["title", "season"]}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarygettvshows"></a>
### VideoLibrary.GetTVShows

**获取电视剧**

Retrieve all tv shows

**参数:**

  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选
  - `filter`: 类型: [{'properties': {'and': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.TVShows'}] | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetTVShows", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarygettags"></a>
### VideoLibrary.GetTags

**获取标签**

Retrieve all tags

**参数:**

  - `type`: 类型; 类型: string; 必需
  - `properties`: 要获取的属性列表, 可选值取决于具体方法; 类型: ?; 可选
  - `limits`: 分页限制 {start, end}; 类型: ?; 可选
  - `sort`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetTags", "params": {"type": "movie"}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "limits": {
      "end": 0,
      "start": 0,
      "total": 0
    },
    "tags": []
  }
}
```

---

<a id="videolibraryrefreshepisode"></a>
### VideoLibrary.RefreshEpisode

**刷新剧集**

Refresh the given episode in the library

**参数:**

  - `episodeid`: 剧集 ID; 类型: ?; 必需
  - `ignorenfo`: Whether or not to ignore a local NFO if present.; 类型: boolean; 可选
  - `title`: 标题; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RefreshEpisode", "params": {"episodeid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibraryrefreshmovie"></a>
### VideoLibrary.RefreshMovie

**刷新电影**

Refresh the given movie in the library

**参数:**

  - `movieid`: 电影 ID; 类型: ?; 必需
  - `ignorenfo`: Whether or not to ignore a local NFO if present.; 类型: boolean; 可选
  - `title`: 标题; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RefreshMovie", "params": {"movieid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibraryrefreshmusicvideo"></a>
### VideoLibrary.RefreshMusicVideo

**刷新音乐视频**

Refresh the given music video in the library

**参数:**

  - `musicvideoid`: 音乐视频 ID; 类型: ?; 必需
  - `ignorenfo`: Whether or not to ignore a local NFO if present.; 类型: boolean; 可选
  - `title`: 标题; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RefreshMusicVideo", "params": {"musicvideoid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibraryrefreshtvshow"></a>
### VideoLibrary.RefreshTVShow

**刷新电视剧**

Refresh the given tv show in the library

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 必需
  - `ignorenfo`: Whether or not to ignore a local NFO if present.; 类型: boolean; 可选
  - `refreshepisodes`: Whether or not to refresh all episodes belonging to the TV show.; 类型: boolean; 可选
  - `title`: 标题; 类型: string; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RefreshTVShow", "params": {"tvshowid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibraryremoveepisode"></a>
### VideoLibrary.RemoveEpisode

**移除剧集**

Removes the given episode from the library

**参数:**

  - `episodeid`: 剧集 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RemoveEpisode", "params": {"episodeid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="videolibraryremovemovie"></a>
### VideoLibrary.RemoveMovie

**移除电影**

Removes the given movie from the library

**参数:**

  - `movieid`: 电影 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RemoveMovie", "params": {"movieid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="videolibraryremovemusicvideo"></a>
### VideoLibrary.RemoveMusicVideo

**移除音乐视频**

Removes the given music video from the library

**参数:**

  - `musicvideoid`: 音乐视频 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RemoveMusicVideo", "params": {"musicvideoid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="videolibraryremovetvshow"></a>
### VideoLibrary.RemoveTVShow

**移除电视剧**

Removes the given tv show from the library

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.RemoveTVShow", "params": {"tvshowid": 1}, "id": 1}
```

**响应:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "OK"
}
```

---

<a id="videolibraryscan"></a>
### VideoLibrary.Scan

**扫描库**

Scans the video sources for new library items

**参数:**

  - `directory`: 目录路径; 类型: string; 可选
  - `showdialogs`: Whether or not to show the progress bar or any other GUI dialog; 类型: boolean; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

---

<a id="videolibrarysetepisodedetails"></a>
### VideoLibrary.SetEpisodeDetails

**设置剧集详情**

Update the given episode with the given details

**参数:**

  - `episodeid`: 剧集 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `playcount`: 类型: ?; 可选
  - `runtime`: Runtime in seconds; 类型: ?; 可选
  - `director`: 类型: array | null; 可选
  - `plot`: 类型: ?; 可选
  - `rating`: 类型: ?; 可选
  - `votes`: 类型: ?; 可选
  - `lastplayed`: 类型: ?; 可选
  - `writer`: 类型: array | null; 可选
  - `firstaired`: 类型: ?; 可选
  - `productioncode`: 类型: ?; 可选
  - `season`: 类型: ?; 可选
  - `episode`: 类型: ?; 可选
  - `originaltitle`: 类型: ?; 可选
  - `thumbnail`: 类型: ?; 可选
  - `fanart`: 类型: ?; 可选
  - `art`: 类型: null | object; 可选
  - `resume`: 类型: null | object; 可选
  - `userrating`: 类型: ?; 可选
  - `ratings`: 类型: ?; 可选
  - `dateadded`: 类型: ?; 可选
  - `uniqueid`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetEpisodeDetails", "params": {"episodeid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarysetmoviedetails"></a>
### VideoLibrary.SetMovieDetails

**设置电影详情**

Update the given movie with the given details

**参数:**

  - `movieid`: 电影 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `playcount`: 类型: ?; 可选
  - `runtime`: Runtime in seconds; 类型: ?; 可选
  - `director`: 类型: array | null; 可选
  - `studio`: 类型: array | null; 可选
  - `year`: linked with premiered. Overridden by premiered parameter; 类型: ?; 可选
  - `plot`: 类型: ?; 可选
  - `genre`: 类型: array | null; 可选
  - `rating`: 类型: ?; 可选
  - `mpaa`: 类型: ?; 可选
  - `imdbnumber`: 类型: ?; 可选
  - `votes`: 类型: ?; 可选
  - `lastplayed`: 类型: ?; 可选
  - `originaltitle`: 类型: ?; 可选
  - `trailer`: 类型: ?; 可选
  - `tagline`: 类型: ?; 可选
  - `plotoutline`: 类型: ?; 可选
  - `writer`: 类型: array | null; 可选
  - `country`: 类型: array | null; 可选
  - `top250`: 类型: ?; 可选
  - `sorttitle`: 类型: ?; 可选
  - `set`: 类型: ?; 可选
  - `showlink`: 类型: array | null; 可选
  - `thumbnail`: 类型: ?; 可选
  - `fanart`: 类型: ?; 可选
  - `tag`: 类型: array | null; 可选
  - `art`: 类型: null | object; 可选
  - `resume`: 类型: null | object; 可选
  - `userrating`: 类型: ?; 可选
  - `ratings`: 类型: ?; 可选
  - `dateadded`: 类型: ?; 可选
  - `premiered`: linked with year. Overrides year; 类型: ?; 可选
  - `uniqueid`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarysetmoviesetdetails"></a>
### VideoLibrary.SetMovieSetDetails

**设置电影合集详情**

Update the given movie set with the given details

**参数:**

  - `setid`: 合集 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `art`: 类型: null | object; 可选
  - `plot`: 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieSetDetails", "params": {"setid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarysetmusicvideodetails"></a>
### VideoLibrary.SetMusicVideoDetails

**设置音乐视频详情**

Update the given music video with the given details

**参数:**

  - `musicvideoid`: 音乐视频 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `playcount`: 类型: ?; 可选
  - `runtime`: Runtime in seconds; 类型: ?; 可选
  - `director`: 类型: array | null; 可选
  - `studio`: 类型: array | null; 可选
  - `year`: linked with premiered. Overridden by premiered parameter; 类型: ?; 可选
  - `plot`: 类型: ?; 可选
  - `album`: 类型: ?; 可选
  - `artist`: 类型: array | null; 可选
  - `genre`: 类型: array | null; 可选
  - `track`: 类型: ?; 可选
  - `lastplayed`: 类型: ?; 可选
  - `thumbnail`: 类型: ?; 可选
  - `fanart`: 类型: ?; 可选
  - `tag`: 类型: array | null; 可选
  - `art`: 类型: null | object; 可选
  - `resume`: 类型: null | object; 可选
  - `rating`: 类型: ?; 可选
  - `userrating`: 类型: ?; 可选
  - `dateadded`: 类型: ?; 可选
  - `premiered`: linked with year. Overrides year; 类型: ?; 可选
  - `uniqueid`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetMusicVideoDetails", "params": {"musicvideoid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarysetseasondetails"></a>
### VideoLibrary.SetSeasonDetails

**设置季度详情**

Update the given season with the given details

**参数:**

  - `seasonid`: 季度 ID; 类型: ?; 必需
  - `art`: 类型: null | object; 可选
  - `userrating`: 类型: ?; 可选
  - `title`: 标题; 类型: ?; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetSeasonDetails", "params": {"seasonid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="videolibrarysettvshowdetails"></a>
### VideoLibrary.SetTVShowDetails

**设置电视剧详情**

Update the given tvshow with the given details

**参数:**

  - `tvshowid`: 电视剧 ID; 类型: ?; 必需
  - `title`: 标题; 类型: ?; 可选
  - `playcount`: 类型: ?; 可选
  - `studio`: 类型: array | null; 可选
  - `plot`: 类型: ?; 可选
  - `genre`: 类型: array | null; 可选
  - `rating`: 类型: ?; 可选
  - `mpaa`: 类型: ?; 可选
  - `imdbnumber`: 类型: ?; 可选
  - `premiered`: 类型: ?; 可选
  - `votes`: 类型: ?; 可选
  - `lastplayed`: 类型: ?; 可选
  - `originaltitle`: 类型: ?; 可选
  - `sorttitle`: 类型: ?; 可选
  - `episodeguide`: 类型: ?; 可选
  - `thumbnail`: 类型: ?; 可选
  - `fanart`: 类型: ?; 可选
  - `tag`: 类型: array | null; 可选
  - `art`: 类型: null | object; 可选
  - `userrating`: 类型: ?; 可选
  - `ratings`: 类型: ?; 可选
  - `dateadded`: 类型: ?; 可选
  - `runtime`: Runtime in seconds; 类型: ?; 可选
  - `status`: Valid values: 'returning series', 'in production', 'planned', 'cancelled', 'ended'; 类型: ?; 可选
  - `uniqueid`: 类型: null | object; 可选

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.SetTVShowDetails", "params": {"tvshowid": 1}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="xbmc"></a>
## XBMC — 系统(兼容)

<a id="xbmcgetinfobooleans"></a>
### XBMC.GetInfoBooleans

**获取信息布尔值**

Retrieve info booleans about Kodi and the system

**参数:**

  - `booleans`: 要查询的布尔信息项; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "XBMC.GetInfoBooleans", "params": {"booleans": "System.ScreenSaverActive"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "XBMC.GetInfoBooleans",
      "stack": {
        "message": "Invalid type string received",
        "name": "booleans",
        "type": "array"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

<a id="xbmcgetinfolabels"></a>
### XBMC.GetInfoLabels

**获取信息标签**

Retrieve info labels about Kodi and the system

**参数:**

  - `labels`: 要查询的标签项; 类型: array; 必需

**请求:**

```json
{"jsonrpc": "2.0", "method": "XBMC.GetInfoLabels", "params": {"labels": "System.Time"}, "id": 1}
```

**响应:**

```json
{
  "error": {
    "code": -32602,
    "data": {
      "method": "XBMC.GetInfoLabels",
      "stack": {
        "message": "Invalid type string received",
        "name": "labels",
        "type": "array"
      }
    },
    "message": "Invalid params."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

---

## 错误码附录

| 错误码 | 说明 | 触发方法 | 如何避免 |
|--------|------|----------|----------|
| `-32700` | JSON 格式错误 | （未触发） | 预防性注意 |
| `-32603` | KODI 内部错误 | （未触发） | 预防性注意 |
| `-32602` | 参数不合法 | `Addons.ExecuteAddon`, `Addons.GetAddonDetails`, `Addons.SetAddonEnabled`, `AudioLibrary.GetAlbumDetails`, `AudioLibrary.GetAvailableArt`, `AudioLibrary.GetAvailableArtTypes`, `AudioLibrary.GetProperties`, `AudioLibrary.GetSongDetails`, `AudioLibrary.SetAlbumDetails`, `AudioLibrary.SetSongDetails`, `Favourites.AddFavourite`, `Profiles.LoadProfile`, `Settings.GetSkinSettingValue`, `Settings.SetSkinSettingValue`, `System.GetProperties`, `Textures.RemoveTexture`, `VideoLibrary.GetEpisodeDetails`, `VideoLibrary.GetMovieDetails`, `VideoLibrary.GetMovieSetDetails`, `VideoLibrary.GetMusicVideoDetails`, `VideoLibrary.GetSeasonDetails`, `VideoLibrary.GetTVShowDetails`, `VideoLibrary.RefreshEpisode`, `VideoLibrary.RefreshMovie`, `VideoLibrary.RefreshMusicVideo`, `VideoLibrary.RefreshTVShow`, `VideoLibrary.SetEpisodeDetails`, `VideoLibrary.SetMovieDetails`, `VideoLibrary.SetMovieSetDetails`, `VideoLibrary.SetMusicVideoDetails`, `VideoLibrary.SetSeasonDetails`, `VideoLibrary.SetTVShowDetails`, `XBMC.GetInfoBooleans`, `XBMC.GetInfoLabels` | 确保参数合法；确认当前状态支持 |
| `-32601` | 方法不存在 | （未触发） | 预防性注意 |
| `-32600` | 非法请求 | （未触发） | 预防性注意 |
| `-32100` | 当前状态不支持 | `PVR.AddTimer`, `PVR.DeleteTimer`, `PVR.GetBroadcastDetails`, `PVR.GetBroadcastIsPlayable`, `PVR.GetBroadcasts`, `PVR.GetChannelDetails`, `PVR.GetChannelGroupDetails`, `PVR.GetChannelGroups`, `PVR.GetChannels`, `PVR.GetProperties`, `PVR.GetRecordingDetails`, `PVR.GetTimerDetails`, `PVR.ToggleTimer`, `Player.Rotate`, `Player.SetTempo`, `Player.Zoom` | 确保参数合法；确认当前状态支持 |
| `-32000` | 返回结果过大 | （未触发） | 预防性注意 |

---

*文档自动生成*