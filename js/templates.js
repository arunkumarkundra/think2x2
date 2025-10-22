/**
 * Think2x2 Visual Templates
 * Defines styling and appearance for different matrix templates
 */

/**
 * Template Definitions
 * Each template includes colors, fonts, and styling properties
 */
export const templates = {
    minimal: {
        name: 'Minimal',
        description: 'Clean monochrome design with thin lines',
        
        // Colors
        background: '#ffffff',
        gridColor: '#e0e0e0',
        axisColor: '#333333',
        textColor: '#333333',
        titleColor: '#000000',
        
        // Quadrant colors (subtle grays)
        quadrants: {
            topLeft: '#fafafa',
            topRight: '#f5f5f5',
            bottomLeft: '#f0f0f0',
            bottomRight: '#fafafa'
        },
        
        // Point styling
        pointColor: '#333333',
        pointRadius: 6,
        pointStroke: '#ffffff',
        pointStrokeWidth: 2,
        
        // Line weights
        gridLineWidth: 1,
        axisLineWidth: 2,
        
        // Typography
        titleFontSize: 32,
        subtitleFontSize: 18,
        axisFontSize: 14,
        labelFontSize: 12,
        footerFontSize: 10,
        
        // Spacing
        padding: 60,
        titleMargin: 20,
        
        // Effects
        showQuadrantLabels: false,
        showGrid: true,
        pointShadow: false
    },
    
    modern: {
        name: 'Modern',
        description: 'Contemporary design with color accents and grid',
        
        // Colors
        background: '#ffffff',
        gridColor: '#e8e8e8',
        axisColor: '#2c3e50',
        textColor: '#34495e',
        titleColor: '#1a252f',
        
        // Quadrant colors (subtle blues and greens)
        quadrants: {
            topLeft: '#e3f2fd',
            topRight: '#e8f5e9',
            bottomLeft: '#fff3e0',
            bottomRight: '#fce4ec'
        },
        
        // Point styling with color variety
        pointColors: ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4'],
        pointRadius: 8,
        pointStroke: '#ffffff',
        pointStrokeWidth: 3,
        
        // Line weights
        gridLineWidth: 1,
        axisLineWidth: 3,
        
        // Typography
        titleFontSize: 36,
        subtitleFontSize: 20,
        axisFontSize: 16,
        labelFontSize: 13,
        footerFontSize: 10,
        
        // Spacing
        padding: 70,
        titleMargin: 25,
        
        // Effects
        showQuadrantLabels: true,
        quadrantLabelOpacity: 0.6,
        showGrid: true,
        pointShadow: true
    },
    
    vibrant: {
        name: 'Vibrant',
        description: 'Bold colors and high contrast for impact',
        
        // Colors
        background: '#ffffff',
        gridColor: '#cccccc',
        axisColor: '#222222',
        textColor: '#222222',
        titleColor: '#000000',
        
        // Quadrant colors (bold and distinct)
        quadrants: {
            topLeft: '#ffeb3b',
            topRight: '#4caf50',
            bottomLeft: '#ff5722',
            bottomRight: '#2196f3'
        },
        quadrantOpacity: 0.3,
        
        // Point styling
        pointColors: ['#d32f2f', '#7b1fa2', '#1976d2', '#388e3c', '#f57c00', '#c2185b'],
        pointRadius: 10,
        pointStroke: '#ffffff',
        pointStrokeWidth: 3,
        
        // Line weights
        gridLineWidth: 2,
        axisLineWidth: 4,
        
        // Typography
        titleFontSize: 40,
        subtitleFontSize: 22,
        axisFontSize: 18,
        labelFontSize: 14,
        footerFontSize: 11,
        
        // Spacing
        padding: 80,
        titleMargin: 30,
        
        // Effects
        showQuadrantLabels: true,
        quadrantLabelOpacity: 0.8,
        showGrid: true,
        pointShadow: true,
        boldAxisLabels: true
    }
};

/**
 * Get template configuration by name
 * @param {string} templateName - Name of template (minimal, modern, vibrant)
 * @returns {Object} - Template configuration object
 */
export function getTemplate(templateName) {
    const template = templates[templateName] || templates.modern;
    return { ...template }; // Return a copy to prevent mutations
}

/**
 * Get point color for a data point based on template and index
 * @param {string} templateName - Template name
 * @param {number} index - Point index
 * @returns {string} - Color hex code
 */
export function getPointColor(templateName, index) {
    const template = templates[templateName] || templates.modern;
    
    if (template.pointColors && Array.isArray(template.pointColors)) {
        return template.pointColors[index % template.pointColors.length];
    }
    
    return template.pointColor || '#333333';
}

/**
 * Get quadrant label text based on position
 * @param {string} position - Quadrant position (topLeft, topRight, bottomLeft, bottomRight)
 * @param {string} xAxisName - X-axis name
 * @param {string} yAxisName - Y-axis name
 * @returns {string} - Descriptive quadrant label
 */
export function getQuadrantLabel(position, xAxisName = 'X', yAxisName = 'Y') {
    const labels = {
        topLeft: `Low ${xAxisName}\nHigh ${yAxisName}`,
        topRight: `High ${xAxisName}\nHigh ${yAxisName}`,
        bottomLeft: `Low ${xAxisName}\nLow ${yAxisName}`,
        bottomRight: `High ${xAxisName}\nLow ${yAxisName}`
    };
    
    return labels[position] || '';
}

/**
 * Calculate SVG dimensions based on template and content
 * @param {Object} template - Template configuration
 * @param {boolean} includeFooter - Whether to include footer space
 * @returns {Object} - Dimensions object {width, height, plotWidth, plotHeight}
 */
export function calculateDimensions(template, includeFooter = false) {
    const baseWidth = 800;
    const baseHeight = 800;
    const footerHeight = includeFooter ? 60 : 0;
    
    return {
        width: baseWidth,
        height: baseHeight + footerHeight,
        plotWidth: baseWidth - (template.padding * 2),
        plotHeight: baseHeight - (template.padding * 2) - (template.titleMargin * 3),
        padding: template.padding,
        titleMargin: template.titleMargin,
        footerHeight
    };
}

/**
 * Generate SVG filter definitions for shadows and effects
 * @param {Object} template - Template configuration
 * @returns {string} - SVG defs element as string
 */
export function generateSVGFilters(template) {
    if (!template.pointShadow) return '';
    
    return `
        <defs>
            <filter id="pointShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    `;
}

/**
 * Get all available template names
 * @returns {Array<string>} - Array of template names
 */
export function getTemplateNames() {
    return Object.keys(templates);
}

/**
 * Validate template name
 * @param {string} templateName - Template name to validate
 * @returns {boolean} - True if valid template name
 */
export function isValidTemplate(templateName) {
    return templateName in templates;
}

/**
 * Get template metadata for UI display
 * @returns {Array<Object>} - Array of template metadata objects
 */
export function getTemplateMetadata() {
    return Object.entries(templates).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description
    }));
}

/**
 * Generate CSS classes for template-specific styling
 * @param {string} templateName - Template name
 * @returns {string} - CSS class string
 */
export function getTemplateClass(templateName) {
    return `template-${templateName}`;
}

/**
 * Get accessible color contrast ratio
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} - Contrast ratio
 */
export function getContrastRatio(color1, color2) {
    const getLuminance = (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = ((rgb >> 16) & 0xff) / 255;
        const g = ((rgb >> 8) & 0xff) / 255;
        const b = (rgb & 0xff) / 255;
        
        const [rs, gs, bs] = [r, g, b].map(c => {
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Ensure template meets WCAG AA contrast requirements
 * @param {Object} template - Template to validate
 * @returns {Object} - Validation result with warnings
 */
export function validateTemplateAccessibility(template) {
    const warnings = [];
    const WCAG_AA_NORMAL = 4.5;
    const WCAG_AA_LARGE = 3.0;
    
    // Check title contrast
    const titleContrast = getContrastRatio(template.titleColor, template.background);
    if (titleContrast < WCAG_AA_LARGE) {
        warnings.push(`Title contrast ratio ${titleContrast.toFixed(2)} is below WCAG AA standard`);
    }
    
    // Check text contrast
    const textContrast = getContrastRatio(template.textColor, template.background);
    if (textContrast < WCAG_AA_NORMAL) {
        warnings.push(`Text contrast ratio ${textContrast.toFixed(2)} is below WCAG AA standard`);
    }
    
    return {
        isAccessible: warnings.length === 0,
        warnings
    };
}

// Export default template name
export const DEFAULT_TEMPLATE = 'modern';
