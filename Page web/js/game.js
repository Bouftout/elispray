var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    backgroundColor: '#9adaea',
    useTicker: true,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

var bullet2;
var speed2;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('bullet', 'assets/bas.png');
    this.load.image('block', 'assets/block.jpg');
}

function create() {


    //   Bullet 2 (600px in 3 seconds)
    bullet2 = this.matter.add.image(64, 291, 'bullet').setOrigin(0);

    speed2 = Phaser.Math.GetSpeed(600, 3);

    var blockB = this.matter.add.image(600, 300, 'block').setStatic(true);

    var bubble1 = this.createSpeechBubble(20, 180, 220, 80, "Touché !");

    let toucheb1 = 0;

    this.matter.world.on('collisionstart', function(event, bodyA, bodyB) {

        

    });


    this.input.keyboard.on('keydown-SPACE', function (event) {

        event.stopPropagation();

        bubble1.setVisible(true);

    });

}

//  The update function is passed 2 values:
//  The current time (in ms)
//  And the delta time, which is derived from the elapsed time since the last frame, with some smoothing and range clamping applied

function update(time, delta) {

    bullet2.x += speed2 * delta;

    if (bullet2.x > 864) {
        bullet2.x = 64;
    }
    console.log(bullet2.x)
}