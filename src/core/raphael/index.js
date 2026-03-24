/**
 * Raphael watermark remover - Main entry point
 * Exports all Raphael watermark removal functionality
 */

export { RaphaelWatermarkEngine } from './raphaelWatermarkEngine.js';
export { detectRaphaelWatermark, getDefaultRaphaelConfig } from './raphaelWatermarkDetector.js';
export { 
    extractAlphaMap, 
    extractAlphaMapFromSamples, 
    refineAlphaMap,
    alphaMapToBase64,
    visualizeAlphaMap 
} from './raphaelAlphaExtractor.js';
export { 
    removeRaphaelWatermark as removeRaphaelWatermarkDirect, 
    removeRaphaelWatermarkMultiPass,
    detectWatermarkColor 
} from './raphaelBlendModes.js';

/**
 * Quick API for removing Raphael watermark from an image
 * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
 * @param {Object} options - Processing options
 * @returns {Promise<HTMLCanvasElement>} Processed canvas
 */
export async function removeRaphaelWatermark(image, options = {}) {
    const engine = await RaphaelWatermarkEngine.create();
    return engine.removeWatermarkFromImage(image, options);
}
