/**
 * Raphael watermark blend modes
 * Handles removal of Raphael watermarks using reverse alpha blending
 */

const ALPHA_NOISE_FLOOR = 3 / 255;
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;

/**
 * Remove Raphael watermark using reverse alpha blending
 * @param {ImageData} imageData - Image data to process (modified in place)
 * @param {Float32Array} alphaMap - Alpha channel data
 * @param {Object} position - Watermark position {x, y, width, height}
 * @param {Object} options - Processing options
 * @param {number} options.watermarkColor - Watermark color (default: 255 for white)
 * @param {number} options.alphaGain - Alpha gain multiplier (default: 1)
 */
export function removeRaphaelWatermark(imageData, alphaMap, position, options = {}) {
    const { x, y, width, height } = position;
    const watermarkColor = options.watermarkColor ?? 255;
    const alphaGain = Number.isFinite(options.alphaGain) && options.alphaGain > 0
        ? options.alphaGain
        : 1;
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
            const alphaIdx = row * width + col;
            
            const rawAlpha = alphaMap[alphaIdx];
            
            // Remove low-level noise
            const signalAlpha = Math.max(0, rawAlpha - ALPHA_NOISE_FLOOR) * alphaGain;
            
            if (signalAlpha < ALPHA_THRESHOLD) {
                continue;
            }
            
            const alpha = Math.min(rawAlpha * alphaGain, MAX_ALPHA);
            const oneMinusAlpha = 1.0 - alpha;
            
            // Apply reverse alpha blending to each RGB channel
            for (let c = 0; c < 3; c++) {
                const watermarked = imageData.data[imgIdx + c];
                
                // Reverse formula: original = (watermarked - α × watermark) / (1 - α)
                const original = (watermarked - alpha * watermarkColor) / oneMinusAlpha;
                
                imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
            }
        }
    }
}

/**
 * Detect watermark color from the watermarked region
 * Useful when watermark color is unknown
 */
export function detectWatermarkColor(imageData, position) {
    const { x, y, width, height } = position;
    const { data, width: imgWidth } = imageData;
    
    let maxBrightness = 0;
    let colorSum = { r: 0, g: 0, b: 0 };
    let brightPixelCount = 0;
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = ((y + row) * imgWidth + (x + col)) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const brightness = (r + g + b) / 3;
            
            if (brightness > 200) {
                colorSum.r += r;
                colorSum.g += g;
                colorSum.b += b;
                brightPixelCount++;
                maxBrightness = Math.max(maxBrightness, brightness);
            }
        }
    }
    
    if (brightPixelCount === 0) {
        return 255; // Default to white
    }
    
    // Average color of bright pixels
    const avgColor = {
        r: colorSum.r / brightPixelCount,
        g: colorSum.g / brightPixelCount,
        b: colorSum.b / brightPixelCount
    };
    
    // Return average brightness as watermark color
    return (avgColor.r + avgColor.g + avgColor.b) / 3;
}

/**
 * Multi-pass removal for stubborn watermarks
 */
export function removeRaphaelWatermarkMultiPass(imageData, alphaMap, position, options = {}) {
    const maxPasses = options.maxPasses ?? 3;
    const watermarkColor = options.watermarkColor ?? 255;
    
    let currentImageData = imageData;
    
    for (let pass = 0; pass < maxPasses; pass++) {
        // Detect remaining watermark strength
        const remainingStrength = detectRemainingWatermark(currentImageData, position);
        
        if (remainingStrength < 0.1) {
            break; // Watermark sufficiently removed
        }
        
        // Apply removal with adjusted alpha gain
        const alphaGain = 1 + (pass * 0.2);
        removeRaphaelWatermark(currentImageData, alphaMap, position, {
            watermarkColor,
            alphaGain
        });
    }
    
    return currentImageData;
}

/**
 * Detect remaining watermark strength after removal
 */
function detectRemainingWatermark(imageData, position) {
    const { x, y, width, height } = position;
    const { data, width: imgWidth } = imageData;
    
    let brightPixelCount = 0;
    let totalPixels = 0;
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = ((y + row) * imgWidth + (x + col)) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const brightness = (r + g + b) / 3;
            
            if (brightness > 200) {
                brightPixelCount++;
            }
            totalPixels++;
        }
    }
    
    return brightPixelCount / totalPixels;
}
