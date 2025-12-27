# Configuration file for property scraper
# 
# This file contains URLs to scrape and builder-specific settings

LISTING_URLS = {
    "Prestige Constructions": "https://www.prestigeconstructions.com/ads/hyderabad",
    "Aparna Constructions": "https://www.aparnaconstructions.com/project/apartments",
    "Rajapushpa Properties": "https://www.rajapushpa.in/projects/residential-projects.php",
    "My Home Group": "https://www.myhomeconstructions.com",
    "ASBL": "https://asbl.in/our-projects",
    "Raghava": "https://raghava.world/Projects",
    "Jayabheri": "https://www.jayabherigroup.com/projects.html",
    "DSR builders": "https://dsrbuilders.in/residential-ongoing.php",
    "Myscape": "https://myscape.in/projects/",
    "Candeur": "https://www.candeur.in/projects",
    "Honer Homes": "https://www.honerhomes.com/projects",
    "GHR infra": "https://ghrinfra.in/other-projects/",
    "Lansum": "https://lansumproperties.com/projects",
    #"Godrej properties": "https://www.godrej-homes.net/allprojects-platter/Hyderabad%20projects",
    "Ramky Estates": "https://www.ramkyestates.com/location/hyderabad/",
    "Sumadhura": "https://sumadhurarealty.com/#projects",
    "Vasavi group": "https://thevasavigroup.com/",
    "Vertex homes": "https://vertexhomes.com/projecthome",
    "Hallmark builders": "https://hallmarkbuilders.in/ongoing-projects",
    "Brigade": "https://www.brigadegroup.com/residential/projects/hyderabad"
}

# Actions to perform before scraping listings (for dynamic content)
# This handles "Load More" buttons, infinite scroll, etc.
LISTING_ACTIONS = {
    "Aparna Constructions": [
        # Click "Load More" button 3 times to load all projects
        {"type": "wait", "milliseconds": 3000},  # Initial page load
        {"type": "executeJavascript", "script": """
(function() {
    // Define reusable function to find and click Load More button
    const clickLoadMore = () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loadMoreBtn = buttons.find(btn => btn.textContent.trim() === 'Load More');
        if (loadMoreBtn) {
            loadMoreBtn.click();
            return true;
        }
        return false;
    };

    // Click the button 3 times with delays
    clickLoadMore();
    setTimeout(() => clickLoadMore(), 2000);
    setTimeout(() => clickLoadMore(), 4000);

    return 'Clicked Load More button 3 times';
})();
        """},
        {"type": "wait", "milliseconds": 5000},  # Wait for all content to load
    ]
}

# Builder-specific URL extraction patterns
#
# Specify regex patterns to match full project URLs for each builder.
# If a builder is not listed here, default patterns will be used:
#   /ads/, /project/, /property/, /apartment/, /villa/, /residential/
#
# Schema:
#   "Builder Name": [r"full-url-regex-pattern-1", r"full-url-regex-pattern-2", ...]
#
# The full URL must match at least one of the patterns to be extracted.
# Patterns are matched against the complete URL string (e.g., https://domain.com/path)
#
BUILDER_URL_PATTERNS = {
    # My Home Group: Main site /my-home-{name}/ + subdomain myhome{project}.co.in
    # Reasoning: Stable dual-pattern structure unlikely to change
    "My Home Group": [
        r"myhomeconstructions\.com/my-home-",
        r"myhome\w+\.co\.in"
    ],

    # Raghava: Subdomain-based {name}byraghava.world
    # Reasoning: All projects follow consistent subdomain pattern
    "Raghava": [r"byraghava\.world"],

    # Jayabheri: Main site paths + trendset subdomain
    # Reasoning: Projects can have various names, not just "the" or "jayabheri-" prefix
    "Jayabheri": [
        r"jayabherigroup\.com/\w+/",
        r"\w+jayabheri\.com"
    ],

    # Myscape: Root-level project paths
    # Reasoning: All projects are direct paths, no need to hardcode specific names
    "Myscape": [r"myscape\.in/\w+/"],

    # Candeur: Standard /projects/ structure
    # Reasoning: Generic path works for all current and future projects
    "Candeur": [r"candeur\.in/projects/"],

    # Ramky Estates: Standard /projects/ structure
    # Reasoning: Generic path works for all current and future projects
    "Ramky Estates": [r"ramkyestates\.com/projects/"],

    # DSR builders: Root-level .php files excluding navigation pages
    # Reasoning: Projects are .php files, but exclude known navigation (career, contact, about, etc.)
    "DSR builders": [r"dsrbuilders\.in/(?!index|career|contact|about|blog|gallery|residential-|commercial-|upcoming-)[a-z0-9-]+\.php"],

    # Honer Homes: All projects under /projects/ path
    # Reasoning: No need to enforce "honer-" prefix, any project name should work
    "Honer Homes": [r"honerhomes\.com/projects/\w+"],

    # Lansum: /projects/ path + root-level hyphenated names
    # Reasoning: Mix of organized (/projects/) and root paths, hyphenated pattern covers root projects
    "Lansum": [r"lansumproperties\.com/(projects/|\w+-\w+/)"],

    # Sumadhura: Main site root paths + subdomain projects
    # Reasoning: Projects on main site are root-level, subdomains follow {name}bysumadhura pattern
    "Sumadhura": [
        r"sumadhurarealty\.com/[\w-]+/",
        r"\w+bysumadhura\.com"
    ],

    # Vasavi group: Standard /projects/ structure
    # Reasoning: All projects under /projects/, generic and future-proof
    "Vasavi group": [r"thevasavigroup\.com/projects/"],

    # Vertex homes: All projects under /vertex-projects/ path
    # Reasoning: Consistent structure, all projects in one directory
    "Vertex homes": [r"vertexhomes\.com/vertex-projects/"],

    # Hallmark builders: Root-level .php files excluding navigation pages
    # Reasoning: Projects are .php files, exclude known non-project pages
    "Hallmark builders": [r"hallmarkbuilders\.in/(?!index|ongoing-projects|completed-projects)[a-z0-9-]+\.php"],
}

# Output directory for markdown files
OUTPUT_DIR = "../../frontend/content/properties"

# Default coordinates for Hyderabad (used as fallback)
DEFAULT_LAT = 17.4195
DEFAULT_LNG = 78.3580

# Rate limiting settings (seconds between requests)
REQUEST_DELAY = 1.0