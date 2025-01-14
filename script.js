const pirateMap = {
    'a': 'arr', 'e': 'eh', 'i': 'eye', 'o': 'oh', 'u': 'uh',
    's': 'ss', 'r': 'rrr', 't': 'tey', 'n': 'nay'
};

let peer = null;
let connection = null;

function joinRoom() {
    const roomId = document.getElementById('roomId').value;
    if (roomId.length !== 4) {
        alert('Please enter a 4-digit room code');
        return;
    }

    if (peer) {
        peer.destroy();
    }

    peer = new Peer();
    
    peer.on('open', (id) => {
        try {
            connection = peer.connect(roomId);
            setupConnection();
        } catch {
            document.getElementById('connectionStatus').textContent = 'Waiting for peer...';
        }
    });

    peer.on('connection', (conn) => {
        connection = conn;
        setupConnection();
    });
}

function setupConnection() {
    connection.on('open', () => {
        document.getElementById('connectionStatus').textContent = 'Connected!';
        connection.on('data', (data) => {
            document.getElementById('result').value = data;
        });
    });
}

function encrypt() {
    const message = document.getElementById('message').value.toLowerCase();
    let encrypted = message;
    
    for (let char in pirateMap) {
        const regex = new RegExp(char, 'g');
        encrypted = encrypted.replace(regex, pirateMap[char]);
    }
    
    document.getElementById('result').value = encrypted;
    
    if (connection && connection.open) {
        connection.send(encrypted);
    }
}

function decrypt() {
    const message = document.getElementById('message').value.toLowerCase();
    let decrypted = message;
    
    for (let char in pirateMap) {
        const regex = new RegExp(pirateMap[char], 'g');
        decrypted = decrypted.replace(regex, char);
    }
    
    document.getElementById('result').value = decrypted;
}
