/**
 * Dashboard module
 */

function updateDashboard() {
    const db = getDB();
    const received = (db.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    const expenses = (db.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const balance = received - expenses;
    const donorsCount = (db.donors || []).length;

    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('total-received', '₹' + formatNum(received));
    updateText('total-expenses', '₹' + formatNum(expenses));
    updateText('balance', '₹' + formatNum(balance));
    updateText('donors-count', donorsCount);

    const recentPayments = (db.payments || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentExpenses = (db.expenses || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    document.getElementById('recent-payments').innerHTML = recentPayments.length
        ? recentPayments.map(p => `
        <li>
          <div class="list-item-main">
            <span class="list-item-title">${escapeHtml(donorName(p.donorId))}</span>
            <span class="list-item-sub">${p.date} · ${escapeHtml(p.mode)}</span>
          </div>
          <span class="list-item-amount income-amt">+₹${formatNum(p.amount)}</span>
        </li>
      `).join('')
        : '<li class="empty-msg">No recent payments</li>';

    document.getElementById('recent-expenses').innerHTML = recentExpenses.length
        ? recentExpenses.map(e => `
        <li>
          <div class="list-item-main">
            <span class="list-item-title">${escapeHtml(e.category)}</span>
            <span class="list-item-sub">${e.date}</span>
          </div>
          <span class="list-item-amount expense-amt">-₹${formatNum(e.amount)}</span>
        </li>
      `).join('')
        : '<li class="empty-msg">No recent expenses</li>';

    // Construction Photo Gallery
    const allPhotos = (db.construction || [])
        .filter(c => c.photos && c.photos.length)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .flatMap(c => (c.photos || []).map(p => ({ url: p, title: c.title, date: c.date })))
        .slice(0, 20);

    const galleryEl = document.getElementById('dashboard-gallery');
    if (galleryEl) {
        galleryEl.innerHTML = allPhotos.length
            ? allPhotos.map(p => `
          <div class="gallery-item">
            <img src="${p.url}" alt="${p.title}" onclick="window.open('${p.url}')">
            <div class="gallery-cap">${p.title}</div>
          </div>
        `).join('')
            : '<p class="empty-msg">No construction photos uploaded yet.</p>';
    }
}
