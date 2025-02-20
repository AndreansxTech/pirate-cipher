## As of 20.02.2025 the TURN/STUN server used by this project is NO LONGER ACTIVE
Connections will still work in one LAN. If you want, you can implement your own TURN/STUN server by making changes to the TURN server settings in the script.js file.


# My Neo P2P Chat

A browser-based peer-to-peer encrypted chat application with file sharing capabilities and a modern UI design. Built with WebRTC for direct peer connections and AES encryption for secure messaging and it uses my own TURN/STUN server.

## Latest update❗
One of the admins of the event that I made this project for pointed out that he has been getting errors when joining. I checked and he was right. I really struggled with how to make it work. The main problem was the TURN server. So I simply made my own. I created a droplet on DigitalOcean and ran a Coturn server there. 
## Website
### You can check out and communicate now with people in different places by visiting https://my-neo-p2p-chat.pages.dev/

## Below is a video showing what I fixed
There are two devices. The laptop is on my local network connected to the website and the smartphone is connected to a cellular network. As you can see, I am able to communicate between those two devices.


https://github.com/user-attachments/assets/e9566b18-d369-4033-9b91-3dd88abc5850



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

### The project is currently using my STUN/TURN server because the public ones are working so bad that you littelary could not make a connection. You can make your own by paying for a droplet on DigitalOcean ( or any web-capable server with SSH access ) and installing <a href="https://github.com/coturn/coturn">Coturn</a> there. 
```
sudo apt-get install coturn
```
Then you will need to modify the configuration files accordingly to you.
