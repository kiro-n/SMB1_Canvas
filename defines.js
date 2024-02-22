/**
 * The pixel size (both width and height) of one tile
 * @type {number}
 */
export const tileSize = 20;


/**
 * Canvas DOM element
 */
export const canvas = document.querySelector("canvas");
/**
 * Canvas 2d context
 */
export const ctx = canvas.getContext("2d");

/**
 * Pixel width of the canvas
 * @type {number}
 */
export const absWidth = canvas.width;
/**
 * Pixel height of the canvas
 * @type {number}
 */
export const absHeight = canvas.height;

/**
 * Amount of columns (for the tiles) present/loaded on the canvas
 * @type {number}
 * @alias loadedColumns
 */
export const lastColumn = Math.floor(absWidth/tileSize);
/**
 * Amount of rows (for the tiles) present/loaded on the canvas
 * @type {number}
 * @alias loadedRows
 */
export const lastRow = Math.floor(absHeight/tileSize);

/**
 * Object containing all needed canvas data
 */
export const CANVAS = {
    canvas: canvas,
    ctx: ctx,
    absWidth: absWidth,
    absHeight: absHeight,
    lastColumn: lastColumn,
    lastRow: lastRow
};


/**
 * Object activating debug options
 * @example
 * {
 * "showTileBorder": true, // displays a grid of tiling position
 * "showPlayerTilePosition": true, // shows purple player position
 * "showFPS": true // shows FPS counter in the top left
 * }
 */
export const DEBUG = {
    "showTileBorder": false,
    "showPlayerTilePosition": false,
    "showFPS": true
};