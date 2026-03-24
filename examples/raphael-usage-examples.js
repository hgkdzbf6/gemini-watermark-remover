/**
 * Example usage of Raphael watermark remover
 * This script demonstrates how to use the Raphael watermark removal functionality
 */

import { RaphaelWatermarkEngine } from '../src/core/raphael/raphaelWatermarkEngine.js';
import { extractAlphaMap, alphaMapToBase64, visualizeAlphaMap } from '../src/core/raphael/raphaelAlphaExtractor.js';
import { detectRaphaelWatermark } from '../src/core/raphael/raphaelWatermarkDetector.js';

/**
 * Example 1: Basic usage - Remove watermark from an image
 */
async function example1_basicUsage() {
  console.log('Example 1: Basic watermark removal');
  
  // Assume we have an image element
  const image = document.getElementById('myImage');
  
  // Create engine
  const engine = await RaphaelWatermarkEngine.create();
  
  // Process image with default settings
  const processedCanvas = await engine.removeWatermarkFromImage(image);
  
  // Display result
  document.body.appendChild(processedCanvas);
  
  console.log('Watermark removed successfully!');
}

/**
 * Example 2: Auto-detection with custom options
 */
async function example2_customOptions() {
  console.log('Example 2: Custom processing options');
  
  const image = document.getElementById('myImage');
  const engine = await RaphaelWatermarkEngine.create();
  
  const processedCanvas = await engine.removeWatermarkFromImage(image, {
    autoDetect: true,      // Auto-detect watermark position
    multiPass: true,       // Use multi-pass removal for better results
    maxPasses: 3,         // Maximum 3 passes
    watermarkColor: 255   // White watermark
  });
  
  // Get processing metadata
  const meta = processedCanvas.__watermarkMeta;
  console.log('Processing metadata:', meta);
  console.log('Watermark position:', meta.position);
  console.log('Detection confidence:', meta.detection?.confidence);
  
  return processedCanvas;
}

/**
 * Example 3: Manual position specification
 */
async function example3_manualPosition() {
  console.log('Example 3: Manual position specification');
  
  const image = document.getElementById('myImage');
  const engine = await RaphaelWatermarkEngine.create();
  
  // Manually specify watermark position
  const processedCanvas = await engine.removeWatermarkFromImage(image, {
    autoDetect: false,
    position: {
      x: 1800,  // X coordinate
      y: 1050,  // Y coordinate
      width: 100,  // Width
      height: 25   // Height
    },
    multiPass: true
  });
  
  return processedCanvas;
}

/**
 * Example 4: Extract and save alpha map
 */
async function example4_extractAlphaMap() {
  console.log('Example 4: Extract alpha map from sample image');
  
  const image = document.getElementById('sampleImage');
  
  // First, load the image into a canvas
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Detect watermark position
  const detection = detectRaphaelWatermark(imageData);
  
  if (!detection || !detection.detected) {
    console.error('Watermark not detected');
    return;
  }
  
  console.log('Watermark detected at:', detection.position);
  
  // Extract alpha map
  const alphaMap = extractAlphaMap(imageData, detection.position, {
    backgroundColor: 0,    // Black background
    watermarkColor: 255   // White watermark
  });
  
  // Convert to base64 for embedding
  const base64 = alphaMapToBase64(alphaMap);
  console.log('Alpha map (base64):', base64.substring(0, 100) + '...');
  
  // Visualize alpha map
  const alphaCanvas = visualizeAlphaMap(
    alphaMap, 
    detection.position.width, 
    detection.position.height
  );
  document.body.appendChild(alphaCanvas);
  
  return alphaMap;
}

/**
 * Example 5: Batch processing multiple images
 */
async function example5_batchProcessing() {
  console.log('Example 5: Batch processing');
  
  const images = document.querySelectorAll('.watermarked-image');
  const engine = await RaphaelWatermarkEngine.create();
  
  const results = [];
  
  for (const image of images) {
    try {
      const processedCanvas = await engine.removeWatermarkFromImage(image, {
        autoDetect: true,
        multiPass: true
      });
      
      results.push({
        original: image,
        processed: processedCanvas,
        success: true
      });
      
      console.log(`Processed image ${results.length}/${images.length}`);
    } catch (error) {
      console.error('Error processing image:', error);
      results.push({
        original: image,
        processed: null,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log(`Batch processing complete: ${results.filter(r => r.success).length}/${results.length} successful`);
  return results;
}

/**
 * Example 6: Download processed image
 */
async function example6_downloadImage() {
  console.log('Example 6: Download processed image');
  
  const image = document.getElementById('myImage');
  const engine = await RaphaelWatermarkEngine.create();
  
  const processedCanvas = await engine.removeWatermarkFromImage(image);
  
  // Convert to blob and download
  processedCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raphael-watermark-removed.png';
    a.click();
    URL.revokeObjectURL(url);
    console.log('Image downloaded');
  });
}

/**
 * Example 7: Compare before and after
 */
async function example7_compareBeforeAfter() {
  console.log('Example 7: Side-by-side comparison');
  
  const image = document.getElementById('myImage');
  const engine = await RaphaelWatermarkEngine.create();
  
  const processedCanvas = await engine.removeWatermarkFromImage(image);
  
  // Create comparison container
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';
  
  // Original
  const originalDiv = document.createElement('div');
  originalDiv.innerHTML = '<h3>Original</h3>';
  originalDiv.appendChild(image.cloneNode());
  
  // Processed
  const processedDiv = document.createElement('div');
  processedDiv.innerHTML = '<h3>Processed</h3>';
  processedDiv.appendChild(processedCanvas);
  
  container.appendChild(originalDiv);
  container.appendChild(processedDiv);
  document.body.appendChild(container);
}

/**
 * Example 8: Use pre-computed alpha map
 */
async function example8_precomputedAlphaMap() {
  console.log('Example 8: Using pre-computed alpha map');
  
  const engine = await RaphaelWatermarkEngine.create();
  
  // Assume we have a pre-computed alpha map (100x25)
  const precomputedAlphaMap = new Float32Array(100 * 25);
  // ... fill with actual data ...
  
  // Set the alpha map
  engine.setAlphaMap(100, 25, precomputedAlphaMap);
  
  // Now process images - will use the pre-computed alpha map
  const image = document.getElementById('myImage');
  const processedCanvas = await engine.removeWatermarkFromImage(image, {
    alphaMap: precomputedAlphaMap
  });
  
  return processedCanvas;
}

// Export examples
export {
  example1_basicUsage,
  example2_customOptions,
  example3_manualPosition,
  example4_extractAlphaMap,
  example5_batchProcessing,
  example6_downloadImage,
  example7_compareBeforeAfter,
  example8_precomputedAlphaMap
};

// If running in browser console, attach to window
if (typeof window !== 'undefined') {
  window.raphaelExamples = {
    example1_basicUsage,
    example2_customOptions,
    example3_manualPosition,
    example4_extractAlphaMap,
    example5_batchProcessing,
    example6_downloadImage,
    example7_compareBeforeAfter,
    example8_precomputedAlphaMap
  };
  
  console.log('Raphael watermark remover examples loaded!');
  console.log('Run examples using: window.raphaelExamples.example1_basicUsage()');
}
