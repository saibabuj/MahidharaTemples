/**
 * Mahidhara Temple Trust - Main Entry Point
 */

document.addEventListener('DOMContentLoaded', async function () {
  // Initialize UI components
  setupModal();
  setupModalEvents();
  setupNavigation();

  // Initialize functionality event listeners
  setupAuthEvents();
  setupTempleEvents();
  setupDonorEvents();
  setupPaymentEvents();
  setupExpenseEvents();
  setupConstructionEvents();

  // Initialize Database
  initDB();
  await loadInitialDataIfEmpty();

  // Initial render
  updateAdminUI();
  updateDashboard();
  renderTemples();
  renderDonors();
  renderPayments();
  renderExpenses();
  renderConstruction();
});
