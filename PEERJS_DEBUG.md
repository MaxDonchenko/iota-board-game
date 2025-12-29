# Debugging PeerJS Traffic

## Overview

PeerJS uses WebRTC for peer-to-peer connections. To debug PeerJS traffic, you can monitor network activity and WebRTC connections in your browser's developer tools.

## Browser Developer Tools

### 1. Network Tab

- **Filter by WebSocket**: PeerJS uses WebSocket connections to the signaling server
  - Look for connections to `peerjs.com` or your custom PeerJS server
  - Filter: `WS` (WebSocket) or search for "peerjs"
- **Filter by WebRTC**: Direct peer connections
  - Look for `webrtc` or `peerconnection` in the network requests
  - These are the actual P2P data channels between peers

### 2. Console Logs

All PeerJS-related logs in this codebase are prefixed with `[PeerJS]` for easy filtering:

- Open browser console
- Filter by typing `[PeerJS]` in the console filter
- You'll see:
  - `[PeerJS] My Peer ID: <id>` - When your peer connection opens
  - `[PeerJS] Connected to host` - When a guest connects to host
  - `[PeerJS] New client connected: <name>` - When host receives a connection
  - `[PeerJS] Connection closed` - When a connection is closed
  - `[PeerJS] Error: <error>` - Any errors that occur

### 3. Application Tab (Chrome DevTools)

- **Storage > WebRTC Internals**:
  - Navigate to `chrome://webrtc-internals/` in Chrome
  - Shows all active WebRTC connections
  - Displays connection stats, ICE candidates, and data channel information

### 4. Network Monitoring Tools

- **Wireshark**: Can capture WebRTC traffic (requires proper setup)
- **Browser Extensions**:
  - "WebRTC Leak Prevent" can show WebRTC connections
  - "WebRTC Network Limiter" for testing

## Common Issues

### Connection Fails

1. Check browser console for `[PeerJS]` error messages
2. Verify PeerJS server is accessible (default: `peerjs.com`)
3. Check firewall/NAT settings (WebRTC requires proper port forwarding)
4. Look for ICE connection failures in WebRTC internals

### Data Not Sending

1. Check if connection is established (look for "Connected to host" log)
2. Verify data channel is open (check WebRTC internals)
3. Check browser console for any errors when sending data

### Debugging Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Filter by `[PeerJS]` to see all PeerJS logs
4. Go to Network tab and filter by `WS` to see WebSocket connections
5. Open `chrome://webrtc-internals/` in a new tab to see WebRTC stats

## Testing Locally

When testing locally, you can:

1. Open multiple browser windows/tabs
2. Use different browsers (Chrome, Firefox, Edge) to test cross-browser compatibility
3. Use browser's "Inspect" to see network traffic for each peer
4. Monitor console logs with `[PeerJS]` prefix to track connection flow

## Network Tab Filters

- `peerjs` - Shows PeerJS signaling server connections
- `webrtc` - Shows WebRTC peer connections
- `ws://` or `wss://` - Shows WebSocket connections (PeerJS signaling)
