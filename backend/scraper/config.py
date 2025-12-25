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
    "Godrej properties": "https://www.godrej-homes.net/allprojects-platter/Hyderabad%20projects",
    "Ramky Estates": "https://www.ramkyestates.com/location/hyderabad/",
    "Sumadhura": "https://sumadhurarealty.com/#projects",
    "Vasavi group": "https://thevasavigroup.com/",
    "Vertex homes": "https://vertexhomes.com/projecthome",
    "Modi builders": "https://www.modibuilders.com/current-projects-modi-builders",
    "Hallmark builders": "https://hallmarkbuilders.in/ongoing-projects",
    "Brigade": "https://www.brigadegroup.com/residential/projects/hyderabad",
    "Jain constructions": "https://www.jainconstructions.com/ongoing-projects"
}

# Output directory for markdown files
OUTPUT_DIR = "../../frontend/content/properties"

# Default coordinates for Hyderabad (used as fallback)
DEFAULT_LAT = 17.4195
DEFAULT_LNG = 78.3580

# Rate limiting settings (seconds between requests)
REQUEST_DELAY = 1.0