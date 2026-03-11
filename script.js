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
    if (!container) {
        console.warn('❌ projects-container element not found! (Not on shipments page?)');
        return;
    }
    
    container.innerHTML = '';
    
    const projects = getProjectsWithShipments();
    const projectAreasMap = getProjectAreasMap();
    console.log('📊 renderProjectCards() called - Found', projects.length, 'projects in storage');
    
    if (projects.length === 0) {
        console.warn('⚠️ No projects found in localStorage');
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Tidak ada project. Klik tombol (+) untuk menambah project baru.</p>';
        return;
    }
    console.log('✅ Rendering', projects.length, 'project cards');
    
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
    if (!container) {
        console.error('areas-container element not found!');
        return;
    }
    container.innerHTML = '';
    const projects = getProjectList();
    
    console.log('renderAreaCards called with projectIdx:', projectIdx);
    console.log('Total projects:', projects.length);
    
    if (!projects || !projects[projectIdx]) {
        console.warn('Invalid projectIdx:', projectIdx, 'Available projects:', projects.length);
        container.innerHTML = '<p style="color:#999;">Pilih project terlebih dahulu.</p>';
        return;
    }
    
    const projectName = projects[projectIdx].name;
    console.log('Rendering areas for project:', projectName);
    
    const map = getProjectAreasMap();
    let areas = map[projectName] || [];
    
    console.log('Areas found for project "' + projectName + '":', areas.length);
    
    if (areas.length === 0) {
        // Jika belum ada area, tampilkan pesan kosong (jangan buat default)
        console.log('No areas found, showing empty state');
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">Belum ada area di project ini. Klik "+ Tambah Area" untuk membuat area baru.</p>';
        return;
    }
    
    console.log('About to render', areas.length, 'area cards');
    
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
        console.log('✓ Area card rendered for:', area.name);

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
    console.log('showPage called with:', pageId);
    
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.classList.add('active');
        console.log('✓ Page "' + pageId + '" is now active');
    } else {
        console.error('Page element with id "' + pageId + '" not found!');
        return;
    }
    
    // Update active nav link (only if nav link exists)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if(navLink) {
        navLink.classList.add('active');
        console.log('✓ Nav link for page "' + pageId + '" marked as active');
    } else {
        console.log('⚠ No nav link found for page "' + pageId + '" (this is OK for query-param loaded pages)');
    }

    // Show/hide add project button based on page
    const addProjectBtn = document.getElementById('add-project-btn');
    if(addProjectBtn){
        addProjectBtn.style.display = (pageId === 'shipments' && isAdminUser()) ? 'block' : 'none';
    }

    // Update home page stats when showing home page
    if(pageId === 'home'){
        updateHomeStats();
    }

    // Render project cards when showing shipments page
    if(pageId === 'shipments'){
        console.log('📄 Shipments page - rendering project cards...');
        renderProjectCards();
    }

    // Render areas when showing areas page
    if(pageId === 'areas'){
        renderProjectAreaDropdown();
        // Auto-select first project if available
        const sel = document.getElementById('project-select-area');
        if(sel && sel.options.length > 0) {
            sel.value = '0';
            renderAreaCards(0);
        }
    }

    // If navigating to profile page, load profile data
    if(pageId === 'profile'){
        console.log('👤 Profile page - loading profile...');
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

// Setup event listener untuk search (if search elements exist)
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if(searchBtn) {
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value;
        showPage('shipments'); // Tampilkan halaman Daftar Project
        searchShipments(query);
    });
}

if(searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value;
            showPage('shipments'); // Tampilkan halaman Daftar Project
            searchShipments(query);
        }
    });
}

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
    console.log('=== DOMContentLoaded started ===');
    
    const projectSelectArea = document.getElementById('project-select-area');
    const addAreaBtn = document.getElementById('add-area-btn');
    const addAreaModal = document.getElementById('add-area-modal');
    const addAreaForm = document.getElementById('add-area-form');
    const addAreaCancel = document.getElementById('add-area-cancel');
    const areasContainer = document.getElementById('areas-container');
    
    console.log('Form elements found:', {
        projectSelectArea: !!projectSelectArea,
        addAreaBtn: !!addAreaBtn,
        addAreaModal: !!addAreaModal,
        addAreaForm: !!addAreaForm,
        addAreaCancel: !!addAreaCancel,
        areasContainer: !!areasContainer
    });

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
            console.log('✓ Add area form submitted');
            
            if(!isAdminUser()){
                alert('Akses ditolak: hanya admin yang dapat menambah area.');
                return;
            }
            
            const areaNameInput = document.getElementById('area-name');
            const areaName = areaNameInput ? areaNameInput.value.trim() : '';
            const sel = document.getElementById('project-select-area');
            const projIdx = sel ? parseInt(sel.value) : -1;
            
            console.log('Form data:', {areaName, projIdx, selValue: sel ? sel.value : 'N/A'});
            
            if(!areaName || projIdx < 0){ 
                alert('Pilih project dan isi nama area'); 
                return; 
            }
            
            const projects = getProjectList();
            if(!projects || projIdx >= projects.length){
                alert('Project tidak valid');
                return;
            }
            
            const projectName = projects[projIdx].name;
            console.log('✓ Project selected:', projectName);
            
            const map = getProjectAreasMap();
            if(!map[projectName]) map[projectName] = [];
            
            // Check if area already exists
            if(map[projectName].find(a => a.name === areaName)){
                alert('Area dengan nama ini sudah ada');
                return;
            }
            
            map[projectName].push({ name: areaName, items: [] });
            setProjectAreasMap(map);
            console.log('✓ Area created:', areaName, 'in project:', projectName);
            console.log('✓ Stored to localStorage');
            
            // Prepare redirect URL
            const encodedProject = encodeURIComponent(projectName);
            const encodedArea = encodeURIComponent(areaName);
            const redirectUrl = 'area-detail.html?project=' + encodedProject + '&area=' + encodedArea;
            
            console.log('✓ Redirect URL:', redirectUrl);
            
            // Reset form dan close modal dahulu
            addAreaForm.reset();
            closeModal(addAreaModal);
            
            // Langsung redirect tanpa delay
            console.log('✓ Redirecting now...');
            window.location.href = redirectUrl;
        });
    }

    if(addAreaBtn){
        addAreaBtn.addEventListener('click', function(){ openModal(addAreaModal); });
    }
    if(addAreaCancel){ addAreaCancel.addEventListener('click', function(){ closeModal(addAreaModal); }); }
    if(addAreaModal){ addAreaModal.addEventListener('click', function(e){ if(e.target===addAreaModal) closeModal(addAreaModal); }); }
    
    console.log('=== DOMContentLoaded completed - all listeners attached ===');
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
    console.log('🎯 loadProfile() called - Current user:', cur);
    
    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const photoEl = document.getElementById('profile-photo');
    const profileInfo = document.getElementById('profile-info');
    const loading = document.getElementById('profile-loading');
    const error = document.getElementById('profile-error');
    
    if(!cur){
        console.error('❌ No current user set!');
        if(error){ error.textContent = 'Tidak ada user. Silakan login.'; error.style.display='block'; }
        if(profileInfo) profileInfo.style.display='none';
        return;
    }
    console.log('✅ User found:', cur);
    
    if(loading) loading.style.display='none';
    if(error) error.style.display='none';
    
    // Load profile from localStorage
    if(usernameEl) usernameEl.textContent = cur;
    
    // Try to load email from kans_users
    try {
        const users = JSON.parse(localStorage.getItem('kans_users') || '[]');
        const user = users.find(u => u.username === cur);
        if(user && emailEl) emailEl.textContent = user.email || '-';
    } catch(e) {
        if(emailEl) emailEl.textContent = '-';
    }
    
    // Load profile photo from localStorage
    try {
        const userProfiles = JSON.parse(localStorage.getItem('kans_user_profiles') || '{}');
        if(userProfiles[cur] && userProfiles[cur].photo && photoEl){
            photoEl.src = userProfiles[cur].photo;
            photoEl.style.borderColor = '#FFD700';
        }
    } catch(e) {
        // Fallback if photo doesn't exist
    }
    
    if(profileInfo) profileInfo.style.display='block';
}

// Handle profile photo upload
function setupProfilePhotoUpload(){
    const photoInput = document.getElementById('profile-photo-input');
    const photoEl = document.getElementById('profile-photo');
    const statusEl = document.getElementById('profile-photo-status');
    const currentUser = localStorage.getItem('kans_current');
    
    if(!photoInput) return;
    
    photoInput.addEventListener('change', function(e){
        const file = e.target.files[0];
        if(!file) return;
        
        // Check if user is logged in
        if(!currentUser){
            if(statusEl) statusEl.textContent = '❌ Harus login untuk upload foto';
            return;
        }
        
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
        
        if(statusEl) statusEl.textContent = '⏳ Processing...';
        
        // Convert file to base64 dan simpan di localStorage
        const reader = new FileReader();
        reader.onload = function(event){
            try {
                const base64 = event.target.result;
                
                // Store profile photo in localStorage
                let userProfiles = JSON.parse(localStorage.getItem('kans_user_profiles') || '{}');
                userProfiles[currentUser] = {
                    photo: base64,
                    uploadedAt: new Date().toISOString()
                };
                localStorage.setItem('kans_user_profiles', JSON.stringify(userProfiles));
                
                // Update display
                if(photoEl) photoEl.src = base64;
                if(statusEl) statusEl.textContent = '✅ Foto berhasil diupload';
            } catch(err) {
                console.error('Photo save error:', err);
                if(statusEl) statusEl.textContent = '❌ Gagal menyimpan foto';
            }
        };
        reader.onerror = function(){
            if(statusEl) statusEl.textContent = '❌ Gagal membaca file';
        };
        reader.readAsDataURL(file);
    });
}

const profileRefreshBtn = document.getElementById('profile-refresh-btn');
if(profileRefreshBtn) profileRefreshBtn.addEventListener('click', loadProfile);

// ============= DELIVERY SCHEDULE MANAGEMENT =============

// Get all delivery schedules from localStorage
function getDeliverySchedules() {
    try {
        return JSON.parse(localStorage.getItem('kans_delivery_schedules') || '[]');
    } catch(e) {
        return [];
    }
}

// Save delivery schedules to localStorage
function saveDeliverySchedules(schedules) {
    try {
        localStorage.setItem('kans_delivery_schedules', JSON.stringify(schedules));
    } catch(e) {
        console.error('Error saving schedules:', e);
    }
}

// Render delivery schedule table
function renderDeliverySchedule() {
    const tbody = document.getElementById('schedule-tbody');
    if (!tbody) return;
    
    const schedules = getDeliverySchedules();
    
    if (schedules.length === 0) {
        tbody.innerHTML = '<tr style="text-align: center;"><td colspan="7" style="padding: 20px; color: #999;">Tidak ada jadwal pengiriman</td></tr>';
        return;
    }
    
    // Sort by delivery date (newest first)
    schedules.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    schedules.forEach((schedule, index) => {
        const dateObj = new Date(schedule.date + 'T00:00:00');
        const dateStr = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Map status to class name
        let statusClass = '';
        if (schedule.status === 'Dijadwalkan') statusClass = 'dijadwalkan';
        else if (schedule.status === 'Dalam Pengiriman') statusClass = 'pengiriman';
        else if (schedule.status === 'Tiba di Gudang') statusClass = 'tiba';
        else if (schedule.status === 'Selesai') statusClass = 'selesai';
        else statusClass = 'dijadwalkan';
        
        const statusDisplay = schedule.status || 'Dijadwalkan';
        
        html += `<tr>
            <td style="text-align: center; width: 40px;">${index + 1}</td>
            <td>${dateStr}</td>
            <td>${schedule.supplier || '-'}</td>
            <td>${schedule.description || '-'}</td>
            <td>${schedule.quantity || '-'}</td>
            <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
            <td style="text-align: center; width: 60px;">
                ${isAdminUser() ? `<div class="schedule-menu-wrapper">
                    <button class="schedule-menu-btn" data-index="${index}" type="button">⋮</button>
                    <div class="schedule-context-menu" id="schedule-row-menu-${index}" style="display:none;">
                        <button type="button" class="menu-item edit-item" data-index="${index}">✏️ Edit</button>
                        <button type="button" class="menu-item delete-item" data-index="${index}">🗑️ Hapus</button>
                    </div>
                </div>` : '-'}
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
}

// Show/hide admin controls based on user role
function updateScheduleAdminControls() {
    const headerMenu = document.getElementById('schedule-header-menu-wrapper');
    if (headerMenu) {
        headerMenu.style.display = isAdminUser() ? 'block' : 'none';
    }
}

// Open schedule modal for adding new schedule
function openAddScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    const form = document.getElementById('schedule-form');
    const title = document.getElementById('schedule-modal-title');
    
    if (!modal) return;
    
    title.textContent = 'Tambah Jadwal Pengiriman';
    form.reset();
    form.dataset.editIndex = '';
    modal.style.display = 'flex';
}

// Open schedule modal for editing
function editDeliverySchedule(index) {
    const schedules = getDeliverySchedules();
    const schedule = schedules[index];
    
    if (!schedule) return;
    
    const modal = document.getElementById('schedule-modal');
    const form = document.getElementById('schedule-form');
    const title = document.getElementById('schedule-modal-title');
    
    if (!modal) return;
    
    title.textContent = 'Edit Jadwal Pengiriman';
    document.getElementById('schedule-date').value = schedule.date || '';
    document.getElementById('schedule-supplier').value = schedule.supplier || '';
    document.getElementById('schedule-description').value = schedule.description || '';
    document.getElementById('schedule-quantity').value = schedule.quantity || '';
    document.getElementById('schedule-status').value = schedule.status || '';
    
    form.dataset.editIndex = index;
    modal.style.display = 'flex';
    // Close any open menus
    document.querySelectorAll('.schedule-context-menu').forEach(m => m.style.display = 'none');
}

// Delete delivery schedule
function deleteDeliverySchedule(index) {
    if (!isAdminUser()) {
        alert('❌ Hanya admin yang dapat menghapus jadwal');
        return;
    }
    
    if (!confirm('Yakin ingin menghapus jadwal pengiriman ini?')) {
        return;
    }
    
    let schedules = getDeliverySchedules();
    schedules.splice(index, 1);
    saveDeliverySchedules(schedules);
    renderDeliverySchedule();
    // Close any open menus
    document.querySelectorAll('.schedule-context-menu').forEach(m => m.style.display = 'none');
}

// Setup schedule menu listeners with event delegation
function setupScheduleMenuListeners() {
    console.log('✅ Schedule menu listeners initialized');
    
    // Listen for ALL clicks
    document.addEventListener('click', function(e) {
        // Check for header menu button (by closest)
        const headerMenuBtn = e.target.closest('#schedule-header-menu-btn');
        if (headerMenuBtn) {
            console.log('📋 Header menu button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const menu = document.getElementById('schedule-header-menu');
            if (!menu) {
                console.warn('⚠️ Header menu not found');
                return;
            }
            
            // Close all row menus
            document.querySelectorAll('.schedule-context-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            
            // Toggle header menu
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            console.log('🔄 Header menu toggled to:', menu.style.display);
            return;
        }
        
        // Check for schedule menu button (per-row)
        const menuBtn = e.target.closest('.schedule-menu-btn');
        if (menuBtn && !headerMenuBtn) {
            console.log('📊 Row menu button clicked, index:', menuBtn.getAttribute('data-index'));
            e.preventDefault();
            e.stopPropagation();
            
            const index = menuBtn.getAttribute('data-index');
            const menu = document.getElementById(`schedule-row-menu-${index}`);
            if (!menu) {
                console.warn('⚠️ Row menu not found for index:', index);
                return;
            }
            
            // Close all other menus
            document.querySelectorAll('.schedule-context-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            
            // Toggle this menu
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            console.log('🔄 Row menu toggled to:', menu.style.display);
            return;
        }
        
        // Check for menu item clicks (Edit, Delete, Add)
        const item = e.target.closest('.menu-item');
        if (item) {
            console.log('🎯 Menu item clicked:', item.className);
            e.preventDefault();
            e.stopPropagation();
            
            if (item.classList.contains('add-item')) {
                console.log('➕ Opening add schedule modal');
                openAddScheduleModal();
                // Close header menu
                const headerMenu = document.getElementById('schedule-header-menu');
                if (headerMenu) headerMenu.style.display = 'none';
            } else if (item.classList.contains('edit-item')) {
                const index = item.getAttribute('data-index');
                console.log('✏️ Editing schedule at index:', index);
                editDeliverySchedule(index);
                // Close row menu
                const menu = document.getElementById(`schedule-row-menu-${index}`);
                if (menu) menu.style.display = 'none';
            } else if (item.classList.contains('delete-item')) {
                const index = item.getAttribute('data-index');
                console.log('🗑️ Deleting schedule at index:', index);
                deleteDeliverySchedule(index);
                // Close row menu
                const menu = document.getElementById(`schedule-row-menu-${index}`);
                if (menu) menu.style.display = 'none';
            }
            return;
        }
        
        // Close menus when clicking outside
        if (!e.target.closest('.schedule-menu-wrapper') && 
            !e.target.closest('#schedule-header-menu-wrapper')) {
            const openMenus = document.querySelectorAll('.schedule-context-menu[style*="display: block"]');
            if (openMenus.length > 0) {
                console.log('❌ Closing menus due to outside click');
                document.querySelectorAll('.schedule-context-menu').forEach(m => m.style.display = 'none');
            }
        }
    });
}

// Setup schedule form handler
function setupScheduleFormHandler() {
    const form = document.getElementById('schedule-form');
    const modal = document.getElementById('schedule-modal');
    const cancelBtn = document.getElementById('schedule-cancel');
    
    if (!form || !modal) return;
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isAdminUser()) {
            alert('❌ Hanya admin yang dapat menambah/mengedit jadwal');
            return;
        }
        
        const date = document.getElementById('schedule-date').value;
        const supplier = document.getElementById('schedule-supplier').value;
        const description = document.getElementById('schedule-description').value;
        const quantity = document.getElementById('schedule-quantity').value;
        const status = document.getElementById('schedule-status').value;
        
        if (!date || !supplier || !description || !quantity || !status) {
            alert('❌ Semua field harus diisi');
            return;
        }
        
        let schedules = getDeliverySchedules();
        const editIndex = form.dataset.editIndex;
        
        const newSchedule = {
            date: date,
            supplier: supplier,
            description: description,
            quantity: quantity,
            status: status,
            createdAt: editIndex !== '' ? schedules[editIndex].createdAt : new Date().toISOString()
        };
        
        if (editIndex !== '') {
            // Update existing
            schedules[editIndex] = newSchedule;
            alert('✅ Jadwal pengiriman berhasil diperbarui');
        } else {
            // Add new
            schedules.push(newSchedule);
            alert('✅ Jadwal pengiriman berhasil ditambahkan');
        }
        
        saveDeliverySchedules(schedules);
        renderDeliverySchedule();
        modal.style.display = 'none';
        // Close any open menus
        document.querySelectorAll('.schedule-context-menu').forEach(m => m.style.display = 'none');
    });
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// initialize UI state
renderUserState();
window.clearCurrentUser = clearCurrentUser;

// Initialize test data if localStorage is empty
function initializeTestData() {
    // First validate existing data - if any critical data is missing or invalid, force reset
    try {
        const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
        const hasDeliverySchedules = localStorage.getItem('kans_delivery_schedules');
        const hasCurrent = localStorage.getItem('kans_current');
        const hasUsers = localStorage.getItem('kans_users');
        
        // If data exists but is incomplete, clear and reinitialize
        if ((projects.length > 0 && !hasDeliverySchedules) || 
            (projects.length > 0 && !hasCurrent) ||
            (projects.length > 0 && !hasUsers)) {
            console.log('⚠️ Detected incomplete data - clearing and reinitializing...');
            localStorage.removeItem('kans_projects');
            localStorage.removeItem('kans_project_areas');
            localStorage.removeItem('kans_delivery_schedules');
            localStorage.removeItem('kans_current');
            localStorage.removeItem('kans_users');
            localStorage.removeItem('kans_user_profiles');
        }
    } catch(e) {
        console.log('⚠️ Error validating localStorage - clearing corrupt data');
        localStorage.removeItem('kans_projects');
        localStorage.removeItem('kans_project_areas');
        localStorage.removeItem('kans_delivery_schedules');
        localStorage.removeItem('kans_current');
        localStorage.removeItem('kans_users');
        localStorage.removeItem('kans_user_profiles');
    }
    
    const projects = JSON.parse(localStorage.getItem('kans_projects') || '[]');
    const hasDeliverySchedules = localStorage.getItem('kans_delivery_schedules');
    
    // Initialize if no projects exist OR if there are projects but no schedules (incomplete init)
    if (projects.length === 0 || !hasDeliverySchedules) {
        const testProjects = [
            { name: 'Project A - Jakarta', period: 'Jan - Mar 2026' },
            { name: 'Project B - Surabaya', period: 'Feb - Apr 2026' }
        ];
        localStorage.setItem('kans_projects', JSON.stringify(testProjects));
        
        const areasMap = {
            'Project A - Jakarta': [
                { name: 'Area Utara', items: [
                    { name: 'Item 1', volume: 100, terkirim: 50 },
                    { name: 'Item 2', volume: 200, terkirim: 150 }
                ]},
                { name: 'Area Timur', items: [
                    { name: 'Item 3', volume: 150, terkirim: 100 }
                ]}
            ],
            'Project B - Surabaya': [
                { name: 'Area Pusat', items: [
                    { name: 'Item A', volume: 80, terkirim: 60 },
                    { name: 'Item B', volume: 120, terkirim: 80 }
                ]}
            ]
        };
        localStorage.setItem('kans_project_areas', JSON.stringify(areasMap));
        
        // Initialize current user as 'admin'
        localStorage.setItem('kans_current', 'admin');
        
        // Initialize user list with admin user
        const users = [
            { username: 'admin', email: 'admin@moprang.local' }
        ];
        localStorage.setItem('kans_users', JSON.stringify(users));
        
        // Initialize delivery schedules
        const schedules = [
            {
                date: '2026-01-15',
                supplier: 'PT Supplier A',
                description: 'Barang elektronik batch 1',
                quantity: '100 BOX',
                status: 'Dijadwalkan',
                createdAt: new Date().toISOString()
            },
            {
                date: '2026-02-01',
                supplier: 'PT Supplier B',
                description: 'Tekstil dan pakaian',
                quantity: '200 BUNDLE',
                status: 'Pengiriman',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('kans_delivery_schedules', JSON.stringify(schedules));
        
        // Initialize user profile for admin
        const userProfiles = {
            admin: {
                photo: null,
                uploadedAt: null
            }
        };
        localStorage.setItem('kans_user_profiles', JSON.stringify(userProfiles));
        
        console.log('✅ Test data initialized - projects, areas, user, schedules, and profiles created');
    }
}

// Call initialization
initializeTestData();

// Ensure user is initialized - set to admin if not set
if (!localStorage.getItem('kans_current')) {
    localStorage.setItem('kans_current', 'admin');
    console.log('✅ Set default user: admin');
}

// Initialize delivery schedule (jika di halaman dengan schedule)
if(document.getElementById('schedule-table')) {
    renderDeliverySchedule();
    updateScheduleAdminControls();
    setupScheduleFormHandler();
    setupScheduleMenuListeners();
}

// Render awal (hanya jika di halaman dengan elemen 'home')
renderProjectCards();
if(document.getElementById('home')) {
    updateHomeStats();
    showPage('home'); // Tampilkan halaman beranda
}

// Delay ini memastikan semua element sudah siap
setTimeout(function handleQueryOnLoad(){
    try{
        const params = new URLSearchParams(window.location.search);
        const open = params.get('open');
        const projectName = params.get('project') || params.get('name');
        console.log('handleQueryOnLoad running - open:', open, 'projectName:', projectName);
        
        if(open === 'areas' && projectName){
            // ensure project dropdown is populated
            renderProjectAreaDropdown();
            console.log('✓ Project dropdown rendered');
            
            // find index of project
            const projects = getProjectList();
            console.log('Projects in localStorage:', projects.map(p => p.name));
            
            const idx = projects.findIndex(p => p.name === projectName);
            console.log('Found project "' + projectName + '" at index:', idx);
            
            if(idx >= 0){
                showPage('areas');
                console.log('✓ Areas page shown');
                
                const sel = document.getElementById('project-select-area');
                if(sel){ 
                    sel.value = idx; 
                    console.log('✓ Dropdown value set to:', idx);
                    console.log('✓ Calling renderAreaCards with index:', idx);
                    renderAreaCards(idx); 
                } else {
                    console.warn('project-select-area element not found');
                }
            } else {
                console.warn('Project "' + projectName + '" not found in projects list');
                // Fallback: show the areas page anyway
                showPage('areas');
                renderProjectAreaDropdown();
            }
        }
    }catch(e){
        console.error('Error in handleQueryOnLoad:', e);
    }
}, 100);