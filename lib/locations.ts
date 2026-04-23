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
    nearby: ["Sugar Land", "Katy", "Pearland", "The Woodlands", "Spring", "Cypress", "West University", "Bellaire", "Friendswood", "League City", "Galveston"],
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
    nearby: ["Round Rock", "Cedar Park", "Leander", "Pflugerville", "Lakeway", "Bee Cave", "West Lake Hills", "Tarrytown", "Hyde Park", "Mueller", "Circle C", "Georgetown", "Kyle", "Buda", "San Marcos"],
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
    nearby: ["Plano", "Frisco", "McKinney", "Allen", "Richardson", "Highland Park", "University Park", "Lakewood", "Oak Lawn", "Preston Hollow", "Lake Highlands", "Mesquite", "Garland", "Rockwall"],
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
    nearby: ["Arlington", "Southlake", "Keller", "Colleyville", "Grapevine", "Westlake", "Mansfield", "Hurst", "Euless", "Bedford", "North Richland Hills", "Watauga", "Saginaw", "Burleson"],
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
    nearby: ["Stone Oak", "Alamo Heights", "Olmos Park", "Terrell Hills", "Hollywood Park", "Shavano Park", "Helotes", "Boerne", "Schertz", "Cibolo", "New Braunfels", "Universal City"],
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
    nearby: ["Winter Park", "Lake Mary", "Altamonte Springs", "Longwood", "Apopka", "Oviedo", "Sanford", "Maitland", "Casselberry", "Lake Nona", "Dr. Phillips", "Kissimmee", "Windermere"],
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
    nearby: ["St. Petersburg", "Clearwater", "Brandon", "Riverview", "South Tampa", "Hyde Park", "Westchase", "New Tampa", "Carrollwood", "Town 'N' Country", "Apollo Beach", "Largo", "Pinellas Park"],
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

// Satellite cities — areas Bulldog serves out of a parent office. Each has its
// own SEO-targeted page at /locations/[slug] with real FBI UCR 2024 data.
export type SatelliteCity = {
  slug: string;
  city: string;
  state: string;
  stateFull: string;
  region: "texas" | "florida";
  parentSlug: string;
  intro: string;
  crimeStats: LocationCrimeStats;
};

export const SATELLITES: SatelliteCity[] = [
  // Houston metro
  {
    slug: "sugar-land",
    city: "Sugar Land",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Sugar Land is one of the lowest-crime suburbs in the Houston metro — but its mix of master-planned communities and through-traffic from US-59/I-69 still makes smart-home security and video doorbells worth having. Bulldog serves Sugar Land, Greatwood, Telfair, New Territory and First Colony out of our Houston offices.",
    crimeStats: { year: 2024, population: 123135, burglary: { count: 128, ratePer100k: 118.8 }, propertyCrime: { count: 1491, ratePer100k: 1384 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "katy",
    city: "Katy",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Katy and the surrounding I-10 west corridor (Cinco Ranch, Cross Creek Ranch, Firethorne) are some of the fastest-growing communities in Texas. Bulldog installs ADT-monitored security and Z-wave automation across the Katy ISD area from our Houston offices.",
    crimeStats: { year: 2024, population: 21057, burglary: { count: 69, ratePer100k: 248.1 }, propertyCrime: { count: 905, ratePer100k: 3254 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "pearland",
    city: "Pearland",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Pearland's Brazoria County subdivisions and Shadow Creek Ranch master-planned community keep growing. Bulldog serves Pearland, Manvel and Friendswood from our Houston offices — local techs, real ADT monitoring, no door-to-door pressure sales.",
    crimeStats: { year: 2024, population: 130314, burglary: { count: 185, ratePer100k: 144.2 }, propertyCrime: { count: 1848, ratePer100k: 1440 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "the-woodlands",
    city: "The Woodlands",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "The Woodlands is a census-designated place rather than an incorporated city, so FBI UCR doesn't publish dedicated city-level burglary numbers. Bulldog still serves The Woodlands, Spring, Conroe, Tomball and Magnolia from our Houston HQ — same techs, same ADT monitoring.",
    crimeStats: { year: 2024, population: 118070, propertyCrime: { count: 0, ratePer100k: 938 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (city-level data not directly published)", note: "The Woodlands is a CDP — Montgomery County Sheriff's Office handles policing, and FBI UCR does not publish a separate city-level table. The number above is an AreaVibes estimate based on county demographics, not a directly-reported figure." },
  },
  {
    slug: "league-city",
    city: "League City",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "League City and the rest of the Bay Area (Friendswood, Webster, Clear Lake) sit close to our South Houston office on Space Park Drive. Bulldog installs ADT-monitored security throughout Galveston County's north end.",
    crimeStats: { year: 2024, population: 107571, burglary: { count: 204, ratePer100k: 174.5 }, propertyCrime: { count: 1356, ratePer100k: 1160 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "galveston",
    city: "Galveston",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Galveston Island's mix of vacation rentals, year-round residents and Gulf-front exposure means hurricane-ready cellular monitoring, water-leak sensors and battery backup aren't optional — they're standard on every Bulldog system. Served from our South Houston office.",
    crimeStats: { year: 2024, population: 52052, burglary: { count: 139, ratePer100k: 261.8 }, propertyCrime: { count: 1264, ratePer100k: 2380 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Houston metro — additional neighborhoods/cities served from the HQ
  {
    slug: "spring",
    city: "Spring",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Spring is a CDP in Harris and Montgomery Counties just north of the Houston HQ off I-45. Old Town Spring's historic district plus the newer Klein/Champions area are all served by Bulldog from our Torrey Chase office a few miles south.",
    crimeStats: { year: 2024, population: 63363, propertyCrime: { count: 0, ratePer100k: 2129 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (CDP, no city-level table)", note: "Spring is a CDP — Harris County Sheriff and Klein/Spring ISD area patrols cover policing, and the FBI UCR doesn't publish a separate city-level table. The number above is a demographic estimate from AreaVibes, not a directly-reported figure." },
  },
  {
    slug: "cypress",
    city: "Cypress",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Cypress sits in northwest Harris County along US-290 — a fast-growing master-planned-community area (Bridgeland, Towne Lake, Fairfield, Coles Crossing). Bulldog covers Cypress from our Houston HQ, with same-week installs typical.",
    crimeStats: { year: 2024, population: 195000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Harris County Sheriff's Office (CDP, no city-level FBI UCR table)", note: "Cypress is a CDP — Harris County Sheriff handles patrol, and there's no separate city-level FBI UCR table. For current local incidents, see HCSO's online crime maps or contact the Cypress Patrol District." },
  },
  {
    slug: "the-heights",
    city: "The Heights",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "The Heights is a historic Houston neighborhood inside the 610 Loop — older bungalows and remodeled craftsman homes mixed with newer townhomes. Patrolled by HPD, served by Bulldog from our Torrey Chase HQ. Most installs here are smart-lock + video doorbell + ADT Command panel for the older homes.",
    crimeStats: { year: 2024, population: 50000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Houston PD (neighborhood within Houston city limits)", note: "The Heights is a Houston neighborhood, not a separate municipality. Crime stats are reported at the Houston city level — see the main Houston page for the FBI UCR figures (8,318 registered offenders, 14,953 burglaries city-wide in 2024)." },
  },
  {
    slug: "montrose",
    city: "Montrose",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Montrose is one of Houston's most walkable inner-loop neighborhoods — older bungalows, mid-rise condos and museum-district edge. HPD-patrolled, served by Bulldog from our HQ. Smart locks and video doorbells are particularly popular with the dense pedestrian foot traffic.",
    crimeStats: { year: 2024, population: 35000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Houston PD (neighborhood within Houston city limits)", note: "Montrose is a Houston neighborhood, not a separate municipality. Crime stats are reported at the Houston city level — see the main Houston page for the FBI UCR figures." },
  },
  {
    slug: "galleria-memorial",
    city: "Galleria / Memorial",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "The Galleria / Memorial corridor along I-610 West and Memorial Drive includes high-rises, gated communities, and the Memorial Villages. HPD plus the Memorial Villages Police Department cover this area. Bulldog serves it from our Torrey Chase HQ.",
    crimeStats: { year: 2024, population: 130000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Houston PD + Memorial Villages PD", note: "The Galleria area falls under Houston city limits (HPD patrol). The Memorial Villages (Bunker Hill, Hedwig, Hilshire, Hunters Creek, Piney Point, Spring Valley) have their own PD with separate small-jurisdiction reporting. See the main Houston page for HPD city-wide stats." },
  },
  {
    slug: "west-university",
    city: "West University",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "West University Place is a small incorporated city of ~16k residents inside the 610 Loop, surrounded by Houston. West U has its own PD and is one of the safest residential communities in the metro — 8 burglaries in all of 2024. Bulldog covers West U, Southside Place and Southampton from our Houston HQ.",
    crimeStats: { year: 2024, population: 16021, burglary: { count: 8, ratePer100k: 54.3 }, propertyCrime: { count: 146, ratePer100k: 992 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "bellaire",
    city: "Bellaire",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Bellaire is an incorporated city of ~20k residents inside the 610 Loop, fully surrounded by Houston. Bellaire PD handles its own patrol. Bulldog serves Bellaire and the surrounding inner-loop area from our Houston HQ.",
    crimeStats: { year: 2024, population: 19553, burglary: { count: 37, ratePer100k: 218.2 }, propertyCrime: { count: 403, ratePer100k: 2376 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "clear-lake",
    city: "Clear Lake",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Clear Lake spans portions of Houston, Webster, Nassau Bay and Seabrook around the NASA Johnson Space Center. Multiple PD jurisdictions overlap. Bulldog covers Clear Lake out of our South Houston office on Space Park Drive — literally a few minutes from most Clear Lake addresses.",
    crimeStats: { year: 2024, population: 60000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Multiple PD jurisdictions (Houston, Webster, Nassau Bay, Seabrook)", note: "Clear Lake is a regional area, not a single municipality — it spans Houston, Webster, Nassau Bay and Seabrook with different PDs handling each portion. For city-level FBI UCR data, see the relevant city's stats. League City covers the south portion." },
  },
  {
    slug: "friendswood",
    city: "Friendswood",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "houston",
    intro:
      "Friendswood is an incorporated city of ~41k in Galveston and Harris Counties south of Houston. One of the lower burglary rates in the area (51 per 100k in 2024). Bulldog serves Friendswood from our South Houston office on Space Park Drive.",
    crimeStats: { year: 2024, population: 40785, burglary: { count: 21, ratePer100k: 51.5 }, propertyCrime: { count: 222, ratePer100k: 545 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Austin metro
  {
    slug: "round-rock",
    city: "Round Rock",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Round Rock's growth along I-35 and the Dell tech corridor brings new construction and new neighborhoods every year. Bulldog covers Round Rock, Hutto and Brushy Creek from our Austin office on Northland Drive.",
    crimeStats: { year: 2024, population: 133597, burglary: { count: 228, ratePer100k: 170.3 }, propertyCrime: { count: 2598, ratePer100k: 1941 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "cedar-park",
    city: "Cedar Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Cedar Park and Leander sit on the north-west side of the Austin metro and consistently rank among Texas's safer suburbs — but smart-home security and ADT monitoring still make sense for peace of mind, package theft and remote control of your home.",
    crimeStats: { year: 2024, population: 79540, burglary: { count: 55, ratePer100k: 71.1 }, propertyCrime: { count: 927, ratePer100k: 1198 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "pflugerville",
    city: "Pflugerville",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Pflugerville sits just north of Austin along the SH-130 / 45 corridor. Bulldog serves Pflugerville, Manor and the surrounding north Travis County area from our Austin office.",
    crimeStats: { year: 2024, population: 65733, burglary: { count: 82, ratePer100k: 125.7 }, propertyCrime: { count: 1053, ratePer100k: 1614 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "lakeway",
    city: "Lakeway",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Lakeway, Bee Cave and West Lake Hills make up the high-end Lake Travis-side of the Austin metro. Bulldog covers the area from our Northland Drive office, with smart locks and remote-access automation for second homes.",
    crimeStats: { year: 2024, population: 16074, burglary: { count: 24, ratePer100k: 125.2 }, propertyCrime: { count: 234, ratePer100k: 1221 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "georgetown",
    city: "Georgetown",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Georgetown's Sun City retirement community plus its rapidly growing south side means Bulldog handles a wide mix of installs — from medical-alert pendants and water-leak monitoring for Sun City residents, to full smart-home automation in newer Williamson County neighborhoods.",
    crimeStats: { year: 2024, population: 77731, burglary: { count: 202, ratePer100k: 225.7 }, propertyCrime: { count: 1047, ratePer100k: 1170 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "san-marcos",
    city: "San Marcos",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "San Marcos is a college town (Texas State) which means rental-heavy neighborhoods, summer turnover and student housing — situations where smart-lock access codes and ADT-monitored alarms make a real difference. Served from our Austin office.",
    crimeStats: { year: 2024, population: 65711, burglary: { count: 194, ratePer100k: 266.8 }, propertyCrime: { count: 1642, ratePer100k: 2258 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Austin metro additions
  {
    slug: "leander",
    city: "Leander",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Leander sits on the northwest edge of the Austin metro along the Capital Metro Red Line. New construction subdivisions have driven population growth past 62k. Bulldog covers Leander, Crystal Falls and Travisso from our Austin office on Northland Drive.",
    crimeStats: { year: 2024, population: 62512, burglary: { count: 129, ratePer100k: 147.0 }, propertyCrime: { count: 867, ratePer100k: 988 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "bee-cave",
    city: "Bee Cave",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Bee Cave sits in the Texas Hill Country west of Austin along Highway 71, including the Hill Country Galleria area and surrounding gated subdivisions. Bulldog serves Bee Cave from our Austin office.",
    crimeStats: { year: 2024, population: 7049, burglary: { count: 19, ratePer100k: 224.9 }, propertyCrime: { count: 225, ratePer100k: 2663 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "west-lake-hills",
    city: "West Lake Hills",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "West Lake Hills is a small incorporated city of ~3.4k west of downtown Austin in the Eanes ISD area. Larger custom homes on hillside lots. Bulldog serves West Lake Hills, Rollingwood and the surrounding Eanes area from our Austin office.",
    crimeStats: { year: 2024, population: 3420, burglary: { count: 10, ratePer100k: 322.4 }, propertyCrime: { count: 88, ratePer100k: 2837 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "tarrytown",
    city: "Tarrytown",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Tarrytown is an established Austin neighborhood west of MoPac with older homes near Lake Austin. Patrolled by APD. Bulldog serves Tarrytown from our Austin office, with smart-home retrofits being the most common install for the older housing stock.",
    crimeStats: { year: 2024, population: 8000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Austin PD (neighborhood within Austin city limits)", note: "Tarrytown is an Austin neighborhood, not a separate municipality. Crime stats are reported at the Austin city level — see the main Austin page for FBI UCR figures." },
  },
  {
    slug: "hyde-park-austin",
    city: "Hyde Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Hyde Park is one of Austin's oldest planned neighborhoods, just north of UT campus. Older bungalows, university-area mix. Patrolled by APD. Bulldog covers Hyde Park, Hancock and the surrounding north-central Austin area from our Northland office.",
    crimeStats: { year: 2024, population: 9500, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Austin PD (neighborhood within Austin city limits)", note: "Hyde Park is an Austin neighborhood, not a separate municipality. See the Austin page for city-level FBI UCR data." },
  },
  {
    slug: "mueller",
    city: "Mueller",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Mueller is a master-planned community on the former airport site in central-east Austin. Newer construction, mixed-use density, walkable streets. Patrolled by APD. Bulldog handles installs from our Austin office.",
    crimeStats: { year: 2024, population: 14000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Austin PD (neighborhood within Austin city limits)", note: "Mueller is an Austin neighborhood within city limits. See the main Austin page for FBI UCR data." },
  },
  {
    slug: "circle-c",
    city: "Circle C",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Circle C Ranch is a master-planned community in southwest Austin off MoPac extension. Newer single-family homes, HOA-active. APD patrols. Bulldog covers Circle C from our Austin office.",
    crimeStats: { year: 2024, population: 12000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Austin PD (neighborhood within Austin city limits)", note: "Circle C is an Austin neighborhood. See the main Austin page for city-level FBI UCR data." },
  },
  {
    slug: "kyle",
    city: "Kyle",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Kyle sits south of Austin along I-35 in Hays County, with rapid growth from new master-planned communities (Plum Creek, 6 Creeks). Bulldog serves Kyle, Buda and the surrounding north Hays County area from our Austin office.",
    crimeStats: { year: 2024, population: 47247, burglary: { count: 64, ratePer100k: 92.7 }, propertyCrime: { count: 569, ratePer100k: 824 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "buda",
    city: "Buda",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "austin",
    intro:
      "Buda sits between Austin and Kyle along I-35 in Hays County, growing rapidly with new subdivisions like Whispering Hollow and Sunfield. Bulldog covers Buda from our Austin office.",
    crimeStats: { year: 2024, population: 16991, burglary: { count: 20, ratePer100k: 122.8 }, propertyCrime: { count: 266, ratePer100k: 1633 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Dallas metro
  {
    slug: "plano",
    city: "Plano",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Plano consistently ranks among the safest large US cities — but with 297k residents and major corporate HQs, package theft and porch pirates are the more common concern than break-ins. Bulldog covers Plano, west Plano and the Legacy West area from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 297929, burglary: { count: 468, ratePer100k: 160.6 }, propertyCrime: { count: 4274, ratePer100k: 1466 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "frisco",
    city: "Frisco",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Frisco's 68 burglaries per 100k is one of the lowest big-city rates in Texas — a function of newer construction, gated communities and active Frisco PD patrol. Bulldog still installs across Frisco, Prosper and Little Elm for the same reasons most Frisco homeowners want a system: smart locks, video doorbell, automation and remote control.",
    crimeStats: { year: 2024, population: 195310, burglary: { count: 159, ratePer100k: 68.3 }, propertyCrime: { count: 2336, ratePer100k: 1003 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "mckinney",
    city: "McKinney",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "McKinney's historic downtown plus its rapidly growing north Collin County subdivisions make for an interesting mix. Bulldog handles installs from our Farmers Branch office — typically scheduled within a week of your consult.",
    crimeStats: { year: 2024, population: 195852, burglary: { count: 187, ratePer100k: 85.3 }, propertyCrime: { count: 1787, ratePer100k: 815 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "richardson",
    city: "Richardson",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Richardson sits along the Telecom Corridor with a mix of older established neighborhoods and newer high-rise development. Bulldog covers Richardson, Buckingham and the surrounding north Dallas area.",
    crimeStats: { year: 2024, population: 121339, burglary: { count: 260, ratePer100k: 220.4 }, propertyCrime: { count: 2163, ratePer100k: 1834 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "allen",
    city: "Allen",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Allen's 62 burglaries per 100k is among the lowest in Texas. Bulldog installs across Allen, Fairview and Lucas — typically smart-home + monitoring packages rather than burglar-focused setups.",
    crimeStats: { year: 2024, population: 107542, burglary: { count: 71, ratePer100k: 62.4 }, propertyCrime: { count: 999, ratePer100k: 878 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "rockwall",
    city: "Rockwall",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Rockwall County's lakeside communities (Heath, Rowlett, Lake Ray Hubbard) need different security than typical urban setups — outbuildings, docks, and second homes. Bulldog handles all of it from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 46220, burglary: { count: 64, ratePer100k: 116.9 }, propertyCrime: { count: 752, ratePer100k: 1373 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Dallas metro additions
  {
    slug: "highland-park",
    city: "Highland Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Highland Park is a small incorporated city of ~9.5k inside Dallas, with its own DPS (Department of Public Safety). Older estate homes and high-end retail (Highland Park Village). Bulldog serves the Park Cities from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 9451, burglary: { count: 26, ratePer100k: 298.6 }, propertyCrime: { count: 214, ratePer100k: 2458 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "university-park",
    city: "University Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "University Park is the second of the Park Cities, surrounding SMU. Its own PD handles patrol — one of the lowest-crime communities in DFW. Bulldog serves University Park alongside Highland Park from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 25903, burglary: { count: 47, ratePer100k: 186.2 }, propertyCrime: { count: 362, ratePer100k: 1434 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "lakewood",
    city: "Lakewood",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Lakewood is an established Dallas neighborhood east of downtown around White Rock Lake. Older 1920s-1940s homes. DPD patrols. Bulldog covers Lakewood, Hollywood Heights and the M Streets from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 30000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Dallas PD (neighborhood within Dallas city limits)", note: "Lakewood is a Dallas neighborhood, not a separate municipality. See the main Dallas page for city-level FBI UCR figures." },
  },
  {
    slug: "oak-lawn",
    city: "Oak Lawn",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Oak Lawn is a dense urban Dallas neighborhood north of downtown — high-rises, mid-century apartments, and walkable mixed-use. DPD patrols. Bulldog handles installs from Farmers Branch, with smart-lock and video doorbell setups being most popular.",
    crimeStats: { year: 2024, population: 30000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Dallas PD (neighborhood within Dallas city limits)", note: "Oak Lawn is a Dallas neighborhood. See the main Dallas page for city-level FBI UCR data." },
  },
  {
    slug: "preston-hollow",
    city: "Preston Hollow",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Preston Hollow is an upscale Dallas neighborhood north of LBJ Freeway — large estate lots, Mockingbird/Walnut Hill area. DPD patrols. Bulldog covers Preston Hollow from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 25000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Dallas PD (neighborhood within Dallas city limits)", note: "Preston Hollow is a Dallas neighborhood. See the main Dallas page for city-level FBI UCR figures." },
  },
  {
    slug: "lake-highlands",
    city: "Lake Highlands",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Lake Highlands is a northeast Dallas neighborhood between Skillman and the President George Bush Tollway — established mid-century homes plus newer infill. DPD patrols. Bulldog serves Lake Highlands from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 35000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "Dallas PD (neighborhood within Dallas city limits)", note: "Lake Highlands is a Dallas neighborhood. See the main Dallas page for city-level FBI UCR figures." },
  },
  {
    slug: "mesquite",
    city: "Mesquite",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Mesquite sits east of Dallas in Dallas County. With 148k residents and a higher burglary rate than most of north DFW (392/100k), home security is a real practical concern here. Bulldog serves Mesquite from our Farmers Branch office.",
    crimeStats: { year: 2024, population: 148020, burglary: { count: 583, ratePer100k: 391.8 }, propertyCrime: { count: 4429, ratePer100k: 2976 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "garland",
    city: "Garland",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "dallas",
    intro:
      "Garland is one of the largest cities in DFW (245k residents), straddling Dallas and Collin Counties. Mature neighborhoods plus newer subdivisions. Bulldog covers Garland and surrounding Rowlett/Sachse area from Farmers Branch.",
    crimeStats: { year: 2024, population: 245211, burglary: { count: 747, ratePer100k: 303.3 }, propertyCrime: { count: 4896, ratePer100k: 1988 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Fort Worth metro
  {
    slug: "arlington",
    city: "Arlington",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Arlington sits between Dallas and Fort Worth and at 406k residents is one of the largest cities in the Metroplex. Bulldog covers Arlington's wide mix of neighborhoods — from the historic east side near UTA, to the newer south Arlington master-planned communities — from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 406065, burglary: { count: 1055, ratePer100k: 263.9 }, propertyCrime: { count: 9647, ratePer100k: 2413 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "southlake",
    city: "Southlake",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Southlake's 70 burglaries per 100k is one of the lowest rates in the Metroplex — a function of new construction, HOA active patrol and proactive Southlake DPS. Bulldog installs in Southlake, Westlake and Trophy Club from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 32343, burglary: { count: 22, ratePer100k: 70.8 }, propertyCrime: { count: 311, ratePer100k: 1000 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "keller",
    city: "Keller",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Keller's 62 burglaries per 100k makes it one of the safest places in Tarrant County. Bulldog still installs frequently here for smart locks, doorbell cameras and Z-wave automation.",
    crimeStats: { year: 2024, population: 48412, burglary: { count: 29, ratePer100k: 62.3 }, propertyCrime: { count: 305, ratePer100k: 656 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "grapevine",
    city: "Grapevine",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Grapevine's mix of historic downtown and DFW Airport-area sub-divisions makes it a popular Bulldog install area. Covered out of our Mid-Cities office along with Colleyville and Westlake.",
    crimeStats: { year: 2024, population: 56072, burglary: { count: 72, ratePer100k: 141.2 }, propertyCrime: { count: 1053, ratePer100k: 2065 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "mansfield",
    city: "Mansfield",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Mansfield sits at the south edge of the Metroplex and has grown rapidly with newer subdivisions. Bulldog handles installs from our Mid-Cities office — covering Mansfield, Kennedale and Rendon.",
    crimeStats: { year: 2024, population: 73975, burglary: { count: 89, ratePer100k: 110.5 }, propertyCrime: { count: 1113, ratePer100k: 1381 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "burleson",
    city: "Burleson",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Burleson sits south of Fort Worth in Johnson and Tarrant Counties. Bulldog installs across Burleson and the surrounding south Tarrant area, with cellular monitoring and battery-backup as standard.",
    crimeStats: { year: 2024, population: 48615, burglary: { count: 44, ratePer100k: 76.0 }, propertyCrime: { count: 630, ratePer100k: 1089 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Fort Worth metro additions
  {
    slug: "colleyville",
    city: "Colleyville",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Colleyville is a small affluent city in northeast Tarrant County between Southlake and Grapevine. One of the lowest burglary rates in the Metroplex (16/100k). Bulldog serves Colleyville from our Mid-Cities office on Boulevard 26.",
    crimeStats: { year: 2024, population: 27477, burglary: { count: 4, ratePer100k: 15.6 }, propertyCrime: { count: 138, ratePer100k: 538 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "westlake",
    city: "Westlake",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Westlake is a small town (~1.5k residents) of executive estates and corporate campuses (Charles Schwab, Fidelity HQ) west of Southlake. Bulldog handles Westlake from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 1549, propertyCrime: { count: 0, ratePer100k: 286 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (small jurisdiction)", note: "Westlake is a very small jurisdiction without a separate published FBI UCR table. The number above is a demographic estimate from AreaVibes." },
  },
  {
    slug: "hurst",
    city: "Hurst",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Hurst is one of the H-E-B (Hurst-Euless-Bedford) cities in central Tarrant County along Highway 183, with the North East Mall area as its commercial center. Bulldog serves Hurst from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 39602, burglary: { count: 87, ratePer100k: 223.2 }, propertyCrime: { count: 872, ratePer100k: 2237 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "euless",
    city: "Euless",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Euless is the middle H-E-B city, home to the south end of DFW Airport. Bulldog covers Euless from our Mid-Cities office on Boulevard 26 just north.",
    crimeStats: { year: 2024, population: 57525, burglary: { count: 108, ratePer100k: 182.3 }, propertyCrime: { count: 1247, ratePer100k: 2105 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "bedford",
    city: "Bedford",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Bedford is the third H-E-B city, just east of Hurst. Bulldog serves Bedford from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 50460, burglary: { count: 75, ratePer100k: 156.6 }, propertyCrime: { count: 741, ratePer100k: 1547 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "north-richland-hills",
    city: "North Richland Hills",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "North Richland Hills is the city our Fort Worth Mid-Cities office actually sits in (Boulevard 26). 72k residents in northeast Tarrant County between Hurst and Watauga. Bulldog handles installs across NRH from this office.",
    crimeStats: { year: 2024, population: 72121, burglary: { count: 168, ratePer100k: 237.4 }, propertyCrime: { count: 1580, ratePer100k: 2232 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "watauga",
    city: "Watauga",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Watauga sits just north of North Richland Hills along the I-820 / Mid-Cities corridor. Bulldog covers Watauga from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 25192, burglary: { count: 29, ratePer100k: 127.7 }, propertyCrime: { count: 194, ratePer100k: 854 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "saginaw",
    city: "Saginaw",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "fort-worth",
    intro:
      "Saginaw is north of Fort Worth in Tarrant County along Highway 287. Newer subdivisions have driven steady growth. Bulldog covers Saginaw from our Mid-Cities office.",
    crimeStats: { year: 2024, population: 24477, burglary: { count: 29, ratePer100k: 113.6 }, propertyCrime: { count: 352, ratePer100k: 1379 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // San Antonio metro
  {
    slug: "alamo-heights",
    city: "Alamo Heights",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Alamo Heights is a small, established city inside the San Antonio loop — older homes, mature trees, distinct local PD. Bulldog installs throughout Alamo Heights, Olmos Park and Terrell Hills from our Crownhill office.",
    crimeStats: { year: 2024, population: 8695, burglary: { count: 9, ratePer100k: 120.0 }, propertyCrime: { count: 220, ratePer100k: 2935 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "boerne",
    city: "Boerne",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Boerne sits in the Texas Hill Country northwest of San Antonio along I-10. Bulldog covers Boerne, Fair Oaks Ranch and the surrounding Kendall County area from our Crownhill office.",
    crimeStats: { year: 2024, population: 17451, burglary: { count: 74, ratePer100k: 319.4 }, propertyCrime: { count: 273, ratePer100k: 1179 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "schertz",
    city: "Schertz",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Schertz sits northeast of San Antonio in the Cibolo / Universal City corridor. Bulldog serves Schertz, Cibolo, Selma and Universal City from our Crownhill office.",
    crimeStats: { year: 2024, population: 43642, burglary: { count: 53, ratePer100k: 121.5 }, propertyCrime: { count: 387, ratePer100k: 887 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "new-braunfels",
    city: "New Braunfels",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "New Braunfels sits between San Antonio and Austin along I-35 with rapid growth on both ends of town. Bulldog covers New Braunfels, Canyon Lake and Comal County from our San Antonio office.",
    crimeStats: { year: 2024, population: 86374, burglary: { count: 150, ratePer100k: 126.8 }, propertyCrime: { count: 1518, ratePer100k: 1284 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "cibolo",
    city: "Cibolo",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Cibolo is a fast-growing suburb just east of Schertz with low crime and lots of new construction. Bulldog installs throughout Cibolo from our Crownhill office.",
    crimeStats: { year: 2024, population: 31234, burglary: { count: 53, ratePer100k: 140.8 }, propertyCrime: { count: 318, ratePer100k: 845 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // San Antonio metro additions
  {
    slug: "stone-oak",
    city: "Stone Oak",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Stone Oak is a fast-growing master-planned community in north San Antonio along the 281/1604 corridor. SAPD patrols. Bulldog covers Stone Oak from our Crownhill office a few miles south.",
    crimeStats: { year: 2024, population: 50000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: "San Antonio PD (neighborhood within San Antonio city limits)", note: "Stone Oak is a San Antonio neighborhood, not a separate municipality. See the main San Antonio page for city-level FBI UCR data." },
  },
  {
    slug: "olmos-park",
    city: "Olmos Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Olmos Park is a small enclave city of ~1.9k residents north of downtown San Antonio with its own PD. Older estate homes. Bulldog covers Olmos Park from our Crownhill office.",
    crimeStats: { year: 2024, population: 1902, burglary: { count: 7, ratePer100k: 324.8 }, propertyCrime: { count: 16, ratePer100k: 742 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "terrell-hills",
    city: "Terrell Hills",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Terrell Hills is a small incorporated city of ~5.5k residents inside San Antonio with its own PD. Older established homes. Bulldog handles Terrell Hills from our Crownhill office.",
    crimeStats: { year: 2024, population: 5567, burglary: { count: 6, ratePer100k: 118.5 }, propertyCrime: { count: 87, ratePer100k: 1718 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "hollywood-park",
    city: "Hollywood Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Hollywood Park is a small wooded enclave city of ~3.4k residents in north San Antonio off 281. Bulldog serves Hollywood Park from our Crownhill office.",
    crimeStats: { year: 2024, population: 3424, burglary: { count: 2, ratePer100k: 65.5 }, propertyCrime: { count: 45, ratePer100k: 1473 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "shavano-park",
    city: "Shavano Park",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Shavano Park is a small upscale residential city of ~4k residents in north San Antonio. Bulldog covers Shavano Park from our Crownhill office.",
    crimeStats: { year: 2024, population: 3988, burglary: { count: 5, ratePer100k: 132.1 }, propertyCrime: { count: 43, ratePer100k: 1136 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "helotes",
    city: "Helotes",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Helotes sits northwest of San Antonio along Bandera Road in the Texas Hill Country. Newer subdivisions plus older small-town center. Bulldog serves Helotes from our Crownhill office.",
    crimeStats: { year: 2024, population: 9720, burglary: { count: 33, ratePer100k: 322.0 }, propertyCrime: { count: 110, ratePer100k: 1073 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "universal-city",
    city: "Universal City",
    state: "TX",
    stateFull: "Texas",
    region: "texas",
    parentSlug: "san-antonio",
    intro:
      "Universal City sits northeast of San Antonio next to Randolph Air Force Base. Bulldog covers Universal City and the surrounding Schertz/Cibolo/Live Oak area from our Crownhill office.",
    crimeStats: { year: 2024, population: 21174, burglary: { count: 51, ratePer100k: 253.5 }, propertyCrime: { count: 423, ratePer100k: 2102 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: TX_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Orlando metro
  {
    slug: "winter-park",
    city: "Winter Park",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Winter Park's older established neighborhoods near Park Avenue and Rollins College have higher property crime than the suburban Orlando average — partly because of its central location and pedestrian-friendly downtown. Bulldog covers Winter Park, Maitland and Casselberry from our Longwood office.",
    crimeStats: { year: 2024, population: 31768, burglary: { count: 70, ratePer100k: 234.5 }, propertyCrime: { count: 590, ratePer100k: 1976 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "lake-mary",
    city: "Lake Mary",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Lake Mary's Heathrow community, Markham Woods area and downtown are all served by Bulldog from the Longwood office just south. Hurricane-ready cellular monitoring and battery backup are standard.",
    crimeStats: { year: 2024, population: 17634, burglary: { count: 23, ratePer100k: 138.0 }, propertyCrime: { count: 173, ratePer100k: 1038 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "sanford",
    city: "Sanford",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Sanford sits at the north end of Seminole County on Lake Monroe with a mix of historic downtown and rapid suburban growth. Bulldog covers Sanford and surrounding Seminole County from our Longwood office.",
    crimeStats: { year: 2024, population: 61887, burglary: { count: 175, ratePer100k: 261.6 }, propertyCrime: { count: 1507, ratePer100k: 2253 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "oviedo",
    city: "Oviedo",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Oviedo's 98 burglaries per 100k is one of the lower rates in Central Florida — most installs here are smart-home automation and video doorbells more than break-in deterrence. Bulldog serves Oviedo, Winter Springs and Chuluota from Longwood.",
    crimeStats: { year: 2024, population: 41897, burglary: { count: 41, ratePer100k: 98.4 }, propertyCrime: { count: 243, ratePer100k: 583 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "kissimmee",
    city: "Kissimmee",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Kissimmee's mix of vacation rentals (close to Disney, Universal), short-term turnover and year-round residents means smart-lock access codes and ADT remote monitoring are particularly useful. Bulldog covers Kissimmee, St. Cloud and Celebration from our Longwood office.",
    crimeStats: { year: 2024, population: 73957, burglary: { count: 215, ratePer100k: 262.3 }, propertyCrime: { count: 1553, ratePer100k: 1895 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "apopka",
    city: "Apopka",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Apopka sits at the northwest edge of the Orlando metro and has a higher burglary rate than most surrounding cities — 475 per 100k vs Florida's statewide 152. Bulldog serves Apopka, Forest City and Plymouth from our Longwood office.",
    crimeStats: { year: 2024, population: 54904, burglary: { count: 288, ratePer100k: 475.4 }, propertyCrime: { count: 1404, ratePer100k: 2317 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Orlando metro additions
  {
    slug: "altamonte-springs",
    city: "Altamonte Springs",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Altamonte Springs sits in Seminole County north of Orlando along I-4. Cranes Roost area, Altamonte Mall area, plus established residential. Bulldog serves Altamonte from our Longwood office just north.",
    crimeStats: { year: 2024, population: 45050, burglary: { count: 75, ratePer100k: 166.8 }, propertyCrime: { count: 1039, ratePer100k: 2311 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "longwood",
    city: "Longwood",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Longwood is the city our Orlando office actually sits in (West State Road 434). Established Seminole County community between Lake Mary and Altamonte Springs. Bulldog covers Longwood and immediate surrounding area from this office.",
    crimeStats: { year: 2024, population: 15833, burglary: { count: 34, ratePer100k: 196.6 }, propertyCrime: { count: 236, ratePer100k: 1364 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "maitland",
    city: "Maitland",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Maitland sits between Winter Park and Altamonte Springs in Orange County, with the Maitland Center business park and a residential mix of older estates. Bulldog covers Maitland from our Longwood office.",
    crimeStats: { year: 2024, population: 18243, burglary: { count: 51, ratePer100k: 266.5 }, propertyCrime: { count: 259, ratePer100k: 1353 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "casselberry",
    city: "Casselberry",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Casselberry sits in Seminole County between Altamonte Springs and Winter Park. Bulldog serves Casselberry from our Longwood office.",
    crimeStats: { year: 2024, population: 29344, burglary: { count: 51, ratePer100k: 163.6 }, propertyCrime: { count: 807, ratePer100k: 2589 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "lake-nona",
    city: "Lake Nona",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Lake Nona is a master-planned community in southeast Orlando around the Medical City and the USTA National Campus. Newer construction, gated subdivisions. OPD plus Orange County Sheriff in unincorporated areas. Bulldog serves Lake Nona from our Longwood office.",
    crimeStats: { year: 2024, population: 25000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Orlando PD + Orange County Sheriff", note: "Lake Nona spans Orlando city limits and unincorporated Orange County. There's no separate FBI UCR table for Lake Nona; see the main Orlando page for OPD city-wide data, or Orange County Sheriff for unincorporated parts." },
  },
  {
    slug: "dr-phillips",
    city: "Dr. Phillips",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Dr. Phillips is a CDP in southwest Orange County near Universal Orlando, with established residential plus the Restaurant Row commercial corridor. Patrolled by Orange County Sheriff. Bulldog covers Dr. Phillips from our Longwood office.",
    crimeStats: { year: 2024, population: 11000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Orange County Sheriff (CDP, no city-level FBI UCR table)", note: "Dr. Phillips is a CDP — Orange County Sheriff handles patrol, no separate city-level FBI UCR table is published. For local incident maps, check OCSO's online crime data." },
  },
  {
    slug: "windermere",
    city: "Windermere",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "orlando",
    intro:
      "Windermere is a small town of ~3.6k residents on the Butler chain of lakes in west Orange County. Estate homes and lakefront. Bulldog covers Windermere from our Longwood office.",
    crimeStats: { year: 2024, population: 3613, propertyCrime: { count: 0, ratePer100k: 270 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (small jurisdiction)", note: "Windermere is a very small jurisdiction without a separate published FBI UCR table. The number above is a demographic estimate from AreaVibes." },
  },

  // Tampa metro additions
  {
    slug: "south-tampa",
    city: "South Tampa",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "South Tampa covers the area south of Kennedy Boulevard down to Bayshore — Hyde Park, SoHo, Davis Islands, Westshore, MacDill area. Tampa PD patrols. Bulldog handles installs from our West Busch office.",
    crimeStats: { year: 2024, population: 70000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Tampa PD (neighborhood within Tampa city limits)", note: "South Tampa is a Tampa neighborhood, not a separate municipality. See the main Tampa page for city-level FBI UCR figures." },
  },
  {
    slug: "hyde-park-tampa",
    city: "Hyde Park",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Hyde Park is one of South Tampa's most established neighborhoods — historic bungalows, walkable to Hyde Park Village retail. Tampa PD patrols. Bulldog covers Hyde Park from our West Busch office.",
    crimeStats: { year: 2024, population: 9000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Tampa PD (neighborhood within Tampa city limits)", note: "Hyde Park is a Tampa neighborhood. See the main Tampa page for city-level FBI UCR figures." },
  },
  {
    slug: "westchase",
    city: "Westchase",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Westchase is a master-planned community in northwest Hillsborough County off the Veterans Expressway. Newer homes, HOA-active. Bulldog serves Westchase from our West Busch office.",
    crimeStats: { year: 2024, population: 23000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Hillsborough County Sheriff (CDP, no city-level FBI UCR table)", note: "Westchase is a CDP — Hillsborough County Sheriff handles patrol, no separate city-level FBI UCR table is published." },
  },
  {
    slug: "new-tampa",
    city: "New Tampa",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "New Tampa covers the northeast Tampa area along Bruce B. Downs (Tampa Palms, Hunter's Green, Cory Lake Isles, Live Oak Preserve). Tampa PD patrols. Bulldog handles installs from our West Busch office.",
    crimeStats: { year: 2024, population: 50000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Tampa PD (neighborhood within Tampa city limits)", note: "New Tampa is a Tampa neighborhood. See the main Tampa page for city-level FBI UCR figures." },
  },
  {
    slug: "carrollwood",
    city: "Carrollwood",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Carrollwood is a CDP north of Tampa off Dale Mabry, with Original Carrollwood and Carrollwood Village subdivisions. Hillsborough County Sheriff patrols. Bulldog serves Carrollwood from our West Busch office.",
    crimeStats: { year: 2024, population: 35000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Hillsborough County Sheriff (CDP, no city-level FBI UCR table)", note: "Carrollwood is a CDP — Hillsborough County Sheriff handles patrol, no separate city-level FBI UCR table." },
  },
  {
    slug: "town-n-country",
    city: "Town 'N' Country",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Town 'N' Country is a CDP in northwest Hillsborough County off the Veterans Expressway near the airport. Bulldog covers Town 'N' Country from our West Busch office.",
    crimeStats: { year: 2024, population: 80000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Hillsborough County Sheriff (CDP, no city-level FBI UCR table)", note: "Town 'N' Country is a CDP — Hillsborough County Sheriff handles patrol, no separate city-level FBI UCR table." },
  },
  {
    slug: "apollo-beach",
    city: "Apollo Beach",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Apollo Beach is a coastal CDP in southern Hillsborough County off US-41, with canal-front homes and the Manatee Viewing Center. Bulldog covers Apollo Beach from our Tampa office, with water-leak monitoring being a particularly common add-on for the waterfront homes.",
    crimeStats: { year: 2024, population: 25000, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "Hillsborough County Sheriff (CDP, no city-level FBI UCR table)", note: "Apollo Beach is a CDP — Hillsborough County Sheriff handles patrol, no separate city-level FBI UCR table." },
  },
  {
    slug: "pinellas-park",
    city: "Pinellas Park",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Pinellas Park sits in the middle of Pinellas County between St. Petersburg and Largo. 55k residents. Bulldog covers Pinellas Park from our Tampa office.",
    crimeStats: { year: 2024, population: 55392, burglary: { count: 103, ratePer100k: 192.6 }, propertyCrime: { count: 1180, ratePer100k: 2206 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },

  // Tampa metro
  {
    slug: "st-petersburg",
    city: "St. Petersburg",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "St. Pete's mix of historic neighborhoods, downtown high-rises and waterfront properties keeps Bulldog's Tampa techs busy. The whole bay-side of Pinellas County is covered from our Tampa office.",
    crimeStats: { year: 2024, population: 271787, burglary: { count: 555, ratePer100k: 209.4 }, propertyCrime: { count: 6516, ratePer100k: 2459 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: CRIME_DATA_SOURCE },
  },
  {
    slug: "clearwater",
    city: "Clearwater",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Clearwater's beach-side rentals and year-round residential mix means smart-lock and remote-monitoring setups are common. Bulldog serves Clearwater and the surrounding Pinellas County area from our Tampa office.",
    crimeStats: { year: 2024, population: 120302, propertyCrime: { count: 2209, ratePer100k: 1899 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (city-level burglary data not directly published)", note: "Clearwater PD's burglary breakdown isn't directly published in the FBI UCR table for 2024. The property-crime rate above is reported; for a current burglary breakdown, check Clearwater PD's annual report directly." },
  },
  {
    slug: "brandon",
    city: "Brandon",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Brandon is a census-designated place east of Tampa — Hillsborough County Sheriff's Office handles policing rather than a dedicated city PD, so FBI UCR doesn't publish a city-level table. Bulldog still serves Brandon from our Tampa office.",
    crimeStats: { year: 2024, population: 119685, propertyCrime: { count: 0, ratePer100k: 1338 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (CDP, no city-level table)", note: "Brandon is a CDP — Hillsborough County Sheriff handles policing and FBI UCR doesn't publish a separate city-level table. The number above is an AreaVibes estimate from county demographics, not a directly-reported figure." },
  },
  {
    slug: "riverview",
    city: "Riverview",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Riverview is a fast-growing CDP southeast of Tampa, also under Hillsborough County Sheriff's jurisdiction. Bulldog handles Riverview installs from our Tampa office.",
    crimeStats: { year: 2024, population: 98341, propertyCrime: { count: 0, ratePer100k: 1220 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (CDP, no city-level table)", note: "Riverview is a CDP — Hillsborough County Sheriff handles policing and FBI UCR doesn't publish a separate city-level table. The number above is an AreaVibes estimate from county demographics." },
  },
  {
    slug: "largo",
    city: "Largo",
    state: "FL",
    stateFull: "Florida",
    region: "florida",
    parentSlug: "tampa",
    intro:
      "Largo sits in the middle of Pinellas County between Clearwater and St. Pete. Bulldog covers Largo, Seminole and the surrounding mid-Pinellas area from our Tampa office.",
    crimeStats: { year: 2024, population: 87579, propertyCrime: { count: 1879, ratePer100k: 2287 }, nationalAvgPropertyCrimeRate: US_AVG_PROPERTY_CRIME_RATE, stateAvgBurglaryRate: FL_AVG_BURGLARY_RATE, source: "FBI UCR demographic estimate (city-level burglary data not directly published)", note: "Largo PD's burglary breakdown isn't directly published in the FBI UCR table for 2024. For a current burglary breakdown, check Largo PD's annual report directly." },
  },
];

export const TX_SATELLITES = SATELLITES.filter((s) => s.region === "texas");
export const FL_SATELLITES = SATELLITES.filter((s) => s.region === "florida");

export function getSatelliteBySlug(slug: string): SatelliteCity | undefined {
  return SATELLITES.find((s) => s.slug === slug);
}

// Registered sex offender count per city (city-data.com, current April 2026).
// `ratio` = residents per 1 registered offender (lower = more offenders per
// capita). Kept flat by slug to avoid editing 47 LocationCity entries.
export type SexOffenderData = { count: number; ratio: number };

export const SEX_OFFENDER_DATA: Record<string, SexOffenderData> = {
  // Office cities
  houston: { count: 8318, ratio: 277 },
  austin: { count: 1504, ratio: 630 },
  dallas: { count: 4491, ratio: 293 },
  "fort-worth": { count: 3483, ratio: 246 },
  "san-antonio": { count: 3928, ratio: 380 },
  orlando: { count: 2589, ratio: 107 },
  tampa: { count: 1308, ratio: 288 },
  // Houston metro satellites
  "sugar-land": { count: 40, ratio: 2322 },
  katy: { count: 258, ratio: 67 },
  pearland: { count: 66, ratio: 1685 },
  "the-woodlands": { count: 9, ratio: 12908 },
  "league-city": { count: 45, ratio: 2211 },
  galveston: { count: 139, ratio: 373 },
  // Austin metro
  "round-rock": { count: 133, ratio: 906 },
  "cedar-park": { count: 26, ratio: 2634 },
  pflugerville: { count: 57, ratio: 1021 },
  lakeway: { count: 2, ratio: 7135 },
  georgetown: { count: 109, ratio: 588 },
  "san-marcos": { count: 159, ratio: 400 },
  // Dallas metro
  plano: { count: 113, ratio: 2531 },
  frisco: { count: 35, ratio: 4675 },
  mckinney: { count: 82, ratio: 2027 },
  richardson: { count: 34, ratio: 3265 },
  allen: { count: 48, ratio: 2091 },
  rockwall: { count: 27, ratio: 1595 },
  // Fort Worth metro
  arlington: { count: 620, ratio: 634 },
  southlake: { count: 1, ratio: 30137 },
  keller: { count: 17, ratio: 2696 },
  grapevine: { count: 13, ratio: 4026 },
  mansfield: { count: 69, ratio: 948 },
  burleson: { count: 140, ratio: 310 },
  // San Antonio metro
  "alamo-heights": { count: 1, ratio: 8108 },
  boerne: { count: 24, ratio: 563 },
  schertz: { count: 26, ratio: 1524 },
  "new-braunfels": { count: 123, ratio: 564 },
  cibolo: { count: 21, ratio: 1268 },
  // Orlando metro
  "winter-park": { count: 44, ratio: 703 },
  "lake-mary": { count: 15, ratio: 1061 },
  sanford: { count: 126, ratio: 466 },
  oviedo: { count: 24, ratio: 1609 },
  kissimmee: { count: 529, ratio: 131 },
  apopka: { count: 319, ratio: 154 },
  // Tampa metro
  "st-petersburg": { count: 774, ratio: 337 },
  clearwater: { count: 449, ratio: 255 },
  brandon: { count: 92, ratio: 1241 },
  riverview: { count: 108, ratio: 815 },
  largo: { count: 181, ratio: 456 },
  // Houston-area additions
  spring: { count: 366, ratio: 166 },
  bellaire: { count: 4, ratio: 4694 },
  friendswood: { count: 34, ratio: 1179 },
  // Austin-area additions
  leander: { count: 74, ratio: 527 },
  kyle: { count: 104, ratio: 361 },
  buda: { count: 78, ratio: 169 },
  // Dallas-area additions
  "university-park": { count: 1, ratio: 24945 },
  mesquite: { count: 178, ratio: 808 },
  garland: { count: 365, ratio: 643 },
  // Fort Worth-area additions
  hurst: { count: 86, ratio: 466 },
  euless: { count: 98, ratio: 567 },
  bedford: { count: 39, ratio: 1298 },
  "north-richland-hills": { count: 54, ratio: 1304 },
  watauga: { count: 24, ratio: 1050 },
  saginaw: { count: 20, ratio: 1123 },
  colleyville: { count: 11, ratio: 2352 },
  // San Antonio-area additions
  "universal-city": { count: 10, ratio: 2048 },
  helotes: { count: 19, ratio: 455 },
  // Orlando-area additions
  "altamonte-springs": { count: 43, ratio: 1018 },
  longwood: { count: 38, ratio: 382 },
  maitland: { count: 7, ratio: 2528 },
  casselberry: { count: 35, ratio: 783 },
  // Tampa-area additions
  "pinellas-park": { count: 89, ratio: 585 },
};

export const SEX_OFFENDER_SOURCE = "city-data.com (compiled from public state registries), current as of April 2026";

export function getSexOffenderData(slug: string): SexOffenderData | undefined {
  return SEX_OFFENDER_DATA[slug];
}

// Returns the union of office cities and satellite cities for static generation.
export function getAllLocationSlugs(): string[] {
  return [...LOCATIONS.map((l) => l.slug), ...SATELLITES.map((s) => s.slug)];
}
