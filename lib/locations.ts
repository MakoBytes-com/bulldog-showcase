// Per-city location landing page data. Each entry powers one /locations/[slug] page.
// Used by both the index page and the dynamic template, plus the LocalBusiness schema.

export type LocationOffice = {
  label: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  phoneHref?: string;
  isHq?: boolean;
};

export type LocationFaq = { q: string; a: string };

// Crime statistics block — sourced from FBI Uniform Crime Reports (2024 calendar
// year, released September 2025) via AreaVibes. Stats are city-only, not metro.
// Orlando PD does not report to FBI UCR, so its block uses a `note` instead.
export type LocationCrimeStats = {
  year: number;
  population: number;
  burglary?: { count: number; ratePer100k: number };
  propertyCrime?: { count: number; ratePer100k: number };
  // National property-crime rate per 100k for comparison (FBI UCR 2024).
  nationalAvgPropertyCrimeRate: number;
  // State-level burglary rate per 100k for comparison (FBI UCR 2024).
  stateAvgBurglaryRate?: number;
  source: string;
  note?: string;
};

export type LocationCity = {
  slug: string;
  city: string;
  state: string;
  stateFull: string;
  metro: string;
  region: "texas" | "florida";
  intro: string;
  whyLocal: string;
  neighborhoods: string[];
  process: string;
  offices: LocationOffice[];
  faqs: LocationFaq[];
  nearby: string[];
  crimeStats?: LocationCrimeStats;
};

// US national property-crime rate per 100k from FBI UCR 2024 (areavibes.com).
export const US_AVG_PROPERTY_CRIME_RATE = 1760;
// Texas state burglary rate per 100k (FBI UCR 2024).
export const TX_AVG_BURGLARY_RATE = 284.3;
// Florida state burglary rate per 100k (FBI UCR 2024).
export const FL_AVG_BURGLARY_RATE = 152.5;
// Most-cited "monitored alarm deterrence" finding — UNC Charlotte 2012 study by
// Drs. Joseph Kuhns and Seungmug Lee, "Understanding Decisions to Burglarize from
// the Offender's Perspective" (surveyed 422 incarcerated burglars).
export const ALARM_DETERRENCE_NOTE =
  "60% of convicted burglars said they'd avoid or move on from a home with a visible alarm system, per a UNC Charlotte study of 422 incarcerated burglars (Kuhns & Lee, 2012).";
export const CRIME_DATA_SOURCE = "FBI Uniform Crime Reports (UCR), 2024 — released September 2025";

export const LOCATIONS: LocationCity[] = [
  {
    slug: "houston",
    city: "Houston",
    state: "TX",
    stateFull: "Texas",
    metro: "Greater Houston",
    region: "texas",
    intro:
      "Houston is Bulldog Security Service's headquarters. From our Torrey Chase office in north Houston and our Space Park location near Clear Lake, we install ADT-monitored security and smart-home systems across the Greater Houston area — from The Woodlands and Spring down through the Heights, Montrose, the Galleria, Sugar Land, Katy, Pearland and out to League City and Clear Lake.",
    whyLocal:
      "Houston's mix of dense urban neighborhoods, sprawling subdivisions and Gulf Coast weather makes the right security setup matter. Hurricane season puts power-outage backup, cellular monitoring and water-leak detection at the top of the list, and porch-pirate season runs year-round. Every Bulldog install is built around what your specific home actually needs.",
    neighborhoods: [
      "The Woodlands",
      "Spring",
      "Cypress",
      "The Heights",
      "Montrose",
      "Galleria / Memorial",
      "West University",
      "Bellaire",
      "Sugar Land",
      "Katy",
      "Pearland",
      "Clear Lake",
      "League City",
      "Friendswood",
    ],
    process:
      "Most Houston installs start with a free virtual consult. Once you pick your package, our local techs schedule the install — typically within 3-7 days for residential. Same-day service is available in many neighborhoods. Every system is registered, monitored 24/7 from the ADT central station, and your dedicated account manager is local.",
    offices: [
      {
        label: "Houston — Headquarters",
        street: "14340 Torrey Chase Blvd",
        street2: "Suite 250",
        city: "Houston",
        state: "TX",
        zip: "77014",
        phone: "(832) 585-0725",
        phoneHref: "tel:+18325850725",
        isHq: true,
      },
      {
        label: "Houston — South / Clear Lake",
        street: "1322 Space Park Dr",
        street2: "Ste C150",
        city: "Houston",
        state: "TX",
        zip: "77058",
      },
    ],
    faqs: [
      {
        q: "Does Bulldog install in my Houston neighborhood?",
        a: "Yes — our crews cover the full Greater Houston area including The Woodlands, Cypress, Spring, the Heights, Montrose, the Galleria, West University, Bellaire, Sugar Land, Katy, Pearland and the Bay Area. If you're not sure, give us your ZIP and we'll confirm.",
      },
      {
        q: "Will my system stay on during a hurricane power outage?",
        a: "Every Bulldog system includes a 24-hour battery backup standard, and signals route over a dedicated cellular path — so even when power and internet go down, your alarm still reaches the central station and you keep getting alerts on your phone.",
      },
      {
        q: "How fast can I get installed in Houston?",
        a: "Standard residential installs are typically scheduled within 3-7 business days of your consult. Same-day install is available in many ZIPs depending on tech availability — ask when you book.",
      },
      {
        q: "What does ADT monitoring cost in Houston?",
        a: "Monitoring runs as low as the standard ADT monitored package, with options to add smart-home, video doorbell and full automation. We'll quote your exact monthly during the consult — no surprise add-ons.",
      },
    ],
    nearby: ["Sugar Land", "Katy", "Pearland", "The Woodlands", "League City", "Galveston"],
    crimeStats: {
      year: 2024,
      population: 2385298,
      burglary: { count: 14953, ratePer100k: 644.8 },
      propertyCrime: { count: 99572, ratePer100k: 4293 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
  {
    slug: "austin",
    city: "Austin",
    state: "TX",
    stateFull: "Texas",
    metro: "Austin Metro",
    region: "texas",
    intro:
      "From our Northland Drive office near the Domain, Bulldog Security Service installs ADT-monitored systems across Austin and the surrounding hill country — Round Rock, Cedar Park, Pflugerville, Lakeway, Bee Cave, West Lake Hills, Georgetown and Kyle.",
    whyLocal:
      "Austin's growth has brought new construction, new neighborhoods and new opportunity for door-to-door scams pretending to be from a name-brand security company. Bulldog is a real local Authorized ADT Dealer with a real Austin office and real local techs. Every install ships with cellular monitoring, smart-lock support, and the ADT app on your phone.",
    neighborhoods: [
      "Round Rock",
      "Cedar Park",
      "Leander",
      "Pflugerville",
      "Lakeway",
      "Bee Cave",
      "West Lake Hills",
      "Tarrytown",
      "Hyde Park",
      "Mueller",
      "Circle C",
      "Georgetown",
      "Kyle",
      "Buda",
    ],
    process:
      "Free virtual consult, package selection, then a local Austin tech installs typically within a week. Cellular monitoring is included — no internet dependency.",
    offices: [
      {
        label: "Austin",
        street: "3301 Northland Dr",
        street2: "STE 314",
        city: "Austin",
        state: "TX",
        zip: "78731",
      },
    ],
    faqs: [
      {
        q: "Does Bulldog cover Round Rock and Cedar Park?",
        a: "Yes — our Austin techs cover Round Rock, Cedar Park, Leander, Pflugerville, Lakeway, Bee Cave, West Lake Hills, Georgetown and Kyle from the Northland Drive office.",
      },
      {
        q: "Someone knocked on my door claiming to be ADT — was that you?",
        a: "Probably not. Bulldog does not solicit door-to-door. If you're not sure, hang up or close the door and call our Austin office directly to verify.",
      },
      {
        q: "Can you integrate smart locks and the Ring doorbell I already have?",
        a: "We can integrate most major smart-home brands into the ADT Control app. We'll confirm what works with your specific devices during the consult.",
      },
    ],
    nearby: ["Round Rock", "Cedar Park", "Pflugerville", "Lakeway", "Georgetown", "San Marcos"],
    crimeStats: {
      year: 2024,
      population: 988400,
      burglary: { count: 4383, ratePer100k: 445.1 },
      propertyCrime: { count: 31920, ratePer100k: 3242 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
  {
    slug: "dallas",
    city: "Dallas",
    state: "TX",
    stateFull: "Texas",
    metro: "Dallas-Fort Worth Metroplex",
    region: "texas",
    intro:
      "Bulldog Security Service's Dallas office on LBJ Freeway in Farmers Branch installs ADT-monitored security systems across the Dallas Metroplex — from Plano, Frisco and McKinney down through Highland Park, Lakewood, Oak Lawn and out to Mesquite, Garland and Rockwall.",
    whyLocal:
      "Dallas covers a huge metro with very different security needs from neighborhood to neighborhood — high-end Park Cities homes need different coverage than newer Frisco builds or downtown high-rises. Every Bulldog install starts with a walkthrough of your specific property so the system matches your actual layout, doors and habits.",
    neighborhoods: [
      "Plano",
      "Frisco",
      "McKinney",
      "Allen",
      "Richardson",
      "Highland Park",
      "University Park",
      "Lakewood",
      "Oak Lawn",
      "Preston Hollow",
      "Lake Highlands",
      "Mesquite",
      "Garland",
      "Rockwall",
    ],
    process:
      "Free virtual consult, then a local Dallas tech is dispatched. Most installs are completed within a week of the consult.",
    offices: [
      {
        label: "Dallas",
        street: "2727 LBJ Freeway",
        street2: "Ste. 436",
        city: "Farmers Branch",
        state: "TX",
        zip: "75234",
      },
    ],
    faqs: [
      {
        q: "Does Bulldog serve Plano, Frisco and McKinney?",
        a: "Yes — our Dallas techs cover the full DFW north corridor including Plano, Frisco, McKinney, Allen, Richardson and beyond.",
      },
      {
        q: "Do you work with HOAs in Highland Park / University Park?",
        a: "Yes. Bulldog's installs are wireless and require no exterior modifications, so HOA approvals in the Park Cities are typically straightforward. We'll handle paperwork on request.",
      },
      {
        q: "Can I get same-day install in Dallas?",
        a: "Same-day installs are available in many DFW ZIPs depending on tech availability. Ask during the consult.",
      },
    ],
    nearby: ["Plano", "Frisco", "McKinney", "Richardson", "Allen", "Rockwall"],
    crimeStats: {
      year: 2024,
      population: 1391819,
      burglary: { count: 6133, ratePer100k: 464.1 },
      propertyCrime: { count: 44295, ratePer100k: 3352 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
  {
    slug: "fort-worth",
    city: "Fort Worth",
    state: "TX",
    stateFull: "Texas",
    metro: "Dallas-Fort Worth Metroplex",
    region: "texas",
    intro:
      "From our office on Boulevard 26 in North Richland Hills, Bulldog Security Service installs ADT-monitored systems across the Fort Worth side of the Metroplex — Arlington, Southlake, Keller, Colleyville, Grapevine, Mansfield, Hurst-Euless-Bedford and beyond.",
    whyLocal:
      "Fort Worth and the mid-cities cover everything from older established neighborhoods near downtown to brand-new master-planned communities in Southlake and Keller. Every Bulldog install starts with a free walkthrough — no cookie-cutter packages.",
    neighborhoods: [
      "Arlington",
      "Southlake",
      "Keller",
      "Colleyville",
      "Grapevine",
      "Westlake",
      "Mansfield",
      "Hurst",
      "Euless",
      "Bedford",
      "North Richland Hills",
      "Watauga",
      "Saginaw",
      "Burleson",
    ],
    process:
      "Free consult, package selection, then a local tech installs your system — typically within a week.",
    offices: [
      {
        label: "Fort Worth — Mid-Cities",
        street: "7001 Boulevard 26",
        street2: "Suite 327",
        city: "North Richland Hills",
        state: "TX",
        zip: "76180",
      },
    ],
    faqs: [
      {
        q: "Do you cover Southlake and Keller?",
        a: "Yes — our Mid-Cities office handles all of the north Fort Worth corridor including Southlake, Keller, Colleyville, Grapevine and Westlake.",
      },
      {
        q: "What about Arlington and Mansfield?",
        a: "Yes. Arlington, Mansfield and the Burleson area are all covered by the same crew.",
      },
      {
        q: "Can I bundle service for multiple homes?",
        a: "Yes — landlords and snowbirds get multi-property pricing. Mention it during the consult.",
      },
    ],
    nearby: ["Arlington", "Southlake", "Keller", "Grapevine", "Mansfield", "Burleson"],
    crimeStats: {
      year: 2024,
      population: 926371,
      burglary: { count: 3437, ratePer100k: 344.6 },
      propertyCrime: { count: 26930, ratePer100k: 2700 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
  {
    slug: "san-antonio",
    city: "San Antonio",
    state: "TX",
    stateFull: "Texas",
    metro: "San Antonio Metro",
    region: "texas",
    intro:
      "Bulldog Security Service's San Antonio office on Crownhill Boulevard installs ADT-monitored systems across the San Antonio area — Stone Oak, Alamo Heights, Boerne, Schertz, New Braunfels and the surrounding hill country.",
    whyLocal:
      "San Antonio's mix of historic neighborhoods, expanding suburbs and rapidly growing 1604/281 corridor means a one-size system rarely fits. We start with a walkthrough, recommend what your specific home needs, and skip what it doesn't.",
    neighborhoods: [
      "Stone Oak",
      "Alamo Heights",
      "Olmos Park",
      "Terrell Hills",
      "Hollywood Park",
      "Shavano Park",
      "Helotes",
      "Boerne",
      "Schertz",
      "Cibolo",
      "New Braunfels",
      "Universal City",
    ],
    process:
      "Free virtual consult, then a local San Antonio tech is dispatched within the week. Cellular monitoring included.",
    offices: [
      {
        label: "San Antonio",
        street: "8700 Crownhill Blvd",
        street2: "Suite 507",
        city: "San Antonio",
        state: "TX",
        zip: "78209",
      },
    ],
    faqs: [
      {
        q: "Do you cover Stone Oak and the 1604 corridor?",
        a: "Yes — our San Antonio crew covers Stone Oak, the 1604/281 corridor, Alamo Heights, Shavano Park and out to Boerne.",
      },
      {
        q: "Can you install in New Braunfels and Schertz?",
        a: "Yes. New Braunfels, Schertz, Cibolo and Universal City are all part of the regular service area.",
      },
      {
        q: "What's the response time if my alarm goes off in San Antonio?",
        a: "Signals reach the ADT central station within seconds. The station verifies, contacts you, then dispatches SAPD or Bexar County Sheriff per your call list.",
      },
    ],
    nearby: ["Stone Oak", "Alamo Heights", "Boerne", "Schertz", "New Braunfels", "Cibolo"],
    crimeStats: {
      year: 2024,
      population: 1573237,
      burglary: { count: 7505, ratePer100k: 495.6 },
      propertyCrime: { count: 70023, ratePer100k: 4624 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
  {
    slug: "orlando",
    city: "Orlando",
    state: "FL",
    stateFull: "Florida",
    metro: "Greater Orlando",
    region: "florida",
    intro:
      "From our Longwood office, Bulldog Security Service installs ADT-monitored systems across the Greater Orlando area — Winter Park, Lake Mary, Altamonte Springs, Apopka, Oviedo, Sanford and out to Kissimmee and Lake Nona.",
    whyLocal:
      "Central Florida's mix of seasonal residents, rental properties and tropical weather means systems need cellular monitoring, water-leak detection and battery backup as standard, not as add-ons. Every Bulldog install is built around how your home is actually used.",
    neighborhoods: [
      "Winter Park",
      "Lake Mary",
      "Altamonte Springs",
      "Longwood",
      "Apopka",
      "Oviedo",
      "Sanford",
      "Maitland",
      "Casselberry",
      "Lake Nona",
      "Dr. Phillips",
      "Kissimmee",
      "Windermere",
    ],
    process:
      "Free consult, then a local Orlando tech installs your system. Hurricane-season-ready as standard.",
    offices: [
      {
        label: "Orlando — Longwood",
        street: "2170 West State Rd 434",
        street2: "Ste 320",
        city: "Longwood",
        state: "FL",
        zip: "32714",
      },
    ],
    faqs: [
      {
        q: "Will my system work during a hurricane?",
        a: "Every Bulldog system ships with 24-hour battery backup and cellular monitoring — so even when power and internet are out, the alarm still reaches the central station and you still get alerts.",
      },
      {
        q: "Do you serve Lake Mary and Lake Nona?",
        a: "Yes — our Longwood office covers Lake Mary, Lake Nona, Winter Park, Oviedo, Sanford, Apopka and out to Kissimmee.",
      },
      {
        q: "Can you do vacation-rental and snowbird setups?",
        a: "Yes. We can configure your system for seasonal occupancy, send alerts to your property manager, and let multiple users arm/disarm from their own phones.",
      },
    ],
    nearby: ["Winter Park", "Lake Mary", "Sanford", "Oviedo", "Kissimmee", "Apopka"],
    crimeStats: {
      year: 2024,
      population: 294679,
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE,
      source: "Orlando Police Department (city-level FBI UCR data not currently published for Orlando)",
      note: "Orlando PD does not currently submit data to the FBI Uniform Crime Reports. For the most current local crime statistics, consult the Orlando Police Department's published reports or the Orange County Sheriff's Office.",
    },
  },
  {
    slug: "tampa",
    city: "Tampa",
    state: "FL",
    stateFull: "Florida",
    metro: "Tampa Bay",
    region: "florida",
    intro:
      "From our office on West Busch Boulevard, Bulldog Security Service installs ADT-monitored systems across Tampa Bay — South Tampa, Westchase, New Tampa, Brandon, Riverview, St. Petersburg and Clearwater.",
    whyLocal:
      "Tampa Bay's coastal weather, dense established neighborhoods and rapidly growing suburbs mean every install is different. Hurricane-ready cellular monitoring, water-leak sensors and battery backup come standard on every Bulldog system.",
    neighborhoods: [
      "South Tampa",
      "Hyde Park",
      "Westchase",
      "New Tampa",
      "Carrollwood",
      "Town 'N' Country",
      "Brandon",
      "Riverview",
      "Apollo Beach",
      "St. Petersburg",
      "Clearwater",
      "Largo",
      "Pinellas Park",
    ],
    process:
      "Free consult, then a local Tampa tech installs your system. Most installs scheduled within a week.",
    offices: [
      {
        label: "Tampa",
        street: "2901 W. Busch Blvd",
        street2: "UNIT 906",
        city: "Tampa",
        state: "FL",
        zip: "33618",
      },
    ],
    faqs: [
      {
        q: "Does Bulldog cover St. Pete and Clearwater?",
        a: "Yes — our Tampa techs cover both sides of the bay including St. Petersburg, Clearwater, Largo and Pinellas Park.",
      },
      {
        q: "Will my alarm work during a hurricane?",
        a: "Yes. Every system includes 24-hour battery backup and cellular monitoring — so signals still reach the central station even when power and internet are out.",
      },
      {
        q: "Do you do water-leak monitoring for Tampa homes?",
        a: "Yes. Water-leak sensors are an inexpensive add-on and well worth it in this climate, especially for bathrooms, water heaters and laundry rooms.",
      },
    ],
    nearby: ["St. Petersburg", "Clearwater", "Brandon", "Riverview", "Westchase", "Largo"],
    crimeStats: {
      year: 2024,
      population: 403927,
      burglary: { count: 684, ratePer100k: 167.4 },
      propertyCrime: { count: 5988, ratePer100k: 1465 },
      nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE,
      stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE,
      source: CRIME_DATA_SOURCE,
    },
  },
];

export const TX_LOCATIONS = LOCATIONS.filter((l) => l.region === "texas");
export const FL_LOCATIONS = LOCATIONS.filter((l) => l.region === "florida");

export function getLocationBySlug(slug: string): LocationCity | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
