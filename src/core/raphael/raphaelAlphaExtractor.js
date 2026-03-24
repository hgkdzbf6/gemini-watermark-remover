/**
 * Raphael watermark alpha map extractor
 * Extracts alpha channel from watermarked images
 */

/**
 * Extract alpha map from a watermarked image with known background
 * @param {ImageData} watermarkedImage - Image with watermark
 * @param {Object} position - Watermark position {x, y, width, height}
 * @param {Object} options - Extraction options
 * @param {number} options.backgroundColor - Known background color (0-255)
 * @param {number} options.watermarkColor - Watermark color (default: 255 for white)
 * @returns {Float32Array} Alpha map
 */
export function extractAlphaMap(watermarkedImage, position, options = {}) {
    const { x, y, width, height } = position;
    const { backgroundColor = 0, watermarkColor = 255 } = options;
    
    const alphaMap = new Float32Array(width * height);
    const { data, width: imgWidth } = watermarkedImage;
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imgWidth + (x + col)) * 4;
            const alphaIdx = row * width + col;
            
            // Get RGB values
            const r = data[imgIdx];
            const g = data[imgIdx + 1];
            const b = data[imgIdx + 2];
            
            // Calculate average brightness
            const brightness = (r + g + b) / 3;
            
            // Calculate alpha using formula: brightness = α × watermark + (1 - α) × background
            // Solving for α: α = (brightness - background) / (watermark - background)
            let alpha = (brightness - backgroundColor) / (watermarkColor - backgroundColor);
            
            // Clamp to [0, 1]
            alpha = Math.max(0, Math.min(1, alpha));
            
            alphaMap[alphaIdx] = alpha;
        }
    }
    
    return alphaMap;
}

/**
 * Extract alpha map from multiple sample images and average them
 * This improves accuracy by reducing noise
 */
export function extractAlphaMapFromSamples(samples, position, options = {}) {
    if (samples.length === 0) {
        throw new Error('At least one sample image is required');
    }
    
    if (samples.length === 1) {
        return extractAlphaMap(samples[0], position, options);
    }
    
    const { width, height } = position;
    const alphaMap = new Float32Array(width * height);
    
    // Extract alpha from each sample
    const alphaMaps = samples.map(sample => 
        extractAlphaMap(sample, position, options)
    );
    
    // Average the alpha values
    for (let i = 0; i < alphaMap.length; i++) {
        let sum = 0;
        for (const map of alphaMaps) {
            sum += map[i];
        }
        alphaMap[i] = sum / alphaMaps.length;
    }
    
    return alphaMap;
}

/**
 * Refine alpha map by removing noise and smoothing
 */
export function refineAlphaMap(alphaMap, width, height, options = {}) {
    const { noiseThreshold = 0.05, smoothing = false } = options;
    
    const refined = new Float32Array(alphaMap.length);
    
    for (let i = 0; i < alphaMap.length; i++) {
        let alpha = alphaMap[i];
        
        // Remove low-level noise
        if (alpha < noiseThreshold) {
            alpha = 0;
        }
        
        refined[i] = alpha;
    }
    
    if (smoothing) {
        return applyGaussianSmoothing(refined, width, height);
    }
    
    return refined;
}

/**
 * Apply Gaussian smoothing to alpha map
 */
function applyGaussianSmoothing(alphaMap, width, height) {
    const smoothed = new Float32Array(alphaMap.length);
    const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ];
    const kernelSum = 16;
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            let sum = 0;
            let count = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const ny = row + ky;
                    const nx = col + kx;
                    
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const idx = ny * width + nx;
                        sum += alphaMap[idx] * kernel[ky + 1][kx + 1];
                        count += kernel[ky + 1][kx + 1];
                    }
                }
            }
            
            const idx = row * width + col;
            smoothed[idx] = sum / count;
        }
    }
    
    return smoothed;
}

/**
 * Convert alpha map to base64 string for embedding
 */
export function alphaMapToBase64(alphaMap) {
    const bytes = new Uint8Array(alphaMap.buffer);
    
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(bytes).toString('base64');
    }
    
    if (typeof btoa !== 'undefined') {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    throw new Error('No base64 encoder available');
}

/**
 * Create a visualization of the alpha map for debugging
 */
export function visualizeAlphaMap(alphaMap, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    
    for (let i = 0; i < alphaMap.length; i++) {
        const alpha = alphaMap[i];
        const value = Math.round(alpha * 255);
        
        imageData.data[i * 4] = value;
        imageData.data[i * 4 + 1] = value;
        imageData.data[i * 4 + 2] = value;
        imageData.data[i * 4 + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
