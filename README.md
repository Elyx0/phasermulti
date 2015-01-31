# Multiplayer Websocket Node POC

Browser based player movement using WebSockets + Phaser + Eureca.io

![Screenshot](/../screenshots/screenshots/screenshot.png?raw=true "Example")

#### Local Setup

Run these:

```
npm install

watchify ./client/app/test.js -d -o ./client/build/build.js -v

cd server/app/

node --harmony-proxies server.js
```

Then point your browser to http://locahost:8000/p2

### Inviting a friend ?
Install [ngrok](https://ngrok.com/)

Then run ngrok on your server port (default: 8000)

```
ngrok 8000
```

### Why stopping here the development ?
I came across problems to double check the server-client physics validations.
As I need to replicate the conditions server side as an authoritative server to validate that nothing crazy is
happening

See: https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization
