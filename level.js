import { CANVAS, DEBUG, tileSize } from "./defines.js";
import { FPS } from "./main.js";

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
 * Sprites that are a @type {number} greater than 0 have collision, while 0 and below are ignored by collision.
 * @summary Sprite Access Sheet
 * 
 * @type {{"adress": { x: number, y: number }}}
 * @enum {(string | number)}
 * @readonly
 */
export const SPRITES = {
    "GUI_coin": { x: 462, y: 163},

    0: { x: 0, y: 0 }, // air

    1: { x: 373, y: 124 }, // ground
    2: { x: 373, y: 142 }, // block
    3: { x: 373, y: 47 }, // brick
    4: { x: 372, y: 160 }, // ?block

    50: { x: 614, y: 46 }, // pipe_topLeft
    51: { x: 630, y: 46 }, // pipe_topRight
    52: { x: 614, y: 82 }, // pipe_left
    53: { x: 630, y: 82 }, // pipe_right
    54: { x: 614, y: 62 }, // pipe_bottomLeft
    55: { x: 630, y: 62 }, // pipe_bottomRight


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

        this.scrollOffset = 0
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
    drawColumn(tileColumn, columnData) {
        for (let columnOffset=0; columnOffset<CANVAS.lastRow; columnOffset++) {
            if (typeof(columnData[columnOffset]) != "string") { // string data are entities and ignored here
                ctx.drawImage(
                    spriteSheet, 
                    SPRITES[columnData[columnOffset]].x, 
                    SPRITES[columnData[columnOffset]].y, 
                    16, 
                    16, 
                    tileColumn*tileSize - this.scrollOffset, 
                    columnOffset*tileSize, 
                    tileSize, 
                    tileSize
                )
            }
        }
    }
}