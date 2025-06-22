// Authentication JavaScript
const API_BASE = '/api';

// Utility functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function showMessage(message, type = 'success') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                color: white;
                z-index: 1000;
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease;
            }
            
            .toast-success {
                border-left: 4px solid #cbbcff;
            }
            
            .toast-error {
                border-left: 4px solid #ff6b6b;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Manual close
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en el servidor');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Registration form handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        showLoading();
        
        const formData = new FormData(e.target);
        const data = {
            fullName: formData.get('fullName'),
            age: parseInt(formData.get('age')),
            birthday: formData.get('birthday'),
            faceClaim: formData.get('faceClaim'),
            signature: formData.get('signature'),
            facebookLink: formData.get('facebookLink'),
            motivation: formData.get('motivation')
        };
        
        // Client-side validation
        if (!data.signature.startsWith('#')) {
            showError('signature', 'La firma debe comenzar con #');
            hideLoading();
            return;
        }
        
        if (data.motivation.length < 20) {
            showError('motivation', 'La motivación debe tener al menos 20 caracteres');
            hideLoading();
            return;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(data.birthday)) {
            showError('birthday', 'El formato debe ser dd/mm');
            hideLoading();
            return;
        }
        
        try {
            const result = await makeRequest(`${API_BASE}/register`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            showMessage('¡Registro exitoso! Redirigiendo al portal...', 'success');
            
            setTimeout(() => {
                window.location.href = '/portal.html';
            }, 2000);
            
        } catch (error) {
            showMessage(error.message, 'error');
            hideLoading();
        }
    });
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        showLoading();
        
        const formData = new FormData(e.target);
        const data = {
            signature: formData.get('signature')
        };
        
        // Client-side validation
        if (!data.signature.startsWith('#')) {
            showError('signature', 'La firma debe comenzar con #');
            hideLoading();
            return;
        }
        
        try {
            const result = await makeRequest(`${API_BASE}/login`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            showMessage(`¡Bienvenido ${result.fullName}!`, 'success');
            
            setTimeout(() => {
                window.location.href = '/portal.html';
            }, 1500);
            
        } catch (error) {
            showMessage(error.message, 'error');
            hideLoading();
        }
    });
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Only check auth on auth pages
    if (window.location.pathname === '/registro.html' || window.location.pathname === '/login.html') {
        try {
            const user = await makeRequest(`${API_BASE}/user`);
            if (user) {
                // User is already logged in, redirect to portal
                window.location.href = '/portal.html';
            }
        } catch (error) {
            // User not logged in, stay on current page
        }
    }
});