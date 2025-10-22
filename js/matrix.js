/**
 * Think2x2 Matrix Rendering
 * Handles SVG generation and matrix visualization
 */

import { sanitizeInput, escapeXml, getQuadrant } from './utils.js';
import { 
    getTemplate, 
    getPointColor, 
    getQuadrantLabel, 
    calculateDimensions,
    generateSVGFilters 
} from './templates.js';

/**
 * Generate complete SVG matrix visualization
 * @param {Object} data - Matrix data (title, subtitle, axes, points, template)
 * @param {boolean} includeFooter - Whether to include footer for export
 * @returns {string} - Complete SVG markup
 */
export function generateMatrix(data, includeFooter = false) {
    const template = getTemplate(data.template || 'modern');
    const dims = calculateDimensions(template, includeFooter);
    
    // Sanitize text inputs
    const title = escapeXml(data.title || 'Untitled Matrix');
    const subtitle = data.subtitle ? escapeXml(data.subtitle) : '';
    const xAxisName = escapeXml(data.xAxisName || 'X Axis');
    const yAxisName = escapeXml(data.yAxisName || 'Y Axis');
    
    // Build SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
        width="${dims.width}" 
        height="${dims.height}" 
        viewBox="0 0 ${dims.width} ${dims.height}"
        role="img"
        aria-label="${title}">`;
    
    // Add filters
    svg += generateSVGFilters(template);
    
    // Background
    svg += generateBackground(template, dims);
    
    // Title and subtitle
    svg += generateTitle(title, subtitle, template, dims);
    
    // Calculate plot area
    const plotArea = {
        x: dims.padding,
        y: dims.padding + (subtitle ? template.titleMargin * 3 : template.titleMargin * 2),
        width: dims.plotWidth,
        height: dims.plotHeight
    };
    
    // Draw quadrants
    svg += generateQuadrants(template, plotArea, xAxisName, yAxisName);
    
    // Draw grid
    if (template.showGrid) {
        svg += generateGrid(template, plotArea);
    }
    
    // Draw axes
    svg += generateAxes(template, plotArea, xAxisName, yAxisName);
    
    // Draw data points
    if (data.dataPoints && data.dataPoints.length > 0) {
        svg += generateDataPoints(data.dataPoints, template, plotArea, data.template);
    }
    
    // Add footer if exporting
    if (includeFooter) {
        svg += generateFooter(template, dims);
    }
    
    svg += '</svg>';
    
    return svg;
}

/**
 * Generate SVG background
 */
function generateBackground(template, dims) {
    return `<rect width="${dims.width}" height="${dims.height}" 
        fill="${template.background}" />`;
}

/**
 * Generate title and subtitle
 */
function generateTitle(title, subtitle, template, dims) {
    let titleSvg = `<text x="${dims.width / 2}" y="${dims.padding}" 
        text-anchor="middle" 
        font-family="Poppins, sans-serif" 
        font-size="${template.titleFontSize}" 
        font-weight="700"
        fill="${template.titleColor}">${title}</text>`;
    
    if (subtitle) {
        titleSvg += `<text x="${dims.width / 2}" y="${dims.padding + template.titleMargin + 10}" 
            text-anchor="middle" 
            font-family="Inter, sans-serif" 
            font-size="${template.subtitleFontSize}" 
            font-weight="400"
            fill="${template.textColor}"
            opacity="0.8">${subtitle}</text>`;
    }
    
    return titleSvg;
}

/**
 * Generate quadrant backgrounds and labels
 */
function generateQuadrants(template, plotArea, xAxisName, yAxisName) {
    const midX = plotArea.x + plotArea.width / 2;
    const midY = plotArea.y + plotArea.height / 2;
    const halfWidth = plotArea.width / 2;
    const halfHeight = plotArea.height / 2;
    
    const opacity = template.quadrantOpacity || 0.2;
    
    let svg = '';
    
    // Top Left Quadrant (Q2)
    svg += `<rect x="${plotArea.x}" y="${plotArea.y}" 
        width="${halfWidth}" height="${halfHeight}" 
        fill="${template.quadrants.topLeft}" 
        opacity="${opacity}" />`;
    
    // Top Right Quadrant (Q1)
    svg += `<rect x="${midX}" y="${plotArea.y}" 
        width="${halfWidth}" height="${halfHeight}" 
        fill="${template.quadrants.topRight}" 
        opacity="${opacity}" />`;
    
    // Bottom Left Quadrant (Q3)
    svg += `<rect x="${plotArea.x}" y="${midY}" 
        width="${halfWidth}" height="${halfHeight}" 
        fill="${template.quadrants.bottomLeft}" 
        opacity="${opacity}" />`;
    
    // Bottom Right Quadrant (Q4)
    svg += `<rect x="${midX}" y="${midY}" 
        width="${halfWidth}" height="${halfHeight}" 
        fill="${template.quadrants.bottomRight}" 
        opacity="${opacity}" />`;
    
    // Quadrant labels (if enabled)
    if (template.showQuadrantLabels) {
        const labelOpacity = template.quadrantLabelOpacity || 0.5;
        const fontSize = template.labelFontSize;
        
        // Q2 - Top Left
        svg += generateQuadrantLabel(
            'Q2',
            plotArea.x + 20,
            plotArea.y + 20,
            template,
            labelOpacity,
            fontSize - 2,
            true
        );
        
        // Q1 - Top Right
        svg += generateQuadrantLabel(
            'Q1',
            midX + halfWidth - 20,
            plotArea.y + 20,
            template,
            labelOpacity,
            fontSize - 2,
            true
        );
        
        // Q3 - Bottom Left
        svg += generateQuadrantLabel(
            'Q3',
            plotArea.x + 20,
            midY + halfHeight - 10,
            template,
            labelOpacity,
            fontSize - 2,
            true
        );
        
        // Q4 - Bottom Right
        svg += generateQuadrantLabel(
            'Q4',
            midX + halfWidth - 20,
            midY + halfHeight - 10,
            template,
            labelOpacity,
            fontSize - 2,
            true
        );
    }
    
    return svg;
}

/**
 * Generate quadrant label with multi-line support
 */
function generateQuadrantLabel(text, x, y, template, opacity, fontSize) {
    const lines = text.split('\n');
    const lineHeight = fontSize + 4;
    const startY = y - ((lines.length - 1) * lineHeight / 2);
    
    let svg = '<g>';
    lines.forEach((line, index) => {
        svg += `<text x="${x}" y="${startY + index * lineHeight}" 
            text-anchor="middle" 
            font-family="Inter, sans-serif" 
            font-size="${fontSize}" 
            font-weight="500"
            fill="${template.textColor}"
            opacity="${opacity}">${escapeXml(line)}</text>`;
    });
    svg += '</g>';
    
    return svg;
}

/**
 * Generate grid lines
 */
function generateGrid(template, plotArea) {
    const midX = plotArea.x + plotArea.width / 2;
    const midY = plotArea.y + plotArea.height / 2;
    
    let svg = '<g class="grid">';
    
    // Vertical grid lines (quarters)
    const quarterWidth = plotArea.width / 4;
    for (let i = 1; i < 4; i++) {
        const x = plotArea.x + quarterWidth * i;
        const strokeWidth = i === 2 ? template.gridLineWidth + 0.5 : template.gridLineWidth;
        svg += `<line x1="${x}" y1="${plotArea.y}" x2="${x}" y2="${plotArea.y + plotArea.height}" 
            stroke="${template.gridColor}" 
            stroke-width="${strokeWidth}"
            stroke-dasharray="${i === 2 ? 'none' : '4,4'}" />`;
    }
    
    // Horizontal grid lines (quarters)
    const quarterHeight = plotArea.height / 4;
    for (let i = 1; i < 4; i++) {
        const y = plotArea.y + quarterHeight * i;
        const strokeWidth = i === 2 ? template.gridLineWidth + 0.5 : template.gridLineWidth;
        svg += `<line x1="${plotArea.x}" y1="${y}" x2="${plotArea.x + plotArea.width}" y2="${y}" 
            stroke="${template.gridColor}" 
            stroke-width="${strokeWidth}"
            stroke-dasharray="${i === 2 ? 'none' : '4,4'}" />`;
    }
    
    svg += '</g>';
    return svg;
}

/**
 * Generate axes with labels
 */
function generateAxes(template, plotArea, xAxisName, yAxisName) {
    const midX = plotArea.x + plotArea.width / 2;
    const midY = plotArea.y + plotArea.height / 2;
    const axisExtend = 20;
    
    let svg = '<g class="axes">';
    
    // X-axis (horizontal)
    svg += `<line x1="${plotArea.x - axisExtend}" y1="${midY}" 
        x2="${plotArea.x + plotArea.width + axisExtend}" y2="${midY}" 
        stroke="${template.axisColor}" 
        stroke-width="${template.axisLineWidth}" />`;
    
    // X-axis arrow
    svg += `<polygon points="${plotArea.x + plotArea.width + axisExtend},${midY} 
        ${plotArea.x + plotArea.width + axisExtend - 8},${midY - 4} 
        ${plotArea.x + plotArea.width + axisExtend - 8},${midY + 4}" 
        fill="${template.axisColor}" />`;
    
    // Y-axis (vertical)
    svg += `<line x1="${midX}" y1="${plotArea.y + plotArea.height + axisExtend}" 
        x2="${midX}" y2="${plotArea.y - axisExtend}" 
        stroke="${template.axisColor}" 
        stroke-width="${template.axisLineWidth}" />`;
    
    // Y-axis arrow
    svg += `<polygon points="${midX},${plotArea.y - axisExtend} 
        ${midX - 4},${plotArea.y - axisExtend + 8} 
        ${midX + 4},${plotArea.y - axisExtend + 8}" 
        fill="${template.axisColor}" />`;
    
    // X-axis label (at bottom center)
    const fontWeight = template.boldAxisLabels ? '600' : '500';
    svg += `<text x="${midX}" y="${plotArea.y + plotArea.height + 40}" 
        text-anchor="middle"
        font-family="Inter, sans-serif" 
        font-size="${template.axisFontSize}" 
        font-weight="${fontWeight}"
        fill="${template.axisColor}">${xAxisName}</text>`;
    
    // Y-axis label (vertical on the left)
    svg += `<text x="${plotArea.x - 40}" y="${midY}" 
        text-anchor="middle"
        font-family="Inter, sans-serif" 
        font-size="${template.axisFontSize}" 
        font-weight="${fontWeight}"
        fill="${template.axisColor}"
        transform="rotate(-90, ${plotArea.x - 40}, ${midY})">${yAxisName}</text>`;
    
    // Axis value labels
    svg += generateAxisLabels(template, plotArea);
    
    svg += '</g>';
    return svg;
}

/**
 * Generate axis value labels (Low, High)
 */
function generateAxisLabels(template, plotArea) {
    const midX = plotArea.x + plotArea.width / 2;
    const midY = plotArea.y + plotArea.height / 2;
    const fontSize = template.labelFontSize;
    const offset = 12;
    
    let svg = '<g class="axis-labels" opacity="0.7">';
    
    // X-axis labels
    svg += `<text x="${plotArea.x}" y="${midY + fontSize + offset}" 
        text-anchor="middle" font-family="Inter, sans-serif" 
        font-size="${fontSize}" 
        font-weight="500"
        fill="${template.textColor}">Low</text>`;
    
    svg += `<text x="${plotArea.x + plotArea.width}" y="${midY + fontSize + offset}" 
        text-anchor="middle" font-family="Inter, sans-serif" 
        font-size="${fontSize}" 
        font-weight="500"
        fill="${template.textColor}">High</text>`;
    
    // Y-axis labels
    svg += `<text x="${midX - fontSize - offset - 5}" y="${plotArea.y + plotArea.height + 5}" 
        text-anchor="end" font-family="Inter, sans-serif" 
        font-size="${fontSize}" 
        font-weight="500"
        fill="${template.textColor}">Low</text>`;
    
    svg += `<text x="${midX - fontSize - offset - 5}" y="${plotArea.y + 5}" 
        text-anchor="end" font-family="Inter, sans-serif" 
        font-size="${fontSize}" 
        font-weight="500"
        fill="${template.textColor}">High</text>`;
    
    svg += '</g>';
    return svg;
}

/**
 * Generate data points with labels
 */
function generateDataPoints(dataPoints, template, plotArea, templateName) {
    let svg = '<g class="data-points">';
    
    dataPoints.forEach((point, index) => {
        if (!point.label || point.x == null || point.y == null) return;
        
        // Calculate position (invert Y for SVG coordinates)
        const x = plotArea.x + (point.x / 100) * plotArea.width;
        const y = plotArea.y + plotArea.height - (point.y / 100) * plotArea.height;
        
        const color = getPointColor(templateName, index);
        const radius = template.pointRadius;
        const filter = template.pointShadow ? 'url(#pointShadow)' : '';
        
        // Draw point
        svg += `<circle cx="${x}" cy="${y}" r="${radius}" 
            fill="${color}" 
            stroke="${template.pointStroke}" 
            stroke-width="${template.pointStrokeWidth}"
            filter="${filter}" />`;
        
        // Draw label
        const labelY = y - radius - 8;
        const label = escapeXml(point.label);
        
        // Label background for readability
        const labelWidth = label.length * (template.labelFontSize * 0.6);
        svg += `<rect x="${x - labelWidth / 2 - 4}" y="${labelY - template.labelFontSize}" 
            width="${labelWidth + 8}" height="${template.labelFontSize + 4}" 
            fill="${template.background}" 
            opacity="0.9" 
            rx="2" />`;
        
        svg += `<text x="${x}" y="${labelY}" 
            text-anchor="middle" 
            font-family="Inter, sans-serif" 
            font-size="${template.labelFontSize}" 
            font-weight="500"
            fill="${template.textColor}">${label}</text>`;
    });
    
    svg += '</g>';
    return svg;
}

/**
 * Generate footer for exported images
 */
function generateFooter(template, dims) {
    const y = dims.height - (dims.footerHeight / 2) + 5;
    
    return `<g class="footer">
        <line x1="0" y1="${dims.height - dims.footerHeight}" 
            x2="${dims.width}" y2="${dims.height - dims.footerHeight}" 
            stroke="${template.gridColor}" stroke-width="1" />
        
        <text x="${dims.width - dims.padding}" y="${y}" 
            text-anchor="end"
            font-family="Inter, sans-serif" 
            font-size="${template.footerFontSize + 1}" 
            fill="${template.textColor}"
            opacity="0.7">https://arunkumarkundra.github.io/think2x2/</text>
    </g>`;
}

/**
 * Render SVG to DOM element
 * @param {string} svgString - SVG markup
 * @param {HTMLElement} container - Container element
 */
export function renderMatrix(svgString, container) {
    if (!container) return;
    container.innerHTML = svgString;
}

/**
 * Update accessible data table
 * @param {Array} dataPoints - Array of data points
 * @param {string} xAxisName - X-axis name
 * @param {string} yAxisName - Y-axis name
 */
export function updateAccessibleTable(dataPoints, xAxisName, yAxisName) {
    const tbody = document.getElementById('accessibleDataBody');
    const xHeader = document.getElementById('accXAxis');
    const yHeader = document.getElementById('accYAxis');
    
    if (!tbody) return;
    
    // Update headers
    if (xHeader) xHeader.textContent = xAxisName || 'X Value';
    if (yHeader) yHeader.textContent = yAxisName || 'Y Value';
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (!dataPoints || dataPoints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; opacity: 0.6;">No data points added yet</td></tr>';
        return;
    }
    
    // Add rows
    dataPoints.forEach(point => {
        const row = document.createElement('tr');
        const quadrant = getQuadrant(point.x, point.y);
        
        row.innerHTML = `
            <td>${sanitizeInput(point.label)}</td>
            <td>${point.x}</td>
            <td>${point.y}</td>
            <td>${quadrant}</td>
        `;
        
        tbody.appendChild(row);
    });
}
