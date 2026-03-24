/**
 * Raphael watermark engine
 * Main processing engine for Raphael watermark removal
 */

import { detectRaphaelWatermark, getDefaultRaphaelConfig } from './raphaelWatermarkDetector.js';
import { removeRaphaelWatermark, removeRaphaelWatermarkMultiPass, detectWatermarkColor } from './raphaelBlendModes.js';
import { extractAlphaMap, refineAlphaMap } from './raphaelAlphaExtractor.js';

function createRuntimeCanvas(width, height) {
    // Prefer document.createElement for browser compatibility
    // (OffscreenCanvas doesn't have toDataURL method)
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height);
    }
    
    throw new Error('Canvas runtime not available');
}

function getCanvasContext2D(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error('Failed to get 2D canvas context');
    }
    return ctx;
}

/**
 * Raphael watermark engine class
 */
export class RaphaelWatermarkEngine {
    constructor() {
        this.alphaMaps = new Map();
    }
    
    static async create() {
        return new RaphaelWatermarkEngine();
    }
    
    /**
     * Remove Raphael watermark from image
     * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
     * @param {Object} options - Processing options
     * @param {boolean} options.autoDetect - Auto-detect watermark position (default: true)
     * @param {Object} options.position - Manual position override
     * @param {number} options.watermarkColor - Watermark color (default: auto-detect)
     * @param {boolean} options.multiPass - Use multi-pass removal (default: true)
     * @param {number} options.maxPasses - Maximum passes for multi-pass (default: 3)
     * @param {Float32Array} options.alphaMap - Pre-computed alpha map (optional)
     * @returns {Promise<HTMLCanvasElement>} Processed canvas
     */
    async removeWatermarkFromImage(image, options = {}) {
        const canvas = createRuntimeCanvas(image.width, image.height);
        const ctx = getCanvasContext2D(canvas);
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Detect watermark
        let detection = null;
        let position = null;
        
        if (options.autoDetect !== false) {
            detection = detectRaphaelWatermark(imageData);
            if (detection && detection.detected) {
                position = detection.position;
            }
        }
        
        // Use manual position if provided or detection failed
        if (!position && options.position) {
            position = options.position;
        }
        
        // Fallback to default config
        if (!position) {
            const config = getDefaultRaphaelConfig(image.width, image.height);
            position = config.position;
        }
        
        // Get or compute alpha map
        let alphaMap = options.alphaMap;
        
        if (!alphaMap) {
            // Try to get cached alpha map
            const cacheKey = `${position.width}x${position.height}`;
            alphaMap = this.alphaMaps.get(cacheKey);
            
            if (!alphaMap) {
                // Extract alpha map from current image
                // This assumes the background is relatively dark
                alphaMap = extractAlphaMap(imageData, position, {
                    backgroundColor: 0,
                    watermarkColor: 255
                });
                
                // Refine the alpha map
                alphaMap = refineAlphaMap(alphaMap, position.width, position.height, {
                    noiseThreshold: 0.05,
                    smoothing: false
                });
                
                // Cache it
                this.alphaMaps.set(cacheKey, alphaMap);
            }
        }
        
        // Detect watermark color if not provided
        let watermarkColor = options.watermarkColor;
        if (watermarkColor === undefined) {
            watermarkColor = detectWatermarkColor(imageData, position);
        }
        
        // Remove watermark
        if (options.multiPass !== false) {
            removeRaphaelWatermarkMultiPass(imageData, alphaMap, position, {
                watermarkColor,
                maxPasses: options.maxPasses ?? 3
            });
        } else {
            removeRaphaelWatermark(imageData, alphaMap, position, {
                watermarkColor,
                alphaGain: options.alphaGain ?? 1
            });
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0);
        
        // Store metadata
        canvas.__watermarkMeta = {
            type: 'raphael',
            position,
            detection,
            watermarkColor,
            processed: true
        };
        
        return canvas;
    }
    
    /**
     * Set pre-computed alpha map for specific size
     * @param {number} width - Watermark width
     * @param {number} height - Watermark height
     * @param {Float32Array} alphaMap - Alpha map data
     */
    setAlphaMap(width, height, alphaMap) {
        const cacheKey = `${width}x${height}`;
        this.alphaMaps.set(cacheKey, alphaMap);
    }
    
    /**
     * Get watermark information
     * @param {number} imageWidth - Image width
     * @param {number} imageHeight - Image height
     * @returns {Object} Watermark information
     */
    getWatermarkInfo(imageWidth, imageHeight) {
        const config = getDefaultRaphaelConfig(imageWidth, imageHeight);
        return {
            type: 'raphael',
            position: config.position,
            config
        };
    }
}
