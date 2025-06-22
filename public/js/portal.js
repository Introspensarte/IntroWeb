// Portal JavaScript functionality
const API_BASE = '/api';
let currentUser = null;

// Utility functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
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
                max-width: 300px;
            }
            
            .toast-success { border-left: 4px solid #cbbcff; }
            .toast-error { border-left: 4px solid #ff6b6b; }
            
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
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
}

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en el servidor');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Tab system
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-section`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.navbar-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(link => {
        link.classList.add('active');
    });
    
    // Load data for the tab
    loadTabData(tabName);
    
    // Close mobile menu
    closeMobileMenu();
}

function loadTabData(tabName) {
    switch (tabName) {
        case 'profile':
            loadUserProfile();
            break;
        case 'rankings':
            loadRankings();
            break;
        case 'news':
            loadNews();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'activities':
            loadActivitiesToDo();
            break;
    }
}

// User profile functions
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        // Update profile info
        document.getElementById('userName').textContent = currentUser.fullName;
        document.getElementById('userSignature').textContent = currentUser.signature;
        document.getElementById('userBirthday').textContent = currentUser.birthday;
        document.getElementById('userAge').textContent = `${currentUser.age} años`;
        document.getElementById('userTrazos').textContent = currentUser.totalTrazos;
        document.getElementById('userWords').textContent = currentUser.totalWords;
        document.getElementById('userActivities').textContent = currentUser.totalActivities;
        document.getElementById('userJoinDate').textContent = new Date(currentUser.registrationDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        
        // Update rank
        const rankMap = {
            alma_en_transito: 'Alma en tránsito',
            voz_en_boceto: 'Voz en boceto',
            narrador_de_atmosferas: 'Narrador de atmósferas',
            escritor_de_introspecciones: 'Escritor de introspecciones',
            arquitecto_del_alma: 'Arquitecto del alma'
        };
        
        const medalMap = {
            voz_en_boceto: 'Susurros que germinan',
            narrador_de_atmosferas: 'Excelente narrador',
            escritor_de_introspecciones: 'Lector de huellas',
            arquitecto_del_alma: 'Arquitecto de personajes'
        };
        
        document.getElementById('userRank').textContent = rankMap[currentUser.rank] || currentUser.rank;
        const medal = medalMap[currentUser.rank];
        if (medal) {
            document.getElementById('userMedal').innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>"${medal}"`;
        } else {
            document.getElementById('userMedal').textContent = '';
        }
        
        // Load recent activities
        const activities = await makeRequest(`${API_BASE}/activities/user/${currentUser.id}?limit=3`);
        const activitiesContainer = document.getElementById('recentActivities');
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = '<p class="text-gray text-center py-8">Aún no has subido ninguna actividad</p>';
        } else {
            activitiesContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-header">
                        <div class="flex-1">
                            <h4 class="activity-title">${activity.name}</h4>
                            <p class="activity-meta">${activity.type} • ${activity.words} palabras • ${activity.trazos} trazos</p>
                            <p class="activity-category">${activity.arista.replace(/_/g, ' ').toUpperCase()} → ${activity.album}</p>
                        </div>
                        <span class="activity-date">${new Date(activity.date).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Rankings functions
async function loadRankings() {
    try {
        const [trazosData, wordsData] = await Promise.all([
            makeRequest(`${API_BASE}/rankings/trazos`),
            makeRequest(`${API_BASE}/rankings/words`)
        ]);
        
        displayRanking('trazosRanking', trazosData, 'totalTrazos', 'trazos');
        displayRanking('wordsRanking', wordsData, 'totalWords', 'palabras');
        
    } catch (error) {
        console.error('Error loading rankings:', error);
        showMessage('Error al cargar los rankings', 'error');
    }
}

function displayRanking(containerId, data, valueField, unit) {
    const container = document.getElementById(containerId);
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-gray text-center py-8">No hay datos disponibles</p>';
        return;
    }
    
    container.innerHTML = data.map((user, index) => {
        const position = index + 1;
        const isCurrentUser = currentUser && user.id === currentUser.id;
        
        let positionClass = '';
        if (position === 1) positionClass = 'first';
        else if (position === 2) positionClass = 'second';
        else if (position === 3) positionClass = 'third';
        
        return `
            <div class="ranking-item ${isCurrentUser ? 'current-user' : ''}" onclick="showUserProfile(${user.id})">
                <div class="ranking-position ${positionClass}">${position}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${user.fullName}</div>
                    <div class="ranking-signature">${user.signature}</div>
                </div>
                <div class="ranking-value">${user[valueField]} ${unit}</div>
            </div>
        `;
    }).join('');
}

// Content loading functions
async function loadNews() {
    try {
        const newsData = await makeRequest(`${API_BASE}/news`);
        const container = document.getElementById('newsList');
        
        if (!newsData || newsData.length === 0) {
            container.innerHTML = '<p class="text-gray text-center py-8">No hay noticias disponibles</p>';
            return;
        }
        
        container.innerHTML = newsData.map(item => `
            <div class="content-item">
                <h3 class="content-title">${item.title}</h3>
                <p class="content-text">${item.content}</p>
                <div class="content-meta">
                    <span>Por: Admin</span>
                    <span>${new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('newsList').innerHTML = '<p class="text-gray text-center py-8">Error al cargar las noticias</p>';
    }
}

async function loadAnnouncements() {
    try {
        const announcementsData = await makeRequest(`${API_BASE}/announcements`);
        const container = document.getElementById('announcementsList');
        
        if (!announcementsData || announcementsData.length === 0) {
            container.innerHTML = '<p class="text-gray text-center py-8">No hay avisos disponibles</p>';
            return;
        }
        
        container.innerHTML = announcementsData.map(item => `
            <div class="content-item">
                <h3 class="content-title">${item.title}</h3>
                <p class="content-text">${item.content}</p>
                <div class="content-meta">
                    <span>Por: Admin</span>
                    <span>${new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        document.getElementById('announcementsList').innerHTML = '<p class="text-gray text-center py-8">Error al cargar los avisos</p>';
    }
}

async function loadActivitiesToDo() {
    try {
        const activitiesData = await makeRequest(`${API_BASE}/activities-to-do`);
        const container = document.getElementById('activitiesToDoList');
        
        if (!activitiesData || activitiesData.length === 0) {
            container.innerHTML = '<p class="text-gray text-center py-8">No hay actividades disponibles</p>';
            return;
        }
        
        container.innerHTML = activitiesData.map(item => `
            <div class="content-item">
                <h3 class="content-title">${item.title}</h3>
                <p class="content-text">${item.description}</p>
                <div class="content-meta">
                    <span>Arista: ${item.arista.replace(/_/g, ' ').toUpperCase()}</span>
                    <span>Álbum: ${item.album}</span>
                </div>
                ${item.dueDate ? `<div class="content-meta"><span>Fecha límite: ${new Date(item.dueDate).toLocaleDateString('es-ES')}</span></div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading activities to do:', error);
        document.getElementById('activitiesToDoList').innerHTML = '<p class="text-gray text-center py-8">Error al cargar las actividades</p>';
    }
}

// User profile modal
async function showUserProfile(userId) {
    try {
        const user = await makeRequest(`${API_BASE}/profile/${userId}`);
        const activities = await makeRequest(`${API_BASE}/activities/user/${userId}?limit=5`);
        
        document.getElementById('modalUserName').textContent = `Perfil de ${user.fullName}`;
        
        const rankMap = {
            alma_en_transito: 'Alma en tránsito',
            voz_en_boceto: 'Voz en boceto',
            narrador_de_atmosferas: 'Narrador de atmósferas',
            escritor_de_introspecciones: 'Escritor de introspecciones',
            arquitecto_del_alma: 'Arquitecto del alma'
        };
        
        document.getElementById('modalProfileContent').innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-info mb-6">
                    <h4 class="text-lavender font-serif text-lg mb-2">${user.fullName}</h4>
                    <p class="text-pale-gold mb-2">${user.signature}</p>
                    <p class="text-gray mb-4">${rankMap[user.rank] || user.rank}</p>
                </div>
                
                <div class="stats-grid mb-6">
                    <div class="stat-item">
                        <span class="stat-label">Trazos Totales</span>
                        <span class="stat-value text-pale-gold">${user.totalTrazos}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Palabras Totales</span>
                        <span class="stat-value text-lavender">${user.totalWords}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Actividades</span>
                        <span class="stat-value">${user.totalActivities}</span>
                    </div>
                </div>
                
                <div class="recent-activities">
                    <h5 class="text-white font-medium mb-3">Actividades Recientes</h5>
                    ${activities.length === 0 ? 
                        '<p class="text-gray text-sm">No hay actividades</p>' :
                        activities.map(activity => `
                            <div class="activity-item-small mb-2">
                                <div class="text-white text-sm">${activity.name}</div>
                                <div class="text-gray text-xs">${activity.type} • ${activity.trazos} trazos</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
        
        document.getElementById('profileModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showMessage('Error al cargar el perfil', 'error');
    }
}

// Album selection
function updateAlbumOptions() {
    const aristaSelect = document.querySelector('select[name="arista"]');
    const albumSelect = document.querySelector('select[name="album"]');
    
    if (!aristaSelect || !albumSelect) return;
    
    const arista = aristaSelect.value;
    
    const albumOptions = {
        inventario_de_la_vida: [
            'Inventario de Sentidos',
            'Compras y Dilemas',
            'Cartas desde la rutina',
            'Chequeos y descuidos'
        ],
        mapa_del_inconsciente: [
            'Conversaciones en el tiempo',
            'Diario de los sueños',
            'Habitaciones sin salidas'
        ],
        ecos_del_corazon: [
            'Cicatrices invisibles',
            'Melodías en el aire',
            'Ternuras y traiciones'
        ],
        reflejos_en_el_tiempo: [
            'Susurros de otras vidas',
            'Ecos del alma',
            'Conexión espiritual'
        ],
        galeria_del_alma: [
            'Vestigios de la Moda',
            'Obras del Ser',
            'El reflejo de las palabras'
        ]
    };
    
    const albums = albumOptions[arista] || [];
    albumSelect.innerHTML = albums.map(album => 
        `<option value="${album}">${album}</option>`
    ).join('');
}

// Calculate trazos
async function calculateTrazos() {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const type = formData.get('type');
    const words = parseInt(formData.get('words')) || 0;
    const responses = parseInt(formData.get('responses')) || 0;
    
    if (!type || words <= 0) {
        showMessage('Por favor completa los campos de tipo y palabras', 'error');
        return;
    }
    
    try {
        const result = await makeRequest(`${API_BASE}/calculate-trazos`, {
            method: 'POST',
            body: JSON.stringify({ type, words, responses })
        });
        
        document.getElementById('calculatedTrazos').textContent = result.trazos;
        
    } catch (error) {
        console.error('Error calculating trazos:', error);
        showMessage('Error al calcular los trazos', 'error');
    }
}

// Mobile menu functions
function openMobileMenu() {
    document.getElementById('mobileNav').classList.add('active');
}

function closeMobileMenu() {
    document.getElementById('mobileNav').classList.remove('active');
}

// Logout function
async function logout() {
    try {
        await makeRequest(`${API_BASE}/logout`, { method: 'POST' });
        showMessage('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } catch (error) {
        console.error('Error logging out:', error);
        showMessage('Error al cerrar sesión', 'error');
    }
}

// Initialize portal
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        currentUser = await makeRequest(`${API_BASE}/user`);
        
        if (!currentUser) {
            window.location.href = '/login.html';
            return;
        }
        
        // Set up event listeners
        document.querySelectorAll('[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showTab(link.dataset.tab);
            });
        });
        
        document.getElementById('mobileMenuBtn')?.addEventListener('click', openMobileMenu);
        document.getElementById('mobileMenuClose')?.addEventListener('click', closeMobileMenu);
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);
        
        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            document.getElementById('profileModal').classList.remove('active');
        });
        
        // Rankings tabs
        document.querySelectorAll('.ranking-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ranking-list').forEach(l => l.classList.remove('active'));
                
                tab.classList.add('active');
                const ranking = tab.dataset.ranking;
                document.getElementById(`${ranking}Ranking`).classList.add('active');
            });
        });
        
        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            // Arista change listener
            uploadForm.querySelector('select[name="arista"]')?.addEventListener('change', updateAlbumOptions);
            updateAlbumOptions(); // Initialize
            
            // Calculate button
            document.getElementById('calculateBtn')?.addEventListener('click', calculateTrazos);
            
            // Form submission
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                showLoading();
                
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    date: formData.get('date'),
                    words: parseInt(formData.get('words')),
                    type: formData.get('type'),
                    responses: parseInt(formData.get('responses')) || 0,
                    link: formData.get('link') || '',
                    description: formData.get('description') || '',
                    arista: formData.get('arista'),
                    album: formData.get('album')
                };
                
                try {
                    await makeRequest(`${API_BASE}/activities`, {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                    
                    showMessage('Actividad creada exitosamente', 'success');
                    uploadForm.reset();
                    document.getElementById('calculatedTrazos').textContent = '0';
                    updateAlbumOptions();
                    
                    // Refresh user data
                    currentUser = await makeRequest(`${API_BASE}/user`);
                    loadUserProfile();
                    
                } catch (error) {
                    showMessage(error.message, 'error');
                } finally {
                    hideLoading();
                }
            });
        }
        
        // Show profile tab by default
        showTab('profile');
        
    } catch (error) {
        console.error('Error initializing portal:', error);
        window.location.href = '/login.html';
    }
});

// Make functions globally available for onclick handlers
window.showUserProfile = showUserProfile;