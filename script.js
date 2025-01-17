let localUsername = '';
let roomNumber = '';
let isHost = false;
let currentTheme = 'warm';
let encryptionKey = '';
let isPasswordSet = false;
let hasDeclined = false;

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
const themeToggle = document.getElementById('theme-toggle');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordConfirm = document.getElementById('password-confirm');
const passwordCancel = document.getElementById('password-cancel');
const passwordModalTitle = document.getElementById('password-modal-title');
const encryptionBtn = document.getElementById('encryption-btn');

joinBtn.addEventListener('click', joinRoom);
leaveBtn.addEventListener('click', leaveRoom);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
themeToggle.addEventListener('click', () => {
  const body = document.body;
  currentTheme = currentTheme === 'warm' ? 'cool' : 'warm';
  body.classList.remove(`theme-${currentTheme === 'warm' ? 'cool' : 'warm'}`);
  body.classList.add(`theme-${currentTheme}`);

  // Update all buttons and focus rings
  document.querySelectorAll('button').forEach(button => {
    if (button.id !== 'leave-btn') {
      button.classList.remove(
        currentTheme === 'warm' ? 'bg-cool-500' : 'bg-warm-500',
        currentTheme === 'warm' ? 'hover:bg-cool-600' : 'hover:bg-warm-600'
      );
      button.classList.add(
        `bg-${currentTheme}-500`,
        `hover:bg-${currentTheme}-600`
      );
    }
  });

  // Update input focus rings
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove(
      currentTheme === 'warm' ? 'focus:ring-cool-400' : 'focus:ring-warm-400'
    );
    input.classList.add(`focus:ring-${currentTheme}-400`);
  });
});

encryptionBtn.addEventListener('click', async () => {
  try {
    encryptionKey = await showPasswordPrompt(false);
    encryptionBtn.classList.add('hidden');
    addMessage('System', 'Encryption enabled - you can now read messages');
  } catch (e) {
    console.log('Password entry cancelled');
  }
});

// We'll keep a reference to our Peer instance:
let peer = null;

// Update joinRoom function to simplify connection logic
function joinRoom() {
  const usernameInput = document.getElementById('username');
  const roomInput = document.getElementById('room-number');

  if (!usernameInput.value || !roomInput.value.match(/^\d{4}$/)) {
    alert('Please enter a valid name and 4-digit room number');
    return;
  }

  localUsername = usernameInput.value.trim();
  roomNumber = roomInput.value.trim();

  // Create a peer with the room number first (trying to be host)
  peer = new Peer(roomNumber);

  peer.on('error', async (err) => {
    if (err.type === 'unavailable-id') {
      // Room exists, become a client
      console.log('Room exists, joining as client');
      peer = new Peer();
      
      peer.on('open', async () => {
        try {
          encryptionKey = await showPasswordPrompt(false);
          console.log('Creating connection to host...');
          
          // Connect to host
          const conn = peer.connect(roomNumber, {
            reliable: true,
            serialization: 'json'
          });
          
          conn.on('open', () => {
            isHost = false;
            console.log('Connected as client to:', roomNumber);
            handleConnection(conn);  // This will set up the data listener
            connections.push(conn);
            showChatUI();
          });

          conn.on('error', (err) => {
            console.error('Client connection error:', err);
          });

        } catch (e) {
          console.log('Password entry cancelled');
          hasDeclined = true;
          const conn = peer.connect(roomNumber, {
            reliable: true,
            serialization: 'json'
          });
          conn.on('open', () => {
            isHost = false;
            connections.push(conn);
            handleConnection(conn);
            showChatUI();
          });
        }
      });
    }
  });

  peer.on('open', (id) => {
    if (id === roomNumber) {
      isHost = true;
      console.log('Created room as host:', id);
      
      peer.on('connection', (clientConn) => {
        console.log('Host received connection from:', clientConn.peer);
        handleConnection(clientConn);
        connections.push(clientConn);
      });
      
      becomeHost();
    }
  });
}

// New function to handle host creation
function becomeHost() {
  showPasswordPrompt(true).then(password => {
    encryptionKey = password;
    isPasswordSet = true;
    showChatUI();
  }).catch(() => {
    // If host cancels password setup, still create room but without encryption
    isPasswordSet = false;
    encryptionKey = '';
    showChatUI();
  });
}

// New function to handle peer connection initialization
function initializePeerConnection() {
  peer = new Peer(roomNumber, {
    debug: 2
  });

  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      isHost = false;
      peer = new Peer(null, { debug: 2 });
      setupPeerListeners();
    } else {
      console.error(err);
      alert('Error creating or connecting to Peer: ' + err);
    }
  });

  peer.on('open', (id) => {
    if (id === roomNumber) {
      isHost = true;
      console.log(`HOST: Our peer ID is ${id}`);
      showChatUI();
    } else {
      console.log(`CLIENT: Our random peer ID is ${id}, connecting to host...`);
      connectToHost();
    }
  });

  peer.on('connection', (conn) => {
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

// Add encryption/decryption functions
function encryptMessage(text) {
  if (!encryptionKey) return text;
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
}

function decryptMessage(text) {
  if (!encryptionKey) return text;
  try {
    const bytes = CryptoJS.AES.decrypt(text, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return '[Encrypted Message]';
  }
}

// Add password handling
function showPasswordPrompt(isSettingPassword = true) {
  passwordModalTitle.textContent = isSettingPassword ? 'Set Room Password' : 'Enter Room Password';
  passwordModal.classList.remove('hidden');
  
  return new Promise((resolve, reject) => {
    const handleConfirm = () => {
      const password = passwordInput.value;
      if (password) {
        passwordModal.classList.add('hidden');
        passwordInput.value = '';
        resolve(password);
      }
    };

    const handleCancel = () => {
      passwordModal.classList.add('hidden');
      passwordInput.value = '';
      reject('Password prompt cancelled');
    };

    passwordConfirm.onclick = handleConfirm;
    passwordCancel.onclick = handleCancel;
    passwordInput.onkeypress = (e) => {
      if (e.key === 'Enter') handleConfirm();
    };
  });
}

// Update handleConnection function to fix message handling
function handleConnection(conn) {
  conn.on('open', async () => {
    console.log('Connection established with:', conn.peer);

    // Send join message
    try {
      conn.send({
        type: 'join',
        username: localUsername,
        content: encryptMessage(`${localUsername} joined the chat`)
      });
    } catch (err) {
      console.error('Error sending join message:', err);
    }
  });

  // Single data event handler for all messages
  conn.on('data', (data) => {
    console.log('Received data:', data);

    switch(data.type) {
      case 'join':
        addMessage('System', decryptMessage(data.content));
        break;
      case 'chat':
        // Only show messages from others
        if (data.username !== localUsername) {
          addMessage(data.username, decryptMessage(data.content));
        }
        // If host, broadcast to others
        if (isHost) {
          connections.forEach(otherConn => {
            if (otherConn.peer !== conn.peer && otherConn.open) {
              console.log('Broadcasting to:', otherConn.peer);
              otherConn.send(data);
            }
          });
        }
        break;
    }
  });

  conn.on('close', () => {
    console.log('Connection closed:', conn.peer);
    removeConnection(conn);
    addMessage('System', 'A user has disconnected');
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    removeConnection(conn);
  });
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const message = {
    type: 'chat',
    username: localUsername,
    content: encryptMessage(text),
  };

  // Show our own message unencrypted
  addMessage(localUsername, text);

  // Send the message
  if (isHost) {
    // Host broadcasts to all clients
    connections.forEach((conn) => {
      if (conn && conn.open) {
        try {
          console.log('Host sending to:', conn.peer);
          conn.send(message);
        } catch (err) {
          console.error('Error sending to client:', err);
        }
      }
    });
  } else {
    // Client sends only to host
    const conn = connections[0];
    if (conn && conn.open) {
      try {
        console.log('Client sending to host');
        conn.send(message);
      } catch (err) {
        console.error('Error sending to host:', err);
        addMessage('System', 'Failed to send message');
      }
    } else {
      console.error('No connection to host!');
      addMessage('System', 'Not connected to host');
    }
  }

  messageInput.value = '';
}

// Add debug helper function
function logConnections() {
  console.log('Current connections:', connections.map(conn => ({
    peer: conn.peer,
    open: conn.open,
    type: isHost ? 'client' : 'host'
  })));
}

// Update removeConnection to include logging
function removeConnection(conn) {
  const index = connections.indexOf(conn);
  if (index >= 0) {
    connections.splice(index, 1);
    console.log('Removed connection:', conn.peer);
    logConnections();
  }
}

// Show the chat UI and hide the join form
function showChatUI() {
  roomDisplay.textContent = `Room: ${roomNumber} | Username: ${localUsername}`;
  joinForm.classList.add('hidden');
  chatRoom.classList.remove('hidden');
  
  if (hasDeclined) {
    encryptionBtn.classList.remove('hidden');
  } else {
    encryptionBtn.classList.add('hidden');
  }
  
  // Add system message for self
  addMessage('System', 'Welcome to room ' + roomNumber);
}

// Display a message locally
function addMessage(username, content) {
  const messageDiv = document.createElement('div');
  const messageContainer = document.createElement('div');
  
  // Base classes for all messages
  messageContainer.classList.add('flex', 'w-full', 'mb-2');
  
  if (username === 'System') {
    // System message styling
    messageDiv.classList.add(
      'mx-auto',
      'backdrop-blur-sm',
      'bg-black/20',
      'px-4',
      'py-2',
      'rounded-lg',
      'text-white/80',
      'text-sm',
      'italic'
    );
  } else if (username === localUsername) {
    // Own message styling
    messageContainer.classList.add('justify-end');
    messageDiv.classList.add(
      'backdrop-blur-sm',
      `bg-${currentTheme}-500/50`,
      'px-4',
      'py-2',
      'rounded-lg',
      'text-white',
      'max-w-[80%]'
    );
  } else {
    // Other users' message styling
    messageContainer.classList.add('justify-start');
    messageDiv.classList.add(
      'backdrop-blur-sm',
      'bg-white/20',
      'px-4',
      'py-2',
      'rounded-lg',
      'text-white',
      'max-w-[80%]'
    );
  }

  if (username !== 'System') {
    const nameSpan = document.createElement('div');
    nameSpan.classList.add('text-sm', 'opacity-70', 'mb-1');
    nameSpan.textContent = username;
    messageDiv.appendChild(nameSpan);
  }

  const contentSpan = document.createElement('div');
  contentSpan.textContent = content;
  messageDiv.appendChild(contentSpan);
  
  messageContainer.appendChild(messageDiv);
  messagesDiv.appendChild(messageContainer);
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
  encryptionKey = '';
  isPasswordSet = false;
  hasDeclined = false;
  encryptionBtn.classList.add('hidden');
  console.log('Left the room');
}
