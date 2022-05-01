window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
    highscorestart()
});

function highscorestart() {
    if (!localStorage.jsSnakeHighScore) {
        localStorage.setItem("jsSnakeHighScore", 0);
    }

    document.querySelector(".best").textContent = "Highscore : " + localStorage.jsSnakeHighScore

}

function submit() {
    console.log(`${document.location.origin}/highscore`)
    fetch(`${document.location.origin}/highscore`, {

        method: "POST",

        body: JSON.stringify({
            highscore: (localStorage.jsSnakeHighScore),
            qui: "snake"
        }),

        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })

    document.querySelector(".info").textContent = "Submit data BDD"
    setTimeout(() => {
        document.querySelector(".info").textContent = "."
    }, 3000);
}




var config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: "#bfcc00",
    parent: "snake",
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

var snake;
var food;
var cursors;

//  Direction consts
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

var game = new Phaser.Game(config);

function preload() {
    this.load.image("food", "assets/games/snake/food.png");
    this.load.image("body", "assets/games/snake/body.png");
}

var retientgrow = [];

function create() {
    this.data.set('lives', 3);
    this.data.set('level', 5);
    this.data.set('score', 2000);

    var text = this.add.text(100, 100, '', { font: '64px Courier', fill: '#00ff00' });

    text.setText([
        'Level: ' + this.data.get('level'),
        'Lives: ' + this.data.get('lives'),
        'Score: ' + this.data.get('score')
    ]);

    var Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,

        initialize: function Food(scene, x, y) {
            Phaser.GameObjects.Image.call(this, scene);

            this.setTexture("food");
            this.setPosition(x * 16, y * 16);
            this.setOrigin(0);

            this.total = 0;

            scene.children.add(this);
        },

        eat: function() {
            this.total++;
        },
    });

    var Snake = new Phaser.Class({
        initialize: function Snake(scene, x, y) {
            this.headPosition = new Phaser.Geom.Point(x, y);

            this.body = scene.add.group();

            this.head = this.body.create(x * 16, y * 16, "body");
            this.head.setOrigin(0);

            this.alive = true;

            this.speed = 100;

            this.moveTime = 0;

            this.tail = new Phaser.Geom.Point(x, y);

            this.heading = RIGHT;
            this.direction = RIGHT;
        },

        update: function(time) {
            if (time >= this.moveTime) {
                return this.move(time);
            }
        },

        faceLeft: function() {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = LEFT;
            }
        },

        faceRight: function() {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = RIGHT;
            }
        },

        faceUp: function() {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = UP;
            }
        },

        faceDown: function() {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = DOWN;
            }
        },
        reset: function() {
            this.heading = "RESET";
            food.total = 0;
            this.speed = 100;
        },

        move: function(time) {
            switch (this.heading) {
                case LEFT:
                    if (
                        (this.headPosition.x = Phaser.Math.Wrap(
                            this.headPosition.x,
                            0,
                            40
                        )) == 0
                    ) {
                        dead();
                    } else {
                        this.headPosition.x = Phaser.Math.Wrap(
                            this.headPosition.x - 1,
                            0,
                            40
                        );
                    }
                    break;

                case RIGHT:
                    if (
                        (this.headPosition.x = Phaser.Math.Wrap(
                            this.headPosition.x,
                            0,
                            40
                        )) == 39
                    ) {
                        dead();
                    } else {
                        this.headPosition.x = Phaser.Math.Wrap(
                            this.headPosition.x + 1,
                            0,
                            40
                        );
                    }

                    break;

                case UP:
                    if ((this.headPosition.y = Phaser.Math.Wrap(
                            this.headPosition.y,
                            0,
                            30
                        )) == 0) {
                        dead()
                    } else {
                        this.headPosition.y = Phaser.Math.Wrap(
                            this.headPosition.y - 1,
                            0,
                            30
                        );
                    }
                    break;

                case DOWN:
                    if ((this.headPosition.y = Phaser.Math.Wrap(
                            this.headPosition.y,
                            0,
                            30
                        )) == 29) {
                        dead()
                    } else {
                        this.headPosition.y = Phaser.Math.Wrap(
                            this.headPosition.y + 1,
                            0,
                            30
                        );
                    }
                    break;
                case "RESET":
                    this.headPosition.y = Phaser.Math.Wrap(
                        16,
                        0,
                        30
                    );
                    this.headPosition.x = Phaser.Math.Wrap(
                        16,
                        0,
                        40
                    )
                    this.heading = RIGHT;
                    if (retientgrow) {
                        for (var i = 0; i < retientgrow.length; i++) {
                            (retientgrow[i]).destroy()
                        }
                    }

                    onedead = false;
                    break;
            }

            this.direction = this.heading;

            Phaser.Actions.ShiftPosition(
                this.body.getChildren(),
                this.headPosition.x * 16,
                this.headPosition.y * 16,
                1,
                this.tail
            );
            var hitBody = Phaser.Actions.GetFirst(
                this.body.getChildren(), { x: this.head.x, y: this.head.y },
                1
            );

            if (hitBody) {
                dead();
            } else {
                this.moveTime = time + this.speed;

                return true;
            }
        },

        grow: function() {
            var newPart = this.body.create(this.tail.x, this.tail.y, "body");
            retientgrow.push(newPart);
            newPart.setOrigin(0);
        },

        collideWithFood: function(food) {
            if (this.head.x === food.x && this.head.y === food.y) {
                this.grow();

                food.eat();

                //Highscore
                document.querySelector(".high").textContent = "Score : " + food.total;
                if (localStorage.jsSnakeHighScore < food.total) {
                    localStorage.setItem("jsSnakeHighScore", food.total);
                    document.querySelector(".best").textContent = "Highscore : " + localStorage.jsSnakeHighScore;
                    submit();
                }
                if (this.speed > 15 && food.total % 5 === 0) {
                    this.speed -= 1;
                }

                return true;
            } else {
                return false;
            }
        },

        updateGrid: function(grid) {
            this.body.children.each(function(segment) {
                var bx = segment.x / 16;
                var by = segment.y / 16;

                grid[by][bx] = false;
            });

            return grid;
        },
    });

    food = new Food(this, 3, 4);

    snake = new Snake(this, 8, 8);

    cursors = this.input.keyboard.createCursorKeys();
}


function update(time, delta) {
    if (!snake.alive) {
        return;
    }
    if (cursors.left.isDown) {
        snake.faceLeft();
    } else if (cursors.right.isDown) {
        snake.faceRight();
    } else if (cursors.up.isDown) {
        snake.faceUp();
    } else if (cursors.down.isDown) {
        snake.faceDown();
    }




    if (snake.update(time)) {
        if (snake.collideWithFood(food)) {
            repositionFood();
        }
    }
}

/**
 * @method repositionFood
 * @return {boolean} true if the food was placed, otherwise false
 */
function repositionFood() {

    var testGrid = [];

    for (var y = 0; y < 30; y++) {
        testGrid[y] = [];

        for (var x = 0; x < 40; x++) {
            testGrid[y][x] = true;
        }
    }

    snake.updateGrid(testGrid);

    var validLocations = [];

    for (var y = 0; y < 30; y++) {
        for (var x = 0; x < 40; x++) {
            if (testGrid[y][x] === true) {
                validLocations.push({ x: x, y: y });
            }
        }
    }

    if (validLocations.length > 0) {
        var pos = Phaser.Math.RND.pick(validLocations);

        food.setPosition(pos.x * 16, pos.y * 16);

        return true;
    } else {
        return false;
    }
}

var mort = 0;

var onedead = false;

function dead() {

    if (onedead == false) {
        onedead = true;
        mort++
        document.querySelector(".high").textContent = "Score : 0"
        document.querySelector(".nbmort").textContent = "Mort : " + mort;
        repositionFood()
        snake.reset();

        document.querySelector(".info").textContent = "Vous êtes mort !"
        setTimeout(() => {
            document.querySelector(".info").textContent = "."
        }, 500);
    }

}