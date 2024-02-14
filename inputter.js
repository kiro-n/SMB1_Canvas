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
        case "a": player.keysHeld.a = isHeld; break;
        case "d": player.keysHeld.d = isHeld; break;
        case " ": player.keysHeld.space = isHeld; break;
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
        
            // jump when pressing space
            if (player.keysHeld.space) player.jump();
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