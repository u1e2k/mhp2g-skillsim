import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
}

def inspect_armor(page_id, name):
    url = f'https://w.atwiki.jp/mhp2g/pages/{page_id}.html'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    print(f"=== {name} ({page_id}) ===")
    tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL)
    print(f"Found {len(tables)} tables")
    for i, t in enumerate(tables[:3]):
        print(f"--- Table {i} ---")
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.DOTALL)
        for r in rows[:4]:
            cells = re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', r, re.DOTALL)
            clean_cells = [re.sub(r'<[^>]+>', '', c).strip().replace('\n', ' ') for c in cells]
            print(clean_cells)

inspect_armor(163, "Head Armor")
