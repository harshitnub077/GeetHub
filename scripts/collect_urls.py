import requests
import re
import time

SITEMAPS = [
    'https://tabandchord.com/post-sitemap.xml',
    'https://tabandchord.com/post-sitemap2.xml',
    'https://tabandchord.com/post-sitemap3.xml',
]

# Add all 79 guitartwitt sitemaps
for i in range(1, 80):
    SITEMAPS.append(f'https://guitartwitt.com/post-sitemap{i}.xml')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

def get_urls(sitemap_url):
    print(f"Fetching {sitemap_url}...")
    try:
        response = requests.get(sitemap_url, headers=HEADERS, timeout=30)
        if response.status_code != 200:
            print(f"Failed to fetch {sitemap_url}: {response.status_code}")
            return []
        
        urls = re.findall(r'<loc>(.*?)</loc>', response.text)
        return urls
    except Exception as e:
        print(f"Error fetching {sitemap_url}: {e}")
        return []

def main():
    all_urls = []
    for s in SITEMAPS:
        urls = get_urls(s)
        all_urls.extend(urls)
        # time.sleep(0.1) 
    
    filtered_urls = []
    for url in all_urls:
        url_lower = url.lower()
        if any(x in url_lower for x in ['/category/', '/tag/', '/author/', '/page/', '/sitemap/']):
            continue
        # For GuitarTwitt, we want chords
        if 'guitartwitt.com' in url_lower and 'chords' not in url_lower:
             continue
        filtered_urls.append(url)
    
    # Remove duplicates
    filtered_urls = list(set(filtered_urls))
    
    with open('scripts/bollywood_urls.txt', 'w') as f:
        for url in filtered_urls:
            f.write(url + '\n')
    
    print(f"Total Unique URLs collected: {len(filtered_urls)}")

if __name__ == "__main__":
    main()
