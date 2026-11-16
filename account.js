// Accounts: sign in with Google or email, and keep progress in sync across devices (Firebase).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
         createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, limit }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyAWRQSmUsWkYkzkBElg5f3MJYMQuFyWOcs",
  authDomain: "arabic-website-2674b.firebaseapp.com",
  projectId: "arabic-website-2674b",
  storageBucket: "arabic-website-2674b.firebasestorage.app",
  messagingSenderId: "577783700891",
  appId: "1:577783700891:web:ddb10104c62e1781a5153e"
});
const auth = getAuth(app), db = getFirestore(app);

const ACC = window.ACC = { user:null, status:'out', last:0, err:'', box:null, mode:'in' };
const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const NICE = {
  'auth/invalid-credential':'Wrong email or password.', 'auth/wrong-password':'Wrong email or password.', 'auth/user-not-found':'No account with that email — create one below.',
  'auth/invalid-email':'That email address doesn’t look right.', 'auth/email-already-in-use':'There’s already an account with that email — sign in instead.',
  'auth/weak-password':'Use a password of at least 6 characters.', 'auth/missing-password':'Type your password.',
  'auth/popup-blocked':'The Google window was blocked. Allow pop-ups, or sign in with email.', 'auth/popup-closed-by-user':'The Google window was closed before signing in.',
  'auth/unauthorized-domain':'This website isn’t on Firebase’s “Authorized domains” list yet (Authentication → Settings).',
  'auth/operation-not-allowed':'This sign-in method isn’t switched on in Firebase yet (Authentication → Sign-in method).',
  'auth/network-request-failed':'No internet connection.', 'auth/too-many-requests':'Too many tries — wait a minute and try again.',
  'permission-denied':'The database rules aren’t set yet (Firestore → Rules).', 'unavailable':'Can’t reach the database — check your connection.',
};
const nice = e => NICE[e?.code] || (e?.code==='failed-precondition' ? 'The Firestore database hasn’t been created yet.' : (e?.message||'Something went wrong.').replace(/^Firebase: /,''));

// ---------- sync ----------
const ref = () => doc(db, 'users', ACC.user.uid);
let timer = null, pushing = false, again = false;
async function pull(){
  if(!ACC.user) return;
  ACC.status = 'syncing'; paint();
  try{
    const snap = await getDoc(ref());
    ACC.isNew = !snap.exists();
    if(snap.exists()){
      const d = snap.data();
      let cloud = {}; try{ cloud = JSON.parse(d.s||'{}'); }catch(e){}
      window.mergeIn(cloud, d.settings, d.t||0);
    }
    await push(true);
    checkAdmin();
  }catch(e){ ACC.status='error'; ACC.err=nice(e); paint(); }
}
// the database rules only let the owner list everyone, so a successful read means “this is the owner”
async function checkAdmin(){
  try{ await getDocs(query(collection(db,'users'), limit(2))); ACC.admin = true; }catch(e){ ACC.admin = false; }
  paint();
}
ACC.listUsers = async () => {
  const qs = await getDocs(collection(db,'users'));
  return qs.docs.map(d => { const x = d.data(); return { id:d.id, name:x.name, email:x.email, summary:x.summary||{},
    updated: x.updated?.toMillis ? x.updated.toMillis() : (x.t||0), created: x.created?.toMillis ? x.created.toMillis() : 0 }; });
};
async function push(force){
  if(!ACC.user) return;
  if(pushing){ again = true; return; }
  pushing = true; ACC.status = 'syncing'; paint();
  try{
    const S = window.getS();
    const data = { s: JSON.stringify(S), t: S._t||Date.now(), settings: window.getSettings(), summary: window.getSummary ? window.getSummary() : {},
      name: ACC.user.displayName||'', email: ACC.user.email||'', updated: serverTimestamp() };
    if(ACC.isNew){ data.created = serverTimestamp(); }
    await setDoc(ref(), data, { merge: true });
    ACC.isNew = false;
    ACC.status = 'synced'; ACC.last = Date.now(); ACC.err = '';
  }catch(e){ ACC.status = 'error'; ACC.err = nice(e); }
  pushing = false; paint();
  if(again){ again = false; push(); }
}
window.onSaved = () => { if(!ACC.user) return; clearTimeout(timer); timer = setTimeout(push, 2500); };
document.addEventListener('visibilitychange', () => {
  if(!ACC.user) return;
  if(document.visibilityState==='hidden'){ clearTimeout(timer); push(); }
  else if(Date.now()-ACC.last > 60e3) pull();          // coming back: pick up anything done on another device
});

onAuthStateChanged(auth, user => {
  ACC.user = user; ACC.status = user ? 'syncing' : 'out'; paint();
  if(user) pull();
});
getRedirectResult(auth).catch(e => { ACC.err = nice(e); paint(); });

// ---------- actions ----------
async function google(){
  ACC.err = ''; paint();
  const p = new GoogleAuthProvider();
  try{ await signInWithPopup(auth, p); }
  catch(e){
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/cancelled-popup-request'].includes(e.code)){
      try{ await signInWithRedirect(auth, p); return; }catch(e2){ e = e2; }
    }
    ACC.err = nice(e); paint();
  }
}
async function email(kind, f){
  ACC.err = ''; ACC.note = '';
  const em = f.em.value.trim(), pw = f.pw.value, nm = f.nm ? f.nm.value.trim() : '';
  try{
    if(kind==='up'){ const c = await createUserWithEmailAndPassword(auth, em, pw); if(nm) await updateProfile(c.user, {displayName:nm}); ACC.user = auth.currentUser; push(); }
    else await signInWithEmailAndPassword(auth, em, pw);
  }catch(e){ ACC.err = nice(e); paint(); }
}
async function reset(f){
  const em = f.em.value.trim(); if(!em){ ACC.err = 'Type your email first, then press “Forgot password?”.'; paint(); return; }
  try{ await sendPasswordResetEmail(auth, em); ACC.err=''; ACC.note = 'Password reset email sent — check your inbox (and spam).'; }
  catch(e){ ACC.err = nice(e); }
  paint();
}

// ---------- the Account box in Settings ----------
const G_ICON = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function ago(t){ const s = Math.round((Date.now()-t)/1000); return s<10?'just now':s<60?s+' seconds ago':s<3600?Math.round(s/60)+' min ago':'earlier today'; }
function paint(){
  if(window.setAccLabel) window.setAccLabel(ACC.user ? 'Account' : 'Log in');
  const b = ACC.box; if(!b || !b.isConnected) return;
  const u = ACC.user;
  if(u){
    const nm = u.displayName || u.email.split('@')[0];
    b.innerHTML = `<div class="acc-card"><div class="av">${u.photoURL?`<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">`:esc(nm[0].toUpperCase())}</div>
      <div class="who"><b>${esc(nm)}</b><span>${esc(u.email||'')}</span></div><button class="ghost" id="accOut">Sign out</button></div>
      ${ACC.admin?'<button class="cta" id="accAdm" style="margin-top:10px;width:100%">Open admin page — see all accounts</button>':''}
      <div class="sync">Your user ID: <code id="accUid">${esc(u.uid)}</code> <button class="link" id="accCp">copy</button></div>
      <div class="sync ${ACC.status==='error'?'err':''}">${ACC.status==='syncing'?'Syncing…':ACC.status==='error'?'⚠ '+esc(ACC.err):'✓ Progress saved to your account '+(ACC.last?ago(ACC.last):'')}</div>`;
    b.querySelector('#accOut').onclick = async () => { clearTimeout(timer); await push(); ACC.admin = false; await signOut(auth); };
    b.querySelector('#accCp').onclick = () => { navigator.clipboard?.writeText(u.uid).then(()=>{ b.querySelector('#accCp').textContent='copied ✓'; }, ()=>prompt('Copy your user ID:', u.uid)); };
    const ad = b.querySelector('#accAdm'); if(ad) ad.onclick = () => { document.querySelector('.modal-bg')?.remove(); window.go('admin'); };
    return;
  }
  const up = ACC.mode==='up';
  b.innerHTML = `<p class="muted small" style="margin:0 0 10px">Sign in to save your progress and use it on all your devices.</p>
    <button class="gbtn" id="accG">${G_ICON} Continue with Google</button>
    <div class="or">or with email</div>
    <form id="accF">${up?'<input name="nm" placeholder="Your name" autocomplete="name">':''}
      <input name="em" type="email" placeholder="Email" autocomplete="email" required>
      <input name="pw" type="password" placeholder="Password${up?' (6+ characters)':''}" autocomplete="${up?'new-password':'current-password'}" required>
      <div class="msg ${ACC.note?'ok':''}">${esc(ACC.err||ACC.note||'')}</div>
      <div class="row"><button class="cta" type="submit">${up?'Create account':'Sign in'}</button>
        ${up?'':'<button class="link" type="button" id="accR">Forgot password?</button>'}<span style="flex:1"></span>
        <button class="link" type="button" id="accM">${up?'I already have an account':'New here? Create an account'}</button></div></form>`;
  b.querySelector('#accG').onclick = google;
  const f = b.querySelector('#accF');
  f.onsubmit = e => { e.preventDefault(); email(up?'up':'in', f); };
  b.querySelector('#accM').onclick = () => { ACC.mode = up?'in':'up'; ACC.err=''; ACC.note=''; paint(); };
  const r = b.querySelector('#accR'); if(r) r.onclick = () => reset(f);
}
ACC.mount = el => { ACC.box = el; paint(); };
const open = document.querySelector('#accBox'); if(open) ACC.mount(open);
