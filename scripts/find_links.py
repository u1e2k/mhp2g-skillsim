import urllib.request
import urllib.parse
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
}

req = urllib.request.Request('https://w.atwiki.jp/mhp2g/', headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL)
filtered = []
for href, text in links:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in clean_text for k in ['防具', 'スキル', '装飾品', '剣士', 'ガンナー', '頭', '胴', '腕', '腰', '脚']):
        filtered.append((clean_text, href))

print(f"Found {len(filtered)} links:")
for text, href in filtered[:30]:
    print(f"{text}: {href}")
