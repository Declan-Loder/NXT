// ===== NXT App Logic =====
const CART_KEY = 'nxt_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, qty: 1 });
  saveCart(cart);
  notice(name + ' added to cart');
}

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
  const cart = getCart();
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totalQty;
    el.style.display = totalQty > 0 ? 'flex' : 'none';
  });

  const body = document.getElementById('cart-body');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '<div class="empty-cart">Your cart is empty.<br>Go grab some NXT gear.</div>';
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-art">NXT</div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div style="font-size:13px;color:var(--muted)">R ${item.price.toFixed(2)}</div>
          <div class="cart-qty">
            <button onclick="changeQty('${item.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.id}',1)">+</button>
            <button onclick="removeFromCart('${item.id}')" style="margin-left:auto;font-size:11px;border:none;background:none;color:var(--danger);cursor:pointer">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  const totalEl = document.getElementById('cart-total-value');
  if (totalEl) totalEl.textContent = 'R ' + cartTotal().toFixed(2);

  const sumEl = document.getElementById('checkout-summary');
  const checkTotal = document.getElementById('checkout-total');
  if (sumEl) {
    if (cart.length === 0) sumEl.innerHTML = 'Your cart is empty.';
    else sumEl.innerHTML = cart.map(i =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>${i.name} × ${i.qty}</span><span>R ${(i.price*i.qty).toFixed(2)}</span></div>`
    ).join('');
  }
  if (checkTotal) checkTotal.textContent = 'R ' + cartTotal().toFixed(2);
}

function openCart() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
  updateCartUI();
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
}

let toastTimer;
function notice(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
}

// Render tournament data from data.js
function renderTournaments() {
  // Title
  const titleEl = document.getElementById('tournament-title');
  if (titleEl && typeof tournamentTitle !== 'undefined') titleEl.textContent = tournamentTitle;
  const subEl = document.getElementById('tournament-subtitle');
  if (subEl && typeof tournamentSubtitle !== 'undefined') subEl.textContent = tournamentSubtitle;

  // Groups A–D
  if (typeof groups !== 'undefined') {
    const container = document.getElementById('groups-container');
    if (container) {
      container.innerHTML = Object.keys(groups).map(g => {
        const rows = groups[g].map(r =>
          `<tr>
            <td class="rank">${r.pos}</td>
            <td>${r.player}</td>
            <td>${r.p}</td>
            <td>${r.w}</td>
            <td>${r.d}</td>
            <td>${r.l}</td>
            <td>${r.gd}</td>
            <td><strong>${r.pts}</strong></td>
          </tr>`
        ).join('');
        return `
          <div class="panel" style="overflow-x:auto;margin-bottom:0">
            <div style="font-size:13px;font-weight:900;letter-spacing:1px;color:#75baff;margin-bottom:10px">GROUP ${g}</div>
            <table class="standings-table">
              <thead>
                <tr>
                  <th>Pos</th><th>Player</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
      }).join('');
    }
  }

  // Upcoming events
  if (typeof upcomingEvents !== 'undefined') {
    const container = document.getElementById('upcoming-events');
    if (container) {
      container.innerHTML = upcomingEvents.map(e => `
        <div class="event-card">
          <div class="event-status" style="${e.open ? '' : 'color:var(--muted)'}">${e.status}</div>
          <h3>${e.title}</h3>
          <div class="event-meta">${e.meta}</div>
          <p class="muted" style="margin:0;font-size:13px">${e.desc}</p>
          ${e.open
            ? '<a class="button" href="#register" style="margin-top:10px">Register ↗</a>'
            : '<button class="button outline" style="margin-top:10px;opacity:.55;cursor:default" disabled>In progress</button>'}
        </div>
      `).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderTournaments();
});
