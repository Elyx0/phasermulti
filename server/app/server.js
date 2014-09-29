var express = require('express'),
    app = express(app),
    path = require('path'),
    server = require('http').createServer(app),
    webRoot;

var game;
// serve static files from the current directory
webRoot = path.resolve(__dirname, '../../client/web');
assetsRoot = path.resolve(__dirname, '../../assets');
console.log(assetsRoot);
app.use('/static',express['static'](webRoot));
app.use('/assets',express['static'](assetsRoot));
app.get('/', function(req, res) {
    res.sendFile('index.html', {root: webRoot});
});

app.get('/test',function(req,res){
    //console.log(game);

    res.send('Prout');
});

module.exports = app;



Player = require('./player');





//Create phaser game. motherfucker











//classe EurecaServer
var EurecaServer = require('eureca.io').EurecaServer;

//création d'une instance EurecaServer + allow methods
var eurecaServer = new EurecaServer(
{
    transport: 'sockjs',
    allow: ['setId', 'spawnEnemy', 'updateState', 'kill']
});
var clients = {};

//attachement de eureca.io au serveur http
eurecaServer.attach(server);

//detection d'une connexion client
eurecaServer.onConnect(function (conn)
{
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    clients[conn.id] = {
        id: conn.id,
        remote: remote
    };

    //here we call setId (defined in the client side)
    remote.setId(conn.id);
});

//detection d'une deconnexion
eurecaServer.onDisconnect(function (conn)
{
    console.log('Client disconnected ', conn.id);
    var removeId = clients[conn.id].id;

    delete clients[conn.id];

    for (var c in clients)
    {
        var remote = clients[c].remote;

        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }
});

eurecaServer.exports.handleKeys = function (keys,velocity)
{
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    console.log('Got keys!', keys);
    for (var c in clients)
    {
        var remote = clients[c].remote;
        remote.updateState(updatedClient.id, keys,velocity);

        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
};

eurecaServer.exports.handshake = function (name,color)
{
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    updatedClient.name = name.substr(0,15);
    updatedClient.color = color;
    //More or less initial snapshot (no delta)
    for (var c in clients)
    {
        var remote = clients[c].remote;
        for (var cc in clients)
        {
            var x = clients[cc].laststate ? clients[cc].laststate.x : 0;
            var y = clients[cc].laststate ? clients[cc].laststate.y : 0;
            var name = clients[cc].name;
            var color = clients[cc].color;
            remote.spawnEnemy(clients[cc].id, x, y, name,color);
            local.spawnEnemy(clients[cc].id, x, y, name,color);
        }
    }
};

var myId = null;

var local = {
    spawnEnemy: function(i, x, y,name,color)
          {
              if (i == myId) return; //this is me rofl don't spawn me !

              console.log('SPAWN');
              //var pl = new Player(i, game, name, x, y,color);
              game.add.sprite(x || game.world.centerX, y || game.world.centerY, 'player');
              console.log(game.cache);
              //playersList[i] = pl;
          }
};

server.listen(8000);