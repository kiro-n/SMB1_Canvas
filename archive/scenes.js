// import { CANVAS, DEBUG, tileSize } from "./defines.js";
// import { spriteSheet, SPRITES, levelData } from "./level.js";
// import { STATS } from "./player.js";
// import { Entities } from "./enemy.js";
// import { Inputter } from "./inputter.js";

// const ctx = CANVAS.ctx;
// const absWidth = CANVAS.absWidth;
// const absHeight = CANVAS.absHeight;

// const ENTITIES = new Entities();
// const INPUTTER = new Inputter();

// export let crntScene = "preLevel";

// let LEVEL, PLAYER;
// export class Scene {
//     constructor(scene) {
//         crntScene = scene
//     }
//     changeScene(scene) {
//         crntScene = scene
//     }
//     runCrntSceneRoutine(level, player) {
//         LEVEL = level;
//         PLAYER = player;

//         switch (crntScene) {
//             case "preLevel":    
//             preLevelRoutine();

//                 if (LEVEL.time - LEVEL.MAX_TIME <= -3) {
//                     this.changeScene("level")
//                     LEVEL.time = LEVEL.MAX_TIME;
//                 }
//                 break;
//             case "level": levelSceneRoutine(); break;
//             case "gameOver": gameOverRoutine(); break;
//         }
//     }
// }

// function gameOverRoutine() {
//     ctx.fillStyle = 'black'; // draw background
//     ctx.fillRect(0, 0, absWidth, absHeight);

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';
//     ctx.fillText(
//         "Game Over", 
//         absWidth/2 - ctx.measureText("Game Over").absWidth/2, 
//         absHeight/2
//     );

//     drawGUI();
// }

// function preLevelRoutine() {
//     ctx.fillStyle = 'black'; // draw background
//     ctx.fillRect(0, 0, absWidth, absHeight);

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';
//     ctx.fillText(
//         "World 1-1", 
//         absWidth/2 - ctx.measureText("World 1-1").absWidth/2, 
//         absHeight/2-20
//     );

//     ctx.drawImage(
//         spriteSheet, 
//         SPRITES["luigi_stand"].x, 
//         SPRITES["luigi_stand"].y, 
//         16, 
//         16, 
//         absWidth/2-40, 
//         absHeight/2, 
//         tileSize, 
//         tileSize
//     )
//     let formattedLives = `x ${STATS.lives}`;
//     ctx.fillText(
//         formattedLives,
//         absWidth/2,
//         absHeight/2+18
//     );

//     drawGUI();
// }

// INPUTTER.setUpListeners(PLAYER);

// let prevTilingOffset = -1;
// function levelSceneRoutine() {
//     if (DEBUG.showFPS) fpsCounter++

//     ctx.fillStyle = `rgb(81, 137, 252)`; // draw background
//     ctx.fillRect(0, 0, absWidth, absHeight);

//     LEVEL.initTiling(PLAYER);

//     if (!ENTITIES.checkedForMobsPreScroll) ENTITIES.checkForMobsPreScroll();

//     const tilingOffset = Math.floor(LEVEL.scrollOffset/tileSize)
//     if (tilingOffset != prevTilingOffset) { // on new column loaded
//         prevTilingOffset = tilingOffset;
//         ENTITIES.spawnMobsInColumn(tilingOffset+CANVAS.lastColumn);
//     }
//     for (let i=tilingOffset; i<CANVAS.lastColumn+tilingOffset; i++) {
//         LEVEL.drawColumn(i, levelData[i]);
//     }

//     PLAYER.dieDetec(LEVEL);

//     PLAYER.draw(LEVEL);
//     PLAYER.collisionDetec(LEVEL);
//     PLAYER.noClipDetec();
//     PLAYER.gravity();

//     drawGUI();

//     for (let i=0; i<ENTITIES.onScreenEnemiesArr.length; i++) {
//         ENTITIES.onScreenEnemiesArr[i].draw(LEVEL)
//         ENTITIES.onScreenEnemiesArr[i].move()
//         ENTITIES.onScreenEnemiesArr[i].checkPlayerCollision(PLAYER, LEVEL);
//     }

//     if (PLAYER.absolutePosition.x-LEVEL.scrollOffset >= absWidth/2) PLAYER.scroll(LEVEL)

//     INPUTTER.checkInput(PLAYER);
// }

// function drawGUI() {
//     const GUI_SHIFT_CONST = 25;

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';

//     ctx.fillText(
//         "Mario", 
//         absWidth/4 - ctx.measureText("Mario").absWidth - GUI_SHIFT_CONST, 
//         25
//     );
//     let formattedScore = String(STATS.score).padStart(6, '0');
//     ctx.fillText(
//         formattedScore, 
//         absWidth/4 - ctx.measureText("Mario").absWidth - GUI_SHIFT_CONST,
//         45
//     );

//     ctx.drawImage(
//         spriteSheet, 
//         SPRITES["GUI_coin"].x, 
//         SPRITES["GUI_coin"].y, 
//         7, 
//         10, 
//         absWidth/2 - ctx.measureText("x00").absWidth - GUI_SHIFT_CONST - 17, 
//         30, 
//         12, 
//         17
//     )
//     let formattedCoins = String(STATS.coins).padStart(2, '0');
//     formattedCoins = `x${formattedCoins}`;
//     ctx.fillText(
//         formattedCoins,
//         absWidth/2 - ctx.measureText(formattedCoins).absWidth - GUI_SHIFT_CONST,
//         45
//     );

//     ctx.fillText(
//         "World", 
//         absWidth/4*3 - ctx.measureText("World").absWidth - GUI_SHIFT_CONST, 
//         25
//     );
//     ctx.fillText(
//         LEVEL.code, 
//         absWidth/4*3 - ctx.measureText("World").absWidth/4*3 - GUI_SHIFT_CONST, 
//         45
//     );

//     ctx.fillText(
//         "Time", 
//         absWidth - ctx.measureText("Time").absWidth - GUI_SHIFT_CONST, 
//         25
//     );
//     if (crntScene == "level") {
//         let formattedTime = String(LEVEL.time).padStart(3, '0');
//         ctx.fillText(
//             formattedTime, 
//             absWidth - ctx.measureText(LEVEL.time).absWidth - GUI_SHIFT_CONST, 
//             45
//         );
//     }
// }