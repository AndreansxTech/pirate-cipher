let rooms = new Map();

export default {
    async fetch(request, env) {
        if (request.headers.get("Upgrade") === "websocket") {
            const { 0: client, 1: server } = new WebSocketPair();
            await handleWebSocket(server);
            return new Response(null, {
                status: 101,
                webSocket: client
            });
        }
        return new Response("Expected WebSocket connection", { status: 400 });
    }
};

async function handleWebSocket(webSocket) {
    webSocket.accept();

    webSocket.addEventListener("message", async ({ data }) => {
        try {
            const message = JSON.parse(data);
            
            switch(message.type) {
                case 'join':
                    if (!rooms.has(message.room)) {
                        rooms.set(message.room, new Map());
                    }
                    rooms.get(message.room).set(message.username, webSocket);
                    broadcastToRoom(message.room, {
                        type: 'user-joined',
                        username: message.username
                    }, webSocket);
                    break;
                    
                case 'offer':
                case 'answer':
                case 'ice-candidate':
                    const targetWs = rooms.get(message.room)?.get(message.target);
                    if (targetWs) {
                        targetWs.send(JSON.stringify(message));
                    }
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    });

    webSocket.addEventListener("close", () => {
        rooms.forEach((clients, roomId) => {
            clients.forEach((client, username) => {
                if (client === webSocket) {
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
}

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
