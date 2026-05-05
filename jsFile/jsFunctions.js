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
