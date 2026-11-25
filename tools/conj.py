# Full conjugation for the sentence-generator verbs.
# Input: the four hand-written forms per tense (he, she, I, we) from lexicon.py.
# Output: arrays of 13 persons, in this order (first four unchanged):
#   he, she, I, we, they2m, they2f, theym, theyf, you_m, you_f, you2, youpm, youpf
PERSONS = ['he','she','i','we','they2m','they2f','theym','theyf','you_m','you_f','you2','youpm','youpf']
F, D, K, S, SH = 'َ', 'ُ', 'ِ', 'ْ', 'ّ'   # fatha damma kasra sukun shadda

def _n_join(stem, suffix):
    """stem ending in نْ + suffix starting with ن  ->  نَّ (assimilation): سَكَنْ+نَ = سَكَنَّ"""
    if stem.endswith('ن'+S) and suffix.startswith('ن'):
        return stem[:-1] + SH + suffix[1:]
    return stem + suffix

def past_forms(v):
    he, she, i = v['past'][0], v['past'][1], v['past'][2]
    st = i[:-2]                       # أَكَلْتُ -> أَكَلْ ; اِشْتَرَيْتُ -> اِشْتَرَيْ ; زُرْتُ -> زُرْ
    defective = he.endswith('ى')
    if defective:
        they2m = st[:-1] + F + 'ا'     # اِشْتَرَيْ -> اِشْتَرَيَا
        theym = he[:-1] + 'وْا'         # اِشْتَرَى -> اِشْتَرَوْا
    else:
        they2m = he + 'ا'               # أَكَلَ -> أَكَلَا ; أَحَبَّ -> أَحَبَّا
        theym = _dv(he) + D + 'وا'      # أَكَلَ -> أَكَلُوا
    they2f = she[:-1] + F + 'ا'         # أَكَلَتْ -> أَكَلَتَا
    theyf = _n_join(st, 'نَ')           # أَكَلْنَ ; سَكَنَّ
    if v['key'] == 'love': theyf = 'أَحْبَبْنَ'
    you = {k: st + 'ت' + suf for k, suf in [('you_m', F), ('you_f', K), ('you2', D+'مَا'), ('youpm', D+'مْ'), ('youpf', D+'نَّ')]}
    return [they2m, they2f, theym, theyf, you['you_m'], you['you_f'], you['you2'], you['youpm'], you['youpf']]

import re
_MK = re.compile('[\u064b-\u0652]+$')
def _dv(w):
    """drop the final vowel but keep a shadda: يُحِبُّ -> يُحِبّ ; أَكَلَ -> أَكَل"""
    m = _MK.search(w)
    if not m: return w
    return w[:m.start()] + (SH if SH in m.group(0) else '')

HAMZA_FIX = [('أَا','آ'),('أَانِ','آنِ'),('أُو','ؤُو'),('أِي','ئِي')]
def _hz(w):
    for a,b in HAMZA_FIX: w = w.replace(a,b)
    return w

def _t(w):   # يَفْعَلُ -> تَفْعَلُ (swap the prefix letter)
    return 'ت' + w[1:]

def present_like(v):
    """returns (pres, juss, subj) extra-person arrays"""
    he_p, he_j = v['pres'][0], v['juss'][0]
    if he_p.endswith('ي'):            # يَشْتَرِي (defective, -ī)
        st = _dv(he_p[:-1])            # يَشْتَر ; يُصَلّ
        ind = dict(they2=he_p + F + 'انِ', theym=st + D + 'ونَ', you_f=st + K + 'ينَ', theyf=st + K + 'ينَ')
        sub = dict(they2=he_p + F + 'ا', theym=st + D + 'وا', you_f=st + K + 'ي', theyf=st + K + 'ينَ')
    elif he_p.endswith('ى'):          # يَرَى (defective, -ā)
        st = he_p[:-1]                 # يَرَ
        ind = dict(they2=st + 'يَانِ', theym=st + 'وْنَ', you_f=st + 'يْنَ', theyf=st + 'يْنَ')
        sub = dict(they2=st + 'يَا', theym=st + 'وْا', you_f=st + 'يْ', theyf=st + 'يْنَ')
    else:                              # sound, hollow, doubled
        st = _dv(he_p)                 # يَأْكُل ; يَزُور ; يُحِبّ
        if v['key'] == 'love': fpl = 'يُحْبِبْنَ'
        else: fpl = _n_join(he_j, 'نَ')   # يَأْكُلْنَ ; يَزُرْنَ ; يَسْكُنَّ
        ind = dict(they2=st + F + 'انِ', theym=st + D + 'ونَ', you_f=st + K + 'ينَ', theyf=fpl)
        sub = dict(they2=st + F + 'ا', theym=st + D + 'وا', you_f=st + K + 'ي', theyf=fpl)

    def row(d, single_he):
        return [d['they2'], _t(d['they2']), d['theym'], d['theyf'],
                _t(single_he), _t(d['you_f']), _t(d['they2']), _t(d['theym']), _t(d['theyf'])]
    pres = row(ind, v['pres'][0])
    juss = row(sub, v['juss'][0])
    subj = row(sub, v['subj'][0])
    return pres, juss, subj

def conjugate(v):
    out = dict(v)
    out['past'] = list(v['past'][:4]) + [_hz(x) for x in past_forms(v)]
    p, j, s = present_like(v)
    out['pres'] = list(v['pres'][:4]) + [_hz(x) for x in p]
    out['juss'] = list(v['juss'][:4]) + [_hz(x) for x in j]
    out['subj'] = list(v['subj'][:4]) + [_hz(x) for x in s]
    return out
