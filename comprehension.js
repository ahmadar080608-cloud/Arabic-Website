// GCSE-style reading comprehension: builds a new passage each time from story templates,
// then writes questions from the facts that ended up in that passage.
// makeComprehension({level:'f'|'h', topic:'any'|'day'|'family'|'trip'}) ->
//   {title:{ar,en}, paras:[[{ar,en}]], vocab:[[ar,en]], qs:[{type,q,opts,ans,ar?}]}
(function(){
const R = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pickN = (a,n) => shuffle(a).slice(0,n);
const O = (ar,en,x={}) => ({ar,en,...x});
const fromAr = w => (w.startsWith('ال')?'مِنَ ':'مِنْ ')+w;
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
const an = w => (/^[aeiou]/i.test(w)?'an ':'a ')+w;

const NAMES = {
  m:[O('يُوسُفُ','Yusuf'),O('أَحْمَدُ','Ahmad'),O('عُمَرُ','Umar'),O('خَالِدٌ','Khalid'),O('إِبْرَاهِيمُ','Ibrahim'),O('بِلَالٌ','Bilal'),O('حَمْزَةُ','Hamza'),O('زَيْدٌ','Zayd')],
  f:[O('فَاطِمَةُ','Fatimah'),O('مَرْيَمُ','Maryam'),O('عَائِشَةُ','Aishah'),O('خَدِيجَةُ','Khadijah'),O('زَيْنَبُ','Zaynab'),O('سَارَةُ','Sarah'),O('آمِنَةُ','Aminah'),O('هِنْدٌ','Hind')],
};
const CITY = [O('لَنْدَنَ','London'),O('مَكَّةَ','Makkah'),O('المَدِينَةِ','Madinah'),O('القَاهِرَةِ','Cairo'),O('دِمَشْقَ','Damascus'),O('عَمَّانَ','Amman'),O('الرِّيَاضِ','Riyadh'),O('بِرْمِنْغْهَامَ','Birmingham')];

// a passage under construction
function Doc(p){
  const d = {paras:[[]], facts:[], nm:[], vocab:[]};
  d.s = (ar,en,gl=[]) => { d.paras[d.paras.length-1].push({ar,en}); gl.forEach(v=>d.vocab.push(v)); };
  d.para = () => d.paras.push([]);
  // a fact the questions can use. ans/pool items are {ar,en}; st(en) makes a statement for true/false.
  d.fact = (q,ans,pool,st,x={}) => d.facts.push({q,ans,pool,st,...x});
  return d;
}

// ---------------------------------------------------------------- My day (present tense)
function myDay(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('يَوْمِي', `${N}'s day`);
  const city = R(CITY);
  const ROLES = [
    O(g('أَنَا طَالِبٌ فِي الجَامِعَةِ','أَنَا طَالِبَةٌ فِي الجَامِعَةِ'),'a university student',{k:'uni',place:O('الجَامِعَةِ','university'),enS:'I am a university student'}),
    O(g('أَنَا طَالِبٌ فِي المَدْرَسَةِ','أَنَا طَالِبَةٌ فِي المَدْرَسَةِ'),'a school student',{k:'school',place:O('المَدْرَسَةِ','school'),enS:'I am a school student'}),
    O(g('أَعْمَلُ مُدَرِّسًا فِي مَدْرَسَةٍ كَبِيرَةٍ','أَعْمَلُ مُدَرِّسَةً فِي مَدْرَسَةٍ كَبِيرَةٍ'),'a teacher',{k:'teacher',place:O('العَمَلِ','work'),enS:'I work as a teacher in a big school'}),
    O(g('أَعْمَلُ طَبِيبًا فِي المُسْتَشْفَى','أَعْمَلُ طَبِيبَةً فِي المُسْتَشْفَى'),'a doctor',{k:'med',place:O('العَمَلِ','work'),enS:'I work as a doctor in the hospital'}),
    O(g('أَعْمَلُ مُمَرِّضًا فِي المُسْتَشْفَى','أَعْمَلُ مُمَرِّضَةً فِي المُسْتَشْفَى'),'a nurse',{k:'med',place:O('العَمَلِ','work'),enS:'I work as a nurse in the hospital'}),
    O(g('أَعْمَلُ مُهَنْدِسًا فِي شَرِكَةٍ كَبِيرَةٍ','أَعْمَلُ مُهَنْدِسَةً فِي شَرِكَةٍ كَبِيرَةٍ'),'an engineer',{k:'eng',place:O('العَمَلِ','work'),enS:'I work as an engineer in a big company'}),
  ];
  const role = R(ROLES);
  d.s(`اسْمِي ${P.name.ar}، وَأَنَا ${fromAr(city.ar)}. ${role.ar}.`, `My name is ${N}, and I am from ${city.en}. ${role.enS}.`,
      [['المُسْتَشْفَى','the hospital'],['شَرِكَةٌ','company'],['الجَامِعَةُ','university']].filter(v=>role.ar.includes(v[0].slice(0,-1))));
  d.fact(`What does ${N} do?`, role, ROLES, v=>`${N} is ${v}.`);
  d.fact(`Where is ${N} from?`, city, CITY, v=>`${N} is from ${v}.`);

  // home
  const HOMES = [O('بَيْتٍ','house',{f:false}),O('شُقَّةٍ','flat',{f:true})];
  const HADJ = [['كَبِيرٍ','كَبِيرَةٍ','big'],['صَغِيرٍ','صَغِيرَةٍ','small'],['جَدِيدٍ','جَدِيدَةٍ','new'],['قَدِيمٍ','قَدِيمَةٍ','old']];
  const FAM = [O('أُسْرَتِي','my family',{e3:`${his} family`}),O('أَبِي وَأُمِّي','my parents',{e3:`${his} parents`}),O('جَدَّتِي','my grandmother',{e3:`${his} grandmother`}),O('ثَلَاثَةِ أَصْدِقَاءَ','three friends',{e3:'three friends'})];
  const home = R(HOMES), ha = R(HADJ), fam = R(FAM);
  const homeOpts = HOMES.flatMap(h=>HADJ.map(a=>O(h.ar+' '+(h.f?a[1]:a[0]), an(`${a[2]} ${h.en}`))));
  const homeO = O(home.ar+' '+(home.f?ha[1]:ha[0]), an(`${ha[2]} ${home.en}`));
  d.s(`أَسْكُنُ مَعَ ${fam.ar} فِي ${homeO.ar}.`, `I live with ${fam.en} in ${homeO.en}.`, [['أَسْكُنُ','I live']]);
  d.fact(`Who does ${N} live with?`, O(fam.ar,fam.e3), FAM.map(f=>O(f.ar,f.e3)), v=>`${N} lives with ${v}.`);
  d.fact(`What is ${N}'s home like?`, homeO, homeOpts, v=>`${N} lives in ${v}.`);

  // morning
  const WAKE = [O('الرَّابِعَةِ','4 o’clock'),O('الخَامِسَةِ','5 o’clock'),O('السَّادِسَةِ','6 o’clock'),O('السَّابِعَةِ','7 o’clock')];
  const FAJR = [O('فِي المَسْجِدِ','at the mosque'),O('فِي البَيْتِ','at home'),O('مَعَ أَبِي فِي المَسْجِدِ','with my father at the mosque',{e3:`with ${his} father at the mosque`})];
  const wake = R(WAKE), fajr = R(FAJR);
  d.para();
  d.s(`أَسْتَيْقِظُ كُلَّ يَوْمٍ فِي السَّاعَةِ ${wake.ar}، ثُمَّ أَتَوَضَّأُ وَأُصَلِّي الفَجْرَ ${fajr.ar}.`,
      `I wake up every day at ${wake.en}, then I do wudu and pray Fajr ${fajr.en}.`, [['أَسْتَيْقِظُ','I wake up'],['أَتَوَضَّأُ','I do wudu'],['ثُمَّ','then']]);
  d.fact(`What time does ${N} wake up?`, wake, WAKE, v=>`${N} wakes up at ${v}.`);
  d.fact(`Where does ${N} pray Fajr?`, O(fajr.ar,fajr.e3||fajr.en), [...FAJR.map(f=>O(f.ar,f.e3||f.en)),O('فِي المَدْرَسَةِ','at school')], v=>`${N} prays Fajr ${v}.`);

  const FOOD = [O('الخُبْزَ وَالجُبْنَ','bread and cheese'),O('البَيْضَ','eggs'),O('التَّمْرَ','dates'),O('الفُولَ','fava beans'),O('الشُّوفَانَ','porridge'),O('الخُبْزَ بِالعَسَلِ','bread with honey')];
  const DRINK = [O('الشَّايَ','tea'),O('القَهْوَةَ','coffee'),O('الحَلِيبَ','milk'),O('عَصِيرَ البُرْتُقَالِ','orange juice'),O('المَاءَ','water')];
  const food = R(FOOD), drink = R(DRINK);
  d.s(`بَعْدَ ذَلِكَ آكُلُ ${food.ar} وَأَشْرَبُ ${drink.ar} فِي الفُطُورِ.`, `After that I eat ${food.en} and drink ${drink.en} for breakfast.`, [['بَعْدَ ذَلِكَ','after that'],['الفُطُورُ','breakfast']]);
  d.fact(`What does ${N} eat for breakfast?`, food, FOOD, v=>`${N} eats ${v} for breakfast.`);
  d.fact(`What does ${N} drink for breakfast?`, drink, DRINK, v=>`${N} drinks ${v} for breakfast.`);

  // journey
  const NEAR = [O('مَشْيًا','on foot'),O('بِالدَّرَّاجَةِ','by bike')], FAR = [O('بِالحَافِلَةِ','by bus'),O('بِالقِطَارِ','by train'),O('بِالسَّيَّارَةِ','by car')];
  const near = Math.random()<.4, how = R(near?NEAR:FAR);
  const WHY = near ? [O('لِأَنَّ الطَّرِيقَ قَصِيرٌ','because it is not far'),O('لِأَنِّي أُحِبُّ الرِّيَاضَةَ','because '+he+' likes exercise')]
                   : [O('لِأَنَّ الطَّرِيقَ طَوِيلٌ','because it is a long way'),O('لِأَنَّ الجَوَّ بَارِدٌ','because the weather is cold')];
  const WHY_ALL = [O('لِأَنَّ الطَّرِيقَ قَصِيرٌ','because it is not far'),O('لِأَنِّي أُحِبُّ الرِّيَاضَةَ','because '+he+' likes exercise'),O('لِأَنَّ الطَّرِيقَ طَوِيلٌ','because it is a long way'),O('لِأَنَّ الجَوَّ بَارِدٌ','because the weather is cold'),O('','because it is cheap')];
  const DUR = near ? [O('عَشْرَ دَقَائِقَ','ten minutes'),O('رُبْعَ سَاعَةٍ','a quarter of an hour'),O('عِشْرِينَ دَقِيقَةً','twenty minutes')]
                   : [O('نِصْفَ سَاعَةٍ','half an hour'),O('أَرْبَعِينَ دَقِيقَةً','forty minutes'),O('سَاعَةً كَامِلَةً','a whole hour')];
  const DUR_ALL = [O('عَشْرَ دَقَائِقَ','ten minutes'),O('رُبْعَ سَاعَةٍ','a quarter of an hour'),O('عِشْرِينَ دَقِيقَةً','twenty minutes'),O('نِصْفَ سَاعَةٍ','half an hour'),O('أَرْبَعِينَ دَقِيقَةً','forty minutes'),O('سَاعَةً كَامِلَةً','a whole hour')];
  const why = R(WHY), dur = R(DUR);
  const whyEn1 = why.en.replace(' he likes',' I like').replace(' she likes',' I like');
  d.s(`أَذْهَبُ إِلَى ${role.place.ar} ${how.ar} ${why.ar}، وَتَسْتَغْرِقُ الرِّحْلَةُ ${dur.ar}.`,
      `I go to ${role.place.en} ${how.en} ${whyEn1}, and the journey takes ${dur.en}.`, [['الطَّرِيقُ','the way, road'],['تَسْتَغْرِقُ','it takes (time)'],['الرِّحْلَةُ','the journey']]);
  d.fact(`How does ${N} get to ${role.place.en}?`, how, [...NEAR,...FAR], v=>`${N} goes to ${role.place.en} ${v}.`);
  d.fact(`Why does ${N} go to ${role.place.en} ${how.en}?`, why, WHY_ALL, null, {why:1});
  d.fact(`How long does ${N}'s journey take?`, dur, DUR_ALL, v=>`${cap(his)} journey takes ${v}.`);

  // what they do there
  d.para();
  if(role.k==='uni'){
    const SUB = [O('الطِّبَّ','medicine'),O('طِبَّ الأَسْنَانِ','dentistry'),O('الهَنْدَسَةَ','engineering'),O('اللُّغَةَ العَرَبِيَّةَ','Arabic'),O('القَانُونَ','law'),O('الصَّيْدَلَةَ','pharmacy')];
    const W = [O('لِأَنَّ الأَسَاتِذَةَ مُمْتَازُونَ','because the lecturers are excellent'),O('لِأَنَّ المَوَادَّ مُمْتِعَةٌ','because the subjects are interesting'),O('لِأَنَّ أَصْدِقَائِي يَدْرُسُونَ مَعِي','because '+his+' friends study with '+(g('him','her')),{e1:'because my friends study with me'})];
    const sub = R(SUB), w = R(W);
    d.s(`أَدْرُسُ ${sub.ar} فِي الجَامِعَةِ، وَأُحِبُّ دِرَاسَتِي ${w.ar}.`, `I study ${sub.en} at university, and I love my studies ${w.e1||w.en}.`, [['دِرَاسَةٌ','studies'],['مُمْتِعٌ','interesting, enjoyable']]);
    d.fact(`What does ${N} study?`, sub, SUB, v=>`${N} studies ${v}.`);
    d.fact(`Why does ${N} love ${his} studies?`, w, [...W,O('','because the exams are easy')], null, {why:1});
  } else if(role.k==='school'){
    const SUB = [O('الرِّيَاضِيَّاتِ','maths'),O('العُلُومِ','science'),O('التَّارِيخِ','history'),O('الجُغْرَافِيَا','geography'),O('اللُّغَةِ الإِنْجِلِيزِيَّةِ','English'),O('اللُّغَةِ العَرَبِيَّةِ','Arabic'),O('الفَنِّ','art')];
    const W = [O('لِأَنَّ المُدَرِّسَ لَطِيفٌ','because the teacher is kind'),O('لِأَنَّ الدُّرُوسَ مُمْتِعَةٌ','because the lessons are interesting'),O('لِأَنَّ المَادَّةَ سَهْلَةٌ','because the subject is easy')];
    const [s1,s2] = pickN(SUB,2), w = R(W);
    d.s(`أُحِبُّ مَادَّةَ ${s1.ar} كَثِيرًا ${w.ar}، لَكِنِّي لَا أُحِبُّ مَادَّةَ ${s2.ar} لِأَنَّهَا صَعْبَةٌ.`,
        `I really like ${s1.en} ${w.en}, but I don’t like ${s2.en} because it is difficult.`, [['مَادَّةٌ','school subject'],['لَكِنِّي','but I'],['صَعْبٌ','difficult']]);
    d.fact(`Which subject does ${N} like most?`, s1, SUB, v=>`${N}'s favourite subject is ${v}.`);
    d.fact(`Why does ${N} like ${s1.en}?`, w, [...W,O('','because the exams are easy')], null, {why:1});
    d.fact(`Which subject does ${N} find difficult?`, s2, SUB, v=>`${N} finds ${v} difficult.`);
  } else {
    const OP = [O('مُتْعِبٌ لَكِنَّهُ مُهِمٌّ','tiring but important'),O('مُمْتِعٌ لَكِنَّهُ صَعْبٌ','enjoyable but difficult'),O('سَهْلٌ لَكِنَّهُ مُمِلٌّ','easy but boring')];
    const op = R(OP);
    const DO = {teacher:[`أُدَرِّسُ مَادَّةَ ${R(['الرِّيَاضِيَّاتِ','العُلُومِ','التَّارِيخِ'])} لِطُلَّابٍ صِغَارٍ`,'I teach young pupils'],
                med:['أُسَاعِدُ المَرْضَى كُلَّ يَوْمٍ','I help patients every day'],
                eng:['أُصَمِّمُ المَبَانِيَ وَالجُسُورَ','I design buildings and bridges']}[role.k];
    const doEn = role.k==='teacher' ? DO[0].includes('الرِّيَاضِيَّاتِ')?'I teach maths to young pupils':DO[0].includes('العُلُومِ')?'I teach science to young pupils':'I teach history to young pupils' : DO[1];
    d.s(`${DO[0]}، وَعَمَلِي ${op.ar}.`, `${doEn}, and my work is ${op.en}.`, [['عَمَلِي','my work'],['مُتْعِبٌ','tiring'],['مُمِلٌّ','boring'],['المَرْضَى','patients'],['مَبَانٍ','buildings']].filter(v=>(DO[0]+op.ar).includes(v[0].replace(/[ًٌٍ]$/,''))));
    d.fact(`What does ${N} think of ${his} job?`, op, OP, v=>`${N} thinks ${his} job is ${v}.`);
  }
  const WITH = [O('مَعَ أَصْدِقَائِي','with my friends',{e3:`with ${his} friends`}),O('مَعَ زُمَلَائِي','with my colleagues',{e3:`with ${his} colleagues`}),O('وَحْدِي','on my own',{e3:'on '+his+' own'})];
  const LUNCH = [O('الأَرُزَّ وَالدَّجَاجَ','rice and chicken'),O('السَّمَكَ','fish'),O('السَّلَطَةَ','salad'),O('الشَّوْرَبَةَ','soup'),O('المَعْكَرُونَةَ','pasta')];
  const wi = R(WITH), lu = R(LUNCH);
  if(L==='h' || Math.random()<.5){
    d.s(`فِي الظُّهْرِ آكُلُ الغَدَاءَ ${wi.ar}، وَعَادَةً آكُلُ ${lu.ar}.`, `At midday I have lunch ${wi.en}, and I usually eat ${lu.en}.`, [['الظُّهْرُ','midday'],['الغَدَاءُ','lunch'],['عَادَةً','usually']]);
    d.fact(`Who does ${N} have lunch with?`, O(wi.ar,wi.e3), WITH.map(w=>O(w.ar,w.e3)), v=>`${N} has lunch ${v}.`);
    d.fact(`What does ${N} usually eat for lunch?`, lu, LUNCH, v=>`${N} usually eats ${v} for lunch.`);
  }

  // evening
  const RET = [O('الثَّالِثَةِ','3 o’clock'),O('الرَّابِعَةِ','4 o’clock'),O('الخَامِسَةِ','5 o’clock'),O('السَّادِسَةِ','6 o’clock')];
  const EVE = [O('أَقْرَأُ القُرْآنَ','reads the Qur’an',{e1:'I read the Qur’an'}),O('أَذْهَبُ إِلَى المَسْجِدِ لِحُضُورِ الدَّرْسِ','goes to the mosque for a lesson',{e1:'I go to the mosque for the lesson'}),
               O('أَلْعَبُ كُرَةَ القَدَمِ مَعَ جِيرَانِي','plays football with '+his+' neighbours',{e1:'I play football with my neighbours'}),O('أُسَاعِدُ أُمِّي فِي المَطْبَخِ','helps '+his+' mother in the kitchen',{e1:'I help my mother in the kitchen'}),
               O('أُرَاجِعُ دُرُوسِي','revises '+his+' lessons',{e1:'I revise my lessons'}),O('أَمْشِي فِي الحَدِيقَةِ','goes for a walk in the park',{e1:'I walk in the park'})];
  const ret = R(RET), eve = R(EVE);
  d.para();
  d.s(`أَرْجِعُ إِلَى البَيْتِ فِي السَّاعَةِ ${ret.ar}، ثُمَّ ${eve.ar}.`, `I come back home at ${ret.en}, then ${eve.e1.replace(/^I/, 'I')}.`, [['أَرْجِعُ','I come back'],['جِيرَانٌ','neighbours'],['أُرَاجِعُ','I revise']].filter(v=>(eve.ar+' أَرْجِعُ').includes(v[0].slice(0,4))));
  d.fact(`What time does ${N} get home?`, ret, RET, v=>`${N} gets home at ${v}.`);
  d.fact(`What does ${N} do after getting home?`, eve, EVE, v=>`After getting home, ${N} ${v}.`);
  const DIN = [O('السَّابِعَةِ','7 o’clock'),O('الثَّامِنَةِ','8 o’clock'),O('التَّاسِعَةِ','9 o’clock')];
  const SLP = [O('العَاشِرَةِ','10 o’clock'),O('الحَادِيَةَ عَشْرَةَ','11 o’clock')];
  const din = R(DIN), slp = R(SLP);
  d.s(`نَأْكُلُ العَشَاءَ مَعًا فِي السَّاعَةِ ${din.ar}، وَأَنَامُ فِي السَّاعَةِ ${slp.ar}.`, `We eat dinner together at ${din.en}, and I go to sleep at ${slp.en}.`, [['العَشَاءُ','dinner'],['مَعًا','together'],['أَنَامُ','I sleep']]);
  d.fact(`What time does ${N} go to sleep?`, slp, [...SLP,O('','9 o’clock'),O('','midnight')], v=>`${N} goes to sleep at ${v}.`);
  d.fact(`What time is dinner?`, din, DIN, v=>`Dinner is at ${v}.`);
  if(L==='h' || Math.random()<.4){
    const DAY = [O('الجُمُعَةِ','Friday'),O('السَّبْتِ','Saturday'),O('الأَحَدِ','Sunday')];
    const ACT = [O('لِأَنِّي أَزُورُ جَدِّي وَجَدَّتِي','because '+he+' visits '+his+' grandparents',{e1:'because I visit my grandparents'}),O('لِأَنِّي أَخْرُجُ مَعَ أَصْدِقَائِي','because '+he+' goes out with friends',{e1:'because I go out with my friends'}),
                 O('لِأَنِّي أَذْهَبُ إِلَى المَسْجِدِ مُبَكِّرًا','because '+he+' goes to the mosque early',{e1:'because I go to the mosque early'}),O('لِأَنِّي أَرْتَاحُ فِي البَيْتِ','because '+he+' rests at home',{e1:'because I rest at home'})];
    const day = R(DAY), act = R(ACT);
    d.s(`أَفْضَلُ يَوْمٍ عِنْدِي هُوَ يَوْمُ ${day.ar} ${act.ar}.`, `My favourite day is ${day.en} ${act.e1}.`, [['أَفْضَلُ','best'],['أَرْتَاحُ','I rest']]);
    d.fact(`What is ${N}'s favourite day?`, day, [...DAY,O('','Monday')], v=>`${N}'s favourite day is ${v}.`);
    d.fact(`Why is ${day.en} ${N}'s favourite day?`, act, ACT, null, {why:1});
  }
  d.s(`يَوْمِي مُزْدَحِمٌ، لَكِنِّي ${g('سَعِيدٌ','سَعِيدَةٌ')} بِهِ.`, `My day is busy, but I am happy with it.`, [['مُزْدَحِمٌ','busy, crowded']]);
  d.fact(`How does ${N} feel about ${his} day?`, O('','busy but happy with it'), [O('','busy but happy with it'),O('','bored'),O('','tired and unhappy'),O('','relaxed and quiet')], null);
  d.nm = [`${N}'s mother is a teacher.`,`${N}'s favourite food is pizza.`,`${N} has a part-time job.`,`${N} wants to travel abroad next year.`,`${N}'s best friend is called Sami.`,`${N} is learning to swim.`];
  return d;
}

// ---------------------------------------------------------------- My family and home
function myFamily(P, L){
  const d = Doc(P), N = P.name.en, he = P.he, his = P.his;
  d.title = O('أُسْرَتِي وَبَيْتِي', `${N}'s family and home`);
  const AGE = [O('ثَلَاثَ عَشْرَةَ','13'),O('أَرْبَعَ عَشْرَةَ','14'),O('خَمْسَ عَشْرَةَ','15'),O('سِتَّ عَشْرَةَ','16'),O('سَبْعَ عَشْرَةَ','17'),O('ثَمَانِيَ عَشْرَةَ','18'),O('تِسْعَ عَشْرَةَ','19')];
  const age = R(AGE), city = R(CITY);
  d.s(`اسْمِي ${P.name.ar}، وَعُمْرِي ${age.ar} سَنَةً، وَأَسْكُنُ فِي ${city.ar}.`, `My name is ${N}, I am ${age.en} years old, and I live in ${city.en}.`, [['عُمْرِي','my age'],['سَنَةٌ','year']]);
  d.fact(`How old is ${N}?`, age, AGE, v=>`${N} is ${v} years old.`);
  d.fact(`Where does ${N} live?`, city, CITY, v=>`${N} lives in ${v}.`);

  // siblings
  const total = R([1,2,2,3]);
  let sibs = [];
  for(let i=0;i<total;i++) sibs.push({m:Math.random()<.5});
  if(sibs.filter(s=>s.m).length>2) sibs[0].m=false;
  if(sibs.filter(s=>!s.m).length>2) sibs[0].m=true;
  // older / younger; two of the same sex must differ
  sibs.forEach(s=>s.old=Math.random()<.5);
  ['m','f'].forEach(x=>{ const same=sibs.filter(s=>(x==='m')===s.m); if(same.length===2){ same[0].old=true; same[1].old=false; } });
  const used = new Set([P.name.en]);
  sibs.forEach(s=>{ let n; do n=R(NAMES[s.m?'m':'f']); while(used.has(n.en)); used.add(n.en); s.name=n; });
  const nb = sibs.filter(s=>s.m).length, ns = sibs.length-nb;
  const arB = ['','أَخِي','أَخَوَايَ'][nb], arS = ['','أُخْتِي','أُخْتَايَ'][ns];
  const enB = ['','my brother','my two brothers'][nb], enS = ['','my sister','my two sisters'][ns];
  const COUNT = [O('ثَلَاثَةُ','three'),O('أَرْبَعَةُ','four'),O('خَمْسَةُ','five'),O('سِتَّةُ','six')];
  const count = COUNT[sibs.length];
  const list = ['أَبِي','أُمِّي',arB,arS,'أَنَا'].filter(Boolean).join(' وَ');
  const listEn = ['my father','my mother',enB,enS].filter(Boolean).join(', ')+' and me';
  d.para();
  d.s(`فِي أُسْرَتِي ${count.ar} أَشْخَاصٍ: ${list}.`, `There are ${count.en} people in my family: ${listEn}.`, [['أَشْخَاصٌ','people'],['أَخَوَايَ','my two brothers'],['أُخْتَايَ','my two sisters']].filter(v=>v[0]==='أَشْخَاصٌ'||list.includes(v[0])));
  d.fact(`How many people are in ${N}'s family?`, count, COUNT, v=>`There are ${v} people in ${N}'s family.`);
  const NUM = [O('','none'),O('','one'),O('','two'),O('','three')];
  d.fact(`How many sisters does ${N} have?`, NUM[ns], NUM, v=>`${N} has ${v==='none'?'no':v} sister${v==='one'?'':'s'}.`, {why:1});
  d.fact(`How many brothers does ${N} have?`, NUM[nb], NUM, v=>`${N} has ${v==='none'?'no':v} brother${v==='one'?'':'s'}.`, {why:1});

  const ADJ = [['لَطِيفٌ','لَطِيفَةٌ','kind'],['ذَكِيٌّ','ذَكِيَّةٌ','clever'],['مُجْتَهِدٌ','مُجْتَهِدَةٌ','hard-working'],['مُضْحِكٌ','مُضْحِكَةٌ','funny'],['هَادِئٌ','هَادِئَةٌ','quiet'],['كَرِيمٌ','كَرِيمَةٌ','generous'],['نَشِيطٌ','نَشِيطَةٌ','energetic']];
  const HOB = [O('كُرَةَ القَدَمِ','football'),O('القِرَاءَةَ','reading'),O('الرَّسْمَ','drawing'),O('الطَّبْخَ','cooking'),O('السِّبَاحَةَ','swimming'),O('الأَلْعَابَ الإِلِكْتْرُونِيَّةَ','video games')];
  const SUBJ = [O('الطِّبَّ','medicine'),O('الهَنْدَسَةَ','engineering'),O('القَانُونَ','law'),O('الشَّرِيعَةَ','Islamic law')];
  const JOB = [['مُهَنْدِسًا','مُهَنْدِسَةً','an engineer'],['مُدَرِّسًا','مُدَرِّسَةً','a teacher'],['مُحَاسِبًا','مُحَاسِبَةً','an accountant']];
  sibs.forEach(s=>{
    const M = s.m, ref = (M?'أَخِي ':'أُخْتِي ')+(s.old?(M?'الكَبِيرُ':'الكَبِيرَةُ'):(M?'الصَّغِيرُ':'الصَّغِيرَةُ'));
    s.refGen = ref.replace(/ُ$/,'ِ');
    const refEn = `${s.old?'older':'younger'} ${M?'brother':'sister'}`;
    s.refEn = refEn;
    const yaf = M?'يَ':'تَ', huwa = M?'هُوَ':'هِيَ';
    let occ, occEn;
    if(!s.old){ occ = `${M?'يَدْرُسُ':'تَدْرُسُ'} فِي المَدْرَسَةِ الابْتِدَائِيَّةِ`; occEn='is at primary school'; }
    else if(Math.random()<.5){ const sb=R(SUBJ); occ=`${M?'يَدْرُسُ':'تَدْرُسُ'} ${sb.ar} فِي الجَامِعَةِ`; occEn=`studies ${sb.en} at university`; }
    else { const j=R(JOB); occ=`${M?'يَعْمَلُ':'تَعْمَلُ'} ${M?j[0]:j[1]}`; occEn=`works as ${j[2]}`; }
    const [a1,a2] = pickN(ADJ,2), hob = R(HOB);
    const lazy = !['مُجْتَهِدٌ','نَشِيطٌ'].includes(a1[0]) && !['مُجْتَهِدٌ','نَشِيطٌ'].includes(a2[0]) && Math.random()<.35;
    const adjAr = `${M?a1[0]:a1[1]} وَ${M?a2[0]:a2[1]}`;
    d.s(`${ref} ${s.name.ar} ${occ}، وَ${huwa} ${adjAr}${lazy?(M?'، لَكِنَّهُ كَسْلَانُ أَحْيَانًا':'، لَكِنَّهَا كَسْلَى أَحْيَانًا'):''}، وَ${M?'يُحِبُّ':'تُحِبُّ'} ${hob.ar}.`,
        `My ${refEn} ${s.name.en} ${occEn}; ${M?'he':'she'} is ${a1[2]} and ${a2[2]}${lazy?', but sometimes lazy':''}, and ${M?'he':'she'} loves ${hob.en}.`,
        [['الابْتِدَائِيَّةُ','primary'],['كَسْلَانُ / كَسْلَى','lazy'],['أَحْيَانًا','sometimes']].filter(v=>(occ+(lazy?'كَسْلَ أَحْيَانًا':'')).includes(v[0].slice(0,5))));
    d.fact(`What does ${N}'s ${refEn} like doing?`, hob, HOB, v=>`${N}'s ${refEn} loves ${v}.`);
    d.fact(`What is ${N}'s ${refEn} called?`, s.name, NAMES[M?'m':'f'].filter(n=>n.en!==N), v=>`${N}'s ${refEn} is called ${v}.`, {noAr:1});
    const notAdj = ADJ.filter(a=>a!==a1&&a!==a2);
    d.fact(`Which word describes ${N}'s ${refEn}?`, O(a1[1],a1[2]), [O(a1[1],a1[2]),...notAdj.map(a=>O(a[1],a[2]))], v=>`${N}'s ${refEn} is ${v}.`);
  });

  // parents
  const FJ = [O('تَاجِرًا','a merchant'),O('طَبِيبًا','a doctor'),O('سَائِقَ تَاكْسِي','a taxi driver'),O('مُهَنْدِسًا','an engineer'),O('إِمَامًا فِي المَسْجِدِ','an imam at the mosque')];
  const MJ = [O('تَعْمَلُ مُدَرِّسَةً','is a teacher'),O('تَعْمَلُ مُمَرِّضَةً','is a nurse'),O('تَعْمَلُ طَبِيبَةً','is a doctor'),O('لَا تَعْمَلُ خَارِجَ البَيْتِ','does not work outside the home')];
  const fj = R(FJ), mj = R(MJ);
  d.para();
  d.s(`أَبِي يَعْمَلُ ${fj.ar}، وَأُمِّي ${mj.ar}${Math.random()<.5?'، وَهِيَ تَطْبُخُ أَطْيَبَ طَعَامٍ فِي العَالَمِ':''}.`,
      `My father works as ${fj.en}, and my mother ${mj.en}.`, [['تَاجِرٌ','merchant'],['خَارِجَ','outside'],['أَطْيَبُ طَعَامٍ','the tastiest food']].filter(v=>v[0]!=='تَاجِرٌ'||fj.ar.startsWith('تَاجِر')));
  d.paras[d.paras.length-1].slice(-1)[0].en = d.paras[d.paras.length-1].slice(-1)[0].ar.includes('أَطْيَبَ') ? `My father works as ${fj.en}, and my mother ${mj.en}, and she cooks the tastiest food in the world.` : `My father works as ${fj.en}, and my mother ${mj.en}.`;
  d.fact(`What is ${N}'s father's job?`, fj, FJ, v=>`${N}'s father is ${v}.`);
  d.fact(`What does ${N}'s mother do?`, mj, MJ, v=>`${N}'s mother ${v}.`);

  // home
  const house = Math.random()<.55;
  const HADJ = house ? [['كَبِيرٍ','big'],['قَدِيمٍ','old'],['جَمِيلٍ','beautiful']] : [['كَبِيرَةٍ','big'],['صَغِيرَةٍ','small'],['جَدِيدَةٍ','new']];
  const ha = R(HADJ);
  const ROOMS = [O('ثَلَاثُ','three'),O('أَرْبَعُ','four'),O('خَمْسُ','five')];
  const rooms = R(ROOMS);
  const extra = house ? O('وَحَدِيقَةٌ صَغِيرَةٌ','and a small garden') : O('وَشُرْفَةٌ وَاسِعَةٌ','and a wide balcony');
  d.s(`نَسْكُنُ فِي ${house?'بَيْتٍ':'شُقَّةٍ'} ${ha[0]}، فِي${house?'هِ':'هَا'} ${rooms.ar} غُرَفِ نَوْمٍ ${extra.ar}.`,
      `We live in ${an(ha[1])} ${house?'house':'flat'}; it has ${rooms.en} bedrooms ${extra.en}.`, [['غُرْفَةُ نَوْمٍ','bedroom'],['شُرْفَةٌ','balcony'],['وَاسِعٌ','wide, spacious']].filter(v=>house?v[0]==='غُرْفَةُ نَوْمٍ':true));
  d.fact(`How many bedrooms does ${N}'s home have?`, rooms, [...ROOMS,O('','two')], v=>`${N}'s home has ${v} bedrooms.`);
  d.fact(`What type of home does ${N}'s family live in?`, O('',an(`${ha[1]} ${house?'house':'flat'}`)), [O('',an(`${ha[1]} ${house?'house':'flat'}`)),O('',an(`${ha[1]} ${house?'flat':'house'}`)),O('',an(`${ha[1]==='big'?'small':'big'} ${house?'house':'flat'}`)),O('','a tent')], v=>`${N}'s family lives in ${v}.`);
  const same = sibs.find(s=>s.m===(P.sex==='m'));
  const shares = same && (sibs.length+3 > ({three:3,four:4,five:5})[rooms.en]+1 || Math.random()<.5);
  if(shares){
    d.s(`أَتَقَاسَمُ غُرْفَتِي مَعَ ${same.refGen}.`, `I share my room with my ${same.refEn}.`, [['أَتَقَاسَمُ','I share']]);
    d.fact(null,null,null,null,{tf:[`${N} shares a bedroom.`, `${N} has a bedroom of ${his} own.`]});
  } else {
    d.s(`عِنْدِي غُرْفَةٌ خَاصَّةٌ بِي.`, `I have my own room.`, [['خَاصَّةٌ بِي','my own']]);
    d.fact(null,null,null,null,{tf:[`${N} has a bedroom of ${his} own.`, `${N} shares a bedroom with ${his} brother.`]});
  }
  const FAV = [O('المَطْبَخَ','the kitchen',{w:O('لِأَنِّي أُحِبُّ الطَّبْخَ مَعَ أُمِّي',`because ${he} likes cooking with ${his} mother`,{e1:'because I love cooking with my mother'})}),
               O('الصَّالَةَ','the living room',{w:O('لِأَنَّ الأُسْرَةَ تَجْلِسُ فِيهَا مَعًا','because the family sits there together')}),
               house ? O('الحَدِيقَةَ','the garden',{w:O('لِأَنِّي أَجْلِسُ فِيهَا وَأَقْرَأُ',`because ${he} sits and reads there`,{e1:'because I sit and read in it'})})
                     : O('الشُّرْفَةَ','the balcony',{w:O('لِأَنَّ المَنْظَرَ مِنْهَا جَمِيلٌ','because the view from it is beautiful')})];
  const fav = R(FAV);
  if(L==='h' || Math.random()<.5){
    d.s(`أُحِبُّ ${fav.ar} كَثِيرًا ${fav.w.ar}.`, `I really like ${fav.en} ${fav.w.e1||fav.w.en}.`, [['المَنْظَرُ','the view']].filter(()=>fav.ar==='الشُّرْفَةَ'));
    d.fact(`Which part of the home does ${N} like most?`, fav, [...FAV,O('','the bathroom')], v=>`${N}'s favourite place at home is ${v}.`);
    d.fact(`Why does ${N} like ${fav.en}?`, fav.w, FAV.map(f=>f.w).concat([O('','because it is warm')]), null, {why:1});
  }
  // pet
  d.para();
  const PET = [O('قِطَّةٌ صَغِيرَةٌ','a small cat'),O('عُصْفُورَانِ جَمِيلَانِ','two beautiful birds'),O('سَمَكٌ مُلَوَّنٌ','some colourful fish')];
  if(Math.random()<.55){
    const pet = R(PET);
    d.s(`عِنْدَنَا ${pet.ar} فِي البَيْتِ.`, `We have ${pet.en} at home.`, [['عُصْفُورٌ','bird'],['مُلَوَّنٌ','colourful']].filter(v=>pet.ar.includes(v[0].slice(0,4))));
    d.fact(`What pet does the family have?`, pet, [...PET,O('','a dog')], v=>`The family has ${v}.`);
  } else {
    const who = R([['أَبِي لَا يُحِبُّ','my father does not like',`${his} father does not like`],['أُمِّي لَا تُحِبُّ','my mother does not like',`${his} mother does not like`]]);
    d.s(`لَيْسَ عِنْدَنَا حَيَوَانٌ أَلِيفٌ، لِأَنَّ ${who[0]} الحَيَوَانَاتِ فِي البَيْتِ.`, `We do not have a pet, because ${who[1]} animals in the house.`, [['حَيَوَانٌ أَلِيفٌ','pet'],['لَيْسَ عِنْدَنَا','we do not have']]);
    d.fact(`Why does the family not have a pet?`, O('',`because ${who[2]} animals in the house`), [O('',`because ${who[2]} animals in the house`),O('','because the flat is too small'),O('','because pets are expensive'),O('',`because ${N} is allergic`)], null, {why:1});
  }
  const WK = [O('نَزُورُ جَدِّي وَجَدَّتِي','visit our grandparents',{e3:`visits ${his} grandparents`}),O('نَذْهَبُ إِلَى الحَدِيقَةِ العَامَّةِ','go to the park',{e3:'goes to the park'}),O('نَأْكُلُ فِي مَطْعَمٍ','eat at a restaurant',{e3:'eats at a restaurant'}),O('نَذْهَبُ إِلَى المَسْجِدِ مَعًا','go to the mosque together',{e3:'goes to the mosque together'})];
  const wk = R(WK);
  d.s(`فِي نِهَايَةِ الأُسْبُوعِ ${wk.ar}، وَأَنَا أُحِبُّ أُسْرَتِي كَثِيرًا.`, `At the weekend we ${wk.en}, and I love my family very much.`, [['نِهَايَةُ الأُسْبُوعِ','the weekend'],['الحَدِيقَةُ العَامَّةُ','the park']].filter(v=>v[0]!=='الحَدِيقَةُ العَامَّةُ'||wk.ar.includes('العَامَّةِ')));
  d.fact(`What does the family do at the weekend?`, O(wk.ar,'the family '+wk.e3), WK.map(w=>O(w.ar,'the family '+w.e3)), null);
  d.nm = [`${N}'s father works in London.`,`The family has a car.`,`${N} wants to be a doctor in the future.`,`${N}'s grandmother lives with them.`,`${N} plays the piano.`,`${N}'s mother speaks three languages.`];
  return d;
}

// ---------------------------------------------------------------- A trip (past tense)
function myTrip(P, L){
  const d = Doc(P), N = P.name.en, he = P.he, his = P.his, g = P.g;
  d.title = O('رِحْلَتِي', `${N}'s trip`);
  const WHEN = [O('فِي الصَّيْفِ المَاضِي','last summer'),O('فِي الشِّتَاءِ المَاضِي','last winter'),O('فِي العُطْلَةِ المَاضِيَةِ','in the last holidays')];
  const COMP = [O('أُسْرَتِي','my family',{e3:`${his} family`}),O('أَصْدِقَائِي','my friends',{e3:`${his} friends`}),O('أَبِي','my father',{e3:`${his} father`}),O('عَمِّي وَأَوْلَادِهِ','my uncle and his children',{e3:`${his} uncle and cousins`})];
  const DEST = [O('مِصْرَ','Egypt'),O('تُرْكِيَا','Turkey'),O('المَغْرِبِ','Morocco'),O('الأُرْدُنِّ','Jordan'),O('مَالِيزِيَا','Malaysia'),O('إِسْبَانِيَا','Spain')];
  const HOW = [O('بِالطَّائِرَةِ','by plane'),O('بِالطَّائِرَةِ','by plane'),O('بِالسَّيَّارَةِ','by car'),O('بِالقِطَارِ','by train')];
  const DUR = [O('سَاعَتَيْنِ','two hours'),O('ثَلَاثَ سَاعَاتٍ','three hours'),O('خَمْسَ سَاعَاتٍ','five hours'),O('سَبْعَ سَاعَاتٍ','seven hours')];
  const when = R(WHEN), comp = R(COMP), [dest,dest2] = pickN(DEST,2), how = R(HOW), dur = R(DUR);
  d.s(`${when.ar} سَافَرْتُ مَعَ ${comp.ar} إِلَى ${dest.ar} ${how.ar}، وَاسْتَغْرَقَتِ الرِّحْلَةُ ${dur.ar}.`,
      `${cap(when.en)} I travelled with ${comp.en} to ${dest.en} ${how.en}, and the journey took ${dur.en}.`, [['سَافَرْتُ','I travelled'],['المَاضِي','last, past'],['العُطْلَةُ','holiday'],['اسْتَغْرَقَتْ','it took (time)']]);
  d.fact(`Where did ${N} go?`, dest, DEST.filter(x=>x!==dest2), v=>`${N} went to ${v}.`);
  d.fact(`Who did ${N} travel with?`, O(comp.ar,comp.e3), COMP.map(c=>O(c.ar,c.e3)), v=>`${N} travelled with ${v}.`);
  d.fact(`How did they travel?`, how, [O('بِالطَّائِرَةِ','by plane'),O('بِالسَّيَّارَةِ','by car'),O('بِالقِطَارِ','by train'),O('بِالسَّفِينَةِ','by ship')], v=>`They travelled ${v}.`);
  d.fact(`How long did the journey take?`, dur, DUR, v=>`The journey took ${v}.`);
  d.fact(`When did ${N} go on this trip?`, when, WHEN, null);

  const LEN = [O('أُسْبُوعًا','a week'),O('أُسْبُوعَيْنِ','two weeks'),O('عَشَرَةَ أَيَّامٍ','ten days'),O('شَهْرًا كَامِلًا','a whole month')];
  const ACC = [O('فُنْدُقٍ كَبِيرٍ قَرِيبٍ مِنَ البَحْرِ','a big hotel near the sea',{hotel:1}),O('بَيْتِ خَالِي','my uncle’s house',{e3:`${his} uncle’s house`}),O('شُقَّةٍ صَغِيرَةٍ فِي وَسَطِ المَدِينَةِ','a small flat in the city centre'),O('فُنْدُقٍ قَدِيمٍ فِي المَدِينَةِ القَدِيمَةِ','an old hotel in the old city',{hotel:1})];
  const len = R(LEN), acc = R(ACC);
  d.s(`بَقِينَا هُنَاكَ ${len.ar}، وَسَكَنَّا فِي ${acc.ar}.`, `We stayed there ${len.en}, and we lived in ${acc.en}.`, [['بَقِينَا','we stayed'],['هُنَاكَ','there'],['فُنْدُقٌ','hotel'],['وَسَطُ المَدِينَةِ','the city centre']].filter(v=>!['فُنْدُقٌ','وَسَطُ المَدِينَةِ'].includes(v[0])||acc.ar.includes(v[0].slice(0,4))));
  d.fact(`How long did they stay?`, len, LEN, v=>`They stayed for ${v}.`);
  d.fact(`Where did they stay?`, O(acc.ar,acc.e3||acc.en), ACC.map(a=>O(a.ar,a.e3||a.en)), v=>`They stayed in ${v}.`);

  const W = [O('حَارًّا جِدًّا','very hot'),O('جَمِيلًا وَمُشْمِسًا','nice and sunny'),O('بَارِدًا','cold'),O('مُعْتَدِلًا','mild')];
  const w = when.en==='last winter' ? R(W.slice(1)) : R(W), rain = Math.random()<.4;
  const ACTOK = a => !(when.en==='last winter' && a.en==='swam in the sea');
  d.s(`كَانَ الجَوُّ ${w.ar}${rain?'، لَكِنَّ المَطَرَ نَزَلَ فِي يَوْمٍ وَاحِدٍ':''}.`, `The weather was ${w.en}${rain?', but it rained on one day':''}.`, [['الجَوُّ','the weather'],['مُشْمِسٌ','sunny'],['مُعْتَدِلٌ','mild'],['نَزَلَ المَطَرُ','it rained']].filter(v=>v[0]==='الجَوُّ'||(w.ar+(rain?'نَزَلَ':'')).includes(v[0].slice(0,4))));
  d.fact(`What was the weather like?`, w, W, v=>`The weather was ${v}.`);
  if(rain) d.fact(null,null,null,null,{tf:[`It rained on one day of the trip.`, `It rained every day of the trip.`]});
  else d.nm.push(`It rained during the trip.`);

  const ACT = [O('زُرْنَا المَسْجِدَ الكَبِيرَ فِي المَدِينَةِ','visited the big mosque in the city'),O('سَبَحْنَا فِي البَحْرِ','swam in the sea'),O('صَعِدْنَا جَبَلًا عَالِيًا','climbed a high mountain'),
               O('ذَهَبْنَا إِلَى السُّوقِ وَاشْتَرَيْنَا هَدَايَا','went to the market and bought presents'),O('رَكِبْنَا الجِمَالَ فِي الصَّحْرَاءِ','rode camels in the desert'),O('زُرْنَا المَتْحَفَ','visited the museum'),O('أَكَلْنَا فِي مَطْعَمٍ مَشْهُورٍ','ate in a famous restaurant')];
  const acts = pickN(ACT.filter(a=>ACTOK(a)),3);
  const ORD = [O('الأَوَّلِ','first',{nom:'الأَوَّلُ'}),O('الثَّانِي','second',{nom:'الثَّانِي'}),O('الأَخِيرِ','last',{nom:'الأَخِيرُ'})];
  d.para();
  d.s(`فِي اليَوْمِ الأَوَّلِ ${acts[0].ar}، وَفِي اليَوْمِ الثَّانِي ${acts[1].ar}، وَفِي اليَوْمِ الأَخِيرِ ${acts[2].ar}.`,
      `On the first day we ${acts[0].en}, on the second day we ${acts[1].en}, and on the last day we ${acts[2].en}.`,
      [['زُرْنَا','we visited'],['سَبَحْنَا','we swam'],['صَعِدْنَا','we climbed'],['اشْتَرَيْنَا','we bought'],['هَدَايَا','presents'],['رَكِبْنَا','we rode'],['المَتْحَفُ','the museum'],['مَشْهُورٌ','famous'],['الأَخِيرُ','the last']].filter(v=>acts.map(a=>a.ar).join(' ').includes(v[0].replace(/ُ$/,'').replace(/ٌ$/,''))||v[0]==='الأَخِيرُ'));
  const k = Math.floor(Math.random()*3);
  d.fact(`What did they do on the ${ORD[k].en} day?`, acts[k], ACT, v=>`On the ${ORD[k].en} day they ${v}.`);
  const best = Math.floor(Math.random()*3);
  d.s(`كَانَ اليَوْمُ ${ORD[best].nom} أَجْمَلَ يَوْمٍ فِي الرِّحْلَةِ.`, `The ${ORD[best].en} day was the best day of the trip.`, [['أَجْمَلُ','the most beautiful, the best']]);
  d.fact(`What did ${N} enjoy most on the trip?`, acts[best], acts.concat(ACT.filter(a=>!acts.includes(a)).slice(0,1)), v=>`What ${N} enjoyed most was when they ${v}.`, {why:1});

  const DISH = {Egypt:O('الكُشَرِيِّ','koshari'),Turkey:O('الكَبَابِ','kebab'),Morocco:O('الكُسْكُسِ','couscous'),Jordan:O('المَنْسَفِ','mansaf'),Malaysia:O('الأَرُزِّ بِجَوْزِ الهِنْدِ','coconut rice'),Spain:O('البَايِيَّا','paella')}[dest.en];
  const PEOPLE = [O('لُطَفَاءَ جِدًّا','very kind'),O('كُرَمَاءَ','generous'),O('مَشْغُولِينَ دَائِمًا','always busy')];
  const ppl = R(PEOPLE);
  d.s(`أَكَلْنَا هُنَاكَ طَعَامًا لَذِيذًا مِثْلَ ${DISH.ar}، وَكَانَ النَّاسُ ${ppl.ar}.`, `We ate delicious food there such as ${DISH.en}, and the people were ${ppl.en}.`, [['لَذِيذٌ','delicious'],['مِثْلَ','such as, like'],['النَّاسُ','the people'],['لُطَفَاءُ','kind (plural)'],['كُرَمَاءُ','generous (plural)'],['مَشْغُولٌ','busy']].filter(v=>!['لُطَفَاءُ','كُرَمَاءُ','مَشْغُولٌ'].includes(v[0])||ppl.ar.includes(v[0].slice(0,4))));
  d.fact(`What were the local people like?`, ppl, PEOPLE.concat([O('','rude')]), v=>`The people there were ${v}.`);
  d.fact(`Which dish does ${N} mention?`, DISH, [O('الكُشَرِيِّ','koshari'),O('الكَبَابِ','kebab'),O('الكُسْكُسِ','couscous'),O('المَنْسَفِ','mansaf'),O('البَايِيَّا','paella')].filter(x=>x.en!==DISH.en).slice(0,3).concat([DISH]), v=>`${N} mentions ${v}.`, {noAr:1});
  const GIFT = [O('سَاعَةً','a watch'),O('وِشَاحًا جَمِيلًا','a beautiful scarf'),O('كِتَابًا قَدِيمًا','an old book'),O('سَجَّادَةَ صَلَاةٍ','a prayer mat')];
  const FOR = [O('لِأُمِّي',`for ${his} mother`,{e1:'for my mother'}),O('لِجَدَّتِي',`for ${his} grandmother`,{e1:'for my grandmother'}),O('لِأَخِي',`for ${his} brother`,{e1:'for my brother'})];
  const gift = R(GIFT), forW = R(FOR);
  if(L==='h' || Math.random()<.5){
    d.s(`وَقَبْلَ أَنْ نَرْجِعَ اشْتَرَيْتُ ${gift.ar} ${forW.ar}.`, `And before we came back, I bought ${gift.en} ${forW.e1}.`, [['قَبْلَ أَنْ','before'],['اشْتَرَيْتُ','I bought'],['وِشَاحٌ','scarf'],['سَجَّادَةُ صَلَاةٍ','prayer mat']].filter(v=>!['وِشَاحٌ','سَجَّادَةُ صَلَاةٍ'].includes(v[0])||gift.ar.includes(v[0].slice(0,4))));
    d.fact(`What did ${N} buy ${forW.en}?`, gift, GIFT, v=>`${N} bought ${v} ${forW.en}.`);
  }

  // a problem
  const PROB = [O('تَأَخَّرَتِ الطَّائِرَةُ ثَلَاثَ سَاعَاتٍ','the plane was three hours late',{need:'plane',nm:'The plane was late.'}),O('ضَاعَتْ حَقِيبَتِي فِي المَطَارِ',`${his} bag got lost at the airport`,{need:'plane',e1:'my bag got lost at the airport',nm:`${N}'s bag got lost.`}),
                O('مَرِضْتُ يَوْمَيْنِ',`${he} was ill for two days`,{e1:'I was ill for two days',nm:`${N} was ill during the trip.`}),O('كَانَ الفُنْدُقُ وَسِخًا','the hotel was dirty',{need:'hotel',nm:'The hotel was dirty.'}),
                O('تَعَطَّلَتِ السَّيَّارَةُ فِي الطَّرِيقِ','the car broke down on the way',{need:'car',nm:'The car broke down.'})];
  const ok = p => !p.need || (p.need==='plane'&&how.en==='by plane') || (p.need==='car'&&how.en==='by car') || (p.need==='hotel'&&acc.hotel);
  const possible = PROB.filter(ok);
  if(L==='h' && Math.random()<.65){
    const p = R(possible);
    d.s(`لَكِنْ حَدَثَتْ مُشْكِلَةٌ: ${p.ar}.`, `But there was a problem: ${p.e1||p.en}.`, [['حَدَثَتْ مُشْكِلَةٌ','there was a problem'],['تَأَخَّرَتْ','it was late'],['ضَاعَتْ','it got lost'],['مَرِضْتُ','I was ill'],['وَسِخٌ','dirty'],['تَعَطَّلَتْ','it broke down']].filter(v=>v[0]==='حَدَثَتْ مُشْكِلَةٌ'||p.ar.includes(v[0].slice(0,4))));
    d.fact(`What problem was there on the trip?`, p, PROB, v=>`On the trip, ${v}.`);
    possible.filter(x=>x!==p&&x.nm).forEach(x=>d.nm.push(x.nm));
  } else possible.forEach(x=>d.nm.push(x.nm));

  const OP = [O(g('رَائِعَةً','رَائِعَةً'),'amazing'),O('مُمْتِعَةً','fun'),O('مُتْعِبَةً قَلِيلًا لَكِنَّهَا مُمْتِعَةٌ','a bit tiring but fun')];
  const op = R(OP);
  d.para();
  d.s(`كَانَتِ الرِّحْلَةُ ${op.ar}، وَفِي السَّنَةِ القَادِمَةِ أُرِيدُ أَنْ أُسَافِرَ إِلَى ${dest2.ar}.`, `The trip was ${op.en}, and next year I want to travel to ${dest2.en}.`, [['القَادِمَةُ','next, coming'],['أُرِيدُ أَنْ','I want to'],['رَائِعٌ','amazing']]);
  d.fact(`How does ${N} describe the trip?`, op, OP.concat([O('','boring')]), v=>`${N} says the trip was ${v}.`);
  d.fact(`Where does ${N} want to go next year?`, dest2, DEST.filter(x=>x!==dest), v=>`Next year ${N} wants to go to ${v}.`);
  d.nm.push(`They took lots of photos.`, `The tickets were very expensive.`, `${N} learnt some of the local language.`, `${N}'s mother cooked every day.`);
  return d;
}

// ---------------------------------------------------------------- questions
function questions(d, L){
  const qs = [];
  const facts = shuffle(d.facts.filter(f=>f.q));
  const mcOf = f => {
    const others = shuffle(f.pool.filter(p=>p.en!==f.ans.en)).filter((p,i,a)=>a.findIndex(x=>x.en===p.en)===i).slice(0,3);
    return {type:'mc', q:f.q, opts:shuffle([f.ans.en,...others.map(o=>o.en)]), ans:f.ans.en};
  };
  const nQ = L==='h' ? 10 : 7;
  // why / inference questions first at Higher
  const why = facts.filter(f=>f.why), plain = facts.filter(f=>!f.why);
  const nWhy = L==='h' ? Math.min(3, why.length) : Math.min(1, why.length);
  why.slice(0,nWhy).forEach(f=>qs.push(mcOf(f)));
  // true / false / not mentioned
  const nTF = L==='h' ? 3 : 2;
  const stFacts = plain.filter(f=>f.st);
  const tfReady = d.facts.filter(f=>f.tf);
  const tfs = [];
  if(stFacts.length){ const f = stFacts.shift(); tfs.push({type:'tf', q:f.st(f.ans.en), opts:['True','False','Not mentioned'], ans:'True'}); plain.splice(plain.indexOf(f),1); }
  if(stFacts.length){ const f = stFacts.shift(); const wrong = R(f.pool.filter(p=>p.en!==f.ans.en)); tfs.push({type:'tf', q:f.st(wrong.en), opts:['True','False','Not mentioned'], ans:'False'}); plain.splice(plain.indexOf(f),1); }
  if(tfReady.length && Math.random()<.6){ const t=R(tfReady), right=Math.random()<.5; tfs[right?0:1]={type:'tf', q:t.tf[right?0:1], opts:['True','False','Not mentioned'], ans:right?'True':'False'}; }
  if(L==='h' && d.nm.length) tfs.push({type:'tf', q:R(d.nm), opts:['True','False','Not mentioned'], ans:'Not mentioned'});
  else if(d.nm.length && Math.random()<.5) tfs[1]={type:'tf', q:R(d.nm), opts:['True','False','Not mentioned'], ans:'Not mentioned'};
  // find the Arabic
  const arF = plain.filter(f=>!f.noAr && f.ans.ar && f.ans.ar.length<40 && f.pool.filter(p=>p.ar&&p.en!==f.ans.en).length>=2 && d.paras.flat().some(s=>s.ar.includes(f.ans.ar)));
  const findAr = [];
  if(arF.length){ const f = R(arF); plain.splice(plain.indexOf(f),1);
    const others = shuffle(f.pool.filter(p=>p.ar&&p.en!==f.ans.en&&p.ar!==f.ans.ar)).filter((p,i,a)=>a.findIndex(x=>x.ar===p.ar)===i).slice(0,3);
    findAr.push({type:'ar', q:`Find the Arabic in the text that means “${f.ans.en}”.`, opts:shuffle([f.ans.ar,...others.map(o=>o.ar)]), ans:f.ans.ar}); }
  plain.forEach(f=>{ if(qs.length + tfs.slice(0,nTF+(L==='h'?1:0)).length + findAr.length < nQ) qs.push(mcOf(f)); });
  // keep questions roughly in passage order: mc first, then true/false, then find-the-Arabic
  return [...qs, ...tfs.filter(Boolean), ...findAr];
}

const FRAMES = {day:myDay, family:myFamily, trip:myTrip};
function makeComprehension(o={}){
  const level = o.level==='h' ? 'h' : 'f';
  const topic = FRAMES[o.topic] ? o.topic : R(Object.keys(FRAMES));
  const g = Math.random()<.5 ? 'm' : 'f';
  const P = {g, name:R(NAMES[g]), he:g==='m'?'he':'she', his:g==='m'?'his':'her'};
  P.g = g;
  const gfn = (m,f)=>g==='m'?m:f;
  P.sex = g;
  const d = FRAMES[topic]({...P, g:gfn}, level);
  d.paras = d.paras.filter(p=>p.length);
  const vocab = []; const seen = new Set();
  d.vocab.forEach(([a,e])=>{ if(!seen.has(a)){ seen.add(a); vocab.push([a,e]); } });
  return {topic, title:d.title, paras:d.paras, vocab, qs:questions(d, level), words:d.paras.flat().map(s=>s.ar).join(' ').split(/\s+/).length};
}
window.makeComprehension = makeComprehension;
})();
