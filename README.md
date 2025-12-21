# RightGhar

**Pick right. Live better**

A modern web platform for discovering and comparing residential properties in Hyderabad. RightGhar helps you make informed decisions about your next home by providing comprehensive property information, comparisons, and insights.

## 🏠 About

RightGhar is designed to simplify the home-buying process by aggregating detailed information about residential projects from leading builders in Hyderabad, including:

- Aparna Constructions
- My Home Constructions
- Rajapushpa Properties
- ASBL

## ✨ Features

- **Property Listings**: Browse through curated residential projects with detailed information
- **Interactive Cards**: Click on property cards to view comprehensive details
- **Search & Filter**: Find properties based on location, configuration, price, and more
- **Property Comparison**: Compare multiple properties side-by-side
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Property information updated regularly

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS** - Custom styling for minimalistic design

### Content Management
- **Markdown** - Property data stored in structured .md files
- **Build-time Generation** - Compiled to TypeScript during build

## 📁 Project Structure

```
PickYourFlat/
├── frontend/                    # Frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── PropertyCard.tsx
│   │   │   └── PropertyModal.tsx
│   │   ├── data.ts              # Generated property data
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── content/                 # Property markdown files
│   │   └── properties/
│   │       ├── aparna-zenon.md
│   │       ├── aparna-moonstone.md
│   │       └── ...
│   ├── scripts/
│   │   └── generate-data.ts     # Build script for data generation
│   └── package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RaiAnand10/RightGhar.git
cd RightGhar
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Generate property data:
```bash
npm run generate-data
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📝 Adding New Properties

1. Create a new markdown file in `frontend/content/properties/`
2. Follow the schema structure with frontmatter and sections
3. Run `npm run generate-data` to update the data file
4. Restart the dev server to see changes

### Property Schema

```yaml
---
project: "Project Name"
builder: "Builder Name"
location: "Location, City"
configuration: "2 BHK, 3 BHK, 4 BHK"
totalUnits: "Number of units"
area: "Land area"
price: "Starting price"
possession: "Date/Status"
rera: "RERA Number"
towers: "Number of towers"
floors: "Floor configuration"
---

# Project Name

## Overview
[Project description]

## Standout Features
[Key features]

## Amenities
[Amenities list]

## Location Highlights
[Location benefits]

## Investment Insights
[Investment information]

## Contact Information
[Contact details]
```

## 🎯 Roadmap

- [ ] Advanced search and filtering
- [ ] Property comparison tool
- [ ] User authentication
- [ ] Saved properties and favorites
- [ ] Price trends and analytics
- [ ] Virtual tours integration
- [ ] EMI calculator
- [ ] Nearby amenities map

## 🤝 Contributing

This is a private project. Contributions are currently limited to the core team.

## 📄 License

Private - All rights reserved

## 📧 Contact

For inquiries about listed properties, please contact the respective builders directly through the contact information provided in each property listing.

---

**Disclaimer**: All property information is provided for informational purposes only. Please verify all details with the respective builders and authorized sales representatives. Property prices, configurations, and availability are subject to change.
