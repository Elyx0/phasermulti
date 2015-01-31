var express = require('express'),
    app = express(app),
    path = require('path'),
    Client = require('./client'),
    Game = require('./game');
    server = require('http').createServer(app);

var game;
// serve static files from the current directory
webRoot = path.resolve(__dirname, '../../client/web');
assetsRoot = path.resolve(__dirname, '../../client/web/assets');
buildRoot = path.resolve(__dirname,'../../client/build');
app.use('/static',express['static'](webRoot));
app.use('/assets',express['static'](assetsRoot));
app.use('/build',express['static'](buildRoot));
app.get('/', function(req, res) {
    res.sendFile('./index.html', {root: webRoot});
});

app.get('/p2', function(req, res) {
    res.sendFile('./p2.html', {root: webRoot});
});

app.get('/test',function(req,res){

    console.log(game.on);
    res.send('Test');
});

module.exports = app;




var now = Date.now();


//classe EurecaServer
var EurecaServer = require('eureca.io').EurecaServer;

//création d'une instance EurecaServer + allow methods
var eurecaServer = new EurecaServer(
{
    transport: 'sockjs',
    allow: ['setId', 'spawnEnemy', 'updateState', 'kill']
});
var clients = {};

//Create phaser game. motherfucker
game = new Game(clients);


//attachement de eureca.io au serveur http
eurecaServer.attach(server);

//detection d'une connexion client
eurecaServer.onConnect(function (conn)
{
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    // //register the client
    // clients[conn.id] = {
    //     id: conn.id,
    //     remote: remote
    // };

    clients[conn.id] = new Client(conn.id,remote);
});

//detection d'une deconnexion
eurecaServer.onDisconnect(function (conn)
{
    console.log('Client disconnected ', conn.id);

    delete clients[conn.id];
    for (var c in clients)
    {

        clients[c].otherDisconnected(conn.id);
    }
});

eurecaServer.exports.handleKeys = function (keys)
{
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    updatedClient.addKeys(keys);
    console.log('[handleKeys]');
};

eurecaServer.exports.handshake = function (name,color)
{
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    updatedClient.name = name.substr(0,15);
    updatedClient.color = color;
    //More or less initial snapshot (no delta)
    //
    // Better have crazy double check dont replace in spawnEnemy >_>
    // c = 283823-djeidjei-23d2
    for (var c in clients)
    {
        var someone = clients[c];
        for (var cc in clients)
        {
            var other = clients[cc];
            other.spawnEnemy(someone);
            local.spawnEnemy(someone);
        }
    }
};

var local = {
    spawnEnemy: function(){}
};

server.listen(8000);




/*

Maybe reinstall nodecCanvas and run phaser on the server too.. But too heavy in my opinion:

curl http://www.cairographics.org/releases/pixman-0.22.0.tar.gz -o pixman.tar.gz
tar -zxf pixman.tar.gz && cd pixman-0.22.0/
./configure --prefix=/usr/local --disable-dependency-tracking
make install


curl http://cairographics.org/releases/cairo-1.12.8.tar.xz -o cairo.tar.xz
tar -zxf cairo.tar.xz && cd cairo-1.12.8
./configure --prefix=/usr/local --disable-dependency-tracking
make install
 */