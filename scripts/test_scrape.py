import requests

URL = "https://tabandchord.com/2024/01/o-maahi-chords-dunki/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/"
}

def test():
    print(f"Testing {URL}...")
    try:
        response = requests.get(URL, headers=HEADERS, timeout=15)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Content Length:", len(response.text))
            # Search for typical chord markers
            if "[" in response.text and "]" in response.text:
                print("Found chords in response!")
            else:
                print("No obvious chords found in text.")
            
            # Print a snippet of the body
            snippet_start = response.text.find("<body")
            if snippet_start != -1:
                print("Body snippet:", response.text[snippet_start:snippet_start+500])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
