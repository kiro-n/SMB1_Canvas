import { CANVAS, DEBUG, tileSize } from "./defines.js";
import { changeBlock, FPS } from "./main.js";
import { STATS } from "./player.js";

/* ------------------------ */

const ctx = CANVAS.ctx;
const absWidth = CANVAS.absWidth;
const absHeight = CANVAS.absHeight;

/* ------------ Exports ------------ */

export const spriteSheet = document.querySelector("#sprite_sheet")

/**
 * Enumeration of sprites, each defining the top left corner of sprite in the sprite sheet.
 * 
 * Sprites that are GUI items or entities are @type {string}, while blocks or decor sprites are @type {number}.
 * Sprites that are a @type {number} greater than 100 have collision, while numbers below 100 are ignored by collision.
 * @summary Sprite Access Sheet
 * 
 * @type {{"adress": { x: number, y: number }}}
 * @enum {(string | number)}
 * @readonly
 */
export const SPRITES = {
    "GUI_coin": { x: 462, y: 163},
    "block_shards": { x: 432, y: 47},

    "coin_collect1": { x: 430, y: 145},
    "coin_collect2": { x: 438, y: 145},
    "coin_collect3": { x: 448, y: 145},
    "coin_collect4": { x: 459, y: 145},

    0: { x: 0, y: 0 }, // air

    1: { x: 131, y: 163 }, // mountain center
    2: { x: 131, y: 179 }, // mountain center plain
    3: { x: 115, y: 163 }, // left mountain slope
    4: { x: 147, y: 163 }, // right mountain slope
    5: { x: 64, y: 163 }, // top mountain

    11: { x: 51, y: 253 }, // bush left
    12: { x: 67, y: 253 }, // bush right
    13: { x: 101, y: 253 }, // bush center

    21: { x: 46, y: 195 }, // top left cloud
    22: { x: 62, y: 195 }, // top center cloud
    23: { x: 78, y: 195 }, // top right cloud
    24: { x: 46, y: 211 }, // bottom left cloud
    25: { x: 62, y: 211 }, // bottom center cloud
    26: { x: 78, y: 211 }, // bottom right cloud

    31: { x: 268, y: 166 }, // pole
    32: { x: 268, y: 55 }, // pole flag center
    33: { x: 252, y: 55 }, // pole flag left
    34: { x: 268, y: 39 }, // pole top

    41: { x: 272, y: 250 }, // battlement transparent
    42: { x: 288, y: 250 }, // battlement brick background
    43: { x: 288, y: 234 }, // window right
    44: { x: 320, y: 234 }, // window left
    45: { x: 304, y: 234 }, // brick background
    46: { x: 304, y: 266 }, // top door
    47: { x: 304, y: 282 }, // THE ABYSS


    101: { x: 373, y: 124 }, // ground
    102: { x: 373, y: 142 }, // block
    103: { x: 373, y: 47 }, // brick
    104: { x: 372, y: 160 }, // ?block
    105: { x: 373, y: 65 }, // hit ?block

    150: { x: 614, y: 46 }, // pipe_topLeft
    151: { x: 630, y: 46 }, // pipe_topRight
    152: { x: 614, y: 82 }, // pipe_left
    153: { x: 630, y: 82 }, // pipe_right
    154: { x: 614, y: 62 }, // pipe_bottomLeft
    155: { x: 630, y: 62 }, // pipe_bottomRight

    160: { x: 573, y: 102 }, // left pipe top entrance
    161: { x: 573, y: 118 }, // left pipe bottom entrance
    162: { x: 589, y: 102 }, // sideways pipe top
    163: { x: 589, y: 118 }, // sideways pipe bottom
    164: { x: 614, y: 102 }, // left merging pipe top
    165: { x: 614, y: 118 }, // left merging pipe bottom


    "luigi_stand": { x: 191, y: 463 },
        "luigi_stand_l": { x: 309, y: 423 },

    "luigi_walk1": { x: 252, y: 463 },
        "luigi_walk1_l": { x: 248, y: 423 },
    "luigi_walk2": { x: 268, y: 463 },
        "luigi_walk2_l": { x: 232, y: 423 },
    "luigi_walk3": { x: 286, y: 463 },
        "luigi_walk3_l": { x: 214, y: 423 },

    "luigi_jump": { x: 308, y: 463 },
        "luigi_jump_l": { x: 191, y: 423 },

    "luigi_die": { x: 214, y: 464 },

    "luigi_pole1": { x: 191, y: 483 },
        "luigi_pole1_l": { x: 309, y: 443 },
    "luigi_pole2": { x: 216, y: 483 },
        "luigi_pole2_l": { x: 284, y: 443 },


    "super_luigi_stand_t": { x: 217, y: 544 },
    "super_luigi_stand_b": { x: 217, y: 560 },
        "super_luigi_stand_l_t": { x: 313, y: 507 },
        "super_luigi_stand_l_b": { x: 313, y: 523 },

    "super_luigi_walk1_t": { x: 263, y: 544 },
    "super_luigi_walk1_b": { x: 263, y: 560 },
        "super_luigi_walk1_l_t": { x: 267, y: 507 },
        "super_luigi_walk1_l_b": { x: 267, y: 523 },
    "super_luigi_walk2_t": { x: 284, y: 544 },
    "super_luigi_walk2_b": { x: 284, y: 560 },
        "super_luigi_walk2_l_t": { x: 246, y: 507 },
        "super_luigi_walk2_l_b": { x: 246, y: 523 },
    "super_luigi_walk3_t": { x: 309, y: 544 },
    "super_luigi_walk3_b": { x: 309, y: 560 },
        "super_luigi_walk3_l_t": { x: 221, y: 507 },
        "super_luigi_walk3_l_b": { x: 221, y: 523 },

    "super_luigi_jump_t": { x: 336, y: 542 },
    "super_luigi_jump_b": { x: 336, y: 558 },
        "super_luigi_jump_l_t": { x: 192, y: 505 },
        "super_luigi_jump_l_b": { x: 192, y: 521 },


    "goomba_walk1": { x: 187, y: 894 },
    "goomba_walk2": { x: 208, y: 894 },
    "goomba_splat": { x: 228, y: 894 },


    "mushroom": { x: 71, y: 43 },
}

export class Level {
    /**
     * Contains all (meta) information of the current level, outside of sprite data.
     * @param {number} [time=500] time the level will begin at
     * @param {string} [levelCode="1-1"] needs to be identical to the index provided in levelData.js
     */
    constructor(time=500, levelCode="1-1") {
        this.code = levelCode

        /**
         * Time the level starts at (default 500)
         * @type {number}
         */
        this.MAX_TIME = time;
        /**
         * Changes each second
         * @type {number}
         */
        this.time = time;

        /**
         * Indicates the amount of scrolling the player has done
         * 
         * Often used with player.absolutePosition.x when drawing
         * @type {number}
         */
        this.scrollOffset = 0;

        /**
         * Keeps track of amount of frames since block has been hit
         * @type {number}
         */
        this.blockAnimFrameCount = 0;
        /**
         * Last position of black which has been hit
         * @type {{ x: number, y: number }}
         */
        this.blockBouncePos = { x: 0, y: 0 }
        /**
         * Keeps track of all blocks which have changed state (?blocks) to efficiently reset them when restarting
         * @example 
         * { 15: { 9: { coins: 3 } } }
         * @type {{ tileX: { tileY: { data: number } } }}
         */
        this.blocksHit = {};

        /**
         * All coins collected through blocks which are currently going through the animation
         * 
         * Some non-necessary keys are also present for precalculation to help with animation performance
         * @type {[{ x: number, y: number, posX: number, posY: number, sizeX: number, sizeY: number, prevFrame: number, count: number, ANIM_TIME: number }]}
         */
        this.coinCollectArr = [];
    }
    /**
     * Draw tile outline, player tile position or FPS counter if active from import("defines.js").DEBUG
     * @param {import("player.js").Player} player Player Class defined in ("main.js")
     */
    debugDraw(player) {
        if (DEBUG.showFPS) { // draw FPS counter
            ctx.font = "15px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(`${FPS}fps`, 10, 60);
        }
        if (DEBUG.showSpedometer) {
            let calcSpeed = Math.floor(Math.sqrt(
                ((player.momentumVertical+player.jumpForce)*(player.momentumVertical+player.jumpForce)) + 
                (player.momentumHorizontal*player.momentumHorizontal)
            )*100)/100

            if (calcSpeed > DEBUG.topSpeed) DEBUG.topSpeed = calcSpeed

            ctx.font = "15px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(`${calcSpeed}`, CANVAS.absWidth-60, 60);
            ctx.fillText(`${DEBUG.topSpeed}`, CANVAS.absWidth-60, 80);
        }
    
        if (DEBUG.showTileBorder || DEBUG.showPlayerTilePosition) {
            for (let i=tileSize; i<=absWidth; i+=tileSize) {
                if (DEBUG.showPlayerTilePosition) { // draw player tile position
                    ctx.fillStyle = `rgba(102, 68, 129, 0.1)`;
                    ctx.fillRect(Math.round(player.relativePosition.x)*tileSize-this.scrollOffset, Math.round(player.relativePosition.y)*tileSize, tileSize, tileSize)
                }
        
                if (DEBUG.showTileBorder) { // draw vertical lines
                    ctx.beginPath();
                    ctx.moveTo(i-this.scrollOffset%tileSize, 0);
                    ctx.lineTo(i-this.scrollOffset%tileSize, absHeight);
                    ctx.stroke();
                }
            }
        }
        if (DEBUG.showTileBorder) { // draw hizontal lines
            for (let i=tileSize; i<=absHeight; i+=tileSize) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(absWidth, i);
                ctx.stroke();
            }
        }
    }
    /**
     * Draw sprite depending on provided sprite sheet data from top to bottom. Row to row is done in the requestAnimationFrame(update) loop.
     * @param {number} tileColumn Index position of column in levelData.json
     * @param {(number|string)[]} columnData Array containing tile type tile per tile, top to bottom. Although strings are accepted, they are ignored in this function (see entities.js)
     */
    drawColumn(tileColumn, columnData, level) {
        for (let columnOffset=0; columnOffset<CANVAS.lastRow; columnOffset++) {
            if (typeof(columnData[columnOffset]) != "string") { // string data are entities and ignored here
                let blockPosX = tileColumn*tileSize - this.scrollOffset;
                let blockPosY = columnOffset*tileSize;

                // play block hit animation if present
                if (tileColumn == this.blockBouncePos.x && columnOffset == this.blockBouncePos.y) blockPosY -= this.blockHitAnim();

                // continue coin collect animation if present
                if (this.coinCollectArr.length > 0) this.coinCollectAnim(level);

                if (typeof(columnData[columnOffset]) == "object") { // objects are always ?blocks
                    ctx.drawImage(
                        spriteSheet, 
                        SPRITES[104].x, 
                        SPRITES[104].y, 
                        16, 
                        16, 
                        blockPosX, 
                        blockPosY, 
                        tileSize, 
                        tileSize
                    )
                } else {
                    ctx.drawImage(
                        spriteSheet, 
                        SPRITES[columnData[columnOffset]].x, 
                        SPRITES[columnData[columnOffset]].y, 
                        16, 
                        16, 
                        blockPosX, 
                        blockPosY, 
                        tileSize, 
                        tileSize
                    )
                }
            }
        }
    }
    /**
     * Draw correct sprite of each coin present in coinCollectArr
     * @todo very laggy because its calculated on the spot
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    coinCollectAnim(level) {
        for (let i=0; i<this.coinCollectArr.length; i++) {
            this.coinCollectArr[i].count++
            
            let animOffset = 0;
            // logic for if coing is rising or falling
            if (this.coinCollectArr[i].count < this.coinCollectArr[i].ANIM_TIME/2) animOffset = this.coinCollectArr[i].count/150
            else animOffset = (this.coinCollectArr[i].ANIM_TIME - this.coinCollectArr[i].count)/150

            // time when to change coin sprite
            const roundedFrameCount = Math.ceil(this.coinCollectArr[i].count/1000)

            // only draw if lifetime is not overreached
            if (this.coinCollectArr[i].count < this.coinCollectArr[i].ANIM_TIME) {
                if (this.coinCollectArr[i].prevFrame < roundedFrameCount) {
                    this.coinCollectArr[i].prevFrame = roundedFrameCount%4+1
                }

                ctx.drawImage(
                    spriteSheet, 
                    SPRITES[`coin_collect${this.coinCollectArr[i].prevFrame}`].x,
                    SPRITES[`coin_collect${this.coinCollectArr[i].prevFrame}`].y, 
                    8, 
                    14, 
                    this.coinCollectArr[i].posX - level.scrollOffset, 
                    this.coinCollectArr[i].posY - animOffset, 
                    this.coinCollectArr[i].sizeX, 
                    this.coinCollectArr[i].sizeY, 
                )
            } else {
                this.coinCollectArr.splice(i, 1);
            }
        }
    }
    /**
     * Logic for jumping into a block from the bottom
     * @param {number} tileX "relativePosition.x" of block
     * @param {number} tileY "relativePosition.y" of block
     * @param {(number | string | object)} blockId string is possible but will be ignored
     * @param {import("entities.js").Entities} entities Entities Class defined in ("main.js")
     * @param {import("player.js").Player} player Player Class defined in ("main.js") 
     */
    blockHitLogic(tileX, tileY, blockId, entities, player) {
        // ignore everything but brick and objects (?block)
        if (blockId == 103 || typeof(blockId) == "object") {
            this.blockBouncePos.x = tileX;
            this.blockBouncePos.y = tileY;
            this.blockAnimFrameCount = 0;

            // break block if super and its a brick
            if (blockId == 103 && player.super) {
                if (!this.blocksHit[tileX]) this.blocksHit[tileX] = {}
                if (!this.blocksHit[tileX][tileY]) this.blocksHit[tileX][tileY] = 103;

                player.scoreAnimStart(player, 50);
                changeBlock(tileX, tileY, 0);
            }

            if (typeof(blockId) == "object") {
                // save block data, so resetting logic works fine
                if (!this.blocksHit[tileX]) this.blocksHit[tileX] = {}
                if (!this.blocksHit[tileX][tileY]) {
                    this.blocksHit[tileX][tileY] = {}
                    Object.assign(this.blocksHit[tileX][tileY], blockId)
                }

                if ("coins" in blockId) {
                    blockId.coins--

                    STATS.coins++
                    player.scoreAnimStart(player, 200);

                    this.coinCollectArr.push({ 
                        x: tileX, 
                        y: tileY, 
                        posX: tileX*tileSize + tileSize/4, 
                        posY: (tileY-1)*tileSize, 
                        sizeX: tileSize/2,
                        sizeY: tileSize * 7/8,
                        prevFrame: -1,
                        count: 0,
                        ANIM_TIME: 12000
                    });   

                    if (blockId.coins <= 0) changeBlock(tileX, tileY, 105);
                    else changeBlock(tileX, tileY, blockId);
                } else if ("fireflower" in blockId) {
                    blockId.fireflower--
                    changeBlock(tileX, tileY, 105);

                    entities.spawnNewPowerUp(tileX, tileY, "mushroom")
                }
            }
            
            // if enemy above block, kill it
            for (let i=0; i<entities.onScreenEnemiesArr.length; i++) {
                if (tileY-1 == entities.onScreenEnemiesArr[i].relativePosition.y) {
                    if (Math.floor(entities.onScreenEnemiesArr[i].relativePosition.x) == tileX ||
                        Math.ceil(entities.onScreenEnemiesArr[i].relativePosition.x) == tileX) {
                        
                        player.scoreAnimStart(player, 200);
                        entities.onScreenEnemiesArr[i].die(entities)
                    }
                }
            }
        }
        else return;
    }
    /**
     * Bounce block up and down
     */
    blockHitAnim() {
        this.blockAnimFrameCount++
        if (this.blockAnimFrameCount < 5) {
            return this.blockAnimFrameCount;
        } else if (this.blockAnimFrameCount < 10) {
            return -(this.blockAnimFrameCount-10)
        } else return 0;
    }
}