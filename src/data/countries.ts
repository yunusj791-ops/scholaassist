export interface CountryInfo {
  code: string;
  name: string;
  region: 'Africa' | 'Europe' | 'North America' | 'Asia' | 'South America' | 'Oceania';
  currency: string;
  currencySymbol: string;
  rateToUSD: number; // approximate rate for conversion display
  flag: string;
  educationSystem: string;
  supportedPaymentGateways: ('paystack' | 'stripe' | 'paypal' | 'cards')[];
  popularInstitutions: string[];
}

export const COUNTRIES: CountryInfo[] = [
  // Africa
  {
    code: 'NG',
    name: 'Nigeria',
    region: 'Africa',
    currency: 'NGN',
    currencySymbol: '₦',
    rateToUSD: 1450,
    flag: '🇳🇬',
    educationSystem: 'Commonwealth 5-Chapter (ND, HND, BSc, PGD, MSc, PhD)',
    supportedPaymentGateways: ['paystack', 'cards', 'paypal'],
    popularInstitutions: [
      'University of Lagos (UNILAG)',
      'Ahmadu Bello University (ABU Zaria)',
      'University of Ibadan (UI)',
      'Federal University of Technology, Akure (FUTA)',
      'University of Nigeria, Nsukka (UNN)',
      'Obafemi Awolowo University (OAU)',
      'Covenant University',
      'Yaba College of Technology (YABATECH)',
      'Federal Polytechnic, Nekede',
      'Lagos State University (LASU)'
    ]
  },
  {
    code: 'GH',
    name: 'Ghana',
    region: 'Africa',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    rateToUSD: 15.5,
    flag: '🇬🇭',
    educationSystem: 'Commonwealth 5-Chapter (Diploma, BSc, MPhil, PhD)',
    supportedPaymentGateways: ['paystack', 'cards', 'paypal'],
    popularInstitutions: [
      'University of Ghana (Legon)',
      'Kwame Nkrumah University of Science and Technology (KNUST)',
      'University of Cape Coast (UCC)',
      'Ashesi University',
      'Accra Technical University'
    ]
  },
  {
    code: 'KE',
    name: 'Kenya',
    region: 'Africa',
    currency: 'KES',
    currencySymbol: 'KSh',
    rateToUSD: 130,
    flag: '🇰🇪',
    educationSystem: 'East African 5-Chapter (Diploma, Bachelor, Master, PhD)',
    supportedPaymentGateways: ['paystack', 'cards', 'paypal'],
    popularInstitutions: [
      'University of Nairobi (UoN)',
      'Kenyatta University',
      'Strathmore University',
      'Jomo Kenyatta University of Agriculture and Technology (JKUAT)',
      'Moi University'
    ]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    region: 'Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    rateToUSD: 18.2,
    flag: '🇿🇦',
    educationSystem: 'South African NQF (Higher Cert, Diploma, Bachelor, Honours, Master, PhD)',
    supportedPaymentGateways: ['paystack', 'cards', 'paypal', 'stripe'],
    popularInstitutions: [
      'University of Cape Town (UCT)',
      'University of the Witwatersrand (Wits)',
      'Stellenbosch University',
      'University of Pretoria',
      'University of Johannesburg'
    ]
  },
  {
    code: 'EG',
    name: 'Egypt',
    region: 'Africa',
    currency: 'EGP',
    currencySymbol: 'E£',
    rateToUSD: 48,
    flag: '🇪🇬',
    educationSystem: 'North African Academic Standard',
    supportedPaymentGateways: ['cards', 'paypal', 'stripe'],
    popularInstitutions: [
      'Cairo University',
      'Ain Shams University',
      'Alexandria University',
      'American University in Cairo'
    ]
  },
  {
    code: 'RW',
    name: 'Rwanda',
    region: 'Africa',
    currency: 'RWF',
    currencySymbol: 'FRw',
    rateToUSD: 1350,
    flag: '🇷🇼',
    educationSystem: 'East African Commonwealth Standard',
    supportedPaymentGateways: ['cards', 'paypal'],
    popularInstitutions: [
      'University of Rwanda',
      'Carnegie Mellon University Africa',
      'African Leadership University'
    ]
  },
  {
    code: 'UG',
    name: 'Uganda',
    region: 'Africa',
    currency: 'UGX',
    currencySymbol: 'USh',
    rateToUSD: 3700,
    flag: '🇺🇬',
    educationSystem: 'East African Commonwealth Standard',
    supportedPaymentGateways: ['cards', 'paypal'],
    popularInstitutions: [
      'Makerere University',
      'Kyambogo University',
      'Uganda Christian University'
    ]
  },

  // North America
  {
    code: 'US',
    name: 'United States',
    region: 'North America',
    currency: 'USD',
    currencySymbol: '$',
    rateToUSD: 1,
    flag: '🇺🇸',
    educationSystem: 'US Higher Ed (Associate, Bachelor, Master, PhD / Dissertation)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Harvard University',
      'Stanford University',
      'Massachusetts Institute of Technology (MIT)',
      'University of California, Berkeley',
      'University of Texas at Austin',
      'New York University (NYU)',
      'Georgia Institute of Technology',
      'University of Michigan'
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    region: 'North America',
    currency: 'CAD',
    currencySymbol: 'CA$',
    rateToUSD: 1.36,
    flag: '🇨🇦',
    educationSystem: 'Canadian University Standard (Bachelor, Master, PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'University of Toronto',
      'University of British Columbia (UBC)',
      'McGill University',
      'University of Waterloo',
      'University of Alberta'
    ]
  },

  // Europe
  {
    code: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    currency: 'GBP',
    currencySymbol: '£',
    rateToUSD: 0.78,
    flag: '🇬🇧',
    educationSystem: 'UK Higher Ed (Foundation, BSc/BA, MSc/MA/MRes, PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'University of Oxford',
      'University of Cambridge',
      'Imperial College London',
      'University College London (UCL)',
      'University of Manchester',
      'University of Edinburgh',
      'King’s College London'
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    region: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 0.92,
    flag: '🇩🇪',
    educationSystem: 'Bologna European (Bachelor, Master, Promotion/PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Technical University of Munich (TUM)',
      'Ludwig Maximilian University of Munich (LMU)',
      'Heidelberg University',
      'Humboldt University of Berlin',
      'RWTH Aachen University'
    ]
  },
  {
    code: 'FR',
    name: 'France',
    region: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 0.92,
    flag: '🇫🇷',
    educationSystem: 'LMD System (Licence, Master, Doctorat)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Sorbonne University',
      'École Polytechnique',
      'Paris Sciences et Lettres (PSL)',
      'University of Paris-Saclay'
    ]
  },
  {
    code: 'NL',
    name: 'Netherlands',
    region: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUSD: 0.92,
    flag: '🇳🇱',
    educationSystem: 'Bologna European (WO / HBO Bachelor, Master, PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Delft University of Technology (TU Delft)',
      'University of Amsterdam',
      'Erasmus University Rotterdam',
      'Utrecht University'
    ]
  },

  // Asia & Middle East
  {
    code: 'IN',
    name: 'India',
    region: 'Asia',
    currency: 'INR',
    currencySymbol: '₹',
    rateToUSD: 83.5,
    flag: '🇮🇳',
    educationSystem: 'UGC / AICTE Standard (B.Tech, B.Sc, B.Com, M.Tech, Ph.D)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Indian Institute of Technology (IIT Bombay / Delhi / Madras)',
      'Indian Institute of Science (IISc Bangalore)',
      'University of Delhi',
      'Jawaharlal Nehru University (JNU)',
      'BITS Pilani'
    ]
  },
  {
    code: 'MY',
    name: 'Malaysia',
    region: 'Asia',
    currency: 'MYR',
    currencySymbol: 'RM',
    rateToUSD: 4.4,
    flag: '🇲🇾',
    educationSystem: 'Malaysian Higher Ed (Diploma, Degree, Master, PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Universiti Malaya (UM)',
      'Universiti Teknologi Malaysia (UTM)',
      'Universiti Kebangsaan Malaysia (UKM)',
      'Monash University Malaysia'
    ]
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    region: 'Asia',
    currency: 'AED',
    currencySymbol: 'AED',
    rateToUSD: 3.67,
    flag: '🇦🇪',
    educationSystem: 'International & UAE CAA Standard',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'United Arab Emirates University (UAEU)',
      'American University of Sharjah',
      'Khalifa University',
      'New York University Abu Dhabi'
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    region: 'Asia',
    currency: 'SGD',
    currencySymbol: 'S$',
    rateToUSD: 1.34,
    flag: '🇸🇬',
    educationSystem: 'Singapore University Standard',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'National University of Singapore (NUS)',
      'Nanyang Technological University (NTU)',
      'Singapore Management University (SMU)'
    ]
  },

  // Oceania
  {
    code: 'AU',
    name: 'Australia',
    region: 'Oceania',
    currency: 'AUD',
    currencySymbol: 'A$',
    rateToUSD: 1.52,
    flag: '🇦🇺',
    educationSystem: 'AQF Standard (Diploma, Bachelor, Honours, Master, PhD)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'University of Melbourne',
      'University of Sydney',
      'Australian National University (ANU)',
      'University of Queensland',
      'UNSW Sydney'
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    region: 'Oceania',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    rateToUSD: 1.65,
    flag: '🇳🇿',
    educationSystem: 'NZQF Standard (Bachelor, Master, Doctoral)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'University of Auckland',
      'University of Otago',
      'Victoria University of Wellington'
    ]
  },

  // South America
  {
    code: 'BR',
    name: 'Brazil',
    region: 'South America',
    currency: 'BRL',
    currencySymbol: 'R$',
    rateToUSD: 5.4,
    flag: '🇧🇷',
    educationSystem: 'MEC Standard (Graduação, Mestrado, Doutorado)',
    supportedPaymentGateways: ['stripe', 'paypal', 'cards'],
    popularInstitutions: [
      'Universidade de São Paulo (USP)',
      'Universidade Estadual de Campinas (Unicamp)',
      'Universidade Federal do Rio de Janeiro (UFRJ)'
    ]
  }
];

export const INSTITUTION_TYPES = [
  'University',
  'Polytechnic / Monotechnic',
  'College of Education',
  'Institute of Technology',
  'Community College / Vocational Institute',
  'Research Institute / Postgraduate School'
];

export const ACADEMIC_LEVELS = [
  'OND / National Diploma (2-Year)',
  'HND / Higher National Diploma',
  'Undergraduate / Bachelor’s Degree (BSc, BA, BEng, LLB)',
  'Postgraduate Diploma (PGD)',
  'Master’s Degree (MSc, MA, MPhil, MBA)',
  'Doctoral / PhD Dissertation',
  'Postdoctoral Research / Academic Fellowship'
];
