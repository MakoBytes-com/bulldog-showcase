export const SITE = {
  name: "Bulldog Security Service",
  shortName: "Bulldog Security",
  legalName: "Bulldog Security Services, LLC",
  tagline: "Protect What Matters Most",
  url: "https://bulldogsecurityservice.com",
  email: "info@bulldogsecurityservice.com",
  internalEmail: "info@bdsnation.com",
  foundedYear: 2010,
  homesProtected: "30,000+",
  bbbRating: "A+",
  bbbAward: "2019 BBB Award of Excellence",
  adtRanking: {
    texas: "#1 ADT Authorized Dealer in Texas",
    southCentral: "#1 ADT Authorized Dealer in South Central US",
    national: "#3 ADT Authorized Dealer in the United States",
  },
  texasLicense: "B15560",
} as const;

export type Office = {
  label: string;
  phone?: string;
  phoneHref?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  isHq?: boolean;
};

export const OFFICES: Office[] = [
  {
    label: "Houston — HQ",
    phone: "(832) 585-0725",
    phoneHref: "tel:+18325850725",
    street: "14340 Torrey Chase Blvd",
    street2: "Suite 250",
    city: "Houston",
    state: "TX",
    zip: "77014",
    isHq: true,
  },
  {
    label: "Houston — South",
    street: "1322 Space Park Dr",
    street2: "Ste C150",
    city: "Houston",
    state: "TX",
    zip: "77058",
  },
  {
    label: "Austin",
    street: "3301 Northland Dr",
    street2: "STE 314",
    city: "Austin",
    state: "TX",
    zip: "78731",
  },
  {
    label: "Dallas",
    street: "2727 LBJ Freeway",
    street2: "Ste. 436",
    city: "Farmers Branch",
    state: "TX",
    zip: "75234",
  },
  {
    label: "Ft. Worth",
    street: "7001 Boulevard 26",
    street2: "Suite 327",
    city: "North Richland Hills",
    state: "TX",
    zip: "76180",
  },
  {
    label: "San Antonio",
    street: "8700 Crownhill Blvd",
    street2: "Suite 507",
    city: "San Antonio",
    state: "TX",
    zip: "78209",
  },
  {
    label: "Orlando",
    street: "2170 West State Rd 434",
    street2: "Ste 320",
    city: "Longwood",
    state: "FL",
    zip: "32714",
  },
  {
    label: "Tampa",
    street: "2901 W. Busch Blvd",
    street2: "UNIT 906",
    city: "Tampa",
    state: "FL",
    zip: "33618",
  },
];

export const HQ = OFFICES[0];

export const PHONES = {
  main: { label: "Call Us", number: "(832) 585-0725", href: "tel:+18325850725" },
  text: { label: "Text Us", number: "(832) 536-9215", href: "sms:+18325369215" },
} as const;

export const SOCIAL = {
  facebook: "https://www.facebook.com/smartsecuredhomes/",
  linkedin: "https://www.linkedin.com/company/bulldog-security-services-llc-/",
  yelp: "https://www.yelp.com/biz/bulldog-security-services-spring-2",
} as const;

export const SERVICE_WINDOW = "Mon–Fri, 12–5 pm";

// ADT Authorized Dealer numbers by state (footer legal disclosure).
// Required by ADT licensing agreement.
export const ADT_DEALER_NUMBERS: { state: string; number: string }[] = [
  { state: "TX", number: "7451432" },
  { state: "FL", number: "13873130" },
  { state: "GA", number: "14884080" },
  { state: "OH", number: "12287032" },
  { state: "AZ", number: "14935654" },
  { state: "PA", number: "14928423" },
  { state: "TN", number: "14959922" },
  { state: "IL", number: "1496089" },
  { state: "LA", number: "14964409" },
  { state: "CO", number: "13317181" },
  { state: "KS", number: "14979076" },
  { state: "MO", number: "14979075" },
  { state: "KY", number: "14979138" },
  { state: "WI", number: "14979078" },
  { state: "IN", number: "14979072" },
];

// Standard consent copy used across consult / contact / schedule forms.
// Matches the live-site Gravity Forms consent text verbatim.
export const CONSULT_CONSENT =
  "By clicking SUBMIT, I agree to be contacted by Bulldog Security Services even if I'm on a Do Not Call list. In addition, by clicking the check box I consent to be called back by Bulldog Security Services at the phone number provided, including cellular. You are not required to provide this consent to make a purchase from us.";

export const SCHEDULE_CONSENT =
  "By clicking SUBMIT, I agree to be contacted by Bulldog Security Services at the number provided even if I'm on a Do Not Call list.";

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Automation", href: "/automation" },
  {
    label: "About Us",
    href: "/about-us",
    children: [
      { label: "Meet The Team", href: "/about-us/meet-the-team" },
      { label: "FAQ", href: "/about-us/faq" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
] as const;
