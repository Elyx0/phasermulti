var Player = function (index, game, name,x,y,color)
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
    this.hero.body.bounce.y = 0.2;
    this.hero.body.gravity.y = 500;
    this.hero.id = index;
    this.name = name;
    this.plateName = game.add.text(x, y-20, name, { font: '12px Arial', fill: '#ffffff' });
    this.plateName.anchor.setTo(0.5,0.5);
    this.id = index;
    this.alive = true;
};

Player.prototype.update = function ()
{
    // for (var i in this.input) this.cursor[i] = this.input[i];

    var inputChanged = (
            this.cursor.left != this.input.left ||
            this.cursor.right != this.input.right ||
            this.cursor.up != this.input.up ||
            this.cursor.down != this.input.down
        );

    if (inputChanged)
        {
            //Handle input change here
            //send new values to the server
            if (this.hero.id == myId)
            {
                // send latest valid state to the server
                this.input.x = this.hero.x;
                this.input.y = this.hero.y;
                // this.input.angle = this.tank.angle;
                // this.input.rot = this.turret.rotation;
                eurecaServer.handleKeys(this.input,this.hero.body.velocity);


            }
        }

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

module.exports = Player;