let connections = new Map();
let localUsername = '';
let roomNumber = '';
let ws = null;

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

async function joinRoom() {
    const usernameInput = document.getElementById('username');
    const roomInput = document.getElementById('room-number');
    
    if (!usernameInput.value || !roomInput.value.match(/^\d{4}$/)) {
        alert('Please enter a valid name and 4-digit room number');
        return;
    }

    localUsername = usernameInput.value;
    roomNumber = roomInput.value;
    
    // Connect to Cloudflare Worker
    ws = new WebSocket('https://chat-signaling.koliberekart.workers.dev');
    
    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: 'join',
            room: roomNumber,
            username: localUsername
        }));
    };

    ws.onmessage = handleSignalingMessage;
    
    roomDisplay.textContent = `Room: ${roomNumber} | Username: ${localUsername}`;
    joinForm.classList.add('hidden');
    chatRoom.classList.remove('hidden');
    addMessage('System', 'Joined room ' + roomNumber);
}

async function handleSignalingMessage(event) {
    const message = JSON.parse(event.data);
    
    switch(message.type) {
        case 'user-joined':
            if (message.username !== localUsername) {
                addMessage('System', `${message.username} joined the room`);
                createPeerConnection(message.username);
            }
            break;
            
        case 'user-left':
            if (message.username !== localUsername) {
                addMessage('System', `${message.username} left the room`);
                connections.delete(message.username);
            }
            break;
            
        case 'offer':
            handleOffer(message);
            break;
            
        case 'answer':
            handleAnswer(message);
            break;
            
        case 'ice-candidate':
            handleIceCandidate(message);
            break;
    }
}

async function createPeerConnection(username) {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
                target: username,
                room: roomNumber,
                sender: localUsername
            }));
        }
    };
    
    pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, username);
    };
    
    const dataChannel = pc.createDataChannel('chat');
    setupDataChannel(dataChannel, username);
    
    connections.set(username, { pc, dataChannel });
    
    // Create and send offer if we're the initiator
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({
        type: 'offer',
        offer: offer,
        target: username,
        room: roomNumber,
        sender: localUsername
    }));
}

function setupDataChannel(dataChannel, username) {
    dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        addMessage(message.username, message.content);
    };
}

async function handleOffer(message) {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
                target: message.sender,
                room: roomNumber,
                sender: localUsername
            }));
        }
    };
    
    pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, message.sender);
    };
    
    connections.set(message.sender, { pc });
    
    await pc.setRemoteDescription(message.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    ws.send(JSON.stringify({
        type: 'answer',
        answer: answer,
        target: message.sender,
        room: roomNumber,
        sender: localUsername
    }));
}

async function handleAnswer(message) {
    const connection = connections.get(message.sender);
    if (connection) {
        await connection.pc.setRemoteDescription(message.answer);
    }
}

async function handleIceCandidate(message) {
    const connection = connections.get(message.sender);
    if (connection) {
        await connection.pc.addIceCandidate(message.candidate);
    }
}

function leaveRoom() {
    if (ws) {
        ws.close();
    }
    connections.forEach(({ pc }) => pc.close());
    connections.clear();
    
    chatRoom.classList.add('hidden');
    joinForm.classList.remove('hidden');
    messagesDiv.innerHTML = '';
}

function sendMessage() {
    if (!messageInput.value.trim()) return;
    
    const message = {
        username: localUsername,
        content: messageInput.value,
        timestamp: new Date().toISOString()
    };
    
    addMessage(message.username, message.content);
    
    // Send message to all peers
    connections.forEach(({ dataChannel }) => {
        if (dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify(message));
        }
    });
    
    messageInput.value = '';
}

function addMessage(username, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = `${username}: ${content}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
