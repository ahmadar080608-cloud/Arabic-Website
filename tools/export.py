# Rebuild sentences.js from bank.py:  cd tools && python3 validate.py && python3 export.py
import json,re
from bank import BANK
s=open('../cards.js').read();C=json.loads(s[len('window.CARDS='):].rstrip().rstrip(';'))
out=[]
for n,(d,k,ar,en,ids) in enumerate(BANK):
    words=len(re.findall('[ء-يً-ْٰ]+',ar))
    out.append({'id':'s%d'%n,'d':d,'len':'p' if k=='p' else ('s' if words<=5 else 'l'),'ar':ar,'en':en,'w':[C[i]['id'] for i in ids]})
open('../sentences.js','w').write('window.SENTENCES='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(out),'items')
