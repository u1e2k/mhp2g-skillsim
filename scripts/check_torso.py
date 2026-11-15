import urllib.request, re
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'text/html'
}
req = urllib.request.Request('https://w.atwiki.jp/mhp2g/pages/167.html', headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
for line in html.splitlines():
    if '倍加' in line:
        print(line[:200])
