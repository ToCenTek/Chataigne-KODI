# KODI JSON-RPC API 参考 (v13.5.0)

> 从当前 KODI 21 (Omega) 自动提取，每个方法均含实测请求与响应。

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

  - `addonid` (string, 必需): 
  - `params` (object | array | string, 可选): 
  - `wait` (boolean, 可选): 

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

**返回:** `string`

---

<a id="addonsgetaddondetails"></a>
### Addons.GetAddonDetails

**获取插件详情**

Gets the details of a specific addon

**参数:**

  - `addonid` (string, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `addon`: object
  - `limits`: object

---

<a id="addonsgetaddons"></a>
### Addons.GetAddons

**获取插件**

Gets all available addons

**参数:**

  - `type` (?, 可选): 
  - `content` (?, 可选): Content provided by the addon. Only considered for plugins and scripts.
  - `enabled` (boolean | all, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `installed` (boolean | all, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Addons.GetAddons", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `addons`: array
  - `limits`: object

---

<a id="addonssetaddonenabled"></a>
### Addons.SetAddonEnabled

**启用/禁用插件**

Enables/Disables a specific addon

**参数:**

  - `addonid` (string, 必需): 
  - `enabled` (?, 必需): 

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

**返回:** `string`

---

<a id="application"></a>
## Application — 应用程序

<a id="applicationgetproperties"></a>
### Application.GetProperties

**获取应用程序属性**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

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

**返回:** `string`

---

<a id="applicationsetmute"></a>
### Application.SetMute

**设置静音**

Toggle mute/unmute

**参数:**

  - `mute` (?, 必需): 

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

  - `volume` (integer(范围:0~100) | increment | decrement, 必需): 

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

  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Clean", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="audiolibraryexport"></a>
### AudioLibrary.Export

**导出库**

Exports all items from the audio library

**参数:**

  - `options` (object | object, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Export", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="audiolibrarygetalbumdetails"></a>
### AudioLibrary.GetAlbumDetails

**获取专辑详情**

Retrieve details about a specific album

**参数:**

  - `albumid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `albumdetails`: object

---

<a id="audiolibrarygetalbums"></a>
### AudioLibrary.GetAlbums

**获取专辑**

Retrieve all albums from specified artist (and role) or that has songs of the specified genre

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Albums'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Albums'}], 可选): 
  - `includesingles` (boolean, 可选): 
  - `allroles` (boolean, 可选): Whether or not to include all roles when filtering by artist, rather than the default of excluding other contributions. When true it overrides any role filter value.

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `albums`: array
  - `limits`: object

---

<a id="audiolibrarygetartistdetails"></a>
### AudioLibrary.GetArtistDetails

**获取艺术家详情**

Retrieve details about a specific artist

**参数:**

  - `artistid` (?, 必需): 
  - `properties` (?, 可选): 

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

  - `albumartistsonly` (?, 可选): Whether or not to only include album artists rather than the artists of only individual songs as well. If the parameter is not passed or is passed as null the GUI setting will be used
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Artists'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Artists'}], 可选): 
  - `allroles` (boolean, 可选): Whether or not to include all artists irrespective of the role they contributed. When true it overrides any role filter value.

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetArtists", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `artists`: array
  - `limits`: object

---

<a id="audiolibrarygetavailableart"></a>
### AudioLibrary.GetAvailableArt

**获取可用艺术图**

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item` (object | object, 必需): 
  - `arttype` (string, 可选): 

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

**返回结构:** object
  - `availableart`: array

---

<a id="audiolibrarygetavailablearttypes"></a>
### AudioLibrary.GetAvailableArtTypes

**获取可用艺术图类型**

Retrieve a list of potential art types for a media item

**参数:**

  - `item` (object | object, 必需): 

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

**返回结构:** object
  - `availablearttypes`: array

---

<a id="audiolibrarygetgenres"></a>
### AudioLibrary.GetGenres

**获取分类**

Retrieve all genres

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetGenres", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `genres`: array
  - `limits`: object

---

<a id="audiolibrarygetproperties"></a>
### AudioLibrary.GetProperties

**获取属性**

Retrieves the values of the music library properties

**参数:**

  - `properties` (array, 必需): 

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

**返回:** `?`

---

<a id="audiolibrarygetrecentlyaddedalbums"></a>
### AudioLibrary.GetRecentlyAddedAlbums

**最近添加专辑**

Retrieve recently added albums

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyAddedAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `albums`: array
  - `limits`: object

---

<a id="audiolibrarygetrecentlyaddedsongs"></a>
### AudioLibrary.GetRecentlyAddedSongs

**最近添加歌曲**

Retrieve recently added songs

**参数:**

  - `albumlimit` (?, 可选): The amount of recently added albums from which to return the songs
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyAddedSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `songs`: array

---

<a id="audiolibrarygetrecentlyplayedalbums"></a>
### AudioLibrary.GetRecentlyPlayedAlbums

**最近播放专辑**

Retrieve recently played albums

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyPlayedAlbums", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `albums`: array
  - `limits`: object

---

<a id="audiolibrarygetrecentlyplayedsongs"></a>
### AudioLibrary.GetRecentlyPlayedSongs

**最近播放歌曲**

Retrieve recently played songs

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyPlayedSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `songs`: array

---

<a id="audiolibrarygetroles"></a>
### AudioLibrary.GetRoles

**获取角色**

Retrieve all contributor roles

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetRoles", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `roles`: array

---

<a id="audiolibrarygetsongdetails"></a>
### AudioLibrary.GetSongDetails

**获取歌曲详情**

Retrieve details about a specific song

**参数:**

  - `songid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `songdetails`: object

---

<a id="audiolibrarygetsongs"></a>
### AudioLibrary.GetSongs

**获取歌曲**

Retrieve all songs from specified album, artist or genre

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Songs'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Songs'}], 可选): 
  - `includesingles` (boolean, 可选): Only songs from albums are returned when false, but overridden when singlesonly parameter is true
  - `allroles` (boolean, 可选): Whether or not to include all roles when filtering by artist, rather than default of excluding other contributors. When true it overrides any role filter value.
  - `singlesonly` (boolean, 可选): Only singles are returned when true, and overrides includesingles parameter

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetSongs", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `songs`: array

---

<a id="audiolibrarygetsources"></a>
### AudioLibrary.GetSources

**获取源**

Get all music sources, including unique ID

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.GetSources", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `sources`: array

---

<a id="audiolibraryscan"></a>
### AudioLibrary.Scan

**扫描库**

Scans the audio sources for new library items

**参数:**

  - `directory` (string, 可选): 
  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**请求:**

```json
{"jsonrpc": "2.0", "method": "AudioLibrary.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="audiolibrarysetalbumdetails"></a>
### AudioLibrary.SetAlbumDetails

**设置专辑详情**

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

**返回:** `string`

---

<a id="audiolibrarysetartistdetails"></a>
### AudioLibrary.SetArtistDetails

**设置艺术家详情**

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

**返回:** `string`

---

<a id="favourites"></a>
## Favourites — 收藏夹

<a id="favouritesaddfavourite"></a>
### Favourites.AddFavourite

**添加收藏**

Add a favourite with the given details

**参数:**

  - `title` (string, 必需): 
  - `type` (?, 必需): 
  - `path` (?, 可选): Required for media, script and androidapp favourites types
  - `window` (?, 可选): Required for window favourite type
  - `windowparameter` (?, 可选): 
  - `thumbnail` (?, 可选): 

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

**返回:** `string`

---

<a id="favouritesgetfavourites"></a>
### Favourites.GetFavourites

**获取收藏**

Retrieve all favourites

**参数:**

  - `type` (null | media | window | script | androidapp | unknown, 可选): 
  - `properties` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Favourites.GetFavourites", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `favourites`: array
  - `limits`: object

---

<a id="files"></a>
## Files — 文件系统

<a id="filesgetdirectory"></a>
### Files.GetDirectory

**获取目录**

Get the directories and files in the given directory

**参数:**

  - `directory` (string, 必需): 
  - `media` (?, 可选): 
  - `properties` (?, 可选): 
  - `sort` (?, 可选): 
  - `limits` (?, 可选): Limits are applied after getting the directory content thus retrieval is not faster when they are applied.

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

  - `file` (string, 必需): Full path to the file
  - `media` (?, 可选): 
  - `properties` (?, 可选): 

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

  - `media` (?, 必需): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

  - `path` (string, 必需): 

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

  - `file` (string, 必需): Full path to the file
  - `media` (?, 必需): File type to update correct database. Currently only "video" is supported.
  - `playcount` (?, 可选): 
  - `lastplayed` (?, 可选): Setting a valid lastplayed without a playcount will force playcount to 1.
  - `resume` (null | object, 可选): 

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

**返回:** `string`

---

<a id="guiactivatewindow"></a>
### GUI.ActivateWindow

**激活窗口**

Activates the given window

**参数:**

  - `window` (?, 必需): 
  - `parameters` (array, 可选): 

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

  - `properties` (array, 必需): 

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

**返回结构:** object
  - `stereoscopicmodes`: array

---

<a id="guisetfullscreen"></a>
### GUI.SetFullscreen

**全屏切换**

Toggle fullscreen/GUI

**参数:**

  - `fullscreen` (?, 必需): 

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

  - `mode` (string, 必需): 

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

  - `title` (string, 必需): 
  - `message` (string, 必需): 
  - `image` (info | warning | error | string, 可选): 
  - `displaytime` (integer, 可选): The time in milliseconds the notification will be visible

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

**返回:** `string`

---

<a id="inputbuttonevent"></a>
### Input.ButtonEvent

**按钮事件**

Send a button press event

**参数:**

  - `button` (string, 必需): Button name
  - `keymap` (string, 必需): Keymap name (KB, XG, R1, or R2)
  - `holdtime` (integer, 可选): Number of milliseconds to simulate button hold.

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

**返回:** `string`

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

**返回:** `string`

---

<a id="inputexecuteaction"></a>
### Input.ExecuteAction

**执行指定动作**

Execute a specific action

**参数:**

  - `action` (?, 必需): 

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

---

<a id="inputsendtext"></a>
### Input.SendText

**发送文本**

Send a generic (unicode) text

**参数:**

  - `text` (string, 必需): Unicode text
  - `done` (boolean, 可选): Whether this is the whole input or not (closes an open input dialog if true).

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

---

<a id="jsonrpc"></a>
## JSONRPC — JSON-RPC 系统

<a id="jsonrpcintrospect"></a>
### JSONRPC.Introspect

**自省**

Enumerates all actions and descriptions

**参数:**

  - `getdescriptions` (boolean, 可选): 
  - `getmetadata` (boolean, 可选): 
  - `filterbytransport` (boolean, 可选): 
  - `filter` (object, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.Introspect", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `object`

---

<a id="jsonrpcnotifyall"></a>
### JSONRPC.NotifyAll

**通知所有**

Notify all other connected clients

**参数:**

  - `sender` (string, 必需): 
  - `message` (string, 必需): 
  - `data` (any, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "JSONRPC.NotifyAll", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `any`

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

**返回结构:** object
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

**返回:** `string`

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

**返回结构:** object
  - `version`: object

---

<a id="pvr"></a>
## PVR — PVR/电视

<a id="pvraddtimer"></a>
### PVR.AddTimer

**添加定时器**

Adds a timer to record the given show one times or a timer rule to record all showings of the given show or adds a reminder timer or reminder timer rule

**参数:**

  - `broadcastid` (?, 必需): the broadcast id of the item to record
  - `timerrule` (boolean, 可选): controls whether to create a timer rule or a onetime timer
  - `reminder` (boolean, 可选): controls whether to create a reminder timer or a recording timer

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

**返回:** `string`

---

<a id="pvrdeletetimer"></a>
### PVR.DeleteTimer

**删除定时器**

Deletes a onetime timer or a timer rule

**参数:**

  - `timerid` (?, 必需): the id of the onetime timer or timer rule to delete

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

**返回:** `string`

---

<a id="pvrgetbroadcastdetails"></a>
### PVR.GetBroadcastDetails

**获取播放详情**

Retrieves the details of a specific broadcast

**参数:**

  - `broadcastid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `broadcastdetails`: object

---

<a id="pvrgetbroadcastisplayable"></a>
### PVR.GetBroadcastIsPlayable

**检查是否可播放**

Retrieves whether or not a broadcast is playable

**参数:**

  - `broadcastid` (?, 必需): the id of the broadcast to check for playability

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

**返回:** `boolean`

---

<a id="pvrgetbroadcasts"></a>
### PVR.GetBroadcasts

**获取播放列表**

Retrieves the program of a specific channel

**参数:**

  - `channelid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 

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

**返回结构:** object
  - `broadcasts`: array
  - `limits`: object

---

<a id="pvrgetchanneldetails"></a>
### PVR.GetChannelDetails

**获取频道详情**

Retrieves the details of a specific channel

**参数:**

  - `channelid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `channeldetails`: object

---

<a id="pvrgetchannelgroupdetails"></a>
### PVR.GetChannelGroupDetails

**获取频道组详情**

Retrieves the details of a specific channel group

**参数:**

  - `channelgroupid` (?, 必需): 
  - `channels` (object, 可选): 

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

**返回结构:** object
  - `channelgroupdetails`: object

---

<a id="pvrgetchannelgroups"></a>
### PVR.GetChannelGroups

**获取频道组**

Retrieves the channel groups for the specified type

**参数:**

  - `channeltype` (?, 必需): 
  - `limits` (?, 可选): 

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

**返回结构:** object
  - `channelgroups`: array
  - `limits`: object

---

<a id="pvrgetchannels"></a>
### PVR.GetChannels

**获取频道**

Retrieves the channel list

**参数:**

  - `channelgroupid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

**返回结构:** object
  - `channels`: array
  - `limits`: object

---

<a id="pvrgetclients"></a>
### PVR.GetClients

**获取客户端**

Retrieves the enabled PVR clients and their capabilities

**参数:**

  - `limits` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetClients", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `clients`: array
  - `limits`: object

---

<a id="pvrgetproperties"></a>
### PVR.GetProperties

**获取属性**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

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

**返回:** `?`

---

<a id="pvrgetrecordingdetails"></a>
### PVR.GetRecordingDetails

**获取录制详情**

Retrieves the details of a specific recording

**参数:**

  - `recordingid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `recordingdetails`: object

---

<a id="pvrgetrecordings"></a>
### PVR.GetRecordings

**获取录制**

Retrieves the recordings

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetRecordings", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `recordings`: array

---

<a id="pvrgettimerdetails"></a>
### PVR.GetTimerDetails

**获取定时器详情**

Retrieves the details of a specific timer

**参数:**

  - `timerid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `timerdetails`: object

---

<a id="pvrgettimers"></a>
### PVR.GetTimers

**获取定时器**

Retrieves the timers

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.GetTimers", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `timers`: array

---

<a id="pvrrecord"></a>
### PVR.Record

**录制**

Toggle recording of a channel

**参数:**

  - `record` (?, 可选): 
  - `channel` (current | integer(默认:-1), 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.Record", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="pvrscan"></a>
### PVR.Scan

**扫描**

Starts a channel scan

**参数:**

  - `clientid` (?, 可选): Specify a PVR client id to avoid UI dialog, optional in kodi 19, required in kodi 20

**请求:**

```json
{"jsonrpc": "2.0", "method": "PVR.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="pvrtoggletimer"></a>
### PVR.ToggleTimer

**切换定时器**

Creates or deletes a onetime timer or timer rule for a given show. If it exists, it will be deleted. If it does not exist, it will be created

**参数:**

  - `broadcastid` (?, 必需): the broadcast id of the item to toggle a onetime timer or time rule for
  - `timerrule` (boolean, 可选): controls whether to create / delete a timer rule or a onetime timer

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

**返回:** `string`

---

<a id="player"></a>
## Player — 播放器

<a id="playeraddsubtitle"></a>
### Player.AddSubtitle

**添加字幕**

Add subtitle to the player

**参数:**

  - `playerid` (?, 必需): 
  - `subtitle` (string, 必需): Local path or remote URL to the subtitle file to load

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

**返回:** `array`

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

**返回结构:** object
  - `offset`: number

---

<a id="playergetitem"></a>
### Player.GetItem

**获取当前项**

Retrieves the currently played item

**参数:**

  - `playerid` (?, 必需): 
  - `properties` (?, 可选): 

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

  - `media` (string, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.GetPlayers", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `array`

---

<a id="playergetproperties"></a>
### Player.GetProperties

**获取播放器属性**

Retrieves the values of the given properties

**参数:**

  - `playerid` (?, 必需): 
  - `properties` (array, 必需): 

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

**返回结构:** object
  - `nonlinearstretch`: boolean
  - `pixelratio`: number
  - `verticalshift`: number
  - `viewmode`: normal | zoom | stretch4x3 | widezoom | stretch16x9 | original | stretch16x9nonlin | zoom120width | zoom110width
  - `zoom`: number

---

<a id="playergoto"></a>
### Player.GoTo

**跳转到**

Go to previous/next/specific item in the playlist

**参数:**

  - `playerid` (?, 必需): 
  - `to` (previous | next | integer(默认:-1), 必需): 

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

  - `playerid` (?, 必需): 
  - `direction` (string, 必需): 

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

  - `item` (object | [{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | object | object | object | object | object, 可选): 
  - `options` (object, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Player.Open", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="playerplaypause"></a>
### Player.PlayPause

**播放/暂停**

Pauses or unpause playback and returns the new state

**参数:**

  - `playerid` (?, 必需): 
  - `play` (?, 可选): 

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

  - `playerid` (?, 必需): 
  - `value` (string, 可选): 

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

**返回:** `string`

---

<a id="playerseek"></a>
### Player.Seek

**跳转**

Seek through the playing item

**参数:**

  - `playerid` (?, 必需): 
  - `value` (object | object | object | object, 必需): 

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

  - `playerid` (?, 必需): 
  - `offset` (number | increment | decrement, 必需): 

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

  - `playerid` (?, 必需): 
  - `stream` (previous | next | integer, 必需): 

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

  - `playerid` (?, 必需): 
  - `partymode` (?, 必需): 

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

  - `playerid` (?, 必需): 
  - `repeat` (off | one | all | cycle, 必需): 

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

  - `playerid` (?, 必需): 
  - `shuffle` (?, 必需): 

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

  - `playerid` (?, 必需): 
  - `speed` (-32 | -16 | -8 | -4 | -2 | -1 | 0 | 1 | 2 | 4 | 8 | 16 | 32 | increment | decrement, 必需): 

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

  - `playerid` (?, 必需): 
  - `subtitle` (previous | next | off | on | integer, 必需): 
  - `enable` (boolean, 可选): Whether to enable subtitles to be displayed after setting the new subtitle

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

  - `playerid` (?, 必需): 
  - `tempo` (number | increment | decrement, 必需): 

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

**返回:** `?`

---

<a id="playersetvideostream"></a>
### Player.SetVideoStream

**切换视频流**

Set the video stream played by the player

**参数:**

  - `playerid` (?, 必需): 
  - `stream` (previous | next | integer, 必需): 

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

  - `viewmode` (object | normal | zoom | stretch4x3 | widezoom | stretch16x9 | original | stretch16x9nonlin | zoom120width | zoom110width, 必需): 

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

  - `playerid` (?, 必需): 

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

  - `playerid` (?, 必需): 
  - `zoom` (in | out | integer(范围:1~10), 必需): 

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

**返回:** `string`

---

<a id="playlist"></a>
## Playlist — 播放列表

<a id="playlistadd"></a>
### Playlist.Add

**添加项**

Add item(s) to playlist

**参数:**

  - `playlistid` (?, 必需): 
  - `item` ([{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array, 必需): 

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

  - `playlistid` (?, 必需): 

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

  - `playlistid` (?, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

**返回:** `array`

---

<a id="playlistgetproperties"></a>
### Playlist.GetProperties

**获取属性**

Retrieves the values of the given properties

**参数:**

  - `playlistid` (?, 必需): 
  - `properties` (array, 必需): 

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

  - `playlistid` (?, 必需): 
  - `position` (?, 必需): 
  - `item` ([{'additionalProperties': False, 'properties': {'file': {'description': 'Path to a file (not a directory) to be added to the playlist', 'required': True, 'type': 'string'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'directory': {'required': True, 'type': 'string'}, 'media': {'$ref': 'Files.Media', 'default': 'files'}, 'recursive': {'default': False, 'type': 'boolean'}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'movieid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'episodeid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'musicvideoid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'artistid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'albumid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'songid': {'$ref': 'Library.Id', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'genreid': {'$ref': 'Library.Id', 'description': 'Identification of a genre from the AudioLibrary', 'required': True}}, 'type': 'object'}, {'additionalProperties': False, 'properties': {'recordingid': {'$ref': 'Library.Id', 'description': 'Identification of a PVR recording', 'required': True}}, 'type': 'object'}] | array, 必需): 

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

  - `playlistid` (?, 必需): 
  - `position` (?, 必需): 

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

  - `playlistid` (?, 必需): 
  - `position1` (?, 必需): 
  - `position2` (?, 必需): 

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

  - `properties` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Profiles.GetCurrentProfile", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `?`

---

<a id="profilesgetprofiles"></a>
### Profiles.GetProfiles

**获取配置列表**

Retrieve all profiles

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Profiles.GetProfiles", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `profiles`: array

---

<a id="profilesloadprofile"></a>
### Profiles.LoadProfile

**加载配置**

Load the specified profile

**参数:**

  - `profile` (string, 必需): Profile name
  - `prompt` (boolean, 可选): Prompt for password
  - `password` (?, 可选): 

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

**返回:** `string`

---

<a id="settings"></a>
## Settings — 设置

<a id="settingsgetcategories"></a>
### Settings.GetCategories

**获取分类**

Retrieves all setting categories

**参数:**

  - `level` (?, 可选): 
  - `section` (string, 可选): 
  - `properties` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetCategories", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `categories`: array

---

<a id="settingsgetsections"></a>
### Settings.GetSections

**获取分区**

Retrieves all setting sections

**参数:**

  - `level` (?, 可选): 
  - `properties` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSections", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `sections`: array

---

<a id="settingsgetsettingvalue"></a>
### Settings.GetSettingValue

**获取设置值**

Retrieves the value of a setting

**参数:**

  - `setting` (string, 必需): 

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

  - `level` (?, 可选): 
  - `filter` (object, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Settings.GetSettings", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `settings`: array

---

<a id="settingsgetskinsettingvalue"></a>
### Settings.GetSkinSettingValue

**获取皮肤设置值**

Retrieves the value of the specified skin setting

**参数:**

  - `setting` (string, 必需): 

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

**返回结构:** object
  - `value`: [{'type': 'boolean'}, {'type': 'string'}]

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

**返回结构:** object
  - `settings`: array
  - `skin`: string

---

<a id="settingsresetsettingvalue"></a>
### Settings.ResetSettingValue

**重置设置**

Resets the value of a setting

**参数:**

  - `setting` (string, 必需): 

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

  - `setting` (string, 必需): 
  - `value` (?, 必需): 

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

  - `setting` (string, 必需): 
  - `value` (boolean | string, 必需): 

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

**返回:** `boolean`

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

**返回:** `string`

---

<a id="systemgetproperties"></a>
### System.GetProperties

**获取系统属性**

Retrieves the values of the given properties

**参数:**

  - `properties` (array, 必需): 

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

**返回:** `?`

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

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

**返回:** `string`

---

<a id="textures"></a>
## Textures — 纹理

<a id="texturesgettextures"></a>
### Textures.GetTextures

**获取纹理**

Retrieve all textures

**参数:**

  - `properties` (?, 可选): 
  - `filter` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "Textures.GetTextures", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `textures`: array

---

<a id="texturesremovetexture"></a>
### Textures.RemoveTexture

**移除纹理**

Remove the specified texture

**参数:**

  - `textureid` (?, 必需): Texture database identifier

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

**返回:** `string`

---

<a id="videolibrary"></a>
## VideoLibrary — 视频库

<a id="videolibraryclean"></a>
### VideoLibrary.Clean

**清理库**

Cleans the video library for non-existent items

**参数:**

  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog
  - `content` (string, 可选): Content type to clean for
  - `directory` (string, 可选): Path to the directory to clean up; performs a global cleanup if not specified

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Clean", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="videolibraryexport"></a>
### VideoLibrary.Export

**导出库**

Exports all items from the video library

**参数:**

  - `options` (object | object, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Export", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="videolibrarygetavailableart"></a>
### VideoLibrary.GetAvailableArt

**获取可用艺术图**

Retrieve all potential art URLs for a media item by art type

**参数:**

  - `item` (object | object | object | object | object | object, 必需): 
  - `arttype` (string, 可选): 

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

  - `item` (object | object | object | object | object | object, 必需): 

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

  - `episodeid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `episodedetails`: object

---

<a id="videolibrarygetepisodes"></a>
### VideoLibrary.GetEpisodes

**获取剧集**

Retrieve all tv show episodes

**参数:**

  - `tvshowid` (?, 可选): 
  - `season` (integer, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Episodes'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Episodes'}], 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetEpisodes", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `episodes`: array
  - `limits`: object

---

<a id="videolibrarygetgenres"></a>
### VideoLibrary.GetGenres

**获取分类**

Retrieve all genres

**参数:**

  - `type` (string, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetInProgressTVShows", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `tvshows`: array

---

<a id="videolibrarygetmoviedetails"></a>
### VideoLibrary.GetMovieDetails

**获取电影详情**

Retrieve details about a specific movie

**参数:**

  - `movieid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `moviedetails`: object

---

<a id="videolibrarygetmoviesetdetails"></a>
### VideoLibrary.GetMovieSetDetails

**获取电影合集详情**

Retrieve details about a specific movie set

**参数:**

  - `setid` (?, 必需): 
  - `properties` (?, 可选): 
  - `movies` (object, 可选): 

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

**返回结构:** object
  - `setdetails`: object

---

<a id="videolibrarygetmoviesets"></a>
### VideoLibrary.GetMovieSets

**获取电影合集**

Retrieve all movie sets

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieSets", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `sets`: array

---

<a id="videolibrarygetmovies"></a>
### VideoLibrary.GetMovies

**获取电影**

Retrieve all movies

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.Movies'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.Movies'}], 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `movies`: array

---

<a id="videolibrarygetmusicvideodetails"></a>
### VideoLibrary.GetMusicVideoDetails

**获取音乐视频详情**

Retrieve details about a specific music video

**参数:**

  - `musicvideoid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `musicvideodetails`: object

---

<a id="videolibrarygetmusicvideos"></a>
### VideoLibrary.GetMusicVideos

**获取音乐视频**

Retrieve all music videos

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.MusicVideos'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.MusicVideos'}], 可选): 

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

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetRecentlyAddedEpisodes", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `episodes`: array
  - `limits`: object

---

<a id="videolibrarygetrecentlyaddedmovies"></a>
### VideoLibrary.GetRecentlyAddedMovies

**最近添加电影**

Retrieve all recently added movies

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetRecentlyAddedMovies", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `movies`: array

---

<a id="videolibrarygetrecentlyaddedmusicvideos"></a>
### VideoLibrary.GetRecentlyAddedMusicVideos

**最近添加音乐视频**

Retrieve all recently added music videos

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

  - `seasonid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `seasondetails`: object

---

<a id="videolibrarygetseasons"></a>
### VideoLibrary.GetSeasons

**获取季度**

Retrieve all tv seasons

**参数:**

  - `tvshowid` (?, 可选): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetSeasons", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `seasons`: array

---

<a id="videolibrarygettvshowdetails"></a>
### VideoLibrary.GetTVShowDetails

**获取电视剧详情**

Retrieve details about a specific tv show

**参数:**

  - `tvshowid` (?, 必需): 
  - `properties` (?, 可选): 

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

**返回结构:** object
  - `tvshowdetails`: object

---

<a id="videolibrarygettvshows"></a>
### VideoLibrary.GetTVShows

**获取电视剧**

Retrieve all tv shows

**参数:**

  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 
  - `filter` (object | object | object | object | object | object | [{'properties': {'and': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'properties': {'or': {'items': {'$ref': 'List.Filter.TVShows'}, 'minItems': 1, 'required': True, 'type': 'array'}}, 'type': 'object'}, {'$ref': 'List.Filter.Rule.TVShows'}], 可选): 

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.GetTVShows", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回结构:** object
  - `limits`: object
  - `tvshows`: array

---

<a id="videolibrarygettags"></a>
### VideoLibrary.GetTags

**获取标签**

Retrieve all tags

**参数:**

  - `type` (string, 必需): 
  - `properties` (?, 可选): 
  - `limits` (?, 可选): 
  - `sort` (?, 可选): 

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

  - `episodeid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

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

**返回:** `string`

---

<a id="videolibraryrefreshmovie"></a>
### VideoLibrary.RefreshMovie

**刷新电影**

Refresh the given movie in the library

**参数:**

  - `movieid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

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

**返回:** `string`

---

<a id="videolibraryrefreshmusicvideo"></a>
### VideoLibrary.RefreshMusicVideo

**刷新音乐视频**

Refresh the given music video in the library

**参数:**

  - `musicvideoid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

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

**返回:** `string`

---

<a id="videolibraryrefreshtvshow"></a>
### VideoLibrary.RefreshTVShow

**刷新电视剧**

Refresh the given tv show in the library

**参数:**

  - `tvshowid` (?, 必需): 
  - `ignorenfo` (boolean, 可选): Whether or not to ignore a local NFO if present.
  - `refreshepisodes` (boolean, 可选): Whether or not to refresh all episodes belonging to the TV show.
  - `title` (string, 可选): Title to use for searching (instead of determining it from the item's filename/path).

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

**返回:** `string`

---

<a id="videolibraryremoveepisode"></a>
### VideoLibrary.RemoveEpisode

**移除剧集**

Removes the given episode from the library

**参数:**

  - `episodeid` (?, 必需): 

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

  - `movieid` (?, 必需): 

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

  - `musicvideoid` (?, 必需): 

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

  - `tvshowid` (?, 必需): 

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

  - `directory` (string, 可选): 
  - `showdialogs` (boolean, 可选): Whether or not to show the progress bar or any other GUI dialog

**请求:**

```json
{"jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1}
```

**响应:**

```
(no params or skipped)
```

**返回:** `string`

---

<a id="videolibrarysetepisodedetails"></a>
### VideoLibrary.SetEpisodeDetails

**设置剧集详情**

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

**返回:** `string`

---

<a id="videolibrarysetmoviedetails"></a>
### VideoLibrary.SetMovieDetails

**设置电影详情**

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

**返回:** `string`

---

<a id="videolibrarysetmoviesetdetails"></a>
### VideoLibrary.SetMovieSetDetails

**设置电影合集详情**

Update the given movie set with the given details

**参数:**

  - `setid` (?, 必需): 
  - `title` (?, 可选): 
  - `art` (null | object, 可选): 
  - `plot` (?, 可选): 

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

**返回:** `string`

---

<a id="videolibrarysetmusicvideodetails"></a>
### VideoLibrary.SetMusicVideoDetails

**设置音乐视频详情**

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

**返回:** `string`

---

<a id="videolibrarysetseasondetails"></a>
### VideoLibrary.SetSeasonDetails

**设置季度详情**

Update the given season with the given details

**参数:**

  - `seasonid` (?, 必需): 
  - `art` (null | object, 可选): 
  - `userrating` (?, 可选): 
  - `title` (?, 可选): 

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

**返回:** `string`

---

<a id="videolibrarysettvshowdetails"></a>
### VideoLibrary.SetTVShowDetails

**设置电视剧详情**

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

**返回:** `string`

---

<a id="xbmc"></a>
## XBMC — 系统(兼容)

<a id="xbmcgetinfobooleans"></a>
### XBMC.GetInfoBooleans

**获取信息布尔值**

Retrieve info booleans about Kodi and the system

**参数:**

  - `booleans` (array, 必需): 

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

**返回:** `object`

---

<a id="xbmcgetinfolabels"></a>
### XBMC.GetInfoLabels

**获取信息标签**

Retrieve info labels about Kodi and the system

**参数:**

  - `labels` (array, 必需): See http://kodi.wiki/view/InfoLabels for a list of possible info labels

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

**返回:** `object`

---

## 错误码附录

| 错误码 | 说明 | 触发此错误的方法 | 如何避免 |
|--------|------|------------------|----------|
| `-32700` | Parse error — JSON 格式错误 | （未触发） | 预防性注意 |
| `-32603` | Internal error — KODI 内部错误 | （未触发） | 预防性注意 |
| `-32602` | Invalid params — 参数类型或值不合法 | `Addons.ExecuteAddon`, `Addons.GetAddonDetails`, `Addons.SetAddonEnabled`, `AudioLibrary.GetAlbumDetails`, `AudioLibrary.GetAvailableArt`, `AudioLibrary.GetAvailableArtTypes`, `AudioLibrary.GetProperties`, `AudioLibrary.GetSongDetails`, `AudioLibrary.SetAlbumDetails`, `AudioLibrary.SetSongDetails`, `Favourites.AddFavourite`, `Profiles.LoadProfile`, `Settings.GetSkinSettingValue`, `Settings.SetSkinSettingValue`, `System.GetProperties`, `Textures.RemoveTexture`, `VideoLibrary.GetEpisodeDetails`, `VideoLibrary.GetMovieDetails`, `VideoLibrary.GetMovieSetDetails`, `VideoLibrary.GetMusicVideoDetails`, `VideoLibrary.GetSeasonDetails`, `VideoLibrary.GetTVShowDetails`, `VideoLibrary.RefreshEpisode`, `VideoLibrary.RefreshMovie`, `VideoLibrary.RefreshMusicVideo`, `VideoLibrary.RefreshTVShow`, `VideoLibrary.SetEpisodeDetails`, `VideoLibrary.SetMovieDetails`, `VideoLibrary.SetMovieSetDetails`, `VideoLibrary.SetMusicVideoDetails`, `VideoLibrary.SetSeasonDetails`, `VideoLibrary.SetTVShowDetails`, `XBMC.GetInfoBooleans`, `XBMC.GetInfoLabels` | 确保参数类型/枚举值合法；确保当前状态支持此操作 |
| `-32601` | Method not found — 方法名不存在 | （未触发） | 预防性注意 |
| `-32600` | Invalid Request — 请求不是合法 JSON-RPC | （未触发） | 预防性注意 |
| `-32100` | Failed to execute method — 当前状态不支持 | `PVR.AddTimer`, `PVR.DeleteTimer`, `PVR.GetBroadcastDetails`, `PVR.GetBroadcastIsPlayable`, `PVR.GetBroadcasts`, `PVR.GetChannelDetails`, `PVR.GetChannelGroupDetails`, `PVR.GetChannelGroups`, `PVR.GetChannels`, `PVR.GetProperties`, `PVR.GetRecordingDetails`, `PVR.GetTimerDetails`, `PVR.ToggleTimer`, `Player.Rotate`, `Player.SetTempo`, `Player.Zoom` | 确保参数类型/枚举值合法；确保当前状态支持此操作 |
| `-32000` | Result too large — 返回结果过大 | （未触发） | 预防性注意 |

---

*文档自动生成于 KODI 21 (Omega)*
