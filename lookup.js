// Tap-a-word: finds a word in DICT (built by tools/build_dict.js) and explains its parts.
(function(){
const D = window.DICT;
const MARKS = /[ً-ْٰـ]/g;
const plain = w => w.replace(MARKS,'').replace(/[،.:!؟?؛«»"()]/g,'');
const loose = w => plain(w).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const clean = w => w.replace(/[،.:!؟?؛«»"()]/g,'');
const PRE = [ ['وَ','و','and'], ['فَ','ف','so / then'] ];
const PRE2 = [ ['بِ','ب','with / by / in'], ['لِ','ل','for / to'], ['كَ','ك','like'], ['سَ','س','will (future)'] ];
const SUF = [ ['ي','my'], ['نِي','me'], ['كَ','your'], ['كِ','your (f)'], ['هُ','his / it'], ['هِ','his / it'], ['هَا','her / it'], ['نَا','our / us'], ['هُمْ','their / them'], ['هِمْ','their / them'], ['كُمْ','your (plural)'] ];
const NUMSUF = [ ['ةٌ','feminine ending'], ['ونَ','plural (they / -s)'], ['ينَ','plural (-s)'], ['انِ','two (dual)'], ['يْنِ','two (dual)'], ['اتُ','plural (feminine)'], ['اتِ','plural (feminine)'] ];
const get = (map,k) => (map[k]||[]).map(i=>D.E[i]);
function lookup(raw){
  const w = clean(raw.trim()); if(!w) return null;
  // 1. exact
  let hit = get(D.V,w); if(hit.length) return {word:w, parts:[], entries:hit};
  hit = get(D.P,plain(w)); if(hit.length && plain(w).length>1) return {word:w, parts:[], entries:hit, loose:1};
  // 2. strip prefixes / suffixes and try again
  const tries=[];
  const bases=[plain(w)];
  if(/\u064Bا$|ا\u064B$/.test(w)) bases.push(plain(w).slice(0,-1));   // tanween fatha keeps an extra alif: جَمِيلًا
  for(const P of bases)
  for(const [pv,p1,m1] of [['','',''],...PRE]) for(const [pv2,p2,m2] of [['','',''],...PRE2]){
    let s = P; const parts=[];
    if(p1){ if(!s.startsWith(p1)) continue; s=s.slice(1); parts.push([pv,m1]); }
    if(p2){ if(!s.startsWith(p2)) continue; s=s.slice(1); parts.push([pv2+'ـ',m2]); }
    if(p2==='ل' && s.startsWith('ل') && !s.startsWith('لا')) s='ا'+s;      // لِلْبَيْتِ = لِـ + البَيْت
    for(const [sv,sm] of [['',''],...SUF,...NUMSUF]){
      let st=s; const ps=[...parts];
      const sp = plain(sv);
      if(sp){ if(!st.endsWith(sp) || st.length-sp.length<2) continue; st=st.slice(0,-sp.length); ps.push(['ـ'+sv,sm]); }
      const cands = [st];
      if(sp && st.endsWith('ت')) cands.push(st.slice(0,-1)+'ة');      // غُرْفَتِي = غُرْفَة + ي
      if(sp==='ات') cands.push(st+'ة');
      if(sp==='ة' && w.length<3) continue;                                // طَالِبَات = طَالِبَة + ات
      if(sp==='ون'||sp==='ين') cands.push(st.replace(/^ي(.*)$/,'ي$1'));
      for(const c of cands){
        for(const [map,key] of [[D.P,c],[D.L,loose(c)],[D.P,c.startsWith('ال')?c.slice(2):null],[D.P,c.startsWith('ال')?null:'ال'+c]]){
          if(!key) continue;
          const e = get(map,key);
          if(e.length && (ps.length || map!==D.P || key!==plain(w))) tries.push({word:w, parts:ps, entries:e, score:ps.length*2+(map===D.L?1:0)+(key!==c?1:0)});
        }
      }
    }
  }
  if(tries.length){ tries.sort((a,b)=>a.score-b.score); return tries[0]; }
  return {word:w, parts:[], entries:[]};
}
window.lookupWord = lookup;
window._plainAr = plain;
})();
