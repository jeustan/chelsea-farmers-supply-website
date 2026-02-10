// Custom Color Picker Functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('colorPickerToggle');
    const panel = document.getElementById('colorPickerPanel');
    const hexInput = document.getElementById('hexColorInput');
    const colorPreview = document.getElementById('colorPreview');
    const applyBtn = document.getElementById('applyColorBtn');
    const resetBtn = document.getElementById('resetColorBtn');
    const customPicker = document.getElementById('customColorPicker');
    const spectrumCanvas = document.getElementById('spectrumCanvas');
    const spectrumCursor = document.getElementById('spectrumCursor');
    const hueSlider = document.getElementById('hueSlider');
    const defaultBackgroundLight = 'e8f1ce';
    
    let currentHue = 80;
    let currentSaturation = 0.7;
    let currentLightness = 0.9;
    let isPickerOpen = false;
    
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('backgroundLightColor');
    if (savedColor) {
        const hexValue = savedColor.replace('#', '');
        document.documentElement.style.setProperty('--background-light', savedColor);
        hexInput.value = hexValue;
        if (colorPreview) colorPreview.style.backgroundColor = savedColor;
    } else {
        hexInput.value = defaultBackgroundLight;
        if (colorPreview) colorPreview.style.backgroundColor = '#' + defaultBackgroundLight;
    }
    
    // Draw spectrum canvas
    function drawSpectrum(hue) {
        if (!spectrumCanvas) return;
        const ctx = spectrumCanvas.getContext('2d');
        const width = spectrumCanvas.width;
        const height = spectrumCanvas.height;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const saturation = x / width;
                const lightness = 1 - (y / height);
                const color = hslToRgb(hue, saturation, lightness);
                ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Convert HSL to RGB
    function hslToRgb(h, s, l) {
        h = h / 360;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    // Convert RGB to hex
    function rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    // Update color from spectrum
    function updateColorFromSpectrum(x, y) {
        const width = spectrumCanvas.width;
        const height = spectrumCanvas.height;
        
        currentSaturation = Math.max(0, Math.min(1, x / width));
        currentLightness = Math.max(0, Math.min(1, 1 - (y / height)));
        
        const color = hslToRgb(currentHue, currentSaturation, currentLightness);
        const hexColor = rgbToHex(color.r, color.g, color.b);
        
        hexInput.value = hexColor;
        if (colorPreview) colorPreview.style.backgroundColor = '#' + hexColor;
        
        // Update cursor position
        if (spectrumCursor) {
            spectrumCursor.style.left = x + 'px';
            spectrumCursor.style.top = y + 'px';
        }
    }
    
    // Initialize spectrum
    drawSpectrum(currentHue);
    if (spectrumCursor) {
        spectrumCursor.style.left = (currentSaturation * 200) + 'px';
        spectrumCursor.style.top = ((1 - currentLightness) * 150) + 'px';
    }
    
    // Toggle panel visibility
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('active');
        });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (panel && !panel.contains(e.target) && !toggle.contains(e.target)) {
            panel.classList.remove('active');
            if (customPicker) customPicker.style.display = 'none';
            isPickerOpen = false;
        }
    });
    
    // Click preview to toggle spectrum picker
    if (colorPreview && customPicker) {
        colorPreview.addEventListener('click', (e) => {
            e.stopPropagation();
            isPickerOpen = !isPickerOpen;
            customPicker.style.display = isPickerOpen ? 'block' : 'none';
        });
    }
    
    // Handle spectrum clicks
    if (spectrumCanvas) {
        spectrumCanvas.addEventListener('mousedown', (e) => {
            const rect = spectrumCanvas.getBoundingClientRect();
            const scaleX = spectrumCanvas.width / rect.width;
            const scaleY = spectrumCanvas.height / rect.height;
            
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            updateColorFromSpectrum(x, y);
            
            const onMouseMove = (e) => {
                const x = Math.max(0, Math.min(spectrumCanvas.width, (e.clientX - rect.left) * scaleX));
                const y = Math.max(0, Math.min(spectrumCanvas.height, (e.clientY - rect.top) * scaleY));
                updateColorFromSpectrum(x, y);
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
    
    // Handle hue slider
    if (hueSlider) {
        hueSlider.value = currentHue;
        hueSlider.addEventListener('input', (e) => {
            currentHue = parseInt(e.target.value);
            drawSpectrum(currentHue);
            
            const color = hslToRgb(currentHue, currentSaturation, currentLightness);
            const hexColor = rgbToHex(color.r, color.g, color.b);
            hexInput.value = hexColor;
            if (colorPreview) colorPreview.style.backgroundColor = '#' + hexColor;
        });
    }
    
    // Update preview as user types
    if (hexInput) {
        hexInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
            e.target.value = value.toUpperCase();
            
            if (value.length === 6 && colorPreview) {
                colorPreview.style.backgroundColor = '#' + value;
            }
        });
    }
    
    // Apply color
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            let hexValue = hexInput.value.replace('#', '');
            
            if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
                const fullColor = '#' + hexValue;
                document.documentElement.style.setProperty('--background-light', fullColor);
                localStorage.setItem('backgroundLightColor', fullColor);
                if (colorPreview) colorPreview.style.backgroundColor = fullColor;
                
                applyBtn.textContent = '✓ Applied';
                setTimeout(() => {
                    applyBtn.textContent = 'Apply';
                }, 1500);
                
                // Close picker after apply
                if (customPicker) customPicker.style.display = 'none';
                isPickerOpen = false;
            } else {
                hexInput.style.borderColor = '#e74c3c';
                setTimeout(() => {
                    hexInput.style.borderColor = '';
                }, 1000);
            }
        });
    }
    
    // Reset to default
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const fullColor = '#' + defaultBackgroundLight;
            document.documentElement.style.setProperty('--background-light', fullColor);
            hexInput.value = defaultBackgroundLight;
            if (colorPreview) colorPreview.style.backgroundColor = fullColor;
            localStorage.removeItem('backgroundLightColor');
        });
    }
});
