/**
 * Think2x2 Share & State Management
 * Handles URL encoding/decoding and shareable links
 */

import { copyToClipboard, showToast, log } from './utils.js';

/**
 * Encode matrix state to URL-safe string
 * Uses Base64 encoding with URL-safe characters
 * @param {Object} data - Matrix data to encode
 * @returns {string} - Encoded string
 */
export function encodeState(data) {
    try {
        // Create state object with only necessary data
        const state = {
            v: 1, // Version number for future compatibility
            t: data.title || '',
            s: data.subtitle || '',
            x: data.xAxisName || '',
            y: data.yAxisName || '',
            tm: data.template || 'modern',
            p: (data.dataPoints || []).map(point => ({
                l: point.label,
                x: point.x,
                y: point.y
            }))
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(state);
        
        // Encode to Base64
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        
        // Make URL-safe by replacing characters
        const urlSafe = base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // Remove padding
        
        log('State encoded:', urlSafe.length, 'characters');
        return urlSafe;
    } catch (error) {
        console.error('Failed to encode state:', error);
        return null;
    }
}

/**
 * Decode matrix state from URL-safe string
 * @param {string} encoded - Encoded string
 * @returns {Object|null} - Decoded matrix data or null if invalid
 */
export function decodeState(encoded) {
    try {
        if (!encoded || encoded.length === 0) {
            return null;
        }
        
        // Convert from URL-safe to standard Base64
        let base64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Add padding if needed
        while (base64.length % 4) {
            base64 += '=';
        }
        
        // Decode Base64
        const jsonString = decodeURIComponent(escape(atob(base64)));
        
        // Parse JSON
        const state = JSON.parse(jsonString);
        
        // Validate version
        if (state.v !== 1) {
            console.warn('Unknown state version:', state.v);
        }
        
        // Convert back to full data format
        const data = {
            title: state.t || '',
            subtitle: state.s || '',
            xAxisName: state.x || '',
            yAxisName: state.y || '',
            template: state.tm || 'modern',
            dataPoints: (state.p || []).map(p => ({
                label: p.l,
                x: p.x,
                y: p.y,
                id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }))
        };
        
        log('State decoded:', data);
        return data;
    } catch (error) {
        console.error('Failed to decode state:', error);
        return null;
    }
}

/**
 * Generate shareable URL with current state
 * @param {Object} data - Matrix data
 * @returns {string} - Complete shareable URL
 */
export function generateShareURL(data) {
    const encoded = encodeState(data);
    if (!encoded) {
        return window.location.origin + window.location.pathname;
    }
    
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}#${encoded}`;
}

/**
 * Share matrix via link (copy to clipboard)
 * @param {Object} data - Matrix data
 * @returns {Promise<boolean>} - Success status
 */
export async function shareMatrix(data) {
    try {
        const url = generateShareURL(data);
        const success = await copyToClipboard(url);
        
        if (success) {
            showToast('🔗 Share link copied to clipboard!');
            return true;
        } else {
            showToast('❌ Failed to copy share link');
            return false;
        }
    } catch (error) {
        console.error('Share failed:', error);
        showToast('❌ Failed to create share link');
        return false;
    }
}

/**
 * Load state from URL hash
 * @returns {Object|null} - Decoded state or null
 */
export function loadStateFromURL() {
    try {
        const hash = window.location.hash.substring(1); // Remove '#'
        
        if (!hash || hash.length === 0) {
            log('No state in URL');
            return null;
        }
        
        const data = decodeState(hash);
        
        if (data) {
            log('Loaded state from URL');
            return data;
        } else {
            console.warn('Invalid state in URL');
            return null;
        }
    } catch (error) {
        console.error('Failed to load state from URL:', error);
        return null;
    }
}

/**
 * Update URL hash with current state (without page reload)
 * @param {Object} data - Matrix data
 */
export function updateURLHash(data) {
    try {
        const encoded = encodeState(data);
        if (encoded) {
            // Update hash without triggering hashchange event
            history.replaceState(null, '', `#${encoded}`);
            log('URL hash updated');
        }
    } catch (error) {
        console.error('Failed to update URL hash:', error);
    }
}

/**
 * Clear URL hash
 */
export function clearURLHash() {
    history.replaceState(null, '', window.location.pathname);
    log('URL hash cleared');
}

/**
 * Check if URL contains state data
 * @returns {boolean} - True if hash contains data
 */
export function hasURLState() {
    return window.location.hash.length > 1;
}

/**
 * Validate decoded state data
 * @param {Object} data - Decoded state data
 * @returns {Object} - Validation result
 */
export function validateState(data) {
    const errors = [];
    
    if (!data) {
        errors.push('No data provided');
        return { isValid: false, errors };
    }
    
    if (!data.title || typeof data.title !== 'string') {
        errors.push('Invalid or missing title');
    }
    
    if (!data.xAxisName || typeof data.xAxisName !== 'string') {
        errors.push('Invalid or missing X-axis name');
    }
    
    if (!data.yAxisName || typeof data.yAxisName !== 'string') {
        errors.push('Invalid or missing Y-axis name');
    }
    
    if (!data.template || typeof data.template !== 'string') {
        errors.push('Invalid or missing template');
    }
    
    if (data.dataPoints && Array.isArray(data.dataPoints)) {
        data.dataPoints.forEach((point, index) => {
            if (!point.label || typeof point.label !== 'string') {
                errors.push(`Point ${index + 1}: Invalid label`);
            }
            if (typeof point.x !== 'number' || point.x < 0 || point.x > 100) {
                errors.push(`Point ${index + 1}: Invalid X value`);
            }
            if (typeof point.y !== 'number' || point.y < 0 || point.y > 100) {
                errors.push(`Point ${index + 1}: Invalid Y value`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize and repair decoded state
 * Attempts to fix common issues in decoded data
 * @param {Object} data - Decoded state data
 * @returns {Object} - Sanitized data
 */
export function sanitizeState(data) {
    if (!data) return null;
    
    const sanitized = {
        title: (data.title || '').substring(0, 100),
        subtitle: (data.subtitle || '').substring(0, 100),
        xAxisName: (data.xAxisName || 'X Axis').substring(0, 50),
        yAxisName: (data.yAxisName || 'Y Axis').substring(0, 50),
        template: ['minimal', 'modern', 'vibrant'].includes(data.template) 
            ? data.template 
            : 'modern',
        dataPoints: []
    };
    
    // Sanitize data points
    if (Array.isArray(data.dataPoints)) {
        sanitized.dataPoints = data.dataPoints
            .filter(p => p && p.label)
            .slice(0, 100) // Limit to 100 points
            .map(point => ({
                label: (point.label || '').substring(0, 50),
                x: Math.max(0, Math.min(100, parseFloat(point.x) || 0)),
                y: Math.max(0, Math.min(100, parseFloat(point.y) || 0)),
                id: point.id || `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));
    }
    
    return sanitized;
}

/**
 * Get share URL length
 * @param {Object} data - Matrix data
 * @returns {number} - URL length
 */
export function getShareURLLength(data) {
    const url = generateShareURL(data);
    return url.length;
}

/**
 * Check if share URL is within reasonable limits
 * @param {Object} data - Matrix data
 * @returns {Object} - Status and warnings
 */
export function checkShareURLSize(data) {
    const length = getShareURLLength(data);
    const warnings = [];
    
    // Most browsers support URLs up to 2000+ characters
    // But we'll warn at 1500 for safety
    if (length > 2000) {
        warnings.push('Share URL is very long and may not work in all browsers');
    } else if (length > 1500) {
        warnings.push('Share URL is quite long. Consider reducing data points.');
    }
    
    return {
        length,
        isReasonable: length <= 2000,
        warnings
    };
}

/**
 * Create a short description for sharing
 * @param {Object} data - Matrix data
 * @returns {string} - Description text
 */
export function createShareDescription(data) {
    const pointCount = (data.dataPoints || []).length;
    return `${data.title} - A 2×2 matrix with ${pointCount} data point${pointCount !== 1 ? 's' : ''} created with Think2x2`;
}

/**
 * Share via Web Share API (if available)
 * @param {Object} data - Matrix data
 * @returns {Promise<boolean>} - Success status
 */
export async function shareViaWebShare(data) {
    if (!navigator.share) {
        log('Web Share API not available');
        return false;
    }
    
    try {
        const url = generateShareURL(data);
        const description = createShareDescription(data);
        
        await navigator.share({
            title: `Think2x2 - ${data.title}`,
            text: description,
            url: url
        });
        
        showToast('✅ Shared successfully!');
        return true;
    } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
            console.error('Web Share failed:', error);
        }
        return false;
    }
}

/**
 * Export state as JSON file
 * @param {Object} data - Matrix data
 */
export function exportStateAsJSON(data) {
    try {
        const stateJSON = JSON.stringify(data, null, 2);
        const blob = new Blob([stateJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const filename = `think2x2_${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_state.json`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showToast('✅ State exported as JSON');
    } catch (error) {
        console.error('Failed to export state:', error);
        showToast('❌ Failed to export state');
    }
}

/**
 * Import state from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object|null>} - Imported data or null
 */
export async function importStateFromJSON(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate and sanitize
        const validation = validateState(data);
        if (!validation.isValid) {
            showToast('❌ Invalid state file');
            console.error('Validation errors:', validation.errors);
            return null;
        }
        
        const sanitized = sanitizeState(data);
        showToast('✅ State imported successfully');
        return sanitized;
    } catch (error) {
        console.error('Failed to import state:', error);
        showToast('❌ Failed to import state file');
        return null;
    }
}

/**
 * Listen for hash changes and load state
 * @param {Function} callback - Callback function to handle loaded state
 */
export function setupHashListener(callback) {
    window.addEventListener('hashchange', () => {
        const data = loadStateFromURL();
        if (data && typeof callback === 'function') {
            callback(data);
        }
    });
    
    log('Hash change listener setup');
}
