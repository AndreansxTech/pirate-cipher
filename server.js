const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'join':
                if (!rooms.has(data.room)) {
                    rooms.set(data.room, new Map());
                }
                rooms.get(data.room).set(data.username, ws);
                broadcastToRoom(data.room, {
                    type: 'user-joined',
                    username: data.username
                }, ws);
                break;
                
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                const targetWs = rooms.get(data.room)?.get(data.target);
                if (targetWs) {
                    targetWs.send(JSON.stringify(data));
                }
                break;
        }
    });

    ws.on('close', () => {
        rooms.forEach((clients, roomId) => {
            clients.forEach((client, username) => {
                if (client === ws) {
                    clients.delete(username);
                    broadcastToRoom(roomId, {
                        type: 'user-left',
                        username: username
                    });
                }
            });
            if (clients.size === 0) {
                rooms.delete(roomId);
            }
        });
    });
});

function broadcastToRoom(room, message, exclude = null) {
    const clients = rooms.get(room);
    if (clients) {
        clients.forEach((client, username) => {
            if (client !== exclude) {
                client.send(JSON.stringify(message));
            }
        });
    }
}
