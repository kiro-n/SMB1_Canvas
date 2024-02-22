import { levelData, resetLevel } from "./main.js";
import { CANVAS, tileSize } from "./defines.js";
import { spriteSheet, SPRITES } from "./level.js";

/* ------------------------ */

// player stats
export let lives = 3;
export let score = 0;
export let coins = 0;

/**
 * Stores player stats that stay even after being respawned (i.e. GUI elements)
 */
export const STATS = {
    lives: lives,
    score: score,
    coins: coins
}

/**
 * Returns true if given blockId is solid (either number >=100 or object)
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

/* ------------ Player ------------ */

export class Player {
    /**
     * Everything to do with the player (excluding dying from enemies).
     * @param {number} [tileX=0] Whole number; X position tile where player spawns
     * @param {number} [tileY=0] Whole number; Y position tile where player spawns
     * @param {number} [maxSpeed=4] Maximum speed able to be reached by player
     */
    constructor(tileX=0, tileY=0, maxSpeed=4) {
        /**
         * Player positioning based on tiling.
         * After this.absolutePosition changes equalRel2Abs() is typically called to make them proportional.
         * @alias tilePosition
         * @example
         * // player position in second row, third column
         * this.relativePosition = { x: 1, y: 2 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of player based on tiling
         * @property {number} y Y coordinate of player based on tiling
         */
        this.relativePosition = { x: tileX, y: tileY };
        /**
         * Player positioning (top left corner of player) based on canvas pixel.
         * Arithmatic is preferred to be performed on this variable rather than this.relativePosition
         * @alias pixelPosition
         * @example
         * // player position in the top left of the canvas with 10px padding
         * this.absolutePosition = { x: 10, y: 10 };
         * @type {{ x: 0, y: 0 }}
         * @property {number} x X coordinate of player pixel position
         * @property {number} y Y coordinate of player pixel position
         */
        this.absolutePosition = { x: tileX*tileSize, y: tileY*tileSize };
        

        /**
         * Stores keys pressed, logic by {Inputter.setUpListeners()}, action binded by {Inputter.checkInput()}
         * @type {{"name": boolean}}
         * @example
         * keysHeld = {
            "a": false,
            "d": false,
            "run": false,
            "space": false
            }
         */
        this.keysHeld = {
            "a": false,
            "d": false,
            "run": false,
            "space": false
        }


        /**
         * Wether player is big or not
         * @type {boolean}
         */
        this.super = false;

        /**
         * Time after which you flash up/down when picking up/losing Power Up
         * @type {number}
         * @readonly
         */
        this.GROWING_INTERVAL = 10;
        /**
         * Wether or not player is flashing up and down and game is frozen shortly
         * @type {boolean}
         */
        this.isChangingFormTimeout = false;
        /**
         * Counts each frame when eiter isChangingFormTimeout or isInvincible is active
         * @type {number}
         */
        this.invincibleCount = 0;

        /**
         * Wether player is flashing and cannot be hit
         * @type {boolean}
         */
        this.isInvincible = false;
        /**
         * Time after which player stops flashing and can get hit again
         * @type {number}
         */
        this.INVINCABILITY_TIME = 80;
        /**
         * Time after which to switch invincibleFlashing state (visible or not)
         */
        this.FLASHING_INTERVAL = 5;
        /**
         * Wether player is visible from flashing
         * @type {boolean}
         */
        this.invincibleFlashing = false;


        /**
         * Momentum/Speed cap when keysHeld.run is not pressed
         * @type {number}
         * @alias MOMENTUM_CAP
         * @readonly
         */
        this.WALK_SPEED = maxSpeed/2;
        /**
         * Momentum/Speed cap in accelerate()
         * @type {number}
         * @alias MOMENTUM_CAP
         * @readonly
         */
        this.MAX_SPEED = maxSpeed;
        /**
         * Speed gain & loss in accelerate() or decelerate()
         * @type {number}
         * @alias SPEED_GAIN
         * @readonly
         */
        this.ACCELERATION = 0.2;
        /**
         * Speed to the left or right to be added in either accelerate() or decelerate()
         * 
         * Notice that its value is only positive and direction is dictated by this.directionRight
         * @type {number}
         */
        this.momentumHorizontal = 0;
        /**
         * Wether or not the player is actually moving to the right (as opposed to pressed/proposed direction)
         * @type {boolean}
         * @alias actualDirection
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
        this.TERMINAL_VELOCITY = 8;
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
         * Value to be applied to this.jumpForce when jump() is successfully called
         * @type {number}
         * @readonly
         */
        this.JUMP_POWER = 7;
        /**
         * Force working against gravity in gravity(), pushing the player upwards
         * @type {number}
         * @alias jumpMomentum
         */
        this.jumpForce = 0;
        /**
         * @todo
         * @type {boolean}
         * @alias jumpFinished
         */
        this.isJumping = false;
        /**
         * Wether or not the player has finished their jump input and is in mid air (to prevent "double jumps")
         * @type {boolean}
         * @alias jumpFinished
         */
        this.isJumpClimax = false;
        /**
         * Amount after which jump() stops being called (in combination with this.spaceCallCounter)
         * @type {number}
         * @alias maxJumpsCalled
         */
        this.MAX_SPACE_CALLS = 15;
        /**
         * Amount of times player jumped when ascending (preventing infinite jump)
         * @type {number}
         * @alias jumpsCalled
         */
        this.spaceCallCounter = 0;
        /**
         * Frame count since last jump (used to make jump timout work)
         * 
         * Notice that its value is 0 when in midair
         * @type {number}
         */
        this.timeSinceLastJump = 0;


        /**
         * Maximum time to wait until changing the walk sprite of player while not pressing run
         * @type {number}
         * @alias SPRITE_CHANGE_TIMEOUT
         * @readonly
         */
        this.WALK_ANIM_SPEED = 7;
        /**
         * Maximum time to wait until changing the walk sprite of player
         * @type {number}
         * @alias SPRITE_CHANGE_TIMEOUT
         * @readonly
         */
        this.RUN_ANIM_SPEED = 5;
        /**
         * Frame count since last walk sprite change
         * @type {number}
         * @alias timeSinceLastSpriteChange
         */
        this.walkFrameCount = 0;
        /**
         * Last sprite drawn on screen to determine next animation sprite order
         * @type {string}
         * @alias crntFrame
         */
        this.crntSprite = "luigi_stand";

        
        /**
         * Used in @function noClipDetec() to restore position before player clipped
         * @type {{ x: 0, y: 0 }}
         * @property {number} x Whole number representing the X coordinate of the tile
         * @property {number} y Whole number representing the Y coordinate of the tile
         */
        this.prevTile = { x: 0, y: 0 }

        /**
         * Changes animation and logic to death animation
         * @type {bool}
         */
        this.dying = false;
        /**
         * Frame count after which the respawning process should start
         * @type {number}
         * @readonly
         */
        this.DYING_TIMEOUT = 100;


        /**
         * All additional scores which have to be displayed
         * @type {[{ x: number, y: number, number: number, count: number }]}
         */
        this.scoreDisplayArr = [];
        /**
         * Enemies killed in a row without hitting the ground
         * @type {number}
         */
        this.successiveKills = 0;
        /**
         * Scores which are given when killing them in a row without hitting the ground (see successiveKills)
         * @type {[ number ]}
         * @readonly
         */
        this.SUCCESSIVE_SCORES = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];


        /**
         * Wether player has touched the flag pole or not
         * @type {boolean}
         */
        this.finishedLevel = false;
        /**
         * Because end of game has a lot of sequential steps, use this and switch case to properly time everything
         * @type {number}
         */
        this.finishedLevelAnimStep = 0;
    }
    formatSprite() {
        // jump sprite if in mid air
        if (this.timeSinceLastJump == 0) {
            this.crntSprite = "luigi_jump"
        }
        else if (this.momentumHorizontal > 0) {
            // pick next sprite in order when next frame timemout is met
            let CRNT_FRAME_TIMEOUT;
            if (this.keysHeld.run) CRNT_FRAME_TIMEOUT = this.RUN_ANIM_SPEED;
            else CRNT_FRAME_TIMEOUT = this.WALK_ANIM_SPEED;

            if (this.walkFrameCount >= CRNT_FRAME_TIMEOUT-(this.momentumHorizontal/2)) {
                let nextSprite = "luigi_stand";
    
                if (this.momentumHorizontal > 0) {
                    switch (this.crntSprite) {
                        case "luigi_stand":
                            nextSprite = "luigi_walk1";
                            break;
                        case "luigi_walk1":
                            nextSprite = "luigi_walk2";
                            break;
                        case "luigi_walk2":
                            nextSprite = "luigi_walk3";
                            break;
                        case "luigi_walk3":
                            nextSprite = "luigi_walk1";
                            break;
                    }
                }
    
                this.crntSprite = nextSprite;
    
                this.walkFrameCount = 0;
            }
        } else {
            this.crntSprite = "luigi_stand";
        }

        // make the sprite point to the left if !this.directionRight
        let formattedSpriteName = this.crntSprite
        if (!this.directionRight) formattedSpriteName = `${formattedSpriteName}_l`;

        return formattedSpriteName;
    }
    drawSuperIfSuper(level, formattedSpriteName) {
        if (this.super) {
            CANVAS.ctx.drawImage(
                spriteSheet, 
                SPRITES[`super_${formattedSpriteName}_t`].x, 
                SPRITES[`super_${formattedSpriteName}_t`].y, 
                16, 
                16, 
                this.absolutePosition.x - level.scrollOffset, 
                this.absolutePosition.y - tileSize, 
                tileSize, 
                tileSize
            )
            CANVAS.ctx.drawImage(
                spriteSheet, 
                SPRITES[`super_${formattedSpriteName}_b`].x, 
                SPRITES[`super_${formattedSpriteName}_b`].y, 
                16, 
                16, 
                this.absolutePosition.x - level.scrollOffset, 
                this.absolutePosition.y, 
                tileSize, 
                tileSize
            )
        } else {
            CANVAS.ctx.drawImage(
                spriteSheet, 
                SPRITES[formattedSpriteName].x, 
                SPRITES[formattedSpriteName].y, 
                16, 
                16, 
                this.absolutePosition.x - level.scrollOffset, 
                this.absolutePosition.y, 
                tileSize, 
                tileSize
            )   
        }
    }
    /**
     * Compute next player sprite and draw it based on states (such as level finished or dying)
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    draw(level) {
        this.walkFrameCount++;

        // animation sequence when touching the flag pole
        if (this.finishedLevel) {
            const TIME_BEFORE_DECEND = 30;
            const POLE_REACH_OFFSET = 0.6;
            const DECEND_SPEED = 2;

            // this part is devided in animation steps: after a count max is reached or other condition is met, then continue to the next
            switch (this.finishedLevelAnimStep) {
                case 0: // stick to the pole, facing right
                    this.absolutePosition.x = (Math.floor(this.relativePosition.x) + POLE_REACH_OFFSET)*tileSize;
                    this.crntSprite = "luigi_pole1"

                    if (this.walkFrameCount > TIME_BEFORE_DECEND) {
                        this.walkFrameCount = 0;
                        this.finishedLevelAnimStep++
                    }
                    break; 
                case 1: // slide down pole, facing left
                    if (this.walkFrameCount === 1) { // for the first frame of step: reposition player so it looks nice
                        this.absolutePosition.x += tileSize * 3/4;
                        this.isPolePositionCorrected = true;
                    }

                    this.absolutePosition.y += DECEND_SPEED;

                    this.equalRel2Abs(true, true);

                    if (this.walkFrameCount%this.WALK_ANIM_SPEED == 0) {
                        if (this.crntSprite == "luigi_pole1_l") this.crntSprite = "luigi_pole2_l";
                        else this.crntSprite = "luigi_pole1_l"
                    }

                    // if ground is reached: continue to the next step
                    if (isSolid(levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1]) ||
                    isSolid(levelData[Math.ceil(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1])) {
                        
                        this.walkFrameCount = 0;
                        this.finishedLevelAnimStep++
                    }
                    break; 
                case 2: // wait at the bottom of the flag, facing left still
                    if (this.walkFrameCount > TIME_BEFORE_DECEND) {
                        this.walkFrameCount = 0;
                        this.finishedLevelAnimStep++
                    }
                    break; 
                case 3: // walking towards the castle
                    if (this.walkFrameCount === 1) {
                        this.absolutePosition.y = (this.relativePosition.y+1)*tileSize;
                        this.absolutePosition.x = (this.relativePosition.x+1)*tileSize;
                    }

                    this.absolutePosition.x++

                    this.equalRel2Abs(true, true);

                    if (this.walkFrameCount%this.WALK_ANIM_SPEED == 0) {
                        switch (this.crntSprite) {
                            case "luigi_pole1_l":
                            case "luigi_pole2_l":
                                this.crntSprite = "luigi_walk1";
                                break;
                            case "luigi_walk1":
                                this.crntSprite = "luigi_walk2";
                                break;
                            case "luigi_walk2":
                                this.crntSprite = "luigi_walk3";
                                break;
                            case "luigi_walk3":
                                this.crntSprite = "luigi_walk1";
                                break;
                        }
                    } 

                    // when black part of door is behind player: continue to the next step
                    if (levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)] === 47) {
                        this.walkFrameCount = 0;
                        this.finishedLevelAnimStep++
                    }
                    break;
                case 4: // in castle
                    if (this.walkFrameCount > TIME_BEFORE_DECEND) {
                        resetLevel("preLevel")
                    }
                    return;
            }

            CANVAS.ctx.drawImage(
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

            return;
        }
        // flash player if invincible frames are active
        else if (this.isInvincible) {
            this.invincibleCount++

            if (this.invincibleCount%this.FLASHING_INTERVAL == 0) this.invincibleFlashing = !this.invincibleFlashing;

            if (this.invincibleCount >= this.INVINCABILITY_TIME) {
                this.isInvincible = false;
                this.invincibleCount = 0;
            }

            // draw player if currently in flashing
            if (this.invincibleFlashing) this.drawSuperIfSuper(level, this.formatSprite())
        }
        // pause everything and show growing/shrinking of player
        else if (this.isChangingFormTimeout) {
            this.invincibleCount++

            if (this.invincibleCount%this.GROWING_INTERVAL == 0) this.super = !this.super;

            if (this.invincibleCount >= 5*this.GROWING_INTERVAL) {
                this.isChangingFormTimeout = false;
                this.invincibleCount = 0;
                this.isInvincible = true;

                return;
            }

            this.drawSuperIfSuper(level, "luigi_stand");
        }
        // perform special sprite logic when dying
        else if (this.dying) {
            if (this.walkFrameCount >= this.DYING_TIMEOUT) {
                this.postMortem(level);
            }

            CANVAS.ctx.drawImage(
                spriteSheet, 
                SPRITES["luigi_die"].x, 
                SPRITES["luigi_die"].y, 
                16, 
                16, 
                this.absolutePosition.x - level.scrollOffset, 
                this.absolutePosition.y, 
                tileSize, 
                tileSize
            )
        }
        // follow default logic if no other states are active
        else {
            this.drawSuperIfSuper(level, this.formatSprite())
        }
    }
    /**
     * Smoothly increase player speed until player reaches MAX_SPEED
     * @param {boolean} proposedDirection To smoothly slow down when turning quickly we need both the actual direction (this.directionRight) and the pressed direction (proposedDirection)
     */
    accelerate(proposedDirection) { // proposedDirection because accel in sharp turn player needs to slow down first
        // sharp turn: first decel, then player can accel in prosed direction
        if (this.momentumHorizontal <= 0) this.directionRight = proposedDirection;
        if (proposedDirection != this.directionRight) this.decelerate(proposedDirection);
        // add cutoff to momentum of MAX_SPEED
        if (this.keysHeld.run) {
            if (this.momentumHorizontal >= this.MAX_SPEED) this.momentumHorizontal = this.MAX_SPEED;
            else this.momentumHorizontal += this.ACCELERATION
        } else {
            if (this.momentumHorizontal >= this.WALK_SPEED) this.momentumHorizontal = this.WALK_SPEED;
            else this.momentumHorizontal += this.ACCELERATION
        }
        // add or subtract momentum to x position based on actual direction
        if (this.directionRight) this.absolutePosition.x += this.momentumHorizontal;
        else this.absolutePosition.x -= this.momentumHorizontal;
       
        this.equalRel2Abs(true, false);
    }
    /**
     * Smoothly decrease player speed until player comes to a complete standstill 
     * @param {boolean} [actualDirection=this.directionRight] To make sharp momentum changes smooth we need to know where the player is actually moving, not what is being pressed bz the player
     */
    decelerate(actualDirection=this.directionRight) { // may differ from this.directionRight is slowing for sharp turn
        this.momentumHorizontal -= this.ACCELERATION
        // add or subtract momentum to x position based on direction
        if (actualDirection) this.absolutePosition.x += this.momentumHorizontal;
        else this.absolutePosition.x -= this.momentumHorizontal;

        this.equalRel2Abs(true, false);
    }
    /**
     * Check collision of the borders and the tiles in each cardinal direction
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    collisionDetec(level, entities, player) {
        const centerBlock = levelData[Math.floor(this.relativePosition.x+0.5)][Math.floor(this.relativePosition.y)];
        if (centerBlock == 31 || centerBlock == 32 || centerBlock == 34) {
            this.finishedLevel = true;
            this.walkFrameCount = 0;
        }

        /* Borders */

        // if relative position is on first column
        if (Math.ceil(this.absolutePosition.x - level.scrollOffset) <= 0) { // needs own logic because of occasional -1 parsed into levelArray
            // stop all momentum and lock X position
            this.momentumHorizontal = 0;
            this.absolutePosition.x = level.scrollOffset;

            // if below tile is solid
            if (isSolid(levelData[0][Math.floor(this.relativePosition.y)+1])) {
                // stop all momentum and lock Y position
                this.momentumVertical = 0;
                this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;
            }

            this.equalRel2Abs(true, true);
        }
        // if last column of levelData is reached
        else if (Math.floor(this.relativePosition.x) >= levelData.length-2) {
            // stop all momentum and lock X position
            this.momentumHorizontal = 0;
            this.absolutePosition.x = (Math.floor(this.relativePosition.x))*tileSize;
            
            this.equalRel2Abs(true, false);
        }

        /* Cardinal Directions */

        // if tile above player is solid
        if (this.super && isSolid(levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)-1]) ||
            isSolid(levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)])) {
            this.momentumVertical = 0;
            this.jumpForce *= -1;
            this.isJumpClimax = true;
            this.absolutePosition.y = (Math.floor(this.relativePosition.y)+1)*tileSize;

            if (this.super) {
                level.blockHitLogic(
                    Math.round(this.relativePosition.x), 
                    Math.floor(this.relativePosition.y-1), 
                    levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)-1],
                    entities,
                    player
                )
            } else {
                level.blockHitLogic(
                    Math.round(this.relativePosition.x), 
                    Math.floor(this.relativePosition.y), 
                    levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)],
                    entities,
                    player
                )
            }
            
            this.equalRel2Abs(false, true);
        }
        else {
            // if tile to the right of player is solid
            if (isSolid(levelData[Math.floor(this.relativePosition.x)+1][Math.floor(this.relativePosition.y)])) {
                this.momentumHorizontal = 0;
                this.absolutePosition.x = (Math.floor(this.relativePosition.x))*tileSize;
                
                this.equalRel2Abs(true, false);
            }
            // if tile to the left of player is solid
            if (isSolid(levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)])) {
                this.momentumHorizontal = 0;
                this.absolutePosition.x = (Math.floor(this.relativePosition.x)+1)*tileSize;
                
                this.equalRel2Abs(true, false);
            }
            // if tile below player is solid
            if (isSolid(levelData[Math.floor(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1]) ||
            isSolid(levelData[Math.ceil(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1])) {
                if (this.timeSinceLastJump == 0 && !isSolid(levelData[Math.round(this.relativePosition.x)][Math.floor(this.relativePosition.y)+1])) return;
                
                if (this.successiveKills > 0) this.successiveKills = 0;

                this.momentumVertical = 0;
                this.absolutePosition.y = (Math.floor(this.relativePosition.y))*tileSize;

                this.timeSinceLastJump++
                this.isJumping = false;
                this.isJumpClimax = false;
                this.spaceCallCounter = 0;

                this.equalRel2Abs(false, true);
            } else {
                if (!this.isJumping) {
                    this.isJumpClimax = true;
                }
                this.timeSinceLastJump = 0;
            }
        }
    }
    /**
     * Resets tile player tile position if new tile position is solid
     */
    noClipDetec() {
        const crntTileX = Math.round(this.relativePosition.x);
        const crntTileY = Math.round(this.relativePosition.y);

        // if new player tile position is reached and the new tile is solid, reset position
        if (this.prevTile.x != crntTileX || this.prevTile.y != crntTileY) {
            if (isSolid(levelData[crntTileX][crntTileY])) {
                this.absolutePosition.x = this.prevTile.x*tileSize;
                this.absolutePosition.y = this.prevTile.y*tileSize;

                this.equalRel2Abs(true, true);
            }
            this.prevTile = { x: crntTileX, y: crntTileY};
        }
    }
    /**
     * Increases player Y position if (because of collisionDetec()) no block is in the way
     * @summary Makes the player drop and increase momentum to TERMINAL_VELOCITY
     */
    gravity() {
        // check if climax is reached or not
        if (this.timeSinceLastJump == 0 && this.jumpForce < this.TERMINAL_VELOCITY/2) this.isJumpClimax = true;
        else this.isJumpClimax = false;

        // when ascending jump, ignore gravity
        if (this.timeSinceLastJump == 0 && !this.isJumpClimax) this.momentumVertical = 0;

        // deduct jumpForce so a reverse parabula is reached
        if (this.jumpForce > 0) this.jumpForce -= this.GRAVITY;
        if (this.jumpForce < 0) this.jumpForce = 0;

        // add momentum if TERMINAL_VELOCITY is not reached
        if (this.momentumVertical >= this.TERMINAL_VELOCITY) this.momentumVertical = this.TERMINAL_VELOCITY;
        else this.momentumVertical += this.GRAVITY;

        // update position
        this.absolutePosition.y += this.momentumVertical - this.jumpForce;

        this.equalRel2Abs(false, true);
    }
    /**
     * Jump if climax is not reached yet, also make player jump higher when moving
     */
    jump() {
        if (!this.isJumpClimax) this.jumpForce = this.JUMP_POWER + Math.sqrt(Math.abs(this.momentumHorizontal/4));
    }
    /**
     * "Scroll the screen" or increase level.scrollOffset accourding to if player is in the center of the screen
     * @param {import("level.js").Level} level Level Class defined in ("level.js")
     */
    scroll(level) {
        // if last column, stop scrolling
        if (CANVAS.lastColumn + Math.floor(level.scrollOffset/tileSize) >= levelData.length-1) return;
        
        // shitty solution for a bug; screen kept moving left when past half way point of width
        if (this.momentumHorizontal < 0) return;

        level.scrollOffset += this.momentumHorizontal;
    }
    scoreAnimStart(player, score) {
        this.scoreDisplayArr.push({ 
            x: player.absolutePosition.x, 
            y: player.absolutePosition.y, 
            number: score,
            count: 0
        })
        STATS.score += score;
    }
    /**
     * Detect if player fell into the void
     */
    dieDetec() {
        if (this.absolutePosition.y > CANVAS.absHeight) this.postMortem()
    }
    /**
     * Starts the death process by setting this.dying = true and similar
     */
    dieAnimStart() {
        this.GRAVITY = 0.1
        this.jumpForce = 7;

        this.keysHeld = {
            "a": false,
            "d": false,
            "space": false
        }

        this.walkFrameCount = 0
        this.dying = true;
    }
    /**
     * Play new scenes accourding to lives count, resets Level attributes if necessary
     * @summary Adds afer death logic
     */
    postMortem() {
        this.dying = false;

        if (STATS.lives == 0) {
            resetLevel("gameOver")

            return;
        }

        STATS.lives--
        resetLevel("preLevel")
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