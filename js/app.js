// Constants
const configuration = {
    enemy: {
        START: -100,
        END: 520,
        WIDTH: 80,
        HEIGHT: 60,
        ROW_LOCATIONS: [60, 145, 230],
    },
    player: {
        START_ROW: 400,
        START_COL: 200,
        FINISH_ROW: -25,
        STEP_X: 100,
        STEP_Y: 85,
        WIDTH: 60,
        HEIGHT: 80,
    },
    field: {
        LEFT_BORDER: 0,
        RIGHT_BORDER: 400,
        UP_BORDER: -25,
        BOTTOM_BORDER: 400,
        BASE_MIN_SPEED: 100,
        BASE_MAX_SPEED: 250,
        SPEED_INCREMENTER: 25,
    },
};
const popUp = document.querySelector('.pop_up');
const scoreContainer = document.querySelector('.score');
let level = 0;
let maxLevel = 0;

// Enemies our player must avoid
const Enemy = function (x, y) {
    // Variables for starter position/speed
    this.x = x;
    this.y = y;
    (this.speed = this.getSpeed(
        configuration.field.BASE_MIN_SPEED,
        configuration.field.BASE_MAX_SPEED,
        level
    )),
        (this.sprite = 'images/enemy-bug.png');
};

// Get random speed
Enemy.prototype.getSpeed = function (min, max, playerLevel) {
    const minByLevel =
        min + playerLevel * configuration.field.SPEED_INCREMENTER;
    const maxByLevel =
        max + playerLevel * configuration.field.SPEED_INCREMENTER;
    return Math.floor(Math.random() * (maxByLevel - minByLevel)) + minByLevel;
};

// Update the enemy's position, loop enemy to the initial position when
// they are out of bounds, also updates and collision checks are made
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    this.x += this.speed * dt;
    if (this.x > configuration.enemy.END) {
        this.x = configuration.enemy.START;
        this.speed = this.getSpeed(
            configuration.field.BASE_MIN_SPEED,
            configuration.field.BASE_MAX_SPEED,
            level
        );
    }
    this.checkCollisions();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Check for collision, adding width and height to the player and enemies and
// cheking for the intersection between them, show the 'lose' message
Enemy.prototype.checkCollisions = function () {
    if (
        player.y < this.y + configuration.enemy.HEIGHT &&
        player.y + configuration.player.HEIGHT > this.y &&
        player.x < this.x + configuration.enemy.WIDTH &&
        player.x + configuration.player.WIDTH > this.x
    ) {
        if (level > maxLevel) {
            maxLevel = level;
        }
        scoreContainer.innerText = `Current level:0  Max level:${maxLevel}`;
        level = 0;
        popUp.innerText = `You lose`;
        popUp.classList.add('lose');
        player.x = configuration.player.START_COL;
        player.y = configuration.player.START_ROW;
        setTimeout(() => {
            popUp.classList.remove('lose');
        }, 1500);
    }
};

// Setting initial position of a player
function Player(x, y) {
    (this.x = x), (this.y = y), (this.sprite = 'images/char-boy.png');
}

Player.prototype.update = function () {};

// Updating the player position based on a key event
Player.prototype.handleInput = function (key) {
    if (key === 'left' && this.x > configuration.field.LEFT_BORDER) {
        this.x -= configuration.player.STEP_X;
    } else if (key === 'right' && this.x < configuration.field.RIGHT_BORDER) {
        this.x += configuration.player.STEP_X;
    } else if (key === 'up' && this.y > configuration.field.UP_BORDER) {
        this.y -= configuration.player.STEP_Y;

        // if, after going up and updating y-position accordingly
        // the y-position is a position of a last tile, ending the game
        // by displaying the 'win' message, and, after 1500ms reseting players's position
        // and removing the message
        if (this.y === configuration.player.FINISH_ROW) {
            level++;
            scoreContainer.innerText = `Current level:${level}  Max level:${maxLevel}`;
            popUp.innerText = `Level #${level}`;
            popUp.classList.add('win');
            setTimeout(() => {
                this.x = configuration.player.START_COL;
                this.y = configuration.player.START_ROW;
                popUp.classList.remove('win');
            }, 1500);
        }
    } else if (
        key === 'down' &&
        this.y < configuration.field.BOTTOM_BORDER &&
        this.y !== configuration.player.FINISH_ROW
    ) {
        this.y += configuration.player.STEP_Y;
    }
};

// function that measures swipes direction and sends appropriate command
// to .handleInput() function
Player.prototype.handleSwipeInput = function () {
    let startX, startY, moveX, moveY;
    document.addEventListener('touchstart', function (event) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        moveX = 0;
        moveY = 0;
        console.log(`startX: ${startX}\nstartY: ${startY}}`);
    });

    document.addEventListener(
        'touchmove',
        function (event) {
            event.preventDefault();
            moveX = event.touches[0].clientX - startX;
            moveY = event.touches[0].clientY - startY;
        },
        { passive: false }
    );

    document.addEventListener('touchend', function () {
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 100) {
                player.handleInput('right');
            } else if (moveX < -100) {
                player.handleInput('left');
            }
        } else {
            if (moveY > 100) {
                player.handleInput('down');
            } else if (moveY < -100) {
                player.handleInput('up');
            }
        }
    });
};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Creating enemy and player entities, setting their
// initial positions
var allEnemies = [];
configuration.enemy.ROW_LOCATIONS.forEach((location) => {
    allEnemies.push(new Enemy(configuration.enemy.START, location));
});
const player = new Player(
    configuration.player.START_COL,
    configuration.player.START_ROW
);

// This listens for key presses, sends the keys to
// Player.handleInput() method and listens to swipes
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
player.handleSwipeInput();
