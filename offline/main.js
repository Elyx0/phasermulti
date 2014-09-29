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
    game.physics.ninja.enable(this.hero); // Add vertical gravity to the player
    this.hero.body.bounce.y = 0.2;
    this.hero.body.gravity.y = 500;
    this.hero.id = index;
    this.name = name;
    this.plateName = game.add.text(x, y-20, name, { font: '12px Arial', fill: '#ffffff' });
    this.plateName.anchor.setTo(0.5,0.5);
    this.id = index;
    this.alive = true;
};


Player.prototype.kill = function()
{
    this.alive = false;
    this.plateName.destroy();
    this.hero.kill();
};

Player.prototype.update = function ()
{
     for (var i in this.input) this.cursor[i] = this.input[i];

    // var inputChanged = (
    //         this.cursor.left != this.input.left ||
    //         this.cursor.right != this.input.right ||
    //         this.cursor.up != this.input.up ||
    //         this.cursor.down != this.input.down
    //     );

    // if (inputChanged)
    //     {
    //         //Handle input change here
    //         //send new values to the server
    //         if (this.hero.id == myId)
    //         {
    //             // send latest valid state to the server
    //             this.input.x = this.hero.x;
    //             this.input.y = this.hero.y;
    //             // this.input.angle = this.tank.angle;
    //             // this.input.rot = this.turret.rotation;
    //         }
    //     }

    //PIXEL PER SECOND
    // If the left arrow key is pressed
    if (this.cursor.left)
    {
        // Move the player to the left
        this.hero.body.velocity.x = -200;
        this.hero.animations.play('left');
    }
    // If the right arrow key is pressed
    else if (this.cursor.right)
    { // Move the hero to the right
        this.hero.body.velocity.x = 200;
        this.hero.animations.play('right');
    }
    // If neither the right or left arrow key is pressed
    else
    {
        // Stop the hero
        this.hero.body.velocity.x = 0;
        this.hero.animations.stop();
        this.hero.frame = 0;
    }
    // If the up arrow key is pressed and the hero is touching the ground
    if (this.cursor.up && this.hero.body.touching.down)
    { // Move the hero upward (jump)
        this.hero.body.velocity.y = -320;
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
    // // Add ninja physics to the whole group
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

    var middle = game.add.sprite(200, 240, 'wallH', 0, walls);
    middle.scale.setTo(1, 1);
    middle.angle += 20;

    walls.setAll('body.immovable', true);
    // var right = game.add.sprite(400, 160, 'wallH', 0, walls);
    // right.scale.setTo(0.7,0.4);


    // var right = game.add.sprite(200, 80, 'wallH', 0, walls);
    // right.scale.setTo(1,1);

    // var left = game.add.sprite(0, 160, 'wallH', 0, walls);
    // left.scale.setTo(0.8,0.4);

    // game.add.sprite(0, 330, 'wallH', 0, walls);

    // walls.setAll('body.immovable', true);
    //circle = new Phaser.Circle(game.world.centerX, game.world.centerY, 300);

}

function create()
{
    // This function is called after the preload function // Here we set up the game, display sprites, etc.
    //this.sprite = game.add.sprite(200, 150, 'logo');
    game.stage.backgroundColor = '#3498db';
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;
    game.physics.startSystem(Phaser.Physics.NINJA);


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
    myName = 'toto';
    myColor = '0xFFFFFF';
    currentPlayer = new Player(0, game, myName, false, false,myColor);
    playersList[0] = currentPlayer;

}

function render()
{};

function update()
{
    //game.debug.geom(circle, '#00ff00', false, 2);

    // This function is called 60 times per second // It contains the game's logic
    currentPlayer.input.left = cursors.left.isDown;
    currentPlayer.input.right = cursors.right.isDown;
    currentPlayer.input.up = cursors.up.isDown;
    currentPlayer.input.down = cursors.down.isDown;
    playersList[0].update();
    for (var i in playersList)
    {
        if (!playersList[i])
        {
            continue;
        };
        game.physics.ninja.collide(playersList[i].hero, walls);
        if (playersList[i].alive)
        {
            playersList[i].update();
        }

    }
    //walls.rotation += 0.001;
}


// We initialising Phaser
game = new Phaser.Game(600, 440, Phaser.AUTO, 'gameDiv',
{
    preload: preload,
    create: create,
    update: update,
    render: render
});
// And finally we tell Phaser to add and start our 'main' state

// game.state.add('main', mainState);
// game.state.start('main');