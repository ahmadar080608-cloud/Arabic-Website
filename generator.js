// Sentence generator: builds new, sensible sentences from the curated word list in gen.js.
// makeSentence({d, len, ok(cardId)->bool, prefer:Set(cardId), avoid:Set(ar)}) -> {ar,en,w,d,len,gen:true} or null
(function(){
const G = window.GEN;
const rnd = a => a[Math.floor(Math.random()*a.length)];
const chance = p => Math.random() < p;
const has = (item, spec) => {           // "A B -C": any of A,B and none of C ("-C" alone = anything but C)
  const t = spec.split(/\s+/).filter(Boolean), pos = t.filter(x=>x[0]!=='-'), neg = t.filter(x=>x[0]==='-').map(x=>x.slice(1));
  return (!pos.length || pos.some(c=>item.cls.includes(c))) && !neg.some(c=>item.cls.includes(c));
};
const SUBJ = { he:0, she:1, i:2, we:3, they2m:4, they2f:5, theym:6, theyf:7, you_m:8, you_f:9, you2:10, youpm:11, youpf:12 };
// pronoun subjects (no noun): the verb ending carries the person, the English says which one
const PRON_EN = { i:'I', we:'We', they2m:'They both (m.)', they2f:'They both (f.)', theym:'They (m.)', theyf:'They (f.)',
                  you_m:'You (m.)', you_f:'You (f.)', you2:'You both', youpm:'You all (m.)', youpf:'You all (f.)' };
const KANA  = ['كَانَ','كَانَتْ','كُنْتُ','كُنَّا','كَانَا','كَانَتَا','كَانُوا','كُنَّ','كُنْتَ','كُنْتِ','كُنْتُمَا','كُنْتُمْ','كُنْتُنَّ'];
const YURID = ['يُرِيدُ','تُرِيدُ','أُرِيدُ','نُرِيدُ','يُرِيدَانِ','تُرِيدَانِ','يُرِيدُونَ','يُرِدْنَ','تُرِيدُ','تُرِيدِينَ','تُرِيدَانِ','تُرِيدُونَ','تُرِدْنَ'];
const ALAY  = ['عَلَيْهِ','عَلَيْهَا','عَلَيَّ','عَلَيْنَا','عَلَيْهِمَا','عَلَيْهِمَا','عَلَيْهِمْ','عَلَيْهِنَّ','عَلَيْكَ','عَلَيْكِ','عَلَيْكُمَا','عَلَيْكُمْ','عَلَيْكُنَّ'];
const DUALS = ['they2m','they2f','you2'];
const PLAIN = ['i','we','theym','theyf','you_m','you_f','youpm','youpf'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const an = w => /^[aeiou]/i.test(w) ? 'an' : 'a';

// join Arabic tokens: helping vowel before ال, مِنَ / عَنِ before ال, attached prefixes بِـ and وَ
function joinAr(tokens){
  const out=[];
  for(let i=0;i<tokens.length;i++){
    let t=tokens[i]; if(!t) continue;
    if(t==='بِـ'||t==='وَ'){ tokens[i+1]=(t==='بِـ'?'بِ':'وَ')+tokens[i+1]; continue; }
    out.push(t);
  }
  for(let i=0;i<out.length-1;i++){
    const next=out[i+1];
    const nextAl = /^(ال|وَال|بِال)/.test(next) && next.startsWith('ال');
    if(!nextAl) continue;
    if(out[i]==='مِنْ') out[i]='مِنَ';
    else if(out[i]==='عَنْ') out[i]='عَنِ';
    else if(out[i].endsWith('ُمْ')) out[i]=out[i].slice(0,-1)+'ُ';  // رَكِبْتُمْ الـ -> رَكِبْتُمُ الـ
    else if(out[i].endsWith('وْا')) out[i]=out[i].slice(0,-2)+'ُا'; // اِشْتَرَوْا الـ -> اِشْتَرَوُا الـ
    else if(out[i].endsWith('ْ')) out[i]=out[i].slice(0,-1)+'ِ';   // يَأْكُلْ الـ -> يَأْكُلِ الـ
  }
  if(out[0] && out[0].startsWith('ابْ')) out[0]='اِ'+out[0].slice(1);
  return out.join(' ');
}

function ctx(o){
  const ok = id => !o.ok || o.ok(id);
  const nouns = G.nouns.filter(n=>ok(n.id));
  const pick = (list) => {             // prefer chosen-topic words when there are any
    if(!list.length) return null;
    if(o.prefer && o.prefer.size){ const p=list.filter(x=>o.prefer.has(x.id)); if(p.length && chance(.75)) return rnd(p); }
    return rnd(list);
  };
  return {
    ok, pick,
    noun: spec => pick(nouns.filter(n=>has(n,spec))),
    nouns: spec => nouns.filter(n=>has(n,spec)),
    adjFor: n => { const l=G.adjs.filter(a=>a.cls.some(c=>n.cls.includes(c)) && ok(a[n.g].id)); return pick(l); },
    verbs: G.verbs.filter(v=>ok(v.id)),
    times: G.times.filter(t=>ok(t[2])),
  };
}

// English noun phrase
const enNP = (n, def=true, adj) => {
  const word = (adj?adj.en+' ':'') + n.en;
  if(n.poss) return word.replace(/^my /,'my ').replace(/^(\w+ )my /,'my $1');
  if(!def) return n.mass ? word : an(word)+' '+word;
  return 'the '+word;
};
const posEN = (n, adj) => ((n.cmp && n.mass) || n.cls.includes('MEAL')) ? (adj?adj.en+' ':'')+n.en : n.poss ? 'my '+(adj?adj.en+' ':'')+n.en.replace(/^my /,'') : enNP(n,true,adj);
const isAre = n => n.pl ? 'are' : 'is';

// ---------- EASY ----------
function easyAdj(c){                 // الشَّايُ حَارٌّ
  const n = c.noun('-PLACEONLY'); if(!n || n.cmp) return null;
  const a = c.adjFor(n); if(!a) return null;
  const f = a[n.g];
  return {t:[n.nom, f.ind], en:`${cap(posEN(n))} ${isAre(n)} ${a.en}`, w:[n.id,f.id]};
}
function easyThis(c){                // هَذِهِ سَيَّارَةٌ جَدِيدَةٌ
  const n = c.noun('-PERSON -WILD -MEAL'); if(!n || n.poss || n.mass || n.cmp || n.pl || !n.ind) return null;
  const a = c.adjFor(n); if(!a) return null;
  const f = a[n.g];
  if(!c.ok(n.g==='m'?G.ids.this_m:G.ids.this_f)) return null;
  return {t:[n.g==='m'?'هَذَا':'هَذِهِ', n.ind, f.ind], en:`This is ${an(a.en)} ${a.en} ${n.en}`, w:[n.g==='m'?G.ids.this_m:G.ids.this_f, n.id, f.id]};
}
function easyWhere(c){               // القِطَّةُ تَحْتَ السَّرِيرِ
  const opts = G.where.filter(w=>c.nouns(w[0]).length && c.nouns(w[3]).length);
  if(!opts.length) return null;
  const w = rnd(opts);
  const n = c.noun(w[0]), p = c.noun(w[3]);
  if(!n || !p || n.k===p.k) return null;
  return {t:[n.nom, w[1], p.gen], en:`${cap(posEN(n))} ${isAre(n)} ${w[2]} ${posEN(p)}`, w:[n.id, G.prep[w[1]], p.id]};
}
function easyLong(c){                // two easy clauses joined with وَ
  const a = chance(.5)?easyAdj(c):easyWhere(c), b = chance(.5)?easyAdj(c):easyWhere(c);
  if(!a || !b || a.t[0]===b.t[0]) return null;
  return {t:[...a.t.slice(0,-1), a.t[a.t.length-1]+'،', 'وَ', ...b.t], en:`${a.en}, and ${b.en.charAt(0).toLowerCase()+b.en.slice(1)}`, w:[...a.w,...b.w]};
}

// ---------- VERB SENTENCES ----------
// mode: past | pres | negpast | neg | fut | was | want | must      person: he/she (from a noun subject) or any key of PRON_EN
function verbClause(c, v, mode, person){
  let subj=null;
  if(person==='he' || person==='she'){
    subj = c.noun(v.subjc); if(!subj) return null;
    person = subj.g==='f'?'she':'he';
  } else if(v.subjc.split(' ').every(x=>['CHILD','ANIMAL','SMALLANIMAL','BIGANIMAL','TEACHER'].includes(x))) return null;
  if(v.nopast && (mode==='past'||mode==='negpast'||mode==='was')) return null;
  if(v.nowas && mode==='was') return null;
  const P = SUBJ[person];
  const w = [v.id];
  // object
  let objAr=[], objEn='';
  let objNoun=null;
  if(v.kind==='tr' || v.kind==='pp'){
    objNoun = c.noun(v.obj + (subj?'':' ')); if(!objNoun) return null;
    if(subj && (objNoun.k===subj.k || objNoun.en===subj.en)) return null;
    w.push(objNoun.id);
    let adj=null;
    if(['negpast','neg','fut','was','want','must'].includes(mode) && chance(.45) && !objNoun.poss && !objNoun.cmp){ adj=c.adjFor(objNoun); }
    if(v.kind==='tr'){
      objAr=[objNoun.acc]; if(adj){ objAr.push(adj[objNoun.g].acc); w.push(adj[objNoun.g].id); }
      objEn=(v.generic && objNoun.mass && !objNoun.poss) ? (adj?adj.en+' ':'')+objNoun.en : posEN(objNoun,adj);
    } else {
      const [pa,pe]=v.prep; w.push(G.prep[pa]);
      if(v.indefobj){
        const a2 = adj || (chance(.6)?c.adjFor(objNoun):null);
        if(!objNoun.igen) return null;
        objAr=[pa, objNoun.igen]; let en=objNoun.en;
        if(a2 && a2[objNoun.g].igen){ objAr.push(a2[objNoun.g].igen); w.push(a2[objNoun.g].id); en=a2.en+' '+en; }
        objEn=(pe?pe+' ':'')+an(en)+' '+en;
      } else {
        objAr=[pa, objNoun.gen]; if(adj){ objAr.push(adj[objNoun.g].gen); w.push(adj[objNoun.g].id); }
        objEn=(pe && !v.en[0].endsWith(' '+pe)?pe+' ':'')+posEN(objNoun,adj);
      }
    }
  }
  // optional place / vehicle / instrument
  let plAr=[], plEn='';
  const places=v.places.filter(p=>c.nouns(p[2]).length);
  if(places.length && (v.needplace || chance(.55))){
    const [pa,pe,spec]=rnd(places);
    const pn=c.noun(spec);
    const vehicleIndoors = pa==='بِـ' && has(pn,'VEHICLE') && objNoun && has(objNoun,'INDOOR');
    const wrongStop = v.key==='board' && objNoun && ((has(objNoun,'TRAINBUS') && !has(pn,'STATIONONLY')) || (has(objNoun,'PLANEONLY') && !has(pn,'AIRPORTONLY')));
    if(wrongStop){}
    else
    if(pn && !vehicleIndoors && (!objNoun||pn.k!==objNoun.k) && (!subj||pn.k!==subj.k)){
      w.push(G.prep[pa]==null?undefined:G.prep[pa], pn.id);
      if(pa==='بِـ' && has(pn,'VEHICLE')){ plAr=['بِـ',pn.gen]; plEn='by '+pn.en; }
      else { plAr=[pa, pn.gen]; plEn=pe+' '+posEN(pn); }
    }
  }
  if(v.needplace && !plAr.length) return null;
  // optional time word
  let tAr=[], tEn='';
  const times=c.times.filter(t=>t[3].split(' ').includes(mode==='want'||mode==='must'?'fut':mode) && !(v.key==='wake' && t[0]==='مَسَاءً'));
  if(times.length && !v.notime && (v.needtime || chance(.4))){ const t=rnd(times); tAr=[t[0]]; tEn=t[1]; w.push(t[2]); }
  if(v.needtime && !tAr.length) return null;

  // verb + subject, by mode
  const [eb,ep,e3,eing]=v.en;
  const sEN = subj? cap(posEN(subj)) : PRON_EN[person];
  const third = !!subj;
  let head=[], enV='';
  switch(mode){
    case 'past':    head=[v.past[P]]; enV=ep; break;
    case 'pres':    head=[v.pres[P]]; enV=third?e3:eb; break;
    case 'negpast': head=['لَمْ', v.juss[P]]; enV="didn't "+eb; break;
    case 'neg':     head=['لَا', v.pres[P]]; enV=(third?"doesn't ":"don't ")+eb; break;
    case 'fut':     head=['سَ'+v.pres[P]]; enV='will '+eb; break;
    case 'was':     head=null; enV=(third||person==='i'?'was ':'were ')+eing; break;
    case 'want':    head=null; enV=(third?'wants to ':'want to ')+eb; break;
    case 'must':    head=null; enV='must '+eb; break;
  }
  let ar=[];
  if(mode==='was'){
    ar=[KANA[P], ...(subj?[subj.nom]:[]), v.pres[P]];
  } else if(mode==='want'){
    ar=[YURID[P], ...(subj?[subj.nom]:[]), 'أَنْ', v.subj[P]]; w.push(G.ids.want, G.ids.an);
  } else if(mode==='must'){
    ar = subj? ['يَجِبُ','عَلَى',subj.gen,'أَنْ',v.subj[P]] : ['يَجِبُ',ALAY[P],'أَنْ',v.subj[P]];
    w.push(G.ids.must, G.ids.an, person==='i'?G.ids.onme:G.prep['عَلَى']);
  } else {
    ar=[...head, ...(subj?[subj.nom]:[])];
  }
  if(subj) w.push(subj.id);
  ar=[...ar, ...objAr, ...plAr, ...tAr];
  let en = `${sEN} ${enV}${objEn?' '+objEn:''}${plEn?' '+plEn:''}${tEn?' '+tEn:''}`;
  return {t:ar, en, w:w.filter(Boolean)};
}

const MODES = {2:['past','pres'], 3:['negpast','neg','fut','past','pres'], 4:['was','want','must']};
function verbSentence(c, d){
  if(!c.verbs.length) return null;
  const v=rnd(c.verbs);
  const mode=rnd(MODES[d]);
  // Medium: every person except the duals; Hard / Extra hard: the duals too.  About a third get a noun subject (he/she).
  const pool = d===2 ? PLAIN : [...PLAIN, ...DUALS];
  const person = chance(.35) ? 'he' : rnd(pool);
  if(v.nowe && person!=='he' && person!=='i') return null;
  return verbClause(c, v, mode, person);
}

function build(o){
  const c=ctx(o);
  for(let tries=0; tries<300; tries++){
    let r=null;
    if(o.d===1) r = o.len==='l' ? easyLong(c) : rnd([easyAdj,easyThis,easyWhere,easyAdj])(c);
    else r = verbSentence(c, o.d);
    if(!r) continue;
    const ar = joinAr([...r.t]);
    const words = ar.split(' ').length;
    const len = words<=5 ? 's' : 'l';
    if(o.len && len!==o.len) continue;
    if(o.prefer && o.prefer.size && !r.w.some(id=>o.prefer.has(id))) continue;
    if(o.avoid && o.avoid.has(ar)) continue;
    return {ar: ar+'.', en: cap(r.en)+'.', w:[...new Set(r.w)], d:o.d, len, gen:true, id:'g:'+ar};
  }
  return null;
}
window.makeSentence = build;
window._genInternals = {joinAr};
})();
