#!/usr/bin/env bash

# ==========================================
# 模式 1: 更新模式 (跳过所有验证, 直接刷新现有列表)
# ==========================================
if [ "$1" == "update" ]; then
    echo "=== CoreELEC 播放列表更新模式 ==="
    read -p "输入 CoreELEC 设备的 IP 地址: " TARGET_IP
    if [ -z "$TARGET_IP" ]; then echo "IP 不能为空"; exit 1; fi
    
    echo "⏳ 扫描并更新已创建的播放列表..."
    
    ssh -T -o StrictHostKeyChecking=accept-new "root@$TARGET_IP" << 'UPDATE_EOF'
        for plist in /storage/.kodi/userdata/playlists/*/*.m3u; do
            if [ -f "$plist" ]; then
                first_file=$(grep -v '^#' "$plist" | head -n 1)
                if [ -n "$first_file" ]; then
                    scan_dir=$(dirname "$first_file")
                    echo "#EXTM3U" > "$plist"
                    find "$scan_dir" -maxdepth 3 -type f \( -iname '*.mp4' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.ts' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.wmv' -o -iname '*.flv' -o -iname '*.webm' -o -iname '*.mp3' -o -iname '*.flac' -o -iname '*.aac' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.ogg' -o -iname '*.wma' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.bmp' -o -iname '*.webp' \) >> "$plist" 2>/dev/null
                    echo "  ✅ 已更新: $(basename "$plist")"
                fi
            fi
        done
UPDATE_EOF
    echo "🎉 所有播放列表内容已更新"
    exit 0
fi

# ==========================================
# 模式 2: 完整初始化与智能扫描
# ==========================================
echo "=== CoreELEC 智能播放列表配置脚本 ==="

# 1. 验证 IP
while true; do
    echo ""
    read -p "输入 CoreELEC 设备的 IP 地址: " TARGET_IP
    if [ -z "$TARGET_IP" ]; then
        echo "❌ IP 地址不能为空, 请重新输入"
        continue
    fi
    echo "正在测试网络连通性 (Ping 5次)..."
    if ping -c 5 "$TARGET_IP" > /dev/null 2>&1; then
        echo "✅ 网络 OK"
        break
    else
        echo "❌ Ping 不通 $TARGET_IP, 请检查网络或重新输入 IP"
    fi
done

# 2. 配置免密登录
echo ""
echo "执行 ssh-copy-id 以配置免密登录. "
echo "请在系统提示时输入 root 用户的密码, CoreELEC 默认通常是 coreelec"
echo "------------------------------------------------"

while true; do
    SSH_OUTPUT=$(ssh-copy-id -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 "root@$TARGET_IP" 2>&1)
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        if echo "$SSH_OUTPUT" | grep -q "skipped"; then
            echo "✅ 检测到免密密钥已存在, 无需重复配置"
        else
            echo "✅ 密钥配置成功"
        fi
        break
    else
        echo "❌ 密钥配置失败 "
        read -p "是否重新输入密码尝试? (y/n): " retry
        if [[ "$retry" != "y" && "$retry" != "Y" ]]; then exit 1; fi
    fi
done

# 3. 智能扫描
echo "------------------------------------------------"
echo "🔍 扫描 /storage 寻找媒体文件..."

REMOTE_SCAN_CMD=$(cat << 'SCANEOF'
# 获取已存在的播放列表名称 (带 EXISTS| 前缀)
find /storage/.kodi/userdata/playlists/ -type f -name "*.m3u" 2>/dev/null | while read -r f; do 
    echo "EXISTS|$(basename "$f")"
done

# 扫描文件
scan_files() {
    local type=$1
    shift
    find /storage -maxdepth 3 -type f "$@" 2>/dev/null | sort | while read -r filepath; do
        dir=$(dirname "$filepath")
        file=$(basename "$filepath")
        echo "ENTRY|${type}|${dir}|${file}"
    done
}

scan_files "VIDEO" \( -iname '*.mp4' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.ts' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.wmv' -o -iname '*.flv' -o -iname '*.webm' \)
scan_files "AUDIO" \( -iname '*.mp3' -o -iname '*.flac' -o -iname '*.aac' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.ogg' -o -iname '*.wma' \)
scan_files "IMAGE" \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.bmp' -o -iname '*.webp' \)
SCANEOF
)

# 🛡️ 强制清除 macOS SSH 返回的隐藏回车符 (\r)
SCAN_RESULT=$(ssh -T -o StrictHostKeyChecking=accept-new "root@$TARGET_IP" "$REMOTE_SCAN_CMD" | tr -d '\r')

EXISTS_LIST=$(echo "$SCAN_RESULT" | grep '^EXISTS|' | cut -d'|' -f2)
ENTRY_LIST=$(echo "$SCAN_RESULT" | grep '^ENTRY|' | sort -t'|' -k2,2 -k3,3)

if [ -z "$ENTRY_LIST" ]; then
    echo "⚠️ 未发现任何媒体文件, 退出"
    exit 0
fi

# 4. 本地聚合数据 (兼容 macOS Bash 3.2)
declare -a BLOCK_TYPES
declare -a BLOCK_DIRS
declare -a BLOCK_COUNTS
declare -a BLOCK_STATUSES
declare -a BLOCK_FILES

current_type=""
current_dir=""
current_count=0
current_files=""
block_num=0

while IFS='|' read -r prefix type dir file; do
    if [ "$type" != "$current_type" ] || [ "$dir" != "$current_dir" ]; then
        if [ -n "$current_dir" ]; then
            plist_name=$(basename "$current_dir")
            if echo "$EXISTS_LIST" | grep -qFx "${plist_name}.m3u"; then
                status="EXISTS"
            else
                status="NEW"
            fi
            
            BLOCK_TYPES[$block_num]="$current_type"
            BLOCK_DIRS[$block_num]="$current_dir"
            BLOCK_COUNTS[$block_num]="$current_count"
            BLOCK_STATUSES[$block_num]="$status"
            BLOCK_FILES[$block_num]="$current_files"
            ((block_num++))
        fi
        
        current_type="$type"
        current_dir="$dir"
        current_count=1
        current_files="      - $file"
    else
        ((current_count++))
        current_files="${current_files}"$'\n'"      - $file"
    fi
done <<< "$ENTRY_LIST"

if [ -n "$current_dir" ]; then
    plist_name=$(basename "$current_dir")
    if echo "$EXISTS_LIST" | grep -qFx "${plist_name}.m3u"; then
        status="EXISTS"
    else
        status="NEW"
    fi
    BLOCK_TYPES[$block_num]="$current_type"
    BLOCK_DIRS[$block_num]="$current_dir"
    BLOCK_COUNTS[$block_num]="$current_count"
    BLOCK_STATUSES[$block_num]="$status"
    BLOCK_FILES[$block_num]="$current_files"
    ((block_num++))
fi

# 5. 智能展示与交互 (仅对 NEW 分配编号)
echo "📂 发现以下包含媒体文件的目录:"
echo "------------------------------------------------"

valid_choice_count=0
declare -a NEW_BLOCK_INDICES

for ((i=0; i<block_num; i++)); do
    type="${BLOCK_TYPES[$i]}"
    dir="${BLOCK_DIRS[$i]}"
    count="${BLOCK_COUNTS[$i]}"
    status="${BLOCK_STATUSES[$i]}"
    files="${BLOCK_FILES[$i]}"
    
    case "$type" in
        VIDEO) type_str="🎬 视频" ;;
        AUDIO) type_str="🎵 音频" ;;
        IMAGE) type_str="🖼️  图片" ;;
    esac
    
    if [ "$status" = "EXISTS" ]; then
        echo "  [✅ 已存在] ${type_str} : ${dir} (${count} 个文件)"
        printf "%b\n" "$files"
    else
        ((valid_choice_count++))
        echo "  [${valid_choice_count}] ${type_str} : ${dir} (${count} 个文件)"
        NEW_BLOCK_INDICES[$valid_choice_count]=$i
        printf "%b\n" "$files"
    fi
done
echo "------------------------------------------------"

# 6. 根据是否有新目录决定交互
if [ "$valid_choice_count" -eq 0 ]; then
    echo "✅ 含有媒体文件的目录均已存在播放列表, 无需创建"
else
    read -p "需要为【未创建】的目录生成播放列表吗? (输入编号, 多个用空格分隔, 或输入 'n' 跳过): " user_choice
    
    if [[ "$user_choice" != "n" && "$user_choice" != "N" && -n "$user_choice" ]]; then
        for choice in $user_choice; do
            if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -le "$valid_choice_count" ] && [ "$choice" -ge 1 ]; then
                idx=${NEW_BLOCK_INDICES[$choice]}
                type="${BLOCK_TYPES[$idx]}"
                dir="${BLOCK_DIRS[$idx]}"
                
                case "$type" in
                    VIDEO) plist_dir="/storage/.kodi/userdata/playlists/video" ;;
                    AUDIO) plist_dir="/storage/.kodi/userdata/playlists/music" ;;
                    IMAGE) plist_dir="/storage/.kodi/userdata/playlists/pictures" ;;
                esac
                
                plist_name=$(basename "$dir" | tr -d '\r')
                FILE_CHECK=$(ssh -T -o StrictHostKeyChecking=accept-new "root@$TARGET_IP" "test -f \"${plist_dir}/${plist_name}.m3u\" && echo 'yes' || echo 'no'")
                
                if [ "$FILE_CHECK" = "yes" ]; then
                    echo "  ⚠️  编号 $choice ($dir) 的播放列表实际已存在, 已跳过"
                    continue
                fi
                
                echo "⏳ 为 $dir 创建播放列表..."
                
                case "$type" in
                    VIDEO)
                        exts="-iname '*.mp4' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.ts' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.wmv' -o -iname '*.flv' -o -iname '*.webm'"
                        ;;
                    AUDIO)
                        exts="-iname '*.mp3' -o -iname '*.flac' -o -iname '*.aac' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.ogg' -o -iname '*.wma'"
                        ;;
                    IMAGE)
                        exts="-iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.bmp' -o -iname '*.webp'"
                        ;;
                esac
                
                ssh -T -o StrictHostKeyChecking=accept-new "root@$TARGET_IP" "
                    mkdir -p \"$plist_dir\"
                    echo '#EXTM3U' > \"${plist_dir}/${plist_name}.m3u\"
                    find \"$dir\" -maxdepth 3 -type f \( $exts \) >> \"${plist_dir}/${plist_name}.m3u\" 2>/dev/null
                "
                echo "  ✅ 已创建: ${plist_name}.m3u"
            else
                echo "  ⚠️  无效的编号: $choice, 已跳过"
            fi
        done
    fi
fi

echo ""
echo "🎉 已完成配置"
echo ""
echo "📡 如何通过 WebSocket API 使用此播放列表:"
echo "1. 连接地址: ws://${TARGET_IP}:9090/jsonrpc"
echo "2. 播放列表文件路径规则: special://profile/playlists/[类型]/[目录名].m3u"
echo "   例如: /storage/videos 对应 special://profile/playlists/video/videos.m3u"
echo "3. 发送以下 JSON 数据即可让 CoreELEC 开始播放 (根据实际文件名替换 path):"
echo ""
echo '   {'
echo '     "jsonrpc": "2.0",'
echo '     "method": "Player.Open",'
echo '     "params": {'
echo '       "item": {'
echo '         "file": "special://profile/playlists/video/videos.m3u"'
echo '       }'
echo '     },'
echo '     "id": 1'
echo '   }'
echo ""
echo '  {"jsonrpc": "2.0", "method": "Player.Open", "params": {"item": {"file": "special://profile/playlists/video/videos.m3u"}}, "id": 1}'
echo ""
echo "💡 如果目录中的文件发生了新增或修改, 则需要更新, "
echo "   运行: bash coreelec.sh update"
echo ""