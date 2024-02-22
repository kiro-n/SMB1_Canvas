import { levelData } from "./main.js";
import { CANVAS, tileSize } from "./defines.js";
import { spriteSheet, SPRITES } from "./level.js";

/* ------------------------ */

const ctx = CANVAS.ctx;

/**
 * Returns true if given blockId is solid (either number >0 or object)
 * @param {(number | string | object)} blockId 
 * @returns {boolean}
 */
function isSolid(blockId) {
    if (typeof(blockId) == "number") {
        if (blockId >= 100) return true;
        else return false;
    } 
    else if (typeof(blockId) == "object") return true;
    else return false;
}

/* ------------ Entities ------------ */

export class Entities {
    constructor() {
        /**
         * Stores all enemies loaded on screen
         * @type {Enemy[]}
         */
        this.onScreenEnemiesArr = []
        /**
         * Stores all powerUps loaded on screen
         * @type {PowerUp[]}
         */
        this.onScreenPowerUpArr = []

        /**
         * Wether or not it checked for Enemies in the beginning, before scrolling.
         * 
         * This typically is turned to true after the first frame when loading into a level.
         * @type {boolean}
         */
        this.checkedForEntitiesPreScroll = false
    }
    /**
     * Checks each loaded tile for enemies in the levelData.json
     */
    checkForMobsPreScroll() {
        for (let col=0; col<CANVAS.lastColumn; col++) {
            for (let row=0; row<CANVAS.lastRow; row++) {
                if (typeof(levelData[col][row]) == "string" && isNaN(levelData[col][row])) {
                    this.spawnMob(col, row, "goomba")
                }
            }
        }
        this.checkedForEntitiesPreScroll = true
    }
    /**
     * Pushes new enemy to this.onScreenEnemiesArr
     * @param {number} x Whole number; X position of tile coordinate
     * @param {number} y Whole number; Y position of tile coordinate
     * @param {string} type String indicating which enemy to spawn
     * @example
     * this.spawnMob(12, 11, "goomba");
     */
    spawnMob(x, y, type) {
        this.onScreenEnemiesArr.push(new Enemy(x, y, type))
    }
    /**
     * Checks each tile in given column for new mobs
     * @param {number} column Index of levelData.json in which to check for enemies
     */
    spawnMobsInColumn(column) {
        for (let i=0; i<CANVAS.lastRow; i++) {
            if (typeof(levelData[column][i]) == "string") { // its an enemy if string
                this.spawnMob(column, i, "goomba")
            }
        }
    }
    spawnNewPowerUp(tileX, tileY, type) {
        const newPowerUp = new PowerUp(tileX, tileY, type)

        this.onScreenPowerUpArr.push(newPowerUp);
    }
}

/* ------------ Enemy ------------ */

/**
 * An import from "main.js," used to store Enemies, etc.
 */
let ENTITIES;
export class Enemy {
    /**
     * Logic and storage of Enemies (i.e. Goomba)
     * @param {number} tileX Whole number; X position tile where enemy spawns
     * @param {number} tileY Whole number; Y position tile where enemy spawns
     * @param {string} type String indicating which enemy to spawn and which logic to use ("goomba")
     */
    constructor(tileX, tileY, type) {
        /**
         * Enemy positioning based on tiling.
         * Proportional to this.absolutePosition by quotient tileSize
         * @alias tilePosition
         * @example
         * // Enemy position in second row, third column
         * this.relativePosition = { x: 1, y: 2 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of enemy based on tiling
         * @property {number} y Y coordinate of enemy based on tiling
         */
        this.relativePosition = { x: tileX, y: tileY };
        /**
         * Enemy positioning (top left corner of sprite) based on canvas pixel.
         * Proportional to this.relative by factor tileSize
         * @alias pixelPosition
         * @example
         * // enemy position in the top left of the canvas with 10px padding
         * this.absolutePosition = { x: 10, y: 10 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of enemy pixel position
         * @property {number} y Y coordinate of enemy pixel position
         */
        this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
    
        /**
         * Indicates which enemy to spawn and what logic to use (usused)
         * @type {string}
         */
        this.type = type;

        /**
         * Speed at which the enemy moves at
         * @type {number}
         * @readonly
         */
        this.SPEED = 0.6;
        /**
         * Wether or not the enemy is actually moving to the right
         * @type {boolean}
         */
        this.directionRight = false;


        /**
         * Momentum/Speed cap in gravity()
         * 
         * (Equivalent to vertical MAX_SPEED)
         * @type {number}
         * @alias GRAVITY_MOMENTUM_CAP
         * @readonly
         */
        this.TERMINAL_VELOCITY = 6;
        /**
         * Acceleration in gravity()
         * @type {number}
         * @alias VERTICAL_ACCELERATION
         * @readonly
         */
        this.GRAVITY = 0.5;
        /**
         * Speed to the bottom to be added in either accelerate() or decelerate()
         * 
         * Notice that its value can only be positive as gravity only works in one direction
         * @type {number}
         */
        this.momentumVertical = 0;



        /**
         * Maximum time to wait until changing the walk sprite of enemy
         * @type {number}
         * @alias SPRITE_CHANGE_TIMEOUT
         * @readonly
         */
        this.WALK_ANIM_SPEED = 20;
        /**
         * Frame count since last walk sprite change
         * @type {number}
         * @alias timeSinceLastSpriteChange
         */
        this.walkFrameCount = 0;
        /**
         * Last sprite drawn on screen to determine next animation sprite order
         * @type {string}
         * @alias lastSprite
         */
        this.crntSprite = "goomba_walk1";

        /**
         * Changes animation and logic to death animation
         * @type {bool}
         */
        this.dying = false;
        /**
         * Frame count after which the the enemy despawns and vanishes from the screen
         * @type {number}
         * @readonly
         */
        this.DESPAWN_TIMEOUT = 20;
    }
    /**
     * Compute next sprite and draw it
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     * @param {number} enemyIndex When dying, index indicating what index to delete in onScreenEnemiesArr
     */
    draw(level, enemyIndex) {
        this.walkFrameCount++

        // draw flat and despawn after timeout is reached
        if (this.dying) {
            if (this.walkFrameCount >= this.DESPAWN_TIMEOUT) {
                ENTITIES.onScreenEnemiesArr.splice(enemyIndex, 1);
                return;
            } else {
                ctx.drawImage(
                    spriteSheet, 
                    SPRITES[this.crntSprite].x, 
                    SPRITES[this.crntSprite].y, 
                    16, 
                    16, 
                    this.absolutePosition.x - level.scrollOffset, 
                    this.absolutePosition.y, 
                    tileSize, 
                    tileSize
                )
            }
            return;
        }

        if (this.walkFrameCount >= this.WALK_ANIM_SPEED) {
            switch (this.crntSprite) {
                case "goomba_walk1":
                    this.crntSprite = "goomba_walk2";
                    break;
                case "goomba_walk2":
                    this.crntSprite = "goomba_walk1";
                    break;
            }
            this.walkFrameCount = 0
        }

        ctx.drawImage(
            spriteSheet, 
            SPRITES[this.crntSprite].x, 
            SPRITES[this.crntSprite].y, 
            16, 
            16, 
            this.absolutePosition.x - level.scrollOffset, 
            this.absolutePosition.y, 
            tileSize, 
            tileSize
        )
    }
    move() {
        if (this.directionRight) this.absolutePosition.x += this.SPEED;
        else this.absolutePosition.x -= this.SPEED;
        this.equalRel2Abs(true, false);
    }
    /**
     * Increases enemy Y position if (because of checkBlockCollision()) no block is in the way
     * @summary Makes the enemy drop and increases momentum to TERMINAL_VELOCITY
     */
    gravity() {
        // add momentum if TERMINAL_VELOCITY is not reached
        if (this.momentumVertical >= this.TERMINAL_VELOCITY) this.momentumVertical = this.TERMINAL_VELOCITY;
        else this.momentumVertical += this.GRAVITY;

        // update position
        this.absolutePosition.y += this.momentumVertical;
        this.equalRel2Abs(false, true);
    }
    /**
     * Checks if enemy gets stomped or damaged player
     * @param {import("player.js").Player} player Player Class defined in ("main.js") 
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     */
    checkPlayerCollision(player, level, entities) {
        if (player.dying) return;

        if (player.relativePosition.x+1 > this.relativePosition.x && player.relativePosition.x < this.relativePosition.x+1) {
            if (Math.ceil(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                this.die(entities, player);
            }
        }

        if (player.isInvincible) return;

        // to left
        if (player.relativePosition.x - level.scrollOffset <= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x+1 - level.scrollOffset > this.relativePosition.x - level.scrollOffset) {
                    if (player.super) player.isChangingFormTimeout = true;
                    else player.dieAnimStart();
                }
            }
        }
        // to right
        else if (player.relativePosition.x - level.scrollOffset >= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x - level.scrollOffset < this.relativePosition.x+1 - level.scrollOffset) {
                    if (player.super) player.isChangingFormTimeout = true;
                    else player.dieAnimStart();
                }
            }
        }
    }
    /**
     * Adds collision logic to walls and ground and kills enemy if out of bounds
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     */
    checkBlockCollision(level, entities) {
        // if out of bounds, die
        if (Math.floor(this.relativePosition.x - level.scrollOffset/tileSize)+1 < 0) { this.die(entities); return; }
        if (Math.floor(this.relativePosition.x) < 0) { this.die(entities); return; }

        // to left
        if (isSolid(levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)])) {
            this.directionRight = true;
        }
        // to right
        if (isSolid(levelData[Math.floor(this.relativePosition.x)+1][Math.floor(this.relativePosition.y)])) {
            this.directionRight = false;
        }
        // below
        if (isSolid(levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1])) {
            this.momentumVertical = 0;
            this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;

            this.equalRel2Abs(false, true);
        }
    }
    /**
     * Starts dying animation 
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     * @param {import("player.js").Player} player Player Class defined in ("main.js") 
     */
    die(entities, player=null) {
        ENTITIES = entities;
        this.dying = true;

        this.walkFrameCount = 0
        this.crntSprite = "goomba_splat"

        if (player != null) {
            player.successiveKills++
            if (player.successiveKills > player.SUCCESSIVE_SCORES.length) player.successiveKills = player.SUCCESSIVE_SCORES.length-1;
            player.scoreAnimStart(player, player.SUCCESSIVE_SCORES[player.successiveKills]);

            if (player.keysHeld.space) player.jumpForce = player.JUMP_POWER * 1.5;
            else player.jumpForce = player.JUMP_POWER;
        }
    }
    /**
     * Update @type {{ x: number, y: number }} this.relativePosition to equal @type {{ x: number, y: number }} this.absolutePosition
     * 
     * This is needed because arithmatic is usually only performed on this.absolutePosition
     * @summary Equal Relative Position to Absolute Position
     * @param {boolean} [x=true] Wether to change x property of this.relativePosition  
     * @param {boolean} [y=true] Wether to change y property of this.relativePosition
     */
    equalRel2Abs(x=true, y=true) {
        if (x) this.relativePosition.x = this.absolutePosition.x / tileSize;
        if (y) this.relativePosition.y = this.absolutePosition.y / tileSize;
    }
}

/* ------------ Power Up ------------ */

export class PowerUp {
    /**
     * Logic and storage of PowerUps (i.e. Mushrooms)
     * @param {number} tileX Whole number; X position tile where power up spawns
     * @param {number} tileY Whole number; Y position tile where power up spawns
     * @param {string} type String indicating which power up to spawn and which logic to use ("goomba")
     */
    constructor(tileX, tileY, type) {
        /**
         * power up positioning based on tiling.
         * Proportional to this.absolutePosition by quotient tileSize
         * @alias tilePosition
         * @example
         * // power up position in second row, third column
         * this.relativePosition = { x: 1, y: 2 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of power up based on tiling
         * @property {number} y Y coordinate of power up based on tiling
         */
        this.relativePosition = { x: tileX, y: tileY };
        /**
         * power up positioning (top left corner of sprite) based on canvas pixel.
         * Proportional to this.relative by factor tileSize
         * @alias pixelPosition
         * @example
         * // power up position in the top left of the canvas with 10px padding
         * this.absolutePosition = { x: 10, y: 10 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of power up pixel position
         * @property {number} y Y coordinate of power up pixel position
         */
        this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
    
        /**
         * Indicates which power up to spawn and what logic to use
         * @type {string}
         */
        this.type = type;

        /**
         * Speed at which the power up moves at (if at all)
         * @type {number}
         * @readonly
         */
        this.SPEED = 1;
        /**
         * Wether or not the power up is actually moving to the right
         * @type {boolean}
         */
        this.directionRight = true;


        /**
         * Momentum/Speed cap in gravity()
         * 
         * (Equivalent to vertical MAX_SPEED)
         * @type {number}
         * @alias GRAVITY_MOMENTUM_CAP
         * @readonly
         */
        this.TERMINAL_VELOCITY = 6;
        /**
         * Acceleration in gravity()
         * @type {number}
         * @alias VERTICAL_ACCELERATION
         * @readonly
         */
        this.GRAVITY = 0.5;
        /**
         * Speed to the bottom to be added in either accelerate() or decelerate()
         * 
         * Notice that its value can only be positive as gravity only works in one direction
         * @type {number}
         */
        this.momentumVertical = 0;

        this.isSpawning = true;
        this.spawnCount = 0;
    }
    /**
     * Draw sprite
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    draw(level) {
        ctx.drawImage(
            spriteSheet, 
            SPRITES["mushroom"].x, 
            SPRITES["mushroom"].y, 
            16, 
            16, 
            this.absolutePosition.x - level.scrollOffset, 
            this.absolutePosition.y, 
            tileSize, 
            tileSize
        )
    }
    move() {
        if (this.type == "mushroom") {
            if (this.directionRight) this.absolutePosition.x += this.SPEED;
            else this.absolutePosition.x -= this.SPEED;
            this.equalRel2Abs(true, false);
        }
    }
    gravity() {
        // add momentum if TERMINAL_VELOCITY is not reached
        if (this.momentumVertical >= this.TERMINAL_VELOCITY) this.momentumVertical = this.TERMINAL_VELOCITY;
        else this.momentumVertical += this.GRAVITY;

        // update position
        this.absolutePosition.y += this.momentumVertical;
        this.equalRel2Abs(false, true);
    }
    /**
     * Logic and despawn() on collect
     * @param {import("player.js").Player} player Player Class defined in ("main.js") 
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     */
    checkPlayerCollision(player, level, entities) {
        if (player.dying || player.isChangingFormTimeout) return;

        // to left
        if (player.relativePosition.x - level.scrollOffset <= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x+1 - level.scrollOffset > this.relativePosition.x - level.scrollOffset) {
                    player.scoreAnimStart(player, 1000);

                    if (!player.super) player.isChangingFormTimeout = true;

                    this.despawn(entities);
                    return;
                }
            }
        }
        // to right
        else if (player.relativePosition.x - level.scrollOffset >= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x - level.scrollOffset < this.relativePosition.x+1 - level.scrollOffset) {
                    player.scoreAnimStart(player, 1000);

                    if (!player.super) player.isChangingFormTimeout = true;
                    
                    this.despawn(entities);
                    return;
                }
            }
        }
    }
    /**
     * Adds collision logic to walls and ground and kills enemy if out of bounds
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     */
    checkBlockCollision(level, entities) {
        // if out of bounds, die
        if (this.relativePosition.y > CANVAS.lastRow) { this.despawn(entities); return; }
        if (Math.floor(this.relativePosition.x - level.scrollOffset/tileSize)+1 < 0) { this.despawn(entities); return; }
        if (Math.floor(this.relativePosition.x) < 0) { this.despawn(entities); return; }

        // to left
        if (isSolid(levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)])) {
            this.directionRight = true;
        }
        // to right
        if (isSolid(levelData[Math.floor(this.relativePosition.x)+1][Math.floor(this.relativePosition.y)])) {
            this.directionRight = false;
        }
        // below
        if (isSolid(levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1])) {
            this.momentumVertical = 0;
            this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;
            this.equalRel2Abs(false, true);
        }
    }
    /**
     * Raise item out od block
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    spawnAnim(level) {
        this.spawnCount++

        // stop animation if raised by one block
        if (this.spawnCount >= tileSize) {
            this.isSpawning = false;
            this.absolutePosition.y -= tileSize;
            this.equalRel2Abs(false, true);

            return;
        }

        ctx.drawImage(
            spriteSheet, 
            SPRITES["mushroom"].x, 
            SPRITES["mushroom"].y, 
            16, 
            16, 
            this.absolutePosition.x - level.scrollOffset, 
            this.absolutePosition.y - this.spawnCount, 
            tileSize, 
            tileSize
        )
    }
    /**
     * Remove this power up from onScreenPowerUpArr
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     */
    despawn(entities) {
        for (let i=0; i<entities.onScreenPowerUpArr.length; i++) {
            if (entities.onScreenPowerUpArr[i] == this) {
                entities.onScreenPowerUpArr.splice(i, 1);
            }
        }
    }
    /**
     * Update @type {{ x: number, y: number }} this.relativePosition to equal @type {{ x: number, y: number }} this.absolutePosition
     * 
     * This is needed because arithmatic is usually only performed on this.absolutePosition
     * @summary Equal Relative Position to Absolute Position
     * @param {boolean} [x=true] Wether to change x property of this.relativePosition  
     * @param {boolean} [y=true] Wether to change y property of this.relativePosition
     */
    equalRel2Abs(x=true, y=true) {
        if (x) this.relativePosition.x = this.absolutePosition.x / tileSize;
        if (y) this.relativePosition.y = this.absolutePosition.y / tileSize;
    }
}