// Builds dict.js (tap-a-word dictionary) from cards.js, gen.js and tools/dict_extra.js
global.window={};
require('../cards.js'); require('../gen.js'); require('./dict_extra.js');
const fs=require('fs');
const {root:autoRoot}=require('./roots.js');
const {FIX,FIXV}=require('./root_fix.js');
const plainW=w=>((w.replace(/[\[\]()،.؟!:'’]/g,' ').trim().split(/\s+/).find(t=>/[\u0621-\u064A]/.test(t)))||'').replace(/[\u064B-\u0652\u0670\u0640]/g,'');
function rootOf(w,isVerb){ const v0=(w.trim().split(/\s+/)[0]||'').replace(/[،.؟!:]/g,''); if(v0 in FIXV) return FIXV[v0]; const p=plainW(w); if(p in FIX) return FIX[p]; const q=p.replace(/^ال/,''); if(q in FIX) return FIX[q]; return autoRoot(w,isVerb)||''; }
const CARD_ROOT={};
const C=window.CARDS, G=window.GEN, X=window.DICT_EXTRA;
const MARKS=/[ً-ْٰـ]/g;
const plain=w=>w.replace(MARKS,'').replace(/[،.:!؟?؛«»"()]/g,'');
const loose=w=>plain(w).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const E=[], V={}, P={}, L={};
const add=(map,k,i)=>{ if(!k) return; (map[k]=map[k]||[]); if(!map[k].includes(i)) map[k].push(i); };
const seen=new Map();
function put(a,e,n,c,prio){
  a=a.trim(); if(!a) return;
  const key=a+'|'+e+'|'+n; if(seen.has(key)) return seen.get(key);
  const r = c && CARD_ROOT[c]!==undefined ? CARD_ROOT[c] : rootOf(a, /tense|subjunctive|jussive|command|passive/.test(n||''));
  const o={a,e,n}; if(c) o.c=c; if(r) o.r=r;
  const i=E.length; E.push(o); seen.set(key,i);
  add(V,a.replace(/[،.:!؟?]/g,''),i); add(P,plain(a),i); add(L,loose(a),i);
  return i;
}
const TYPE={Verbs:'verb','Verbal Nouns (Maṣdar)':'verbal noun (maṣdar)','Ism Fāʿil (Doers)':'doer noun (ism fāʿil)',Adjectives:'adjective',Colours:'colour adjective','Pronouns & Pointing Words':'pronoun / pointing word','Question Words':'question word','Prepositions & Particles':'particle'};
// roots of deck words, from each card's first form
const RIDX={};
C.forEach(c=>{ if(c.cat==='Common Phrases') return; const f=c.ar.split(/\s*\/\s*/)[0]; const r=rootOf(f,c.cat==='Verbs'); CARD_ROOT[c.id]=r; if(r) (RIDX[r]=RIDX[r]||[]).push(c.id); });
// 1. hand-written extras first (best notes)
X.forEach(([a,e,n])=>put(a,e,n||''));
// 2. generator forms (exact case / tense)
const P4=['he','she','I','we'];
G.verbs.forEach(v=>{
  const [eb,ep,e3]=v.en;
  v.past.forEach((f,i)=>f&&put(f,`${P4[i]} ${ep}`,`past tense · “${P4[i]}” form`,v.id));
  v.pres.forEach((f,i)=>f&&put(f,`${P4[i]} ${i<2?e3:eb}`,`present tense · “${P4[i]}” form`+(i===1?' (also “you”)':''),v.id));
  v.juss.forEach((f,i)=>f&&put(f,`${P4[i]} … ${eb}`,`jussive (majzūm) · “${P4[i]}” form — used after لَمْ, so لَمْ + this = didn’t ${eb}`,v.id));
  v.subj.forEach((f,i)=>f&&put(f,`(that) ${P4[i]} ${eb}`,`subjunctive (manṣūb) · “${P4[i]}” form — used after أَنْ / لَنْ`,v.id));
});
const CASE={nom:'marfūʿ (nominative)',acc:'manṣūb (accusative)',gen:'majrūr (genitive)'};
G.nouns.forEach(n=>{
  const gnd=n.g==='f'?'feminine':'masculine';
  const same = n.nom===n.acc && n.acc===n.gen;
  ['nom','acc','gen'].forEach(k=>n[k]&&put(n[k],n.poss?n.en:`the ${n.en}`,`noun · ${gnd} · ${n.poss?'with “my”':'definite (with ال)'}${same?'':' · '+CASE[k]}`,n.id));
  if(n.poss) return;
  n.ind&&put(n.ind,`a ${n.en}`.replace(/^a ([aeiou])/i,'an $1'),`noun · ${gnd} · indefinite · ${CASE.nom}`,n.id);
  n.igen&&put(n.igen,`a ${n.en}`.replace(/^a ([aeiou])/i,'an $1'),`noun · ${gnd} · indefinite · ${CASE.gen}`,n.id);
});
G.adjs.forEach(a=>['m','f'].forEach(g=>{const f=a[g]; if(!f) return;
  ['nom','acc','gen'].forEach(k=>f[k]&&put(f[k],`the ${a.en} (one)`,`adjective · ${g==='m'?'masculine':'feminine'} · definite · ${CASE[k]}`,f.id));
  f.ind&&put(f.ind,a.en,`adjective · ${g==='m'?'masculine':'feminine'} · indefinite · ${CASE.nom}`,f.id);
  f.igen&&put(f.igen,a.en,`adjective · ${g==='m'?'masculine':'feminine'} · indefinite · ${CASE.gen}`,f.id);
}));
// 3. the deck itself
C.forEach(c=>{
  if(c.cat==='Common Phrases') { if(!/\s/.test(c.ar.trim())) put(c.ar,c.en,'phrase',c.id); return; }
  const parts=c.ar.split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean);
  const t=TYPE[c.cat]||'noun';
  if(c.cat==='Verbs' && parts.length>=2){
    const base=c.en.replace(/^to /,'');
    parts.forEach(p=>{
      const q=plain(p).split(/\s+/)[0];
      let lab,en;
      if(/[\u064C\u064D\u064B]/.test(p)){ lab='verbal noun (maṣdar)'; en=`the act of: ${base}`; }
      else if(q.startsWith('ي')){ lab='present tense · “he” form'; en=`he ${base} (present)`; }
      else if(/^[اإأ]/.test(q) && /\u0652$/.test(p.split(/\s+/)[0]) || /^ا/.test(q)){ lab='command (amr)'; en=`${base}!`; }
      else { lab='past tense · “he” form'; en=`he ${base} (past)`; }
      put(p,en,lab,c.id);
    });
    return;
  }
  parts.forEach(p=>{ if(p.split(/\s+/).length>3) return;
    const gnd=c.g==='m'?' · masculine':c.g==='f'?' · feminine':c.g==='mf'?' · masculine or feminine':'';
    put(p,c.en,t+gnd,c.id);
  });
  if(c.pl) c.pl.split(/\s*[\/،,]\s*/).filter(Boolean).forEach(p=>put(p,c.en+' (plural)','plural'+(t==='noun'?'':' · '+t),c.id));
});
fs.writeFileSync(__dirname+'/../dict.js','window.DICT='+JSON.stringify({E,V,P,L,R:RIDX})+';\n');
console.log('entries',E.length);
