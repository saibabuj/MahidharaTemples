/**
 * Payments module
 */

function donorName(donorId) {
    const db = getDB();
    const d = db.donors.find(x => x.id === donorId);
    return d ? d.name : '(Unknown)';
}

function renderPayments() {
    const db = getDB();
    const tbody = document.getElementById('payments-tbody');
    const payments = (db.payments || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin() ? 5 : 4}" class="empty-msg">No payments yet.</td></tr>`;
        return;
    }
    const loggedIn = isAdmin();
    tbody.innerHTML = payments.map(p => `
    <tr>
      <td data-label="Donor">${escapeHtml(donorName(p.donorId))}</td>
      <td data-label="Date">${p.date}</td>
      <td data-label="Amount">₹${formatNum(p.amount)}</td>
      <td data-label="Mode">${escapeHtml(p.mode || '—')}</td>
      <td class="admin-only ${loggedIn ? '' : 'hidden-admin'}">
        <button class="btn-icon btn-edit" data-edit-payment="${p.id}" title="Edit">✎</button>
        <button class="btn-icon btn-delete" data-delete-payment="${p.id}" title="Delete">🗑</button>
      </td>
    </tr>
  `).join('');
    tbody.querySelectorAll('[data-edit-payment]').forEach(btn => btn.addEventListener('click', () => editPayment(btn.dataset.editPayment)));
    tbody.querySelectorAll('[data-delete-payment]').forEach(btn => btn.addEventListener('click', () => deletePayment(btn.dataset.deletePayment)));
}

function editPayment(id) {
    const db = getDB();
    const p = db.payments.find(x => x.id === id);
    if (!p) return;
    document.getElementById('payment-id').value = p.id;
    document.getElementById('payment-date').value = p.date || '';
    document.getElementById('payment-donor').value = p.donorId || '';
    document.getElementById('payment-amount').value = p.amount || '';
    document.getElementById('payment-mode').value = p.mode || 'Cash';
    document.getElementById('payment-purpose').value = p.purpose || '';
    fillDonorSelect(document.getElementById('payment-donor'), p.donorId);
    showModal('Edit Payment', 'form-payment');
}

function deletePayment(id) {
    if (!confirm('Delete this payment?')) return;
    const db = getDB();
    db.payments = db.payments.filter(x => x.id !== id);
    setDB(db);
    renderPayments();
    updateDashboard();
    renderDonors();
}

function fillDonorSelect(selectEl, selectedId) {
    const db = getDB();
    selectEl.innerHTML = '<option value="">-- Select Donor --</option>' +
        (db.donors || []).map(d => `<option value="${d.id}" ${d.id === selectedId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
}

function setupPaymentEvents() {
    document.getElementById('add-payment-btn').addEventListener('click', () => {
        document.getElementById('payment-id').value = '';
        document.getElementById('form-payment').reset();
        document.getElementById('payment-date').value = new Date().toISOString().slice(0, 10);
        fillDonorSelect(document.getElementById('payment-donor'), '');
        showModal('Add Payment', 'form-payment');
    });

    document.getElementById('form-payment').addEventListener('submit', (e) => {
        e.preventDefault();
        const db = getDB();
        const id = document.getElementById('payment-id').value;
        const payload = {
            date: document.getElementById('payment-date').value,
            donorId: document.getElementById('payment-donor').value,
            amount: parseFloat(document.getElementById('payment-amount').value) || 0,
            mode: document.getElementById('payment-mode').value,
            purpose: document.getElementById('payment-purpose').value.trim()
        };
        if (id) {
            const idx = db.payments.findIndex(x => x.id === id);
            if (idx !== -1) db.payments[idx] = { ...db.payments[idx], ...payload };
        } else {
            db.payments.push({ id: uid(), ...payload });
        }
        setDB(db);
        hideModal();
        renderPayments();
        updateDashboard();
        renderDonors();
    });
}
