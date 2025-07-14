import json
import random
import time
import logging
from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# Configure logging
LOG_FILE = Path(__file__).parent / "scraper.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)

# Load company list from JSON
COMPANIES_FILE = Path(__file__).parent / "companies.json"
with open(COMPANIES_FILE, "r", encoding="utf-8") as f:
    companies = json.load(f)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
]

MIN_DELAY = 2
MAX_DELAY = 6

def random_delay():
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    logging.info(f"Sleeping for {delay:.2f} seconds...")
    time.sleep(delay)

def get_random_user_agent():
    return random.choice(USER_AGENTS)

def log_screenshot(page, company_name):
    screenshot_path = Path(__file__).parent / f"error_{company_name.replace(' ', '_')}.png"
    try:
        page.screenshot(path=str(screenshot_path))
        logging.info(f"Screenshot saved: {screenshot_path}")
    except Exception as e:
        logging.warning(f"Failed to save screenshot for {company_name}: {e}")

def extract_stripe_jobs(page):
    """Extract job postings from Stripe's careers page (table-based)."""
    soup = BeautifulSoup(page.content(), "html.parser")
    jobs = []
    # Find the main job listings table (assume only one main table)
    table = soup.find("table")
    if not table:
        return jobs
    rows = table.find_all("tr")
    for row in rows[1:]:  # Skip header row
        cols = row.find_all("td")
        if len(cols) < 3:
            continue
        # Title and URL
        title_link = cols[0].find("a")
        if not title_link:
            continue
        title = title_link.get_text(strip=True)
        url = title_link.get("href")
        if url and not url.startswith("http"):
            url = f"https://stripe.com{url}"
        # Team
        team = cols[1].get_text(strip=True)
        # Location
        location = cols[2].get_text(strip=True)
        jobs.append({
            "title": title,
            "url": url,
            "team": team,
            "location": location
        })
    return jobs

def main():
    results = []
    stripe_jobs = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for company in companies:
            user_agent = get_random_user_agent()
            context = browser.new_context(user_agent=user_agent)
            page = context.new_page()
            company_name = company['name']
            url = company['url']
            logging.info(f"Starting scrape: {company_name} - {url}")
            try:
                page.goto(url, timeout=30000)
                title = page.title()
                logging.info(f"Success: {company_name} | Title: {title}")
                # Site-specific extraction for Stripe
                if company_name.lower() == "stripe":
                    # Save HTML for debugging
                    debug_html_path = Path(__file__).parent / "stripe_debug.html"
                    with open(debug_html_path, "w", encoding="utf-8") as debug_html_file:
                        debug_html_file.write(page.content())
                    logging.info(f"Saved Stripe debug HTML to {debug_html_path}")
                    jobs = extract_stripe_jobs(page)
                    stripe_jobs.extend(jobs)
                    logging.info(f"Extracted {len(jobs)} jobs from Stripe.")
                results.append({"company": company_name, "url": url, "status": "success", "title": title})
            except Exception as e:
                logging.error(f"Error scraping {company_name}: {e}")
                log_screenshot(page, company_name)
                try:
                    html_path = Path(__file__).parent / f"error_{company_name.replace(' ', '_')}.html"
                    with open(html_path, "w", encoding="utf-8") as html_file:
                        html_file.write(page.content())
                    logging.info(f"HTML saved: {html_path}")
                except Exception as html_e:
                    logging.warning(f"Failed to save HTML for {company_name}: {html_e}")
                results.append({"company": company_name, "url": url, "status": "error", "error": str(e)})
            finally:
                page.close()
                context.close()
                random_delay()
        browser.close()
    # Save Stripe jobs to JSON
    if stripe_jobs:
        stripe_jobs_path = Path(__file__).parent / "stripe_jobs.json"
        with open(stripe_jobs_path, "w", encoding="utf-8") as f:
            json.dump(stripe_jobs, f, indent=2, ensure_ascii=False)
        logging.info(f"Saved {len(stripe_jobs)} Stripe jobs to {stripe_jobs_path}")
    # Print/log summary
    success_count = sum(1 for r in results if r["status"] == "success")
    error_count = sum(1 for r in results if r["status"] == "error")
    logging.info(f"Scraping complete. Success: {success_count}, Errors: {error_count}")
    for r in results:
        if r["status"] == "error":
            logging.info(f"Failed: {r['company']} | {r['url']} | Error: {r['error']}")

if __name__ == "__main__":
    main() 