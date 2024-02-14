import { levelData } from "./main.js";
import { CANVAS, tileSize } from "./defines.js";
import { spriteSheet, SPRITES } from "./level.js";

/* ------------------------ */

const ctx = CANVAS.ctx;

/* ------------ Entities ------------ */

export class Entities {
    constructor() {
        /**
         * Stores all enemies loaded on screen
         * @type {Enemy[]}
         */
        this.onScreenEnemiesArr = []

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
                if (typeof(levelData[col][row]) == "string") {
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
}

/* ------------ Enemy ------------ */

let ENTITIES;
export class Enemy {
    constructor(tileX, tileY, type) {
        this.relativePosition = { x: tileX, y: tileY };
        this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
    
        this.type = type;

        this.SPEED = 0.6;

        this.WALK_ANIM_SPEED = 20;
        this.walkFrameCount = 0;
        /**
         * @alias lastSprite
         */
        this.crntSprite = "goomba_walk1";

        this.dying = false;
        this.DESPAWN_TIMEOUT = 20;
    }
    draw(level) {
        this.walkFrameCount++

        if (this.dying) {
            if (this.walkFrameCount >= this.DESPAWN_TIMEOUT) {
                ENTITIES.onScreenEnemiesArr = [] /** @todo */
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

        if (this.type == "goomba") {
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
    }
    move() {
        if (!this.dying) {
            if (this.type == "goomba") {
                this.absolutePosition.x -= this.SPEED;
                this.relativePosition.x = this.absolutePosition.x / tileSize;
            }
        }
    }
    checkPlayerCollision(player, level, entities) {
        if (this.dying || player.dying) return;

        if (player.relativePosition.x+1 > this.relativePosition.x && player.relativePosition.x < this.relativePosition.x+1) {
            if (Math.ceil(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                this.die(player, entities);
            }
        }
        // to left
        if (player.relativePosition.x - level.scrollOffset <= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x+1 - level.scrollOffset > this.relativePosition.x - level.scrollOffset) {
                    player.dieAnimStart();
                }
            }
        }
        // to right
        else if (player.relativePosition.x - level.scrollOffset >= this.relativePosition.x - level.scrollOffset) {
            if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
                if (player.relativePosition.x - level.scrollOffset < this.relativePosition.x+1 - level.scrollOffset) {
                    player.dieAnimStart();
                }
            }
        }
    }
    die(player, entities) {
        ENTITIES = entities;
        this.dying = true;

        this.walkFrameCount = 0
        player.jumpForce = 15;
        this.crntSprite = "goomba_splat"
    }
}