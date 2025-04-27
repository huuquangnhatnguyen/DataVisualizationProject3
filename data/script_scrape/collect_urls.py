import requests as req
from bs4 import BeautifulSoup
import csv

def collect_urls(main_url):
    response = req.get(main_url)
    if response.status_code != 200:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    li_tags = soup.find_all("li")

    all_urls = []
    for li in li_tags:
        a_tag = li.find("a")
        if a_tag and a_tag.get("href"):
            all_urls.append(a_tag["href"])
    return all_urls

if __name__ == "__main__":
    main_page = "https://bigbangtrans.wordpress.com/"
    urls = collect_urls(main_page)

    # Print to console
    print("All retrieved URLs:")
    for item in urls:
        print(item)
    
    # Write the results to a CSV file
    csv_filename = "collected_urls.csv"
    with open(csv_filename, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        for url in urls:
            writer.writerow([url])
    
    print(f"\nSaved {len(urls)} URLs to {csv_filename}.")
