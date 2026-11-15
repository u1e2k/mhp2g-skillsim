import urllib.request
import os
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
}

os.makedirs('data_raw', exist_ok=True)

pages = {
    'decorations.html': 309,
    'skills.html': 160,
    'head.html': 163,
    'body.html': 164,
    'arm.html': 165,
    'waist.html': 166,
    'leg.html': 167
}

for filename, pid in pages.items():
    filepath = os.path.join('data_raw', filename)
    if os.path.exists(filepath):
        print(f"Skipping {filename}, already exists")
        continue
    url = f'https://w.atwiki.jp/mhp2g/pages/{pid}.html'
    print(f"Downloading {url} to {filepath}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read()
    with open(filepath, 'wb') as f:
        f.write(content)
    print(f"Saved {filename} ({len(content)} bytes)")
    time.sleep(1)

print("All downloads finished.")
