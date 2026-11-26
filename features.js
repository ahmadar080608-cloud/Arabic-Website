// Verb-pattern drill, the Arbaʿīn reader and read-aloud (loaded after the main script)

// ---------- read aloud (the device's own Arabic voice) ----------
const TTS = (()=>{
  const ok = 'speechSynthesis' in window;
  let voice = null;
  const pick = ()=>{ if(!ok) return; const v = speechSynthesis.getVoices(); voice = v.find(x=>/^ar[-_]SA/i.test(x.lang)) || v.find(x=>/^ar/i.test(x.lang)) || null; };
  if(ok){ pick(); speechSynthesis.onvoiceschanged = pick; }
  return {
    ok,
    say(text, rate){
      if(!ok){ toast('This browser can’t read Arabic aloud'); return; }
      pick();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/ﷺ/g,'صلى الله عليه وسلم').replace(/[«»﴿﴾]/g,''));
      u.lang = voice ? voice.lang : 'ar-SA'; if(voice) u.voice = voice;
      u.rate = rate || S.ttsRate || 0.85;
      if(!voice) toast('No Arabic voice found on this device — add one in your phone or computer’s language settings');
      speechSynthesis.speak(u);
    },
    stop(){ ok && speechSynthesis.cancel(); }
  };
})();
function say(t,e){ e&&e.stopPropagation(); TTS.say(t); }

// ---------- verb patterns (أَوْزَانُ الْأَفْعَالِ) ----------
// Form I is irregular so it is written out; forms II–X are built from sound roots.
const VF_I = [
 ['ك ت ب','كَتَبَ','يَكْتُبُ','كِتَابَةٌ','كَاتِبٌ','write'],['د ر س','دَرَسَ','يَدْرُسُ','دِرَاسَةٌ','دَارِسٌ','study'],['ف ت ح','فَتَحَ','يَفْتَحُ','فَتْحٌ','فَاتِحٌ','open'],
 ['ج ل س','جَلَسَ','يَجْلِسُ','جُلُوسٌ','جَالِسٌ','sit'],['ش ر ب','شَرِبَ','يَشْرَبُ','شُرْبٌ','شَارِبٌ','drink'],['خ ر ج','خَرَجَ','يَخْرُجُ','خُرُوجٌ','خَارِجٌ','go out'],
 ['ع ل م','عَلِمَ','يَعْلَمُ','عِلْمٌ','عَالِمٌ','know'],['ذ ه ب','ذَهَبَ','يَذْهَبُ','ذَهَابٌ','ذَاهِبٌ','go'],['ف ه م','فَهِمَ','يَفْهَمُ','فَهْمٌ','فَاهِمٌ','understand'],
 ['ص ب ر','صَبَرَ','يَصْبِرُ','صَبْرٌ','صَابِرٌ','be patient'],['ح ف ظ','حَفِظَ','يَحْفَظُ','حِفْظٌ','حَافِظٌ','memorise, guard'],['ع ب د','عَبَدَ','يَعْبُدُ','عِبَادَةٌ','عَابِدٌ','worship'],
];
const VF = {
 2:[['د ر س','teach'],['ع ل م','teach'],['ك س ر','smash'],['ق د م','present'],['ن ظ ف','clean'],['ذ ك ر','remind'],['ج ر ب','try, test'],['ف ك ر','think'],['ك ل م','speak to'],['ر ت ب','arrange'],['ح ر م','forbid'],['ب ش ر','give glad tidings']],
 3:[['س ف ر','travel'],['ش ه د','watch'],['ق ت ل','fight'],['س ع د','help'],['ح ف ظ','preserve'],['ش ر ك','take part'],['ك ت ب','write to'],['ج ل س','sit with'],['ع م ل','deal with'],['ن ق ش','discuss'],['ج ه د','strive'],['ح ر ب','wage war on']],
 4:[['ك ر م','honour'],['ر س ل','send'],['خ ر ج','take out'],['س ل م','become Muslim'],['د خ ل','bring in'],['ح س ن','do well'],['غ ل ق','close'],['ن ز ل','send down'],['ص ل ح','set right'],['ع ل ن','announce'],['ن ف ق','spend'],['ش ر ك','associate partners']],
 5:[['ع ل م','learn'],['ك ل م','speak'],['ق د م','advance'],['خ ر ج','graduate'],['ذ ك ر','remember'],['ح د ث','talk'],['ك ب ر','be arrogant'],['ف ر ق','scatter'],['ع ر ف','get to know'],['ج ن ب','avoid'],['ف ك ر','reflect'],['ص د ق','give charity']],
 6:[['ب د ل','exchange'],['ع م ل','deal with each other'],['ق ت ل','fight each other'],['س ب ق','race each other'],['ش ر ك','share'],['ف ه م','understand each other'],['ص ل ح','make peace'],['ك ت ب','write to each other'],['ح س د','envy each other'],['ب غ ض','hate each other'],['ب ر ك','be blessed'],['ع ر ف','get to know each other']],
 7:[['ك س ر','be broken'],['ق ط ع','be cut off'],['ف ت ح','be opened'],['ط ل ق','set off'],['ص ر ف','leave'],['ق ل ب','be overturned'],['س ح ب','withdraw'],['ه ز م','be defeated'],['غ ل ق','be closed'],['ف ج ر','burst'],['ك ش ف','be uncovered'],['ق س م','be divided']],
 8:[['ج م ع','gather'],['س م ع','listen'],['ع ر ف','confess'],['ن ظ ر','wait'],['ق ر ب','come near'],['ح ر م','respect'],['ش ر ك','participate'],['ن ق ل','move'],['ك ش ف','discover'],['ع م د','rely'],['ح ت ر','be careful'],['خ ت ر','choose']],
 10:[['خ د م','use'],['ق ب ل','welcome'],['غ ف ر','seek forgiveness'],['ع م ل','employ'],['خ ر ج','extract'],['س ل م','surrender'],['ح س ن','approve of'],['ع ل م','enquire'],['ر ج ع','get back'],['ن ك ر','disapprove'],['ح ض ر','call to mind'],['ع ج ل','hurry']],
};
VF[8] = VF[8].filter(r=>!['ح ت ر','خ ت ر'].includes(r[0])); // keep only roots without assimilation
const ROMAN = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',10:'X'};
const VPAT = {1:['فَعَلَ','(varies)','(varies)','فَاعِلٌ'],2:['فَعَّلَ','يُفَعِّلُ','تَفْعِيلٌ','مُفَعِّلٌ'],3:['فَاعَلَ','يُفَاعِلُ','مُفَاعَلَةٌ','مُفَاعِلٌ'],4:['أَفْعَلَ','يُفْعِلُ','إِفْعَالٌ','مُفْعِلٌ'],
  5:['تَفَعَّلَ','يَتَفَعَّلُ','تَفَعُّلٌ','مُتَفَعِّلٌ'],6:['تَفَاعَلَ','يَتَفَاعَلُ','تَفَاعُلٌ','مُتَفَاعِلٌ'],7:['انْفَعَلَ','يَنْفَعِلُ','انْفِعَالٌ','مُنْفَعِلٌ'],8:['افْتَعَلَ','يَفْتَعِلُ','افْتِعَالٌ','مُفْتَعِلٌ'],10:['اسْتَفْعَلَ','يَسْتَفْعِلُ','اسْتِفْعَالٌ','مُسْتَفْعِلٌ']};
const VMEAN = {1:'the basic meaning; its present-tense vowel and maṣdar have to be learned for each verb',2:'often doing something to someone / intensively (دَرَسَ study → دَرَّسَ teach)',3:'doing something with or to someone else (كَتَبَ → كَاتَبَ write to)',
  4:'often making something happen (خَرَجَ go out → أَخْرَجَ take out)',5:'often the reflexive of II (عَلَّمَ teach → تَعَلَّمَ learn)',6:'doing something with each other (تَقَاتَلَ fight each other)',
  7:'often passive or “get done” (كَسَرَ break → انْكَسَرَ get broken)',8:'often reflexive or doing for yourself (جَمَعَ → اجْتَمَعَ gather together)',10:'often seeking or asking for (غَفَرَ → اسْتَغْفَرَ seek forgiveness)'};
const VTYPE = [['past','Past (he did)'],['pres','Present (he does)'],['masdar','Maṣdar (the action)'],['fail','Ism fāʿil (the doer)']];
function vBuild(form, root){
  const [a,b,c] = root.split(' ');
  const T = {
    2:[`${a}َ${b}َّ${c}َ`,`يُ${a}َ${b}ِّ${c}ُ`,`تَ${a}ْ${b}ِي${c}ٌ`,`مُ${a}َ${b}ِّ${c}ٌ`],
    3:[`${a}َا${b}َ${c}َ`,`يُ${a}َا${b}ِ${c}ُ`,`مُ${a}َا${b}َ${c}َةٌ`,`مُ${a}َا${b}ِ${c}ٌ`],
    4:[`أَ${a}ْ${b}َ${c}َ`,`يُ${a}ْ${b}ِ${c}ُ`,`إِ${a}ْ${b}َا${c}ٌ`,`مُ${a}ْ${b}ِ${c}ٌ`],
    5:[`تَ${a}َ${b}َّ${c}َ`,`يَتَ${a}َ${b}َّ${c}ُ`,`تَ${a}َ${b}ُّ${c}ٌ`,`مُتَ${a}َ${b}ِّ${c}ٌ`],
    6:[`تَ${a}َا${b}َ${c}َ`,`يَتَ${a}َا${b}َ${c}ُ`,`تَ${a}َا${b}ُ${c}ٌ`,`مُتَ${a}َا${b}ِ${c}ٌ`],
    7:[`انْ${a}َ${b}َ${c}َ`,`يَنْ${a}َ${b}ِ${c}ُ`,`انْ${a}ِ${b}َا${c}ٌ`,`مُنْ${a}َ${b}ِ${c}ٌ`],
    8:[`ا${a}ْتَ${b}َ${c}َ`,`يَ${a}ْتَ${b}ِ${c}ُ`,`ا${a}ْتِ${b}َا${c}ٌ`,`مُ${a}ْتَ${b}ِ${c}ٌ`],
    10:[`اسْتَ${a}ْ${b}َ${c}َ`,`يَسْتَ${a}ْ${b}ِ${c}ُ`,`اسْتِ${a}ْ${b}َا${c}ٌ`,`مُسْتَ${a}ْ${b}ِ${c}ٌ`],
  }[form];
  return T;
}
function vEntry(form, i){
  if(form===1){ const r=VF_I[i]; return {form, root:r[0], w:[r[1],r[2],r[3],r[4]], en:r[5]}; }
  const r = VF[form][i]; return {form, root:r[0], w:vBuild(form, r[0]), en:r[1]};
}
function vAll(forms){ const out=[]; forms.forEach(f=>{ const n=f===1?VF_I.length:VF[f].length; for(let i=0;i<n;i++) out.push(vEntry(f,i)); }); return out; }
const VFORMS=[1,2,3,4,5,6,7,8,10];
S.vb = S.vb || {right:0,total:0};
let vd = {mode:S.vdMode||'form', forms:S.vdForms||VFORMS.slice(), q:null, pick:null, table:false};
const vSh = a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const vR = a=>a[Math.floor(Math.random()*a.length)];
function vNew(){
  const forms = vd.forms.length ? vd.forms : VFORMS;
  const e = vR(vAll(forms)), t = Math.floor(Math.random()*4);
  const mode = vd.mode==='mix' ? vR(['form','type','build']) : vd.mode;
  let q;
  if(mode==='form'){
    const others = vSh(VFORMS.filter(f=>f!==e.form)).slice(0,3);
    q = {mode, e, t, prompt:'Which form (wazn) is this word?', word:e.w[t], opts:vSh([e.form,...others]).map(f=>({k:String(f), label:`Form ${ROMAN[f]}`})), ans:String(e.form)};
  } else if(mode==='type'){
    q = {mode, e, t, prompt:'What kind of word is this?', word:e.w[t], opts:VTYPE.map(([k,l],i)=>({k:String(i), label:l})), ans:String(t)};
  } else {
    // build: root + form + type → choose the right word (distractors: same root, other forms, same type)
    const others = vSh(VFORMS.filter(f=>f!==e.form && f!==1)).slice(0,3).map(f=>vBuild(f,e.root)[t]);
    q = {mode, e, t, prompt:`Build the ${VTYPE[t][1].toLowerCase()} of root ${e.root.split(' ').join(' · ')} in Form ${ROMAN[e.form]}`, word:null, opts:vSh([e.w[t],...others]).map(w=>({k:w, label:w, ar:true})), ans:e.w[t]};
  }
  vd.q=q; vd.pick=null;
}
function renderVerbs(){
  if(!vd.q) vNew();
  const q=vd.q, e=q.e, done=vd.pick!==null, right=done&&vd.pick===q.ans;
  const fp=(f)=>`<button class="pill ${vd.forms.includes(f)?'on':''}" data-vf="${f}">${ROMAN[f]}</button>`;
  const mp=(m,l)=>`<button class="pill ${vd.mode===m?'on':''}" data-vm="${m}">${l}</button>`;
  const table=`<table class="vtab"><thead><tr><th>Form</th><th>Past</th><th>Present</th><th>Maṣdar</th><th>Doer</th><th>Usual meaning</th></tr></thead><tbody>${VFORMS.map(f=>`<tr><td><b>${ROMAN[f]}</b></td>${VPAT[f].map(w=>`<td class="ar">${w==='(varies)'?'<span class="muted small">varies</span>':`<button class="vsay" onclick="say('${w}')">${w}</button>`}</td>`).join('')}<td class="small muted">${esc(VMEAN[f])}</td></tr>`).join('')}</tbody></table>`;
  $('#app').innerHTML=`<div class="pagehead grain g3"><i class="bgl">صرف</i><span class="otag">Verb patterns</span><div class="ph-ar">أَوْزَانُ الْأَفْعَالِ</div><div class="ph-en">Forms I–X: past, present, maṣdar and doer</div></div>
  <section class="panel rc-set"><div class="optgrid">
    <div><label>Drill</label><div>${mp('form','Name the form')}${mp('type','Name the word type')}${mp('build','Build the word')}${mp('mix','Mixed')}</div></div>
    <div><label>Forms</label><div>${VFORMS.map(fp).join('')}</div></div>
  </div><p class="muted small" style="margin:12px 0 0">Score this session: <b>${S.vb.right}</b> / ${S.vb.total}. <button class="ghost" id="vtab" style="margin-left:8px">${vd.table?'Hide':'Show'} the pattern table</button></p>
  ${vd.table?table:''}</section>
  <section class="panel vq"><div class="vq-p">${esc(q.prompt)}</div>
    ${q.word?`<div class="vq-w ar">${tapAr(q.word)} <button class="vsay" onclick="say('${q.word}')" title="Listen">🔊</button></div>`:''}
    <div class="vq-o">${q.opts.map(o=>{const cls=done?(o.k===q.ans?'right':o.k===vd.pick?'wrong':''):''; return `<button class="rc-o ${o.ar?'ar':''} ${cls}" data-vk="${esc(o.k)}" ${done?'disabled':''}>${esc(o.label)}${o.sub?`<span class="ar vsub">${o.sub}</span>`:''}</button>`;}).join('')}</div>
    ${done?`<div class="vq-fb ${right?'ok':'no'}"><b>${right?'Correct!':'Not quite.'}</b> Root <span class="ar">${e.root.split(' ').join(' · ')}</span>, Form ${ROMAN[e.form]} (${esc(e.en)}):
      <div class="vq-row">${e.w.map((w,i)=>`<span class="wchip ${i===q.t?'on':''}"><span class="ar">${w}</span><em>${VTYPE[i][1].split(' (')[0]}</em></span>`).join('')}</div>
      <div class="muted small">Pattern: <span class="ar">${VPAT[e.form].filter(w=>w!=='(varies)').join(' – ')}</span> · ${esc(VMEAN[e.form])}</div></div>
      <div class="rpt-b"><span style="flex:1"></span><button class="cta" id="vnext">Next</button></div>`:''}
  </section>`;
  document.querySelectorAll('[data-vf]').forEach(b=>b.onclick=()=>{const f=+b.dataset.vf; vd.forms=vd.forms.includes(f)?vd.forms.filter(x=>x!==f):[...vd.forms,f].sort((a,b)=>a-b); if(!vd.forms.length) vd.forms=[f]; S.vdForms=vd.forms; save(); vNew(); renderVerbs();});
  document.querySelectorAll('[data-vm]').forEach(b=>b.onclick=()=>{vd.mode=b.dataset.vm; S.vdMode=vd.mode; save(); vNew(); renderVerbs();});
  $('#vtab').onclick=()=>{vd.table=!vd.table; renderVerbs();};
  document.querySelectorAll('[data-vk]').forEach(b=>b.onclick=()=>{ if(vd.pick!==null) return; vd.pick=b.dataset.vk; S.vb.total++; if(vd.pick===q.ans) S.vb.right++; logReview&&logReview(vd.pick===q.ans); save(); const y=scrollY; renderVerbs(); scrollTo(0,y);});
  $('#vnext')&&($('#vnext').onclick=()=>{vNew(); renderVerbs();});
}

// ---------- al-Arbaʿūn al-Nawawiyyah reader ----------
let hd = {n:null, en:false, tash:true};
function renderHadith(){
  curGloss=window.ARBAIN_GLOSS||null;
  const H=window.ARBAIN||[], T=t=>hd.tash?t:stripT(t);
  S.hdRead=S.hdRead||[];
  const head=`<div class="pagehead grain g2"><i class="bgl">حديث</i><span class="otag">Comprehension</span><div class="ph-ar">الْأَرْبَعُونَ النَّوَوِيَّةُ</div><div class="ph-en">Imam al-Nawawī’s Forty Ḥadīth</div></div>${readTabs('h')}`;
  if(!hd.n){
    $('#app').innerHTML=head+`<section class="panel"><p class="muted small" style="margin-top:0">${S.hdRead.length} of ${H.length} read. Tap a ḥadīth to read it; tap any word for its meaning.</p>
      <ol class="chlist hlist">${H.map(h=>`<li><button data-h="${h.n}"><span class="hn">${h.n}</span><span class="ar">${esc(h.t[0])}</span><span class="muted small">${esc(h.t[1])}${S.hdRead.includes(h.n)?' · ✓ read':''}</span></button></li>`).join('')}</ol></section>`;
    document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{hd.n=+b.dataset.h; hd.en=false; renderHadith(); scrollTo(0,0);});
    return;
  }
  const i=H.findIndex(h=>h.n===hd.n), h=H[i], prev=H[i-1], next=H[i+1];
  if(!S.hdRead.includes(h.n)){ S.hdRead.push(h.n); save(); }
  $('#app').innerHTML=head+`<section class="panel bk-read"><div class="bk-top"><button class="ghost" id="hBack">← All forty</button><span style="flex:1"></span>
      <button class="pill" id="hSay" title="Listen">🔊 Listen</button><button class="pill ${hd.tash?'on':''}" id="hT">${hd.tash?'✓ ':''}Tashkīl</button><button class="pill ${hd.en?'on':''}" id="hE">${hd.en?'✓ ':''}English</button></div>
    <div class="bk-h ar"><span class="hnum">${h.n}</span> ${tapAr(T(h.t[0]))}</div><div class="muted small" style="text-align:center;margin:-6px 0 10px">${esc(h.t[1])}</div>
    <div class="bk-text ar" dir="rtl">${h.a.map((p,k)=>`<p>${tapAr(T(p))}</p>${hd.en?`<p class="h-en" dir="ltr">${esc(h.e[k]||'')}</p>`:''}`).join('')}<p class="src">${tapAr(T(h.s))}</p></div>
    <div class="bk-notes"><div class="wp-rl">Key words</div><div class="rc-vocab">${h.v.map(([a,e])=>`<span class="wchip"><span class="ar">${esc(T(a))}</span><em>${esc(e)}</em></span>`).join('')}</div></div>
    <p class="muted small">Tap any word for its meaning. The English is a close rendering written for this site.</p>
    <div class="rpt-b">${prev?`<button class="ghost" id="hP">‹ ${prev.n}</button>`:''}<span style="flex:1"></span>${next?`<button class="cta" id="hN">Next: ${next.n} ›</button>`:''}</div></section>`;
  $('#hBack').onclick=()=>{hd.n=null; TTS.stop(); renderHadith();};
  $('#hT').onclick=()=>{hd.tash=!hd.tash; const y=scrollY; renderHadith(); scrollTo(0,y);};
  $('#hE').onclick=()=>{hd.en=!hd.en; const y=scrollY; renderHadith(); scrollTo(0,y);};
  $('#hSay').onclick=()=>TTS.say(h.a.join(' '));
  if(prev) $('#hP').onclick=()=>{hd.n=prev.n; TTS.stop(); renderHadith(); scrollTo(0,0);};
  if(next) $('#hN').onclick=()=>{hd.n=next.n; TTS.stop(); renderHadith(); scrollTo(0,0);};
}
