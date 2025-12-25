#!/usr/bin/env python3
"""
Web scraper to extract property listings from builder websites using Firecrawl and Azure OpenAI.

This script:
1. Takes a list of URLs (listing pages from different builders)
2. Uses Firecrawl to scrape the listing page (markdown + HTML)
3. Uses BeautifulSoup to deterministically parse HTML and extract individual property URLs
4. Uses Firecrawl to scrape each property detail page
5. Uses Azure OpenAI to extract structured metadata and generate formatted content
6. Creates markdown files with YAML frontmatter in the same format as existing properties

Dependencies:
    pip install firecrawl-py openai pyyaml python-dotenv beautifulsoup4
"""

import os
import re
import json
import yaml
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from firecrawl import FirecrawlApp
from openai import AzureOpenAI
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time


@dataclass
class PropertyMetadata:
    """Data structure for property metadata"""
    id: str
    project: str
    builder: str
    location: str
    configuration: str
    totalUnits: int
    area: str
    price: str
    possession: str
    rera: str
    towers: int
    floors: int
    unitSizes: str
    clubhouse: str
    openSpace: str
    lat: float
    lng: float
    url: str


@dataclass
class PropertyListing:
    """Data structure for a complete property listing"""
    metadata: PropertyMetadata
    content: str  # Markdown content


class PropertyScraper:
    """Main scraper class using Firecrawl and Azure OpenAI"""
    
    def __init__(
        self, 
        firecrawl_api_key: str,
        azure_openai_endpoint: str,
        azure_openai_key: str,
        azure_openai_deployment: str,
        azure_openai_api_version: str = "2024-12-01-preview",
        output_dir: str = "../frontend/content/properties",
        cache_dir: str = "projects_raw_md",
        urls_cache_file: str = "builder_urls_cache.json"
    ):
        self.output_dir = output_dir
        self.cache_dir = cache_dir
        self.urls_cache_file = urls_cache_file
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Initialize Firecrawl
        self.firecrawl = FirecrawlApp(api_key=firecrawl_api_key)
        
        # Initialize Azure OpenAI
        self.openai_client = AzureOpenAI(
            api_key=azure_openai_key,
            api_version=azure_openai_api_version,
            azure_endpoint=azure_openai_endpoint
        )
        self.deployment = azure_openai_deployment
    
    def scrape_with_firecrawl(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape a URL using Firecrawl API.
        
        Returns dict with 'markdown', 'html', and 'url' keys.
        """
        try:
            print(f"   Scraping with Firecrawl: {url}")
            result = self.firecrawl.scrape(url, formats=["markdown", "html"])
            
            return {
                'markdown': result.markdown if hasattr(result, 'markdown') else '',
                'html': result.html if hasattr(result, 'html') else '',
                'url': url
            }
        except Exception as e:
            print(f"   Error scraping {url}: {e}")
            return None
    
    def get_cached_markdown(self, url: str) -> Optional[str]:
        """
        Check if markdown is cached locally for a given URL.
        
        Returns cached markdown content or None if not found.
        """
        # Generate filename from URL (sanitize for filesystem)
        filename = re.sub(r'[^\w\-]', '_', url) + '.md'
        filepath = os.path.join(self.cache_dir, filename)
        
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                print(f"      ⚠ Error reading cache: {e}")
                return None
        return None
    
    def save_markdown_cache(self, url: str, markdown: str) -> bool:
        """
        Save markdown content to cache.
        
        Returns True if successful, False otherwise.
        """
        # Generate filename from URL (sanitize for filesystem)
        filename = re.sub(r'[^\w\-]', '_', url) + '.md'
        filepath = os.path.join(self.cache_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(markdown)
            return True
        except Exception as e:
            print(f"      ⚠ Error saving cache: {e}")
            return False
    
    def get_cached_builder_urls(self, builder: str) -> Optional[List[str]]:
        """
        Get cached property URLs for a builder.
        
        Returns list of URLs or None if not cached.
        """
        if not os.path.exists(self.urls_cache_file):
            return None
        
        try:
            with open(self.urls_cache_file, 'r', encoding='utf-8') as f:
                cache = json.load(f)
                return cache.get(builder)
        except Exception as e:
            print(f"   ⚠ Error reading URLs cache: {e}")
            return None
    
    def save_builder_urls_cache(self, builder: str, urls: List[str]) -> bool:
        """
        Save property URLs for a builder to cache.
        
        Returns True if successful, False otherwise.
        """
        try:
            # Load existing cache
            cache = {}
            if os.path.exists(self.urls_cache_file):
                with open(self.urls_cache_file, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
            
            # Update with new builder URLs
            cache[builder] = urls
            
            # Save back to file
            with open(self.urls_cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"   ⚠ Error saving URLs cache: {e}")
            return False
    
    def scrape_property_page(self, url: str) -> Optional[str]:
        """
        Get property page markdown - from cache if available, otherwise scrape with Firecrawl.
        
        Returns markdown content or None on error.
        """
        # Check cache first
        cached_md = self.get_cached_markdown(url)
        if cached_md:
            print(f"      ✓ Using cached markdown")
            return cached_md
        
        # Cache miss - scrape with Firecrawl
        print(f"      → Cache miss, scraping with Firecrawl...")
        result = self.scrape_with_firecrawl(url)
        
        if not result or not result.get('markdown'):
            return None
        
        markdown = result['markdown']
        
        # Save to cache for next time
        self.save_markdown_cache(url, markdown)
        print(f"      ✓ Cached for future use")
        
        return markdown
    
    
    def extract_listing_urls_deterministic(self, html_content: str, base_url: str) -> List[str]:
        """
        Use BeautifulSoup to deterministically extract property URLs from listing page HTML.
        
        Looks for <a> tags with hrefs matching common property page patterns:
        - /ads/, /project/, /property/, /apartment/, /villa/
        - Must have at least 3 path segments (e.g., /ads/hyderabad/project-name)
        - Filters out navigation, footer, and external links
        
        Returns list of absolute URLs.
        """
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        urls = set()
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            
            # Skip invalid links
            if not href or href.startswith('#') or href.startswith('javascript:'):
                continue
            
            # Make URL absolute
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Only same domain
            base_domain = urlparse(base_url).netloc
            if base_domain not in parsed.netloc:
                continue
            
            # Look for property detail page patterns
            path = parsed.path.lower()
            if any(pattern in path for pattern in ['/ads/', '/project/', '/property/', '/apartment/', '/villa/']):
                path_parts = [p for p in path.split('/') if p]
                # Property pages have more segments than listing pages
                if len(path_parts) >= 3:
                    urls.add(full_url)
        
        return list(urls)
    
    def extract_property_data_with_llm(self, markdown_content: str, url: str, builder: str) -> Optional[tuple[PropertyMetadata, str]]:
        """
        Use Azure OpenAI to extract structured metadata and generate formatted content.
        
        Limits content to 50k chars (~12k tokens) to stay within token limits.
        Returns tuple of (PropertyMetadata, formatted_content_string) or None on error.
        """
        content_to_analyze = markdown_content[:50000]
        original_length = len(markdown_content)
        
        truncation_note = ""
        if original_length > 50000:
            truncation_note = f"\n\nNOTE: Content was truncated from {original_length} to 50000 characters. Extract data from the provided content."
        
        prompt = f"""You are analyzing ALREADY SCRAPED content from a real estate property detail page.
The content below was extracted by Firecrawl API and is now being parsed to extract structured property data AND generate well-formatted content.

SOURCE URL: {url}
BUILDER: {builder}
CONTENT LENGTH: {len(content_to_analyze)} characters{truncation_note}

YOUR TASK:
1. Extract structured metadata fields
2. Generate well-formatted markdown content with sections: Overview, Standout Features, Amenities, Location Highlights

MARKDOWN CONTENT:
{content_to_analyze}

INSTRUCTIONS:

PART 1 - Extract Metadata Fields:
Use "TBD" for string fields or 0 for numeric fields if information is not available.

1. project: Full project name (e.g., "Aparna Zenon", "Prestige Lakeside Habitat")
2. location: Location in format "Area, City" (e.g., "Puppalaguda, Hyderabad", "Varthur, Bangalore")
3. configuration: BHK configuration (e.g., "2 & 3 BHK", "3 & 4 BHK", "1, 2 & 3 BHK")
4. totalUnits: Total number of units/apartments as integer (e.g., 1000, 500) - use 0 if not found
5. area: Total project area (e.g., "30.15 Acres", "10 Acres", "5.5 Acres") - include unit
6. price: Starting price or price range (e.g., "₹1.5 Cr onwards", "₹85 Lakhs - ₹1.2 Cr", "On Request")
7. possession: Possession status or date (e.g., "Under Construction", "Ready to Move", "Dec 2025", "2026")
8. rera: RERA registration number (e.g., "P02400003722", "P52100012345") - use "TBD" if not found
9. towers: Number of towers/blocks as integer (e.g., 12, 5, 1) - use 0 if not found
10. floors: Number of floors per tower as integer (e.g., 25, 18, 10) - use 0 if not found
11. unitSizes: Size range of units (e.g., "1326 - 2257 Sq. Ft.", "1200 - 1800 Sq. Ft.")
12. clubhouse: Clubhouse size (e.g., "86,000+ Sq. Ft.", "50,000 Sq. Ft.", "1 Lakh Sq. Ft.") - use "TBD" if not found
13. openSpace: Open space percentage (e.g., "70%", "80%", "85%") - use "TBD" if not found
14. lat: Latitude coordinate (float) - use 17.4195 as default for Hyderabad
15. lng: Longitude coordinate (float) - use 78.3580 as default for Hyderabad

PART 2 - Generate Formatted Content:
Create well-structured markdown content with these sections:
- **Overview**: 2-3 sentence summary of the project
- **Standout Features**: Key highlights (location, unique features, lifestyle elements) with bullet points
- **Amenities**: Categorized list (Clubhouse, Outdoor, Convenience, etc.) with bullet points
- **Location Highlights**: Connectivity, nearby landmarks, transportation with bullet points

Return your response as JSON in this EXACT format:
{{
  "metadata": {{
    "project": "Project Name",
    "location": "Area, City",
    "configuration": "X & Y BHK",
    "totalUnits": 0,
    "area": "X Acres",
    "price": "On Request",
    "possession": "Under Construction",
    "rera": "TBD",
    "towers": 0,
    "floors": 0,
    "unitSizes": "X - Y Sq. Ft.",
    "clubhouse": "TBD",
    "openSpace": "TBD",
    "lat": 17.4195,
    "lng": 78.3580
  }},
  "content": "# Project Name\\n\\n## Overview\\n...\\n\\n## Standout Features\\n...\\n\\n## Amenities\\n...\\n\\n## Location Highlights\\n..."
}}
"""

        try:
            response = self.openai_client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a real estate data extraction and content generation specialist. You analyze pre-scraped property pages, extract structured information accurately, and generate well-formatted, professional property descriptions. Always return valid JSON. Never fabricate data - use fallback values if information is missing."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Slightly higher for better content generation
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            metadata_dict = result.get('metadata', {})
            content_markdown = result.get('content', '')
            
            # Generate ID from project name
            project_id = re.sub(r'[^a-z0-9]+', '-', metadata_dict['project'].lower()).strip('-')
            
            metadata = PropertyMetadata(
                id=project_id,
                project=metadata_dict['project'],
                builder=builder,
                location=metadata_dict['location'],
                configuration=metadata_dict['configuration'],
                totalUnits=metadata_dict['totalUnits'],
                area=metadata_dict['area'],
                price=metadata_dict['price'],
                possession=metadata_dict['possession'],
                rera=metadata_dict['rera'],
                towers=metadata_dict['towers'],
                floors=metadata_dict['floors'],
                unitSizes=metadata_dict['unitSizes'],
                clubhouse=metadata_dict['clubhouse'],
                openSpace=metadata_dict['openSpace'],
                lat=metadata_dict['lat'],
                lng=metadata_dict['lng'],
                url=url
            )
            
            print(f"   ✓ Extracted data for: {metadata.project}")
            if original_length > 50000:
                print(f"   ⚠ Warning: Content was truncated from {original_length} chars")
            
            return metadata, content_markdown
            
        except Exception as e:
            print(f"   Error extracting property data with LLM: {e}")
            return None
    
    def create_markdown_file(self, listing: PropertyListing) -> bool:
        """
        Create a markdown file with YAML frontmatter from PropertyListing object.
        
        Format:
        ---
        id: project-name
        project: Project Name
        ...
        ---
        
        ## Overview
        ...
        """
        try:
            frontmatter = asdict(listing.metadata)
            
            md_content = "---\n"
            md_content += yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True)
            md_content += "---\n\n"
            md_content += listing.content
            
            os.makedirs(self.output_dir, exist_ok=True)
            
            filename = f"{listing.metadata.id}.md"
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            print(f"      ✓ Created: {filename}")
            return True
            
        except Exception as e:
            print(f"      ✗ Error creating file: {e}")
            return False
    
    def scrape_all(self, listing_urls: Dict[str, str]) -> int:
        """
        Scrape all properties from the provided listing URLs.
        
        For each builder:
        1. Scrape listing page with Firecrawl
        2. Extract property URLs with BeautifulSoup
        3. Scrape each property page with Firecrawl
        4. Extract metadata and generate content with Azure OpenAI
        5. Save as markdown file with YAML frontmatter
        
        Args:
            listing_urls: Dict mapping builder names to listing page URLs
            
        Returns:
            Total number of properties successfully scraped
        """
        total_scraped = 0
        
        for builder, listing_url in listing_urls.items():
            print(f"\n{'='*60}")
            print(f"Processing: {builder}")
            print(f"Listing URL: {listing_url}")
            print(f"{'='*60}\n")
            
            # Step 1: Scrape the listing page with Firecrawl
            print("Step 1: Scraping listing page...")
            listing_result = self.scrape_with_firecrawl(listing_url)
            
            if not listing_result:
                print(f"✗ Failed to scrape listing page for {builder}")
                continue
            
            markdown_content = listing_result.get('markdown', '')
            html_content = listing_result.get('html', '')
            
            if not markdown_content:
                print(f"✗ No markdown content retrieved for {builder}")
                continue
            
            # Step 2: Extract property URLs using deterministic parsing (or cache)
            print("\nStep 2: Extracting property URLs...")
            
            # Check cache first
            property_urls = self.get_cached_builder_urls(builder)
            if property_urls:
                print(f"   ✓ Using cached URLs ({len(property_urls)} properties)")
                for url in property_urls:
                    print(f"      - {url}")
            else:
                print(f"   → Cache miss, extracting from HTML...")
                property_urls = self.extract_listing_urls_deterministic(html_content, listing_url)
                
                if not property_urls:
                    print(f"   ✗ No property URLs found for {builder}")
                    continue
                
                print(f"   ✓ Found {len(property_urls)} property URLs")
                for url in property_urls:
                    print(f"      - {url}")
                
                # Save to cache for next time
                self.save_builder_urls_cache(builder, property_urls)
                print(f"   ✓ Cached URLs for future runs")
            
            # Step 3: Scrape each property and extract data
            print(f"\nStep 3: Scraping individual properties...")
            
            for i, property_url in enumerate(property_urls, 1):
                print(f"\n   [{i}/{len(property_urls)}] {property_url}")
                
                # Get property page markdown (cached or fresh)
                property_markdown = self.scrape_property_page(property_url)
                if not property_markdown:
                    print(f"      ✗ Failed to get markdown")
                    continue
                
                # Extract metadata and generate content with Azure OpenAI
                result = self.extract_property_data_with_llm(
                    property_markdown, 
                    property_url, 
                    builder
                )
                if not result:
                    print(f"      ✗ Failed to extract data")
                    continue
                
                metadata, content_markdown = result
                listing = PropertyListing(
                    metadata=metadata,
                    content=content_markdown
                )
                
                # Save to markdown file
                if self.create_markdown_file(listing):
                    total_scraped += 1
                
                # Rate limiting: 20s between requests to respect Azure OpenAI TPM limits
                if i < len(property_urls):
                    print(f"      Waiting 20s...")
                    time.sleep(20)
            
            print(f"\n{'='*60}")
            print(f"Completed {builder}: {total_scraped} properties saved")
            print(f"{'='*60}\n")
        
        return total_scraped


def main():
    """Main execution function - loads config and runs the scraper"""
    import sys
    from dotenv import load_dotenv
    
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from config import LISTING_URLS, OUTPUT_DIR
    
    load_dotenv()
    
    # Get API credentials from environment
    firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY')
    azure_openai_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    azure_openai_key = os.getenv('AZURE_OPENAI_KEY')
    azure_openai_deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4o')
    azure_openai_api_version = os.getenv('AZURE_OPENAI_API_VERSION', '2024-12-01-preview')
    
    if not all([firecrawl_api_key, azure_openai_endpoint, azure_openai_key]):
        print("ERROR: Missing required environment variables")
        print("Required: FIRECRAWL_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY")
        print("Please set them in your .env file")
        return
    
    scraper = PropertyScraper(
        firecrawl_api_key=firecrawl_api_key,
        azure_openai_endpoint=azure_openai_endpoint,
        azure_openai_key=azure_openai_key,
        azure_openai_deployment=azure_openai_deployment,
        azure_openai_api_version=azure_openai_api_version,
        output_dir=OUTPUT_DIR
    )
    
    print("\n" + "="*60)
    print("Property Scraper - Starting")
    print("="*60)
    
    total = scraper.scrape_all(LISTING_URLS)
    
    print("\n" + "="*60)
    print(f"Scraping Complete: {total} properties saved to {OUTPUT_DIR}")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()