# Property Scraper

AI-powered scraper that extracts property listings from builder websites.

## Tech Stack

- **Firecrawl**: Web scraping and content conversion
- **BeautifulSoup**: Deterministic URL extraction from HTML
- **Azure OpenAI GPT-4o**: Metadata extraction and content generation
- **Local Caching**: Stores raw markdown to avoid repeated Firecrawl API calls

## How It Works

```
Builder Listing URL
    ↓
Firecrawl scrapes → Markdown + HTML
    ↓
BeautifulSoup extracts property URLs (pattern matching: /ads/, /project/, etc.)
    ↓
For each property:
    Check cache (projects_raw_md/) → If exists, use cached markdown
    If not cached → Firecrawl scrapes → Save to cache
    GPT-4o extracts → Structured data + formatted content
    Save → .md file with YAML frontmatter
```

## Caching Strategy

**Why cache?**
- Firecrawl is pay-per-use
- Property pages don't change frequently
- Allows re-running LLM extraction with different prompts without re-scraping
- Typical use: Scrape once, refine prompts multiple times

**How it works:**
- Raw markdown saved to `projects_raw_md/[sanitized-url].md`
- On subsequent runs, uses cached markdown (free)
- Delete cache folder to force fresh scrape

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Add builder URLs in config.py
LISTING_URLS = {"Builder": "https://builder.com/listings"}
```

## Usage

```bash
python scraper.py
```

Output: `../../frontend/content/properties/[project-id].md`

## Output Format

```markdown
---
id: "project-name"
project: "Project Name"
builder: "Builder Name"
location: "Area, City"
configuration: "3 & 4 BHK"
price: "₹1.5 Cr onwards"
# ... 17 total metadata fields
---

# Project Name

## Overview
...
```