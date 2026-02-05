/**
 * Temples module
 */

function renderTemples() {
    const db = getDB();
    const tbody = document.getElementById('temples-tbody');
    const temples = db.temples || [];
    if (temples.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin() ? 4 : 3}" class="empty-msg">No temples added yet.</td></tr>`;
        return;
    }
    const loggedIn = isAdmin();
    tbody.innerHTML = temples.map(t => `
    <tr>
      <td data-label="Name">${escapeHtml(t.name)}</td>
      <td data-label="Location">${escapeHtml(t.location || '—')}</td>
      <td data-label="Description">${escapeHtml(t.description || '—')}</td>
      <td class="admin-only ${loggedIn ? '' : 'hidden-admin'}">
        <button class="btn-icon btn-edit" data-edit-temple="${t.id}" title="Edit">✎</button>
        <button class="btn-icon btn-delete" data-delete-temple="${t.id}" title="Delete">🗑</button>
      </td>
    </tr>
  `).join('');

    tbody.querySelectorAll('[data-edit-temple]').forEach(btn => {
        btn.addEventListener('click', () => editTemple(btn.dataset.editTemple));
    });
    tbody.querySelectorAll('[data-delete-temple]').forEach(btn => {
        btn.addEventListener('click', () => deleteTemple(btn.dataset.deleteTemple));
    });
}

function editTemple(id) {
    const db = getDB();
    const t = db.temples.find(x => x.id === id);
    if (!t) return;
    document.getElementById('temple-id').value = t.id;
    document.getElementById('temple-name').value = t.name || '';
    document.getElementById('temple-location').value = t.location || '';
    document.getElementById('temple-description').value = t.description || '';
    showModal('Edit Temple', 'form-temple');
}

function deleteTemple(id) {
    if (!confirm('Delete this temple? All associated construction updates will lose their temple link.')) return;
    const db = getDB();
    db.temples = db.temples.filter(x => x.id !== id);
    setDB(db);
    renderTemples();
    renderConstruction(); // Refresh construction to update temple names
}

function setupTempleEvents() {
    document.getElementById('add-temple-btn').addEventListener('click', () => {
        document.getElementById('temple-id').value = '';
        document.getElementById('form-temple').reset();
        showModal('Add Temple', 'form-temple');
    });

    document.getElementById('form-temple').addEventListener('submit', (e) => {
        e.preventDefault();
        const db = getDB();
        const id = document.getElementById('temple-id').value;
        const payload = {
            name: document.getElementById('temple-name').value.trim(),
            location: document.getElementById('temple-location').value.trim(),
            description: document.getElementById('temple-description').value.trim()
        };

        if (id) {
            const idx = db.temples.findIndex(x => x.id === id);
            if (idx !== -1) db.temples[idx] = { ...db.temples[idx], ...payload };
        } else {
            db.temples.push({ id: uid(), ...payload });
        }

        setDB(db);
        hideModal();
        renderTemples();
        if (typeof fillTempleSelect === 'function') fillTempleSelect(); // Helper for construction form
    });
}
