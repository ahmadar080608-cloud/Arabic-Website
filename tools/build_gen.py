# Builds gen.js (data for the sentence generator) from lexicon.py.  Run: python3 build_gen.py
import json,re
from lexicon import *
s=open('../cards.js').read();C=json.loads(s[len('window.CARDS='):].rstrip().rstrip(';'))
SUN=set('تثدذرزسشصضطظلن')
MARKS=re.compile('[ً-ْٰ]')
def strip_case(w):
    m=re.search('[\u064B-\u0652]+$',w)   # final cluster of vowel marks
    if not m: return w
    return w[:m.start()]+m.group(0).replace('\u064C','').replace('\u064F','')
def definite(ind,case):
    base=strip_case(ind)
    v={'nom':'ُ','acc':'َ','gen':'ِ'}[case]
    if base.startswith('ا\u0650'): base='ا'+base[2:]   # اِجْتِمَاع -> الاجْتِمَاع
    first=base[0]; i=1
    while i<len(base) and MARKS.match(base[i]): i+=1
    head=first+('ّ' if first in SUN else '')+base[1:i]
    return 'ال'+head+base[i:]+v
def ind_gen(ind):
    m=re.search('[\u064B-\u0652]+$',ind)
    if m and '\u064C' in m.group(0): return ind[:m.start()]+m.group(0).replace('\u064C','\u064D')
    return None
tags={}
for k,t in EXTRA_TAGS.items(): tags.setdefault(k,[]).append(t)
nouns=[]
for (k,ci,en,ind,g,cls,fl) in NOUNS+[SOAP]:
    c=C[ci]; flags=fl.split()
    cl=cls.split()+tags.get(k,[])
    if 'compound' in flags:
        f=COMPOUND[k]; nom,acc,gen,ig=f['nom'],f['acc'],f['gen'],None; indn=f['ind']
    elif 'poss' in flags:
        nom=acc=gen=ind; ig=ind; indn=None
    else:
        nom,acc,gen=definite(ind,'nom'),definite(ind,'acc'),definite(ind,'gen'); indn=ind; ig=ind_gen(ind)
    nouns.append(dict(k=k,id=c['id'],en=en,g=g,cls=cl,nom=nom,acc=acc,gen=gen,ind=indn,igen=ig,
                      poss='poss' in flags,mass='mass' in flags,pl='pluralen' in flags,cmp='compound' in flags))
adjs=[]
for (k,en,mi,mf,fi,ff,cls) in ADJS:
    out=dict(k=k,en=en,cls=cls.split())
    for gk,ci,form in (('m',mi,mf),('f',fi,ff)):
        if (k,gk) in ADJ_FORMS: f=dict(ADJ_FORMS[(k,gk)])
        else: f=dict(nom=definite(form,'nom'),acc=definite(form,'acc'),gen=definite(form,'gen'),ind=form)
        f['igen']=ind_gen(f['ind']) if f['ind'] else None
        f['id']=C[ci if ci is not None else (fi if gk=='m' else mi)]['id']
        out[gk]=f
    adjs.append(out)
verbs=[]
for v in VERBS:
    d=dict(v); d['id']=C[v['card']]['id']; del d['card']
    d['subjc']=v['subjc']; d['obj']=v.get('obj',''); d['places']=[list(p) for p in v.get('places',[])]
    verbs.append(d)
data=dict(nouns=nouns,adjs=adjs,verbs=verbs,where=[list(w) for w in WHERE],
          prep={k:C[v]['id'] for k,v in PREP_CARD.items()},times=[[a,e,C[c]['id'],t] for a,e,c,t in TIMES],
          ids=dict(this_m=C[306]['id'],this_f=C[307]['id'],want=C[406]['id'],must=C[73]['id'],an=C[991]['id'],onme=C[693]['id'],
                   i=C[260]['id'],he=C[258]['id'],she=C[257]['id']))
open('../gen.js','w').write('window.GEN='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(nouns),'nouns',len(adjs),'adjs',len(verbs),'verbs')
for n in nouns[::1]:
    print(n['k'].ljust(12),n['nom'],'|',n['acc'],'|',n['gen'],'|',n['ind'],'|',n['igen'])
for a in adjs:
    print(a['k'].ljust(12),a['m']['nom'],a['m']['acc'],a['m']['ind'],'|',a['f']['nom'],a['f']['acc'],a['f']['ind'],a['f']['igen'])
