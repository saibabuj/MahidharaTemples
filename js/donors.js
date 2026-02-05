/**
 * Donors module
 */

function getDonorTotal(donorId) {
    const db = getDB();
    return (db.payments || [])
        .filter(p => p.donorId === donorId)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
}

function renderDonors() {
    const db = getDB();
    const tbody = document.getElementById('donors-tbody');
    const donors = db.donors || [];
    if (donors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin() ? 7 : 6}" class="empty-msg">No donors yet. Add one to get started.</td></tr>`;
        return;
    }
    const loggedIn = isAdmin();
    tbody.innerHTML = donors.map((d, i) => {
        const total = getDonorTotal(d.id);
        return `<tr>
      <td data-label="#">${i + 1}</td>
      <td data-label="Name">${escapeHtml(d.name)}</td>
      <td data-label="Phone">${escapeHtml(d.phone || '—')}</td>
      <td data-label="Email">${escapeHtml(d.email || '—')}</td>
      <td data-label="Address">${escapeHtml((d.address || '—').slice(0, 30))}${(d.address || '').length > 30 ? '…' : ''}</td>
      <td data-label="Total Donated">₹${formatNum(total)}</td>
      <td class="actions admin-only ${loggedIn ? '' : 'hidden-admin'}">
        <button class="btn btn-small btn-edit" data-edit-donor="${d.id}">Edit</button>
        <button class="btn btn-small btn-delete" data-delete-donor="${d.id}">Delete</button>
      </td>
    </tr>`;
    }).join('');
    tbody.querySelectorAll('[data-edit-donor]').forEach(btn => {
        btn.addEventListener('click', () => editDonor(btn.dataset.editDonor));
    });
    tbody.querySelectorAll('[data-delete-donor]').forEach(btn => {
        btn.addEventListener('click', () => deleteDonor(btn.dataset.deleteDonor));
    });
}

function editDonor(id) {
    const db = getDB();
    const d = db.donors.find(x => x.id === id);
    if (!d) return;
    document.getElementById('donor-id').value = d.id;
    document.getElementById('donor-name').value = d.name || '';
    document.getElementById('donor-phone').value = d.phone || '';
    document.getElementById('donor-email').value = d.email || '';
    document.getElementById('donor-address').value = d.address || '';
    showModal('Edit Donor', 'form-donor');
}

function deleteDonor(id) {
    if (!confirm('Remove this donor? Payments linked to them will remain but donor name may show as unknown.')) return;
    const db = getDB();
    db.donors = db.donors.filter(x => x.id !== id);
    setDB(db);
    renderDonors();
    renderPayments();
    updateDashboard();
}

function setupDonorEvents() {
    document.getElementById('add-donor-btn').addEventListener('click', () => {
        document.getElementById('donor-id').value = '';
        document.getElementById('form-donor').reset();
        document.getElementById('donor-id').value = '';
        showModal('Add Donor', 'form-donor');
    });

    document.getElementById('form-donor').addEventListener('submit', (e) => {
        e.preventDefault();
        const db = getDB();
        const id = document.getElementById('donor-id').value;
        const payload = {
            name: document.getElementById('donor-name').value.trim(),
            phone: document.getElementById('donor-phone').value.trim(),
            email: document.getElementById('donor-email').value.trim(),
            address: document.getElementById('donor-address').value.trim()
        };
        let donorId = id;
        if (id) {
            const idx = db.donors.findIndex(x => x.id === id);
            if (idx !== -1) db.donors[idx] = { ...db.donors[idx], ...payload };
        } else {
            donorId = uid();
            db.donors.push({ id: donorId, ...payload });
        }

        setDB(db);
        hideModal();
        renderDonors();
        renderPayments();
        updateDashboard();
    });
}
