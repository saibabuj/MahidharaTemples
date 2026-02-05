/**
 * UI module - Handles navigation, modals, and formatting
 */

let overlay, modalTitle, modalClose;

function setupModal() {
    overlay = document.getElementById('modal-overlay');
    modalTitle = document.getElementById('modal-title');
    modalClose = document.getElementById('modal-close');
}

function showModal(title, formId) {
    modalTitle.textContent = title;
    document.querySelectorAll('.form').forEach(f => f.classList.add('hidden'));
    document.getElementById(formId).classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function hideModal() {
    overlay.classList.add('hidden');
}

function setupModalEvents() {
    if (modalClose) modalClose.addEventListener('click', hideModal);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) hideModal(); });
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(sectionId).classList.add('active');

            // Update view based on section
            if (sectionId === 'dashboard') updateDashboard();
            if (sectionId === 'donors') renderDonors();
            if (sectionId === 'payments') renderPayments();
            if (sectionId === 'expenses') renderExpenses();
            if (sectionId === 'construction') renderConstruction();
        });
    });
}

function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function formatNum(n) {
    return Number(n).toLocaleString('en-IN');
}
