import { CANVAS, DEBUG, tileSize } from "./defines.js";
import { Level, spriteSheet, SPRITES } from "./level.js";
import { Player, STATS } from "./player.js";
import { Entities } from "./entities.js";
import { Inputter } from "./inputter.js";

/* ------------ Init ------------ */

const ctx = CANVAS.ctx;
const absWidth = CANVAS.absWidth;
const absHeight = CANVAS.absHeight;

let crntScene = "preLevel";

let PLAYER = new Player(2, 12, 4);
let LEVEL = new Level(500);

const ENTITIES = new Entities();
const INPUTTER = new Inputter();
INPUTTER.setUpListeners(PLAYER);

/**
 * Resets all vital data in the game outside of STATS
 * @param {string} sceneCode What scene to switch to (currently only "level," "preLevel" & "gameOver")
 */
export function resetLevel(sceneCode) {
    PLAYER = new Player(2, 12, 4);
    PLAYER.GRAVITY = 0.5;

    for (var column in LEVEL.blocksHit) {
        for (var row in LEVEL.blocksHit[column]) {
            levelData[column][row] = LEVEL.blocksHit[column][row]
        }
    }

    LEVEL = new Level(500);

    ENTITIES.onScreenEnemiesArr = [];
    ENTITIES.checkForMobsPreScroll();

    INPUTTER.setUpListeners(PLAYER);

    crntScene = sceneCode;
}

/* ------------ Fetch ------------ */

export const levelData = await fetch("./levelData.json")
    .then(res => {
        if (!res.ok) {
            throw new Error
                (`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        return data["1-1"];
    })
    .catch(error => {
        console.error("Unable to fetch data:", error);
    })

export function changeBlock(tileX, tileY, blockId) {
    levelData[tileX][tileY] = blockId
}

/* ------------ Frame Clock ------------ */

function update() {
    switch (crntScene) {
        case "preLevel": gameOverRoutine(); preLevelRoutine(); break;
        case "level": levelSceneRoutine(); break;
        case "gameOver": gameOverRoutine(); break;
    }

    requestAnimationFrame(update)
}

requestAnimationFrame(update)

/* ------------ Routines ------------ */

function gameOverRoutine() {
    // black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, absWidth, absHeight);

    // "Game Over" screen 
    ctx.font = '15px SuperMarioBros';
    ctx.fillStyle = 'white';
    ctx.fillText(
        "Game Over", 
        absWidth/2 - ctx.measureText("Game Over").width/2, 
        absHeight/2
    );

    drawGUI();
}

function preLevelRoutine() {
    // black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, absWidth, absHeight);

    // display level code
    ctx.font = '15px SuperMarioBros';
    ctx.fillStyle = 'white';
    ctx.fillText(
        "World 1-1", 
        absWidth/2 - ctx.measureText("World 1-1").width/2, 
        absHeight/2-20
    );

    // draw life count
    ctx.drawImage(
        spriteSheet, 
        SPRITES["luigi_stand"].x, 
        SPRITES["luigi_stand"].y, 
        16, 
        16, 
        absWidth/2-40, 
        absHeight/2, 
        tileSize, 
        tileSize
    )
    let formattedLives = `x ${STATS.lives}`;
    ctx.fillText(
        formattedLives,
        absWidth/2,
        absHeight/2+18
    );

    drawGUI();

    if (LEVEL.time - LEVEL.MAX_TIME <= -3) {
        crntScene = "level"
        LEVEL.time = LEVEL.MAX_TIME;
    }
}

let prevTilingOffset = -1;
function levelSceneRoutine() {
    if (DEBUG.showFPS) fpsCounter++

    // azure background
    ctx.fillStyle = `rgb(81, 137, 252)`;
    ctx.fillRect(0, 0, absWidth, absHeight);

    const tilingOffset = Math.floor(LEVEL.scrollOffset/tileSize)

    // draw every visible column
    for (let i=tilingOffset; i<CANVAS.lastColumn+tilingOffset; i++) {
        LEVEL.drawColumn(i, levelData[i], LEVEL);
    }

    // if debug, draw debug
    if (DEBUG.showTileBorder || DEBUG.showPlayerTilePosition || DEBUG.showFPS) {
        LEVEL.debugDraw(PLAYER);
    }

    drawGUI();

    // draw score if present
    if (PLAYER.scoreDisplayArr.length > 0) {
        for (let i=0; i<PLAYER.scoreDisplayArr.length; i++) {
            PLAYER.scoreDisplayArr[i].count++

            if (PLAYER.scoreDisplayArr[i].count >= 20) {
                PLAYER.scoreDisplayArr.splice(i, 1);
                return;
            }

            ctx.font = '8px SuperMarioBros';
            ctx.fillText(
                PLAYER.scoreDisplayArr[i].number, 
                PLAYER.scoreDisplayArr[i].x - LEVEL.scrollOffset, 
                PLAYER.scoreDisplayArr[i].y - 30 - PLAYER.scoreDisplayArr[i].count
            );
        }
    }

    // draw enemies and player
    for (let i=0; i<ENTITIES.onScreenEnemiesArr.length; i++) ENTITIES.onScreenEnemiesArr[i].draw(LEVEL, i);
    PLAYER.draw(LEVEL);

    // stop all next logic if taking damage, growing or finishing level
    if (PLAYER.isChangingFormTimeout || PLAYER.finishedLevel) return;


    // if first frame, check for mobs
    if (!ENTITIES.checkedForEntitiesPreScroll) ENTITIES.checkForMobsPreScroll();

    // if new column loaded in, check for mobs
    if (tilingOffset != prevTilingOffset) {
        prevTilingOffset = tilingOffset;
        ENTITIES.spawnMobsInColumn(tilingOffset+CANVAS.lastColumn);
    }

    // player logic
    if (!PLAYER.dying) {
        PLAYER.dieDetec(LEVEL);
        PLAYER.collisionDetec(LEVEL, ENTITIES, PLAYER);
        PLAYER.noClipDetec();
    } else {
        INPUTTER.disableInput()
    }
    PLAYER.gravity();

    // enemy logic
    for (let i=0; i<ENTITIES.onScreenEnemiesArr.length; i++) {
        if (!ENTITIES.onScreenEnemiesArr[i].dying) {
            ENTITIES.onScreenEnemiesArr[i].move();
            ENTITIES.onScreenEnemiesArr[i].gravity();
            ENTITIES.onScreenEnemiesArr[i].checkPlayerCollision(PLAYER, LEVEL, ENTITIES);
            ENTITIES.onScreenEnemiesArr[i].checkBlockCollision(LEVEL, ENTITIES);   
        }
    }

    // power up logic
    for (let i=0; i<ENTITIES.onScreenPowerUpArr.length; i++) {
        if (ENTITIES.onScreenPowerUpArr[i].isSpawning) ENTITIES.onScreenPowerUpArr[i].spawnAnim(LEVEL);
        else {
            ENTITIES.onScreenPowerUpArr[i].draw(LEVEL);
            ENTITIES.onScreenPowerUpArr[i].move();
            ENTITIES.onScreenPowerUpArr[i].gravity();
            ENTITIES.onScreenPowerUpArr[i].checkPlayerCollision(PLAYER, LEVEL, ENTITIES);
            if (ENTITIES.onScreenPowerUpArr[i]) ENTITIES.onScreenPowerUpArr[i].checkBlockCollision(LEVEL, ENTITIES); // if statement needed because power up despawns if picked up by player
        }
    }

    // scroll logic
    if (PLAYER.absolutePosition.x-LEVEL.scrollOffset >= absWidth/2) PLAYER.scroll(LEVEL)

    INPUTTER.checkInput();
}

/* ------------ Draw GUI ------------ */

function drawGUI() {
    const GUI_SHIFT_CONST = 25;

    ctx.font = '15px SuperMarioBros';
    ctx.fillStyle = 'white';

    /* MARIO 000000 */
    ctx.fillText(
        "Mario", 
        absWidth/4 - ctx.measureText("Mario").width - GUI_SHIFT_CONST, 
        25
    );
    let formattedScore = String(STATS.score).padStart(6, '0');
    ctx.fillText(
        formattedScore, 
        absWidth/4 - ctx.measureText("Mario").width - GUI_SHIFT_CONST,
        45
    );

    /* O x00 */
    ctx.drawImage(
        spriteSheet, 
        SPRITES["GUI_coin"].x, 
        SPRITES["GUI_coin"].y, 
        7, 
        10, 
        absWidth/2 - ctx.measureText("x00").width - GUI_SHIFT_CONST - 17, 
        30, 
        12, 
        17
    )
    let formattedCoins = String(STATS.coins).padStart(2, '0');
    formattedCoins = `x${formattedCoins}`;
    ctx.fillText(
        formattedCoins,
        absWidth/2 - ctx.measureText(formattedCoins).width - GUI_SHIFT_CONST,
        45
    );

    /* WORLD 1-1 */
    ctx.fillText(
        "World", 
        absWidth/4*3 - ctx.measureText("World").width - GUI_SHIFT_CONST, 
        25
    );
    ctx.fillText(
        LEVEL.code, 
        absWidth/4*3 - ctx.measureText("World").width/4*3 - GUI_SHIFT_CONST, 
        45
    );

    /* TIME 500 */
    ctx.fillText(
        "Time", 
        absWidth - ctx.measureText("Time").width - GUI_SHIFT_CONST, 
        25
    );
    if (crntScene == "level") {
        let formattedTime = String(LEVEL.time).padStart(3, '0');
        ctx.fillText(
            formattedTime, 
            absWidth - ctx.measureText(LEVEL.time).width - GUI_SHIFT_CONST, 
            45
        );
    }
}

/* ------------ 1sec CLOCK ------------ */

let fpsCounter = 0;
export let FPS = 0;
// 1sec clock
setInterval(() => {
    if (LEVEL.time <= 0) {
        if (!PLAYER.dying) PLAYER.dieAnimStart();
        return;
    }

    LEVEL.time--

    if (DEBUG.showFPS) { // make fps counter work
        FPS = fpsCounter;
        fpsCounter = 0;
    }
}, 1000)