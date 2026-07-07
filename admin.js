const loginView = document.getElementById('loginView');
const panelView = document.getElementById('panelView');
const logoutBtn = document.getElementById('logoutBtn');

function showMsg(el, text, ok){
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}

/* ================= AUTH ================= */
async function refreshAuthState(){
  const { data: { session } } = await db.auth.getSession();
  if(session){
    loginView.classList.add('hidden');
    panelView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loadWinsAdmin();
    loadLeaderboardAdmin();
  } else {
    loginView.classList.remove('hidden');
    panelView.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  }
}

document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg');
  const { error } = await db.auth.signInWithPassword({ email, password });
  if(error){ showMsg(msg, error.message, false); return; }
  showMsg(msg, 'Logged in.', true);
  refreshAuthState();
});

logoutBtn.addEventListener('click', async ()=>{
  await db.auth.signOut();
  refreshAuthState();
});

refreshAuthState();

/* ================= POST WIN ================= */
document.getElementById('postWinBtn').addEventListener('click', async ()=>{
  const msg = document.getElementById('winMsg');
  const payload = {
    username: document.getElementById('winUsername').value.trim(),
    game: document.getElementById('winGame').value.trim(),
    wager: parseFloat(document.getElementById('winWager').value) || 0,
    multiplier: parseFloat(document.getElementById('winMultiplier').value) || 0,
    payout: parseFloat(document.getElementById('winPayout').value) || 0,
    avatar_url: document.getElementById('winAvatar').value.trim() || null,
  };
  if(!payload.username || !payload.game){
    showMsg(msg, 'Username and game are required.', false);
    return;
  }
  const { error } = await db.from('wins').insert(payload);
  if(error){ showMsg(msg, error.message, false); return; }
  showMsg(msg, 'Win posted.', true);
  ['winUsername','winGame','winWager','winMultiplier','winPayout','winAvatar'].forEach(id=>{
    document.getElementById(id).value = '';
  });
  loadWinsAdmin();
});

async function loadWinsAdmin(){
  const list = document.getElementById('winsList');
  const { data, error } = await db.from('wins').select('*').order('created_at', { ascending:false }).limit(30);
  if(error){ list.innerHTML = `<div class="msg err">${error.message}</div>`; return; }
  if(!data || data.length === 0){ list.innerHTML = '<div class="msg">No wins yet.</div>'; return; }
  list.innerHTML = '';
  data.forEach(w=>{
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `
      <div>
        <div>${w.username} — ${w.game}</div>
        <div class="meta">x${w.multiplier} · $${Number(w.payout).toLocaleString('en-US')}</div>
      </div>
      <button class="btn danger" data-id="${w.id}">Delete</button>
    `;
    row.querySelector('button').addEventListener('click', async ()=>{
      await db.from('wins').delete().eq('id', w.id);
      loadWinsAdmin();
    });
    list.appendChild(row);
  });
}

/* ================= LEADERBOARD META ================= */
async function loadMeta(){
  const { data } = await db.from('leaderboard_meta').select('*').eq('id',1).single();
  if(data){
    document.getElementById('lbPool').value = data.prize_pool || '';
    if(data.ends_at){
      const local = new Date(data.ends_at);
      const iso = new Date(local.getTime() - local.getTimezoneOffset()*60000).toISOString().slice(0,16);
      document.getElementById('lbEndsAt').value = iso;
    }
  }
}

document.getElementById('saveMetaBtn').addEventListener('click', async ()=>{
  const msg = document.getElementById('metaMsg');
  const pool = document.getElementById('lbPool').value.trim();
  const endsAtLocal = document.getElementById('lbEndsAt').value;
  const endsAt = endsAtLocal ? new Date(endsAtLocal).toISOString() : null;
  const { error } = await db.from('leaderboard_meta').update({ prize_pool: pool, ends_at: endsAt }).eq('id',1);
  if(error){ showMsg(msg, error.message, false); return; }
  showMsg(msg, 'Saved.', true);
});

/* ================= LEADERBOARD ROWS ================= */
document.getElementById('saveRowBtn').addEventListener('click', async ()=>{
  const msg = document.getElementById('rowMsg');
  const payload = {
    place: parseInt(document.getElementById('lbPlace').value, 10),
    player: document.getElementById('lbPlayer').value.trim(),
    points: parseFloat(document.getElementById('lbPoints').value) || 0,
    prize: document.getElementById('lbPrize').value.trim() || null,
    updated_at: new Date().toISOString(),
  };
  if(!payload.place || !payload.player){
    showMsg(msg, 'Place and player are required.', false);
    return;
  }
  const { error } = await db.from('leaderboard_entries').upsert(payload, { onConflict: 'place' });
  if(error){ showMsg(msg, error.message, false); return; }
  showMsg(msg, `Row for place ${payload.place} saved.`, true);
  ['lbPlace','lbPlayer','lbPoints','lbPrize'].forEach(id=> document.getElementById(id).value = '');
  loadLeaderboardAdmin();
});

async function loadLeaderboardAdmin(){
  loadMeta();
  const list = document.getElementById('lbList');
  const { data, error } = await db.from('leaderboard_entries').select('*').order('place', { ascending:true });
  if(error){ list.innerHTML = `<div class="msg err">${error.message}</div>`; return; }
  if(!data || data.length === 0){ list.innerHTML = '<div class="msg">No rows yet.</div>'; return; }
  list.innerHTML = '';
  data.forEach(row=>{
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div>
        <div>#${row.place} — ${row.player}</div>
        <div class="meta">${Number(row.points).toLocaleString('en-US')} pts · ${row.prize || '—'}</div>
      </div>
      <button class="btn danger" data-id="${row.id}">Delete</button>
    `;
    item.querySelector('button').addEventListener('click', async ()=>{
      await db.from('leaderboard_entries').delete().eq('id', row.id);
      loadLeaderboardAdmin();
    });
    list.appendChild(item);
  });
}
