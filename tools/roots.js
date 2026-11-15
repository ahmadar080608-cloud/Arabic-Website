// Works out the three-letter root of a fully vowelled Arabic word from its pattern.
// Used by build_dict.js; anything it gets wrong is fixed in ROOT_FIX (tools/root_fix.js).
const SUK='ْ', SHD='ّ', FAT='َ', DAM='ُ', KAS='ِ';
const TAN=/[ًٌٍ]/;
const HAMZA=/[أإآؤئء]/;
const PARTICLES=new Set(['في','على','إلى','من','عن','مع','ثم','لكن','لكن','لا','لم','لن','هل','يا','و','ف','ب','ل','إن','أن','إنما','ما','هذا','هذه','ذلك','تلك','هو','هي','أنا','أنت','نحن','هم','الذي','التي','كل','بعض','غير','قد','حتى','أو','أم','بل','إذا','كيف','متى','أين','لماذا','ماذا','من','كم','أي','هناك','هنا','جدا','فقط','أيضا','ليس','عند','قبل','بعد','بين','تحت','فوق','أمام','خلف','وراء','حول','مثل','نعم','كلا','هما','أنتما','أنتم','أنتن','هن','هاتان','هذان','هاتين','هذين','أنا','هؤلاء','أولئك','اللذان','اللتان']);
function units(w){ // [{l, v:'a'|'u'|'i'|'o'|'', sh:bool, tn:bool}]
  const u=[];
  for(const ch of w){
    if(ch===SHD){ if(u.length) u[u.length-1].sh=true; continue; }
    if(ch===FAT){ if(u.length) u[u.length-1].v='a'; continue; }
    if(ch===DAM){ if(u.length) u[u.length-1].v='u'; continue; }
    if(ch===KAS){ if(u.length) u[u.length-1].v='i'; continue; }
    if(ch===SUK){ if(u.length) u[u.length-1].v='o'; continue; }
    if(TAN.test(ch)){ if(u.length) u[u.length-1].tn=true; continue; }
    if(/[ٰـ'’]/.test(ch)) continue;
    if(/[ء-ي]/.test(ch)) u.push({l:ch,v:'',sh:false,tn:false});
  }
  return u;
}
const H = l => HAMZA.test(l) ? 'ء' : l;
function root(word, isVerb){
  let w = (word.replace(/[\[\]()،.؟!:'’]/g,' ').trim().split(/\s+/).find(t=>/[\u0621-\u064A]/.test(t))||'');
  const plain = w.replace(/[ً-ْٰـ]/g,'');
  if(PARTICLES.has(plain.replace(/^ال/,''))) return null;
  let u = units(w);
  if(u.length<2) return null;
  // the article
  if(u[0].l==='ا' && u[1] && u[1].l==='ل' && u.length>3){ u=u.slice(2); if(u[0].sh) u[0]={...u[0],sh:false}; }
  else if(u[0].l==='ل' && u[1] && u[1].l==='ل' && u[1].v==='' && u.length>3){ u=u.slice(1); }
  // a doubled letter counts as two
  u = u.flatMap(x=>x.sh?[{l:x.l,v:'o',sh:false,tn:false},{...x,sh:false,dbl:true}]:[x]);
  // endings
  const last = () => u[u.length-1];
  if(u.length>3 && last().l==='ت' && ['u','a','i'].includes(last().v) && u[u.length-2].v==='o') u.pop();           // past -tu / -ta / -ti
  if(u.length>4 && last().l==='ا' && u[u.length-2].l==='ن' && u[u.length-3].v==='o') u.splice(-2);               // past -nā
  if(last().l==='ا' && u.length>3 && u[u.length-2].tn){ u.pop(); }                    // tanween alif
  if(last().l==='ة'){ u.pop(); }
  if(u.length>4 && last().l==='ت' && u[u.length-2].l==='ا'){ u.splice(-2); }          // ات
  if(u.length>4 && (last().l==='ن') && ['a','i'].includes(last().v) && !last().tn && ['و','ي','ا'].includes(u[u.length-2].l) && u[u.length-2].v!=='a'){ u.splice(-2); } // ون ين ان
  if(u.length>4 && last().l==='ء' && u[u.length-2].l==='ا' && u[u.length-3].v==='a'){ u.splice(-2); } // فَعْلَاء (colours: حَمْرَاء)
  if(u.length>3 && last().l==='ى' ){ /* keep: may be a root letter (weak) */ }
  // present-tense / participle / form prefixes
  const startsV = (i,l,v) => u[i] && u[i].l===l && (v===undefined || u[i].v===v);
  const notA = u[1] && u[1].l!=='ا';
  const verbPre = isVerb && notA && u.length>3 && ['ي','ت','ن','أ'].includes(u[0].l) && ['a','u'].includes(u[0].v);
  let pre='';
  if(startsV(0,'ا') && startsV(1,'س','o') && startsV(2,'ت')) u=u.slice(3);            // اسْتَفْعَلَ
  else if(['ي','ت','ن','أ','م'].includes(u[0].l) && startsV(1,'س','o') && startsV(2,'ت') && u.length>4) u=u.slice(3); // يَسْتَفْعِلُ / مُسْتَفْعِل
  else if(u[0].l==='ا' && u[1] && (u[1].v==='o' || u.length>3)){ u=u.slice(1); pre='w'; }   // hamzat al-wasl / أَفْعَلَ handled below
  else if(verbPre){ u=u.slice(1); pre='v'; }
  else if(u[0].l==='م' && notA && ['a','u','i'].includes(u[0].v) && u.length>3){ pre = u[0].v==='u'?'mu':'ma'; u=u.slice(1); }
  else if(u[0].l==='أ' && u[0].v==='a' && u[1] && u[1].v==='o' && u.length>=4){ u=u.slice(1); pre='a'; }                    // أَفْعَل (comparative, colours, form IV)
  else if(u[0].l==='إ' && u[0].v==='i' && u[1] && u[1].v==='o' && u.length>=5) u=u.slice(1);                    // إِفْعَال
  // form V/VI ت, form VII ن, form VIII infixed ت
  if(u.length>3 && u[0].l==='ت' && u[0].v==='a' && (u[1].v==='a' || u[2] && u[2].sh)) u=u.slice(1);
  if(u.length>3 && u[0].l==='ت' && u[0].v==='a' && u[1] && u[2] && u[2].l==='ا') u=u.slice(1);
  if(u.length>3 && u[0].l==='ت' && u[1] && u[1].l==='ت' && u[1].dbl) u=[{l:'و',v:'o'},...u.slice(2)];                        // اِتَّصَلَ (و ص ل)
  if(u.length>3 && ['w','v','mu'].includes(pre) && u[1].l==='ت' && u[0].v==='o' && u[1].v==='a') u=[u[0],...u.slice(2)];   // اِفْتَعَلَ
  if(u.length>3 && ['w','v','mu'].includes(pre) && u[0].l==='ز' && u[1].l==='د' && u[0].v==='o') u=[u[0],...u.slice(2)];    // اِزْدَحَمَ
  if(u.length>3 && u[0].l==='ن' && u[0].v==='o' && !(u[1] && u[1].l==='ت')) u=u.slice(1);                        // اِنْفَعَلَ
  if(u.length>=5 && u[0].l==='ت' && (u[0].v==='i'||u[0].v==='a') && u[1].v==='o' && u.slice(2).some(x=>x.l==='ي'||x.l==='ا')) u=u.slice(1);   // تَفْعِيل / تِفْعَال
  // long vowels belonging to the pattern
  let c=[];
  u.forEach((x,i)=>{
    const prev=u[i-1];
    const longA = x.l==='ا' && i>0;
    const longU = x.l==='و' && prev && prev.v==='u' && (x.v===''||x.v==='o');
    const longI = x.l==='ي' && prev && prev.v==='i' && (x.v===''||x.v==='o');
    if(longA || longU || longI){ c.push({l:x.l,weak:true}); return; }
    c.push({l:x.l,dbl:!!x.dbl});
  });
  // drop pattern vowels while we have more than three letters
  let cons=c.filter(x=>!x.weak);
  if(cons.length>=3){
    // fَعِيل / fُعُول / fَاعِل etc → consonants only; collapse doubled middle (فَعَّلَ)
    let r=cons.map(x=>x.l);
    if(r.length===4 && cons[2].dbl && r[1]===r[2]) r=[r[0],r[1],r[3]];
    if(r.length===4 && cons[1].dbl && r[0]===r[1]) r=[r[0],r[2],r[3]];
    if(r.length===4 && cons[3].dbl && r[2]===r[3] && pre) r=r.slice(0,3);
    if(r.length>3 && r[r.length-1]==='ي' && u[u.length-1].l==='ي' && u[u.length-2].v==='i') r=r.slice(0,-1);    // nisba ـِيّ
    if(r.length>3 && r[r.length-1]==='ي' && r[r.length-2]==='ي') r=r.slice(0,-2);
    if(r.length>3 && r[r.length-1]==='ن' && c[c.length-2] && c[c.length-2].weak && c[c.length-2].l==='ا') r=r.slice(0,-1); // فَعْلَان
    if(r.length===4 && r[1]===r[3]&&false) r=r.slice(0,3);
    r=r.map(l=>l==='ى'?'ي':l);
    if(r.length===3 && HAMZA.test(r[2]) && u[u.length-1] && HAMZA.test(u[u.length-1].l) && u[u.length-2] && u[u.length-2].l==='ا') r[2]='و';   // سَمَاء، شِتَاء
    return r.slice(0, r.length>4?4:r.length).map(H).join(' ');
  }
  // two consonants: hollow / defective / doubled
  if(cons.length===2){
    const ws=c.find(x=>x.weak);
    if(c.length && c[c.length-1].dbl) return [cons[0].l,cons[1].l,cons[1].l].map(H).join(' ');
    const lastWeak = c[c.length-1] && c[c.length-1].weak || ['ى','ي','و','ا'].includes(u[u.length-1].l);
    if(ws && c.indexOf(ws)===1) return [cons[0].l, ws.l==='ي'?'ي':'و', cons[1].l].map(H).join(' ');
    if(lastWeak) return [cons[0].l, cons[1].l, 'ي'].map(H).join(' ');
    return [cons[0].l, ws?(ws.l==='ي'?'ي':'و'):'و', cons[1].l].map(H).join(' ');
  }
  return null;
}
module.exports = { root };
if(require.main===module){ for(const w of process.argv.slice(2)) console.log(w, '→', root(w)); }
