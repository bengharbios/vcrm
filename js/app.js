// ============================================================
//  VCRM — app.js  ·  Yalla Ludo-style Voice Rooms
// ============================================================
'use strict';

/* ── Global State ─────────────────────────────────────────── */
const S = {
  user: null,           // { name, emoji, coins, diamonds, level }
  room: null,           // current room object
  micMode: 'chat5',     // chat5 | broadcast5 | chat10 | team10
  myMicSeat: -1,        // which seat index (-1 = none)
  micOn: false,
  selectedGift: null,
  giftQty: 1,
  giftTab: 'popular',
  pkActive: false,
  pkTimer: null,
  pkRed: 0, pkBlue: 0,
  adminPerms: { clock:false,vote:false,fruit:false,chest:false,wheel:false,miclock:false,theme:false },
  membershipFee: 80,
  announcement: 'Add your room announcement here.',
  chatSim: null,
  speakSim: null,
  selectedMicMode: 'chat5',
  voteTimer: null,
  wheelSpinning: false,
};

/* ── Helpers ─────────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = s  => document.querySelectorAll(s);

function toast(msg, dur=2500) {
  let t = $('vcrm-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'vcrm-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity='0'; }, dur);
}

function openOverlay(id) { $(id).classList.remove('hidden'); }
function closeOverlay(id){ $(id).classList.add('hidden'); }

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    $('splash').style.transition = 'opacity .5s';
    $('splash').style.opacity = '0';
    setTimeout(() => {
      $('splash').classList.add('hidden');
      openOverlay('login-modal');
    }, 500);
  }, 2300);

  buildAvatarPicker();
  initLogin();
  initTopTabs();
  initSearch();
  initBottomNav();
  initRoomsGrid();
  initHotGrid();
  initMyTab();
  initGiftPanel();
  initGamePanel();
  initSettings();
  initMicModeModal();
  initAdminModal();
  initVoteModal();
  initWheelModal();
  initCreateRoom();
  initRoomModal();
});

/* ── Avatar Picker ──────────────────────────────────────── */
const AVATARS = ['😊','😎','🤩','😍','🥰','🤗','😂','🥳','😇','🤠','👸','🦸',
                 '🐯','🦊','🐼','🦁','🐸','🎸','👑','🌺'];
function buildAvatarPicker() {
  const g = $('ap-grid');
  AVATARS.forEach(av => {
    const el = document.createElement('div');
    el.className = 'ap-item';
    el.textContent = av;
    el.onclick = () => {
      $$('.ap-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    };
    if (av === '😊') el.classList.add('selected');
    g.appendChild(el);
  });
}

/* ============================================================
   LOGIN
   ============================================================ */
function initLogin() {
  $('login-btn').onclick = doLogin;
  $('login-username').addEventListener('keydown', e => e.key==='Enter' && doLogin());
}

function doLogin() {
  const name  = $('login-username').value.trim() || 'زائر';
  const selAv = document.querySelector('.ap-item.selected');
  const emoji = selAv ? selAv.textContent : '😊';

  S.user = { name, emoji, coins:12500, diamonds:350, level:3 };
  closeOverlay('login-modal');
  $('app').classList.remove('hidden');

  $('top-avatar').textContent = emoji;
  $('top-lv').textContent = S.user.level;

  renderRoomsGrid('all');
  renderHotGrid();
}

/* ============================================================
   TOP TABS
   ============================================================ */
function initTopTabs() {
  $$('.ttab').forEach(btn => {
    btn.onclick = () => {
      $$('.ttab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      $$('.tab-page').forEach(p=>p.classList.remove('active'));
      $(`tab-${btn.dataset.ttab}`).classList.add('active');
    };
  });
}

/* ── Search ─────────────────────────────────────────────── */
function initSearch() {
  $('top-search-btn').onclick = () => {
    $('search-bar').classList.toggle('hidden');
    $('search-input').focus();
  };
  $('search-close').onclick = () => $('search-bar').classList.add('hidden');
  $('search-input').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = VCRM_DATA.rooms.filter(r =>
      r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
    renderRoomsGrid('all', filtered);
  });
}

/* ── Bottom Nav ─────────────────────────────────────────── */
function initBottomNav() {
  $$('.bnav-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.bnav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.bnav;
      if (type==='chat') {
        // already on main view
      } else {
        toast(`قريباً: ${type} 🚧`);
      }
    };
  });
}

/* ── Rooms Grid ─────────────────────────────────────────── */
function initRoomsGrid() {
  $$('.ctab').forEach(tab => {
    tab.onclick = () => {
      $$('.ctab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      renderRoomsGrid(tab.dataset.cat);
    };
  });
}

function renderRoomsGrid(cat, list) {
  const data = list || (cat==='all' ? VCRM_DATA.rooms : VCRM_DATA.rooms.filter(r=>r.cat===cat));
  const grid = $('rooms-grid');
  grid.innerHTML = '';
  if (!data.length) {
    grid.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.5);padding:2rem;grid-column:1/-1">لا توجد غرف 🔍</div>';
    return;
  }
  data.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    const mics = micSeatsPreview(room.seats);
    card.innerHTML = `
      <div class="room-card-cover" style="${roomCoverStyle(room.cat)}">
        <span>${room.emoji}</span>
        <span class="room-tag tag-${room.cat}">${catLabel(room.cat)}</span>
      </div>
      <div class="room-card-body">
        <div class="room-card-name">${room.name}</div>
        <div class="room-mics-row">${mics}</div>
        <div class="room-card-footer">
          <div class="room-online">👥 ${room.online}</div>
          <div class="room-host">${room.hostEmoji} ${room.host} <span class="host-lv">Lv.${room.hostLv}</span></div>
        </div>
      </div>`;
    card.onclick = () => openRoom(room);
    grid.appendChild(card);
  });
}

function micSeatsPreview(seats) {
  return seats.slice(0,8).map(s =>
    `<div class="rm-dot ${s?'occ':''}">${s ? s[0] : ''}</div>`
  ).join('');
}

function roomCoverStyle(cat) {
  const g = {
    hot:   'background:linear-gradient(135deg,rgba(230,57,70,.35),rgba(255,124,42,.25))',
    music: 'background:linear-gradient(135deg,rgba(6,182,212,.35),rgba(16,185,129,.25))',
    pk:    'background:linear-gradient(135deg,rgba(139,92,246,.35),rgba(236,72,153,.25))',
    game:  'background:linear-gradient(135deg,rgba(16,185,129,.35),rgba(6,182,212,.25))',
    all:   'background:linear-gradient(135deg,rgba(59,130,246,.35),rgba(139,92,246,.25))',
  };
  return g[cat] || g.all;
}

function catLabel(cat) {
  return {hot:'🔥',music:'🎵',pk:'⚔️',game:'🎮',all:'🌐'}[cat]||'🌐';
}

/* ── Hot Grid ───────────────────────────────────────────── */
function initHotGrid() {}
function renderHotGrid() {
  const sorted = [...VCRM_DATA.rooms].sort((a,b)=>b.online-a.online);
  const grid = $('hot-grid');
  grid.innerHTML = '';
  sorted.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <div class="room-card-cover" style="${roomCoverStyle(room.cat)}">
        <span>${room.emoji}</span>
        <span class="room-tag tag-${room.cat}">${catLabel(room.cat)}</span>
      </div>
      <div class="room-card-body">
        <div class="room-card-name">${room.name}</div>
        <div class="room-mics-row">${micSeatsPreview(room.seats)}</div>
        <div class="room-card-footer">
          <div class="room-online">👥 ${room.online}</div>
          <div class="room-host">${room.hostEmoji} ${room.host}</div>
        </div>
      </div>`;
    card.onclick = () => openRoom(room);
    grid.appendChild(card);
  });
}

/* ── My Tab ─────────────────────────────────────────────── */
function initMyTab() {
  $('btn-create-room').onclick = () => openOverlay('create-room-modal');
  $('btn-find-rooms').onclick  = () => {
    $$('.ttab').forEach(b=>b.classList.remove('active'));
    document.querySelector('[data-ttab="explore"]').classList.add('active');
    $$('.tab-page').forEach(p=>p.classList.remove('active'));
    $('tab-explore').classList.add('active');
  };
  $$('.mytab').forEach(tab => {
    tab.onclick = () => {
      $$('.mytab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
    };
  });
}

/* ============================================================
   VOICE ROOM — OPEN / CLOSE
   ============================================================ */
function initRoomModal() {
  $('rh-back').onclick   = closeRoom;
  $('rh-power').onclick  = closeRoom;
  $('rh-more').onclick   = () => openOverlay('settings-panel');
  $('rt-gift').onclick   = openGiftPanel;
  $('rt-gamepad').onclick = () => openOverlay('game-panel');
  $('rt-speaker').onclick = toggleSpeaker;

  $('rt-chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChatMsg();
  });

  // Shortcuts
  $('sc-treasure').onclick = () => toast('🪙 Treasure قريباً!');
  $('sc-activity').onclick = () => toast('🎯 Activity قريباً!');
  $('sc-messages').onclick = () => toast('💬 Messages قريباً!');
  $('sc-music').onclick    = () => toast('🎵 Music قريباً!');
  $('ann-edit').onclick    = editAnnouncement;
}

function openRoom(room) {
  S.room = room;
  S.myMicSeat = -1;
  S.micOn = false;
  S.pkActive = false; S.pkRed = 0; S.pkBlue = 0;
  S.micMode = room.micMode || 'chat5';
  S.announcement = room.announcement || 'Add your room announcement here.';

  // Header
  $('rh-avatar').textContent   = room.hostEmoji;
  $('rh-username').textContent = room.host;
  $('rh-uid').textContent      = `ID:${room.id}`;
  $('rh-coins').querySelector('span:last-child').textContent = S.user?.coins?.toLocaleString('ar')||'0';
  $('rs-members').textContent  = room.online;
  $('rs-rank').textContent     = '0';
  $('ann-text').textContent    = S.announcement;

  // Settings sync
  $('settings-avatar').textContent  = room.hostEmoji;
  $('sr-uname-val').textContent     = room.host;
  $('sr-ann-val').textContent       = S.announcement;
  $('sr-micmode-val').textContent   = micModeLabel(S.micMode);
  $('sr-fee-val').textContent       = S.membershipFee;

  // Clear chat & PK
  $('room-chat').innerHTML = '';
  $('pk-bar').classList.add('hidden');
  $('gift-banner').classList.add('hidden');

  // Render mic seats
  renderMicSeats();

  // Seed chat
  VCRM_DATA.chatMessages.forEach((m,i) => {
    setTimeout(() => addChatMsg(m.user, m.emoji, m.text, m.gift), i*450);
  });

  startRoomSim();

  $('room-wrapper').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRoom() {
  stopRoomSim();
  if (S.pkTimer) { clearInterval(S.pkTimer); S.pkTimer=null; }
  if (S.voteTimer){ clearInterval(S.voteTimer); S.voteTimer=null; }
  S.room = null; S.myMicSeat=-1; S.micOn=false; S.pkActive=false;
  $('room-wrapper').classList.add('hidden');
  document.body.style.overflow = '';
  // Update room online count in grid
  renderRoomsGrid(document.querySelector('.ctab.active')?.dataset.cat || 'all');
}

/* ── Mic Mode Label ─────────────────────────────────────── */
function micModeLabel(mode) {
  return {chat5:'Chat – 5 Mics',broadcast5:'Broadcast – 5 Mics',
          chat10:'Chat – 10 Mics',team10:'Team – 10 Mics'}[mode]||'Chat – 5 Mics';
}

/* ── Render Mic Seats ───────────────────────────────────── */
function renderMicSeats() {
  const area   = $('mic-area');
  area.innerHTML = '';
  const mode   = S.micMode;
  const seats  = S.room?.seats || [];
  const count  = (mode==='chat5'||mode==='broadcast5') ? 5 : 10;

  // Determine grid class
  let gridClass = 'mic-grid-5';
  if (mode==='broadcast5') gridClass='mic-grid-broadcast';
  else if (mode==='chat10'||mode==='team10') gridClass='mic-grid-10';

  const grid = document.createElement('div');
  grid.className = gridClass;

  // For broadcast: first seat is host-style (big), rest are listeners
  Array.from({length:count}).forEach((_,i) => {
    const occupant = seats[i] || '';
    const isMe     = i === S.myMicSeat;
    const isLocked = mode==='broadcast5' && i>0 && !occupant;  // broadcast: empty slots locked for listeners

    const seat = document.createElement('div');
    seat.className = `mic-seat ${occupant?'occupied':''} ${isMe?'me':''} ${isLocked?'locked':''}`;
    seat.id = `mseat-${i}`;

    let innerHTML = '';
    if (occupant) {
      innerHTML = `
        <div class="mic-avatar">
          <span class="mic-seat-num">${i+1}</span>
          <span style="font-size:1.3rem">${occupant[0]}</span>
          ${isMe
            ? `<span class="mic-mic-icon">🎤</span>`
            : `<span class="mic-muted">🔇</span>`}
        </div>
        <div class="mic-seat-label">${occupant.length>6?occupant.slice(0,6)+'…':occupant}</div>`;
    } else if (isLocked) {
      innerHTML = `
        <div class="mic-avatar">
          <span class="mic-seat-num">${i+1}</span>
          <span style="font-size:1rem">🔒</span>
        </div>
        <div class="mic-seat-label">مقفل</div>`;
    } else {
      innerHTML = `
        <div class="mic-avatar">
          <span class="mic-seat-num">${i+1}</span>
          <span style="font-size:1rem;opacity:.4">🎤</span>
        </div>
        <div class="mic-seat-label" style="color:rgba(255,255,255,.35)">فارغ ${i+1}</div>`;
    }
    seat.innerHTML = innerHTML;

    if (!occupant && !isLocked) {
      seat.onclick = () => takeMicSeat(i);
    } else if (occupant && !isMe) {
      seat.onclick = () => showSeatOptions(occupant, i);
    } else if (isMe) {
      seat.onclick = () => leaveMicSeat();
    }

    grid.appendChild(seat);
  });

  area.appendChild(grid);
}

/* ── Mic Seat Actions ───────────────────────────────────── */
function takeMicSeat(idx) {
  if (S.myMicSeat >= 0) { toast('⚠️ أنت بالفعل على الميك!'); return; }
  S.room.seats[idx] = S.user.name;
  S.myMicSeat = idx;
  S.micOn = true;
  renderMicSeats();
  addSystemMsg(`🎤 ${S.user.name} انضم للميك مقعد ${idx+1}!`);
}

function leaveMicSeat() {
  if (S.myMicSeat < 0) return;
  S.room.seats[S.myMicSeat] = '';
  S.myMicSeat = -1;
  S.micOn = false;
  renderMicSeats();
  addSystemMsg(`🎤 ${S.user.name} غادر الميك.`);
}

function showSeatOptions(name, idx) {
  // Show simple action sheet
  const opts = `خيارات للمستخدم ${name}:\n1. 🎁 إرسال هدية\n2. ➕ إضافة صديق\n3. 🔇 كتم\n4. 🚫 إزالة من الميك`;
  const choice = prompt(opts);
  if (choice==='1') openGiftPanel();
  else if (choice==='2') { addSystemMsg(`✅ تمت إضافة ${name} للأصدقاء`); }
  else if (choice==='3') { addSystemMsg(`🔇 تم كتم ${name}`); }
  else if (choice==='4') {
    S.room.seats[idx]='';
    renderMicSeats();
    addSystemMsg(`🚫 تم إزالة ${name} من الميك`);
  }
}

function toggleSpeaker() {
  toast('🔊 إيقاف/تشغيل الصوت');
}

/* ── Chat ───────────────────────────────────────────────── */
function sendChatMsg() {
  const inp  = $('rt-chat-input');
  const text = inp.value.trim();
  if (!text || !S.user) return;
  addChatMsg(S.user.name, S.user.emoji, text);
  inp.value = '';
  if (S.pkActive) { S.pkRed += Math.floor(Math.random()*30+5); updatePK(); }
}

function addChatMsg(user, emoji, text, isGift=false) {
  const area = $('room-chat');
  const el   = document.createElement('div');
  el.className = 'chat-msg';

  const COLORS = ['#64d8a0','#f5b800','#c084fc','#38bdf8','#fb923c','#f472b6'];
  const color  = COLORS[Math.abs(hashCode(user)) % COLORS.length];

  el.innerHTML = `
    <div class="chat-emoji">${emoji}</div>
    <div class="chat-bubble ${isGift?'chat-gift-bubble':''}">
      <div class="chat-name" style="color:${color}">${user}</div>
      <div class="chat-text">${text}</div>
    </div>`;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
  while(area.children.length > 80) area.removeChild(area.firstChild);
}

function addSystemMsg(text) {
  const area = $('room-chat');
  const el   = document.createElement('div');
  el.className = 'chat-system-msg';
  el.textContent = text;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

function hashCode(s){ let h=0; for(let c of s) h=(Math.imul(31,h)+c.charCodeAt(0))|0; return h; }

/* ── Announcement ───────────────────────────────────────── */
function editAnnouncement() {
  const text = prompt('نص الإعلان:', S.announcement);
  if (text === null) return;
  S.announcement = text.trim() || S.announcement;
  $('ann-text').textContent = S.announcement;
  $('sr-ann-val').textContent = S.announcement;
  if (S.room) S.room.announcement = S.announcement;
}

/* ── Room Simulation ────────────────────────────────────── */
const BOTS = [
  {n:'سارة 🌸',e:'💃'},{n:'أحمد',e:'😎'},{n:'ليلى',e:'🌺'},
  {n:'يوسف',e:'🎸'},{n:'رنا ✨',e:'🌙'},{n:'حمد',e:'🏄'},
  {n:'فيصل',e:'👑'},{n:'منى',e:'☀️'},{n:'طارق',e:'🎤'},
];
const BOT_MSGS = [
  'السلام عليكم 👋','أهلاً بالجميع 🌹','غرفة حلوة ما شاء الله',
  'مرحبا 🔥','يهلا يهلا!','جايين من السعودية 🇸🇦',
  'تسلم المضيف 🙏','جو حلو ✨','ودي أصعد الميك',
  'كتر خيرك أخوي','ما شاء الله عليك 💛',
];

function startRoomSim() {
  stopRoomSim();
  S.chatSim = setInterval(() => {
    const b = BOTS[Math.floor(Math.random()*BOTS.length)];
    const m = BOT_MSGS[Math.floor(Math.random()*BOT_MSGS.length)];
    addChatMsg(b.n, b.e, m);

    // Occasional gift
    if (Math.random() < 0.12) {
      const g = VCRM_DATA.gifts[Math.floor(Math.random()*VCRM_DATA.gifts.length)];
      const qty = Math.random()<0.3 ? Math.floor(Math.random()*9+2) : 1;
      addChatMsg(b.n, b.e, `${g.emoji} أرسل ${g.name}${qty>1?' ×'+qty:''} للمضيف!`, true);
      triggerGiftAnim(g.emoji, qty);
      showGiftBanner(`${b.e} ${b.n} sent ${g.emoji} ${g.name} ×${qty}`);
      if (S.pkActive) { S.pkBlue += g.price * qty; updatePK(); }
    }

    // Update online count
    if (S.room) {
      S.room.online = Math.max(1, S.room.online + (Math.random()<.6?1:-1));
      $('rs-members').textContent = S.room.online;
    }
  }, 3800);

  // Speaking animation
  S.speakSim = setInterval(() => {
    $$('.mic-seat.occupied').forEach(s => s.classList.remove('speaking'));
    const occ = Array.from($$('.mic-seat.occupied'));
    if (occ.length) {
      const pick = occ[Math.floor(Math.random()*occ.length)];
      pick.classList.add('speaking');
      setTimeout(() => pick.classList.remove('speaking'), 1800);
    }
  }, 2200);
}

function stopRoomSim() {
  if (S.chatSim)  { clearInterval(S.chatSim);  S.chatSim=null; }
  if (S.speakSim) { clearInterval(S.speakSim); S.speakSim=null; }
}

/* ── Gift Animations ────────────────────────────────────── */
function triggerGiftAnim(emoji, qty=1) {
  const layer = $('gift-anim-layer');
  const n = Math.min(qty, 4);
  for (let i=0; i<n; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'gift-anim';
      el.textContent = emoji;
      el.style.left = `${25 + Math.random()*50}%`;
      layer.appendChild(el);
      setTimeout(() => el.remove(), 2300);
    }, i*250);
  }
}

function showGiftBanner(text) {
  const b = $('gift-banner');
  $('gb-inner').textContent = '🎁 ' + text;
  b.classList.remove('hidden');
  clearTimeout(b._t);
  b._t = setTimeout(() => b.classList.add('hidden'), 4000);
}

/* ============================================================
   GIFT PANEL
   ============================================================ */
function initGiftPanel() {
  $('gift-panel').onclick = e => { if(e.target===$('gift-panel')) closeOverlay('gift-panel'); };
  $('gift-panel-close').onclick = () => closeOverlay('gift-panel');

  $$('.gtab').forEach(tab => {
    tab.onclick = () => {
      $$('.gtab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      S.giftTab = tab.dataset.gtab;
      renderGifts();
    };
  });

  $('qty-m').onclick = () => { if(S.giftQty>1)S.giftQty--; $('qty-val').textContent=S.giftQty; };
  $('qty-p').onclick = () => { S.giftQty=Math.min(99,S.giftQty+1); $('qty-val').textContent=S.giftQty; };
  $('btn-send-gift').onclick = sendGift;

  renderGifts();
}

function openGiftPanel() {
  $('gf-bal').textContent = S.user?.coins?.toLocaleString('ar')||'0';
  openOverlay('gift-panel');
}

function renderGifts() {
  const g = $('gifts-grid');
  g.innerHTML = '';
  S.selectedGift = null;
  VCRM_DATA.gifts.filter(gf => gf.cat===S.giftTab).forEach(gf => {
    const el = document.createElement('div');
    el.className = 'gift-item';
    el.innerHTML = `<div class="gift-emoji">${gf.emoji}</div>
                    <div class="gift-name">${gf.name}</div>
                    <div class="gift-price">🪙${gf.price}</div>`;
    el.onclick = () => {
      $$('.gift-item').forEach(i=>i.classList.remove('sel'));
      el.classList.add('sel');
      S.selectedGift = gf;
    };
    g.appendChild(el);
  });
}

function sendGift() {
  if (!S.selectedGift) { toast('⚠️ اختر هدية أولاً!'); return; }
  const total = S.selectedGift.price * S.giftQty;
  if ((S.user?.coins||0) < total) { toast('❌ رصيدك غير كافٍ!'); return; }

  S.user.coins -= total;
  $('rh-coins').querySelector('span:last-child').textContent = S.user.coins.toLocaleString('ar');
  closeOverlay('gift-panel');

  const g = S.selectedGift;
  triggerGiftAnim(g.emoji, S.giftQty);
  showGiftBanner(`${S.user.emoji} ${S.user.name} sent ${g.emoji} ${g.name} ×${S.giftQty}`);
  addChatMsg(S.user.name, S.user.emoji, `${g.emoji} أرسل ${S.giftQty>1?S.giftQty+'x ':''}${g.name} للمضيف!`, true);

  if (S.pkActive) { S.pkRed += total; updatePK(); }
  toast(`✅ تم إرسال ${g.name} ${g.emoji}`);

  S.giftQty=1; $('qty-val').textContent='1';
}

/* ============================================================
   GAME PANEL
   ============================================================ */
function initGamePanel() {
  $('game-panel').onclick = e => { if(e.target===$('game-panel')) closeOverlay('game-panel'); };
  $('game-panel-close').onclick = () => closeOverlay('game-panel');

  $('game-vote').onclick  = startVote;
  $('game-fruit').onclick = () => { closeOverlay('game-panel'); toast('🍎 Fruit Fight بدأ!'); startFruitFight(); };
  $('game-chest').onclick = () => { closeOverlay('game-panel'); toast('📦 Fortune Chest يفتح!'); };
  $('game-wheel').onclick = () => { closeOverlay('game-panel'); openOverlay('wheel-modal'); };
  $('game-pk').onclick    = () => { closeOverlay('game-panel'); startPK(); };
  $('game-bomb').onclick  = () => { closeOverlay('game-panel'); toast('💣 Bomb Game قريباً!'); };
}

/* ── Vote Game ──────────────────────────────────────────── */
function initVoteModal() {
  $('vote-close').onclick = () => {
    closeOverlay('vote-modal');
    if(S.voteTimer){ clearInterval(S.voteTimer); S.voteTimer=null; }
  };
}

function startVote() {
  closeOverlay('game-panel');
  const options = [
    {label:'الخيار أ', votes:0},
    {label:'الخيار ب', votes:0},
    {label:'الخيار ج', votes:0},
  ];
  let voted = -1;
  let time  = 30;

  const container = $('vote-options');
  container.innerHTML = '';
  options.forEach((opt, i) => {
    const el = document.createElement('div');
    el.className = 'vote-opt';
    el.id = `vopt-${i}`;
    el.innerHTML = `
      <div class="vote-opt-label">${opt.label}</div>
      <div class="vote-pct" id="vpct-${i}">0%</div>
    `;
    el.onclick = () => {
      if (voted >= 0) return;
      voted = i;
      options[i].votes++;
      $$('.vote-opt').forEach(o=>o.classList.remove('voted'));
      el.classList.add('voted');
      updateVotePcts(options);
    };
    container.appendChild(el);
  });

  $('vote-timer').textContent = time;
  openOverlay('vote-modal');

  // Simulate other votes
  S.voteTimer = setInterval(() => {
    time--;
    $('vote-timer').textContent = time;
    // Random bot vote
    options[Math.floor(Math.random()*options.length)].votes++;
    updateVotePcts(options);
    if (time <= 0) {
      clearInterval(S.voteTimer); S.voteTimer=null;
      const winner = options.reduce((a,b)=>a.votes>b.votes?a:b);
      closeOverlay('vote-modal');
      toast(`🗳️ انتهى التصويت! الفائز: ${winner.label}`);
      addSystemMsg(`🗳️ التصويت انتهى! الفائز: ${winner.label}`);
    }
  }, 1000);
}

function updateVotePcts(options) {
  const total = options.reduce((s,o)=>s+o.votes,0)||1;
  options.forEach((o,i) => {
    const pct = Math.round(o.votes/total*100);
    const el = $(`vpct-${i}`);
    if(el) el.textContent = pct+'%';
  });
}

/* ── Fruit Fight Mini-Game ──────────────────────────────── */
function startFruitFight() {
  addSystemMsg('🍎 Fruit Fight بدأ! قطّع أكبر عدد ممكن!');
  // Simplified – just toast messages
  let count = 0;
  const interval = setInterval(() => {
    const fruits = ['🍎','🍊','🍋','🍇','🍓','🍉'];
    const f = fruits[Math.floor(Math.random()*fruits.length)];
    addSystemMsg(`${f} ${BOTS[Math.floor(Math.random()*BOTS.length)].n} قطّع ${f}!`);
    count++;
    if (count >= 5) {
      clearInterval(interval);
      addSystemMsg('🏆 انتهى Fruit Fight! برو!');
    }
  }, 1200);
}

/* ── Fortune Wheel ──────────────────────────────────────── */
const WHEEL_PRIZES = ['🪙 100','💎 5','🎁 هدية','🪙 500','🌟 نجمة','🪙 50','💰 1000','❌ صفر'];
const WHEEL_COLORS = ['#f5b800','#ff7c2a','#22a05a','#e63946','#7c3aed','#06b6d4','#f472b6','#64748b'];

function initWheelModal() {
  $('wheel-close').onclick = () => closeOverlay('wheel-modal');
  $('wheel-spin').onclick  = spinWheel;
  drawWheel(0);
}

function drawWheel(rotation) {
  const canvas = $('wheel-canvas');
  const ctx = canvas.getContext('2d');
  const cx=140, cy=140, r=130, n=WHEEL_PRIZES.length;
  ctx.clearRect(0,0,280,280);
  WHEEL_PRIZES.forEach((prize,i) => {
    const start = rotation + i*(2*Math.PI/n) - Math.PI/2;
    const end   = start + 2*Math.PI/n;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,end);
    ctx.fillStyle = WHEEL_COLORS[i];
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.5;ctx.stroke();
    // Text
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(start + Math.PI/n);
    ctx.fillStyle='#fff';ctx.font='bold 11px Cairo,sans-serif';
    ctx.textAlign='right';
    ctx.fillText(prize, r-8, 4);
    ctx.restore();
  });
  // Center circle
  ctx.beginPath();ctx.arc(cx,cy,18,0,2*Math.PI);
  ctx.fillStyle='#fff';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,14,0,2*Math.PI);
  ctx.fillStyle='#1a1a00';ctx.fill();
}

function spinWheel() {
  if (S.wheelSpinning) return;
  S.wheelSpinning = true;
  $('wheel-spin').disabled = true;
  const selected = Math.floor(Math.random()*WHEEL_PRIZES.length);
  const fullSpins = 5 + Math.random()*3;
  const targetRot = fullSpins*2*Math.PI + selected*(2*Math.PI/WHEEL_PRIZES.length);
  let start=null, cur=0;
  const dur=3000;
  function frame(ts) {
    if(!start) start=ts;
    const prog = Math.min((ts-start)/dur,1);
    const ease = 1-Math.pow(1-prog,4);
    cur = ease*targetRot;
    drawWheel(cur);
    if(prog<1) { requestAnimationFrame(frame); return; }
    S.wheelSpinning=false;
    $('wheel-spin').disabled=false;
    const prize = WHEEL_PRIZES[selected];
    closeOverlay('wheel-modal');
    toast(`🎡 فزت بـ: ${prize}!`);
    addSystemMsg(`🎡 ${S.user?.name} فاز بـ ${prize} من عجلة الحظ!`);
  }
  requestAnimationFrame(frame);
}

/* ── PK Battle ──────────────────────────────────────────── */
function startPK() {
  if (S.pkActive) { toast('⚔️ PK جارٍ بالفعل!'); return; }
  S.pkActive=true; S.pkRed=0; S.pkBlue=0;
  let secs=300;

  $('pk-r-name').textContent = S.room?.name||'غرفتك';
  $('pk-b-name').textContent = 'غرفة المنافس';
  $('pk-bar').classList.remove('hidden');
  updatePK();
  addSystemMsg('⚔️ بدأت مباراة PK! أرسل الهدايا لدعم غرفتك!');

  S.pkTimer = setInterval(() => {
    secs--;
    const m=String(Math.floor(secs/60)).padStart(2,'0');
    const s=String(secs%60).padStart(2,'0');
    $('pk-time').textContent=`${m}:${s}`;
    S.pkBlue += Math.floor(Math.random()*60);
    updatePK();
    if(secs<=0){
      clearInterval(S.pkTimer); S.pkTimer=null; S.pkActive=false;
      const win = S.pkRed>=S.pkBlue ? '🏆 فزتم!' : '💔 خسرتم!';
      addSystemMsg(`⚔️ انتهى PK! ${win}`);
      toast(`⚔️ ${win}`);
      setTimeout(()=>$('pk-bar').classList.add('hidden'),5000);
    }
  },1000);
}

function updatePK(){
  $('pk-r-score').textContent = S.pkRed.toLocaleString('ar');
  $('pk-b-score').textContent = S.pkBlue.toLocaleString('ar');
  const total = S.pkRed+S.pkBlue||1;
  $('pk-prog').style.width = Math.round(S.pkRed/total*100)+'%';
}

/* ============================================================
   SETTINGS PANEL
   ============================================================ */
function initSettings() {
  // Settings panel is attached to rh-more button (already done in initRoomModal)

  // The overlay close
  $('settings-panel').onclick = e => { if(e.target===$('settings-panel')) closeOverlay('settings-panel'); };
  $('settings-close').onclick = () => closeOverlay('settings-panel');

  $('sr-micmode').onclick   = () => { closeOverlay('settings-panel'); openOverlay('micmode-modal'); };
  $('sr-adminperm').onclick = () => { closeOverlay('settings-panel'); openOverlay('admin-modal'); };
  $('sr-memfee').onclick    = () => {
    const fee = prompt('رسوم العضوية (💎):', S.membershipFee);
    if (fee && !isNaN(fee)) {
      S.membershipFee = parseInt(fee);
      $('sr-fee-val').textContent = S.membershipFee;
      toast(`✅ تم ضبط رسوم العضوية: ${S.membershipFee} 💎`);
    }
  };
  $('sr-announcement').onclick = editAnnouncement;
  $('sr-username').onclick = () => {
    const n = prompt('تغيير اسم الغرفة:', S.room?.name||'');
    if (n && S.room) { S.room.name=n; $('rh-username').textContent=n; }
  };
  $('sr-tag').onclick       = () => toast('🏷️ Tag قريباً!');
  $('sr-micperm').onclick   = () => toast('🎤 Mic Permission قريباً!');
  $('sr-remove').onclick    = () => toast('🚫 Remove Members قريباً!');
  $('sr-blocklist').onclick = () => toast('⛔ Blocked List قريباً!');
  $('sr-oplog').onclick     = () => toast('📋 Operation Records قريباً!');
  $('sr-bonus').onclick     = () => toast('🎁 Daily Bonus قريباً!');
}

/* ============================================================
   MIC MODE MODAL
   ============================================================ */
const MIC_MODES = [
  { key:'chat5',      label:'Chat – 5 Mics',      dots:5,  locked:0  },
  { key:'broadcast5', label:'Broadcast – 5 Mics',  dots:5,  locked:4  },
  { key:'chat10',     label:'Chat – 10 Mics',      dots:10, locked:0, premium:true },
  { key:'team10',     label:'Team – 10 Mics',      dots:10, locked:0, premium:true },
];

function initMicModeModal() {
  $('micmode-modal').onclick = e => { if(e.target===$('micmode-modal')) closeOverlay('micmode-modal'); };
  $('micmode-close').onclick = () => closeOverlay('micmode-modal');
  $('micmode-confirm').onclick = () => {
    S.micMode = S.selectedMicMode;
    $('sr-micmode-val').textContent = micModeLabel(S.micMode);
    if(S.room) S.room.micMode = S.micMode;
    closeOverlay('micmode-modal');
    openOverlay('settings-panel');
    renderMicSeats();
    toast(`✅ تم ضبط الميك: ${micModeLabel(S.micMode)}`);
  };

  const grid = $('micmode-grid');
  grid.innerHTML='';
  S.selectedMicMode = S.micMode;

  MIC_MODES.forEach(m => {
    const el = document.createElement('div');
    el.className = `mm-option ${m.key===S.selectedMicMode?'selected':''}`;
    el.dataset.key = m.key;

    const dotCount = Math.min(m.dots,5);
    const dotsHtml = Array.from({length:dotCount}).map((_,i)=>
      `<div class="mm-dot ${m.key==='broadcast5'&&i>0?'mm-locked':''}">🎤</div>`
    ).join('');

    el.innerHTML = `
      <div class="mm-title">${m.label} ${m.premium?'🔒':''}</div>
      <div class="mm-dots">${dotsHtml}</div>`;

    el.onclick = () => {
      if(m.premium){ toast('🔒 هذا الوضع للمستخدمين المميزين فقط'); return; }
      $$('.mm-option').forEach(o=>o.classList.remove('selected'));
      el.classList.add('selected');
      S.selectedMicMode = m.key;
    };
    grid.appendChild(el);
  });
}

/* ============================================================
   ADMIN PERMISSION
   ============================================================ */
function initAdminModal() {
  $('admin-modal').onclick = e => { if(e.target===$('admin-modal')) closeOverlay('admin-modal'); };
  $('admin-close').onclick = () => { closeOverlay('admin-modal'); openOverlay('settings-panel'); };

  $$('.toggle').forEach(tog => {
    tog.onclick = () => {
      const key = tog.dataset.key;
      S.adminPerms[key] = !S.adminPerms[key];
      tog.classList.toggle('on', S.adminPerms[key]);
      toast(`${S.adminPerms[key]?'✅ تفعيل':'❌ تعطيل'}: ${key}`);
    };
  });
}

/* ============================================================
   VOTE MODAL (init already done above)
   ============================================================ */

/* ============================================================
   CREATE ROOM
   ============================================================ */
function initCreateRoom() {
  $('create-room-modal').onclick = e => { if(e.target===$('create-room-modal')) closeOverlay('create-room-modal'); };
  $('cr-close').onclick   = () => closeOverlay('create-room-modal');
  $('cr-cancel').onclick  = () => closeOverlay('create-room-modal');
  $('cr-confirm').onclick = () => {
    const name    = $('cr-name').value.trim()  || 'غرفتي الجديدة';
    const cat     = $('cr-cat').value;
    const desc    = $('cr-desc').value.trim()  || 'غرفة مميزة';
    const emoji   = $('cr-emoji').value.trim() || '🌟';
    const micMode = $('cr-micmode').value;

    const newRoom = {
      id: Math.floor(9000+Math.random()*1000),
      name, emoji, cat, online:1,
      host: S.user?.name||'أنت',
      hostEmoji: S.user?.emoji||'😊',
      hostLv: S.user?.level||1,
      desc,
      seats: Array(micMode==='chat5'||micMode==='broadcast5'?5:10).fill(''),
      micMode,
      announcement: 'Add your room announcement here.',
    };

    VCRM_DATA.rooms.unshift(newRoom);
    closeOverlay('create-room-modal');

    // Switch to explore tab
    $$('.ttab').forEach(b=>b.classList.remove('active'));
    document.querySelector('[data-ttab="explore"]').classList.add('active');
    $$('.tab-page').forEach(p=>p.classList.remove('active'));
    $('tab-explore').classList.add('active');
    renderRoomsGrid('all');

    toast(`✅ تم إنشاء: ${name}`);
    setTimeout(() => openRoom(newRoom), 400);

    $('cr-name').value=$('cr-desc').value=$('cr-emoji').value='';
  };
}

/* ── Keyboard shortcuts ─────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key==='Escape') {
    ['gift-panel','game-panel','settings-panel','micmode-modal',
     'admin-modal','vote-modal','wheel-modal','create-room-modal'].forEach(closeOverlay);
    if(S.room) closeRoom();
  }
});
