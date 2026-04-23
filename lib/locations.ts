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
};

export const SEX_OFFENDER_SOURCE = "city-data.com (compiled from public state registries), current as of April 2026";

export function getSexOffenderData(slug: string): SexOffenderData | undefined {
  return SEX_OFFENDER_DATA[slug];
}

// Returns the union of office cities and satellite cities for static generation.
export function getAllLocationSlugs(): string[] {
  return [...LOCATIONS.map((l) => l.slug), ...SATELLITES.map((s) => s.slug)];
}
