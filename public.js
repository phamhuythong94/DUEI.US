function money(n){
  const num = Number(n) || 0;
  return "$" + num.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
}

document.getElementById('registerBtn').href = REGISTER_URL;

/* ================= WINS FEED ================= */
let WINS = [];

function renderTicker(items){
  if(items.length === 0){
    document.getElementById('tickerTrack').innerHTML = "<span>No wins posted yet.</span>";
    return;
  }
  const top = [...items].sort((a,b)=> b.multiplier - a.multiplier).slice(0,8);
  const strip = top.map(w =>
    `<span><b>${escapeHtml(w.username)}</b> hit x${w.multiplier} on ${escapeHtml(w.game)} — ${money(w.payout)}</span>`
  ).join("");
  document.getElementById('tickerTrack').innerHTML = strip + strip;
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function ticketCard(w){
  const el = document.createElement('div');
  el.className = 'ticket';
  el.innerHTML = `
    <div class="perf-top"></div>
    <div class="ticket-body">
      <div class="stamp">Paid</div>
      <div class="ticket-head">
        <img class="avatar" src="${w.avatar_url || ''}" alt="" onerror="this.style.visibility='hidden'">
        <div class="who">
          <div class="uname">${escapeHtml(w.username)}</div>
          <div class="game">${escapeHtml(w.game)}</div>
        </div>
      </div>
      <div class="ticket-figures">
        <div class="row"><span class="label">Wager</span><span class="value">${money(w.wager)}</span></div>
        <div class="row"><span class="label">Multiplier</span><span class="mult">x${w.multiplier}</span></div>
      </div>
      <div class="payout">
        <span class="label">Payout</span>
        <span class="amount">${money(w.payout)}</span>
      </div>
      <div class="barcode"></div>
    </div>
    <div class="perf-bottom"></div>
  `;
  return el;
}

function renderGrid(sortMode){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  let items = [...WINS];

  if(sortMode === 'newest') items.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  else if(sortMode === 'biggest') items.sort((a,b)=> b.payout - a.payout);
  else if(sortMode === 'multiplier') items.sort((a,b)=> b.multiplier - a.multiplier);

  if(items.length === 0){
    grid.innerHTML = '<div class="empty">No wins posted yet. Check back soon.</div>';
    return;
  }
  items.forEach(w => grid.appendChild(ticketCard(w)));
}

document.querySelectorAll('.controls button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.controls button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.sort);
  });
});

async function loadWins(){
  const { data, error } = await db
    .from('wins')
    .select('*')
    .order('created_at', { ascending:false })
    .limit(60);
  if(error){ console.error(error); return; }
  WINS = data || [];
  renderTicker(WINS);
  renderGrid('newest');
}

/* ================= LEADERBOARD ================= */
let countdownTarget = null;

function medalPlace(place){
  if(place === 1) return '🥇 01';
  if(place === 2) return '🥈 02';
  if(place === 3) return '🥉 03';
  return String(place).padStart(2,'0');
}

async function loadLeaderboard(){
  const [{ data: entries, error: e1 }, { data: meta, error: e2 }] = await Promise.all([
    db.from('leaderboard_entries').select('*').order('place', { ascending:true }),
    db.from('leaderboard_meta').select('*').eq('id', 1).single()
  ]);

  if(e1) console.error(e1);
  if(e2) console.error(e2);

  if(meta){
    document.getElementById('prizePool').textContent = meta.prize_pool || '—';
    countdownTarget = meta.ends_at ? new Date(meta.ends_at) : null;
  }

  const body = document.getElementById('lbBody');
  body.innerHTML = '';
  if(!entries || entries.length === 0){
    body.innerHTML = '<tr><td colspan="4" class="empty">Leaderboard not posted yet.</td></tr>';
    return;
  }
  entries.forEach(row=>{
    const tr = document.createElement('tr');
    tr.className = row.place <= 3 ? `place-${row.place}` : '';
    tr.innerHTML = `
      <td class="place-cell">${medalPlace(row.place)}</td>
      <td>${escapeHtml(row.player)}</td>
      <td class="points-cell">${Number(row.points).toLocaleString('en-US')}</td>
      <td class="prize-cell">${row.prize ? escapeHtml(row.prize) : '—'}</td>
    `;
    body.appendChild(tr);
  });
}

function tickCountdown(){
  const els = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMins'),
    s: document.getElementById('cdSecs'),
  };
  if(!countdownTarget){
    els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '--';
    return;
  }
  const diff = countdownTarget - new Date();
  if(diff <= 0){
    els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '00';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  els.d.textContent = String(d).padStart(2,'0');
  els.h.textContent = String(h).padStart(2,'0');
  els.m.textContent = String(m).padStart(2,'0');
  els.s.textContent = String(s).padStart(2,'0');
}

setInterval(tickCountdown, 1000);

loadWins();
loadLeaderboard();
