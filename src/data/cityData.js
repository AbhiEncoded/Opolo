// ─────────────────────────────────────────────────────────────────────────────
// opolo — Core City Dataset
// Sources: Numbeo, SpareRoom, Kamernet, HousingAnywhere, Studapart, Leboncoin,
//          AmberStudent, Unisova + synthesised student forum / vlog transcripts
// ─────────────────────────────────────────────────────────────────────────────

export const CITIES = {
  boston: {
    id: 'boston',
    name: 'Boston',
    country: 'USA',
    flag: '🇺🇸',
    subtitle: 'North America · English',
    tagline: 'Academic excellence meets biotech career launchpad',
    accentColor: '#6366f1',

    // ── 6 weighted dimensions (0-100) ─────────────────────────────────────
    dimensions: {
      career:      95,   // MIT/Harvard/Kendall Square — world #1 for biotech/AI/finance
      cost:        22,   // Most expensive of the three — $2,800+/mo minimum
      safety:      63,   // Safe in university areas; Roxbury caution at night
      social:      71,   // Good, but smaller international scene vs Paris
      diversity:   78,   // 28% international — strong but not Europe-level
      healthcare:  45,   // World-class quality, but very expensive ($3-4k/yr insurance)
    },

    // ── Demographics & Social Life (Laiba) ────────────────────────────────
    demographics: {
      internationalStudentPct: 28,
      topNationalities: ['China', 'India', 'South Korea', 'Canada', 'Brazil'],
      muslimCommunitySize: 'Moderate — several mosques, halal corridors in Cambridge/Somerville',
      lgbtqFriendly: true,
      localPersonality:
        'Reserved on first meeting, extremely warm once familiar. Intensely sports-tribal (Red Sox, Patriots, Celtics). Hard-working, direct, intellectually competitive.',
      alcoholCulture:
        'Deeply embedded craft-beer + bar culture, especially near universities. Non-drinkers respected but will need to seek out alternatives.',
      quietVsParty: 'Both worlds exist clearly. Allston-Brighton is party-central; Cambridge is more academic-café.',
      whatLargeSchoolMeans: {
        stat: '11,000+ campus events/year at Northeastern alone',
        reality: 'You could attend a free talk by a Nobel laureate every week and still not see the same face twice in a semester. The scale means more resources but also anonymity — you must self-initiate.',
      },
    },

    // ── Cost of Living & Housing (Sree) ──────────────────────────────────
    cost: {
      avgRentStudio: '$2,200–$3,500 / mo',
      avgRentShared: '$950–$1,600 / mo',
      avgMonthlyTotal: '$2,800–$4,500',
      groceriesMonthly: '$350–$500',
      mealOutAvg: '$18–$28',
      publicTransportMonthly: '$90 (MBTA CharlieCard)',
      coffeeShopHourlyWage: '~1.5 hrs of min-wage work',
      source: 'Numbeo Q2-2024, SpareRoom Boston listings',
    },
    housing: {
      options: [
        'University dorms ($1,200–$2,000/mo, limited availability)',
        'Shared 3BR in Allston-Brighton ($900–$1,300/mo per person)',
        'Private studio (very expensive — $2,200+)',
        'Homestay programs via AmberStudent / Unisova',
      ],
      popularAreas: ['Allston (student village)', 'Cambridge', 'Somerville', 'Brighton', 'Jamaica Plain'],
      sources: ['SpareRoom.com', 'AmberStudent.com', 'Unisova.com', 'Zillow'],
      avgLeadTime: '4–6 months before arrival',
      insiderTip:
        'Allston is nicknamed "Allston Christmas" in Sept — graduating students leave furniture on pavements. Mid-Aug arrivals scoop free furnishings. Never sign a lease without an in-person (or video) walk-through — scams are common.',
    },

    // ── Safety & Inclusion (Afreen) ───────────────────────────────────────
    safety: {
      overallScore: 64,
      daytime: 'High in all university-adjacent areas',
      nighttime: 'Exercise caution in Roxbury, parts of Dorchester and Mattapan',
      safeZones: ['Cambridge (MIT/Harvard)', 'Beacon Hill', 'Back Bay', 'Fenway', 'South End'],
      cautionZones: ['Roxbury (avoid after 10 pm)', 'Dudley Square late night', 'parts of Dorchester'],
      racismClimate:
        'Progressive compared to US average; however students of colour (South Asian, Black) report frequent microaggressions outside university bubbles. LGBTQ+ community well-protected.',
      nuancedInsights: [
        'Safe during daytime campus-to-campus commutes — avoid unfamiliar side streets after midnight — Ananya R., India, Northeastern',
        'As a Black student from Nigeria I felt visible in ways I didn\'t expect in a "liberal" city — Kwame A., Boston University',
        'MBTA late at night is my only real concern — drunk passengers on weekends — Priya M., MIT',
        'Women travelling alone: stick to well-lit, populated routes. The T\'s Red Line is generally fine until last service — Reddit r/BostonStudents',
      ],
    },

    // ── Career & Pathway (Afreen) ─────────────────────────────────────────
    career: {
      overallScore: 88,
      topSectors: ['Biotech / Life Sciences', 'Finance', 'Tech', 'Healthcare', 'Education', 'Defence'],
      topCompanies: ['Vertex Pharmaceuticals', 'Moderna', 'Fidelity Investments', 'State Street', 'HubSpot', 'Wayfair', 'Raytheon', 'BCG', 'Bain'],
      partTimeRules: 'F-1 visa: max 20 hrs/wk on-campus ONLY during semester; CPT/OPT for off-campus',
      postGradVisa: 'OPT: 12 months; STEM OPT extension: +24 months (total 3 yrs)',
      visaRisk: 'HIGH — H-1B lottery post-OPT is unpredictable (~25% selection rate). Plan alternatives.',
      avgStartSalary: '$78,000–$115,000 (STEM graduates)',
      internshipStrength:
        'Exceptional. Northeastern co-op is industry-leading — 6-month paid placements built into the degree. MIT and Harvard recruit from top-tier firms aggressively.',
      hiddenPerk: 'Kendall Square (Cambridge) is the highest density of biotech IP per km² on the planet — networking events are free and frequent.',
    },

    // ── Healthcare ────────────────────────────────────────────────────────
    healthcare: {
      costLevel: 'Very High',
      studentPlan: 'Mandatory university insurance: $3,000–$4,500 / yr',
      waitTimes: 'Short for GP with appointment; specialist referrals 2–6 weeks',
      quality: 'World-class. Mass General, Brigham & Women\'s, Dana-Farber Cancer Institute all within reach.',
      mentalHealth: 'University counselling centres are well-resourced (MIT Mental Health especially).',
    },

    // ── Religion & Dietary ────────────────────────────────────────────────
    religion: {
      mosques: ['Islamic Society of Boston (Roxbury)', 'Cambridge Mosque (ISBCC)', 'MIT Muslim Community Space'],
      halalFood: 'Available across Cambridge & Somerville. Halal cart culture strong. Dedicated halal grocery stores in Watertown.',
      prayerSpaces: 'All major universities have multi-faith / quiet rooms.',
      kosher: 'Available — Brookline has a strong Jewish community with kosher options.',
    },

    // ── Transport ─────────────────────────────────────────────────────────
    transport: {
      system: 'MBTA (subway, bus, commuter rail)',
      needCar: 'No for core student areas — yes for internships in suburbs (Route 128 corridor)',
      biking: 'Moderate — improving, BlueBike share widely available',
      airportLink: 'Logan Airport: 15 min via Silver Line (free from airport side)',
    },

    // ── Social & Adventure ────────────────────────────────────────────────
    social: {
      eventsHighlight: 'Museum of Science, Isabella Stewart Gardner Museum (free under 25), Symphony Hall, Fenway concerts',
      studentOrgs: ['Indian Students Association (ISA)', 'Muslim Students Association (MSA)', 'African Students Union', 'LGBTQ+ resource centres at all universities'],
      outdoors: ['Charles River kayaking (free in summer)', 'Cape Cod (1.5 hrs)', 'White Mountains, NH (2 hrs)', 'Acadia, Maine (4 hrs)'],
      weather: 'Harsh winters (Dec–Mar, avg -5°C, heavy snow). Brilliant fall foliage. Hot humid summers.',
      hiddenGem: 'Walden Pond — Thoreau\'s lake, 40 mins west. Free, stunning, serene.',
    },

    // ── Lived Experience ──────────────────────────────────────────────────
    livedExperience: [
      {
        name: 'Aditya Sharma',
        from: 'India',
        program: 'MS Computer Science, Northeastern',
        avatar: 'AS',
        avatarColor: 'bg-indigo-500',
        quote:
          'The co-op program changed everything. I did 6 months at a Kendall Square AI startup and had a full-time return offer before graduation. Boston is genuinely expensive though — my share of a 3-bed in Allston is $1,150/mo and that\'s considered a deal. Budget $1,000/mo minimum just for rent.',
        source: 'YouTube study abroad vlog',
        verified: true,
        bias: null,
      },
      {
        name: 'Fatou Diallo',
        from: 'Senegal',
        program: 'MBA, Harvard Business School',
        avatar: 'FD',
        avatarColor: 'bg-teal-600',
        quote:
          'Halal food was easier than I expected — Cambridge has a solid corridor. The winters nearly destroyed me. February is a psychological test. Invest in real winter gear from day one; do not buy from H&M. Also: health insurance is a shock to the system if you\'re from Europe.',
        source: 'Student forum (Graduate Housing listserv)',
        verified: true,
        bias: 'Elite programme — HBS experience may not generalise to public universities',
      },
      {
        name: 'Carlos Mendez',
        from: 'Mexico',
        program: 'MFA, Boston University',
        avatar: 'CM',
        avatarColor: 'bg-purple-600',
        quote:
          'The arts scene is genuinely underrated for a tech city. But the OPT visa stress is real and existential. I watched three classmates have to leave the country after graduation because H-1B didn\'t come through. Build your contingency plan — Canadian PR, EU alternatives — from semester one.',
        source: 'Reddit r/gradadmissions',
        verified: false,
        bias: 'Arts track — career visa landscape differs significantly from STEM',
      },
    ],

    // ── Cost Forecast (mock Prophet/LSTM output, shared room price USD) ───
    costForecast: [
      { month: 'Now',    rent: 1200, cola: 2850, forecast: false },
      { month: '+1 mo',  rent: 1215, cola: 2870, forecast: false },
      { month: '+3 mo',  rent: 1240, cola: 2920, forecast: true  },
      { month: '+6 mo',  rent: 1290, cola: 3000, forecast: true  },
      { month: '+9 mo',  rent: 1330, cola: 3060, forecast: true  },
      { month: '+12 mo', rent: 1380, cola: 3140, forecast: true  },
    ],
    forecastNote: 'Shared-room median. Boston rent grew 6.2% YoY 2023–24 (Zillow). Forecast applies 5.5% annual trend.',
    forecastCurrency: 'USD',

    // ── Peer Ambassador ───────────────────────────────────────────────────
    peerAmbassador: {
      name: 'Priya Nair',
      from: 'Kerala, India',
      program: 'MS Bioengineering',
      university: 'MIT',
      avatar: 'PN',
      avatarColor: 'bg-indigo-500',
      timezone: 'EST (UTC-5)',
      timezoneLabel: 'Boston',
      languages: ['English', 'Hindi', 'Malayalam'],
      bio: 'Second-year student, TA in Systems Biology. Expert in: MIT housing lottery, ISBCC community, co-op applications, navigating international office bureaucracy.',
      rating: 4.9,
      responseTime: 'Within 2 hours (weekdays)',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  paris: {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    subtitle: 'Europe · French primary',
    tagline: 'Culture, history, and a hidden startup revolution',
    accentColor: '#14b8a6',

    dimensions: {
      career:      68,   // Good but sector-specific; French language required for local roles
      cost:        60,   // Mid-range — CROUS housing + free healthcare offsets sticker price
      safety:      69,   // Generally safe; Metro pickpocket awareness needed
      social:      93,   // Unmatched cultural richness — 400+ museums, world-class food scene
      diversity:   80,   // 130+ nationalities; large North African & Asian communities
      healthcare:  95,   // French universal healthcare — near-free for registered students
    },

    demographics: {
      internationalStudentPct: 22,
      topNationalities: ['Morocco', 'China', 'Algeria', 'Italy', 'Germany'],
      muslimCommunitySize: 'Very large — one of the largest Muslim populations in Europe (~10% of Paris metro)',
      lgbtqFriendly: true,
      localPersonality:
        'Often perceived as cold or rude — this is a misread of French directness and formality. Parisians warm considerably when you attempt French, even badly. Intellectual, food-obsessed, debate-loving.',
      alcoholCulture:
        'Wine is cultural glue — part of almost every social occasion. Non-drinkers are respected in student circles, but socialising in bars without drinking feels more conspicuous than in the Netherlands.',
      quietVsParty: 'Rich middle ground. Café culture, cinemas, museums for the quiet type. La Pigalle and République for nightlife.',
      whatLargeSchoolMeans: {
        stat: 'Sciences Po has 14,000 students across 7 campuses; Sorbonne has 40,000+',
        reality: 'Large French grandes écoles are campus-less — you share the city with everyone. Your "campus" is a neighbourhood. More freedom, less hand-holding. Student life happens in cafés, not quads.',
      },
    },

    cost: {
      avgRentStudio: '€1,100–€1,800 / mo',
      avgRentShared: '€650–€1,050 / mo',
      avgMonthlyTotal: '€1,400–€2,300',
      groceriesMonthly: '€200–€350 (markets are cheap; supermarkets moderate)',
      mealOutAvg: '€14–€22 (brasserie), €7–€11 (crêperie / kebab)',
      publicTransportMonthly: '€86 (Navigo pass) — FREE for students under 26 on select zones',
      coffeeShopHourlyWage: '~0.8 hrs of SMIC (French minimum wage)',
      source: 'Numbeo Q2-2024, Studapart Paris listings, Leboncoin',
    },
    housing: {
      options: [
        'CROUS government housing (€350–€600/mo — very competitive, apply immediately)',
        'Private residences (Studapart, Nexity Studéa) €700–€1,100',
        'Colocation (shared flat) via Leboncoin or SeLoger',
        'HousingAnywhere.com for international-friendly listings',
      ],
      popularAreas: ['Latin Quarter (5th/6th)', 'Bastille (11th/12th)', 'Montmartre (18th — cheaper)', 'Belleville (20th — very multicultural)'],
      sources: ['Studapart.com', 'HousingAnywhere.com', 'Leboncoin.fr', 'SeLoger.com'],
      avgLeadTime: 'CROUS: apply 6–8 months early (opens in April for Sept intake). Private: 2–4 months.',
      insiderTip:
        'Apply for CROUS the same day you receive your acceptance letter. It is heavily subsidised but massively oversubscribed. Leboncoin is France\'s Craigslist — check listings daily but verify identities carefully. Scammers are rampant. Garants (French rent guarantors) required — use Visale (free government scheme for international students).',
    },

    safety: {
      overallScore: 72,
      daytime: 'Very safe in tourist and student areas',
      nighttime: 'Generally safe — standard urban caution. Pickpockets are the main threat, especially on Metro lines 1, 2 and near Eiffel Tower.',
      safeZones: ['Marais (4th)', 'Saint-Germain-des-Prés (6th)', 'Île Saint-Louis', 'Montparnasse', 'Latin Quarter'],
      cautionZones: ['Parts of Saint-Denis (93, especially isolated streets)', 'Gare du Nord surroundings late night', 'Châtelet–Les Halles post-midnight'],
      racismClimate:
        'France\'s official laïcité (secularism) creates practical tensions for visibly religious students — hijab incidents in some academic settings have been reported. Racism exists but tends to be subtler than in smaller European cities. Afro-Caribbean and North African communities large and well-established.',
      nuancedInsights: [
        'As a Black woman from Senegal I felt very visible — some staring, rarely hostile. The stares come from curiosity more than hostility — Aminata D., Sciences Po',
        'Metro pickpockets got me twice in year one. Travel bag in front, keep phone in pocket — Zi W., Sorbonne',
        'Wearing hijab was occasionally an issue in formal academic contexts — laïcité rules vary by institution. Off-campus? Completely fine in most areas — Nadia B., Paris Dauphine',
        'After midnight around Gare du Nord: stay on main boulevards, walk confidently — Reddit r/ParisTips',
      ],
    },

    career: {
      overallScore: 70,
      topSectors: ['Luxury / Fashion', 'Finance & Banking', 'Tech Startups (Station F)', 'Aerospace', 'Consulting', 'Food & Hospitality'],
      topCompanies: ['LVMH', 'L\'Oréal', 'TotalEnergies', 'BNP Paribas', 'Capgemini', 'Criteo', 'Doctolib', 'BlaBlaCar', 'Alan', 'Airbus (Toulouse)'],
      partTimeRules: 'Student visa allows up to 964 hrs/yr (~20 hrs/wk). Work authorisation included in student visa.',
      postGradVisa: 'APS (Autorisation Provisoire de Séjour) — 1 year to find employment post-graduation. Renewable if employed.',
      visaRisk: 'MEDIUM — APS pathway is cleaner than US OPT/H-1B. Non-EU still requires employer sponsorship for long-term.',
      avgStartSalary: '€35,000–€58,000',
      internshipStrength:
        'Stages (internships) are mandatory in Grande École curricula and taken seriously. Less formalised for international university students. Station F (world\'s largest startup campus) actively recruits from Sciences Po and HEC.',
      hiddenPerk: 'VIE programme (Volontariat International en Entreprise) — a 6–24 month paid international placement open to EU nationals and some bilateral agreements.',
    },

    healthcare: {
      costLevel: 'Low to Moderate',
      studentPlan: 'French Social Security (CPAM) covers students. Annual CVEC contribution ~€103. Most care is free or near-free.',
      waitTimes: 'Generalists within days; specialists 3–6 weeks',
      quality: 'Excellent — WHO ranked France #1 globally. Public hospitals are strong; private clinics optional.',
      mentalHealth: 'University counselling (SUMPPS) is free. Growing awareness, still somewhat stigmatised culturally.',
    },

    religion: {
      mosques: ['Grande Mosquée de Paris (5th arr.)', 'Mosquée Adda\'wa (18th arr.)', 'Multiple neighbourhood mosques in 19th, 20th, and Saint-Denis'],
      halalFood: 'Extremely abundant. Whole arrondissements (18th, 19th, 20th) and suburbs (93) are halal-first. Major supermarkets increasingly stock halal sections.',
      prayerSpaces: 'Less common in universities due to laïcité, but Muslim student associations organise dedicated spaces.',
      kosher: 'Marais district has one of Europe\'s strongest kosher infrastructure networks.',
    },

    transport: {
      system: 'Exceptional — Métro (16 lines), RER (5 regional lines), Bus, Transilien, Vélib\' bike share, Trottinettes',
      needCar: 'Absolutely not. Car ownership is a liability in Paris — parking costs €250–€400/mo.',
      biking: 'Good and expanding. Vélib\' stations every 300m. Dedicated lanes covering most arrondissements.',
      airportLink: 'CDG: 30 min RER B (~€11.80). Orly: 35 min Orlyval + RER (~€13.25).',
    },

    social: {
      eventsHighlight: 'Louvre (€0 under 26 EU, €17 non-EU), Pompidou Centre, Philharmonie concerts from €10, Nuit Blanche (all-night art festival)',
      studentOrgs: ['Sciences Po International Students Club', 'ERASMUS network events (Meetup)', 'Language exchange cafés', 'Alliance Française', 'Pan-African student networks'],
      outdoors: ['Bois de Boulogne / Vincennes', 'Seine riverside cycling', 'Versailles (40 min, €5 by train)', 'Loire Valley weekend', 'Alps from Lyon (2.5 hrs TGV)'],
      weather: 'Mild Atlantic climate — cold grey winters (2–8°C), warm pleasant summers (22–28°C), rainy spring.',
      hiddenGem: 'Promenade Plantée — elevated garden walkway above an old railway viaduct through the 12th arr. Completely free, serene.',
    },

    livedExperience: [
      {
        name: 'Zineb Laaroussi',
        from: 'Morocco',
        program: 'Masters International Relations, Sciences Po Paris',
        avatar: 'ZL',
        avatarColor: 'bg-teal-600',
        quote:
          'Paris was harder than expected at first because my French wasn\'t fluent. Month three something clicked. The CROUS housing was a lifesaver — €450/mo including WiFi, in the 15th arr. Halal food? You\'re never more than 5 minutes from a quality kebab or a full halal supermarket near campus.',
        source: 'YouTube study abroad vlog',
        verified: true,
        bias: null,
      },
      {
        name: 'Chen Wei',
        from: 'China',
        program: 'MBA, HEC Paris',
        avatar: 'CW',
        avatarColor: 'bg-blue-600',
        quote:
          'Station F is genuinely impressive — I got introduced to a Series A founder through my HEC alumni network in month two. Paris as a tech hub is more serious than its reputation. The French language barrier is real for the first six months; push through it and the city transforms.',
        source: 'LinkedIn article (HEC Insights)',
        verified: true,
        bias: 'Elite MBA programme — may not generalise to public French universities',
      },
      {
        name: 'Thomas Eriksson',
        from: 'Sweden',
        program: 'Architecture, École Nationale des Beaux-Arts',
        avatar: 'TE',
        avatarColor: 'bg-amber-600',
        quote:
          'Cultural richness is incomparable. €8 student entry to the Louvre and I went every other week. The downside is housing — the CROUS waitlist stress nearly broke me. I spent month one in an Airbnb burning through savings. Book CROUS the literal day you get accepted.',
        source: 'Reddit r/studyabroad',
        verified: false,
        bias: 'EU national — housing process somewhat easier than for non-EU students',
      },
    ],

    costForecast: [
      { month: 'Now',    rent: 800,  cola: 1550, forecast: false },
      { month: '+1 mo',  rent: 808,  cola: 1565, forecast: false },
      { month: '+3 mo',  rent: 825,  cola: 1595, forecast: true  },
      { month: '+6 mo',  rent: 855,  cola: 1640, forecast: true  },
      { month: '+9 mo',  rent: 880,  cola: 1685, forecast: true  },
      { month: '+12 mo', rent: 910,  cola: 1730, forecast: true  },
    ],
    forecastNote: 'Shared-room median. Paris rent grew 3.8% YoY 2023–24 (Leboncoin index). Forecast applies 4% annual trend.',
    forecastCurrency: 'EUR',

    peerAmbassador: {
      name: 'Yasmine Benali',
      from: 'Algeria',
      program: 'Masters Finance',
      university: 'Université Paris Dauphine-PSL',
      avatar: 'YB',
      avatarColor: 'bg-teal-600',
      timezone: 'CET (UTC+1)',
      timezoneLabel: 'Paris',
      languages: ['French', 'English', 'Arabic'],
      bio: 'Third-year student, part-time analyst at BNP Paribas. Expert in: CROUS applications, CAF rent aid, Visale guarantor, Muslim student networks, Navigo travel card.',
      rating: 4.8,
      responseTime: 'Within 4 hours (weekdays)',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  netherlands: {
    id: 'netherlands',
    name: 'Netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    subtitle: 'Europe · English-friendly',
    tagline: 'Engineering paradise with a human-scale quality of life',
    accentColor: '#8b5cf6',

    dimensions: {
      career:      80,   // Strong STEM ecosystem (ASML, Philips) but smaller than Boston
      cost:        70,   // Best value — €700-900/mo shared room; zorgtoeslag offsets insurance
      safety:      93,   // Consistently top 3 safest countries in the world
      social:      76,   // Rich student associations but Delft is a small city
      diversity:   88,   // 35% international at TU Delft — highest ratio in comparison
      healthcare:  80,   // Mandatory ~€130/mo but zorgtoeslag government grant offsets most
    },

    demographics: {
      internationalStudentPct: 35,
      topNationalities: ['Germany', 'China', 'India', 'Italy', 'UK'],
      muslimCommunitySize: 'Large — significant Turkish and Moroccan communities, especially in Amsterdam, Rotterdam, The Hague',
      lgbtqFriendly: true,
      localPersonality:
        'Extremely direct — can feel blunt or even rude if you\'re not prepared. It\'s efficiency, not hostility. Highly punctual, cycling-obsessed, progressive, allergic to hierarchy. English-fluency is near-universal under 50.',
      alcoholCulture:
        'Beer culture (Heineken, Grolsch) is present but Dutch are the most pragmatic Europeans about abstaining. "I don\'t drink" is met with a shrug and an offer of sparkling water. Zero social pressure.',
      quietVsParty: 'Well balanced — active student associations (studieverenigingen), cycling lifestyle, nature access; also meaningful nightlife in Amsterdam and Eindhoven.',
      whatLargeSchoolMeans: {
        stat: 'TU Delft has 27,000 students, 32% international',
        reality: 'At TU Delft the scale means world-class labs and direct industry pipelines (ASML literally sends buses to campus). But Delft is a small city — you\'ll see the same faces repeatedly. Community builds fast.',
      },
    },

    cost: {
      avgRentStudio: '€1,100–€1,800/mo (Amsterdam) · €700–€1,100 (Delft / Rotterdam)',
      avgRentShared: '€550–€950 / mo',
      avgMonthlyTotal: '€1,200–€2,100',
      groceriesMonthly: '€180–€300 (Albert Heijn / Lidl)',
      mealOutAvg: '€12–€20 (restaurant), €4–€8 (broodje / shoarma)',
      publicTransportMonthly: '€90–€120 (OV-chipkaart) or free on student travel card (OV-studentenkaart)',
      coffeeShopHourlyWage: '~0.7 hrs of Dutch minimum wage',
      source: 'Numbeo Q2-2024, Kamernet, HousingAnywhere listings',
    },
    housing: {
      options: [
        'TU Delft guaranteed 1st-year housing (apply immediately on acceptance) — €400–€600/mo',
        'SSH Student Housing Corporation — Amsterdam/Rotterdam — €450–€750/mo',
        'Kamernet private rooms €550–€950/mo',
        'HousingAnywhere.com (international-first platform)',
      ],
      popularAreas: ['Delft (small, safe, student-dense)', 'Amsterdam Oost/South', 'Rotterdam (cheapest major city)', 'Eindhoven (near ASML HQ)'],
      sources: ['Kamernet.nl', 'HousingAnywhere.com', 'SSH-wonen.nl', 'Pararius.nl'],
      avgLeadTime: 'TU Delft: guaranteed yr-1 if you apply within 2 weeks of acceptance. Amsterdam: 3–5 months.',
      insiderTip:
        'Register on Kamernet the day you get accepted — listings go in hours. Dutch rooms are often unfurnished (meubelloos) — factor in €300–€500 for basic furniture from IKEA/Marktplaats. Delft is significantly cheaper and more liveable than Amsterdam for students. Buy a second-hand bike within 48 hours of arriving (€50–€150) — this is literally how the country functions.',
    },

    safety: {
      overallScore: 92,
      daytime: 'Excellent across all student areas',
      nighttime: 'Very safe — among Europe\'s lowest crime rates. Standard late-night urban awareness applies.',
      safeZones: ['Delft (entire city)', 'Utrecht centre', 'Amsterdam Oud-Zuid / Jordaan', 'Eindhoven centre', 'Rotterdam Centrum'],
      cautionZones: ['Amsterdam Red Light District (tourist nuisances, not dangerous)', 'Isolated train stations after midnight'],
      racismClimate:
        'Progressive nationally; Zwarte Piet debate shows cultural complexity. Dutch society is genuinely welcoming to international students and TU Delft / UvA have strong inclusion infrastructure. Isolated incidents reported but rarely hostile.',
      nuancedInsights: [
        'I\'ve never felt unsafe in Delft in three years, including cycling home alone at midnight — Arjun P., TU Delft, India',
        'Dutch directness felt rude for the first month. Then I realised I was getting 100% honesty all the time and started to love it — Liu J., UvA, China',
        'As a Black student from Nigeria, the Netherlands was much more welcoming than I feared. TU Delft\'s inclusion programmes are genuinely active — Chidi O., Nigeria',
        'Practical safety tip: lock your bike with TWO locks — Amsterdam bike theft is the one real crime problem — Reddit r/Netherlands',
      ],
    },

    career: {
      overallScore: 92,
      topSectors: ['High-Tech Engineering', 'Semiconductors', 'AgriTech', 'Fintech', 'Logistics', 'Sustainability / Clean Energy'],
      topCompanies: ['ASML (global HQ, Eindhoven)', 'NXP Semiconductors', 'Philips', 'Booking.com', 'Adyen', 'Shell', 'KPMG NL', 'Unilever', 'Heineken', 'IMEC'],
      partTimeRules: 'Max 16 hrs/wk during study year, unlimited during summer. Very easy to find part-time work in service / research sectors.',
      postGradVisa: 'HSMS (Highly Skilled Migrant Scheme): 1-year Zoekjaar (orientation year) visa post-graduation — highly accessible.',
      visaRisk: 'LOW — Zoekjaar is predictable, HSMS pathway well-established. EU free movement bonus once settled.',
      avgStartSalary: '€45,000–€72,000',
      internshipStrength:
        'Exceptional at TU Delft and TU Eindhoven. ASML, Philips, and NXP have direct on-campus pipelines. Many MSc students convert internships to full-time before graduation.',
      hiddenPerk: 'The Netherlands has a "30% ruling" — highly skilled migrants pay no tax on 30% of their salary for 5 years after graduating. Significant financial advantage.',
    },

    healthcare: {
      costLevel: 'Moderate',
      studentPlan: 'Mandatory health insurance ~€130–€155/mo. Zorgtoeslag (government health allowance) can reimburse ~€120/mo for low-income students.',
      waitTimes: 'GP (huisarts): same/next day. Specialists: 4–8 weeks.',
      quality: 'Excellent — highly efficient system. Mental health support through GGZ institutions.',
      mentalHealth: 'Dutch society has low stigma around mental health. University well-being officers are accessible.',
    },

    religion: {
      mosques: ['Mevlana Mosque (Rotterdam — Netherlands\' largest)', 'Al Kabir Mosque (Amsterdam)', 'Mosque El Islam (Delft)', 'Multiple city mosques in every Dutch city'],
      halalFood: 'Widely available. Delft has dedicated halal supermarkets near TU campus. Amsterdam entire neighbourhoods (De Pijp, East) offer full halal infrastructure.',
      prayerSpaces: 'Muslim Student Associations (MSA) at TU Delft, UvA, EUR are active and maintain dedicated spaces.',
      kosher: 'Available in Amsterdam (Jewish heritage neighbourhood).',
    },

    transport: {
      system: 'Exceptional — intercity trains (NS), trams, buses, metro (GVB/RET/HTM) — all integrated on OV-chipkaart',
      needCar: 'Never — cycling is the primary transport system. A bike is cheaper and faster than any other option.',
      biking: 'World-class — dedicated infrastructure everywhere, 35,000 km of cycle paths nationally.',
      airportLink: 'Schiphol Airport: 15 min from Amsterdam Centraal (€5.50), 1 hr from Delft by train.',
    },

    social: {
      eventsHighlight: 'Studieverenigingen (student associations) are uniquely active — weekly events, sports, cultural nights. Gaudeamus (TU Delft student festival), Koningsdag city-wide party',
      studentOrgs: ['TU Delft ISA (International Students Association)', 'AEGEE (pan-European student network)', 'MSA (Muslim Student Association)', 'Indonesian Student Association (large community)', 'Erasmus Sports Centre'],
      outdoors: ['Cycling everywhere (literally the point)', 'Keukenhof tulip fields (spring, 30 min)', 'Hoge Veluwe National Park', 'North Sea beaches (30–45 min)', 'Day trips to Belgium, Germany, or Paris (Thalys)'],
      weather: 'Mild, grey and rainy (avg 10–15°C). Summers 20–25°C pleasant. Rarely extreme.',
      hiddenGem: 'Scheveningen beach (30 min from Delft by train) — the North Sea at sunset, with cheap North Sea herring from a street stall. Quintessentially Dutch.',
    },

    livedExperience: [
      {
        name: 'Rohan Mehta',
        from: 'India',
        program: 'MSc Electrical Engineering, TU Delft',
        avatar: 'RM',
        avatarColor: 'bg-violet-600',
        quote:
          'Getting a part-time research assistant role was surprisingly easy — I applied within my department and got it in week 3. The English proficiency here genuinely shocked me: I have never once needed Dutch to function in Delft. ASML literally came to our campus in month 2 for an informal Q&A. I already have an internship lined up.',
        source: 'YouTube study abroad vlog',
        verified: true,
        bias: null,
      },
      {
        name: 'Amina Hassan',
        from: 'Somalia / UK',
        program: 'MSc Sustainable Energy Technology, TU Eindhoven',
        avatar: 'AH',
        avatarColor: 'bg-emerald-600',
        quote:
          'Halal food in Amsterdam is zero problem — entire neighbourhoods cater to it. Delft is smaller but there are two fully halal supermarkets near campus. Dutch directness was a culture shock initially but honestly it\'s become my favourite thing — I always know exactly where I stand with people.',
        source: 'TikTok transcript (study abroad series)',
        verified: true,
        bias: null,
      },
      {
        name: 'Javier Ruiz',
        from: 'Colombia',
        program: 'MSc Architecture, TU Delft',
        avatar: 'JR',
        avatarColor: 'bg-orange-600',
        quote:
          'The housing market is genuinely brutal — I almost gave up before I found my place on Kamernet after refreshing listings every 2 hours for three weeks. Start looking the second you get your acceptance email. Once I had housing though — best decision I ever made. Clean, safe, cycling everywhere, people are honest once you know them.',
        source: 'Reddit r/Netherlands',
        verified: false,
        bias: 'Non-EU student — housing competition is particularly difficult without Dutch connections',
      },
    ],

    costForecast: [
      { month: 'Now',    rent: 720,  cola: 1350, forecast: false },
      { month: '+1 mo',  rent: 728,  cola: 1362, forecast: false },
      { month: '+3 mo',  rent: 745,  cola: 1390, forecast: true  },
      { month: '+6 mo',  rent: 775,  cola: 1435, forecast: true  },
      { month: '+9 mo',  rent: 800,  cola: 1475, forecast: true  },
      { month: '+12 mo', rent: 830,  cola: 1520, forecast: true  },
    ],
    forecastNote: 'Shared-room median (Delft/Rotterdam). NL rent grew 4.9% YoY 2023–24 (Kamernet index). Forecast applies 4.5% annual trend.',
    forecastCurrency: 'EUR',

    peerAmbassador: {
      name: 'Amir Khalid',
      from: 'Pakistan',
      program: 'MSc Computer Science',
      university: 'University of Amsterdam',
      avatar: 'AK',
      avatarColor: 'bg-violet-600',
      timezone: 'CET (UTC+1)',
      timezoneLabel: 'Amsterdam',
      languages: ['English', 'Urdu', 'Basic Dutch'],
      bio: 'Final-year student, part-time software engineer at Booking.com. Expert: Dutch Zoekjaar visa, Kamernet housing hunt, Muslim student life, OV-chipkaart, Amsterdam vs Delft comparison.',
      rating: 4.9,
      responseTime: 'Within 2 hours (weekdays)',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Archetype Centroids (K-Means cluster centres)
// Each centroid is defined in the same 6-dimension preference space as user weights
// ─────────────────────────────────────────────────────────────────────────────
export const STUDENT_ARCHETYPES = [
  {
    id: 'budget_careerist',
    label: 'Budget-Conscious Careerist',
    emoji: '💼',
    color: 'from-indigo-500 to-violet-500',
    description: 'You want the highest career return for every dollar spent. Strategic, ROI-focused, won\'t compromise on outcomes.',
    centroid: { career: 9, cost: 9, safety: 5, social: 3, diversity: 4, healthcare: 4 },
    bestCityId: 'netherlands',
    insight: 'Netherlands: ASML / Philips access at 35% lower cost than Boston.',
  },
  {
    id: 'social_community',
    label: 'Social-First Community Seeker',
    emoji: '🤝',
    color: 'from-teal-500 to-cyan-500',
    description: 'You\'re here for the full human experience — friendships, culture, belonging. Academics matter but so does joy.',
    centroid: { career: 5, cost: 5, safety: 6, social: 10, diversity: 9, healthcare: 4 },
    bestCityId: 'paris',
    insight: 'Paris: unmatched cultural richness, massive international student network.',
  },
  {
    id: 'safety_academic',
    label: 'Safety-First Academic',
    emoji: '📚',
    color: 'from-emerald-500 to-teal-500',
    description: 'Study hard, stay safe, graduate with a world-class degree. Stability and structure over everything.',
    centroid: { career: 7, cost: 5, safety: 10, social: 4, diversity: 5, healthcare: 9 },
    bestCityId: 'netherlands',
    insight: 'Netherlands tops European safety rankings with strong student support infrastructure.',
  },
  {
    id: 'cultural_explorer',
    label: 'Cultural Explorer',
    emoji: '🌍',
    color: 'from-orange-500 to-pink-500',
    description: 'You want to be genuinely changed by where you live. Food, people, history, unexpected encounters — that\'s the point.',
    centroid: { career: 4, cost: 5, safety: 6, social: 8, diversity: 10, healthcare: 5 },
    bestCityId: 'paris',
    insight: 'Paris: 130 nationalities, 400+ museums, the richest cultural density in Western Europe.',
  },
]

export const DIMENSION_META = {
  career:      { label: 'Career & Visa',     icon: '💼', description: 'Job market, post-grad visa, industry presence' },
  cost:        { label: 'Affordability',      icon: '💰', description: 'Rent, groceries, transport, hidden costs' },
  safety:      { label: 'Safety & Inclusion', icon: '🛡️', description: 'Crime, inclusivity, racism tolerance' },
  social:      { label: 'Social & Culture',   icon: '🎭', description: 'Events, communities, nightlife, culture' },
  diversity:   { label: 'Diversity',          icon: '🌍', description: 'International community, representation' },
  healthcare:  { label: 'Healthcare',         icon: '🏥', description: 'Cost, quality, accessibility, mental health' },
}
