// ===== NXT App Logic + Live Tournaments (Supabase) =====

const SUPABASE_URL = 'https://sagmjbyrtdindecmeyil.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZ21qYnlydGRpbmRlY21leWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzQ5NjAsImV4cCI6MjEwNzcxMDk2MH0.i9b_i95IsAn295kiKs9ovGasNzg-knq_XPFxOu59wdc';

// Correct way to create the client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== CART =====
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

// ===== MOBILE MENU =====
function toggleMenu() {
  const btn = document.querySelector('.hamburger');
  const menu = document.getElementById('mobile-menu');
  btn?.classList.toggle('open');
  menu?.classList.toggle('open');
  document.body.style.overflow = menu?.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
  document.querySelector('.hamburger')?.classList.remove('open');
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== GROUP STANDINGS (from data.js) =====
function renderTournaments() {
  const titleEl = document.getElementById('tournament-title');
  if (titleEl && typeof tournamentTitle !== 'undefined') titleEl.textContent = tournamentTitle;

  const subEl = document.getElementById('tournament-subtitle');
  if (subEl && typeof tournamentSubtitle !== 'undefined') subEl.textContent = tournamentSubtitle;

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
}

// ===== LIVE TOURNAMENTS (Supabase) =====
async function loadTournaments() {
  const container = document.getElementById('live-tournaments');
  if (!container) return;

  container.innerHTML = '<p class="muted">Loading tournaments...</p>';

  const { data: tournaments, error } = await supabaseClient
    .from('tournaments')
    .select('*')
    .eq('status', 'open')
    .order('date', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    container.innerHTML = '<p class="muted">Could not load tournaments. Check console.</p>';
    return;
  }

  if (!tournaments || tournaments.length === 0) {
    container.innerHTML = '<p class="muted">No open tournaments right now.</p>';
    return;
  }

  // Get registration counts
  const { data: regs } = await supabaseClient
    .from('registrations')
    .select('tournament_id');

  const counts = {};
  (regs || []).forEach(r => {
    counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1;
  });

  container.innerHTML = tournaments.map(t => {
    const registered = counts[t.id] || 0;
    const spotsLeft = t.max_players - registered;
    const isFull = spotsLeft <= 0;
    const dateStr = new Date(t.date).toLocaleString('en-ZA', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="event-card">
        <div class="event-status">${isFull ? 'FULL' : 'OPEN'} · FREE ENTRY</div>
        <h3>${t.name}</h3>
        <div class="event-meta">${t.format} · ${dateStr}</div>
        <p class="muted" style="margin:8px 0 0;font-size:13px">
          <strong>${registered}</strong> / ${t.max_players} players registered
          ${!isFull ? `· <strong>${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left</strong>` : ''}
        </p>
        ${isFull
          ? '<button class="button outline" style="margin-top:14px;opacity:.55;cursor:default" disabled>Tournament Full</button>'
          : `<a class="button" href="#register" style="margin-top:14px" onclick="selectTournament(${t.id}, '${t.name}')">Register Free ↗</a>`
        }
      </div>
    `;
  }).join('');
}

function selectTournament(id, name) {
  const select = document.getElementById('tournament-select');
  if (select) select.value = id;
  const nameEl = document.getElementById('selected-tournament-name');
  if (nameEl) nameEl.textContent = name;
}

// ===== REGISTRATION =====
async function handleRegistration(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Registering...';

  const tournamentId = form.tournament_id.value;
  const playerName = form.player_name.value.trim();
  const gamertag = form.gamertag.value.trim();
  const platform = form.platform.value;

  if (!tournamentId || !playerName || !gamertag) {
    notice('Please fill in all fields');
    btn.disabled = false;
    btn.textContent = 'Submit Registration ↗';
    return;
  }

  const { error } = await supabaseClient
    .from('registrations')
    .insert({
      tournament_id: Number(tournamentId),
      player_name: playerName,
      gamertag: gamertag,
      platform: platform
    });

  if (error) {
    console.error(error);
    notice('Registration failed. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Submit Registration ↗';
    return;
  }

  notice('Successfully registered! See you in the tournament.');
  form.reset();
  document.getElementById('selected-tournament-name').textContent = 'Select a tournament above';
  loadTournaments();
  btn.disabled = false;
  btn.textContent = 'Submit Registration ↗';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderTournaments();   // Group standings
  loadTournaments();     // Live free tournaments

  const form = document.getElementById('registration-form');
  if (form) form.addEventListener('submit', handleRegistration);
});