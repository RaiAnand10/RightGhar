import { BHKFilter, PriceRange } from '../types';

export const priceRanges: { value: PriceRange; label: string }[] = [
  { value: '0.5-1', label: '₹50L - ₹1Cr' },
  { value: '1-1.5', label: '₹1Cr - ₹1.5Cr' },
  { value: '1.5-2', label: '₹1.5Cr - ₹2Cr' },
  { value: '2-2.5', label: '₹2Cr - ₹2.5Cr' },
  { value: '2.5-4', label: '₹2.5Cr - ₹4Cr' },
  { value: '4-6', label: '₹4Cr - ₹6Cr' },
  { value: '6-10', label: '₹6Cr - ₹10Cr' },
  { value: '10+', label: '₹10Cr+' },
];

export const possessionYears = ['2026', '2027', '2028', '2029'];

export const bhkOptions: BHKFilter[] = ['2', '3', '4'];

export const cityOptions = ['Hyderabad', 'Bangalore'];

export const localityOptions: { [key: string]: string[] } = {
  'Hyderabad': [
    'Kokapet',
    'Tellapur',
    'Kondapur',
    'Financial District',
    'Osman Nagar',
    'Neopolis',
    'Narsingi',
    'Nallagandla',
    'Gopanpally',
    'Rajendra Nagar',
    'Puppalaguda',
    'Kompally',
    'Uppal',
    'Miyapur',
    'Manchirevula',
    'Kukatpally',
    'Kollur',
    'Gachibowli',
    'Bachupally',
    'Shamshabad'
  ],
  'Bangalore': []
};

export const builderOptions = [
  'Aparna Constructions',
  'Ramky Estates',
  'Rajapushpa Properties',
  'Vasavi group',
  'Hallmark builders',
  'Myscape',
  'My Home Group',
  'My Home Constructions',
  'DSR builders',
  'Vertex homes',
  'Prestige Constructions',
  'Jayabheri',
  'Candeur',
  'Raghava',
  'Lansum',
  'Honer Homes',
  'Sumadhura',
  'GHR infra',
  'Brigade',
  'ASBL'
];
