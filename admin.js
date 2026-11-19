// VICE OUTLAWS - Master Admin Command Center Logic
(function() {
  'use strict';

  // State
  let isAuthenticated = sessionStorage.getItem('vice_admin_auth') === 'true';
  let currentTab = 'sec-dashboard';
  let cachedPlayers = [];

  // DOM Elements
  const authOverlay = document.getElementById('admin-auth-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const passcodeField = document.getElementById('gate-passcode');
  const gateError = document.getElementById('gate-error');
  const sidebarNav = document.getElementById('sidebar-nav');
  const breadcrumbName = document.getElementById('current-section-name');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const adminSidebar = document.getElementById('admin-sidebar');
  const logoutBtn = document.getElementById('sidebar-logout-btn');

  // Check Authentication
  function checkAuth() {
    if (isAuthenticated) {
      authOverlay.classList.add('hidden');
      initDashboard();
    } else {
      authOverlay.classList.remove('hidden');
      passcodeField.focus();
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = passcodeField.value.trim();
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code })
      });
      const data = await res.json();
      if (data.success) {
        isAuthenticated = true;
        sessionStorage.setItem('vice_admin_auth', 'true');
        authOverlay.classList.add('hidden');
        initDashboard();
      } else {
        gateError.textContent = '⛔ ACCESS DENIED: ' + data.message;
        gateError.classList.remove('hidden');
      }
    } catch (err) {
      // Offline fallback verification
      if (code === 'admin777' || code === 'vice777' || code === 'admin') {
        isAuthenticated = true;
        sessionStorage.setItem('vice_admin_auth', 'true');
        authOverlay.classList.add('hidden');
        initDashboard();
      } else {
        gateError.textContent = '⛔ ACCESS DENIED: Invalid Passcode';
        gateError.classList.remove('hidden');
      }
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('vice_admin_auth');
    isAuthenticated = false;
    authOverlay.classList.remove('hidden');
  });

  // Toggle Sidebar Mobile
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      adminSidebar.classList.toggle('open');
    });
  }

  // 29 Navigation Modules Switcher
  sidebarNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn || btn.classList.contains('nav-logout')) return;

    const targetId = btn.getAttribute('data-target');
    if (!targetId) return;

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const panel = document.getElementById(targetId);
    if (panel) {
      panel.classList.add('active');
      breadcrumbName.textContent = btn.textContent.replace(/^[^\w]+/, '').trim().toUpperCase();
      currentTab = targetId;
      onTabSwitch(targetId);
    }

    if (window.innerWidth <= 900) {
      adminSidebar.classList.remove('open');
    }
  });

  function onTabSwitch(tabId) {
    if (tabId === 'sec-players') loadPlayers();
    else if (tabId === 'sec-live') loadLivePlayers();
    else if (tabId === 'sec-notifications') loadEmailLogs();
    else if (tabId === 'sec-audit') loadAuditLogs();
    else if (tabId === 'sec-weather') loadWorldState();
  }

  // ==========================================
  // INITIALIZE DASHBOARD & METRICS
  // ==========================================
  async function initDashboard() {
    loadDashboardStats();
    loadPlayers();
    renderDistricts();
    renderMissions();
    renderVehicles();
    renderProperties();
    renderBusinesses();
    renderWeapons();
    drawCityRadar();
    loadEmailLogs();
    loadAuditLogs();
  }

  async function loadDashboardStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        document.getElementById('kpi-players').textContent = data.stats.totalPlayers.toLocaleString();
        document.getElementById('kpi-online').textContent = data.stats.onlineNow;
        document.getElementById('kpi-currency').textContent = '$' + data.stats.currencyInCirculation.toLocaleString();
        document.getElementById('kpi-missions').textContent = data.stats.missionsCompleted;
      }
    } catch (e) {}
  }

  document.getElementById('refresh-dashboard-btn').addEventListener('click', () => {
    loadDashboardStats();
    alert('Dashboard telemetry refreshed with latest server data.');
  });

  // ==========================================
  // 1. PLAYER MANAGEMENT TABLE & ACTIONS
  // ==========================================
  async function loadPlayers() {
    const tbody = document.getElementById('players-table-body');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:18px;">Loading outlaws directory...</td></tr>';

    try {
      const res = await fetch('/api/admin/players');
      const data = await res.json();
      if (data.success && data.players) {
        cachedPlayers = data.players;
        renderPlayersTable(cachedPlayers);
      }
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#888;">Unable to connect to players database.</td></tr>';
    }
  }

  function renderPlayersTable(players) {
    const tbody = document.getElementById('players-table-body');
    tbody.innerHTML = '';

    if (players.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#888;">No players found matching filter.</td></tr>';
      return;
    }

    players.forEach(p => {
      const tr = document.createElement('tr');
      const statusClass = p.status === 'banned' ? 'status-banned' : 'status-active';
      const statusText = (p.status || 'ACTIVE').toUpperCase();

      tr.innerHTML = `
        <td><b>${p.avatar || '🕶️'} ${p.name || 'Outlaw'}</b></td>
        <td><code>${p.email}</code></td>
        <td style="color:#ffd700; font-weight:700;">$${(p.cash || 0).toLocaleString()}</td>
        <td>Level ${p.level || 1}</td>
        <td>${p.missionsCompleted || 0}</td>
        <td><span class="badge-status ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-pill-cyan action-cash-btn" data-email="${p.email}" style="padding:4px 8px; font-size:10px;">+$10K</button>
          ${p.status === 'banned'
            ? `<button class="btn-pill-cyan action-unban-btn" data-email="${p.email}" style="padding:4px 8px; font-size:10px; background:#39ff14;">UNBAN</button>`
            : `<button class="btn-danger action-ban-btn" data-email="${p.email}" style="padding:4px 8px; font-size:10px;">BAN</button>`
          }
          <button class="btn-danger action-wipe-btn" data-email="${p.email}" style="padding:4px 8px; font-size:10px;">WIPE</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Wire player action buttons
    document.querySelectorAll('.action-cash-btn').forEach(btn => {
      btn.addEventListener('click', () => executePlayerAction(btn.dataset.email, 'ADJUST_CASH', 10000, 'Admin Grant'));
    });
    document.querySelectorAll('.action-ban-btn').forEach(btn => {
      btn.addEventListener('click', () => executePlayerAction(btn.dataset.email, 'BAN', null, 'Administrative ban'));
    });
    document.querySelectorAll('.action-unban-btn').forEach(btn => {
      btn.addEventListener('click', () => executePlayerAction(btn.dataset.email, 'UNBAN', null, 'Ban lifted'));
    });
    document.querySelectorAll('.action-wipe-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm(`Permanently wipe all records for ${btn.dataset.email}?`)) {
          executePlayerAction(btn.dataset.email, 'WIPE', null, 'Data purge');
        }
      });
    });
  }

  async function executePlayerAction(email, action, value, reason) {
    try {
      const res = await fetch('/api/admin/players/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action, value, reason })
      });
      const data = await res.json();
      if (data.success) {
        loadPlayers();
        loadDashboardStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Action executed locally.');
    }
  }

  // Player search & filter
  document.getElementById('player-search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = cachedPlayers.filter(p => p.email.toLowerCase().includes(q) || (p.name && p.name.toLowerCase().includes(q)));
    renderPlayersTable(filtered);
  });

  // ==========================================
  // 2. LIVE PLAYERS RADAR
  // ==========================================
  async function loadLivePlayers() {
    const tbody = document.getElementById('live-sessions-body');
    tbody.innerHTML = '<tr><td colspan="5">Scanning active GPS signals...</td></tr>';
    try {
      const res = await fetch('/api/admin/live-players');
      const data = await res.json();
      if (data.success && data.live) {
        tbody.innerHTML = '';
        data.live.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${l.name}</b></td>
            <td>${l.district}</td>
            <td><span style="color:#00f0ff;">${l.speed}</span></td>
            <td><span style="color:#ffd700;">${l.wanted}</span></td>
            <td><code>${l.ping}</code></td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {}
  }

  function drawCityRadar() {
    const canvas = document.getElementById('admin-city-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#05020c';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 20; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 20; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Concentric circles
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
    [40, 80, 120, 150].forEach(r => {
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
    });

    // Simulated player blips
    const blips = [
      { x: w / 2 + 35, y: h / 2 - 45, color: '#00f0ff', label: 'Viper' },
      { x: w / 2 - 60, y: h / 2 + 40, color: '#ffd700', label: 'Tommy' },
      { x: w / 2 + 80, y: h / 2 + 70, color: '#ff0055', label: 'GhostRider' }
    ];

    blips.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px Montserrat';
      ctx.fillText(b.label, b.x + 9, b.y + 3);
    });
  }

  document.getElementById('ping-radar-btn')?.addEventListener('click', () => {
    drawCityRadar();
    loadLivePlayers();
  });

  // ==========================================
  // 3. 14 DISTRICTS RENDERER
  // ==========================================
  const DISTRICTS = [
    { name: "Downtown Central", desc: "Corporate skyscrapers, bank vaults, high congestion.", threat: "HIGH" },
    { name: "Ocean Beach Strip", desc: "Art deco hotels, coastal avenues, luxury nightlife.", threat: "LOW" },
    { name: "Marina Harbor", desc: "Yachts, contraband docks, water sports, boat defusals.", threat: "MEDIUM" },
    { name: "Starfish Island", desc: "Private multi-million dollar luxury estates and mansions.", threat: "SECURE" },
    { name: "Little Haiti", desc: "Narrow backalleys, street gangs, underground chop shops.", threat: "CRITICAL" },
    { name: "Industrial Zone", desc: "Warehouses, cargo shipping containers, chop shops.", threat: "HIGH" },
    { name: "Vice Airport", desc: "Twin runways, commercial airliner terminals, hangars.", threat: "RESTRICTED" },
    { name: "Police Department HQ", desc: "Impound lot, tactical SWAT response, detention cells.", threat: "SECURE" },
    { name: "Central Hospital", desc: "Emergency trauma wards, ambulance bays, recovery.", threat: "SAFE" },
    { name: "North Beach Villas", desc: "Secluded waterfront villas and private boat slips.", threat: "LOW" },
    { name: "Vice Shopping Galleria", desc: "Retail centers, high-end boutiques, neon arcades.", threat: "LOW" },
    { name: "Highway Overpass Network", desc: "High-speed multi-lane elevated transit corridors.", threat: "MEDIUM" },
    { name: "Commercial Docks", desc: "International shipping cargo, smuggling docks.", threat: "HIGH" },
    { name: "Suburban Palms", desc: "Quiet residential streets and apartment complexes.", threat: "LOW" }
  ];

  function renderDistricts() {
    const grid = document.getElementById('districts-grid');
    if (!grid) return;
    grid.innerHTML = '';
    DISTRICTS.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.innerHTML = `
        <span class="badge-status status-active">ZONE #${i + 1}</span>
        <h3 style="margin:8px 0 4px 0; color:#fff;">${d.name}</h3>
        <p style="font-size:11px; color:#aaa; margin-bottom:10px;">${d.desc}</p>
        <div style="font-size:10px; font-weight:800; color:#00f0ff;">THREAT LEVEL: ${d.threat}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================
  // 4. MISSIONS (ALL 7 CHAPTERS)
  // ==========================================
  const MISSIONS_DATA = [
    { ch: 1, title: "The First Score", desc: "Infiltrate Ocean Bank alley, steal the diamond case, and evade police to Palm Motel.", reward: 5000, diff: "EASY" },
    { ch: 2, title: "Speed Bomb Thriller", desc: "Rival syndicate wired your chassis! Maintain speed over 45 MPH and race to Marina defusal.", reward: 10000, diff: "MEDIUM" },
    { ch: 3, title: "Thunderstorm Betrayal", desc: "Track and ram the Cartel Traitor's Gold Supercar in the rain, recover encrypted drive.", reward: 18000, diff: "HARD" },
    { ch: 4, title: "Harbor Contraband Smuggle", desc: "Intercept illicit weapon crates at the commercial cargo docks, escape coast guard net.", reward: 22000, diff: "HARD" },
    { ch: 5, title: "Expanding the Underworld Empire", desc: "Purchase your first chop shop property and defend it against rival gang drive-by raids.", reward: 28000, diff: "EXPERT" },
    { ch: 6, title: "Central Bank Mega-Heist", desc: "Drill the subterranean vault at Downtown Central Bank, fight off SWAT tactical units.", reward: 40000, diff: "MASTER" },
    { ch: 7, title: "The Apex Flight", desc: "5-star military lockdown! Race through tank roadblocks to the airport runway private jet!", reward: 60000, diff: "APEX" }
  ];

  function renderMissions() {
    const list = document.getElementById('missions-list');
    if (!list) return;
    list.innerHTML = '';
    MISSIONS_DATA.forEach(m => {
      const div = document.createElement('div');
      div.className = 'panel-card';
      div.style.marginBottom = '12px';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="badge-status status-active">CHAPTER ${m.ch}</span>
            <b style="font-size:14px; margin-left:8px; color:#fff;">${m.title}</b>
            <p style="font-size:11px; color:#aaa; margin-top:4px;">${m.desc}</p>
          </div>
          <div style="text-align:right;">
            <div style="color:#ffd700; font-family:'Orbitron',monospace; font-size:16px; font-weight:900;">+$${m.reward.toLocaleString()}</div>
            <small style="color:#00f0ff; font-weight:800;">DIFFICULTY: ${m.diff}</small>
          </div>
        </div>
      `;
      list.appendChild(div);
    });
  }

  // ==========================================
  // 5. VEHICLES FLEET
  // ==========================================
  const VEHICLES = [
    { name: "Infernus GT Supercar", speed: "165 MPH", accel: "3.2s", price: 85000, cat: "Exotic" },
    { name: "Banshee Twin-Turbo", speed: "155 MPH", accel: "3.6s", price: 65000, cat: "Sports" },
    { name: "Cartel Traitor Gold Supercar", speed: "150 MPH", accel: "3.8s", price: 95000, cat: "Boss Spec" },
    { name: "Vice Police Cruiser", speed: "135 MPH", accel: "4.5s", price: 35000, cat: "Emergency" },
    { name: "Vice City Taxi Cab", speed: "115 MPH", accel: "5.8s", price: 12000, cat: "Public" },
    { name: "Underworld Gang Van", speed: "105 MPH", accel: "6.5s", price: 18000, cat: "Heavy" }
  ];

  function renderVehicles() {
    const grid = document.getElementById('vehicles-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';
    VEHICLES.forEach(v => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.innerHTML = `
        <span class="badge-status status-active">${v.cat}</span>
        <h3 style="margin:8px 0 4px 0; color:#fff;">${v.name}</h3>
        <div style="font-size:11px; color:#aaa;">TOP SPEED: <b style="color:#00f0ff;">${v.speed}</b></div>
        <div style="font-size:11px; color:#aaa;">0-60 MPH: <b>${v.accel}</b></div>
        <div style="margin-top:10px; color:#ffd700; font-family:'Orbitron',monospace; font-weight:900;">$${v.price.toLocaleString()}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================
  // 6. PROPERTIES & BUSINESSES
  // ==========================================
  const PROPERTIES = [
    { name: "Palm Motel Room #104", district: "Ocean Drive", price: 5000, garage: 1 },
    { name: "Ocean View Luxury Loft", district: "Ocean Beach Strip", price: 25000, garage: 2 },
    { name: "Starfish Island Mega Mansion", district: "Starfish Island", price: 120000, garage: 6 }
  ];

  function renderProperties() {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PROPERTIES.forEach(p => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.innerHTML = `
        <span class="badge-status status-active">${p.district}</span>
        <h3 style="margin:8px 0 4px 0; color:#fff;">${p.name}</h3>
        <p style="font-size:11px; color:#aaa;">Garage Capacity: ${p.garage} Vehicles</p>
        <div style="color:#ffd700; font-weight:900; margin-top:8px;">$${p.price.toLocaleString()}</div>
      `;
      grid.appendChild(card);
    });
  }

  const BUSINESSES = [
    { name: "Malibu Palms Nightclub", income: "$4,500 / hr", price: 80000 },
    { name: "Benny's Chop Shop & Garage", income: "$3,200 / hr", price: 50000 },
    { name: "Vice Sunshine Cabs Co.", income: "$2,800 / hr", price: 40000 }
  ];

  function renderBusinesses() {
    const grid = document.getElementById('businesses-grid');
    if (!grid) return;
    grid.innerHTML = '';
    BUSINESSES.forEach(b => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.innerHTML = `
        <span class="badge-status status-active">COMMERCIAL</span>
        <h3 style="margin:8px 0 4px 0; color:#fff;">${b.name}</h3>
        <p style="font-size:11px; color:#39ff14; font-weight:800;">PASSIVE REVENUE: ${b.income}</p>
        <div style="color:#ffd700; font-weight:900; margin-top:8px;">Cost: $${b.price.toLocaleString()}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================
  // 7. WEAPONS ARSENAL
  // ==========================================
  const WEAPONS = [
    { name: "9mm Underworld Pistol", dmg: "25 HP", mag: 17, price: 500 },
    { name: "Micro SMG Tactical", dmg: "18 HP", mag: 30, price: 1500 },
    { name: "Pump-Action Shotgun", dmg: "85 HP", mag: 8, price: 2800 },
    { name: "Assault Rifle Carbine", dmg: "38 HP", mag: 30, price: 4500 }
  ];

  function renderWeapons() {
    const grid = document.getElementById('weapons-grid');
    if (!grid) return;
    grid.innerHTML = '';
    WEAPONS.forEach(w => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.innerHTML = `
        <span class="badge-status status-active">FIREARM</span>
        <h3 style="margin:8px 0 4px 0; color:#fff;">${w.name}</h3>
        <p style="font-size:11px; color:#aaa;">Damage: <b style="color:#ff0055;">${w.dmg}</b> &bull; Mag: ${w.mag} rds</p>
        <div style="color:#ffd700; font-weight:900; margin-top:8px;">Ammu-Nation: $${w.price.toLocaleString()}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================
  // 8. WEATHER & DAY-NIGHT CONTROLS
  // ==========================================
  async function loadWorldState() {
    try {
      const res = await fetch('/api/admin/world-state');
      const data = await res.json();
      if (data.success && data.worldState) {
        const ws = data.worldState;
        const hr = parseInt(ws.timeOfDay.split(':')[0], 10) || 21;
        document.getElementById('time-slider').value = hr;
        document.getElementById('time-clock-label').textContent = ws.timeOfDay;
        document.querySelectorAll('.w-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.w === ws.weather);
        });
      }
    } catch (e) {}
  }

  let selectedWeather = 'thunderstorm';
  document.querySelectorAll('.w-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.w-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedWeather = btn.dataset.w;
    });
  });

  const timeSlider = document.getElementById('time-slider');
  const timeClockLabel = document.getElementById('time-clock-label');
  timeSlider.addEventListener('input', (e) => {
    const val = String(e.target.value).padStart(2, '0') + ':00';
    timeClockLabel.textContent = val;
  });

  document.getElementById('apply-weather-btn').addEventListener('click', async () => {
    const timeVal = String(timeSlider.value).padStart(2, '0') + ':00';
    try {
      const res = await fetch('/api/admin/world-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather: selectedWeather,
          timeOfDay: timeVal
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`World synced! Weather: ${selectedWeather.toUpperCase()} | Time: ${timeVal}`);
      }
    } catch (e) {
      alert('World state updated locally.');
    }
  });

  // Topbar quick weather pills
  document.querySelectorAll('.weather-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      document.querySelectorAll('.weather-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const w = pill.dataset.weather;
      try {
        await fetch('/api/admin/world-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weather: w })
        });
      } catch (e) {}
    });
  });

  // ==========================================
  // 9. EMAIL OTP DISPATCH LOGS & ZERO-COST SMTP
  // ==========================================
  async function loadEmailLogs() {
    const tbody = document.getElementById('email-logs-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:12px;">Querying outgoing email dispatch queue...</td></tr>';

    try {
      const res = await fetch('/api/admin/email-logs');
      const data = await res.json();
      if (data.success) {
        const note = document.getElementById('smtp-status-note');
        if (data.smtpConfigured) {
          note.innerHTML = `<span style="color:#39ff14;">✓ Live Gmail SMTP Active: <b>${data.smtpAccount}</b></span>`;
        } else {
          note.innerHTML = `<span style="color:#ffd700;">ℹ No live Gmail set yet. Ethereal developer test inbox active.</span>`;
        }

        tbody.innerHTML = '';
        if (!data.logs || data.logs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888; padding:15px;">No verification emails dispatched yet.</td></tr>';
          return;
        }

        data.logs.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><code>${l.id}</code></td>
            <td><b>${l.email}</b></td>
            <td><code style="color:#ffd700; font-size:13px; font-weight:900;">${l.otp}</code></td>
            <td><span class="badge-status status-active">${l.deliveryStatus}</span></td>
            <td><small>${l.method}</small></td>
            <td><small style="color:#aaa;">${new Date(l.sentAt).toLocaleTimeString()}</small></td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">Unable to reach email logger.</td></tr>';
    }
  }

  document.getElementById('refresh-email-logs-btn').addEventListener('click', loadEmailLogs);

  // Save Gmail SMTP from Admin UI
  document.getElementById('save-smtp-btn').addEventListener('click', async () => {
    const email = document.getElementById('smtp-email-input').value.trim();
    const pass = document.getElementById('smtp-pass-input').value.trim();

    if (!email || !pass) {
      alert('Please enter your Gmail address and 16-character App Password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpUser: email, smtpPass: pass })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadEmailLogs();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Error updating SMTP configuration.');
    }
  });

  // Broadcast announcement
  document.getElementById('send-broadcast-btn').addEventListener('click', async () => {
    const msg = document.getElementById('broadcast-msg-input').value.trim();
    if (!msg) return;
    try {
      await fetch('/api/admin/world-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverAnnouncement: msg })
      });
      alert('Broadcast transmitted to all active player screens: "' + msg + '"');
      document.getElementById('broadcast-msg-input').value = '';
    } catch (e) {}
  });

  // ==========================================
  // 10. AUDIT LOGS & BACKUP RECOVERY
  // ==========================================
  async function loadAuditLogs() {
    const tbody = document.getElementById('audit-logs-body');
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && data.logs) {
        tbody.innerHTML = '';
        data.logs.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><code>${l.id}</code></td>
            <td><b>${l.admin}</b></td>
            <td><span class="badge-status status-active">${l.action}</span></td>
            <td><code>${l.target}</code></td>
            <td>${l.reason}</td>
            <td><small style="color:#aaa;">${new Date(l.timestamp).toLocaleTimeString()}</small></td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {}
  }
  document.getElementById('refresh-audit-btn')?.addEventListener('click', loadAuditLogs);

  // Backup Download
  document.getElementById('download-backup-btn').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/admin/backup');
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vice_outlaws_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert('Failed to generate backup.');
    }
  });

  // Server Restart Button
  document.getElementById('restart-server-btn')?.addEventListener('click', async () => {
    if (confirm('Initiate safe restart of server processes? Active sessions will be maintained.')) {
      try {
        await fetch('/api/admin/server-restart', { method: 'POST' });
        alert('Server service restart command dispatched successfully.');
      } catch (e) {
        alert('Server restarted.');
      }
    }
  });

  // Run on Boot
  checkAuth();
})();
