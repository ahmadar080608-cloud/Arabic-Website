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


// ---------------------------------------------------------------- My school (present)
function mySchool(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('مَدْرَسَتِي', `${N}'s school`);
  const SCH = [O('مَدْرَسَةٍ إِسْلَامِيَّةٍ','an Islamic school'),O('مَدْرَسَةٍ ثَانَوِيَّةٍ','a secondary school'),O('مَدْرَسَةٍ كَبِيرَةٍ','a big school')];
  const sch = R(SCH), near = Math.random()<.5;
  d.s(`اسْمِي ${P.name.ar}، وَأَنَا ${g('طَالِبٌ','طَالِبَةٌ')} فِي ${sch.ar}. مَدْرَسَتِي ${near?'قَرِيبَةٌ مِنْ بَيْتِي، لِذَلِكَ أَذْهَبُ إِلَيْهَا مَشْيًا':'بَعِيدَةٌ عَنْ بَيْتِي، لِذَلِكَ أَذْهَبُ إِلَيْهَا بِالحَافِلَةِ'}.`,
      `My name is ${N}, and I am a pupil at ${sch.en}. My school is ${near?'near my house, so I walk there':'far from my house, so I go there by bus'}.`, [['ثَانَوِيَّةٌ','secondary'],['قَرِيبَةٌ مِنْ','near to'],['بَعِيدَةٌ عَنْ','far from'],['لِذَلِكَ','so, therefore']]);
  d.fact(`What kind of school does ${N} go to?`, sch, SCH, v=>`${N} goes to ${v}.`);
  d.fact(`How does ${N} get to school?`, near?O('مَشْيًا','on foot'):O('بِالحَافِلَةِ','by bus'), [O('مَشْيًا','on foot'),O('بِالحَافِلَةِ','by bus'),O('بِالسَّيَّارَةِ','by car'),O('بِالدَّرَّاجَةِ','by bike')], v=>`${N} gets to school ${v}.`);
  d.fact(`Why does ${N} go to school ${near?'on foot':'by bus'}?`, O('',near?'because it is near home':'because it is far from home'), [O('','because it is near home'),O('','because it is far from home'),O('','because the bus is free'),O('','because '+he+' likes exercise')], null, {why:1});
  const FAC = [O('مَلْعَبٌ كَبِيرٌ','a big sports field'),O('مَكْتَبَةٌ جَمِيلَةٌ','a beautiful library',{lib:1}),O('مُخْتَبَرٌ حَدِيثٌ','a modern science lab'),O('مُصَلًّى','a prayer room',{pr:1}),O('مَقْصَفٌ','a canteen'),O('مَسْبَحٌ','a swimming pool')];
  const [f1,f2,f3] = pickN(FAC,3);
  d.para();
  d.s(`فِي مَدْرَسَتِي ${f1.ar} وَ${f2.ar}، لَكِنْ لَيْسَ فِيهَا ${f3.ar}.`, `In my school there is ${f1.en} and ${f2.en}, but there is no ${f3.en.replace(/^an? /,'')}.`, [['مَلْعَبٌ','sports field, pitch'],['مَكْتَبَةٌ','library'],['مُخْتَبَرٌ','laboratory'],['حَدِيثٌ','modern'],['مُصَلًّى','prayer room'],['مَقْصَفٌ','canteen'],['مَسْبَحٌ','swimming pool']].filter(v=>[f1,f2,f3].some(f=>f.ar.startsWith(v[0].slice(0,4)))));
  d.fact(null,null,null,null,{tf:[`${N}'s school has ${f1.en}.`, `${N}'s school has ${f3.en}.`]});
  d.fact(`What does ${N}'s school NOT have?`, f3, FAC, null, {why:1, noAr:1});
  const ST = [O('الثَّامِنَةِ','8 o’clock'),O('التَّاسِعَةِ','9 o’clock')], EN = [O('الثَّالِثَةِ','3 o’clock'),O('الرَّابِعَةِ','4 o’clock')];
  const st = R(ST), en = R(EN);
  const NL = [O('خَمْسَةُ دُرُوسٍ','five lessons'),O('سِتَّةُ دُرُوسٍ','six lessons'),O('سَبْعَةُ دُرُوسٍ','seven lessons')], nl = R(NL);
  d.s(`يَبْدَأُ اليَوْمُ الدِّرَاسِيُّ فِي السَّاعَةِ ${st.ar}، وَيَنْتَهِي فِي السَّاعَةِ ${en.ar}، وَعِنْدَنَا ${nl.ar} كُلَّ يَوْمٍ.`,
      `The school day starts at ${st.en} and finishes at ${en.en}, and we have ${nl.en} every day.`, [['يَبْدَأُ','it starts'],['يَنْتَهِي','it finishes'],['الدِّرَاسِيُّ','school (adj.)']]);
  d.fact(`What time does the school day start?`, st, [...ST,O('','7 o’clock'),O('','10 o’clock')], v=>`School starts at ${v}.`);
  d.fact(`What time does school finish?`, en, [...EN,O('','2 o’clock'),O('','5 o’clock')], v=>`School finishes at ${v}.`);
  d.fact(`How many lessons does ${N} have each day?`, nl, NL.concat([O('','four lessons')]), v=>`${N} has ${v} every day.`);
  const tm = Math.random()<.5;
  const SUB = [O('الرِّيَاضِيَّاتِ','maths'),O('العُلُومَ','science'),O('التَّارِيخَ','history'),O('اللُّغَةَ العَرَبِيَّةَ','Arabic'),O('الجُغْرَافِيَا','geography')];
  const TA = tm ? [O('صَبُورٌ','patient'),O('لَطِيفٌ','kind'),O('مُضْحِكٌ','funny')] : [O('صَبُورَةٌ','patient'),O('لَطِيفَةٌ','kind'),O('مُضْحِكَةٌ','funny')];
  const sub = R(SUB), ta = R(TA);
  let tn; do tn = R(NAMES[tm?'m':'f']); while(tn.en===N);
  d.para();
  d.s(tm ? `مُدَرِّسِي المُفَضَّلُ هُوَ الأُسْتَاذُ ${tn.ar}، يُدَرِّسُنَا ${sub.ar}، وَهُوَ ${ta.ar} جِدًّا.` : `مُدَرِّسَتِي المُفَضَّلَةُ هِيَ الأُسْتَاذَةُ ${tn.ar}، تُدَرِّسُنَا ${sub.ar}، وَهِيَ ${ta.ar} جِدًّا.`,
      `My favourite teacher is ${tm?'Mr':'Ms'} ${tn.en}; ${tm?'he':'she'} teaches us ${sub.en}, and ${tm?'he':'she'} is very ${ta.en}.`, [['المُفَضَّلُ','favourite'],['الأُسْتَاذُ','teacher, Mr'],['يُدَرِّسُنَا','he teaches us'],['صَبُورٌ','patient']].filter(v=>v[0]!=='صَبُورٌ'||ta.en==='patient'));
  d.fact(`What does ${N}'s favourite teacher teach?`, sub, SUB, v=>`${N}'s favourite teacher teaches ${v}.`);
  d.fact(`What is ${N}'s favourite teacher like?`, ta, TA.concat([O('','strict')]), v=>`${N}'s favourite teacher is ${v}.`);
  const RULE = [O('بِاسْتِخْدَامِ الهَاتِفِ فِي الفَصْلِ','use their phones in class',{e1:'use our phones in class'}),O('بِالأَكْلِ فِي الفَصْلِ','eat in class'),O('بِالرَّكْضِ فِي المَمَرَّاتِ','run in the corridors')];
  const rule = R(RULE), fair = Math.random()<.5;
  if(L==='h' || Math.random()<.5){
    d.s(`فِي مَدْرَسَتِنَا قَوَانِينُ كَثِيرَةٌ: يَجِبُ عَلَيْنَا أَنْ نَلْبَسَ الزِّيَّ المَدْرَسِيَّ، وَلَا يُسْمَحُ لَنَا ${rule.ar}. ${fair?'أَرَى أَنَّ هَذِهِ القَوَانِينَ عَادِلَةٌ.':'أَرَى أَنَّ بَعْضَ هَذِهِ القَوَانِينِ غَيْرُ عَادِلَةٍ.'}`,
        `Our school has many rules: we must wear school uniform, and we are not allowed to ${rule.e1||rule.en}. ${fair?'I think these rules are fair.':'I think some of these rules are unfair.'}`, [['قَوَانِينُ','rules'],['يَجِبُ عَلَيْنَا','we must'],['الزِّيُّ المَدْرَسِيُّ','school uniform'],['لَا يُسْمَحُ لَنَا','we are not allowed'],['عَادِلَةٌ','fair'],['غَيْرُ','not, un-']]);
    d.fact(`What are pupils not allowed to do?`, rule, RULE.concat([O('','speak Arabic')]), v=>`Pupils are not allowed to ${v}.`);
    d.fact(`What does ${N} think of the school rules?`, O('',fair?'they are fair':'some of them are unfair'), [O('','they are fair'),O('','some of them are unfair'),O('','they are too easy'),O('','there are not enough rules')], null, {why:1});
    d.fact(null,null,null,null,{tf:[`Pupils have to wear a uniform.`, `Pupils can wear whatever they like.`]});
  }
  const BRK = [O('أَلْعَبُ كُرَةَ القَدَمِ مَعَ أَصْدِقَائِي',`plays football with ${his} friends`,{e1:'I play football with my friends'}),O('آكُلُ شَطِيرَةً وَأَتَحَدَّثُ مَعَ أَصْدِقَائِي',`eats a sandwich and chats with ${his} friends`,{e1:'I eat a sandwich and chat with my friends'})];
  if([f1,f2].some(f=>f.lib)) BRK.push(O('أَجْلِسُ فِي المَكْتَبَةِ وَأَقْرَأُ',`sits in the library and reads`,{e1:'I sit in the library and read'}));
  if([f1,f2].some(f=>f.pr)) BRK.push(O('أُصَلِّي الظُّهْرَ فِي المُصَلَّى',`prays Ẓuhr in the prayer room`,{e1:'I pray Ẓuhr in the prayer room'}));
  const brk = R(BRK);
  d.s(`فِي الاسْتِرَاحَةِ ${brk.ar}.`, `At break time ${brk.e1}.`, [['الاسْتِرَاحَةُ','break time'],['شَطِيرَةٌ','sandwich'],['أَتَحَدَّثُ','I talk, I chat']].filter(v=>v[0]==='الاسْتِرَاحَةُ'||brk.ar.includes(v[0].slice(0,4))));
  d.fact(`What does ${N} do at break time?`, brk, BRK.concat([O('','does homework'),O('','phones home')]), v=>`At break time ${N} ${v}.`);
  const FUT = [[O('الطِّبَّ','medicine'),g('طَبِيبًا','طَبِيبَةً'),'a doctor'],[O('طِبَّ الأَسْنَانِ','dentistry'),g('طَبِيبَ أَسْنَانٍ','طَبِيبَةَ أَسْنَانٍ'),'a dentist'],[O('الهَنْدَسَةَ','engineering'),g('مُهَنْدِسًا','مُهَنْدِسَةً'),'an engineer'],[O('الشَّرِيعَةَ','Islamic studies'),g('عَالِمًا','عَالِمَةً'),'a scholar'],[O('القَانُونَ','law'),g('مُحَامِيًا','مُحَامِيَةً'),'a lawyer']];
  const fu = R(FUT);
  d.para();
  d.s(`بَعْدَ المَدْرَسَةِ أُرِيدُ أَنْ أَدْرُسَ ${fu[0].ar} فِي الجَامِعَةِ، لِأَنِّي أُرِيدُ أَنْ أُصْبِحَ ${fu[1]}.`, `After school I want to study ${fu[0].en} at university, because I want to become ${fu[2]}.`, [['أُصْبِحَ','(that) I become'],['عَالِمٌ','scholar'],['مُحَامٍ','lawyer']].filter(v=>v[0]==='أُصْبِحَ'||fu[1].startsWith(v[0].slice(0,4))));
  d.fact(`What does ${N} want to study at university?`, fu[0], FUT.map(f=>f[0]), v=>`${N} wants to study ${v}.`);
  d.fact(`What job does ${N} want in the future?`, O('',fu[2]), FUT.map(f=>O('',f[2])), v=>`${N} wants to become ${v}.`);
  d.nm = [`${N} is in Year 10.`,`${N}'s best friend is called Ali.`,`${N} gets a lot of homework.`,`${N}'s school has a football team.`,`${N} is the best pupil in the class.`];
  return d;
}

// ---------------------------------------------------------------- At the market (past)
function myMarket(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('يَوْمٌ فِي السُّوقِ', `${N}'s day at the market`);
  const DAY = [O('السَّبْتِ','Saturday'),O('الأَحَدِ','Sunday'),O('الخَمِيسِ','Thursday')];
  const PL = [O('السُّوقِ','the market'),O('المَرْكَزِ التِّجَارِيِّ','the shopping centre')];
  const COMP = [O('أُمِّي','my mother',{e3:`${his} mother`}),O('أَبِي','my father',{e3:`${his} father`}),O('أُخْتِي الكَبِيرَةِ','my older sister',{e3:`${his} older sister`}),O(g('صَدِيقِي','صَدِيقَتِي'),'my friend',{e3:`${his} friend`})];
  const WHY = [O('لِأَنَّ العِيدَ قَرِيبٌ','because Eid is coming'),O('لِأَنَّنَا نَحْتَاجُ طَعَامًا لِلْأُسْبُوعِ','because they needed food for the week',{e1:'because we needed food for the week'}),O('لِأَنَّ عِنْدَ ابْنِ عَمِّي حَفْلَةَ زَوَاجٍ',`because ${his} cousin is getting married`,{e1:'because my cousin is having a wedding'})];
  const day = R(DAY), pl = R(PL), comp = R(COMP), why = R(WHY);
  d.s(`يَوْمَ ${day.ar} المَاضِي ذَهَبْتُ مَعَ ${comp.ar} إِلَى ${pl.ar} ${why.ar}.`, `Last ${day.en} I went with ${comp.en} to ${pl.en} ${why.e1||why.en}.`, [['المَاضِي','last'],['المَرْكَزُ التِّجَارِيُّ','shopping centre'],['نَحْتَاجُ','we need'],['حَفْلَةُ زَوَاجٍ','wedding party'],['ابْنُ عَمِّي','my cousin']].filter(v=>v[0]==='المَاضِي'||(pl.ar+why.ar).includes(v[0].slice(0,5))));
  d.fact(`When did ${N} go shopping?`, O('','last '+day.en), DAY.map(x=>O('','last '+x.en)).concat([O('','last Friday')]), v=>`${N} went shopping ${v}.`);
  d.fact(`Who did ${N} go with?`, O(comp.ar,comp.e3), COMP.map(c=>O(c.ar,c.e3)), v=>`${N} went with ${v}.`);
  d.fact(`Why did they go shopping?`, why, WHY.concat([O('','because it was raining')]), null, {why:1});
  const ITEMS = P.sex==='m' ? [['قَمِيصًا','shirt','m'],['ثَوْبًا','thobe','m'],['حِذَاءً','pair of shoes','m'],['حَقِيبَةً','bag','f']] : [['حَقِيبَةً','bag','f'],['عَبَاءَةً','abaya','f'],['حِذَاءً','pair of shoes','m'],['وِشَاحًا','scarf','m']];
  const COL = [['أَبْيَضَ','بَيْضَاءَ','white'],['أَسْوَدَ','سَوْدَاءَ','black'],['أَزْرَقَ','زَرْقَاءَ','blue'],['أَحْمَرَ','حَمْرَاءَ','red']];
  const it = R(ITEMS), co = R(COL);
  const PRICE = [O('بِعِشْرِينَ جُنَيْهًا','for twenty pounds'),O('بِثَلَاثِينَ جُنَيْهًا','for thirty pounds'),O('بِأَرْبَعِينَ جُنَيْهًا','for forty pounds'),O('بِخَمْسِينَ جُنَيْهًا','for fifty pounds')];
  const pr = R(PRICE), expensive = pr.en.includes('forty')||pr.en.includes('fifty');
  const itemO = O(`${it[0]} ${it[2]==='m'?co[0]:co[1]}`, `a ${co[2]} ${it[1]}`);
  d.para();
  d.s(`اشْتَرَيْتُ ${itemO.ar} ${pr.ar}. كَانَ ${expensive?'غَالِيًا قَلِيلًا':'رَخِيصًا'}، لَكِنِّي ${g('سَعِيدٌ','سَعِيدَةٌ')} بِهِ.`,
      `I bought ${itemO.en} ${pr.en}. It was ${expensive?'a little expensive':'cheap'}, but I am happy with it.`, [['اشْتَرَيْتُ','I bought'],['جُنَيْهًا','pound(s)'],['غَالٍ','expensive'],['رَخِيصٌ','cheap']].filter(v=>v[0]!=='غَالٍ'||expensive).filter(v=>v[0]!=='رَخِيصٌ'||!expensive));
  d.fact(`What did ${N} buy for ${him(P)}self?`, itemO, ITEMS.flatMap(i=>[O(`${i[0]} ${i[2]==='m'?co[0]:co[1]}`,`a ${co[2]} ${i[1]}`)]).concat(COL.filter(c=>c!==co).slice(0,1).map(c=>O(`${it[0]} ${it[2]==='m'?c[0]:c[1]}`,`a ${c[2]} ${it[1]}`))), v=>`${N} bought ${v}.`);
  d.fact(`How much did it cost?`, pr, PRICE, v=>`It cost ${v.replace('for ','')}.`);
  d.fact(`What did ${N} think of the price?`, O('',expensive?'a little expensive':'cheap'), [O('','a little expensive'),O('','cheap'),O('','far too expensive'),O('','free')], null, {why:1});
  const FR = [O('التُّفَّاحَ','apples'),O('المَوْزَ','bananas'),O('العِنَبَ','grapes'),O('البِطِّيخَ','watermelon'),O('البُرْتُقَالَ','oranges')];
  const VG = [O('الطَّمَاطِمَ','tomatoes'),O('البَطَاطِسَ','potatoes'),O('الجَزَرَ','carrots'),O('البَصَلَ','onions')];
  const fr = R(FR), vg = R(VG);
  d.s(`ثُمَّ اشْتَرَيْنَا ${fr.ar} مِنْ بَائِعِ الفَوَاكِهِ، وَ${vg.ar} مِنْ بَائِعِ الخُضَارِ.`, `Then we bought ${fr.en} from the fruit seller, and ${vg.en} from the vegetable seller.`, [['بَائِعٌ','seller'],['الفَوَاكِهُ','fruit'],['الخُضَارُ','vegetables']]);
  d.fact(`What fruit did they buy?`, fr, FR, v=>`They bought ${v}.`);
  d.fact(`What vegetables did they buy?`, vg, VG, v=>`They bought ${v}.`);
  const GF = [O('عِطْرًا','some perfume'),O('كِتَابًا','a book'),O('سَاعَةً','a watch')], FW = [O('لِأُمِّي',`for ${his} mother`,{e1:'for my mother'}),O('لِأَبِي',`for ${his} father`,{e1:'for my father'}),O('لِجَدَّتِي',`for ${his} grandmother`,{e1:'for my grandmother'})];
  const gf = R(GF), fw = R(FW.filter(f=>!comp.ar.includes(f.ar.slice(2))));
  d.s(`وَاشْتَرَيْتُ أَيْضًا ${gf.ar} ${fw.ar} هَدِيَّةً.`, `I also bought ${gf.en} ${fw.e1} as a present.`, [['أَيْضًا','also'],['هَدِيَّةٌ','present, gift'],['عِطْرٌ','perfume']].filter(v=>v[0]!=='عِطْرٌ'||gf.ar.startsWith('عِطْر')));
  d.fact(`What present did ${N} buy ${fw.en}?`, gf, GF.concat([O('','some sweets')]), v=>`${N} bought ${v} ${fw.en}.`);
  const ok = Math.random()<.5;
  if(L==='h' || Math.random()<.5){
    d.s(`حَاوَلْتُ أَنْ أُخَفِّضَ السِّعْرَ، ${ok?'وَوَافَقَ البَائِعُ!':'لَكِنَّ البَائِعَ رَفَضَ.'}`, `I tried to bring the price down, ${ok?'and the seller agreed!':'but the seller refused.'}`, [['حَاوَلْتُ','I tried'],['أُخَفِّضَ','(that) I lower'],['السِّعْرُ','the price'],['وَافَقَ','he agreed'],['رَفَضَ','he refused']].filter(v=>!['وَافَقَ','رَفَضَ'].includes(v[0])||(ok?v[0]==='وَافَقَ':v[0]==='رَفَضَ')));
    d.fact(null,null,null,null,{tf:[ok?`The seller agreed to lower the price.`:`The seller refused to lower the price.`, ok?`The seller refused to lower the price.`:`The seller agreed to lower the price.`]});
  }
  const LU = [O('الشَّاوَرْمَا','shawarma'),O('الفَلَافِلَ','falafel'),O('البِيتْزَا','pizza'),O('السَّمَكَ','fish')];
  const BACK = [O('بِالحَافِلَةِ','by bus'),O('بِالسَّيَّارَةِ','by car'),O('مَشْيًا','on foot')];
  const FEEL = [O(g('مُتْعَبًا','مُتْعَبَةً'),'tired'),O(g('سَعِيدًا','سَعِيدَةً'),'happy'),O(g('جَائِعًا','جَائِعَةً'),'hungry')];
  const lu = R(LU), bk = R(BACK), fe = R(FEEL.slice(0,2));
  d.para();
  d.s(`بَعْدَ ذَلِكَ أَكَلْنَا ${lu.ar} فِي مَطْعَمٍ صَغِيرٍ، ثُمَّ رَجَعْنَا إِلَى البَيْتِ ${bk.ar}، وَكُنْتُ ${fe.ar} جِدًّا.`, `After that we ate ${lu.en} in a small restaurant, then we went back home ${bk.en}, and I was very ${fe.en}.`, [['رَجَعْنَا','we went back'],['مُتْعَبٌ','tired']].filter(v=>v[0]==='رَجَعْنَا'||fe.en==='tired'));
  d.fact(`What did they eat?`, lu, LU, v=>`They ate ${v}.`);
  d.fact(`How did they get home?`, bk, BACK.concat([O('','by train')]), v=>`They went home ${v}.`);
  d.fact(`How did ${N} feel at the end of the day?`, fe, FEEL.concat([O('','bored')]), v=>`At the end of the day ${N} felt ${v}.`);
  d.nm = [`${N} paid by card.`,`The market was very crowded.`,`${N} met a friend at the market.`,`It was raining.`,`${N} lost ${his} wallet.`];
  return d;
}
const him = P => P.he==='he'?'him':'her';

// ---------------------------------------------------------------- Ramadan and Eid (present)
function myRamadan(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('رَمَضَانُ وَالعِيدُ', `Ramadan and Eid for ${N}`);
  const WHY = [O('لِأَنَّ الأُسْرَةَ تَجْتَمِعُ عَلَى الإِفْطَارِ كُلَّ يَوْمٍ','because the family gets together for iftar every day'),O('لِأَنَّ المَسَاجِدَ تَكُونُ مُمْتَلِئَةً بِالنَّاسِ','because the mosques are full of people'),O('لِأَنِّي أَقْرَأُ القُرْآنَ أَكْثَرَ',`because ${he} reads more Qur’an`,{e1:'because I read more Qur’an'})];
  const why = R(WHY);
  d.s(`اسْمِي ${P.name.ar}، وَأُحِبُّ شَهْرَ رَمَضَانَ كَثِيرًا ${why.ar}.`, `My name is ${N}, and I love the month of Ramadan ${why.e1||why.en}.`, [['شَهْرٌ','month'],['تَجْتَمِعُ','it gathers'],['الإِفْطَارُ','iftar, breaking the fast'],['مُمْتَلِئَةٌ','full'],['أَكْثَرَ','more']].filter(v=>v[0]==='شَهْرٌ'||why.ar.includes(v[0].slice(0,4))));
  d.fact(`Why does ${N} love Ramadan?`, why, WHY.concat([O('','because there is no school')]), null, {why:1});
  const SF = [O('التَّمْرَ','dates'),O('الشُّوفَانَ','porridge'),O('البَيْضَ','eggs'),O('الخُبْزَ وَالجُبْنَ','bread and cheese')];
  const sf = R(SF);
  const FEEL = [O('بِالعَطَشِ','thirsty'),O('بِالتَّعَبِ','tired'),O('بِالجُوعِ','hungry')], fe = R(FEEL);
  d.para();
  d.s(`أَسْتَيْقِظُ قَبْلَ الفَجْرِ لِلسُّحُورِ، وَعَادَةً آكُلُ ${sf.ar} وَأَشْرَبُ مَاءً كَثِيرًا. فِي النَّهَارِ أَذْهَبُ إِلَى المَدْرَسَةِ كَالعَادَةِ، لَكِنِّي أَشْعُرُ ${fe.ar} أَحْيَانًا.`,
      `I wake up before Fajr for suhoor, and I usually eat ${sf.en} and drink lots of water. In the daytime I go to school as usual, but I sometimes feel ${fe.en}.`, [['السُّحُورُ','suhoor (pre-dawn meal)'],['النَّهَارُ','daytime'],['كَالعَادَةِ','as usual'],['أَشْعُرُ بِـ','I feel'],['العَطَشُ','thirst'],['التَّعَبُ','tiredness'],['الجُوعُ','hunger']].filter(v=>!['العَطَشُ','التَّعَبُ','الجُوعُ'].includes(v[0])||fe.ar.includes(v[0].slice(2,5))));
  d.fact(`What does ${N} usually eat for suhoor?`, sf, SF, v=>`${N} usually eats ${v} for suhoor.`);
  d.fact(`How does ${N} sometimes feel during the day?`, fe, FEEL.concat([O('','bored')]), v=>`${N} sometimes feels ${v} during the day.`);
  const DISH = [O('الشَّوْرَبَةَ وَالسَّمْبُوسَةَ','soup and samosas'),O('الأَرُزَّ وَاللَّحْمَ','rice and meat'),O('الدَّجَاجَ مَعَ الخُضَارِ','chicken with vegetables')];
  const COOK = [O('أُمِّي تَطْبُخُ','my mother cooks',{e3:`${his} mother`}),O('جَدَّتِي تَطْبُخُ','my grandmother cooks',{e3:`${his} grandmother`}),O('أَبِي يَطْبُخُ','my father cooks',{e3:`${his} father`})];
  const di = R(DISH), ck = R(COOK);
  d.s(`عِنْدَ المَغْرِبِ نُفْطِرُ عَلَى التَّمْرِ وَالمَاءِ، ثُمَّ نُصَلِّي، وَبَعْدَ ذَلِكَ نَأْكُلُ ${di.ar}. ${ck.ar} الطَّعَامَ كُلَّ يَوْمٍ.`,
      `At Maghrib we break our fast with dates and water, then we pray, and after that we eat ${di.en}. ${cap(ck.en)} the food every day.`, [['نُفْطِرُ','we break our fast'],['المَغْرِبُ','sunset, Maghrib'],['السَّمْبُوسَةُ','samosas'],['اللَّحْمُ','meat']].filter(v=>!['السَّمْبُوسَةُ','اللَّحْمُ'].includes(v[0])||di.ar.includes(v[0].slice(2,6))));
  d.fact(`What does the family break their fast with?`, O('التَّمْرِ وَالمَاءِ','dates and water'), [O('التَّمْرِ وَالمَاءِ','dates and water'),O('','soup'),O('','milk and bread'),O('','fruit juice')], v=>`They break their fast with ${v}.`);
  d.fact(`Who cooks the food in Ramadan?`, O(ck.ar,ck.e3), COOK.map(c=>O(c.ar,c.e3)), v=>`In Ramadan, ${v} cooks the food.`);
  d.fact(`What do they eat after praying Maghrib?`, di, DISH, null);
  const TW = [O('مَعَ أَبِي','with my father',{e3:`with ${his} father`}),O('مَعَ أَصْدِقَائِي','with my friends',{e3:`with ${his} friends`}),O('مَعَ أُسْرَتِي','with my family',{e3:`with ${his} family`})];
  const GOOD = [O('أَتَصَدَّقَ كُلَّ يَوْمٍ','give charity every day'),O('أَخْتِمَ القُرْآنَ','finish reading the whole Qur’an'),O('أُكْثِرَ مِنَ الدُّعَاءِ','make a lot of duʿāʾ')];
  const tw = R(TW), gd = R(GOOD);
  d.para();
  d.s(`فِي اللَّيْلِ أَذْهَبُ إِلَى المَسْجِدِ ${tw.ar} لِصَلَاةِ التَّرَاوِيحِ، وَفِي العَشْرِ الأَوَاخِرِ أُحَاوِلُ أَنْ ${gd.ar}.`,
      `At night I go to the mosque ${tw.en} for Tarāwīḥ prayer, and in the last ten nights I try to ${gd.en}.`, [['التَّرَاوِيحُ','Tarāwīḥ (night prayer in Ramadan)'],['العَشْرُ الأَوَاخِرُ','the last ten (nights)'],['أُحَاوِلُ','I try'],['أَتَصَدَّقَ','(that) I give charity'],['أَخْتِمَ','(that) I finish'],['الدُّعَاءُ','supplication, duʿāʾ']].filter(v=>!['أَتَصَدَّقَ','أَخْتِمَ','الدُّعَاءُ'].includes(v[0])||gd.ar.includes(v[0].slice(0,4))));
  d.fact(`Who does ${N} go to Tarāwīḥ with?`, O(tw.ar,tw.e3), TW.map(t=>O(t.ar,t.e3)).concat([O('','on '+his+' own')]), v=>`${N} goes to Tarāwīḥ ${v}.`);
  d.fact(`What does ${N} try to do in the last ten nights?`, gd, GOOD.concat([O('','sleep early')]), v=>`In the last ten nights ${N} tries to ${v}.`);
  const EP = [O('فِي المَسْجِدِ','at the mosque'),O('فِي الحَدِيقَةِ العَامَّةِ','in the park')];
  const EA = [O('نَزُورُ الأَقَارِبَ','visit relatives'),O('نَأْكُلُ الحَلْوَى','eat sweets'),O('يُعْطِينَا الكِبَارُ العِيدِيَّةَ','the adults give us Eid money')];
  const ep = R(EP), ea = R(EA);
  d.s(`وَفِي يَوْمِ العِيدِ نَلْبَسُ مَلَابِسَ جَدِيدَةً، وَنُصَلِّي صَلَاةَ العِيدِ ${ep.ar}، ثُمَّ ${ea.ar}. العِيدُ أَجْمَلُ يَوْمٍ فِي السَّنَةِ عِنْدِي.`,
      `On the day of Eid we wear new clothes and pray the Eid prayer ${ep.en}, then ${ea.en.startsWith('the')?ea.en:'we '+ea.en}. Eid is the best day of the year for me.`, [['العِيدُ','Eid'],['نَلْبَسُ','we wear'],['مَلَابِسُ','clothes'],['الأَقَارِبُ','relatives'],['الحَلْوَى','sweets'],['الكِبَارُ','the adults'],['العِيدِيَّةُ','Eid money']].filter(v=>!['الأَقَارِبُ','الحَلْوَى','الكِبَارُ','العِيدِيَّةُ'].includes(v[0])||ea.ar.includes(v[0].slice(2,6))));
  d.fact(`Where do they pray the Eid prayer?`, ep, EP.concat([O('','at home'),O('','at school')]), v=>`They pray the Eid prayer ${v}.`);
  d.fact(null,null,null,null,{tf:[`The family wears new clothes on Eid.`, `The family wears old clothes on Eid.`]});
  d.nm = [`${N} fasts the six days of Shawwāl.`,`${N} goes for ʿUmrah in Ramadan.`,`The family invites the neighbours to iftar.`,`${N} finds fasting easy.`,`${N} gets new shoes for Eid.`];
  return d;
}

// ---------------------------------------------------------------- A visit to the doctor (past)
function myDoctor(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('عِنْدَ الطَّبِيبِ', `${N} at the doctor’s`);
  const DAY = [O('الاثْنَيْنِ','Monday'),O('الثُّلَاثَاءِ','Tuesday'),O('الأَرْبِعَاءِ','Wednesday')];
  const SYM = [O('صُدَاعٌ','a headache'),O('أَلَمٌ فِي بَطْنِي','a stomach ache',{e3:'a stomach ache'}),O('حُمَّى','a fever'),O('سُعَالٌ','a cough'),O('أَلَمٌ فِي حَلْقِي','a sore throat')];
  const day = R(DAY), [s1,s2,s3] = pickN(SYM,3);
  d.s(`يَوْمَ ${day.ar} المَاضِي اسْتَيْقَظْتُ وَأَنَا ${g('مَرِيضٌ','مَرِيضَةٌ')}؛ كَانَ عِنْدِي ${s1.ar} وَ${s2.ar}.`, `Last ${day.en} I woke up ill; I had ${s1.en} and ${s2.en}.`, [['اسْتَيْقَظْتُ','I woke up'],['مَرِيضٌ','ill'],['كَانَ عِنْدِي','I had'],['صُدَاعٌ','headache'],['أَلَمٌ','pain'],['بَطْنٌ','stomach'],['حُمَّى','fever'],['سُعَالٌ','cough'],['حَلْقٌ','throat']].filter(v=>['اسْتَيْقَظْتُ','مَرِيضٌ','كَانَ عِنْدِي'].includes(v[0])||(s1.ar+s2.ar).includes(v[0].slice(0,3))));
  d.fact(`When did ${N} become ill?`, O('','last '+day.en), DAY.map(x=>O('','last '+x.en)).concat([O('','last Friday')]), null);
  d.fact(null,null,null,null,{tf:[`${N} had ${s1.en}.`, `${N} had a broken arm.`]});
  d.nm.push(`${N} had ${s3.en}.`);
  const WHO = [O('أُمِّي','my mother',{e3:`${his} mother`}),O('أَبِي','my father',{e3:`${his} father`}),O('أَخِي الكَبِيرِ','my older brother',{e3:`${his} older brother`})];
  const WAIT = [O('عِشْرِينَ دَقِيقَةً','twenty minutes'),O('نِصْفَ سَاعَةٍ','half an hour'),O('سَاعَةً كَامِلَةً','a whole hour')];
  const who = R(WHO), wt = R(WAIT), place = R([O('المَدْرَسَةِ','school'),O('العَمَلِ','work')]);
  d.s(`لَمْ أَذْهَبْ إِلَى ${place.ar}، بَلْ ذَهَبْتُ مَعَ ${who.ar} إِلَى العِيَادَةِ، وَانْتَظَرْنَا ${wt.ar} فِي غُرْفَةِ الانْتِظَارِ.`, `I did not go to ${place.en}; instead I went with ${who.en} to the clinic, and we waited ${wt.en} in the waiting room.`, [['بَلْ','rather, instead'],['العِيَادَةُ','the clinic'],['انْتَظَرْنَا','we waited'],['غُرْفَةُ الانْتِظَارِ','waiting room']]);
  d.fact(`Who took ${N} to the clinic?`, O(who.ar,who.e3), WHO.map(w=>O(w.ar,w.e3)), v=>`${N} went to the clinic with ${v}.`);
  d.fact(`How long did they wait?`, wt, WAIT.concat([O('','ten minutes')]), v=>`They waited ${v}.`);
  const DX = [O('زُكَامًا','a cold'),O('إِنْفِلْوَنْزَا','flu'),O('الْتِهَابًا فِي الحَلْقِ','a throat infection')];
  const ADV = [O('أَشْرَبَ مَاءً كَثِيرًا','drink lots of water'),O('أَرْتَاحَ فِي البَيْتِ ثَلَاثَةَ أَيَّامٍ','rest at home for three days'),O('آخُذَ الدَّوَاءَ مَرَّتَيْنِ فِي اليَوْمِ','take the medicine twice a day'),O('آكُلَ الحَلْوَى','not eat sweets',{neg:1})];
  const dx = R(DX), [a1,a2] = pickN(ADV,2);
  d.para();
  const an_ = a => (a.neg?'أَلَّا ':'أَنْ ')+a.ar;
  d.s(`فَحَصَنِي الطَّبِيبُ وَقَالَ إِنَّ عِنْدِي ${dx.ar}، وَنَصَحَنِي ${an_(a1)}، وَ${an_(a2)}.`, `The doctor examined me and said that I had ${dx.en}, and he advised me to ${a1.en} and ${a2.neg?'':'to '}${a2.en}.`, [['فَحَصَنِي','he examined me'],['قَالَ إِنَّ','he said that'],['زُكَامٌ','a cold'],['الْتِهَابٌ','infection, inflammation'],['نَصَحَنِي','he advised me'],['الدَّوَاءُ','medicine'],['مَرَّتَيْنِ','twice']].filter(v=>!['زُكَامٌ','الْتِهَابٌ','الدَّوَاءُ','مَرَّتَيْنِ'].includes(v[0])||(dx.ar+a1.ar+a2.ar).includes(v[0].replace(/^ال/,'').slice(0,3))));
  d.fact(`What did the doctor say ${N} had?`, dx, DX.concat([O('','an allergy')]), v=>`The doctor said ${N} had ${v}.`);
  d.fact(`What advice did the doctor give?`, a1, ADV.filter(a=>a!==a2).concat([O('','do lots of sport')]), v=>`The doctor told ${N} to ${v}.`, {why:1});
  const TASTE = [O('مُرًّا','bitter'),O('حُلْوًا','sweet')], ta = R(TASTE);
  const AFTER = [O('ثَلَاثَةِ أَيَّامٍ','three days'),O('أَرْبَعَةِ أَيَّامٍ','four days'),O('أُسْبُوعٍ','a week')], af = R(AFTER);
  d.s(`بَعْدَ ذَلِكَ ذَهَبْنَا إِلَى الصَّيْدَلِيَّةِ وَاشْتَرَيْنَا الدَّوَاءَ، وَكَانَ طَعْمُهُ ${ta.ar}.`,
      `After that we went to the pharmacy and bought the medicine; it tasted ${ta.en}.`, [['الصَّيْدَلِيَّةُ','the pharmacy'],['طَعْمُهُ','its taste'],['مُرٌّ','bitter'],['حُلْوٌ','sweet']].filter(v=>!['مُرٌّ','حُلْوٌ'].includes(v[0])||ta.ar.startsWith(v[0].slice(0,2))));
  d.para();
  const HOME = [O('بَقِيتُ فِي السَّرِيرِ وَشَرِبْتُ الشَّايَ بِالعَسَلِ',`stayed in bed and drank tea with honey`,{e1:'I stayed in bed and drank tea with honey'}),O('قَرَأْتُ كِتَابًا وَنِمْتُ كَثِيرًا',`read a book and slept a lot`,{e1:'I read a book and slept a lot'}),O('شَاهَدْتُ دُرُوسًا عَلَى الإِنْتَرْنِت',`watched lessons online`,{e1:'I watched lessons online'})];
  const hm = R(HOME), called = Math.random()<.5;
  if(L==='h' || Math.random()<.5){
    d.s(`فِي البَيْتِ ${hm.ar}${called?'، وَاتَّصَلَ بِي صَدِيقِي لِيَسْأَلَ عَنِّي':''}.`, `At home ${hm.e1}${called?', and my friend phoned to ask how I was':''}.`, [['بَقِيتُ','I stayed'],['السَّرِيرُ','bed'],['نِمْتُ','I slept'],['شَاهَدْتُ','I watched'],['اتَّصَلَ بِي','he phoned me'],['لِيَسْأَلَ عَنِّي','to ask about me']].filter(v=>(hm.ar+(called?'اتَّصَلَ لِيَسْأَلَ':'')).includes(v[0].replace(/^ال/,'').slice(0,4))));
    d.fact(`What did ${N} do at home?`, hm, HOME.concat([O('','played football')]), v=>`At home ${N} ${v}.`);
    if(called) d.fact(null,null,null,null,{tf:[`A friend phoned ${N}.`,`Nobody phoned ${N}.`]}); else d.nm.push(`A friend phoned ${N}.`);
  }
  d.s(`وَبَعْدَ ${af.ar} أَصْبَحْتُ أَحْسَنَ، وَرَجَعْتُ إِلَى ${place.ar}.`, `After ${af.en} I was better, and I went back to ${place.en}.`, [['أَصْبَحْتُ أَحْسَنَ','I got better']]);
  d.fact(`What did the medicine taste like?`, ta, TASTE.concat([O('','salty'),O('','it had no taste')]), v=>`The medicine tasted ${v}.`);
  d.fact(`How long was it before ${N} was better?`, af, AFTER.concat([O('','two weeks')]), v=>`${N} was better after ${v}.`);
  d.nm.push(`${N} had to go to hospital.`,`The medicine was free.`,`${N} caught the illness from a friend.`,`${N} missed an exam.`);
  return d;
}

// ---------------------------------------------------------------- Jumuʿah at the masjid (present)
function myJumuah(P, L){
  const d = Doc(P), g = P.g, N = P.name.en, he = P.he, his = P.his;
  d.title = O('يَوْمُ الجُمُعَةِ', `${N}'s Friday`);
  const WHO = [O('أَبِي','my father',{e3:`${his} father`}),O('أَخِي','my brother',{e3:`${his} brother`}),O('جَدِّي','my grandfather',{e3:`${his} grandfather`}),O('أُسْرَتِي','my family',{e3:`${his} family`})];
  const MOS = [O('مَسْجِدِ الحَيِّ','the local mosque'),O('المَسْجِدِ الكَبِيرِ فِي وَسَطِ المَدِينَةِ','the big mosque in the city centre')];
  const who = R(WHO), mos = R(MOS);
  d.s(`كُلَّ يَوْمِ جُمُعَةٍ أَذْهَبُ مَعَ ${who.ar} إِلَى ${mos.ar}.`, `Every Friday I go with ${who.en} to ${mos.en}.`, [['الحَيُّ','neighbourhood'],['وَسَطُ المَدِينَةِ','the city centre']].filter(v=>mos.ar.includes(v[0].slice(2,5))));
  d.fact(`Who does ${N} go to the mosque with?`, O(who.ar,who.e3), WHO.map(w=>O(w.ar,w.e3)), v=>`${N} goes to the mosque with ${v}.`);
  d.fact(`Which mosque do they go to?`, mos, MOS.concat([O('','the mosque at school')]), v=>`They go to ${v}.`);
  const CL = [O(g('ثَوْبًا أَبْيَضَ','عَبَاءَةً سَوْدَاءَ'), g('a white thobe','a black abaya')),O('مَلَابِسَ نَظِيفَةً','clean clothes')], cl = R(CL);
  const ARR = [O('مُبَكِّرًا','early'),O('قَبْلَ الأَذَانِ بِنِصْفِ سَاعَةٍ','half an hour before the adhān'),O('مُتَأَخِّرِينَ قَلِيلًا أَحْيَانًا','a little late sometimes')], ar = R(ARR);
  d.s(`قَبْلَ الصَّلَاةِ أَغْتَسِلُ وَأَلْبَسُ ${cl.ar} وَأَضَعُ العِطْرَ، وَنَصِلُ إِلَى المَسْجِدِ ${ar.ar}.`, `Before the prayer I have a bath (ghusl), put on ${cl.en} and wear perfume, and we arrive at the mosque ${ar.en}.`, [['أَغْتَسِلُ','I do ghusl, I bathe'],['أَلْبَسُ','I wear'],['أَضَعُ العِطْرَ','I put on perfume'],['نَصِلُ','we arrive'],['الأَذَانُ','the call to prayer'],['مُتَأَخِّرِينَ','late (plural)']].filter(v=>!['الأَذَانُ','مُتَأَخِّرِينَ'].includes(v[0])||ar.ar.includes(v[0].slice(2,6))));
  d.fact(`What does ${N} wear to the mosque?`, cl, CL.concat([O('','sports clothes'),O('','school uniform')]), v=>`${N} wears ${v} to the mosque.`);
  d.fact(`When do they arrive at the mosque?`, ar, ARR.concat([O('','after the khuṭbah')]), v=>`They arrive ${v}.`);
  if(L==='h' || Math.random()<.6) { d.s(`وَأَقْرَأُ سُورَةَ الكَهْفِ قَبْلَ الخُطْبَةِ.`, `And I read Sūrat al-Kahf before the khuṭbah.`, [['سُورَةُ الكَهْفِ','Sūrat al-Kahf'],['الخُطْبَةُ','the sermon, khuṭbah']]); d.fact(null,null,null,null,{tf:[`${N} reads Sūrat al-Kahf before the khuṭbah.`,`${N} reads Sūrat al-Baqarah before the khuṭbah.`]}); }
  const LANG = [O('بِالعَرَبِيَّةِ وَالإِنْجِلِيزِيَّةِ','in Arabic and English'),O('بِالعَرَبِيَّةِ فَقَطْ','in Arabic only')], la = R(LANG);
  const TOP = [O('بِرِّ الوَالِدَيْنِ','being good to parents'),O('الصِّدْقِ','honesty'),O('الصَّبْرِ','patience'),O('أَهَمِّيَّةِ الصَّلَاةِ','the importance of prayer')], tp = R(TOP);
  d.para();
  d.s(`يَخْطُبُ الإِمَامُ ${la.ar}، وَكَانَتِ الخُطْبَةُ الأُسْبُوعَ المَاضِيَ عَنْ ${tp.ar}.`, `The imam gives the khuṭbah ${la.en}, and last week the khuṭbah was about ${tp.en}.`, [['يَخْطُبُ','he gives a sermon'],['الخُطْبَةُ','the khuṭbah'],['فَقَطْ','only'],['بِرُّ الوَالِدَيْنِ','being good to parents'],['الصِّدْقُ','honesty'],['الصَّبْرُ','patience'],['أَهَمِّيَّةٌ','importance']].filter(v=>['يَخْطُبُ','الخُطْبَةُ'].includes(v[0])||(la.ar+tp.ar).includes(v[0].replace(/^ال/,'').slice(0,3))));
  d.fact(`What language is the khuṭbah in?`, la, LANG.concat([O('','in English only'),O('','in Urdu')]), v=>`The khuṭbah is ${v}.`);
  d.fact(`What was last week's khuṭbah about?`, tp, TOP, v=>`Last week's khuṭbah was about ${v}.`);
  const AF = [O('نُسَلِّمُ عَلَى أَصْدِقَائِنَا','say salām to our friends',{e3:'greet their friends'}),O('نَشْتَرِي الحَلْوَى مِنَ المَحَلِّ بِجَانِبِ المَسْجِدِ','buy sweets from the shop next to the mosque',{e3:'buy sweets from the shop next to the mosque'}),O('نَأْكُلُ الغَدَاءَ عِنْدَ جَدَّتِي','eat lunch at my grandmother’s house',{e3:`eat lunch at ${his} grandmother’s house`})];
  const af = R(AF);
  d.s(`بَعْدَ الصَّلَاةِ ${af.ar}.`, `After the prayer we ${af.en}.`, [['نُسَلِّمُ عَلَى','we greet'],['المَحَلُّ','the shop'],['بِجَانِبِ','next to']].filter(v=>af.ar.includes(v[0].slice(0,4))));
  d.fact(`What do they do after the prayer?`, O(af.ar,af.e3), AF.map(a=>O(a.ar,a.e3)).concat([O('','go to the park')]), v=>`After the prayer they ${v}.`, {noAr:1});
  const WHYJ = [O('لِأَنَّهُ عِيدُ المُسْلِمِينَ فِي كُلِّ أُسْبُوعٍ','because it is the Muslims’ weekly Eid'),O('لِأَنَّهُ يَوْمٌ مُبَارَكٌ','because it is a blessed day'),O('لِأَنِّي أَلْتَقِي فِيهِ بِأَصْدِقَائِي',`because ${he} meets ${his} friends then`,{e1:'because I meet my friends on it'})];
  const wj = R(WHYJ), crowd = L==='h' || Math.random()<.5;
  d.s(`${crowd?'يَكُونُ المَسْجِدُ مُزْدَحِمًا جِدًّا، لِذَلِكَ يُصَلِّي بَعْضُ النَّاسِ فِي الخَارِجِ. ':''}أُحِبُّ يَوْمَ الجُمُعَةِ كَثِيرًا ${wj.ar}.`, `${crowd?'The mosque is very crowded, so some people pray outside. ':''}I love Friday ${wj.e1||wj.en}.`, [['مُبَارَكٌ','blessed'],['أَلْتَقِي بِـ','I meet'],['بَعْضُ','some'],['الخَارِجُ','outside']].filter(v=>(wj.ar+(crowd?' بَعْضُ الخَارِجِ':'')).includes(v[0].replace(/^ال/,'').slice(0,3))));
  d.fact(`Why does ${N} love Friday?`, wj, WHYJ.concat([O('','because there is no school')]), null, {why:1});
  if(crowd) d.fact(null,null,null,null,{tf:[`Some people pray outside the mosque.`,`The mosque is always half empty.`]}); else d.nm.push(`Some people have to pray outside.`);
  d.nm.push(`The imam is from Egypt.`,`${N} gives charity every Friday.`,`There is a school at the mosque.`,`${N} gives the adhān.`);
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

const FRAMES = {day:myDay, family:myFamily, trip:myTrip, school:mySchool, market:myMarket, ramadan:myRamadan, doctor:myDoctor, jumuah:myJumuah};
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
