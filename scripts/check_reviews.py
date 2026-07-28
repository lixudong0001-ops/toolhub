import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
with open('data/reviews_seed.json', encoding='utf-8') as f:
    d = json.load(f)
total = sum(len(v['reviews']) for v in d.values())
print('Tools covered:', len(d))
print('Total reviews:', total)
for i, (tid, data) in enumerate(list(d.items())[:3]):
    print('  [' + tid[:20] + '] ' + str(len(data['reviews'])) + ' reviews:')
    for rv in data['reviews']:
        print('    [' + str(rv['rating']) + 'star] ' + rv['text'][:50])
    print()
print('File size:', os.path.getsize('data/reviews_seed.json'), 'bytes')
