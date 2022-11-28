var vie = 3;
var time = 0;
var lvl = 1;
var enregistretext = "";
var emitter;


function submit() {
    fetch(`${document.location.origin}/highscore`, {

        method: "POST",

        body: JSON.stringify({
            highscore: (time * lvl),
            qui: "brick"
        }),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })

}


function updatetext(text) {
    time++;
    if (!text || text == "") {

    } else {
        enregistretext = text;

    }
    enregistretext.setText([
        `Vie: ${vie}`,
        `Timer: ${time}`,
        `Level: ${lvl}`
    ]);
}
window.onload = start;
var interval = "";

function start() {
    interval = setInterval(function () { updatetext() }, 1000);
    (document.getElementById("btn")).addEventListener('click', function (e) {
submit()
        /*
        e.preventDefault();
        lvl++;*/
    });
    
}

var tchb = 0;

function part(particles, x, y) {
    emitter = particles.createEmitter({
        speed: 10,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD',
        frequency: 10,
        x: x,
        y: y
    });
}

var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function Breakout() {
            Phaser.Scene.call(this, {
                key: 'breakout'
            });

            this.bricks;
            this.paddle;
            this.ball;
        },

    preload: function () {
        this.load.atlas('red', '/brick/flares.png', '/brick/flares.json');

        var text2 = this.add.text(685, 570, "Klass bryke", { fill: '#ffffff' });
        text2.setShadow(2, 2, 'rgba(0,0,0,0.5)', 0);


        this.load.atlas('assets', '/brick/breakout.png', '/brick/breakout.json');

        var text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
        text.setText('Loading...');

        updatetext(text);



    },

    create: function () {

        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets',
            frame: ['blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1'],
            frameQuantity: 10,
            gridAlign: {
                width: 10,
                height: 6,
                cellWidth: 64,
                cellHeight: 32,
                x: 112,
                y: 100
            }
        });

        this.ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle')) {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            if (this.ball.getData('onPaddle')) {
                this.ball.setVelocity(-75, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);

    },

    hitBrick: function (ball, brick) {
        var particles = this.add.particles('red'); //particule

        part(particles, brick.x, brick.y);
        emitter.explode(10);

        brick.setDataEnabled(); //activer les données dans les bricks

        if (brick.data.get('tchbr') == undefined) {
            brick.data.set('tchbr', 1);
        } else {
            brick.data.set('tchbr', (brick.data.get('tchbr') + 1));
        }
        console.log(brick.data.get('tchbr'))

        if (brick.data.get('tchbr') === (lvl + 1)) {
            //disable la brick
            brick.disableBody(true, true);
        }

        if (this.bricks.countActive() === 0) {
            this.resetLevel();
            tchb = 0;
        }

    },

    resetBall: function () {
        vie--;
        updatetext()
        if (vie == 0) {
            clearInterval(interval);

            this.registry.destroy(); // destroy registry
            this.events.off(); // disable all active events
            this.scene.restart(); // restart current scene

            submit();

            vie = 3;
            time = 0;
            alert("Game Over");

            start(); // restart game
        } else {
            this.ball.setVelocity(0);
            this.ball.setPosition(this.paddle.x, 500);
            this.ball.setData('onPaddle', true);
        }

    },

    resetLevel: function () {
        this.resetBall();

        this.bricks.children.each(function (brick) {

            brick.enableBody(false, 0, 0, true, true);

        });
    },

    hitPaddle: function (ball, paddle) {
        var diff = 0;

        if (ball.x < paddle.x) {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    },

    update: function () {

        if (this.ball.y > 600) {
            this.resetBall();
        }
    }

});

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [Breakout],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);