/**
 * Think2x2 Main Application
 * Orchestrates all components and handles user interactions
 */

import { 
    generateId, 
    isValidNumber, 
    debounce, 
    showToast,
    checkBrowserSupport,
    log,
    sanitizeInput
} from './js/utils.js';

import { DEFAULT_TEMPLATE } from './js/templates.js';

import { 
    generateMatrix, 
    renderMatrix, 
    updateAccessibleTable 
} from './js/matrix.js';

import { 
    exportAsPNG, 
    exportAsSVG,
    exportWithValidation 
} from './js/export.js';

import { 
    shareMatrix, 
    loadStateFromURL, 
    updateURLHash,
    setupHashListener,
    sanitizeState
} from './js/share.js';

/**
 * Application State
 */
const state = {
    title: '',
    subtitle: '',
    xAxisName: '',
    yAxisName: '',
    template: DEFAULT_TEMPLATE,
    dataPoints: []
};

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    log('Think2x2 initializing...');
    
    // Check browser support
    const support = checkBrowserSupport();
    if (!support.svg || !support.canvas) {
        showBrowserWarning();
        return;
    }
    
    // Initialize components
    initializeForm();
    initializeDataTable();
    initializeButtons();
    initializeModal();
    
    // Load state from URL if present
    const urlState = loadStateFromURL();
    if (urlState) {
        loadState(urlState);
        showToast('📋 Matrix loaded from shared link');
    } else {
        // Add default data points for new users
        addDefaultDataPoints();
    }
    
    // Setup hash change listener
    setupHashListener((data) => {
        loadState(data);
        showToast('📋 Matrix loaded');
    });
    
    // Initial render
    updatePreview();
    
    log('Think2x2 initialized successfully');
});

/**
 * Initialize form event listeners
 */
function initializeForm() {
    const form = document.getElementById('matrixForm');
    const titleInput = document.getElementById('matrixTitle');
    const subtitleInput = document.getElementById('matrixSubtitle');
    const xAxisInput = document.getElementById('xAxisName');
    const yAxisInput = document.getElementById('yAxisName');
    const templateSelect = document.getElementById('templateSelect');
    
    // Debounced update function
    const debouncedUpdate = debounce(() => {
        updateStateFromForm();
        updatePreview();
    }, 300);
    
    // Title input
    if (titleInput) {
        titleInput.addEventListener('input', debouncedUpdate);
    }
    
    // Subtitle input
    if (subtitleInput) {
        subtitleInput.addEventListener('input', debouncedUpdate);
    }
    
    // X-axis input
    if (xAxisInput) {
        xAxisInput.addEventListener('input', debouncedUpdate);
    }
    
    // Y-axis input
    if (yAxisInput) {
        yAxisInput.addEventListener('input', debouncedUpdate);
    }
    
    // Template select
    if (templateSelect) {
        templateSelect.addEventListener('change', () => {
            state.template = templateSelect.value;
            updatePreview();
        });
    }
    
    // Prevent form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
}

/**
 * Initialize data points table
 */
function initializeDataTable() {
    const addPointBtn = document.getElementById('addPointBtn');
    
    if (addPointBtn) {
        addPointBtn.addEventListener('click', () => {
            addDataPoint();
        });
    }
}

/**
 * Initialize action buttons
 */
function initializeButtons() {
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            await shareMatrix(state);
        });
    }
    
    // Export PNG button
    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', async () => {
            exportPngBtn.disabled = true;
            exportPngBtn.textContent = '⏳ Exporting...';
            
            await exportWithValidation(state, 'png');
            
            exportPngBtn.disabled = false;
            exportPngBtn.textContent = '⬇️ PNG';
        });
    }
    
    // Export SVG button
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    if (exportSvgBtn) {
        exportSvgBtn.addEventListener('click', async () => {
            exportSvgBtn.disabled = true;
            exportSvgBtn.textContent = '⏳ Exporting...';
            
            await exportWithValidation(state, 'svg');
            
            exportSvgBtn.disabled = false;
            exportSvgBtn.textContent = '⬇️ SVG';
        });
    }
    
    // About button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            openModal();
        });
    }
}

/**
 * Initialize modal
 */
function initializeModal() {
    const modal = document.getElementById('aboutModal');
    const closeBtn1 = document.getElementById('closeModalBtn');
    const closeBtn2 = document.getElementById('closeModalBtn2');
    const overlay = modal?.querySelector('.modal-overlay');
    
    const closeModal = () => {
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
    };
    
    if (closeBtn1) {
        closeBtn1.addEventListener('click', closeModal);
    }
    
    if (closeBtn2) {
        closeBtn2.addEventListener('click', closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.hidden) {
            closeModal();
        }
    });
}

/**
 * Open about modal
 */
function openModal() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Focus close button for accessibility
        const closeBtn = document.getElementById('closeModalBtn');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
    }
}

/**
 * Update state from form inputs
 */
function updateStateFromForm() {
    const titleInput = document.getElementById('matrixTitle');
    const subtitleInput = document.getElementById('matrixSubtitle');
    const xAxisInput = document.getElementById('xAxisName');
    const yAxisInput = document.getElementById('yAxisName');
    const templateSelect = document.getElementById('templateSelect');
    
    if (titleInput) state.title = titleInput.value;
    if (subtitleInput) state.subtitle = subtitleInput.value;
    if (xAxisInput) state.xAxisName = xAxisInput.value;
    if (yAxisInput) state.yAxisName = yAxisInput.value;
    if (templateSelect) state.template = templateSelect.value;
    
    // Update URL hash
    updateURLHash(state);
}

/**
 * Update preview with current state
 */
function updatePreview() {
    const container = document.getElementById('matrixPreview');
    if (!container) return;
    
    try {
        // Generate SVG (without footer for preview)
        const svg = generateMatrix(state, false);
        
        // Render to container
        renderMatrix(svg, container);
        
        // Update accessible table
        updateAccessibleTable(
            state.dataPoints, 
            state.xAxisName || 'X Value', 
            state.yAxisName || 'Y Value'
        );
    } catch (error) {
        console.error('Failed to update preview:', error);
        container.innerHTML = '<p style="color: red; padding: 20px;">Error rendering matrix. Please check your data.</p>';
    }
}

/**
 * Add a new data point
 */
function addDataPoint(label = '', x = 50, y = 50) {
    const point = {
        id: generateId(),
        label: label,
        x: x,
        y: y
    };
    
    state.dataPoints.push(point);
    renderDataPointRow(point);
    updatePreview();
}

/**
 * Remove a data point
 */
function removeDataPoint(id) {
    const index = state.dataPoints.findIndex(p => p.id === id);
    if (index !== -1) {
        state.dataPoints.splice(index, 1);
        updatePreview();
        updateURLHash(state);
    }
}

/**
 * Update a data point
 */
function updateDataPoint(id, field, value) {
    const point = state.dataPoints.find(p => p.id === id);
    if (!point) return;
    
    if (field === 'label') {
        point.label = value;
    } else if (field === 'x' || field === 'y') {
        const numValue = parseFloat(value);
        if (isValidNumber(numValue, 0, 100)) {
            point[field] = numValue;
        }
    }
    
    updatePreview();
    updateURLHash(state);
}

/**
 * Render a data point row in the table
 */
function renderDataPointRow(point) {
    const tbody = document.getElementById('dataPointsBody');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.dataset.pointId = point.id;
    
    row.innerHTML = `
        <td>
            <input 
                type="text" 
                class="table-input" 
                value="${sanitizeInput(point.label)}" 
                placeholder="Label"
                data-field="label"
            >
        </td>
        <td>
            <input 
                type="number" 
                class="table-input" 
                value="${point.x}" 
                min="0" 
                max="100" 
                step="1"
                data-field="x"
            >
        </td>
        <td>
            <input 
                type="number" 
                class="table-input" 
                value="${point.y}" 
                min="0" 
                max="100" 
                step="1"
                data-field="y"
            >
        </td>
        <td class="action-col">
            <button 
                type="button" 
                class="btn-delete" 
                aria-label="Delete point"
                data-action="delete"
            >
                🗑️
            </button>
        </td>
    `;
    
    // Add event listeners
    const inputs = row.querySelectorAll('.table-input');
    inputs.forEach(input => {
        const field = input.dataset.field;
        
        const debouncedUpdate = debounce(() => {
            updateDataPoint(point.id, field, input.value);
        }, 300);
        
        input.addEventListener('input', debouncedUpdate);
    });
    
    const deleteBtn = row.querySelector('[data-action="delete"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            row.remove();
            removeDataPoint(point.id);
        });
    }
    
    tbody.appendChild(row);
}

/**
 * Render all data points
 */
function renderAllDataPoints() {
    const tbody = document.getElementById('dataPointsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    state.dataPoints.forEach(point => {
        renderDataPointRow(point);
    });
}

/**
 * Load state into application
 */
function loadState(data) {
    if (!data) return;
    
    // Sanitize incoming data
    const sanitized = sanitizeState(data);
    
    // Update state
    Object.assign(state, sanitized);
    
    // Update form inputs
    const titleInput = document.getElementById('matrixTitle');
    const subtitleInput = document.getElementById('matrixSubtitle');
    const xAxisInput = document.getElementById('xAxisName');
    const yAxisInput = document.getElementById('yAxisName');
    const templateSelect = document.getElementById('templateSelect');
    
    if (titleInput) titleInput.value = state.title;
    if (subtitleInput) subtitleInput.value = state.subtitle;
    if (xAxisInput) xAxisInput.value = state.xAxisName;
    if (yAxisInput) yAxisInput.value = state.yAxisName;
    if (templateSelect) templateSelect.value = state.template;
    
    // Render data points
    renderAllDataPoints();
    
    // Update preview
    updatePreview();
}

/**
 * Add default data points for new users
 */
function addDefaultDataPoints() {
    // Set default values
    state.title = 'Product Strategy';
    state.xAxisName = 'Feasibility';
    state.yAxisName = 'Impact';
    
    // Add sample points
    addDataPoint('Feature A', 80, 75);
    addDataPoint('Feature B', 40, 85);
    addDataPoint('Feature C', 70, 30);
    
    // Update form
    const titleInput = document.getElementById('matrixTitle');
    const xAxisInput = document.getElementById('xAxisName');
    const yAxisInput = document.getElementById('yAxisName');
    
    if (titleInput) titleInput.value = state.title;
    if (xAxisInput) xAxisInput.value = state.xAxisName;
    if (yAxisInput) yAxisInput.value = state.yAxisName;
}

/**
 * Show browser compatibility warning
 */
function showBrowserWarning() {
    const container = document.getElementById('matrixPreview');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #d32f2f;">
                <h3>⚠️ Browser Not Supported</h3>
                <p>Your browser does not support the required features for Think2x2.</p>
                <p>Please use a modern browser like Chrome, Firefox, Edge, or Safari.</p>
            </div>
        `;
    }
    
    showToast('⚠️ Browser not fully supported');
}

/**
 * Handle errors gracefully
 */
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showToast('❌ An error occurred. Please refresh the page.');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export state for debugging (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.Think2x2 = {
        state,
        updatePreview,
        loadState,
        addDataPoint,
        removeDataPoint
    };
    log('Debug interface available at window.Think2x2');
}
