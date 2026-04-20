// ============================================================
//  VCRM — app.js  ·  Full voice-rooms platform logic
// ============================================================
'use strict';

/* ── State ────────────────────────────────────────────────── */
const state = {
  user: null,          // { name, emoji, coins, diamonds, level }
  currentRoom: null,   // room object
  micOn: false,
  selectedGift: null,
  giftQty: 1,
  pkActive: false,
  pkTimer: null,
  pkRed: 0,
  pkBlue: 0,
  chatInterval: null,
  speakInterval: null,
  currentRankTab: 'richest',
  currentGiftTab: 'popular',
  currentCat: 'all',
};

/* ── DOM Helpers ─────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ============================================================
   BOOT — Splash → Login
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  // Fill splash bar (2s) then show login
  setTimeout(() => {
    $('splash').style.opacity = '0';
    $('splash').style.transition = 'opacity .5s ease';
    setTimeout(() => {
      $('splash').classList.add('hidden');
      $('login-modal').classList.remove('hidden');
    }, 500);
  }, 2200);

  initLogin();
  initNav();
  initRoomsPage();
  initRankingPage();
  initGiftsStorePage();
  initWalletPage();
  initRoomModal();
  initGiftPanel();
  initEmojiPanel();
  initCreateRoom();
});

/* ============================================================
   LOGIN
   ============================================================ */
function initLogin() {
  $('login-btn').onclick = () => {
    const name  = $('login-username').value.trim() || 'زائر';
    const emoji = $('login-emoji').value.trim()    || '😊';

    state.user = {
      name, emoji,
      coins: 12500,
      diamonds: 350,
      level: 3,
    };

    $('login-modal').classList.add('hidden');
    $('app').classList.remove('hidden');

    // Update sidebar
    $('sidebar-avatar').textContent = emoji;
    $('sidebar-name').textContent   = name;
    $('sidebar-coins').textContent  = state.user.coins.toLocaleString('ar');

    // Update profile page
    $('profile-avatar-display').textContent = emoji;
    $('profile-username').textContent       = name;

    // Focus rooms
    showPage('rooms');
  };

  // Enter key
  [$('login-username'), $('login-emoji')].forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key==='Enter') $('login-btn').click(); });
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  $$('.nav-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showPage(btn.dataset.page);
    };
  });
}

function showPage(pageId) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${pageId}`);
  if (target) target.classList.add('active');
}

/* ============================================================
   ROOMS LIST PAGE
   ============================================================ */
function initRoomsPage() {
  renderRooms('all');

  // Category tabs
  $$('.cat-tab').forEach(tab => {
    tab.onclick = () => {
      $$('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentCat = tab.dataset.cat;
      renderRooms(state.currentCat);
    };
  });

  // Search
  $('room-search').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = VCRM_DATA.rooms.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q)
    );
    renderRoomsGrid(filtered);
  });

  // Create room
  $('btn-create-room').onclick = () => $('create-room-modal').classList.remove('hidden');
}

function renderRooms(cat) {
  const list = cat === 'all'
    ? VCRM_DATA.rooms
    : VCRM_DATA.rooms.filter(r => r.cat === cat);
  renderRoomsGrid(list);
}

function renderRoomsGrid(rooms) {
  const grid = $('rooms-grid');
  grid.innerHTML = '';

  rooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <div class="room-card-cover" style="background:${roomGradient(room.cat)}">
        <span style="font-size:3rem">${room.emoji}</span>
        <span class="room-tag tag-${room.cat}">${roomTagLabel(room.cat)}</span>
      </div>
      <div class="room-mics-preview">
        ${room.seats.map(s => `<div class="mic-dot ${s?'occupied':''}">${s?s[0]:'🎤'}</div>`).join('')}
      </div>
      <div class="room-card-name">${room.name}</div>
      <div class="room-card-desc">${room.desc}</div>
      <div class="room-card-footer">
        <div class="room-online-count">👥 ${room.online.toLocaleString('ar')}</div>
        <div class="room-host">
          <span>${room.hostEmoji}</span>
          <span>${room.host}</span>
          <span class="room-host-lv">Lv.${room.hostLv}</span>
        </div>
      </div>
    `;
    card.onclick = () => openRoom(room);
    grid.appendChild(card);
  });

  // Empty state
  if (rooms.length === 0) {
    grid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:3rem;grid-column:1/-1">لا توجد غرف مطابقة 🔍</div>';
  }
}

function roomGradient(cat) {
  const g = {
    hot:   'linear-gradient(135deg,rgba(239,68,68,.3),rgba(249,115,22,.2))',
    music: 'linear-gradient(135deg,rgba(6,182,212,.3),rgba(16,185,129,.2))',
    pk:    'linear-gradient(135deg,rgba(168,85,247,.3),rgba(236,72,153,.2))',
    game:  'linear-gradient(135deg,rgba(16,185,129,.3),rgba(6,182,212,.2))',
    new:   'linear-gradient(135deg,rgba(59,130,246,.3),rgba(168,85,247,.2))',
  };
  return g[cat] || g.new;
}

function roomTagLabel(cat) {
  const l = { hot:'🔥 رائجة', music:'🎵 موسيقى', pk:'⚔️ PK', game:'🎮 ألعاب', new:'✨ جديدة' };
  return l[cat] || '✨';
}

/* ============================================================
   RANKING PAGE
   ============================================================ */
function initRankingPage() {
  renderRanking('richest');

  $$('.rank-tab').forEach(tab => {
    tab.onclick = () => {
      $$('.rank-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentRankTab = tab.dataset.rank;
      renderRanking(state.currentRankTab);
    };
  });
}

function renderRanking(type) {
  const list = $('ranking-list');
  list.innerHTML = '';
  const items = VCRM_DATA.ranking[type] || [];

  items.forEach((item, i) => {
    const posClass = i===0?'gold':i===1?'silver':i===2?'bronze':'other';
    const posLabel = i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1;
    const el = document.createElement('div');
    el.className = 'rank-item';
    el.innerHTML = `
      <div class="rank-pos ${posClass}">${posLabel}</div>
      <div class="rank-avatar">${item.emoji}</div>
      <div class="rank-info">
        <div class="rank-name">${item.name}</div>
        <div class="rank-sub">${item.sub}</div>
      </div>
      <div class="rank-val">${item.val}</div>
    `;
    list.appendChild(el);
  });
}

/* ============================================================
   GIFTS STORE PAGE
   ============================================================ */
function initGiftsStorePage() {
  const grid = $('gifts-store-grid');
  VCRM_DATA.gifts.forEach(gift => {
    const card = document.createElement('div');
    card.className = 'gift-store-card';
    card.innerHTML = `
      <div class="gift-emoji">${gift.emoji}</div>
      <div class="gift-name">${gift.name}</div>
      <div class="gift-price">🪙 ${gift.price.toLocaleString('ar')}</div>
    `;
    card.onclick = () => {
      showToast(`${gift.emoji} ${gift.name} – ${gift.price} عملة`);
    };
    grid.appendChild(card);
  });
}

/* ============================================================
   WALLET PAGE
   ============================================================ */
function initWalletPage() {
  // Recharge packages
  const rGrid = $('recharge-grid');
  VCRM_DATA.recharge.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'recharge-card';
    card.innerHTML = `
      <div class="recharge-amount">🪙 ${pkg.coins.toLocaleString('ar')}</div>
      <div class="recharge-price">${pkg.price}</div>
      ${pkg.bonus ? `<div class="recharge-bonus">${pkg.bonus}</div>` : ''}
    `;
    card.onclick = () => showToast(`💳 جارٍ الانتقال لبوابة الدفع...`);
    rGrid.appendChild(card);
  });

  // Transactions
  const txList = $('tx-list');
  VCRM_DATA.transactions.forEach(tx => {
    const el = document.createElement('div');
    el.className = 'tx-item';
    el.innerHTML = `
      <div>
        <div class="tx-type">${tx.type}</div>
        <div class="tx-date">${tx.date}</div>
      </div>
      <div class="tx-amount ${tx.sign}">${tx.amount} 🪙</div>
    `;
    txList.appendChild(el);
  });

  // Sync wallet display
  updateWalletDisplay();
}

function updateWalletDisplay() {
  if (!state.user) return;
  $('wallet-coins').textContent    = state.user.coins.toLocaleString('ar');
  $('wallet-diamonds').textContent = state.user.diamonds.toLocaleString('ar');
  $('sidebar-coins').textContent   = state.user.coins.toLocaleString('ar');
  $('gift-balance-val').textContent = state.user.coins.toLocaleString('ar');
}

/* ============================================================
   VOICE ROOM MODAL
   ============================================================ */
function initRoomModal() {
  $('room-back-btn').onclick = closeRoom;

  // Toolbar
  $('btn-mic').onclick   = toggleMic;
  $('btn-gift').onclick  = openGiftPanel;
  $('btn-emoji').onclick = openEmojiPanel;
  $('btn-music').onclick = () => showToast('🎵 تشغيل الموسيقى...');
  $('btn-pk').onclick    = startPKChallenge;
  $('send-btn').onclick  = sendChatMessage;
  $('chat-input').addEventListener('keydown', e => { if(e.key==='Enter') sendChatMessage(); });
  $('room-more-btn').onclick = showRoomOptions;
}

function openRoom(room) {
  state.currentRoom = room;
  state.micOn = false;
  state.pkActive = false;
  state.pkRed = 0;
  state.pkBlue = 0;

  // Fill header
  $('modal-room-title').textContent  = room.name;
  $('modal-room-id').textContent     = `ID: #${room.id}`;
  $('modal-room-type').textContent   = roomTagLabel(room.cat);
  $('modal-room-online').textContent = room.online.toLocaleString('ar');

  // Update room header background
  $('room-header-bg').style.background = roomGradient(room.cat);

  // Host seat
  $('host-avatar').textContent = room.hostEmoji;
  $('host-name').textContent   = room.host;

  // Render mic seats
  renderMicSeats(room.seats);

  // Clear chat
  $('chat-area').innerHTML = '';
  $('pk-bar').classList.add('hidden');

  // Seed chat messages
  VCRM_DATA.chatMessages.forEach((m, i) => {
    setTimeout(() => addChatMessage(m.user, m.emoji, m.text, m.gift), i * 500);
  });

  // Random activity (new users join / chat)
  startRoomActivity();

  // Show modal
  $('room-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRoom() {
  $('room-modal').classList.add('hidden');
  document.body.style.overflow = '';
  stopRoomActivity();
  if (state.pkTimer) { clearInterval(state.pkTimer); state.pkTimer = null; }
  state.currentRoom = null;
  state.micOn = false;
  $('btn-mic').classList.remove('mic-on');
  $('btn-mic').textContent = '🎤';
}

/* ── Mic Seats ──────────────────────────────────────────── */
function renderMicSeats(seats) {
  const grid = $('mic-seats-grid');
  grid.innerHTML = '';

  seats.forEach((occupant, i) => {
    const seat = document.createElement('div');
    seat.className = `mic-seat ${occupant ? 'occupied' : ''}`;
    seat.id = `mic-seat-${i}`;

    seat.innerHTML = `
      <div class="mic-seat-avatar">
        <span class="mic-seat-num">${i+1}</span>
        ${occupant
          ? `<span style="font-size:1.4rem">${occupant[0]}</span>`
          : `<span style="font-size:1rem;color:var(--text-faint)">🎤</span>`}
        ${occupant ? `<span class="mic-muted-icon">🔇</span>` : ''}
      </div>
      <div class="mic-seat-name">${occupant || 'فارغ'}</div>
    `;

    // Click empty seat → request mic
    if (!occupant) {
      seat.onclick = () => requestMicSeat(i);
    } else {
      seat.onclick = () => showUserProfile(occupant, i);
    }

    grid.appendChild(seat);
  });
}

function requestMicSeat(seatIdx) {
  if (!state.currentRoom) return;
  const confirmJoin = confirm(`هل تريد الانضمام للمقعد رقم ${seatIdx+1}؟`);
  if (!confirmJoin) return;

  const seat = $(`mic-seat-${seatIdx}`);
  if (!seat) return;

  state.currentRoom.seats[seatIdx] = state.user.name;
  seat.className = 'mic-seat occupied speaking';
  seat.innerHTML = `
    <div class="mic-seat-avatar">
      <span class="mic-seat-num">${seatIdx+1}</span>
      <span style="font-size:1.4rem">${state.user.emoji}</span>
    </div>
    <div class="mic-seat-name">${state.user.name}</div>
  `;

  addSystemMessage(`🎤 ${state.user.name} انضم للميك!`);
  state.micOn = true;
  $('btn-mic').classList.add('mic-on');
  $('btn-mic').textContent = '🎙️';

  setTimeout(() => seat.classList.remove('speaking'), 5000);
}

function showUserProfile(name, seatIdx) {
  const actions = ['💰 إرسال هدية', '➕ إضافة صديق', '🔇 كتم', '🚫 طرد'];
  const choice = prompt(`👤 ${name}\n\n${actions.join('\n')}\n\nاكتب رقم الخيار (1-4):`);
  if (choice === '1') openGiftPanel();
  else if (choice === '2') { addSystemMessage(`✅ تمت إضافة ${name} كصديق!`); }
  else if (choice === '3') { addSystemMessage(`🔇 تم كتم ${name}`); }
}

/* ── Mic Toggle ─────────────────────────────────────────── */
function toggleMic() {
  state.micOn = !state.micOn;
  $('btn-mic').classList.toggle('mic-on', state.micOn);
  $('btn-mic').textContent = state.micOn ? '🎙️' : '🎤';
  const msg = state.micOn ? '🎙️ تم تفعيل الميك' : '🔇 تم إيقاف الميك';
  showToast(msg);
}

/* ── Chat ───────────────────────────────────────────────── */
function addChatMessage(user, emoji, text, isGift=false) {
  const area = $('chat-area');
  const msg  = document.createElement('div');
  msg.className = `chat-msg`;

  const colors = ['#a855f7','#ec4899','#06b6d4','#f59e0b','#10b981'];
  const color  = colors[Math.floor(Math.random()*colors.length)];

  msg.innerHTML = `
    <div class="chat-msg-avatar">${emoji}</div>
    <div class="chat-msg-bubble ${isGift?'chat-msg-gift':''}">
      <div class="chat-msg-name" style="color:${color}">${user}</div>
      <div class="chat-msg-text">${text}</div>
    </div>
  `;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  pruneChat(area);
}

function addSystemMessage(text) {
  const area = $('chat-area');
  const el   = document.createElement('div');
  el.className = 'chat-system';
  el.textContent = text;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

function pruneChat(area) {
  while (area.children.length > 60) area.removeChild(area.firstChild);
}

function sendChatMessage() {
  const input = $('chat-input');
  const text  = input.value.trim();
  if (!text || !state.user) return;
  addChatMessage(state.user.name, state.user.emoji, text);
  input.value = '';

  // PK score boost if pk active
  if (state.pkActive) {
    state.pkRed += Math.floor(Math.random()*50+10);
    updatePKDisplay();
  }
}

/* ── Room Activity Simulation ───────────────────────────── */
const FAKE_USERS = [
  {n:'سارة 🌸', e:'💃'},{n:'أحمد 😎', e:'😎'},{n:'ليلى 🌹', e:'🌺'},
  {n:'يوسف', e:'🎸'},{n:'رنا ✨', e:'🌙'},{n:'حمد 🇰🇼', e:'🏄'},
  {n:'فيصل', e:'👑'},{n:'منى 💛', e:'☀️'},{n:'طارق', e:'🎤'},
];
const FAKE_MSGS = [
  'السلام عليكم 👋','أهلاً بالجميع 🌹','هذي الغرفة حلوة!',
  'ما شاء الله 🔥','يهلا يهلا!','أنا من السعودية 🇸🇦',
  'مرحبا من الإمارات 🇦🇪','الغرفة ناشطة اليوم 👏',
  'بعثت هدية للمضيف 🎁','جو حلو ما شاء الله ✨',
  'ارسل قلب 💖','كتر خيركم 🙏',
];

function startRoomActivity() {
  stopRoomActivity();

  state.chatInterval = setInterval(() => {
    const u = FAKE_USERS[Math.floor(Math.random()*FAKE_USERS.length)];
    const m = FAKE_MSGS[Math.floor(Math.random()*FAKE_MSGS.length)];
    addChatMessage(u.n, u.e, m);
    // Random gift broadcast
    if (Math.random() < 0.15) {
      const g = VCRM_DATA.gifts[Math.floor(Math.random()*VCRM_DATA.gifts.length)];
      showBroadcast(`${u.e} ${u.n} أرسل ${g.emoji} ${g.name} للمضيف!`);
      addChatMessage('نظام 🤖','⭐',`${u.n} أرسل ${g.emoji} ${g.name}!`, true);
      triggerGiftAnimation(g.emoji);
      if (state.pkActive) { state.pkBlue += g.price; updatePKDisplay(); }
    }
    // Update online count
    if ($('modal-room-online') && state.currentRoom) {
      state.currentRoom.online += Math.floor(Math.random()*3 - 1);
      $('modal-room-online').textContent = Math.max(1,state.currentRoom.online).toLocaleString('ar');
    }
  }, 3500);

  // Speaking animation on random seat
  state.speakInterval = setInterval(() => {
    const seats = $$('.mic-seat.occupied');
    seats.forEach(s => s.classList.remove('speaking'));
    if (seats.length > 0) {
      const pick = seats[Math.floor(Math.random()*seats.length)];
      pick.classList.add('speaking');
      setTimeout(() => pick.classList.remove('speaking'), 2000);
    }
  }, 2500);
}

function stopRoomActivity() {
  if (state.chatInterval)  { clearInterval(state.chatInterval);  state.chatInterval  = null; }
  if (state.speakInterval) { clearInterval(state.speakInterval); state.speakInterval = null; }
}

/* ── Gift Animations ────────────────────────────────────── */
function triggerGiftAnimation(emoji) {
  const layer = $('gift-anim-layer');
  const el    = document.createElement('div');
  el.className = 'gift-anim';
  el.textContent = emoji;
  el.style.left = `${30 + Math.random()*40}%`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

/* ── Broadcast Banner ───────────────────────────────────── */
let broadcastTimeout = null;
function showBroadcast(text) {
  const banner = $('broadcast-banner');
  $('broadcast-text').textContent = '📢 ' + text;
  banner.classList.remove('hidden');
  if (broadcastTimeout) clearTimeout(broadcastTimeout);
  broadcastTimeout = setTimeout(() => banner.classList.add('hidden'), 3500);
}

/* ── PK Challenge ───────────────────────────────────────── */
function startPKChallenge() {
  if (state.pkActive) {
    showToast('⚔️ PK جارٍ بالفعل!');
    return;
  }
  state.pkActive = true;
  state.pkRed  = 0;
  state.pkBlue = 0;
  let remaining = 300; // 5 min

  $('pk-name-red').textContent  = state.currentRoom?.name||'غرفتك';
  $('pk-name-blue').textContent = 'غرفة المنافس';
  $('pk-bar').classList.remove('hidden');
  updatePKDisplay();
  showBroadcast('⚔️ بدأت منافسة PK! أرسل الهدايا لدعم غرفتك!');

  state.pkTimer = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining/60)).padStart(2,'0');
    const s = String(remaining%60).padStart(2,'0');
    $('pk-timer').textContent = `${m}:${s}`;

    // Opponent gets random points
    state.pkBlue += Math.floor(Math.random()*80);
    updatePKDisplay();

    if (remaining <= 0) {
      clearInterval(state.pkTimer); state.pkTimer = null;
      state.pkActive = false;
      const winner = state.pkRed >= state.pkBlue ? '🏆 فزتم!' : '💔 خسرتم!';
      showBroadcast(`⚔️ انتهى PK! ${winner}`);
      setTimeout(() => $('pk-bar').classList.add('hidden'), 4000);
    }
  }, 1000);
}

function updatePKDisplay() {
  $('pk-score-red').textContent  = state.pkRed.toLocaleString('ar');
  $('pk-score-blue').textContent = state.pkBlue.toLocaleString('ar');
  const total = state.pkRed + state.pkBlue || 1;
  const pct   = Math.round((state.pkRed / total) * 100);
  $('pk-progress').style.width = `${pct}%`;
}

/* ── Room Options ───────────────────────────────────────── */
function showRoomOptions() {
  const opts = ['📋 معلومات الغرفة','📢 الإعلانات','🚩 إبلاغ','📤 مشاركة','',
                `👥 المشاركون: ${state.currentRoom?.online||0}`];
  alert(opts.join('\n'));
}

/* ============================================================
   GIFT PANEL
   ============================================================ */
function initGiftPanel() {
  $('gift-panel-close').onclick = () => $('gift-panel').classList.add('hidden');
  $('gift-panel').onclick = e => { if(e.target===$('gift-panel')) $('gift-panel').classList.add('hidden'); };

  renderGiftPanel('popular');

  // Tabs
  $$('.gift-tab').forEach(tab => {
    tab.onclick = () => {
      $$('.gift-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentGiftTab = tab.dataset.gtab;
      renderGiftPanel(state.currentGiftTab);
    };
  });

  // Qty
  $('qty-minus').onclick = () => { if(state.giftQty>1) { state.giftQty--; $('gift-qty').textContent = state.giftQty; } };
  $('qty-plus').onclick  = () => { state.giftQty = Math.min(state.giftQty+1, 99); $('gift-qty').textContent = state.giftQty; };

  // Send
  $('btn-send-gift').onclick = sendGift;
}

function openGiftPanel() {
  $('gift-panel').classList.remove('hidden');
  $('gift-balance-val').textContent = state.user?.coins.toLocaleString('ar') || '0';
}

function renderGiftPanel(cat) {
  const grid = $('gifts-panel-grid');
  grid.innerHTML = '';
  state.selectedGift = null;

  const filtered = VCRM_DATA.gifts.filter(g => g.cat === cat);
  filtered.forEach(gift => {
    const el = document.createElement('div');
    el.className = 'gift-item';
    el.innerHTML = `
      <div class="gift-item-emoji">${gift.emoji}</div>
      <div class="gift-item-name">${gift.name}</div>
      <div class="gift-item-price">🪙${gift.price}</div>
    `;
    el.onclick = () => {
      $$('.gift-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedGift = gift;
    };
    grid.appendChild(el);
  });
}

function sendGift() {
  if (!state.selectedGift) { showToast('⚠️ اختر هدية أولاً!'); return; }
  const total = state.selectedGift.price * state.giftQty;
  if (state.user.coins < total) { showToast('❌ رصيدك غير كافٍ!'); return; }

  state.user.coins -= total;
  updateWalletDisplay();

  const g = state.selectedGift;
  $('gift-panel').classList.add('hidden');

  // Animate gift
  for(let i=0; i<Math.min(state.giftQty,3); i++) {
    setTimeout(() => triggerGiftAnimation(g.emoji), i*300);
  }

  // Chat message
  addChatMessage(state.user.name, state.user.emoji,
    `${g.emoji} أرسل ${state.giftQty > 1 ? state.giftQty+'x ' : ''}${g.name} للمضيف!`, true);

  // Broadcast
  showBroadcast(`${state.user.emoji} ${state.user.name} أرسل ${g.emoji} ${g.name} ×${state.giftQty}!`);

  // PK
  if (state.pkActive) { state.pkRed += total; updatePKDisplay(); }

  showToast(`✅ تم إرسال ${g.name} ${g.emoji}`);
  state.giftQty = 1;
  $('gift-qty').textContent = '1';
}

/* ============================================================
   EMOJI PANEL
   ============================================================ */
function initEmojiPanel() {
  $('emoji-panel').onclick = e => { if(e.target===$('emoji-panel')) closeEmojiPanel(); };

  const grid = $('emoji-grid');
  VCRM_DATA.emojis.forEach(em => {
    const btn = document.createElement('div');
    btn.className = 'emoji-btn';
    btn.textContent = em;
    btn.onclick = () => {
      $('chat-input').value += em;
      $('chat-input').focus();
      closeEmojiPanel();
    };
    grid.appendChild(btn);
  });
}

function openEmojiPanel() {
  $('emoji-panel').classList.remove('hidden');
}
function closeEmojiPanel() {
  $('emoji-panel').classList.add('hidden');
}

/* ============================================================
   CREATE ROOM MODAL
   ============================================================ */
function initCreateRoom() {
  $('cr-cancel').onclick  = () => $('create-room-modal').classList.add('hidden');
  $('create-room-modal').onclick = e => {
    if(e.target===$('create-room-modal')) $('create-room-modal').classList.add('hidden');
  };

  $('cr-confirm').onclick = () => {
    const name  = $('cr-name').value.trim()  || 'غرفتي الجديدة';
    const type  = $('cr-type').value;
    const desc  = $('cr-desc').value.trim()  || 'غرفة مميزة';
    const emoji = $('cr-emoji').value.trim() || '🌟';

    const newRoom = {
      id:    Math.floor(9000+Math.random()*1000),
      name:  `${name}`,
      emoji,
      cat:   type,
      online: 1,
      host:   state.user?.name || 'أنت',
      hostEmoji: state.user?.emoji || '😊',
      hostLv: state.user?.level || 1,
      desc,
      seats: ['','','','','','','',''],
    };

    VCRM_DATA.rooms.unshift(newRoom);
    $('create-room-modal').classList.add('hidden');
    renderRooms(state.currentCat);
    showPage('rooms');
    showToast(`✅ تم إنشاء غرفة: ${name}`);

    // Auto-open new room after short delay
    setTimeout(() => openRoom(newRoom), 400);

    // Clear form
    $('cr-name').value = $('cr-desc').value = $('cr-emoji').value = '';
  };
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(msg) {
  let toast = document.getElementById('vcrm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vcrm-toast';
    toast.style.cssText = `
      position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
      background:rgba(30,30,55,.95);border:1px solid rgba(168,85,247,.3);
      color:#fff;padding:.6rem 1.4rem;border-radius:99px;
      font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:600;
      z-index:9999;pointer-events:none;
      box-shadow:0 4px 20px rgba(0,0,0,.4);
      transition:opacity .3s ease;white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $('gift-panel').classList.add('hidden');
    $('emoji-panel').classList.add('hidden');
    $('create-room-modal').classList.add('hidden');
    if (state.currentRoom) closeRoom();
  }
});
