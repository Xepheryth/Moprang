// Authorization helper: only these usernames can add/edit/delete
function isAdminUser(){
    try{
        const cur = localStorage.getItem('kans_current');
        return cur === 'admin' || cur === 'admin2';
    }catch(e){ return false; }
}



// Fungsi untuk mendapatkan daftar project dari localStorage
function getProjectsWithShipments() {
    const projectsList = JSON.parse(localStorage.getItem('kans_projects') || '[]');
    return projectsList.map(p => ({
        name: p.name,
        period: p.period || '',
        shipments: []
    }));
}

// Fungsi untuk render project cards
function renderProjectCards() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    
    const projects = getProjectsWithShipments();
    const projectAreasMap = getProjectAreasMap();
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Tidak ada project. Klik tombol (+) untuk menambah project baru.</p>';
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        // Calculate total realisasi percentage from all areas
        let totalRealisasi = 0;
        let countItems = 0;
        const areaList = projectAreasMap[project.name] || [];
        
        if (Array.isArray(areaList)) {
            areaList.forEach(area => {
                if (Array.isArray(area.items)) {
                    area.items.forEach(item => {
                        if (item.volume && item.terkirim) {
                            const realisasi = (parseFloat(item.terkirim) / parseFloat(item.volume)) * 100;
                            totalRealisasi += realisasi;
                            countItems++;
                        }
                    });
                }
            });
        }
        
        const avgRealisasi = countItems > 0 ? Math.round(totalRealisasi / countItems) : 0;
        
        card.innerHTML = `
            <div class="project-card-header">
                <h3 class="project-card-title">${project.name}</h3>
                <h3 class="project-card-period">${project.period || ''}</h3>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Realisasi: ${avgRealisasi}%</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${avgRealisasi}%; background: linear-gradient(90deg, #ffd700, #ff8c00);">Progress ${avgRealisasi}%</div>
                </div>
            </div>
            <div class="project-card-actions" style="margin-top:10px;">
                <a class="view-link" href="project-detail.html?name=${encodeURIComponent(project.name)}" onclick="localStorage.setItem('kans_current_project', ${JSON.stringify(project.name)});" title="Lihat detail project">Lihat</a>
            </div>
        `;
        container.appendChild(card);
        // Make card clickable 
        card.addEventListener('click', function(e) {
            const target = e.target;
            if (target.closest('button') || target.closest('a')) return; // let internal controls handle clicks
            try { localStorage.setItem('kans_current_project', project.name); } catch (err) {}
            window.location.href = 'project-detail.html?name=' + encodeURIComponent(project.name);
        });
    });
}

// Fungsi untuk update statistik di halaman beranda
function updateHomeStats() {
    const projects = getProjectList();
    const projectAreasMap = getProjectAreasMap();
    
    let totalProjects = projects.length;
    let totalAreas = 0;
    let totalItems = 0;
    let totalProgress = 0;
    let progressCount = 0;
    
    projects.forEach(project => {
        const areas = projectAreasMap[project.name] || [];
        totalAreas += areas.length;
        
        areas.forEach(area => {
            if (area.items) {
                totalItems += area.items.length;
                area.items.forEach(item => {
                    if (item.volume && item.terkirim) {
                        const progress = (parseFloat(item.terkirim) / parseFloat(item.volume)) * 100;
                        totalProgress += progress;
                        progressCount++;
                    }
                });
            }
        });
    });
    
    const avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;
    
    // Update DOM elements
    const totalProjectsEl = document.getElementById('total-projects');
    const totalAreasEl = document.getElementById('total-areas');
    const totalItemsEl = document.getElementById('total-items');
    const avgProgressEl = document.getElementById('avg-progress');
    
    if (totalProjectsEl) totalProjectsEl.textContent = totalProjects;
    if (totalAreasEl) totalAreasEl.textContent = totalAreas;
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (avgProgressEl) avgProgressEl.textContent = avgProgress + '%';
}

// Fungsi untuk update progress - tidak lagi digunakan, hanya untuk backward compatibility
function updateProgress(id) {
    // Fungsi deprecated - data shipment sudah tidak digunakan
}

// --- Area / Item persistence helpers ---
function getProjectList() {
    return JSON.parse(localStorage.getItem('kans_projects') || '[]');
}

function getProjectAreasMap() {
    return JSON.parse(localStorage.getItem('kans_project_areas') || '{}');
}

function setProjectAreasMap(map) {
    localStorage.setItem('kans_project_areas', JSON.stringify(map));
}

// Render project dropdown used on Areas page
function renderProjectAreaDropdown() {
    const sel = document.getElementById('project-select-area');
    if (!sel) return;
    sel.innerHTML = '';
    const projects = getProjectList();
    if (projects.length === 0) {
        sel.innerHTML = '<option value="">(Belum ada project)</option>';
        return;
    }
    projects.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = p.name;
        sel.appendChild(opt);
    });
}

// Render area cards for a project index
function renderAreaCards(projectIdx) {
    const container = document.getElementById('areas-container');
    if (!container) return;
    container.innerHTML = '';
    const projects = getProjectList();
    if (!projects[projectIdx]) {
        container.innerHTML = '<p style="color:#999;">Pilih project terlebih dahulu.</p>';
        return;
    }
    const projectName = projects[projectIdx].name;
    const map = getProjectAreasMap();
    let areas = map[projectName] || [];
    if (areas.length === 0) {
        // Jika belum ada area, buat satu area default agar UI menampilkan area langsung
        const defaultAreaName = 'Umum';
        areas = [{ name: defaultAreaName, items: [] }];
        map[projectName] = areas;
        setProjectAreasMap(map);
    }
    areas.forEach((area, idx) => {
        // Calculate realisasi percentage for this area
        let totalRealisasi = 0;
        let countRealisasi = 0;
        if(Array.isArray(area.items)) {
            area.items.forEach(it => {
                if(it.volume && it.terkirim) {
                    const realisasi = (parseFloat(it.terkirim) / parseFloat(it.volume)) * 100;
                    totalRealisasi += realisasi;
                    countRealisasi++;
                }
            });
        }
        const avgRealisasi = countRealisasi > 0 ? Math.round(totalRealisasi / countRealisasi) : 0;
        
        const card = document.createElement('div');
        card.className = 'area-card';
        card.innerHTML = `
            <h3>${area.name}</h3>
            <p>Jumlah Item: ${area.items ? area.items.length : 0}</p>
            <div class="area-card-progress">
                <span class="area-card-progress-label">Realisasi: ${avgRealisasi}%</span>
                <div class="area-card-progress-bar">
                    <div class="area-card-progress-fill" style="width: ${avgRealisasi}%;"></div>
                </div>
            </div>
            <div class="area-items" style="display:none;">
                <ul>${(area.items||[]).map(it => {
                    const itemName = typeof it === 'object' ? (it.name || it) : it;
                    return `<li>${itemName}</li>`;
                }).join('')}</ul>
            </div>
            <div class="area-card-actions">
                <a href="area-detail.html?project=${encodeURIComponent(projectName)}&area=${encodeURIComponent(area.name)}" class="view-link" onclick="try{localStorage.setItem('kans_current_project', '${projectName}'); localStorage.setItem('kans_current_area','${area.name}');}catch(e){}">Lihat Detail</a>
                <button class="edit-area-btn" data-idx="${idx}" title="Edit area">Edit</button>
                <button class="delete-area-btn" data-idx="${idx}" title="Hapus area">Hapus</button>
            </div>
        `;

        // toggle items on card click (ignore clicks on links/buttons)
        card.addEventListener('click', function(e){
            if (e.target.closest('a') || e.target.closest('button')) return;
            const itemsDiv = this.querySelector('.area-items');
            if(itemsDiv) itemsDiv.style.display = itemsDiv.style.display === 'none' ? 'block' : 'none';
        });

        container.appendChild(card);

        // Edit handler
        const editBtn = card.querySelector('.edit-area-btn');
        if(editBtn){
            editBtn.addEventListener('click', function(e){
                e.stopPropagation();
                if(!isAdminUser()){
                    alert('Akses ditolak: hanya admin yang dapat mengubah area.');
                    return;
                }
                const newName = prompt('Ubah nama area', area.name);
                if(newName && newName.trim()){
                    const map = getProjectAreasMap();
                    if(map[projectName] && map[projectName][idx]){
                        map[projectName][idx].name = newName.trim();
                        setProjectAreasMap(map);
                        renderAreaCards(projectIdx);
                    }
                }
            });
        }

        // Delete handler
        const delBtn = card.querySelector('.delete-area-btn');
        if(delBtn){
            delBtn.addEventListener('click', function(e){
                e.stopPropagation();
                if(!isAdminUser()){
                    alert('Akses ditolak: hanya admin yang dapat menghapus area.');
                    return;
                }
                if(confirm('Hapus area ini?')){
                    const map = getProjectAreasMap();
                    if(map[projectName]){
                        map[projectName].splice(idx, 1);
                        setProjectAreasMap(map);
                        renderAreaCards(projectIdx);
                    }
                }
            });
        }
    });
}

// Konfigurasi Link Sosial Media
const socialMediaLinks = {
    facebook: 'facebook.com/kanjengnurmasejahtera',
    email: 'mailto:kanjengnurmasejahtera@gmail.com',
    instagram: 'https://www.instagram.com/kanjengnurmasejahtera?igsh=OTB3amthMzJyNTNw',
    whatsapp: 'https://wa.me/6285224638774',
};

// Setup Social Media Links
document.querySelectorAll('.social-link').forEach(link => {
    const social = link.getAttribute('data-social');
    if (socialMediaLinks[social]) {
        link.href = socialMediaLinks[social];
    }
});

// Modal functions
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        const first = modal.querySelector('input');
        if (first) first.focus();
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Add Project Modal
const addProjectBtn = document.getElementById('add-project-btn');
const addProjectModal = document.getElementById('add-project-modal');
const addProjectForm = document.getElementById('add-project-form');
const addProjectCancel = document.getElementById('add-project-cancel');

if (addProjectBtn) {
    addProjectBtn.addEventListener('click', function() {
        openModal(addProjectModal);
    });
}

if (addProjectCancel) {
    addProjectCancel.addEventListener('click', function() {
        closeModal(addProjectModal);
    });
}

if (addProjectModal) {
    addProjectModal.addEventListener('click', function(e) {
        if (e.target === addProjectModal) {
            closeModal(addProjectModal);
        }
    });
}

if (addProjectForm) {
    addProjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if(!isAdminUser()){
            alert('Akses ditolak: hanya admin yang dapat menambah project.');
            return;
        }
        const projectName = document.getElementById('project-name').value.trim();
        const projectPeriod = document.getElementById('project-period').value.trim();
        
        if (!projectName) {
            alert('Nama project diperlukan');
            return;
        }

        // Save project to localStorage
        const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
        if (!projects.find(p => p.name === projectName)) {
            projects.push({ name: projectName, period: projectPeriod });
            localStorage.setItem('kans_projects', JSON.stringify(projects));
        }
        
        addProjectForm.reset();
        closeModal(addProjectModal);
        try{ localStorage.setItem('kans_current_project', projectName); }catch(e){}
        renderProjectCards();
        renderProjectAreaDropdown();

                // Also maintain a list of projects for quick access
                try {
                    const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
                    const exists = projects.find(p => p.name === projectName);
                    if (!exists) {
                        projects.push({ name: projectName, period: projectPeriod || '' });
                        localStorage.setItem('kans_projects', JSON.stringify(projects));
                    }
                } catch (e) {}

                // Render updated project cards
                renderProjectCards();

                // Reset and close modal
                addProjectForm.reset();
                closeModal(addProjectModal);

                // Save last created/selected project and redirect to project-detail.html
                try { localStorage.setItem('kans_current_project', projectName); } catch(e){}
                // Navigate to project detail page to show details
                window.location.href = 'project-detail.html';
    });
}

// Navigasi Halaman
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active');

    // Show/hide add project button based on page
    const addProjectBtn = document.getElementById('add-project-btn');
    if(addProjectBtn){
        addProjectBtn.style.display = (pageId === 'shipments' && isAdminUser()) ? 'block' : 'none';
    }

    // Update home page stats when showing home page
    if(pageId === 'home'){
        updateHomeStats();
    }

    // If navigating to profile page, load profile data
    if(pageId === 'profile'){
        loadProfile();
        setupProfilePhotoUpload(); // Setup photo upload handler
    }
}

// Fungsi Search
function searchShipments(query) {
    // Search functionality disabled - aplikasi sekarang menggunakan project-based system dengan localStorage
    if (!query.trim()) {
        renderProjectCards();
        return;
    }
    
    const container = document.getElementById('projects-container');
    const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
    const queryLower = query.toLowerCase();
    
    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        (p.period && p.period.toLowerCase().includes(queryLower))
    );
    
    if (filteredProjects.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Tidak ada hasil pencarian untuk "' + query + '"</p>';
        return;
    }
    
    // Render filtered projects
    container.innerHTML = '';
    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-card-header">
                <h3 class="project-card-title">${project.name}</h3>
                <h3 class="project-card-period">${project.period || ''}</h3>
            </div>
            <div class="project-card-actions" style="margin-top:10px;">
                <a class="view-link" href="project-detail.html?name=${encodeURIComponent(project.name)}" onclick="localStorage.setItem('kans_current_project', ${JSON.stringify(project.name)});" title="Lihat detail project">Lihat</a>
            </div>
        `;
        container.appendChild(card);
        card.addEventListener('click', function(e) {
            const target = e.target;
            if (target.closest('button') || target.closest('a')) return;
            try { localStorage.setItem('kans_current_project', project.name); } catch (err) {}
            window.location.href = 'project-detail.html?name=' + encodeURIComponent(project.name);
        });
    });
}

// Setup event listener untuk search
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    showPage('shipments'); // Tampilkan halaman Daftar Project
    searchShipments(query);
});

document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const query = this.value;
        showPage('shipments'); // Tampilkan halaman Daftar Project
        searchShipments(query);
    }
});

// Setup event listener untuk navigasi
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const pageId = this.getAttribute('data-page');
        if (pageId) {
            e.preventDefault();
            showPage(pageId);
            const si = document.getElementById('search-input');
            if (si) si.value = '';
        }
    });
});

// Setup event listeners for Areas page controls if present
document.addEventListener('DOMContentLoaded', function(){
    const projectSelectArea = document.getElementById('project-select-area');
    const addAreaBtn = document.getElementById('add-area-btn');
    const addAreaModal = document.getElementById('add-area-modal');
    const addAreaForm = document.getElementById('add-area-form');
    const addAreaCancel = document.getElementById('add-area-cancel');
    const areasContainer = document.getElementById('areas-container');

    if(projectSelectArea){
        renderProjectAreaDropdown();
        projectSelectArea.addEventListener('change', function(){
            const idx = parseInt(this.value);
            if (!isNaN(idx)) renderAreaCards(idx);
        });
    }

    if(addAreaForm){
        addAreaForm.addEventListener('submit', function(e){
            e.preventDefault();
            if(!isAdminUser()){
                alert('Akses ditolak: hanya admin yang dapat menambah area.');
                return;
            }
            const areaName = (document.getElementById('area-name')||{}).value || '';
            const sel = document.getElementById('project-select-area');
            const projIdx = sel ? parseInt(sel.value) : -1;
            if(!areaName.trim() || projIdx < 0){ alert('Pilih project dan isi nama area'); return; }
            const projects = getProjectList();
            const projectName = projects[projIdx].name;
            const map = getProjectAreasMap();
            if(!map[projectName]) map[projectName] = [];
            map[projectName].push({ name: areaName.trim(), items: [] });
            setProjectAreasMap(map);
            renderAreaCards(projIdx);
            addAreaForm.reset();
            closeModal(addAreaModal);
        });
    }

    if(addAreaBtn){
        addAreaBtn.addEventListener('click', function(){ openModal(addAreaModal); });
    }
    if(addAreaCancel){ addAreaCancel.addEventListener('click', function(){ closeModal(addAreaModal); }); }
    if(addAreaModal){ addAreaModal.addEventListener('click', function(e){ if(e.target===addAreaModal) closeModal(addAreaModal); }); }
});

// Minimal authentication helpers (no modals) — keep profile UI functional
function renderUserState(){
    const cur = localStorage.getItem('kans_current');
    const profileLink = document.getElementById('profile-link');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userBadge = document.getElementById('user-badge');
    if(cur){
        if(loginBtn) loginBtn.style.display='none';
        if(registerBtn) registerBtn.style.display='none';
        if(profileLink) profileLink.style.display='inline-block';
        if(userBadge){
            userBadge.style.display = 'inline-flex';
            userBadge.innerHTML = `<span class="user-name">Hi, ${cur}</span><button id="logout-btn" class="logout-btn">Logout</button>`;
            const out = document.getElementById('logout-btn');
            if(out){ out.addEventListener('click', function(){ clearCurrentUser(); alert('Logged out'); }); }
        }
    } else {
        if(loginBtn) loginBtn.style.display='inline-block';
        if(registerBtn) registerBtn.style.display='inline-block';
        if(profileLink) profileLink.style.display='none';
        if(userBadge){ userBadge.style.display='none'; userBadge.innerHTML=''; }
    }
    // hide admin-only controls for non-admin users
    try{
        const addProjectBtn = document.getElementById('add-project-btn');
        if(addProjectBtn && !isAdminUser()) addProjectBtn.style.display = 'none';
        const addAreaBtn = document.getElementById('add-area-btn');
        if(addAreaBtn && !isAdminUser()) addAreaBtn.style.display = 'none';
    }catch(e){}
}

function clearCurrentUser(){
    localStorage.removeItem('kans_current');
    localStorage.removeItem('kans_token');
    renderUserState();
    try{ window.location.href = 'index.html'; }catch(e){}
}

function loadProfile(){
    const cur = localStorage.getItem('kans_current');
    const token = localStorage.getItem('kans_token');
    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const photoEl = document.getElementById('profile-photo');
    const profileInfo = document.getElementById('profile-info');
    const loading = document.getElementById('profile-loading');
    const error = document.getElementById('profile-error');
    
    if(!cur){
        if(error){ error.textContent = 'Tidak ada user. Silakan login.'; error.style.display='block'; }
        if(profileInfo) profileInfo.style.display='none';
        return;
    }
    
    if(loading) loading.style.display='block';
    if(error) error.style.display='none';
    
    // Fetch profile dari backend
    if(token){
        fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if(loading) loading.style.display='none';
            if(data.success && data.profile){
                const profile = data.profile;
                if(usernameEl) usernameEl.textContent = profile.username || cur;
                if(emailEl) emailEl.textContent = profile.email || '-';
                if(profile.profile_photo && photoEl){
                    photoEl.src = profile.profile_photo;
                    photoEl.style.borderColor = '#FFD700';
                }
                if(profileInfo) profileInfo.style.display='block';
            } else {
                // Fallback ke localStorage jika API gagal
                if(usernameEl) usernameEl.textContent = cur;
                if(profileInfo) profileInfo.style.display='block';
            }
        })
        .catch(err => {
            console.error('Profile fetch error:', err);
            if(loading) loading.style.display='none';
            // Fallback
            if(usernameEl) usernameEl.textContent = cur;
            if(profileInfo) profileInfo.style.display='block';
        });
    } else {
        // Fallback jika tidak ada token
        if(loading) loading.style.display='none';
        if(usernameEl) usernameEl.textContent = cur;
        if(profileInfo) profileInfo.style.display='block';
    }
}

// Handle profile photo upload
function setupProfilePhotoUpload(){
    const photoInput = document.getElementById('profile-photo-input');
    const photoEl = document.getElementById('profile-photo');
    const statusEl = document.getElementById('profile-photo-status');
    const token = localStorage.getItem('kans_token');
    
    if(!photoInput) return;
    
    photoInput.addEventListener('change', function(e){
        const file = e.target.files[0];
        if(!file) return;
        
        // Validasi ukuran file
        if(file.size > 5 * 1024 * 1024){
            if(statusEl) statusEl.textContent = '❌ File terlalu besar (maksimal 5MB)';
            return;
        }
        
        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if(!validTypes.includes(file.type)){
            if(statusEl) statusEl.textContent = '❌ Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP)';
            return;
        }
        
        // Preview lokal
        const reader = new FileReader();
        reader.onload = function(event){
            if(photoEl) photoEl.src = event.target.result;
        };
        reader.readAsDataURL(file);
        
        // Upload ke server
        if(!token){
            if(statusEl) statusEl.textContent = '❌ Harus login untuk upload foto';
            return;
        }
        
        if(statusEl) statusEl.textContent = '⏳ Uploading...';
        
        const formData = new FormData();
        formData.append('photo', file);
        
        fetch('http://localhost:3000/api/profile/photo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                if(statusEl) statusEl.textContent = '✅ Foto berhasil diupload';
                // Update foto display
                if(photoEl) photoEl.src = data.photoPath;
            } else {
                if(statusEl) statusEl.textContent = `❌ ${data.message || 'Gagal upload foto'}`;
            }
        })
        .catch(err => {
            console.error('Upload error:', err);
            if(statusEl) statusEl.textContent = '❌ Gagal upload foto. Periksa koneksi atau server.';
        });
    });
}

const profileRefreshBtn = document.getElementById('profile-refresh-btn');
if(profileRefreshBtn) profileRefreshBtn.addEventListener('click', loadProfile);

// initialize UI state
renderUserState();
window.clearCurrentUser = clearCurrentUser;

// Render awal
renderProjectCards();
updateHomeStats();
showPage('home'); // Tampilkan halaman beranda

// Delay ini memastikan semua element sudah siap
setTimeout(function handleQueryOnLoad(){
    try{
        const params = new URLSearchParams(window.location.search);
        const open = params.get('open');
        const projectName = params.get('project') || params.get('name');
        if(open === 'areas' && projectName){
            // ensure project dropdown is populated
            renderProjectAreaDropdown();
            // find index of project
            const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
            const idx = projects.findIndex(p => p.name === projectName);
            if(idx >= 0){
                showPage('areas');
                const sel = document.getElementById('project-select-area');
                if(sel){ sel.value = idx; renderAreaCards(idx); }
            }
        }
    }catch(e){/* ignore */}
}, 100);