# My Neo P2P Chat

A browser-based peer-to-peer encrypted chat application with file sharing capabilities and a modern UI design. Built with WebRTC for direct peer connections and AES encryption for secure messaging.

## Latest update❗
One of the admins of the event that I made this project for pointed out that he has been getting errors when joining. I checked and he was right. I really struggled with how to make it work. The main problem was the TURN server. So I simply made my own. I created a droplet on DigitalOcean and ran a Coturn server there. 
## Website
### You can check out and communicate now with people in different places by visiting https://my-neo-p2p-chat.pages.dev/
## Features

### Security & Privacy 
- 🔒 Optional end-to-end AES encryption
- 🤝 Direct peer-to-peer WebRTC connections 
- 🌐 No central message server
- 🔑 Password-protected chat rooms

### Messaging & Files
- 💬 Real-time text messaging
- 📁 Secure file sharing support 
- 🖼️ Inline image previews
- 📎 Downloadable file attachments

### Modern UI
- 🎨 3 theme options:
  - Warm (Orange gradient)
  - Cool (Blue/Purple gradient)
  - Nature (Green gradient)
- 🌟 Glassmorphism design elements
- ✨ Smooth animations & transitions

## Quick Start

1. Open [index.html](index.html) in your browser or launch the <a href="https://my-neo-p2p-chat.pages.dev/">website</a>
2. Enter a username
3. Enter a 4-digit room code
4. Click "Join Room"

No installation or server setup required!

## Room Types

### Creating a Room
1. Enter any unused 4-digit room code
2. You'll become the host automatically
3. Optionally set an encryption password
4. Share the room code with others

### Joining a Room
1. Enter the shared room code
2. Enter encryption password if required
3. Or join without encryption (can't read encrypted messages)
4. Start chatting!

## Usage Tips

### File Sharing
- Click the attachment icon to share files
- Images display inline with click-to-expand
- Other files appear as downloadable links
- All files transfer directly peer-to-peer

### Encryption
- Host sets optional room password
- Clients need same password to decrypt
- Can join without password but see encrypted text
- Add encryption later via "Set Encryption" button

### Connection Info
- System messages show connection status
- Username appears above each message
- Room code shown in top bar
- Leave room cleanly with "Leave" button

## Technical Details

### Core Technologies
- HTML5 & CSS3
- Vanilla JavaScript 
- TailwindCSS for styling
- PeerJS (WebRTC wrapper)
- CryptoJS for encryption
- Coturn for self-hosting of the TURN server that helps with NAT problems

### Key Files
- [index.html](index.html) - Main application UI
- [script.js](script.js) - Core application logic
- [styles.css](styles.css) - Custom CSS styling

## Browser Support

WebRTC and modern JavaScript support required.

## Development

To modify or enhance:

1. Clone the repository
2. Edit files directly - no build step needed
3. Open index.html locally 
