# My simple Neo P2P Chat
# ❗Im sorry for this but please note that the github pages deployment is not functional❗

## You can test it by opening two browser windows and connecting to the same room !

A secure, peer-to-peer encrypted chat application that works directly in the browser with no server required. Features end-to-end encryption, file sharing, and a beautiful glassmorphism UI design.

## Preview video


https://github.com/user-attachments/assets/247b9f6c-87ec-437a-844a-a11a730141fe



## Features

### Communication
- 🔒 End-to-end encryption
- 🤝 Peer-to-peer connection (no central server)
- 🌐 Works across different networks
- 🔑 Optional room password protection

### File Sharing
- 📁 Support for file attachments
- 🖼️ Image preview in chat
- 📎 Downloadable file links
- 🔐 Encrypted file transfer

### UI/UX
- 🎨 Three theme options (Warm, Cool, Nature)
- 🌟 Modern glassmorphism design
- 📱 Responsive layout
- ⚡ Real-time messaging

## How to Use

1. **Join a Room**
   - Enter your username
   - Enter a 4-digit room number
   - Click "Join Room"

2. **Security Options**
   - As host: Set an encryption password when creating room
   - As client: Enter password to decrypt messages
   - Or join without encryption

3. **Features**
   - Send text messages
   - Share files by clicking the attachment button
   - Switch themes using the theme toggle
   - Leave room anytime

## Technical Details

### Technologies Used
- HTML5
- TailwindCSS
- JavaScript
- PeerJS (WebRTC)
- CryptoJS

### Security Features
- AES encryption for messages
- P2P connection with STUN/TURN servers
- Password-protected rooms
- Client-side encryption/decryption

### Network Architecture
- Decentralized P2P connections
- WebRTC for direct communication
- STUN/TURN servers for NAT traversal

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AndreansxTech/pirate-cipher/main
```

2. Open index.html in a web browser or serve using a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Access the application through your browser at `http://localhost:8000`

## Usage Examples

### Creating a Room
1. Enter your username
2. Choose a 4-digit room number
3. Set encryption password (optional)
4. Share room number with others

### Joining a Room
1. Enter your username
2. Input the shared room number
3. Enter encryption password if required
4. Start chatting!

## Not working
If something is not working then please ensure that your firewall allows this kind of network traffic.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use and modify for your own projects!
