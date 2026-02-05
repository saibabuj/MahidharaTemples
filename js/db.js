/**
 * Database module - Handles localStorage and initial data loading
 */

const DB_KEY = 'templeTrustDB';

function getDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (_) {
            return null;
        }
    }
    return null;
}

function setDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function initDB() {
    let db = getDB();
    if (!db) {
        db = {
            donors: [],
            payments: [],
            expenses: [],
            construction: [],
            temples: []
        };
        setDB(db);
    } else {
        // Ensure all keys exist for existing DBs
        if (!db.donors) db.donors = [];
        if (!db.payments) db.payments = [];
        if (!db.expenses) db.expenses = [];
        if (!db.construction) db.construction = [];
        if (!db.temples) db.temples = [];
        setDB(db);
    }
    return db;
}

// Load initial sample data from JSON files if DB is empty
async function loadInitialDataIfEmpty() {
    let db = getDB();
    const isEmpty =
        db &&
        db.donors.length === 0 &&
        db.payments.length === 0 &&
        db.expenses.length === 0 &&
        db.construction.length === 0 &&
        (!db.temples || db.temples.length === 0);

    if (!isEmpty) {
        return db;
    }

    // Only try to fetch if running on http/https
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
        return db;
    }

    try {
        const [donorsRes, paymentsRes, expensesRes, constructionRes] = await Promise.all([
            fetch('data/donors.json'),
            fetch('data/payments.json'),
            fetch('data/expenses.json'),
            fetch('data/construction.json')
        ]);

        const [donors, payments, expenses, construction] = await Promise.all([
            donorsRes.ok ? donorsRes.json() : [],
            paymentsRes.ok ? paymentsRes.json() : [],
            expensesRes.ok ? expensesRes.json() : [],
            constructionRes.ok ? constructionRes.json() : []
        ]);

        db = {
            donors: Array.isArray(donors) ? donors : [],
            payments: Array.isArray(payments) ? payments : [],
            expenses: Array.isArray(expenses) ? expenses : [],
            construction: Array.isArray(construction) ? construction : [],
            temples: []
        };
        setDB(db);
    } catch (e) {
        console.log('Initial data not loaded');
    }

    return getDB();
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
