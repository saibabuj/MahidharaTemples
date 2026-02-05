/**
 * Auth module - Handles simple admin login state
 */

const AUTH_KEY = 'templeAdminLoggedIn';

function isAdmin() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setAdminState(isLoggedIn) {
    if (isLoggedIn) {
        sessionStorage.setItem(AUTH_KEY, 'true');
    } else {
        sessionStorage.removeItem(AUTH_KEY);
    }
    updateAdminUI();
}

function updateAdminUI() {
    const loggedIn = isAdmin();
    const loginBtn = document.getElementById('login-nav-btn');

    // Toggle admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => {
        if (loggedIn) {
            el.classList.remove('hidden-admin');
        } else {
            el.classList.add('hidden-admin');
        }
    });

    // Update login button text
    if (loginBtn) {
        loginBtn.textContent = loggedIn ? 'Logout' : 'Admin Login';
        loginBtn.classList.toggle('logged-in', loggedIn);
    }

    // Refresh current view to update edit/delete buttons in dynamic lists
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        const id = activeSection.id;
        if (id === 'dashboard') updateDashboard();
        if (id === 'donors') renderDonors();
        if (id === 'payments') renderPayments();
        if (id === 'expenses') renderExpenses();
        if (id === 'construction') renderConstruction();
        if (id === 'temples') renderTemples();
    }
}

function setupAuthEvents() {
    const loginNavBtn = document.getElementById('login-nav-btn');
    const loginForm = document.getElementById('form-login');

    if (loginNavBtn) {
        loginNavBtn.addEventListener('click', () => {
            if (isAdmin()) {
                if (confirm('Are you sure you want to logout?')) {
                    setAdminState(false);
                }
            } else {
                showModal('Admin Login', 'form-login');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('login-password').value;
            // Simple hardcoded password for prototype: 'admin123'
            if (pass === 'admin123') {
                setAdminState(true);
                hideModal();
                loginForm.reset();
            } else {
                alert('Invalid password! Hint: admin123');
            }
        });
    }
}
