import { CANVAS, DEBUG, tileSize } from "./defines.js";
import { changeBlock, FPS } from "./main.js";

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


    "luigi_stand": { x: 191, y: 503 },
        "luigi_stand_l": { x: 309, y: 463 },

    "luigi_walk1": { x: 252, y: 503 },
        "luigi_walk1_l": { x: 248, y: 463 },
    "luigi_walk2": { x: 268, y: 503 },
        "luigi_walk2_l": { x: 232, y: 463 },
    "luigi_walk3": { x: 286, y: 503 },
        "luigi_walk3_l": { x: 214, y: 463 },

    "luigi_jump": { x: 308, y: 503 },
        "luigi_jump_l": { x: 191, y: 463 },

    "luigi_die": { x: 214, y: 504 },


    "goomba_walk1": { x: 187, y: 894 },
    "goomba_walk2": { x: 208, y: 894 },
    "goomba_splat": { x: 228, y: 894 },
}

export class Level {
    /**
     * Contains all (meta) information of the current level, outside of sprite data.
     * @param {string} [levelCode="1-1"] needs to be identical to the index provided in levelData.js
     * @param {number} [time=500] time the level will begin at
     */
    constructor(levelCode="1-1", time=500) {
        this.code = levelCode

        this.MAX_TIME = time;
        this.time = time;

        this.scrollOffset = 0;

        this.blockAnimFrameCount = 0;
        this.blockBouncePos = { x: 0, y: 0 }
        this.hitBlocksPre = {};

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
     * @param {(number|string)[]} columnData Array containing tile type tile per tile, top to bottom. Although strings are accepted, they are ignored in this function (see enemy.js)
     */
    drawColumn(tileColumn, columnData, level) {
        for (let columnOffset=0; columnOffset<CANVAS.lastRow; columnOffset++) {
            if (typeof(columnData[columnOffset]) != "string") { // string data are entities and ignored here
                let blockPosX = tileColumn*tileSize - this.scrollOffset;
                let blockPosY = columnOffset*tileSize;

                if (tileColumn == this.blockBouncePos.x && columnOffset == this.blockBouncePos.y) blockPosY -= this.blockHitAnim();

                if (this.coinCollectArr.length > 0) this.coinCollectAnim(level);

                if (typeof(columnData[columnOffset]) == "object") {
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
    coinCollectAnim(level) {
        for (let i=0; i<this.coinCollectArr.length; i++) {
            this.coinCollectArr[i].count++
            
            let animOffset = 0;
            if (this.coinCollectArr[i].count < this.coinCollectArr[i].ANIM_TIME/2) animOffset = this.coinCollectArr[i].count/150
            else animOffset = (this.coinCollectArr[i].ANIM_TIME - this.coinCollectArr[i].count)/150

            const roundedFrameCount = Math.ceil(this.coinCollectArr[i].count/1000)

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
    blockHitLogic(tileX, tileY, blockId, entities) {
        if (blockId == 103 || typeof(blockId) == "object") {
            this.blockBouncePos.x = tileX;
            this.blockBouncePos.y = tileY;
            this.blockAnimFrameCount = 0;

            if (typeof(blockId) == "object") {
                if (!this.hitBlocksPre[tileX]) this.hitBlocksPre[tileX] = {}
                if (!this.hitBlocksPre[tileX][tileY]) {
                    this.hitBlocksPre[tileX][tileY] = {}
                    Object.assign(this.hitBlocksPre[tileX][tileY], blockId)
                }

                blockId.coins--

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
            }
            
            // if enemy above block, kill it
            for (let i=0; i<entities.onScreenEnemiesArr.length; i++) {
                if (tileY-1 == entities.onScreenEnemiesArr[i].relativePosition.y) {
                    if (Math.ceil(entities.onScreenEnemiesArr[i].relativePosition.x-1) == tileX &&
                        Math.floor(entities.onScreenEnemiesArr[i].relativePosition.x) == tileX) {
                        
                        entities.onScreenEnemiesArr[i].die(entities)
                    }
                }
            }
        }
        else return;
    }
    blockHitAnim() {
        this.blockAnimFrameCount++
        if (this.blockAnimFrameCount < 5) {
            return this.blockAnimFrameCount;
        } else if (this.blockAnimFrameCount < 10) {
            return -(this.blockAnimFrameCount-10)
        } else return 0;
    }
}