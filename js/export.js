/**
 * Think2x2 Export Functionality
 * Handles PNG and SVG export with proper formatting
 */

import { generateMatrix } from './matrix.js';
import { generateFilename, showToast } from './utils.js';

/**
 * Export matrix as PNG image
 * @param {Object} data - Matrix data
 * @returns {Promise<boolean>} - Success status
 */
export async function exportAsPNG(data) {
    try {
        // Generate SVG with footer
        const svgString = generateMatrix(data, true);
        
        // Create a Blob from SVG
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Load SVG into an image
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            img.onload = async () => {
                try {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size (2x for better quality)
                    const scale = 2;
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    
                    // Scale context for high quality
                    ctx.scale(scale, scale);
                    
                    // Draw white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, img.width, img.height);
                    
                    // Draw SVG image
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Create download link
                            const filename = generateFilename(data.title, 'png');
                            downloadBlob(blob, filename);
                            
                            showToast('✅ PNG exported successfully!');
                            resolve(true);
                        } else {
                            reject(new Error('Failed to create PNG blob'));
                        }
                    }, 'image/png', 1.0);
                    
                    // Clean up
                    URL.revokeObjectURL(url);
                } catch (error) {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG image'));
            };
            
            // Start loading
            img.src = url;
        });
    } catch (error) {
        console.error('PNG export error:', error);
        showToast('❌ Failed to export PNG. Please try again.');
        return false;
    }
}

/**
 * Export matrix as SVG file
 * @param {Object} data - Matrix data
 * @returns {Promise<boolean>} - Success status
 */
export async function exportAsSVG(data) {
    try {
        // Generate SVG with footer
        const svgString = generateMatrix(data, true);
        
        // Add XML declaration and DOCTYPE
        const fullSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgString}`;
        
        // Create blob
        const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
        
        // Download
        const filename = generateFilename(data.title, 'svg');
        downloadBlob(blob, filename);
        
        showToast('✅ SVG exported successfully!');
        return true;
    } catch (error) {
        console.error('SVG export error:', error);
        showToast('❌ Failed to export SVG. Please try again.');
        return false;
    }
}

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Desired filename
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Check if browser supports export features
 * @returns {Object} - Support status for PNG and SVG
 */
export function checkExportSupport() {
    const canvas = document.createElement('canvas');
    const hasCanvas = !!canvas.getContext;
    const hasBlob = typeof Blob !== 'undefined';
    const hasToBlob = typeof canvas.toBlob === 'function';
    const hasDownload = 'download' in document.createElement('a');
    
    return {
        png: hasCanvas && hasBlob && hasToBlob && hasDownload,
        svg: hasBlob && hasDownload
    };
}

/**
 * Export preview (for testing without download)
 * Returns base64 encoded image data
 * @param {Object} data - Matrix data
 * @param {string} format - 'png' or 'svg'
 * @returns {Promise<string>} - Base64 data URL
 */
export async function exportAsDataURL(data, format = 'png') {
    if (format === 'svg') {
        const svgString = generateMatrix(data, true);
        const base64 = btoa(unescape(encodeURIComponent(svgString)));
        return `data:image/svg+xml;base64,${base64}`;
    }
    
    // PNG
    const svgString = generateMatrix(data, true);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            
            ctx.scale(2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, img.width, img.height);
            ctx.drawImage(img, 0, 0);
            
            const dataURL = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(dataURL);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to generate image'));
        };
        
        img.src = url;
    });
}

/**
 * Batch export multiple formats
 * @param {Object} data - Matrix data
 * @param {Array<string>} formats - Array of formats ['png', 'svg']
 * @returns {Promise<Object>} - Results for each format
 */
export async function batchExport(data, formats = ['png', 'svg']) {
    const results = {};
    
    for (const format of formats) {
        try {
            if (format === 'png') {
                results.png = await exportAsPNG(data);
            } else if (format === 'svg') {
                results.svg = await exportAsSVG(data);
            }
        } catch (error) {
            results[format] = false;
            console.error(`Failed to export ${format}:`, error);
        }
    }
    
    return results;
}

/**
 * Get estimated file size for export
 * @param {Object} data - Matrix data
 * @param {string} format - 'png' or 'svg'
 * @returns {string} - Estimated size string (e.g., "~250 KB")
 */
export function getEstimatedSize(data, format) {
    const svgString = generateMatrix(data, true);
    const svgSize = new Blob([svgString]).size;
    
    if (format === 'svg') {
        return formatBytes(svgSize);
    }
    
    // PNG is typically 3-5x larger than SVG
    const estimatedPngSize = svgSize * 4;
    return `~${formatBytes(estimatedPngSize)}`;
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string
 */
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate data before export
 * @param {Object} data - Matrix data
 * @returns {Object} - Validation result
 */
export function validateExportData(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required for export');
    }
    
    if (!data.xAxisName || data.xAxisName.trim().length === 0) {
        errors.push('X-axis name is required');
    }
    
    if (!data.yAxisName || data.yAxisName.trim().length === 0) {
        errors.push('Y-axis name is required');
    }
    
    if (!data.dataPoints || data.dataPoints.length === 0) {
        errors.push('At least one data point is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Export with validation
 * @param {Object} data - Matrix data
 * @param {string} format - Export format
 * @returns {Promise<boolean>} - Success status
 */
export async function exportWithValidation(data, format) {
    // Validate data
    const validation = validateExportData(data);
    
    if (!validation.isValid) {
        showToast(`❌ Cannot export: ${validation.errors[0]}`);
        return false;
    }
    
    // Check browser support
    const support = checkExportSupport();
    
    if (format === 'png' && !support.png) {
        showToast('❌ Your browser does not support PNG export');
        return false;
    }
    
    if (format === 'svg' && !support.svg) {
        showToast('❌ Your browser does not support SVG export');
        return false;
    }
    
    // Perform export
    if (format === 'png') {
        return await exportAsPNG(data);
    } else if (format === 'svg') {
        return await exportAsSVG(data);
    }
    
    return false;
}

/**
 * Copy SVG to clipboard
 * @param {Object} data - Matrix data
 * @returns {Promise<boolean>} - Success status
 */
export async function copySVGToClipboard(data) {
    try {
        const svgString = generateMatrix(data, false);
        
        if (navigator.clipboard && window.ClipboardItem) {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const item = new ClipboardItem({ 'image/svg+xml': blob });
            await navigator.clipboard.write([item]);
            showToast('✅ SVG copied to clipboard!');
            return true;
        } else {
            // Fallback: copy as text
            await navigator.clipboard.writeText(svgString);
            showToast('✅ SVG code copied to clipboard!');
            return true;
        }
    } catch (error) {
        console.error('Failed to copy SVG:', error);
        showToast('❌ Failed to copy SVG');
        return false;
    }
}

/**
 * Print matrix
 * @param {Object} data - Matrix data
 */
export function printMatrix(data) {
    try {
        const svgString = generateMatrix(data, true);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print - ${data.title}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    svg {
                        max-width: 100%;
                        height: auto;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${svgString}
                <script>
                    window.onload = () => {
                        window.print();
                        window.onafterprint = () => window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        console.error('Print error:', error);
        showToast('❌ Failed to print');
    }
}
