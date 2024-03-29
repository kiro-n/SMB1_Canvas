import { changeLevelData, toggleDebug } from "./main.js";

/**
 * Event listener function that cannot, as typically done in this project, be an anonymous function because of removeEventListener()
 * @param {EventListener} e Default Event Listener Object
 */
function keyDownLogic(e) { bindInput2Held(e, player, true); }
/**
 * Event listener function that cannot, as typically done in this project, be an anonymous function because of removeEventListener()
 * @param {EventListener} e Default Event Listener Object
 */
function keyUpLogic(e) { bindInput2Held(e, player, false); }

let actualInvinceTime = 80;

/**
 * Binding logic for key presses and player.keysHeld
 * 
 * Called by keyDownLogic() & keyUpLogic()
 * @param {EventListener} e Default Event Listener Object
 * @param {import("player.js").Player} player Player Class defined in ("main.js")
 * @param {boolean} isHeld Wether to set the pressed key to true or false
 */
function bindInput2Held(e, player, isHeld) {
    switch (e.key) {
        case "ArrowLeft": player.keysHeld.a = isHeld; break;
        case "ArrowRight": player.keysHeld.d = isHeld; break;
        case "x": player.keysHeld.run = isHeld; break;
        case "a": player.keysHeld.space = isHeld; if (player.timeSinceLastJump == 0) { player.isJumping = true; } break;
        
        case "5": 
            if (!isHeld) changeLevelData("1-TEST"); 
            break;
        case "u":
            if (!isHeld) toggleDebug("showTileBorder"); 
            break;
        case "i":
            if (!isHeld) toggleDebug("showPlayerTilePosition"); 
            break;
        case "o":
            if (!isHeld) toggleDebug("showFPS"); 
            break;
        case "p":
            if (!isHeld) toggleDebug("showSpedometer"); 
            break;
        case "Backspace":
            if (!isHeld) {
                if (player.isInvincible) {
                    player.INVINCABILITY_TIME = actualInvinceTime;
                    player.isInvincible = false;
                } else {
                    actualInvinceTime = player.INVINCABILITY_TIME
                    player.INVINCABILITY_TIME = 1000000;
                    player.isInvincible = true;
                }  
            } 
            break;
    }
}

let player;
export class Inputter {
    constructor() {
        /**
         * Indicates wether to ignore input or not
         * @type {boolean}
         */
        this.dying = true
    }
    /**
     * Bind actions to keys pressed
     * @param {import("player.js").Player} player Player Class defined in ("main.js")
     */
    checkInput() {
        if (!this.dying) {
            // edge case: both left and right held at the same time
            if (player.keysHeld.a && player.keysHeld.d) {
                if (player.momentumHorizontal > 0 && player.directionRight) player.decelerate(true); 
                if (player.momentumHorizontal > 0 && !player.directionRight) player.decelerate(false); 
                return;
            }
        
            // dealing with acceleration
            if (player.keysHeld.a) player.accelerate(false);
            else if (player.keysHeld.d) player.accelerate(true);

            // dealing with deceleration
            if (!player.keysHeld.d && player.momentumHorizontal > 0 && player.directionRight) player.decelerate(true);
            else if (!player.keysHeld.a && player.momentumHorizontal > 0 && !player.directionRight) player.decelerate(false);
        
            // cap amount that jump() can be called so player cant jump infinitely
            if (player.keysHeld.space) { 
                player.spaceCallCounter++
                if (player.spaceCallCounter < player.MAX_SPACE_CALLS && !player.isJumping) player.jump();
            }
        }
    }
    /**
     * Adds according keydown/keyup event listeners.
     * 
     * Calling this muliple times will not break the inputter but it will decrease performance!
     * @param {import("player.js").Player} newPlayer Player Class defined in ("main.js")
     */
    setUpListeners(newPlayer) {
        player = newPlayer;
        this.dying = false;

        document.addEventListener("keydown", keyDownLogic)
        document.addEventListener("keyup", keyUpLogic)
    }
    disableInput() {
        document.removeEventListener("keydown", keyDownLogic)
        document.removeEventListener("keyup", keyUpLogic)
    }
}