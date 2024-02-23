/* ------------ DEFINES ------------ */

// canvas vars
// const canvas = document.querySelector("canvas");
// const ctx = canvas.getContext("2d");

// const width = canvas.width;
// const height = canvas.height;

// sprite sheet stuff
// const spriteSheet = document.querySelector("#sprite_sheet")
// const SPRITES = { // >0 solid | <1 trans 
//     "GUI_coin": { x: 462, y: 163},

//     0: { x: 0, y: 0 }, // air

//     1: { x: 373, y: 124 }, // ground
//     2: { x: 373, y: 142 }, // block
//     3: { x: 373, y: 47 }, // brick
//     4: { x: 372, y: 160 }, // ?block

//     50: { x: 614, y: 46 }, // pipe_topLeft
//     51: { x: 630, y: 46 }, // pipe_topRight
//     52: { x: 614, y: 82 }, // pipe_left
//     53: { x: 630, y: 82 }, // pipe_right
//     54: { x: 614, y: 62 }, // pipe_bottomLeft
//     55: { x: 630, y: 62 }, // pipe_bottomRight


//     "luigi_stand": { x: 191, y: 503 },
//         "luigi_stand_l": { x: 309, y: 463 },

//     "luigi_walk1": { x: 252, y: 503 },
//         "luigi_walk1_l": { x: 248, y: 463 },
//     "luigi_walk2": { x: 268, y: 503 },
//         "luigi_walk2_l": { x: 232, y: 463 },
//     "luigi_walk3": { x: 286, y: 503 },
//         "luigi_walk3_l": { x: 214, y: 463 },

//     "luigi_jump": { x: 308, y: 503 },
//         "luigi_jump_l": { x: 191, y: 463 },


//     "goomba_walk1": { x: 187, y: 894 },
//     "goomba_walk2": { x: 208, y: 894 },
//     "goomba_splat": { x: 228, y: 894 },
// }

// const DEBUG = {
//     "showTileBorder": false,
//     "showPlayerTilePosition": true,
//     "showFPS": false
// }

// game defines
// class Level {
//     constructor(levelCode, time) {
//         this.code = levelCode

//         this.MAX_TIME = time;
//         this.time = this.time;

//         this.scrollOffset = 0
//     }
// }
// const LEVEL = new level("1-1", 500);

// const tileSize = 20;

// let lives = 3;
// let score = 0;
// let coins = 0;
// let scrollOffset = 0;

/* ------------ SCENES ------------ */
// let crntScene = "preLevel";

// function gameOverRoutine() {
//     ctx.fillStyle = 'black'; // draw background
//     ctx.fillRect(0, 0, width, height);

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';
//     ctx.fillText(
//         "Game Over", 
//         width/2 - ctx.measureText("Game Over").width/2, 
//         height/2
//     );

//     drawGUI();
// }
// function preLevelRoutine() {
//     ctx.fillStyle = 'black'; // draw background
//     ctx.fillRect(0, 0, width, height);

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';
//     ctx.fillText(
//         "World 1-1", 
//         width/2 - ctx.measureText("World 1-1").width/2, 
//         height/2-20
//     );

//     ctx.drawImage(
//         spriteSheet, 
//         SPRITES["luigi_stand"].x, 
//         SPRITES["luigi_stand"].y, 
//         16, 
//         16, 
//         width/2-40, 
//         height/2, 
//         tileSize, 
//         tileSize
//     )
//     let formattedLives = `x ${lives}`;
//     ctx.fillText(
//         formattedLives,
//         width/2,
//         height/2+18
//     );

//     drawGUI();
// }
// let prevTilingOffset = -1;
// function levelSceneRoutine() {
//     if (DEBUG.showFPS) fpsCounter++

//     ctx.fillStyle = `rgb(81, 137, 252)`; // draw background
//     ctx.fillRect(0, 0, width, height);

//     initTiling();

//     if (!checkedForMobsPreScroll) checkForMobsPreScroll();

//     const tilingOffset = Math.floor(LEVEL.scrollOffset/tileSize)
//     if (tilingOffset != prevTilingOffset) { // on new column loaded
//         prevTilingOffset = tilingOffset;
//         spawnMobsInColumn(tilingOffset+lastColumn);
//     }
//     for (let i=tilingOffset; i<lastColumn+tilingOffset; i++) {
//         drawColumn(i, levelData[i]);
//     }

//     player.dieDetec();

//     player.draw();
//     player.collisionDetec();
//     player.noClipDetec();
//     player.gravity();

//     drawGUI();

//     for (let i=0; i<onScreenEnemiesArr.length; i++) {
//         onScreenEnemiesArr[i].draw()
//         onScreenEnemiesArr[i].move()
//         onScreenEnemiesArr[i].checkPlayerCollision();
//     }

//     if (player.absolutePosition.x-LEVEL.scrollOffset >= width/2) player.scroll()

//     inputter();
// }

/* ------------ FUNCTIONS ------------ */

// let onScreenEnemiesArr = []

// let lastColumn = 0;
// let lastRow = 0;
// function initTiling() { // formats lastColumn, lastRow
//     player.relativePosition.x = player.absolutePosition.x/tileSize;
//     player.relativePosition.y = player.absolutePosition.y/tileSize;

//     if (DEBUG.showFPS) {
//         ctx.font = "15px Arial";
//         ctx.fillStyle = "red";
//         ctx.fillText(`${lastSecondFrameCount}fps`, 10, 25);
//     }

//     // draw vertical lines
//     for (let i=tileSize; i<=width; i+=tileSize) {
//         if (DEBUG.showPlayerTilePosition) {
//             ctx.fillStyle = `rgba(102, 68, 129, 0.1)`;
//             ctx.fillRect(Math.round(player.relativePosition.x)*tileSize-scrollOffset, Math.round(player.relativePosition.y)*tileSize, tileSize, tileSize)
//         }

//         if (DEBUG.showTileBorder) {
//             ctx.beginPath();
//             ctx.moveTo(i-scrollOffset%tileSize, 0);
//             ctx.lineTo(i-scrollOffset%tileSize, height);
//             ctx.stroke();
//         }

//         lastColumn=i/tileSize;
//     }
//     // draw hizontal lines
//     for (let i=tileSize; i<=height; i+=tileSize) {
//         if (DEBUG.showTileBorder) {
//             ctx.beginPath();
//             ctx.moveTo(0, i);
//             ctx.lineTo(width, i);
//             ctx.stroke();
//         }

//         lastRow=i/tileSize;
//     }
// }

// function drawColumn(tileColumn, columnData) { // the game works by drawing each column top to bottom
//     for (let columnOffset=0; columnOffset<lastRow; columnOffset++) {
//         if (typeof(columnData[columnOffset]) != "string") {
//             ctx.drawImage(
//                 spriteSheet, 
//                 spriteAccArr[columnData[columnOffset]].x, 
//                 spriteAccArr[columnData[columnOffset]].y, 
//                 16, 
//                 16, 
//                 tileColumn*tileSize-LEVEL.scrollOffset, 
//                 columnOffset*tileSize, 
//                 tileSize, 
//                 tileSize
//             )
//         }
//     }
// }

// input handler stuff
// function inputter() {
//     if (player.keysHeld.a && player.keysHeld.d) {
//         if (player.momentumVertical > 0 && player.directionRight) player.decelerate(true); 
//         if (player.momentumVertical > 0 && !player.directionRight) player.decelerate(false); 
//         return;
//     }

//     // dealing with accel
//     if (player.keysHeld.a) player.accelerate(false);
//     else if (player.keysHeld.d) player.accelerate(true);
//     // dealing with decel
//     if (!player.keysHeld.d && player.momentumVertical > 0 && player.directionRight) player.decelerate(true);
//     else if (!player.keysHeld.a && player.momentumVertical > 0 && !player.directionRight) player.decelerate(false);

//     if (player.keysHeld.space) player.jump();
// }

// function drawGUI() {
//     const GUI_SHIFT_CONST = 25;

//     ctx.font = '15px SuperMarioBros';
//     ctx.fillStyle = 'white';

//     ctx.fillText(
//         "Mario", 
//         width/4 - ctx.measureText("Mario").width - GUI_SHIFT_CONST, 
//         25
//     );
//     let formattedScore = String(score).padStart(6, '0');
//     ctx.fillText(
//         formattedScore, 
//         width/4 - ctx.measureText("Mario").width - GUI_SHIFT_CONST,
//         45
//     );

//     ctx.drawImage(
//         spriteSheet, 
//         SPRITES["GUI_coin"].x, 
//         SPRITES["GUI_coin"].y, 
//         7, 
//         10, 
//         width/2 - ctx.measureText("x00").width - GUI_SHIFT_CONST - 17, 
//         30, 
//         12, 
//         17
//     )
//     let formattedCoins = String(coins).padStart(2, '0');
//     formattedCoins = `x${formattedCoins}`;
//     ctx.fillText(
//         formattedCoins,
//         width/2 - ctx.measureText(formattedCoins).width - GUI_SHIFT_CONST,
//         45
//     );

//     ctx.fillText(
//         "World", 
//         width/4*3 - ctx.measureText("World").width - GUI_SHIFT_CONST, 
//         25
//     );
//     ctx.fillText(
//         LEVEL.code, 
//         width/4*3 - ctx.measureText("World").width/4*3 - GUI_SHIFT_CONST, 
//         45
//     );

//     ctx.fillText(
//         "Time", 
//         width - ctx.measureText("Time").width - GUI_SHIFT_CONST, 
//         25
//     );
//     if (crntScene == "level") {
//         let formattedTime = String(LEVEL.time).padStart(3, '0');
//         ctx.fillText(
//             formattedTime, 
//             width - ctx.measureText(LEVEL.time).width - GUI_SHIFT_CONST, 
//             45
//         );
//     }
// }

// document.addEventListener("keydown", e => {
//     switch (e.key) {
//         case "a": player.keysHeld.a = true; break;
//         case "d": player.keysHeld.d = true; break;
//         case " ": player.keysHeld.space = true; break;
//     }
// })
// document.addEventListener("keyup", e => {
//     switch (e.key) {
//         case "a": player.keysHeld.a = false; break;
//         case "d": player.keysHeld.d = false; break;
//         case " ": player.keysHeld.space = false; break;
//     }
// })

/* ------------ ENEMIES ------------ */

// let checkedForMobsPreScroll = false;
// function checkForMobsPreScroll() {
//     for (let col=0; col<lastColumn; col++) {
//         for (let row=0; row<lastRow; row++) {
//             if (typeof(levelData[col][row]) == "string") {
//                 spawnMob(col, row, "goomba")
//             }
//         }
//     }
//     checkedForMobsPreScroll = true
// }
// function spawnMob(x, y, type) {
//     onScreenEnemiesArr.push(new Enemy(x, y, type))
// }
// function spawnMobIfPresent(column) {
//     for (let i=0; i<lastRow; i++) {
//         if (typeof(levelData[column][i]) == "string") { // its an enemy if string
//             console.log("spawn!!!")
//             //onScreenEnemiesArr.push(new Enemy(tileColumn, columnOffset, "goomba")) !NOTE
//         }
//     }
// }

// class Enemy {
//     constructor(tileX, tileY, type) {
//         this.relativePosition = { x: tileX, y: tileY };
//         this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
    
//         this.type = type;

//         this.SPEED = 0.6;

//         this.WALK_ANIM_SPEED = 20;
//         this.walkFrameCount = 0;
//         this.lastSprite = "goomba_walk1";
//     }
//     draw() {
//         this.walkFrameCount++

//         if (this.type == "goomba") {
//             if (this.walkFrameCount >= this.WALK_ANIM_SPEED) {
//                 switch (this.lastSprite) {
//                     case "goomba_walk1":
//                         this.lastSprite = "goomba_walk2";
//                         break;
//                     case "goomba_walk2":
//                         this.lastSprite = "goomba_walk1";
//                         break;
//                 }
//                 this.walkFrameCount = 0
//             }

//             ctx.drawImage(
//                 spriteSheet, 
//                 SPRITES[this.lastSprite].x, 
//                 SPRITES[this.lastSprite].y, 
//                 16, 
//                 16, 
//                 this.absolutePosition.x-LEVEL.scrollOffset, 
//                 this.absolutePosition.y, 
//                 tileSize, 
//                 tileSize
//             )
//         }
//     }
//     move() {
//         if (this.type == "goomba") {
//             this.absolutePosition.x -= this.SPEED;
//             this.relativePosition.x = this.absolutePosition.x / tileSize;
//         }
//     }
//     checkPlayerCollision() {
//         if (Math.floor(player.relativePosition.x) == Math.floor(this.relativePosition.x)) {
//             if (Math.ceil(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
//                 console.log("splat")
//             }
//         }
//         // to left
//         if (player.relativePosition.x - LEVEL.scrollOffset <= this.relativePosition.x - LEVEL.scrollOffset) {
//             if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
//                 if (Math.ceil(player.relativePosition.x - LEVEL.scrollOffset) > Math.floor(this.relativePosition.x - LEVEL.scrollOffset)) {
//                     console.log("DEAth")
//                 }
//             }
//         }
//         // to right
//         else if (player.relativePosition.x - LEVEL.scrollOffset >= this.relativePosition.x - LEVEL.scrollOffset) {
//             if (Math.floor(player.relativePosition.y) == Math.floor(this.relativePosition.y)) {
//                 if (Math.floor(player.relativePosition.x - LEVEL.scrollOffset) < Math.ceil(this.relativePosition.x - LEVEL.scrollOffset)) {
//                     console.log("DEAth right")
//                 }
//             }
//         }
//     }
//     die() {

//     }
// }
//let goomba = new Enemy(12, 11, "goomba")

/* ------------ PLAYER ------------ */

// class Player {
//     constructor(tileX, tileY, maxSpeed, jumpHeight) {
//         this.relativePosition = { x: tileX, y: tileY };
//         this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
        
//         this.keysHeld = {
//             "a": false,
//             "d": false,
//             "space": false
//         }
//         // moving left/right
//         this.MAX_SPEED = maxSpeed;
//         this.ACCELERATION = 0.3;
//         this.momentumVertical = 0;
//         this.directionRight = true;
//         // moving up/down
//         this.TERMINAL_VELOCITY = maxSpeed * 2;
//         this.GRAVITY = 0.5;
//         this.momentumHorizontal = 0;
//         //jumping
//         this.JUMP_HEIGHT = jumpHeight;
//         this.JUMP_TIMEOUT = 10;
//         this.timeSinceLastJump = 0;
//         this.jumpForce = 0;
//         // anim
//         this.WALK_ANIM_SPEED = 5;
//         this.walkFrameCount = 0;
//         this.lastSprite = "luigi_stand";
//         // misc
//         this.prevTile = { x: 0, y: 0 }
//     }
//     draw() {
//         this.walkFrameCount++;

//         if (this.timeSinceLastJump == 0) {
//             this.lastSprite = "luigi_jump"
//         }
//         else if (this.momentumVertical > 0) {
//             if (this.walkFrameCount >= this.WALK_ANIM_SPEED-(this.momentumVertical/2)) {
//                 let nextSprite = "luigi_stand";
    
//                 if (this.momentumVertical > 0) {
//                     switch (this.lastSprite) {
//                         case "luigi_stand":
//                             nextSprite = "luigi_walk1";
//                             break;
//                         case "luigi_walk1":
//                             nextSprite = "luigi_walk2";
//                             break;
//                         case "luigi_walk2":
//                             nextSprite = "luigi_walk3";
//                             break;
//                         case "luigi_walk3":
//                             nextSprite = "luigi_walk1";
//                             break;
//                     }
//                 }
    
//                 this.lastSprite = nextSprite;
    
//                 this.walkFrameCount = 0;
//             }
//         } else {
//             this.lastSprite = "luigi_stand";
//         }

//         let formattedSpriteName = this.lastSprite
//         if (!this.directionRight) formattedSpriteName = `${formattedSpriteName}_l`;

//         ctx.drawImage(
//             spriteSheet, 
//             spriteAccArr[formattedSpriteName].x, 
//             spriteAccArr[formattedSpriteName].y, 
//             16, 
//             16, 
//             player.absolutePosition.x-LEVEL.scrollOffset, 
//             player.absolutePosition.y, 
//             tileSize, 
//             tileSize
//         )
//     }
//     accelerate(proposedDirection) { // proposedDirection because accel in sharp turn player needs to slow down first
//         // sharp turn: first decel, then player can accel in prosed direction
//         if (this.momentumVertical <= 0) this.directionRight = proposedDirection;
//         if (proposedDirection != this.directionRight) this.decelerate(proposedDirection);
//         // add cutoff to momentum of MAX_SPEED
//         if (this.momentumVertical >= this.MAX_SPEED) this.momentumVertical = this.MAX_SPEED;
//         else this.momentumVertical += this.ACCELERATION
//         // add or subtract momentum to x position based on direction
//         if (this.directionRight) this.absolutePosition.x += this.momentumVertical;
//         else this.absolutePosition.x -= this.momentumVertical;

//         //console.log(levelData[Math.round(player.relativePosition.x)][Math.round(player.relativePosition.y)])
//     }
//     decelerate(actualDirection) { // may differ from this.directionRight is slowing for sharp turn
//         this.momentumVertical -= this.ACCELERATION
//         // add or subtract momentum to x position based on direction
//         if (actualDirection) this.absolutePosition.x += this.momentumVertical;
//         else this.absolutePosition.x -= this.momentumVertical;
//     }
//     collisionDetec() {
//         // left border
//         if (Math.ceil(this.absolutePosition.x - LEVEL.scrollOffset) <= 0) { // needs own logic because of occasional -1 parsed into levelArray
//             this.momentumVertical = 0;
//             this.absolutePosition.x = LEVEL.scrollOffset;

//             if (levelData[0][Math.floor(this.relativePosition.y)+1] > 0) {
//                 this.momentumHorizontal = 0;
//                 this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;
//             }

//             return;
//         }
//         //right border
//         if (Math.floor(this.relativePosition.x) >= levelData.length-2) {
//             this.momentumVertical = 0;
//             this.absolutePosition.x = (Math.floor(this.relativePosition.x))*tileSize;
//         }

//         // to top
//         if (levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)] > 0) {
//             this.momentumHorizontal = 0;
//             this.jumpForce *= -1;
//             this.absolutePosition.y = (Math.floor(this.relativePosition.y)+1)*tileSize;
//         }
//         else {
//             // to right
//             if (levelData[Math.floor(this.relativePosition.x)+1][Math.floor(this.relativePosition.y)] > 0) {
//                 this.momentumVertical = 0;
//                 this.absolutePosition.x = (Math.floor(this.relativePosition.x))*tileSize;
//             }
//             // to left
//             if (levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)] > 0) {
//                 this.momentumVertical = 0;
//                 this.absolutePosition.x = (Math.floor(this.relativePosition.x)+1)*tileSize;
//             }
//         }
//         // to bottom
//         if (levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1] > 0) {
//             this.momentumHorizontal = 0;
//             this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;
//             this.timeSinceLastJump++
//         } else this.timeSinceLastJump = 0;
//     }
//     noClipDetec() {
//         const crntTileX = Math.round(this.relativePosition.x);
//         const crntTileY = Math.round(this.relativePosition.y);

//         if (this.prevTile.x != crntTileX || this.prevTile.y != crntTileY) {
//             if (levelData[crntTileX][crntTileY] > 0) {
//                 this.absolutePosition.x = this.prevTile.x*tileSize;
//                 this.absolutePosition.y = this.prevTile.y*tileSize;
//             }
//             this.prevTile = { x: crntTileX, y: crntTileY};
//         }
//     }
//     gravity() {
//         if (this.jumpForce > 0) this.jumpForce -= this.GRAVITY
//         if (this.jumpForce < 0) this.jumpForce = 0;

//         if (this.momentumHorizontal >= this.TERMINAL_VELOCITY) this.momentumHorizontal = this.TERMINAL_VELOCITY;
//         else this.momentumHorizontal += this.GRAVITY

//         this.absolutePosition.y += this.momentumHorizontal - this.jumpForce
//     }
//     jump() {
//         // only jump if no horizontal momentum and jump timeout reached
//         if (this.momentumHorizontal <= this.GRAVITY && this.timeSinceLastJump >= this.JUMP_TIMEOUT) this.jumpForce = this.JUMP_HEIGHT;
//     }
//     scroll() {
//         // if last column, stop scrolling
//         if (lastColumn + Math.floor(LEVEL.scrollOffset/tileSize) >= levelData.length-1) return;

//         // shitty solution for a bug; screen kept moving left when past half way point of width
//         if (this.momentumVertical < 0) return;

//         LEVEL.scrollOffset += this.momentumVertical;
//     }
//     dieDetec() {
//         if (this.absolutePosition.y > height) this.die()
//     }
//     die() {
//         if (lives == 0) {
//             crntScene = "gameOver";

//             return;
//         }

//         lives--

//         crntScene = "preLevel";

//         LEVEL.time = LEVEL.MAX_TIME;
//         player = new Player(2, 11, 4, 15);
//         LEVEL.scrollOffset = 0;
//     }
// }
// let player = new Player(2, 11, 4, 15);

/* ------------ FRAME ITERATION ------------ */

// let levelData;
// let fpsCounter = 0;
// let lastSecondFrameCount = 0;
// function update() {
//     switch (crntScene) {
//         case "preLevel":
//             preLevelRoutine();

//             if (LEVEL.time - LEVEL.MAX_TIME <= -3) {
//                 LEVEL.time = LEVEL.MAX_TIME;
//                 crntScene = "level";
//             }
//             break;
//         case "level":
//             levelSceneRoutine();

//             break;
//         case "gameOver":
//             gameOverRoutine();

//             break;
//     }

//     requestAnimationFrame(update)
// }

/* ------------ MISC ------------ */

// fetch("./levelData.json") // only update frame after fetching tile sheet
//     .then(res => {
//         if (!res.ok) {
//             throw new Error
//                 (`HTTP error! Status: ${res.status}`);
//         }
//         return res.json();
//     })
//     .then(data => {
//         levelData = data["1-1"];
//         requestAnimationFrame(update)
//     })
//     .catch(error => {
//         console.error("Unable to fetch data:", error);
//     })


// setInterval(() => {
//     LEVEL.time--

//     if (DEBUG.showFPS) { // make fps counter work
//         lastSecondFrameCount = fpsCounter;
//         fpsCounter = 0;
//     }
// }, 1000)