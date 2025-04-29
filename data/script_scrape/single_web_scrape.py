from bs4 import BeautifulSoup
import requests

def scrape_spans(url):
    """
    Scrape the given URL, finding spans with either font-size:small or
    font-family:Calibri in the style attribute, returning a list of text lines
    from the innermost span nodes.
    """
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve {url}. Status code: {response.status_code}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    
    results = []
    # Find the title of the page
    h2_title = soup.find("h2", class_="title")
    title_text = h2_title.get_text(strip=True) if h2_title else "No Title Found"
    results.append(title_text)

    # Find all spans that have either font-size:small or font-family:Calibri in style
    spans = soup.find_all(
        "span",
        style=lambda value: value and ("font-size:small" in value or "font-family:Calibri" in value)
    )

    # Collect text from only the innermost spans (i.e. no nested <span>)
    for sp in spans:
        if not sp.find("span"):
            text_content = sp.get_text(strip=True)
            results.append(text_content)
    return results

# Main for testing
if __name__ == "__main__":
    test_url = "https://bigbangtrans.wordpress.com/series-1-episode-1-pilot-episode/"
    lines = scrape_spans(test_url)
    for line in lines:
        print(line)