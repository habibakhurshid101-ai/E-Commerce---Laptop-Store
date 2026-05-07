/* =========================================================
   LapElite — jsFunctions.js
   Global JavaScript for all pages
========================================================= */

/* ---------------------------------------------------------
   1. HAMBURGER MENU TOGGLE
--------------------------------------------------------- */
function toggleMenu() {
  const menu   = document.getElementById('navMenu');
  const toggle = document.getElementById('menuToggle');
  if (!menu) return;
  menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
}

document.addEventListener('click', function (e) {
  const menu   = document.getElementById('navMenu');
  const toggle = document.getElementById('menuToggle');
  if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function toggleDropdown(el) {
  const sub = el.nextElementSibling;
  if (sub) sub.classList.toggle('open');
}

/* ---------------------------------------------------------
   2. DARK MODE TOGGLE
--------------------------------------------------------- */
function toggleDarkMode() {
  const root   = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? '' : 'dark');
  localStorage.setItem('lapEliteTheme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';
}

/* Restore saved theme on load */
(function () {
  const saved = localStorage.getItem('lapEliteTheme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.addEventListener('DOMContentLoaded', function () {
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '☀️';
    });
  }
})();

/* ---------------------------------------------------------
   3. CART MANAGEMENT
--------------------------------------------------------- */
function getCart() {
  return JSON.parse(localStorage.getItem('lapEliteCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('lapEliteCart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(name, price, id) {
  const cart     = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id || Date.now(), name, price, qty: 1 });
  }
  saveCart(cart);
  showToast(`"${name}" added to cart ✓`);
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ---------------------------------------------------------
   4. TOAST NOTIFICATION
--------------------------------------------------------- */
function showToast(message, type) {
  type = type || 'success';
  let toast = document.getElementById('toastNotif');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotif';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '28px', right: '28px',
      padding: '14px 22px', borderRadius: '8px', fontSize: '14px',
      fontWeight: '600', zIndex: '9999',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      transform: 'translateY(20px)', opacity: '0',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#dc2626' : '#06d6a0';
  toast.style.color = type === 'error' ? '#fff' : '#000';
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3000);
}

/* ---------------------------------------------------------
   5. SCROLL REVEAL ANIMATION
--------------------------------------------------------- */
(function () {
  function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', reveal);
  window.addEventListener('scroll', reveal, { passive: true });
})();

/* ---------------------------------------------------------
   6. NAVBAR SCROLL EFFECT
--------------------------------------------------------- */
window.addEventListener('scroll', function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  if (window.scrollY > 20) {
    nav.style.background = 'rgba(4,8,15,0.97)';
    nav.style.boxShadow  = '0 4px 24px rgba(0,0,0,0.5)';
  } else {
    nav.style.background = '';
    nav.style.boxShadow  = '';
  }
}, { passive: true });

/* ---------------------------------------------------------
   7. ACTIVE NAV LINK
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(path) && path !== '') link.classList.add('active');
  });
});

/* ---------------------------------------------------------
   8. NEWSLETTER FORM
--------------------------------------------------------- */
function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input && input.value) {
    showToast('Subscribed successfully! 🎉');
    input.value = '';
  }
}

/* ---------------------------------------------------------
   9. RENDER CART TABLE  (cart.html)
--------------------------------------------------------- */
function renderCart() {
  const tbody   = document.getElementById('cartTableBody');
  const summary = document.getElementById('cartSummary');
  if (!tbody) return;
  const cart = getCart();
  tbody.innerHTML = '';
  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Your cart is empty.</td></tr>';
    if (summary) summary.textContent = 'Rs. 0';
    const taxEl   = document.getElementById('taxAmount');
    const grandEl = document.getElementById('grandTotal');
    if (taxEl)   taxEl.textContent   = 'Rs. 0';
    if (grandEl) grandEl.textContent = 'Rs. 0';
    return;
  }
  cart.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>Rs. ${item.price.toLocaleString()}</td>
      <td style="white-space:nowrap;">
        <button class="sm-button border-button" onclick="updateQty(${item.id},-1);renderCart()">−</button>
        <span style="margin:0 10px;">${item.qty}</span>
        <button class="sm-button border-button" onclick="updateQty(${item.id},1);renderCart()">+</button>
      </td>
      <td>Rs. ${(item.price * item.qty).toLocaleString()}</td>
      <td><button class="tiny-button" style="background:#dc2626;" onclick="removeFromCart(${item.id});renderCart()">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
  const subtotal = getCartTotal();
  const tax      = Math.round(subtotal * 0.17);
  const grand    = subtotal + tax;
  if (summary) summary.textContent = `Rs. ${subtotal.toLocaleString()}`;
  const taxEl   = document.getElementById('taxAmount');
  const grandEl = document.getElementById('grandTotal');
  if (taxEl)   taxEl.textContent   = `Rs. ${tax.toLocaleString()}`;
  if (grandEl) grandEl.textContent = `Rs. ${grand.toLocaleString()}`;
}

/* ---------------------------------------------------------
   10. LOGIN HANDLER  (login.html)
--------------------------------------------------------- */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPassword').value;
  if (email && pass.length >= 6) {
    localStorage.setItem('lapEliteUser', JSON.stringify({ email }));
    showToast('Login successful! Redirecting…');
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  } else {
    showToast('Password must be at least 6 characters.', 'error');
  }
}

/* ---------------------------------------------------------
   11. SIGNUP HANDLER  (signup.html)
--------------------------------------------------------- */
function handleSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const pass  = document.getElementById('signupPassword').value;
  const conf  = document.getElementById('signupConfirm').value;
  if (pass !== conf) { showToast('Passwords do not match.', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  localStorage.setItem('lapEliteUser', JSON.stringify({ name, email }));
  showToast('Account created! Redirecting…');
  setTimeout(() => window.location.href = 'dashboard.html', 1200);
}

/* =========================================================
   12. DASHBOARD — STOCK MANAGEMENT (localStorage-based)
========================================================= */

/* ---- Default stock data (seeded once) ---- */
var DEFAULT_STOCK = [
  { id: 1,  name: 'Dell XPS 15',          category: 'Laptop',      price: 289000, qty: 18, brand: 'Dell',    specs: 'i7-13700H, 16GB, 512GB NVMe' },
  { id: 2,  name: 'HP Spectre x360',       category: 'Laptop',      price: 349000, qty: 9,  brand: 'HP',      specs: 'i9, 32GB, 1TB NVMe' },
  { id: 3,  name: 'Lenovo ThinkPad X1',    category: 'Laptop',      price: 420000, qty: 12, brand: 'Lenovo',  specs: 'Ryzen 9, 32GB, 1TB, 4K OLED' },
  { id: 4,  name: 'ASUS ROG Zephyrus G14', category: 'Gaming',      price: 520000, qty: 6,  brand: 'ASUS',    specs: 'Ryzen 9, RTX 4080, 32GB, 2TB' },
  { id: 5,  name: 'Acer Nitro 5',          category: 'Gaming',      price: 185000, qty: 14, brand: 'Acer',    specs: 'i5-12th, RTX 3060, 16GB, 512GB' },
  { id: 6,  name: 'Apple MacBook Air M3',  category: 'Laptop',      price: 399000, qty: 7,  brand: 'Apple',   specs: 'M3, 16GB, 512GB SSD' },
  { id: 7,  name: 'Logitech MX Master 3S', category: 'Accessory',   price: 18500,  qty: 40, brand: 'Logitech',specs: 'Wireless, 8K DPI, Quiet Clicks' },
  { id: 8,  name: 'Samsung 34" Curved',    category: 'Accessory',   price: 145000, qty: 5,  brand: 'Samsung', specs: '34" WQHD, 165Hz, VA Panel' },
  { id: 9,  name: 'Dell OptiPlex 7090',    category: 'Desktop',     price: 210000, qty: 8,  brand: 'Dell',    specs: 'i7-11700, 16GB, 512GB' },
  { id: 10, name: 'HP Z4 Workstation',     category: 'Workstation', price: 680000, qty: 3,  brand: 'HP',      specs: 'Xeon W, 64GB ECC, 2TB NVMe' },
  { id: 11, name: 'Lenovo IdeaPad 5',      category: 'Laptop',      price: 135000, qty: 22, brand: 'Lenovo',  specs: 'Ryzen 7, 8GB, 512GB SSD' },
  { id: 12, name: 'Razer DeathAdder V3',   category: 'Accessory',   price: 12500,  qty: 35, brand: 'Razer',   specs: '30K DPI, 6 Buttons, USB-C' },
  { id: 13, name: 'MSI Creator Z16',       category: 'Workstation', price: 595000, qty: 4,  brand: 'MSI',     specs: 'i9-12900H, RTX 3060Ti, 32GB' },
  { id: 14, name: 'ASUS TUF F15',          category: 'Gaming',      price: 225000, qty: 11, brand: 'ASUS',    specs: 'i5-12500H, RTX 3060, 16GB' },
  { id: 15, name: 'HP EliteDesk 800',      category: 'Desktop',     price: 175000, qty: 6,  brand: 'HP',      specs: 'i7-10700, 16GB, 256GB SSD' },
];

function getStock() {
  return JSON.parse(localStorage.getItem('lapEliteStock') || '[]');
}

function saveStock(stock) {
  localStorage.setItem('lapEliteStock', JSON.stringify(stock));
  refreshKPIs();
}

function seedDefaultStock() {
  if (getStock().length === 0) {
    localStorage.setItem('lapEliteStock', JSON.stringify(DEFAULT_STOCK));
  }
  refreshKPIs();
}

/* ---- KPI Refresh ---- */
function refreshKPIs() {
  var stock = getStock();
  var total = stock.reduce(function(s, i) { return s + i.qty; }, 0);
  var low   = stock.filter(function(i) { return i.qty <= 8; }).length;
  var el;
  el = document.getElementById('kpiTotalStock');   if (el) el.textContent = total;
  el = document.getElementById('kpiLowStock');     if (el) el.textContent = low;
  el = document.getElementById('summaryProducts'); if (el) el.textContent = stock.length;
  el = document.getElementById('summaryLastUpdated');
  if (el) el.textContent = new Date().toLocaleDateString('en-PK');
}

/* ---- Live Date/Time ---- */
function updateDashDate() {
  var el = document.getElementById('dashDateTime');
  if (!el) return;
  var opts = { weekday:'long', year:'numeric', month:'long', day:'numeric',
               hour:'2-digit', minute:'2-digit', second:'2-digit' };
  el.textContent = new Date().toLocaleString('en-PK', opts);
}

/* =========================================================
   13. DASHBOARD — MODAL SYSTEM
========================================================= */
function openModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (id === 'viewStockModal') renderStockTable();
  if (id === 'updateModal')    { renderUpdateList(); document.getElementById('updateForm').style.display = 'none'; }
  if (id === 'deleteModal')    { renderDeleteList(); document.getElementById('deleteConfirmBox').style.display = 'none'; }
  var names = { viewStockModal: 'Viewed all stock inventory', insertModal: 'Opened Insert Stock form',
                updateModal: 'Opened Update Stock panel',     deleteModal: 'Opened Delete Stock panel' };
  if (names[id]) logActivity('view', names[id]);
}

function closeModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

/* =========================================================
   14. DASHBOARD — VIEW STOCK TABLE
========================================================= */
function renderStockTable() {
  var tbody   = document.getElementById('stockTableBody');
  var countEl = document.getElementById('stockCount');
  if (!tbody) return;
  var q   = (document.getElementById('stockSearchInput')    || { value: '' }).value.toLowerCase();
  var cat = (document.getElementById('stockCategoryFilter') || { value: '' }).value;
  var rows = getStock().filter(function(item) {
    return item.name.toLowerCase().indexOf(q) !== -1 && (!cat || item.category === cat);
  });
  if (countEl) countEl.textContent = 'Showing ' + rows.length + ' item(s)';
  if (rows.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No products found.</td></tr>'; return; }
  tbody.innerHTML = rows.map(function(item, idx) {
    var sc = item.qty === 0 ? 'cancelled' : (item.qty <= 8 ? 'amber' : 'delivered');
    var sl = item.qty === 0 ? 'Out of Stock' : (item.qty <= 8 ? 'Low Stock' : 'In Stock');
    var cc = { Laptop:'sky', Desktop:'blue', Gaming:'red', Accessory:'green', Workstation:'purple' }[item.category] || 'sky';
    return '<tr>' +
      '<td>' + (idx + 1) + '</td>' +
      '<td><strong style="color:var(--text-primary-color)">' + item.name + '</strong>' +
           '<br><small style="color:var(--text-muted-color)">' + (item.specs || '') + '</small></td>' +
      '<td><span class="chip" data-color="' + cc + '">' + item.category + '</span></td>' +
      '<td>Rs. ' + Number(item.price).toLocaleString() + '</td>' +
      '<td><strong>' + item.qty + '</strong></td>' +
      '<td><span class="chip" data-color="' + sc + '">' + sl + '</span></td>' +
      '<td style="white-space:nowrap">' +
        '<button class="tiny-button border-button" onclick="prefillUpdate(' + item.id + ');closeModal(\'viewStockModal\');openModal(\'updateModal\')">Edit</button> ' +
        '<button class="tiny-button" style="background:#dc2626;margin-left:4px" onclick="promptDelete(' + item.id + ');closeModal(\'viewStockModal\');openModal(\'deleteModal\')">Del</button>' +
      '</td></tr>';
  }).join('');
}

/* =========================================================
   15. DASHBOARD — INSERT STOCK
========================================================= */
function handleInsertStock(e) {
  e.preventDefault();
  var name  = document.getElementById('insertName').value.trim();
  var cat   = document.getElementById('insertCategory').value;
  var price = parseInt(document.getElementById('insertPrice').value, 10);
  var qty   = parseInt(document.getElementById('insertQty').value, 10);
  var brand = document.getElementById('insertBrand').value.trim();
  var specs = document.getElementById('insertSpecs').value.trim();
  if (!name || !cat || isNaN(price) || isNaN(qty)) { showToast('Please fill in all required fields.', 'error'); return; }
  var stock = getStock();
  var newId = stock.length ? Math.max.apply(null, stock.map(function(i) { return i.id; })) + 1 : 1;
  stock.push({ id: newId, name: name, category: cat, price: price, qty: qty, brand: brand, specs: specs });
  saveStock(stock);
  logActivity('insert', 'Added "' + name + '" (' + cat + ', Qty: ' + qty + ')');
  showToast('✅ "' + name + '" added to inventory!');
  document.getElementById('insertStockForm').reset();
  closeModal('insertModal');
  updateCharts();
}

/* =========================================================
   16. DASHBOARD — UPDATE STOCK
========================================================= */
function renderUpdateList() {
  var list = document.getElementById('updateList');
  if (!list) return;
  var q    = (document.getElementById('updateSearch') || { value: '' }).value.toLowerCase();
  var rows = getStock().filter(function(i) { return !q || i.name.toLowerCase().indexOf(q) !== -1; });
  if (rows.length === 0) { list.innerHTML = '<p style="font-size:13px;color:var(--text-muted-color);padding:12px 0">No products found.</p>'; return; }
  list.innerHTML = rows.map(function(item) {
    return '<div class="update-list-item">' +
      '<div class="update-list-item-info"><strong>' + item.name + '</strong>' +
        '<span>' + item.category + ' · Rs. ' + Number(item.price).toLocaleString() + ' · Qty: ' + item.qty + '</span></div>' +
      '<div class="update-list-item-actions">' +
        '<button class="sm-button" onclick="prefillUpdate(' + item.id + ')">Edit →</button>' +
      '</div></div>';
  }).join('');
}

function prefillUpdate(id) {
  var item = getStock().find(function(i) { return i.id === id; });
  if (!item) return;
  var form = document.getElementById('updateForm');
  if (!form) return;
  document.getElementById('updateId').value       = item.id;
  document.getElementById('updateName').value     = item.name;
  document.getElementById('updateCategory').value = item.category;
  document.getElementById('updatePrice').value    = item.price;
  document.getElementById('updateQty').value      = item.qty;
  document.getElementById('updateSpecs').value    = item.specs || '';
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleUpdateStock(e) {
  e.preventDefault();
  var id    = parseInt(document.getElementById('updateId').value, 10);
  var stock = getStock();
  var item  = stock.find(function(i) { return i.id === id; });
  if (!item) { showToast('Product not found.', 'error'); return; }
  var oldName   = item.name;
  item.name     = document.getElementById('updateName').value.trim();
  item.category = document.getElementById('updateCategory').value;
  item.price    = parseInt(document.getElementById('updatePrice').value, 10);
  item.qty      = parseInt(document.getElementById('updateQty').value, 10);
  item.specs    = document.getElementById('updateSpecs').value.trim();
  saveStock(stock);
  logActivity('update', 'Updated "' + oldName + '" → Qty: ' + item.qty + ', Price: Rs. ' + Number(item.price).toLocaleString());
  showToast('💾 Stock updated successfully!');
  document.getElementById('updateForm').style.display = 'none';
  closeModal('updateModal');
  updateCharts();
}

/* =========================================================
   17. DASHBOARD — DELETE STOCK
========================================================= */
var _deleteTargetId = null;

function renderDeleteList() {
  var list = document.getElementById('deleteList');
  if (!list) return;
  var q    = (document.getElementById('deleteSearch') || { value: '' }).value.toLowerCase();
  var rows = getStock().filter(function(i) { return !q || i.name.toLowerCase().indexOf(q) !== -1; });
  if (rows.length === 0) { list.innerHTML = '<p style="font-size:13px;color:var(--text-muted-color);padding:12px 0">No products found.</p>'; return; }
  list.innerHTML = rows.map(function(item) {
    return '<div class="update-list-item">' +
      '<div class="update-list-item-info"><strong>' + item.name + '</strong>' +
        '<span>' + item.category + ' · Qty: ' + item.qty + '</span></div>' +
      '<div class="update-list-item-actions">' +
        '<button class="tiny-button" style="background:#dc2626" onclick="promptDelete(' + item.id + ')">🗑️ Delete</button>' +
      '</div></div>';
  }).join('');
  document.getElementById('deleteConfirmBox').style.display = 'none';
}

function promptDelete(id) {
  var item = getStock().find(function(i) { return i.id === id; });
  if (!item) return;
  _deleteTargetId = id;
  var box    = document.getElementById('deleteConfirmBox');
  var nameEl = document.getElementById('deleteTargetName');
  if (nameEl) nameEl.textContent = item.name;
  if (box) { box.style.display = 'block'; box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function confirmDelete() {
  if (!_deleteTargetId) return;
  var stock    = getStock();
  var item     = stock.find(function(i) { return i.id === _deleteTargetId; });
  var newStock = stock.filter(function(i) { return i.id !== _deleteTargetId; });
  saveStock(newStock);
  if (item) logActivity('delete', 'Deleted "' + item.name + '" from inventory');
  showToast('🗑️ Product deleted.', 'error');
  _deleteTargetId = null;
  document.getElementById('deleteConfirmBox').style.display = 'none';
  renderDeleteList();
  updateCharts();
}

/* =========================================================
   18. DASHBOARD — ACTIVITY FEED
========================================================= */
function logActivity(type, message) {
  var log = JSON.parse(localStorage.getItem('lapEliteActivity') || '[]');
  log.unshift({ type: type, message: message, time: new Date().toISOString() });
  if (log.length > 50) log = log.slice(0, 50);
  localStorage.setItem('lapEliteActivity', JSON.stringify(log));
  renderActivityFeed();
}

function renderActivityFeed() {
  var feed = document.getElementById('activityFeed');
  if (!feed) return;
  var log = JSON.parse(localStorage.getItem('lapEliteActivity') || '[]');
  if (log.length === 0) {
    feed.innerHTML = '<div class="activity-empty">No activity yet.<br>Start by adding or editing stock.</div>';
    return;
  }
  feed.innerHTML = log.slice(0, 15).map(function(entry) {
    var d       = new Date(entry.time);
    var timeStr = d.toLocaleString('en-PK', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    return '<div class="activity-item">' +
      '<div class="activity-dot ' + (entry.type || 'view') + '"></div>' +
      '<div class="activity-item-body"><p>' + entry.message + '</p>' +
        '<div class="activity-item-time">' + timeStr + '</div>' +
      '</div></div>';
  }).join('');
}

function clearActivity() {
  localStorage.removeItem('lapEliteActivity');
  renderActivityFeed();
  showToast('Activity log cleared.');
}

/* =========================================================
   19. DASHBOARD — CHART.JS CHARTS
========================================================= */
var _charts = {};
var GRID_COLOR = 'rgba(255,255,255,0.06)';

function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font  = { family: 'Inter, sans-serif', size: 12 };

  /* 1. Bar — Monthly Sales */
  var salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    _charts.sales = new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{ label: 'Units Sold', data: [38, 52, 45, 61, 47, 39],
          backgroundColor: ['rgba(26,86,219,0.7)','rgba(26,86,219,0.7)','rgba(26,86,219,0.7)',
                            'rgba(26,86,219,0.7)','rgba(26,86,219,0.95)','rgba(14,165,233,0.7)'],
          borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: GRID_COLOR } }, y: { grid: { color: GRID_COLOR }, beginAtZero: true } }
      }
    });
  }

  /* 2. Doughnut — Stock by Category */
  var catCtx = document.getElementById('categoryChart');
  if (catCtx) {
    var cd = buildCategoryData();
    _charts.category = new Chart(catCtx, {
      type: 'doughnut',
      data: { labels: cd.labels, datasets: [{ data: cd.values,
        backgroundColor: ['#1a56db','#7c3aed','#ef4444','#06d6a0','#f59e0b'],
        borderColor: '#0d1526', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12, boxHeight: 12 } } } }
    });
  }

  /* 3. Line — Revenue Trend */
  var revCtx = document.getElementById('revenueChart');
  if (revCtx) {
    _charts.revenue = new Chart(revCtx, {
      type: 'line',
      data: {
        labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{ label: 'Revenue (Rs.K)', data: [1820, 2450, 2100, 2980, 2400, 1950],
          borderColor: '#06d6a0', backgroundColor: 'rgba(6,214,160,0.08)',
          borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: '#06d6a0',
          tension: 0.4, fill: true }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: GRID_COLOR } },
                  y: { grid: { color: GRID_COLOR }, ticks: { callback: function(v) { return 'Rs.' + v + 'K'; } } } }
      }
    });
  }

  /* 4. Pie — Stock Status */
  var stCtx = document.getElementById('stockStatusChart');
  if (stCtx) {
    var sd = buildStockStatusData();
    _charts.stockStatus = new Chart(stCtx, {
      type: 'pie',
      data: { labels: ['In Stock', 'Low Stock', 'Out of Stock'], datasets: [{ data: sd,
        backgroundColor: ['rgba(6,214,160,0.85)','rgba(245,158,11,0.85)','rgba(239,68,68,0.85)'],
        borderColor: '#0d1526', borderWidth: 3, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12, boxHeight: 12 } } } }
    });
  }
}

function buildCategoryData() {
  var counts = {};
  getStock().forEach(function(item) { counts[item.category] = (counts[item.category] || 0) + item.qty; });
  return { labels: Object.keys(counts), values: Object.values(counts) };
}

function buildStockStatusData() {
  var s = getStock();
  return [
    s.filter(function(i) { return i.qty > 8; }).length,
    s.filter(function(i) { return i.qty > 0 && i.qty <= 8; }).length,
    s.filter(function(i) { return i.qty === 0; }).length
  ];
}

function updateCharts() {
  var cd = buildCategoryData();
  if (_charts.category) {
    _charts.category.data.labels = cd.labels;
    _charts.category.data.datasets[0].data = cd.values;
    _charts.category.update();
  }
  if (_charts.stockStatus) {
    _charts.stockStatus.data.datasets[0].data = buildStockStatusData();
    _charts.stockStatus.update();
  }
}
