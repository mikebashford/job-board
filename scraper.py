import json
import random
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

# Load company list from JSON
COMPANIES_FILE = Path(__file__).parent / "companies.json"

with open(COMPANIES_FILE, "r", encoding="utf-8") as f:
    companies = json.load(f)

# List of user agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
]

# Random delay between requests (in seconds)
MIN_DELAY = 2
MAX_DELAY = 6

def random_delay():
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    print(f"Sleeping for {delay:.2f} seconds...")
    time.sleep(delay)

def get_random_user_agent():
    return random.choice(USER_AGENTS)

# Main scraping logic
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for company in companies:
        user_agent = get_random_user_agent()
        context = browser.new_context(user_agent=user_agent)
        page = context.new_page()
        try:
            print(f"\nScraping {company['name']} - {company['url']}")
            page.goto(company['url'], timeout=30000)
            # Print page title as a basic check
            print(f"Page title: {page.title()}")
            # TODO: Add site-specific scraping logic here
        except Exception as e:
            print(f"Error scraping {company['name']}: {e}")
        finally:
            page.close()
            context.close()
            random_delay()
    browser.close()

# This template is extensible: add custom scraping logic per company as needed.
# You can add proxy support, referer headers, and more anti-detection features as required. 