/**
 * Raphael watermark detection module
 * Detects raphael.app watermark in images
 */

/**
 * Detect if image contains Raphael watermark
 * @param {ImageData} imageData - Image data to analyze
 * @returns {Object|null} Detection result with position and confidence, or null if not detected
 */
export function detectRaphaelWatermark(imageData) {
    const { width, height, data } = imageData;
    
    // Raphael watermark is typically in bottom-right corner
    // Estimated size: ~100x25 pixels (text "raphael.app")
    const searchWidth = Math.min(150, Math.floor(width * 0.2));
    const searchHeight = Math.min(50, Math.floor(height * 0.1));
    
    const searchX = width - searchWidth;
    const searchY = height - searchHeight;
    
    // Analyze the bottom-right region
    const region = extractRegion(imageData, searchX, searchY, searchWidth, searchHeight);
    
    // Check for white/light text pattern
    const hasLightText = detectLightTextPattern(region);
    
    if (!hasLightText) {
        return null;
    }
    
    // Try to locate exact watermark bounds
    const bounds = findWatermarkBounds(imageData, searchX, searchY, searchWidth, searchHeight);
    
    if (!bounds) {
        return null;
    }
    
    return {
        type: 'raphael',
        position: bounds,
        confidence: bounds.confidence,
        detected: true
    };
}

/**
 * Extract a region from image data
 */
function extractRegion(imageData, x, y, width, height) {
    const { width: imgWidth, data } = imageData;
    const region = new Uint8ClampedArray(width * height * 4);
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const srcIdx = ((y + row) * imgWidth + (x + col)) * 4;
            const dstIdx = (row * width + col) * 4;
            
            region[dstIdx] = data[srcIdx];
            region[dstIdx + 1] = data[srcIdx + 1];
            region[dstIdx + 2] = data[srcIdx + 2];
            region[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return { data: region, width, height };
}

/**
 * Detect light text pattern (white/light colored text)
 */
function detectLightTextPattern(region) {
    const { data, width, height } = region;
    let lightPixelCount = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel is light (close to white)
        const brightness = (r + g + b) / 3;
        if (brightness > 200) {
            lightPixelCount++;
        }
        totalPixels++;
    }
    
    const lightRatio = lightPixelCount / totalPixels;
    
    // If 5-30% of pixels are light, likely contains text watermark
    return lightRatio > 0.05 && lightRatio < 0.3;
}

/**
 * Find exact watermark bounds
 */
function findWatermarkBounds(imageData, searchX, searchY, searchWidth, searchHeight) {
    const { width: imgWidth, data } = imageData;
    
    let minX = searchWidth;
    let minY = searchHeight;
    let maxX = 0;
    let maxY = 0;
    let lightPixelCount = 0;
    
    // Find bounding box of light pixels
    for (let row = 0; row < searchHeight; row++) {
        for (let col = 0; col < searchWidth; col++) {
            const idx = ((searchY + row) * imgWidth + (searchX + col)) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const brightness = (r + g + b) / 3;
            if (brightness > 200) {
                minX = Math.min(minX, col);
                minY = Math.min(minY, row);
                maxX = Math.max(maxX, col);
                maxY = Math.max(maxY, row);
                lightPixelCount++;
            }
        }
    }
    
    if (lightPixelCount < 100) {
        return null; // Too few light pixels
    }
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    // Validate dimensions (Raphael watermark should be roughly 80-120px wide, 20-30px tall)
    if (width < 60 || width > 150 || height < 15 || height > 40) {
        return null;
    }
    
    // Calculate confidence based on aspect ratio
    const aspectRatio = width / height;
    const expectedAspectRatio = 4; // "raphael.app" is roughly 4:1
    const aspectDiff = Math.abs(aspectRatio - expectedAspectRatio);
    const confidence = Math.max(0, 1 - aspectDiff / 2);
    
    if (confidence < 0.5) {
        return null;
    }
    
    return {
        x: searchX + minX,
        y: searchY + minY,
        width,
        height,
        confidence
    };
}

/**
 * Get default Raphael watermark configuration
 * Used when automatic detection fails
 */
export function getDefaultRaphaelConfig(imageWidth, imageHeight) {
    // Default configuration based on typical Raphael watermark
    const logoWidth = 100;
    const logoHeight = 25;
    const marginRight = 15;
    const marginBottom = 15;
    
    return {
        type: 'raphael',
        logoWidth,
        logoHeight,
        marginRight,
        marginBottom,
        position: {
            x: imageWidth - marginRight - logoWidth,
            y: imageHeight - marginBottom - logoHeight,
            width: logoWidth,
            height: logoHeight
        }
    };
}
