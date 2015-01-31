var utils = require('../../shared/utils.js');
var config = require('../../shared/config.json');
var _ = require('lodash');

var ready = false;
var myId;
var myName;
var myColor;
var eurecaServer;

function get_random_color() {
   var letters = '0123456789ABCDEF'.split('');
   var color = '0x';
   for (var i = 0; i < 6; i++ ) {
       color += letters[Math.round(Math.random() * 15)];
   }
   return color;
}
//this function will handle client communication with the server
var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var uri;
    if (location.origin)
    {
        if (!location.origin.match(/localhost/))
        {
            uri = 'ws://' + location.host + '/';
        }
        else
        {
            uri = 'ws://localhost:8000/';
        }
    }
    var eurecaClient = new Eureca.Client({ uri: uri, prefix: 'eureca.io', transport: 'sockjs' });
    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });

    //methods defined under "exports" namespace become available in the server side

    //Server call these FOR US
     eurecaClient.exports.setId = function(id)
     {
        // T'as recu un ID, tu peux jouer, on set ton id, go
         //create() is moved here to make sure nothing is created before uniq id assignation
         myId = id;
         myColor = get_random_color();
         myName = localStorage.name || prompt('Name');
         localStorage.name = myName;
         //myName = id.substr(0,15);
         create();
         eurecaServer.handshake(myName,myColor); //Spawns me for other people my own code is in create
         ready = true;
         console.log('Set ID: OK');
     };

     eurecaClient.exports.kill = function(id)
        {
            if (playersList[id]) {
                playersList[id].kill();
                console.log('killing ', id, playersList[id]);
                //delete playersList[id];
            }
        };

     eurecaClient.exports.spawnEnemy = function(i, x, y,name,color)
      {

          if (i == myId) return; //this is me rofl don't spawn me !

          console.log('SPAWN');
          var pl = new Player(i, game, name, x, y,color);
          playersList[i] = pl;
      };

      eurecaClient.exports.updateState = function(snapshot)
        {
            _.forIn(snapshot.clients,function(client,id)
            {
                if (playersList[id])
                {
                    var player = playersList[id];
                    if (client.keys)
                    {
                        player.cursor = client.keys;
                        //Todo:
                        //Process keys stored, update server client.x / client.y
                        //Snapshots never get killed.. ?
                    }

                    player.update();
                }
            },this);
        }

};


// We create our only state
var game;


var walls;

var player;


var currentPlayer;

var hero;

var playersList;

var cursors;

var Player;

Player = function (index, game, name,x,y,color)
{
    this.cursor = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false
    };

    this.input = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false
    };
    this.game = game;
    this.hero = game.add.sprite(x || game.world.centerX, y || game.world.centerY, 'player');
    this.hero.animations.add('right',[1,2],8,true);
    this.hero.animations.add('left',[3,4],8,true);
    this.hero.anchor.setTo(0.5, 0.5);
    this.hero.tint = color;
    game.physics.arcade.enable(this.hero); // Add vertical gravity to the player

    this.hero.acceleration = 700;
    this.hero.drag = this.hero.acceleration * 1;

    this.hero.body.drag.setTo(this.hero.drag,0);
    this.hero.body.bounce.y = 0.1;
    this.hero.body.gravity.y = 750;
    this.hero.jumpSpeed = 300;
    this.hero.jumpAcceleration = 450;
    this.hero.maxJump = 190;
    this.hero.body.maxVelocity.setTo(this.hero.acceleration/4,this.hero.jumpSpeed); //Will have to change for velocity when hit
    this.hero.id = index;
    this.name = name;
    this.plateName = game.add.text(x, y-20, name, { font: '12px Arial', fill: '#ffffff' });
    this.plateName.anchor.setTo(0.5,0.5);
    this.id = index;
    this.alive = true;
    this.doublejumped = false;
};


Player.prototype.kill = function()
{
    this.alive = false;
    this.plateName.destroy();
    this.hero.kill();
};

Player.prototype.update = function ()
{
    // for (var i in this.input) this.cursor[i] = this.input[i];


    //PIXEL PER SECOND
    // If the left arrow key is pressed
    if (this.hero.body.touching.down)
    {
        this.downCheck = true;
        this.didFirstJump = false;

        if (this.cursor.left)
        {
            // Move the player to the left
            this.hero.body.acceleration.x = -this.hero.acceleration;
            this.hero.animations.play('left');
        }
        // If the right arrow key is pressed
        else if (this.cursor.right)
        { // Move the hero to the right
            this.hero.body.acceleration.x = this.hero.acceleration;
            this.hero.animations.play('right');
        }
        // If neither the right or left arrow key is pressed
        else
        {
            // Stop the hero

            this.hero.body.acceleration.x = 0;
            this.hero.animations.stop();
            this.hero.frame = 0;
        }
        // If the up arrow key is pressed and the hero is touching the ground
        if (this.cursor.up && this.downCheck)
        { // Move the hero upward (jump)
            this.hero.body.velocity.y = -this.hero.jumpSpeed * 0.5;
            this.hero.body.acceleration.y = -this.hero.jumpSpeed * 0.3;
            this.doublejumped = false;
            this.downCheck = false;

        }
    }
    else
    {
        //We're in the air !
        if (this.cursor.left)
        {
            // // Move the player to the left
            // if (this.hero.body.velocity.x > 0)
            // {
                //We're going right and pressed left
                this.hero.body.acceleration.x = -this.hero.jumpAcceleration;
                this.hero.animations.play('left');
            // }
        }
        //We're in the air !
        if (this.cursor.right)
        {
            // // Move the player to the left
            // if (this.hero.body.velocity.x < 0)
            // {
                //We're going right and pressed left
                this.hero.body.acceleration.x = this.hero.jumpAcceleration;
                this.hero.animations.play('right');
            // }
        }
        if (!this.cursor.up)
        {
            //He released the button
            this.hero.body.acceleration.y = 0;
            this.downCheck = true;
        }
        else {
            if (!this.didFirstJump)
            {
                //cursor still up after first mini-jump he still didnt release
                this.hero.body.acceleration.y -= this.hero.jumpAcceleration / 3;
                 if (this.hero.body.velocity.y <= -this.hero.maxJump)
                 {
                    //Stop high jump !
                    this.hero.body.acceleration.y = 0;
                    this.didFirstJump = true;
                }
                else
                {
                    console.log(this.hero.body.velocity.y,-this.hero.jumpSpeed);
                }
            }

        }
        if (!this.doublejumped && this.cursor.up && this.downCheck)
        {
                this.doublejumped = true;
                this.hero.body.velocity.y = -(this.hero.jumpSpeed * 0.9);
                //check for both :( same time ;s ?
                if (this.hero.body.velocity.x > 0)
                {
                    //Going to the right.. check input
                    if (this.cursor.right && !this.cursor.left)
                    {
                        //And wanting to jump right
                        this.hero.body.acceleration.x = this.hero.acceleration;
                        this.hero.animations.play('right');
                    }
                    else if(this.cursor.left && !this.cursor.right)
                    {
                        //And wanting to jump the opposite (left)
                        this.hero.body.velocity.x = 0;
                        this.hero.body.acceleration.x = -this.hero.acceleration;
                        this.hero.animations.play('left');
                    }
                }
                else if (this.hero.body.velocity.x < 0)
                {
                    //Going to the left.. check input
                    if (this.cursor.left && !this.cursor.right)
                    {
                        //And wanting to jump left
                        this.hero.body.acceleration.x = -this.hero.acceleration;
                        this.hero.animations.play('left');
                    }
                    else if(this.cursor.right && !this.cursor.left)
                    {
                        //And wanting to jump the opposite (right)
                        this.hero.body.velocity.x = 0;
                        this.hero.body.acceleration.x = this.hero.acceleration;
                        this.hero.animations.play('right');
                        //debugger;
                    }
                }
        }

    }

    this.plateName.x = this.hero.x;
    this.plateName.y = this.hero.y - 20;
};

function preload()
{
    // This function will be executed at the beginning // That's where we load the game's assets
    //
    //game.load.image('logo', 'logo.png');
    game.load.spritesheet('player', 'assets/player2.png', 20, 20);
    game.load.image('wallV', 'assets/wallVertical.png');
    game.load.image('wallH', 'assets/wallHorizontal.png');
}


function createWalls()
{
    //Walls
    // Create a new group
    walls = game.add.group();
    // // Add Arcade physics to the whole group
    walls.enableBody = true;
    // // Create 2 walls in the group
    // var w1 = game.add.sprite(0, 0, 'wallV', 0, walls); //added
    // var w2 = game.add.sprite(480, 0, 'wallV', 0, walls);
    // w2.scale.setTo(1,0.3);
    // w1.scale.setTo(1,2);

    // var w3 = game.add.sprite(580, 0, 'wallV', 0, walls);
    // w3.scale.setTo(1,2);


    // var w3 = game.add.sprite(0, 420, 'wallH', 0, walls);
    // w3.scale.setTo(3,1);


    // var separ = game.add.sprite(280, 0, 'wallV', 0, walls);
    // separ.scale.setTo(1,0.1);

    // // game.add.sprite(0, 0, 'wallH', 0, walls);

    var middle = game.add.sprite(200, 280, 'wallH', 0, walls);
    middle.scale.setTo(8, 1);

    // var right = game.add.sprite(400, 160, 'wallH', 0, walls);
    // right.scale.setTo(0.7,0.4);


    // var right = game.add.sprite(200, 80, 'wallH', 0, walls);
    // right.scale.setTo(1,1);

    // var left = game.add.sprite(0, 160, 'wallH', 0, walls);
    // left.scale.setTo(0.8,0.4);

    // game.add.sprite(0, 330, 'wallH', 0, walls);

    walls.setAll('body.immovable', true);
}

function create()
{
    // This function is called after the preload function // Here we set up the game, display sprites, etc.
    //this.sprite = game.add.sprite(200, 150, 'logo');
    game.stage.backgroundColor = '#3498db';
    game.renderer.clearBeforeRender = true;
    game.renderer.roundPixels = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);


    //scaling options
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    //have the game centered horizontally
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    //screen size will be set automatically
    //game.scale.setScreenSize(true);

    cursors = game.input.keyboard.createCursorKeys();

    createWalls();

    playersList = {};
    currentPlayer = new Player(myId, game, myName, false, false,myColor);
    playersList[myId] = currentPlayer;

}

function render()
{
    if (!ready) return;
      game.debug.bodyInfo(currentPlayer.hero, 16, 24);
     // game.debug.body(currentPlayer.hero);
};

function update()
{
    if (!ready) return;
    //game.debug.geom(circle, '#00ff00', false, 2);

    // This function is called 60 times per second // It contains the game's logic
    //
    var cursorChanged = (
                        currentPlayer.cursor.left != cursors.left.isDown ||
                        currentPlayer.cursor.right != cursors.right.isDown ||
                        currentPlayer.cursor.up != cursors.up.isDown ||
                        currentPlayer.cursor.down != cursors.down.isDown
                        );

    currentPlayer.cursor.left = cursors.left.isDown;
    currentPlayer.cursor.right = cursors.right.isDown;
    currentPlayer.cursor.up = cursors.up.isDown;
    currentPlayer.cursor.down = cursors.down.isDown;

    if (cursorChanged)
        {
                eurecaServer.handleKeys(currentPlayer.cursor);
                console.log('CHANGED');
        }

    for (var i in playersList)
    {
        if (!playersList[i])
        {
            continue;
        };
        game.physics.arcade.collide(playersList[i].hero, walls);
        if (playersList[i].alive)
        {
            playersList[i].update();
        }

    }
}


// We initialising Phaser
game = new Phaser.Game(config.canvasWidth , config.canvasHeight, Phaser.AUTO, 'gameDiv',
{
    preload: preload,
    create: eurecaClientSetup,
    update: update,
    render: render
});
// And finally we tell Phaser to add and start our 'main' state

// game.state.add('main', mainState);
// game.state.start('main');