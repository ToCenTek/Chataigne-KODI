import socket
import json
import threading
import xbmc

UDP_PORT = 9527

class SyncThread(threading.Thread):
    def __init__(self, monitor):
        threading.Thread.__init__(self)
        self.daemon = True
        self.monitor = monitor
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
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
                msg = json.loads(data.decode('utf-8'))
                cmd = msg.get('cmd', '')
                val = msg.get('value')
                self.handle(cmd, val, msg)
            except socket.timeout:
                pass
            except Exception as e:
                xbmc.log("ChataigneSync: " + str(e), xbmc.LOGERROR)

    def handle(self, cmd, val, raw_msg):
        # 完整 JSON-RPC 消息直接转发
        if 'jsonrpc' in raw_msg:
            xbmc.executeJSONRPC(json.dumps(raw_msg))
            return
        if cmd == 'seek':
            xbmc.executeJSONRPC(json.dumps({
                "jsonrpc": "2.0", "method": "Player.Seek",
                "params": {"playerid": 1, "value": {"percentage": val}},
                "id": "cs"
            }))
        elif cmd == 'pause':
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.SetSpeed","params":{"playerid":1,"speed":0},"id":"cs"}')
        elif cmd == 'play':
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.SetSpeed","params":{"playerid":1,"speed":1},"id":"cs"}')
        elif cmd == 'stop':
            xbmc.executeJSONRPC('{"jsonrpc":"2.0","method":"Player.Stop","params":{"playerid":1},"id":"cs"}')
        elif cmd == 'open':
            xbmc.executeJSONRPC(json.dumps({
                "jsonrpc": "2.0", "method": "Player.Open",
                "params": {"item": {"file": val}},
                "id": "cs"
            }))
        elif cmd == 'position':
            xbmc.executeJSONRPC(json.dumps({
                "jsonrpc": "2.0", "method": "Player.GetProperties",
                "params": {"playerid": 1, "properties": ["time", "speed", "totaltime"]},
                "id": "cs_pos"
            }))

if __name__ == '__main__':
    monitor = xbmc.Monitor()
    t = SyncThread(monitor)
    t.start()
    t.join()
