import requests
import pandas as pd
from bs4 import BeautifulSoup
from rapidfuzz import fuzz

SITEMAP_URL = "https://xcoder.a2hosted.com/uptechmind/page-sitemap.xml"

# Clean slug
def normalize(text):
    return text.lower().replace("-", "").replace("_", "").strip()

def get_slug(url):
    return normalize(url.strip("/").split("/")[-1])

# Fetch sitemap URLs
def get_sitemap_urls():
    res = requests.get(SITEMAP_URL)
    soup = BeautifulSoup(res.content, "xml")
    return [loc.text for loc in soup.find_all("loc")]

# Find best match
def find_best_match(input_slug, sitemap_urls):
    best_match = ""
    best_score = 0

    for url in sitemap_urls:
        slug = get_slug(url)
        score = fuzz.ratio(input_slug, slug)

        if score > best_score:
            best_score = score
            best_match = url

    return best_match, best_score

# MAIN
def run():
    sitemap_urls = get_sitemap_urls()

    df = pd.read_csv("C:\\Users\\user\\Downloads\\input.csv")  # column name must be: url

    results = []

    for url in df["url"]:
        slug = get_slug(url)
        match, score = find_best_match(slug, sitemap_urls)

        status = "Matched" if score >= 70 else "Check"

        results.append({
            "input_url": url,
            "matched_url": match,
            "score": score,
            "status": status
        })

    pd.DataFrame(results).to_csv("output.csv", index=False)

    print("✅ Done! Check output.csv")

run()