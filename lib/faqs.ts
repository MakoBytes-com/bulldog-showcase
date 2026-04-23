export type FAQ = { q: string; a: string };
export type FAQCategory = { name: string; faqs: FAQ[] };

// FAQ content mirrored verbatim from bulldogsecurityservice.com/about-us/faq/
// (captured 2026-04-22). Grouped by the three categories used on the live site.
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    name: "My Account",
    faqs: [
      {
        q: "Do I need an alarm permit?",
        a: "Many cities, Police Departments, Sheriff's Departments, and Fire Departments require alarm system users to obtain an alarm permit. Contact your local emergency department to verify the requirements in your area.",
      },
      {
        q: "How do I update my account information?",
        a: "You can update your account information by logging into MyADT.com and selecting the 'My Account' tab.",
      },
      {
        q: "How do I change my MyADT password?",
        a: "Visit the MyADT.com login page, select 'Forgot Your Password,' choose the email or security-question reset method, verify your registered address, and follow the reset instructions sent to your email.",
      },
      {
        q: "How can I manage my verbal security password?",
        a: "You can manage your verbal security password by logging into MyADT.com, selecting the 'My Alarm' tab from the overview page, and then clicking on 'Verbal Passwords.'",
      },
      {
        q: "How do I change my call list?",
        a: "Log into MyADT.com and click 'Manage Contacts' in the Emergency Contacts section. Make sure new contacts have premises access, valid ID, and current US phone numbers.",
      },
      {
        q: "How do I change my billing address?",
        a: "Login to MyADT and click on 'Account' from the left navigation, then click on the 'Profile' tab.",
      },
      {
        q: "How do I update my payment information?",
        a: "Login to MyADT.com, click the 'Account' tab, select 'Update Payment Method,' choose a saved method or add new payment details, then submit.",
      },
      {
        q: "How long does it take for my payment to post?",
        a: "Payments sent through the mail take approximately 7–10 business days to be delivered and processed. If you make your payment online, please allow up to three business days.",
      },
      {
        q: "What should I expect on my first bill?",
        a: "Your invoice may show advanced service charges for the next cycle, state and local taxes, and one-time prorated charges for monthly services.",
      },
      {
        q: "Why is my bill different than I expected?",
        a: "Taxes and prorated charges can be difficult to understand. State and local municipalities sometimes charge tax on the services provided by ADT.",
      },
    ],
  },
  {
    name: "Equipment",
    faqs: [
      {
        q: "How does my ADT alarm system work?",
        a: "Your alarm system may be armed in either Away or Stay mode. Once the system is activated, each monitored zone has the ability to recognize a violation.",
      },
      {
        q: "Where can I find a copy of the system owner's manual?",
        a: "Log into MyADT.com to identify your system, then click on 'Find Your System Manual' in the Help Center.",
      },
      {
        q: "How do I view How-To videos on my Command 7\" touchscreen panel?",
        a: "Tap the right arrow to scroll icons, tap the 'Tools' icon, enter your Master User code, tap the 'Help Videos' icon, then select the desired topic.",
      },
      {
        q: "How do I arm/disarm the system using my Command Panel?",
        a: "Multiple options are available: Arm Away (tap and enter code), Arm Stay (tap and enter code), Night Stay (instant exterior status), Arm Custom (bypass up to 5 sensors), Disarm (tap and enter code).",
      },
      {
        q: "How do I disable/enable and adjust volume chimes on my Command Panel?",
        a: "Tap the right arrow to the Tools icon, enter your Master User Code, tap the Settings icon, drag the Volume slider, then select Chime to toggle mute status.",
      },
      {
        q: "How often should I test my system?",
        a: "ADT recommends that you test your system every 30 days and after any changes to phone or Internet service or any home renovations.",
      },
      {
        q: "How do I test my system's connection to ADT Central Station?",
        a: "On the Command touchscreen: tap the right arrow, tap Tools (enter Master code), tap Advanced, tap the Comm. Test icon. Results display as Pending, Passed, or Test Failed.",
      },
      {
        q: "How do I check sensor battery status on my Command Panel?",
        a: "From the home screen, tap 'Zones,' enter your User Code, view battery-bar status icons next to devices, and scroll using the arrows.",
      },
      {
        q: "My camera appears offline — what do I do?",
        a: "First, confirm your camera is plugged in and receiving power. Next, make sure your Wi-Fi connection shows Internet activity. If your camera still isn't recognized, call 800-ADT-ASAP.",
      },
      {
        q: "How do I access the screenshot when someone disarms my system?",
        a: "Tap the right arrow to the Tools icon, tap 'Events,' view system events including panel-disarm snapshots, then tap an event to see the snapshot.",
      },
      {
        q: "Can I move my keypad?",
        a: "No, the keypad is wired into the security panel bus. An ADT technician is the only person who can move the keypad.",
      },
      {
        q: "How do I order ADT yard signs and decals?",
        a: "You can order new ADT Security Services yard signs or window decals at MyADT.com under My Account > Order Equipment. Customers are limited to two yard signs and two decal sets per year.",
      },
      {
        q: "If I lose power, will my alarm system still work?",
        a: "Yes. In a power loss, the back-up battery will activate and will operate your alarm system for several hours.",
      },
      {
        q: "What happens when I press the panic or fire alarm buttons?",
        a: "If you hold down the panic or fire alarm buttons on the keypad for 1–3 seconds, an alarm is transmitted to the ADT Customer Monitoring Center and emergency services are dispatched immediately.",
      },
      {
        q: "How do I automate lights, locks and thermostats?",
        a: "From the web portal, click 'Automation,' select Rules (trigger-based), Schedules (time-based), or Scenes (grouped automations), then click 'Add New.'",
      },
      {
        q: "How do I set up voice recognition with Amazon Alexa or Google Assistant?",
        a: "To enable the ADT Control Skill, tap on the 'Skills' option located within the Alexa or Google Assistant app and type in 'ADT Control.'",
      },
      {
        q: "What is Z-Wave Wireless Technology?",
        a: "Z-Wave is a wireless technology that allows your home appliances (like the thermostat, lights, door locks, etc.) to wirelessly communicate with each other.",
      },
    ],
  },
  {
    name: "ADT Control App",
    faqs: [
      {
        q: "My ADT Command/Control system appears offline. What should I do?",
        a: "If you log into ADT Control (control.adt.com) and see 'Status Unavailable' or a graphic indicator that the system is offline, make sure all your ADT equipment is plugged in.",
      },
      {
        q: "How do I arm/disarm my panel from my Control app?",
        a: "To arm, tap the Shield icon and select Silent Arming / No Entry Delay and Arm Stay / Away. To disarm, tap the Shield icon.",
      },
      {
        q: "Can I answer my video doorbell with the ADT Control app?",
        a: "You can only answer your doorbell through the app. You can also start a doorbell call and view the camera video from the doorbell at any time.",
      },
      {
        q: "How do I set up geo-services?",
        a: "Enable geo-services in the Control app Settings, then log into the web portal, click Settings, click Geo-Services to view and edit geo-fences and create geo-fence-triggered automations.",
      },
      {
        q: "How do I check sensor batteries in the Control app?",
        a: "You'll see low batteries as a trouble condition on your home screen in the Control app. Tap the trouble icon to see a list of devices.",
      },
      {
        q: "How do I troubleshoot a connection issue with ADT Control?",
        a: "Ensure your equipment is plugged in, wait a few minutes, and retry. Contact 800-ADT-ASAP for additional assistance.",
      },
      {
        q: "How do I enroll in push notifications to my phone?",
        a: "Log into the app, tap Notifications, tap Manage Notifications, tap Add, select recipients from your Address Book or add new contacts, verify, and save.",
      },
    ],
  },
];

// Flattened list for FAQPage JSON-LD + search
export const ALL_FAQS: FAQ[] = FAQ_CATEGORIES.flatMap((c) => c.faqs);
