import json,re,sys
sys.path.insert(0,'.')
from bank import BANK
s=open('../cards.js').read();C=json.loads(s[len('window.CARDS='):].rstrip().rstrip(';'))
H=re.compile('[ً-ْٰـ]')
def plain(t): return H.sub('',t).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه').replace('ؤ','و').replace('ئ','ي').replace('ء','')
def skel(t):  # consonant skeleton: drop long vowels/weak letters
    return re.sub('[اويه]','',plain(t))
GRAMMAR={plain(w) for w in "و ف ب ل ك س ال في على الى من عن لا لم هل يا ما من كيف متى اين هذا هذه ذلك تلك هو هي هم هن انا نحن انت انتم انتما هما كان كانت كنت كنا يكن يكون عند عندما ان انما كل ايضا قبل بعد امام خلف تحت فوق مع".split()}
GRAMMAR_IDS={i for i,x in enumerate(C) if x['cat'] in ('Prepositions & Particles','Pronouns & Pointing Words','Question Words')}
PRE=['وال','فال','بال','لل','كال','ال','وس','فس','و','ف','ب','ل','س','ك']
SUF=['كما','هما','تما','تين','تان','ين','ون','ان','ات','تم','تن','نا','ها','هم','هن','كم','كن','ني','وا','ه','ك','ي','ت','ا','ن']
problems=0;seen=set()
def cand_stems(tok):
    p=plain(tok); out={p}
    for pre in ['']+PRE:
        if pre and not p.startswith(pre): continue
        q=p[len(pre):]
        out.add(q)
        for suf in SUF:
            if q.endswith(suf) and len(q)-len(suf)>=2: out.add(q[:-len(suf)])
            for suf2 in SUF:
                if q.endswith(suf2+suf) and len(q)-len(suf)-len(suf2)>=2: out.add(q[:-len(suf)-len(suf2)])
    return out
def root_match(stem, card):
    forms=re.findall('[ء-يً-ْٰ]+',card['ar']+' '+card.get('pl',''))
    ss=skel(stem)
    for f in forms:
        fs=skel(f)
        if len(fs)<2: 
            if plain(f)==plain(stem): return True
            continue
        # card consonants appear in order inside the token stem (allowing prefixes like ي ت ن ا م)
        it=iter(ss)
        if all(ch in it for ch in fs): return True
        it=iter(fs)
        if len(ss)>=2 and all(ch in it for ch in ss) and len(ss)>=len(fs)-1: return True
    return False
for n,(d,k,ar,en,ids) in enumerate(BANK):
    key=plain(ar)
    if key in seen: print('DUP',n,ar); problems+=1
    seen.add(key)
    bad=[i for i in ids if i>=len(C)]
    if bad: print('BAD ID',n,bad); problems+=1; continue
    if k=='s' and any(C[i]['cat']=='Common Phrases' for i in ids): print('PHRASE IN SENTENCE',n); problems+=1
    toks=re.findall('[ء-يً-ْٰ]+',ar)
    unmatched=[]
    for t in toks:
        st=cand_stems(t)
        if st & GRAMMAR: continue
        if any(root_match(x,C[i]) for x in st for i in ids): continue
        unmatched.append(t)
    if unmatched: print(f'#{n} d{d} {k}: unmatched {unmatched}  | {ar}'); problems+=1
print('entries',len(BANK),'problems',problems)
