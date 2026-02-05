/**
 * Construction module
 */

function renderConstruction() {
    const db = getDB();
    const list = document.getElementById('construction-list');
    const items = (db.construction || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (items.length === 0) {
        list.innerHTML = '<p class="empty-msg">No construction updates yet.</p>';
        return;
    }
    list.innerHTML = items.map(c => `
    <div class="construction-card" data-id="${c.id}">
      <h4>${escapeHtml(c.title)}</h4>
      <div class="meta">${c.date} ${c.temple ? ' · ' + escapeHtml(c.temple) : ''}</div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${c.progress || 0}%"></div></div>
      <span class="status-badge ${escapeHtml((c.status || '').replace(/\s/g, ''))}">${escapeHtml(c.status || '')}</span>
      <p class="details">${escapeHtml(c.details || '')}</p>
      ${c.photos && c.photos.length ? `
        <div class="card-photos">
          ${c.photos.map(p => `<img src="${p}" class="thumb-img" onclick="window.open('${p}')">`).join('')}
        </div>
      ` : ''}
      ${isAdmin() ? `
        <div class="card-actions admin-only">
          <button class="btn btn-small btn-edit" data-edit-construction="${c.id}">Edit</button>
          <button class="btn btn-small btn-delete" data-delete-construction="${c.id}">Delete</button>
        </div>
      ` : ''}
    </div>
  `).join('');
    list.querySelectorAll('[data-edit-construction]').forEach(btn => btn.addEventListener('click', () => editConstruction(btn.dataset.editConstruction)));
    list.querySelectorAll('[data-delete-construction]').forEach(btn => btn.addEventListener('click', () => deleteConstruction(btn.dataset.deleteConstruction)));
}

function editConstruction(id) {
    const db = getDB();
    const c = db.construction.find(x => x.id !== undefined && x.id === id);
    if (!c) return;
    document.getElementById('construction-id').value = c.id;
    document.getElementById('construction-title').value = c.title || '';
    document.getElementById('construction-date').value = c.date || '';
    document.getElementById('construction-status').value = c.status || 'Planned';
    document.getElementById('construction-progress').value = c.progress ?? 0;
    document.getElementById('construction-details').value = c.details || '';

    // Fill temple select and select current
    fillTempleSelect(document.getElementById('construction-temple'), c.templeId);

    // Track photos for deletion during edit
    let currentPhotos = [...(c.photos || [])];
    renderPhotoPreviews(currentPhotos);

    showModal('Edit Construction Update', 'form-construction');
}

function renderPhotoPreviews(photos) {
    const preview = document.getElementById('construction-photos-preview');
    preview.innerHTML = '';
    photos.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-img-wrap';
        div.innerHTML = `
            <img src="${p}" class="preview-img">
            <span class="remove-photo" data-idx="${idx}">&times;</span>
        `;
        div.querySelector('.remove-photo').onclick = () => {
            photos.splice(idx, 1);
            renderPhotoPreviews(photos);
        };
        preview.appendChild(div);
    });
    // Store current photos in a hidden way or on the window object (simplified for this app)
    window.__currentEditingPhotos = photos;
}

function deleteConstruction(id) {
    if (!confirm('Delete this update?')) return;
    const db = getDB();
    db.construction = db.construction.filter(x => x.id !== id);
    setDB(db);
    renderConstruction();
}

function setupConstructionEvents() {
    document.getElementById('add-construction-btn').addEventListener('click', () => {
        document.getElementById('construction-id').value = '';
        document.getElementById('form-construction').reset();
        document.getElementById('construction-date').value = new Date().toISOString().slice(0, 10);
        document.getElementById('construction-progress').value = 0;
        document.getElementById('construction-photos-preview').innerHTML = '';
        fillTempleSelect(document.getElementById('construction-temple'), '');
        showModal('Add Construction Update', 'form-construction');
    });

    // Photo preview logic
    document.getElementById('construction-photos').addEventListener('change', function (e) {
        const preview = document.getElementById('construction-photos-preview');
        preview.innerHTML = '';
        Array.from(this.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (rev) => {
                const img = document.createElement('img');
                img.src = rev.target.result;
                img.className = 'preview-img';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    document.getElementById('form-construction').addEventListener('submit', async (e) => {
        e.preventDefault();
        const db = getDB();
        const id = document.getElementById('construction-id').value;
        const templeId = document.getElementById('construction-temple').value;
        const temple = db.temples.find(t => t.id === templeId);

        // Handle photos
        const photoFiles = document.getElementById('construction-photos').files;
        let photos = [];

        // If editing, start with photos already in the preview (including additions)
        if (id && window.__currentEditingPhotos) {
            photos = [...window.__currentEditingPhotos];
        }

        if (photoFiles.length > 0) {
            // Real server upload via FormData
            const formData = new FormData();
            Array.from(photoFiles).forEach(file => {
                formData.append('files', file);
            });

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.paths) {
                    photos = [...photos, ...result.paths];
                }
            } catch (err) {
                console.error('Upload failed:', err);
                alert('File upload failed. Please ensure the server.py is running.');
            }
        }

        const payload = {
            title: document.getElementById('construction-title').value.trim(),
            date: document.getElementById('construction-date').value,
            templeId: templeId,
            temple: temple ? temple.name : '',
            status: document.getElementById('construction-status').value,
            progress: parseInt(document.getElementById('construction-progress').value, 10) || 0,
            details: document.getElementById('construction-details').value.trim(),
            photos: photos
        };

        if (id) {
            const idx = db.construction.findIndex(x => x.id === id);
            if (idx !== -1) db.construction[idx] = { ...db.construction[idx], ...payload };
        } else {
            db.construction.push({ id: uid(), ...payload });
        }
        setDB(db);
        hideModal();
        renderConstruction();
        updateDashboard(); // Refresh dashboard gallery
    });
}

function fillTempleSelect(selectEl, selectedId) {
    const db = getDB();
    const temples = db.temples || [];
    selectEl.innerHTML = '<option value="">-- Select Temple --</option>' +
        temples.map(t => `<option value="${t.id}" ${t.id === selectedId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('');
}
