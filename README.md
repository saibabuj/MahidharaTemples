# Mahidhara Temple Trust – Web Application

A simple temple trust management web app built with **HTML**, **CSS**, and **JavaScript**, using **JSON** for data and **localStorage** as the database.

## Features

- **Dashboard** – Total received, total expenses, balance, donor count, and recent payments/expenses
- **Donors** – Add, edit, delete donors (name, phone, email, address); total donated per donor
- **Payments received** – Record donations with date, donor, amount, mode (Cash/UPI/Bank/Cheque), purpose
- **Expenses** – Log expenses with date, category, amount, description (Construction, Maintenance, Pooja, etc.)
- **Construction updates** – Add temple/project updates with title, date, status, progress %, and details

## Database

- **Storage:** Browser **localStorage** (key: `templeTrustDB`). No server or backend required.
- **Schema:** All data is stored as JSON with keys: `donors`, `payments`, `expenses`, `construction`.
- **Initial data:** Optional sample data is in `data/initial-data.json`. It is loaded once when the app is first opened (if the DB is empty). If you open the app via `file://`, the fetch may fail; you can still use the app and add data manually—it will be saved in localStorage.

## How to run

1. Open `index.html` in a browser (double-click or drag into the browser).
2. Or serve the folder with a local server, for example:
   - **Node:** `npx serve .` or `npx http-server .`
   - **Python:** `python -m http.server 8000` then visit `http://localhost:8000`

Serving over HTTP is recommended so that `data/initial-data.json` loads and pre-fills sample data.

## File structure

```
Mahidhara_temples/
├── index.html          # Main app (sections, forms, modals)
├── css/
│   └── styles.css      # Layout and theme
├── js/
│   └── app.js          # Logic, CRUD, localStorage DB
├── data/
│   └── initial-data.json  # Optional sample JSON data
└── README.md
```

## Exporting data (JSON)

To backup or use your data elsewhere, open the browser console (F12 → Console) and run:

```javascript
console.log(JSON.stringify(JSON.parse(localStorage.getItem('templeTrustDB')), null, 2));
```

Copy the output and save it as a `.json` file.

---

**Mahidhara Temple Trust** – Devotion · Service · Heritage
