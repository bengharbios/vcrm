// ============================================================
//  VCRM — data.js  ·  Static seed data & helpers
// ============================================================

const VCRM_DATA = {

  /* ── Gifts catalogue ─────────────────────────────────── */
  gifts: [
    // Popular
    { id:1,  emoji:'🌹', name:'وردة',        price:10,   cat:'popular' },
    { id:2,  emoji:'🍬', name:'حلوى',        price:15,   cat:'popular' },
    { id:3,  emoji:'🎈', name:'بالون',       price:20,   cat:'popular' },
    { id:4,  emoji:'🍕', name:'بيتزا',       price:30,   cat:'popular' },
    { id:5,  emoji:'☕', name:'قهوة',        price:50,   cat:'popular' },
    { id:6,  emoji:'🎂', name:'كعكة',        price:88,   cat:'popular' },
    { id:7,  emoji:'🧁', name:'كب كيك',      price:60,   cat:'popular' },
    { id:8,  emoji:'🦋', name:'فراشة',       price:99,   cat:'popular' },
    // Luxury
    { id:9,  emoji:'💎', name:'ماسة',        price:500,  cat:'luxury'  },
    { id:10, emoji:'👑', name:'تاج ذهبي',   price:888,  cat:'luxury'  },
    { id:11, emoji:'🚀', name:'صاروخ',       price:1000, cat:'luxury'  },
    { id:12, emoji:'🏆', name:'كأس ذهبي',   price:1500, cat:'luxury'  },
    { id:13, emoji:'🛥️', name:'يخت',         price:2000, cat:'luxury'  },
    { id:14, emoji:'🏰', name:'قصر',         price:3000, cat:'luxury'  },
    { id:15, emoji:'🦁', name:'أسد',         price:3888, cat:'luxury'  },
    { id:16, emoji:'🌍', name:'الكرة الأرضية',price:5000,cat:'luxury'  },
    // Special
    { id:17, emoji:'🌈', name:'قوس قزح',    price:200,  cat:'special' },
    { id:18, emoji:'⭐', name:'نجمة ذهبية', price:150,  cat:'special' },
    { id:19, emoji:'🎆', name:'ألعاب نارية',price:300,  cat:'special' },
    { id:20, emoji:'🎯', name:'هدف',         price:250,  cat:'special' },
    { id:21, emoji:'🦄', name:'يونيكورن',   price:400,  cat:'special' },
    { id:22, emoji:'🌙', name:'قمر',         price:350,  cat:'special' },
    { id:23, emoji:'🔮', name:'كرة بلورية', price:280,  cat:'special' },
    { id:24, emoji:'🪄', name:'عصا سحرية',  price:320,  cat:'special' },
  ],

  /* ── Rooms seed data ─────────────────────────────────── */
  rooms: [
    { id:1001, name:'غرفة النجوم ⭐',     emoji:'⭐', cat:'hot',   online:312, host:'ملاك',   hostEmoji:'👸', hostLv:18, desc:'أجواء حماسية ومرح لا ينتهي!',       seats:['سارة','','أحمد','','','يوسف','',''] },
    { id:1002, name:'ليالي الموسيقى 🎵', emoji:'🎵', cat:'music', online:198, host:'طارق',   hostEmoji:'🎸', hostLv:12, desc:'موسيقى عربية وغربية على مدار الساعة', seats:['','ليلى','','رنا','','','حمد',''] },
    { id:1003, name:'أبطال PK ⚔️',        emoji:'⚔️', cat:'pk',   online:544, host:'فارس',   hostEmoji:'🦅', hostLv:22, desc:'منافسات حامية بين أقوى الغرف!',       seats:['بطل1','بطل2','بطل3','بطل4','','','',''] },
    { id:1004, name:'مغامرات 🎮',          emoji:'🎮', cat:'game', online:127, host:'زياد',   hostEmoji:'🎮', hostLv:9,  desc:'العاب ممتعة مع أصدقاء جدد',           seats:['','','لاعب1','','لاعب2','','',''] },
    { id:1005, name:'الديوانية 🌿',        emoji:'🌿', cat:'new',  online:89,  host:'صالح',   hostEmoji:'😊', hostLv:5,  desc:'غرفة هادئة للحديث والترفيه',          seats:['','','','','','','',''] },
    { id:1006, name:'قلوب الذهب 💛',       emoji:'💛', cat:'hot',  online:421, host:'نادية',  hostEmoji:'💃', hostLv:15, desc:'جو ودي وأناس رائعون',                  seats:['نادية2','','سلوى','','','خالد','',''] },
    { id:1007, name:'المعسكر 🏕️',          emoji:'🏕️', cat:'new',  online:63,  host:'سامي',   hostEmoji:'🏄', hostLv:7,  desc:'أحلى غرفة لمحبي الطبيعة',             seats:['','','','','','','',''] },
    { id:1008, name:'بنات الوردي 🌸',      emoji:'🌸', cat:'hot',  online:280, host:'هيا',    hostEmoji:'🌺', hostLv:14, desc:'مكان مميز ومليء بالأناقة',            seats:['لانا','','منى','','','','رنين',''] },
  ],

  /* ── Ranking data ────────────────────────────────────── */
  ranking: {
    richest: [
      { name:'الأمير 👑',       emoji:'😎', val:'4,800,000 🪙', sub:'VIP ماسي' },
      { name:'نجمة الذهب ⭐',   emoji:'💃', val:'3,200,000 🪙', sub:'VIP ذهبي' },
      { name:'فارس الليل 🌙',   emoji:'🦅', val:'2,100,000 🪙', sub:'VIP فضي' },
      { name:'ملكة القلوب ♥',  emoji:'👸', val:'1,800,000 🪙', sub:'عضو مميز' },
      { name:'الأسطورة 🔥',     emoji:'🎸', val:'1,500,000 🪙', sub:'عضو مميز' },
      { name:'سريع البرق ⚡',   emoji:'🏄', val:'1,200,000 🪙', sub:'عضو نشط'  },
      { name:'طائر الحرية 🕊',  emoji:'😊', val:'900,000 🪙',   sub:'عضو نشط'  },
      { name:'بطل الجدول 🏆',   emoji:'🎮', val:'750,000 🪙',   sub:'عضو عادي' },
    ],
    hosts: [
      { name:'نادية الساحرة',  emoji:'💃', val:'12,400 ساعة',  sub:'أفضل مضيفة' },
      { name:'ملاك السماء',    emoji:'👸', val:'10,800 ساعة',  sub:'مضيفة ذهبية' },
      { name:'طارق الموسيقي', emoji:'🎸', val:'8,600 ساعة',   sub:'مضيف مميز' },
      { name:'فارس الأبطال',  emoji:'🦅', val:'7,200 ساعة',   sub:'مضيف PK'     },
      { name:'هيا الأنيقة',   emoji:'🌺', val:'6,100 ساعة',   sub:'مضيفة وردة'  },
    ],
    rooms: [
      { name:'أبطال PK ⚔️',       emoji:'⚔️', val:'544 مستخدم',  sub:'الأكثر نشاطاً' },
      { name:'قلوب الذهب 💛',      emoji:'💛', val:'421 مستخدم',  sub:'الأكثر محبةً' },
      { name:'غرفة النجوم ⭐',     emoji:'⭐', val:'312 مستخدم',  sub:'الأكثر تفاعلاً' },
      { name:'بنات الوردي 🌸',     emoji:'🌸', val:'280 مستخدم',  sub:'الأكثر أناقةً' },
      { name:'ليالي الموسيقى 🎵', emoji:'🎵', val:'198 مستخدم',  sub:'الأفضل موسيقياً' },
    ]
  },

  /* ── Recharge packages ───────────────────────────────── */
  recharge: [
    { coins:100,    price:'$0.99',  bonus:null       },
    { coins:500,    price:'$4.99',  bonus:'+50 مجاناً'  },
    { coins:1000,   price:'$9.99',  bonus:'+120 مجاناً' },
    { coins:3000,   price:'$24.99', bonus:'+400 مجاناً' },
    { coins:6000,   price:'$49.99', bonus:'+1000 مجاناً'},
    { coins:15000,  price:'$99.99', bonus:'+3000 مجاناً'},
  ],

  /* ── Transactions seed ───────────────────────────────── */
  transactions: [
    { type:'شحن رصيد',     amount:'+1,000', sign:'plus',  date:'20 أبريل 2026' },
    { type:'هدية أُرسلت',  amount:'-500',   sign:'minus', date:'19 أبريل 2026' },
    { type:'هدية مُستلمة', amount:'+200',   sign:'plus',  date:'19 أبريل 2026' },
    { type:'شحن رصيد',     amount:'+3,000', sign:'plus',  date:'17 أبريل 2026' },
    { type:'هدية أُرسلت',  amount:'-888',   sign:'minus', date:'16 أبريل 2026' },
  ],

  /* ── Chat messages seed ──────────────────────────────── */
  chatMessages: [
    { user:'سارة',   emoji:'💃', text:'أهلاً وسهلاً بالجميع 🌹',          gift:false },
    { user:'أحمد',   emoji:'😎', text:'يهلا يهلا! الغرفة حلوة',            gift:false },
    { user:'ليلى',   emoji:'🌺', text:'🌹 أرسلت وردة للمضيف',             gift:true  },
    { user:'نظام',   emoji:'⭐', text:'ليلى أرسلت هدية 🌹 للمضيف!',      gift:true  },
    { user:'يوسف',   emoji:'🎸', text:'أحلى غرفة والله 🔥',               gift:false },
    { user:'رنا',    emoji:'🌙', text:'ودي أصعد على الميك',                gift:false },
    { user:'حمد',    emoji:'🏄', text:'ترحيب بالجميع من الكويت 🇰🇼',    gift:false },
  ],

  /* ── Emojis ──────────────────────────────────────────── */
  emojis: ['😀','😍','🥰','😎','🤩','😂','🥳','😇','🤗','😘',
           '❤️','💖','💛','💚','💜','🔥','⭐','🌹','🎉','👏',
           '🙌','✌️','👑','💎','🎵','🎶','🌙','☀️','🌈','🚀',
           '💪','🦋','🌺','🎁','🏆','⚽','🎮','🎯','🎪','✨'],
};
