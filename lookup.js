// Tap-a-word: finds a word in DICT (built by tools/build_dict.js) and explains its parts.
(function(){
const D = window.DICT;
const MARKS = /[ً-ْٰـ]/g;
const plain = w => w.replace(MARKS,'').replace(/[،.:!؟?؛«»"()]/g,'');
const loose = w => plain(w).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const clean = w => w.replace(/[،.:!؟?؛«»"()…—]/g,'');
const PRE = [ ['وَ','و','and'], ['فَ','ف','so / then'] ];
const PRE2 = [ ['بِ','ب','with / by / in'], ['لِ','ل','for / to'], ['كَ','ك','like'], ['سَ','س','will (future)'] ];
const SUF = [ ['ي','my'], ['نِي','me'], ['كَ','your'], ['كِ','your (f)'], ['هُ','his / it'], ['هِ','his / it'], ['هَا','her / it'], ['نَا','our / us'], ['هُمْ','their / them'], ['هِمْ','their / them'], ['كُمْ','your (plural)'] ];
const NUMSUF = [ ['ةٌ','feminine ending'], ['ونَ','plural (they / -s)'], ['ينَ','plural (-s)'], ['انِ','two (dual)'], ['يْنِ','two (dual)'], ['اتُ','plural (feminine)'], ['اتِ','plural (feminine)'] ];
// do the vowels of an entry fit the word as written? (ignores the case ending; unvowelled text always fits)
const core = w => clean(w).replace(/ة/g,'ت').replace(/^(ال|وَال|بِال)/,'').replace(/[\u064B-\u0652\u0670]*ا?$/,'').replace(/[\u064B\u064C\u064D]/g,'');
const fits = (e,w) => !/[\u064E\u064F\u0650\u0651\u0652]/.test(w) || core(e.a).replace(/\u0651/g,'')===core(w).replace(/\u0651/g,'') || core(e.a)===core(w);
const best = (list,w) => { const f=list.filter(e=>fits(e,w)); return f.length?f:list; };
const get = (map,k) => (map[k]||[]).map(i=>D.E[i]);
function lookup(raw){
  const w = clean(raw.trim()); if(!w) return null;
  if(/^[\d٠-٩٪%]+$/.test(w)){ const n=w.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)); return {word:w, parts:[], entries:[{a:w,e:n.replace('٪','%'),n:'number written in Arabic digits'}]}; }
  // 1. exact
  let hit = get(D.V,w); if(hit.length) return {word:w, parts:[], entries:hit};
  hit = get(D.P,plain(w));
  const vowelled = /[\u064E\u064F\u0650\u0652]/.test(w);
  if(hit.length && plain(w).length>1 && (!vowelled || hit.some(e=>fits(e,w)))) return {word:w, parts:[], entries:best(hit,w), loose:1};
  const fallback = hit.length && plain(w).length>1 ? {word:w, parts:[], entries:hit, loose:1} : null;
  const M='[\\u064B-\\u0652\\u0670]*';
  const cutEnd = (v,sp) => sp ? v.replace(new RegExp(sp.split('').join(M)+M+'$'),'') : v;
  // 2. strip prefixes / suffixes and try again
  const tries=[];
  const bases=[plain(w)];
  if(/\u064Bا$|ا\u064B$/.test(w)) bases.push(plain(w).slice(0,-1));   // tanween fatha keeps an extra alif: جَمِيلًا
  for(const P of bases)
  for(const [pv,p1,m1] of [['','',''],...PRE]) for(const [pv2,p2,m2] of [['','',''],...PRE2]){
    let s = P, vs = clean(w); const parts=[];
    if(p1){ if(!s.startsWith(p1)) continue; s=s.slice(1); vs=vs.replace(new RegExp('^'+p1+M),''); parts.push([pv,m1]); }
    if(p2){ if(!s.startsWith(p2)) continue; s=s.slice(1); vs=vs.replace(new RegExp('^'+p2+M),''); parts.push([pv2+'ـ',m2]); }
    if(p2==='ل' && s.startsWith('ل') && !s.startsWith('لا')){ s='ا'+s; vs='ا'+vs; }      // لِلْبَيْتِ = لِـ + البَيْت
    for(const [sv,sm] of [['',''],...SUF,...NUMSUF]){
      let st=s, vst=vs; const ps=[...parts];
      const sp = plain(sv);
      if(sp){ if(!st.endsWith(sp) || st.length-sp.length<2) continue; st=st.slice(0,-sp.length); vst=cutEnd(vst,sp); ps.push(['ـ'+sv,sm]); }
      const cands = [st];
      if(sp && st.endsWith('ت')) cands.push(st.slice(0,-1)+'ة');      // غُرْفَتِي = غُرْفَة + ي
      if(sp==='ات') cands.push(st+'ة');
      if(sp==='ة' && w.length<3) continue;                                // طَالِبَات = طَالِبَة + ات
      if(sp==='ون'||sp==='ين') cands.push(st.replace(/^ي(.*)$/,'ي$1'));
      for(const c of cands){
        for(const [map,key] of [[D.P,c],[D.L,loose(c)],[D.P,c.startsWith('ال')?c.slice(2):null],[D.P,c.startsWith('ال')?null:'ال'+c]]){
          if(!key) continue;
          const e = get(map,key);
          if(e.length && (ps.length || map!==D.P || key!==plain(w))){
            const good = vowelled ? e.filter(x=>fits(x,vst)) : e;
            tries.push({word:w, parts:ps, entries:good.length?good:e, score:ps.length*2+(map===D.L?1:0)+(key!==c?1:0)+(c.length<=2?3:0)+(vowelled&&!good.length?4:0)});
          }
        }
      }
    }
  }
  if(tries.length){ tries.sort((a,b)=>a.score-b.score); if(!(fallback && tries[0].score>=4)) return tries[0]; }
  if(fallback) return fallback;
  return {word:w, parts:[], entries:[]};
}
window.lookupWord = lookup;
window._plainAr = plain;
})();
