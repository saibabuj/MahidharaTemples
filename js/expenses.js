/**
 * Expenses module
 */

function renderExpenses() {
    const db = getDB();
    const tbody = document.getElementById('expenses-tbody');
    const expenses = (db.expenses || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin() ? 6 : 5}" class="empty-msg">No expenses yet.</td></tr>`;
        return;
    }
    const loggedIn = isAdmin();
    tbody.innerHTML = expenses.map((e, i) => `
    <tr>
      <td data-label="#">${i + 1}</td>
      <td data-label="Date">${e.date}</td>
      <td data-label="Category">${escapeHtml(e.category || '—')}</td>
      <td data-label="Amount">₹${formatNum(e.amount)}</td>
      <td data-label="Description">${escapeHtml((e.description || '—').slice(0, 40))}${(e.description || '').length > 40 ? '…' : ''}</td>
      <td class="actions ${loggedIn ? '' : 'hidden-admin'}">
        <button class="btn btn-small btn-edit" data-edit-expense="${e.id}">Edit</button>
        <button class="btn btn-small btn-delete" data-delete-expense="${e.id}">Delete</button>
      </td>
    </tr>
  `).join('');
    tbody.querySelectorAll('[data-edit-expense]').forEach(btn => btn.addEventListener('click', () => editExpense(btn.dataset.editExpense)));
    tbody.querySelectorAll('[data-delete-expense]').forEach(btn => btn.addEventListener('click', () => deleteExpense(btn.dataset.deleteExpense)));
}

function editExpense(id) {
    const db = getDB();
    const e = db.expenses.find(x => x.id === id);
    if (!e) return;
    document.getElementById('expense-id').value = e.id;
    document.getElementById('expense-date').value = e.date || '';
    document.getElementById('expense-category').value = e.category || 'Other';
    document.getElementById('expense-amount').value = e.amount || '';
    document.getElementById('expense-desc').value = e.description || '';
    showModal('Edit Expense', 'form-expense');
}

function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    const db = getDB();
    db.expenses = db.expenses.filter(x => x.id !== id);
    setDB(db);
    renderExpenses();
    updateDashboard();
}

function setupExpenseEvents() {
    document.getElementById('add-expense-btn').addEventListener('click', () => {
        document.getElementById('expense-id').value = '';
        document.getElementById('form-expense').reset();
        document.getElementById('expense-date').value = new Date().toISOString().slice(0, 10);
        showModal('Add Expense', 'form-expense');
    });

    document.getElementById('form-expense').addEventListener('submit', (e) => {
        e.preventDefault();
        const db = getDB();
        const id = document.getElementById('expense-id').value;
        const payload = {
            date: document.getElementById('expense-date').value,
            category: document.getElementById('expense-category').value,
            amount: parseFloat(document.getElementById('expense-amount').value) || 0,
            description: document.getElementById('expense-desc').value.trim()
        };
        if (id) {
            const idx = db.expenses.findIndex(x => x.id === id);
            if (idx !== -1) db.expenses[idx] = { ...db.expenses[idx], ...payload };
        } else {
            db.expenses.push({ id: uid(), ...payload });
        }
        setDB(db);
        hideModal();
        renderExpenses();
        updateDashboard();
    });
}
