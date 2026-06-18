import socket
import json
import threading
import xbmc

UDP_PORT = 9527
ACK_PORT = 0

def ack(sock, addr, cmd):
    try:
        target = (addr[0], ACK_PORT) if ACK_PORT > 0 else addr
        sock.sendto(b"ACK:" + cmd.encode() + b"\n", target)
    except:
        pass

class SyncThread(threading.Thread):
    def __init__(self, monitor):
        threading.Thread.__init__(self)
        self.daemon = True
        self.monitor = monitor
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        self.sock.settimeout(0.5)
        try:
            self.sock.bind(('0.0.0.0', UDP_PORT))
        except:
            xbmc.log("ChataigneSync: bind failed", xbmc.LOGERROR)

    def run(self):
        xbmc.log("ChataigneSync: listening on UDP " + str(UDP_PORT), xbmc.LOGINFO)
        while not self.monitor.abortRequested():
            try:
                data, addr = self.sock.recvfrom(2048)
                text = data.decode('utf-8').strip()
                # 兼容 JSON 格式
                if text.startswith("{"):
                    msg = json.loads(text)
                    if 'jsonrpc' in msg:
                        xbmc.executeJSONRPC(text)
                        ack(self.sock, addr, "JSON")
                    else:
                        self.handle_simple(msg.get('cmd',''), msg.get('value'), addr)
                else:
                    self.handle_text(text, addr)
            except socket.timeout:
                pass
            except Exception as e:
                xbmc.log("ChataigneSync: " + str(e), xbmc.LOGERROR)

    def handle_text(self, text, addr):
        cmd = text
        val = None
        if ":" in text:
            parts = text.split(":", 1)
            cmd = parts[0].upper()
            val = parts[1]
        xbmc.log("ChataigneSync: " + cmd + " " + (val or ""), xbmc.LOGINFO)
        self.exec_cmd(cmd, val)
        ack(self.sock, addr, cmd)

    def handle_simple(self, cmd, val, addr):
        xbmc.log("ChataigneSync: " + cmd + " " + str(val or ""), xbmc.LOGINFO)
        self.exec_cmd(cmd, val)
        ack(self.sock, addr, cmd)

    def exec_cmd(self, cmd, val):
        if cmd == "PORT":
            global ACK_PORT
            ACK_PORT = int(val) if val else 0
            xbmc.log("ChataigneSync: ACK port set to " + str(ACK_PORT), xbmc.LOGINFO)
        elif cmd == "PLAY":
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.SetSpeed","params":{"playerid":1,"speed":1},"id":"cs"}')
        elif cmd == "PAUSE":
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.SetSpeed","params":{"playerid":1,"speed":0},"id":"cs"}')
        elif cmd == "STOP":
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.Stop","params":{"playerid":1},"id":"cs"}')
        elif cmd == "SEEK":
            pct = float(val) if val else 50
            xbmc.executeJSONRPC(json.dumps({"jsonrpc":"2.0","method":"Player.Seek","params":{"playerid":1,"value":{"percentage":pct}},"id":"cs"}))
        elif cmd == "VOLUME" or cmd == "VOL":
            v = int(float(val)) if val else 50
            xbmc.executeJSONRPC(json.dumps({"jsonrpc":"2.0","method":"Application.SetVolume","params":{"volume":v},"id":"cs"}))
        elif cmd == "MUTE":
            m = val == "1" or val == "true" if val else True
            xbmc.executeJSONRPC(json.dumps({"jsonrpc":"2.0","method":"Application.SetMute","params":{"mute":m},"id":"cs"}))
        elif cmd == "OPEN":
            xbmc.executeJSONRPC(json.dumps({"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":val}},"id":"cs"}))
        elif cmd == "3D":
            mode = val or "off"
            if mode == "sbs": mode = "split_vertical"
            elif mode == "tab": mode = "split_horizontal"
            xbmc.executeJSONRPC(json.dumps({"jsonrpc":"2.0","method":"GUI.SetStereoscopicMode","params":{"mode":mode},"id":"cs"}))
        elif cmd == "ASPECT":
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Input.ExecuteAction","params":{"action":"aspectratio"},"id":"cs"}')
        elif cmd == "POS":
            r = xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["time","speed","totaltime"]},"id":"cs"}')
            try:
                d = json.loads(r)
                if d.get('result'):
                    t = d['result'].get('time',{})
                    tt = d['result'].get('totaltime',{})
                    ms = t.get('hours',0)*3600000+t.get('minutes',0)*60000+t.get('seconds',0)*1000+t.get('milliseconds',0)
                    tms = tt.get('hours',0)*3600000+tt.get('minutes',0)*60000+tt.get('seconds',0)*1000+tt.get('milliseconds',0)
                    self.sock.sendto(("POS:" + str(ms) + ":" + str(tms) + "\n").encode(), ('255.255.255.255', UDP_PORT))
            except:
                pass

if __name__ == '__main__':
    monitor = xbmc.Monitor()
    t = SyncThread(monitor)
    t.start()
    t.join()
