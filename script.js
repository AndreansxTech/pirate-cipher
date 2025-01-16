let localUsername = '';
let roomNumber = '';
let isHost = false;

// We'll store all connected PeerJS DataConnections here:
const connections = [];

// HTML elements
const joinForm = document.getElementById('join-form');
const chatRoom = document.getElementById('chat-room');
const joinBtn = document.getElementById('join-btn');
const leaveBtn = document.getElementById('leave-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');
const roomDisplay = document.getElementById('room-display');

joinBtn.addEventListener('click', joinRoom);
leaveBtn.addEventListener('click', leaveRoom);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// We'll keep a reference to our Peer instance:
let peer = null;

// Attempt to join a room
function joinRoom() {
  const usernameInput = document.getElementById('username');
  const roomInput = document.getElementById('room-number');

  if (!usernameInput.value || !roomInput.value.match(/^\d{4}$/)) {
    alert('Please enter a valid name and 4-digit room number');
    return;
  }

  localUsername = usernameInput.value.trim();
  roomNumber = roomInput.value.trim();

  // Try to become the "host" by using roomNumber as our PeerJS ID
  peer = new Peer(roomNumber, {
    debug: 2
    // If you have your own PeerServer, specify host/port/path here
    // host: 'your-peer-server.com',
    // port: 443,
    // secure: true,
    // path: '/myapp'
  });

  // If the ID is taken, we'll become a "client" with a random ID
  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      // roomNumber is taken => someone else is the host
      isHost = false;
      // Create a peer with a random ID
      peer = new Peer(null, { debug: 2 });
      setupPeerListeners(); // We have to re-bind the listeners
    } else {
      console.error(err);
      alert('Error creating or connecting to Peer: ' + err);
    }
  });

  // This is the normal flow if we successfully become the host
  peer.on('open', (id) => {
    if (id === roomNumber) {
      // We are the host
      isHost = true;
      console.log(`HOST: Our peer ID is ${id}`);
      showChatUI();
    } else {
      // We are a client, now connect to the existing host
      console.log(`CLIENT: Our random peer ID is ${id}, connecting to host...`);
      connectToHost();
    }
  });

  // If we successfully create a Peer with the ID, we must also listen
  // for inbound connections from new clients (host only)
  peer.on('connection', (conn) => {
    // This fires when a client tries to connect to us (the host)
    console.log(`New inbound connection from: ${conn.peer}`);
    handleConnection(conn);
  });
}

// Setup a newly created random peer to connect to the host
function setupPeerListeners() {
  peer.on('open', (id) => {
    console.log(`CLIENT: Our random peer ID is ${id}, connecting to host...`);
    connectToHost();
  });

  peer.on('connection', (conn) => {
    // Typically, a client wouldn't expect inbound connections,
    // but let's keep it if you want advanced multi-direction features.
    handleConnection(conn);
  });
}

// For clients: connect to the host's Peer ID (which is the roomNumber)
function connectToHost() {
  const conn = peer.connect(roomNumber);
  handleConnection(conn);
  showChatUI();
}

// Common function to handle an incoming or outgoing PeerJS DataConnection
function handleConnection(conn) {
  conn.on('open', () => {
    // Save this connection
    connections.push(conn);
    console.log('Connection open with ', conn.peer);

    // Send a "hello" if you want, or just do nothing special
    // conn.send({ username: localUsername, content: 'Hello from ' + localUsername });

    // When data arrives:
    conn.on('data', (data) => {
      // data is an object like { username, content }
      addMessage(data.username, data.content);

      // If we are the host, broadcast this to everyone else
      if (isHost) {
        broadcastExcept(conn, data);
      }
    });
  });

  conn.on('close', () => {
    console.log('Connection closed with ', conn.peer);
    removeConnection(conn);
  });

  conn.on('error', (err) => {
    console.error('Connection error: ', err);
    removeConnection(conn);
  });
}

// Helper to broadcast to all except the origin
function broadcastExcept(originConn, data) {
  connections.forEach((c) => {
    if (c !== originConn && c.open) {
      c.send(data);
    }
  });
}

// Remove a closed connection from our array
function removeConnection(conn) {
  const index = connections.indexOf(conn);
  if (index >= 0) {
    connections.splice(index, 1);
  }
}

// Show the chat UI and hide the join form
function showChatUI() {
  roomDisplay.textContent = `Room: ${roomNumber} | Username: ${localUsername}`;
  joinForm.classList.add('hidden');
  chatRoom.classList.remove('hidden');
  addMessage('System', 'Joined room ' + roomNumber);
}

// Send a chat message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const message = {
    username: localUsername,
    content: text
  };

  addMessage(message.username, message.content);

  // If host, broadcast to all. If client, we have just one connection (to host)
  if (isHost) {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  } else {
    if (connections[0] && connections[0].open) {
      connections[0].send(message);
    }
  }

  messageInput.value = '';
}

// Display a message locally
function addMessage(username, content) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.textContent = `${username}: ${content}`;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Leave the room
function leaveRoom() {
  // Close all connections
  connections.forEach((conn) => conn.close());
  connections.length = 0;

  // Destroy the peer
  if (peer) {
    peer.destroy();
    peer = null;
  }

  messagesDiv.innerHTML = '';
  chatRoom.classList.add('hidden');
  joinForm.classList.remove('hidden');
  console.log('Left the room');
}
