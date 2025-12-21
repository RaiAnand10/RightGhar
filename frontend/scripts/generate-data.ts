import * as fs from 'fs';
import * as path from 'path';

interface PropertyMetadata {
  id: string;
  project: string;
  builder: string;
  location: string;
  configuration: string;
  totalUnits: number;
  area: string;
  price: string;
  possession: string;
  rera: string;
  towers: number;
  floors: string;
  unitSizes: string;
  clubhouse: string;
  openSpace: string;
}

interface Property {
  metadata: PropertyMetadata;
  content: string;
}

function parseMarkdownFile(filePath: string): Property | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      console.warn(`No frontmatter found in ${filePath}`);
      return null;
    }
    
    const frontmatter = match[1];
    const markdownContent = content.slice(match[0].length).trim();
    
    // Parse frontmatter
    const metadata: any = {};
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(/^"|"$/g, '');
        // Convert numeric strings to numbers
        if (key.trim() === 'totalUnits' || key.trim() === 'towers') {
          metadata[key.trim()] = parseInt(value) || 0;
        } else {
          metadata[key.trim()] = value;
        }
      }
    });
    
    return {
      metadata: metadata as PropertyMetadata,
      content: markdownContent
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function generateDataFile() {
  const contentDir = path.join(process.cwd(), 'content', 'properties');
  const outputDir = path.join(process.cwd(), 'src');
  const outputFile = path.join(outputDir, 'data.ts');
  
  // Read all markdown files
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  
  const properties: Property[] = [];
  
  files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const property = parseMarkdownFile(filePath);
    if (property) {
      properties.push(property);
    }
  });
  
  // Sort by project name
  properties.sort((a, b) => a.metadata.project.localeCompare(b.metadata.project));
  
  // Generate TypeScript file
  const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated on: ${new Date().toISOString()}

export interface PropertyMetadata {
  id: string;
  project: string;
  builder: string;
  location: string;
  configuration: string;
  totalUnits: number;
  area: string;
  price: string;
  possession: string;
  rera: string;
  towers: number;
  floors: string;
  unitSizes: string;
  clubhouse: string;
  openSpace: string;
}

export interface Property {
  metadata: PropertyMetadata;
  content: string;
}

export const properties: Property[] = ${JSON.stringify(properties, null, 2)};

export function getPropertyById(id: string): Property | undefined {
  return properties.find(p => p.metadata.id === id);
}

export function getPropertiesByBuilder(builder: string): Property[] {
  return properties.filter(p => p.metadata.builder === builder);
}

export function getPropertiesByLocation(location: string): Property[] {
  return properties.filter(p => 
    p.metadata.location.toLowerCase().includes(location.toLowerCase())
  );
}

export function getPropertiesByConfiguration(config: string): Property[] {
  return properties.filter(p => 
    p.metadata.configuration.toLowerCase().includes(config.toLowerCase())
  );
}
`;
  
  fs.writeFileSync(outputFile, tsContent, 'utf-8');
  console.log(`✅ Generated data.ts with ${properties.length} properties`);
  console.log(`📍 Output: ${outputFile}`);
}

// Run the generator
generateDataFile();
