/**
 * Think2x2 Utility Functions
 * Provides validation, sanitization, and helper functions
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string safe for display
 */
export function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validate that a value is a number within range
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - True if valid number in range
 */
export function isValidNumber(value, min = 0, max = 100) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Clamp a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID for data points
 * @returns {string} - Unique identifier
 */
export function generateId() {
    return `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a number to specified decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

/**
 * Get current UTC timestamp in ISO format
 * @returns {string} - ISO timestamp (e.g., "2025-10-22T14:30:00Z")
 */
export function getUTCTimestamp() {
    return new Date().toISOString();
}

/**
 * Format timestamp for filename (YYYYMMDDTHHmmssZ)
 * @param {string} isoString - ISO timestamp string
 * @returns {string} - Formatted filename timestamp
 */
export function formatFilenameTimestamp(isoString) {
    return isoString.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate filename for export
 * @param {string} title - Matrix title
 * @param {string} extension - File extension (png, svg)
 * @returns {string} - Formatted filename
 */
export function generateFilename(title, extension) {
    const timestamp = formatFilenameTimestamp(getUTCTimestamp());
    const sanitizedTitle = title
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
    
    return `think2x2_${sanitizedTitle}_${timestamp}.${extension}`;
}

/**
 * Determine which quadrant a point belongs to
 * @param {number} x - X coordinate (0-100)
 * @param {number} y - Y coordinate (0-100)
 * @returns {string} - Quadrant name
 */
export function getQuadrant(x, y) {
    const midX = 50;
    const midY = 50;
    
    if (x >= midX && y >= midY) return 'Top Right';
    if (x < midX && y >= midY) return 'Top Left';
    if (x < midX && y < midY) return 'Bottom Left';
    return 'Bottom Right';
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification to user
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.hidden = false;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.hidden = true;
        }, 300);
    }, duration);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}

/**
 * Check if browser supports required features
 * @returns {Object} - Object with support flags
 */
export function checkBrowserSupport() {
    return {
        svg: !!document.createElementNS,
        canvas: !!document.createElement('canvas').getContext,
        blob: typeof Blob !== 'undefined',
        download: 'download' in document.createElement('a'),
        clipboard: !!navigator.clipboard,
        urlSearchParams: typeof URLSearchParams !== 'undefined'
    };
}

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateFormData(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
    }
    
    if (!data.xAxisName || data.xAxisName.trim().length === 0) {
        errors.push('X-axis name is required');
    }
    
    if (!data.yAxisName || data.yAxisName.trim().length === 0) {
        errors.push('Y-axis name is required');
    }
    
    if (data.dataPoints && Array.isArray(data.dataPoints)) {
        data.dataPoints.forEach((point, index) => {
            if (!point.label || point.label.trim().length === 0) {
                errors.push(`Point ${index + 1}: Label is required`);
            }
            if (!isValidNumber(point.x, 0, 100)) {
                errors.push(`Point ${index + 1}: X value must be between 0 and 100`);
            }
            if (!isValidNumber(point.y, 0, 100)) {
                errors.push(`Point ${index + 1}: Y value must be between 0 and 100`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get contrast color (black or white) based on background
 * @param {string} hexColor - Hex color code
 * @returns {string} - 'black' or 'white'
 */
export function getContrastColor(hexColor) {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Escape XML/SVG special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeXml(str) {
    if (typeof str !== 'string') return '';
    
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Create a deep clone of an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

/**
 * Log message (only in development)
 * @param {...any} args - Arguments to log
 */
export function log(...args) {
    if (isDevelopment()) {
        console.log('[Think2x2]', ...args);
    }
}
