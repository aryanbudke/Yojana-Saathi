/**
 * English source strings. Hindi and Kannada must match this shape exactly;
 * TypeScript fails the build if a key is missing.
 * Placeholders use {name} and are filled by `format()` from ../config.
 */
export const en = {
  meta: {
    title: "yojana saathi — Government schemes, made simple.",
    description:
      "Discover government support, understand the conditions, and prepare your next step. Independent preliminary guidance.",
    discover: "Discover schemes — yojana saathi",
    eligibility: "Eligibility checks — yojana saathi",
    eligibilityDescription:
      "Detailed eligibility criteria, rule results and preconditions.",
    profile: "My profile — yojana saathi",
    profileDescription:
      "Review and edit your profile details for scheme matching.",
    saved: "Saved schemes — yojana saathi",
    savedDescription:
      "Your bookmarked government schemes and application checklists.",
  },
  common: {
    unknown: "Unknown",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    loading: "Loading…",
    loadingContent: "Loading content",
    loadingSchemes: "Loading government schemes…",
    opensInNewTab: " (opens in a new tab)",
    closeModal: "Close modal",
    tryAgain: "Try again",
    officialSource: "Official source",
    sourceUnavailable: "Source link unavailable",
    syntheticFixture: " · synthetic fixture",
    sourceReferenceUnavailable: "Source reference unavailable",
    officialStepPage: "Official step page",
    active: "Active",
    closed: "Closed",
    applicationsClosed: "Applications closed",
    applicationStatusUnknown: "Application status unknown",
    viewDetails: "View details",
    lastVerifiedOn: "Last verified on {date}",
    checkedOn: "Checked on {date}",
    documentDate: "Document date: {date}",
    verificationDateUnavailable: "Verification date unavailable",
    schemeLevel: "{level} scheme",
    confirmedByYou: "Confirmed by you",
    exploreSchemes: "Explore schemes",
    explore: "Explore",
  },
  language: {
    label: "Language",
  },
  nav: {
    skipToContent: "Skip to content",
    homeLink: "yojana saathi home",
    mainNavigation: "Main navigation",
    home: "Home",
    discover: "Discover",
    matches: "Matches",
    profile: "Profile",
    saved: "Saved",
    signIn: "Sign in",
    signOut: "Sign out",
    signingOut: "Signing out…",
    menu: "Menu",
    findMySchemes: "Find my schemes",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
  },
  auth: {
    eyebrow: "Your Yojana Saathi account",
    signInTitle: "Welcome back",
    signInLead: "Sign in to continue your saved scheme journey and profile.",
    signUpTitle: "Create your account",
    signUpLead:
      "Keep your profile, saved schemes and next steps together in one place.",
    asideTitle: "Your scheme journey, kept together.",
    asideText:
      "Return to saved schemes, review your profile and continue preparing your next steps.",
    privacyNote:
      "Never enter Aadhaar, bank account or identity-document details here.",
    name: "Full name",
    namePlaceholder: "Enter your full name",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Enter the password again",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signIn: "Sign in",
    signUp: "Create an account",
    createAccount: "Create account",
    submitting: "Please wait…",
    noAccount: "New to Yojana Saathi?",
    haveAccount: "Already have an account?",
    checkEmail:
      "Account created. Check your email and confirm your address before signing in.",
    termsPrefix: "By creating an account, you agree to our",
    privacyPolicy: "privacy policy",
    termsJoin: "and",
    disclaimer: "disclaimer",
    errors: {
      nameRequired: "Please enter your full name.",
      required: "Please enter both your email and password.",
      invalidEmail: "Please enter a valid email address.",
      passwordLength: "Use a password with at least 8 characters.",
      passwordMismatch: "The passwords do not match.",
      configuration:
        "Account access is not configured. Please contact support.",
      invalidCredentials: "The email or password is incorrect.",
      emailNotConfirmed: "Confirm your email address before signing in.",
      accountExists:
        "An account with this email already exists. Try signing in.",
      signupDisabled: "New account registration is currently unavailable.",
      rateLimited: "Too many attempts. Wait a moment and try again.",
      submitFailed: "We couldn’t complete that request. Please try again.",
    },
  },
  mobileNav: {
    label: "Mobile quick dock",
  },
  footer: {
    tagline:
      "Find government support, understand the conditions and prepare your next step with clarity and trust.",
    madeFor: "Made for citizens across India · English, हिन्दी, ಕನ್ನಡ",
    product: "Product",
    support: "Support",
    legal: "Legal & Trust",
    home: "Home",
    discover: "Discover schemes",
    howItWorks: "How it works",
    profile: "My profile",
    recommendations: "Recommendations",
    guide: "Application guide",
    helpCenter: "Help center",
    faq: "FAQ",
    about: "About",
    privacy: "Privacy policy",
    disclaimer: "Disclaimer",
    nationalPortal: "National Portal of India",
    copyright: "{year} yojana saathi · Independent preliminary guidance",
  },
  mock: {
    label: "Mock mode",
    banner:
      "Synthetic contract examples. These are not real government scheme recommendations.",
    notice:
      "Synthetic contract examples. These are not government scheme recommendations.",
  },
  disclaimer:
    "An independent project. This is preliminary guidance; the government portal makes final decisions. We do not submit or approve applications.",
  errors: {
    rateLimited:
      "Too many requests. Please wait a moment, then try again. Your details are still here.",
    sessionExpired:
      "Your session has expired. Review your details to start a new session.",
    unavailable:
      "The service is temporarily unavailable. Try again or enter your details manually.",
    generic:
      "We couldn’t complete that request. Your details are still here; please try again.",
    codes: {
      CONFIGURATION: "The API URL is not configured.",
      HTTP_ERROR:
        "The request could not be completed. Check your details and try again.",
      INVALID_RESPONSE:
        "The service returned an incomplete response. Please try again.",
      UNVERIFIED_SOURCE:
        "The service returned placeholder sources. Scheme guidance cannot be verified.",
      NETWORK_ERROR:
        "We couldn’t reach the service. Check your connection and try again.",
      LIVE_API_REQUIRED:
        "Voice features need a connection to the live service.",
    } as Record<string, string>,
  },
  categoryAudience: {
    agriculture: "Farmer",
    education: "Student",
    women: "Women",
    senior_citizen: "Senior Citizen",
    entrepreneurship: "Small Business",
    housing: "Housing",
  },
  categoryNames: {
    agriculture: "Agriculture",
    education: "Education",
    women: "Women",
    senior_citizen: "Senior Citizen",
    entrepreneurship: "Small Business",
    housing: "Housing",
  } as Record<string, string>,
  governmentLevel: {
    central: "Central",
    state: "State",
  },
  reviewStatus: {
    draft: "Draft",
    verified: "Verified",
    stale: "Stale",
    rejected: "Rejected",
  },
  verdicts: {
    all_checked_conditions_met: "All checked conditions met",
    needs_information: "Needs verification",
    not_eligible: "Not eligible",
    manual_review: "Manual review",
  },
  ruleResults: {
    pass: "Pass",
    fail: "Fail",
    unknown: "Unknown",
    manual_review: "Manual review",
  },
  documentStatus: {
    present: "Reported present",
    missing: "Missing",
    unknown: "Unknown",
    may_be_required: "May be required",
  },
  /** Answer options sent by the follow-up question API. */
  answers: {
    yes: "Yes",
    no: "No",
    not_sure: "Not sure",
  } as Record<string, string>,
  fields: {
    age: "Age",
    state_code: "State or union territory",
    occupation: "Occupation",
    family_income_inr: "Annual family income (₹)",
    land_area_acres: "Land area (acres)",
    land_registration: "Land registered to your family",
    category: "Support category",
    is_student: "Currently a student",
    gender: "Gender (only if needed)",
    social_category: "Social category (only if needed)",
    has_disability: "Disability status (only if needed)",
    support_needs: "Support needed",
  },
  states: {
    AP: "Andhra Pradesh",
    AR: "Arunachal Pradesh",
    AS: "Assam",
    BR: "Bihar",
    CG: "Chhattisgarh",
    GA: "Goa",
    GJ: "Gujarat",
    HR: "Haryana",
    HP: "Himachal Pradesh",
    JH: "Jharkhand",
    KA: "Karnataka",
    KL: "Kerala",
    MP: "Madhya Pradesh",
    MH: "Maharashtra",
    MN: "Manipur",
    ML: "Meghalaya",
    MZ: "Mizoram",
    NL: "Nagaland",
    OD: "Odisha",
    PB: "Punjab",
    RJ: "Rajasthan",
    SK: "Sikkim",
    TN: "Tamil Nadu",
    TS: "Telangana",
    TR: "Tripura",
    UP: "Uttar Pradesh",
    UK: "Uttarakhand",
    WB: "West Bengal",
    AN: "Andaman and Nicobar Islands",
    CH: "Chandigarh",
    DN: "Dadra and Nagar Haveli and Daman and Diu",
    DL: "Delhi",
    JK: "Jammu and Kashmir",
    LA: "Ladakh",
    LD: "Lakshadweep",
    PY: "Puducherry",
  } as Record<string, string>,
  home: {
    hero: {
      eyebrow: "Government schemes, made simple",
      titleLead: "The support you deserve is",
      titleAccent: "closer",
      titleMiddle: "than you",
      titleEnd: "think.",
      lead: "Discover government schemes that match your situation, understand eligibility rules clearly, and take the right next step — all in one simple, independent place.",
      findMySchemes: "Find my schemes",
      exploreCatalogue: "Explore catalogue",
      valueProps: [
        "Simple eligibility guidance",
        "Multiple scheme categories",
        "Official application links",
      ],
    },
    showcase: {
      label: "Example schemes",
      note: "Real schemes. Real opportunities.",
      exampleScheme: "Example scheme",
      officialPortal: "Official portal",
      schemes: {
        pmKisan: {
          fullName: "Pradhan Mantri Kisan Samman Nidhi",
          authority: "Ministry of Agriculture & Farmers Welfare",
          category: "Agriculture",
          purpose: "Income support for landholding farmer families.",
        },
        pmVidyalaxmi: {
          fullName: "PM-Vidyalaxmi education loan scheme",
          authority: "Ministry of Education",
          category: "Education",
          purpose:
            "Education loans for students admitted to quality higher-education institutions.",
        },
        pmayGramin: {
          fullName: "Pradhan Mantri Awas Yojana – Gramin",
          authority: "Ministry of Rural Development",
          category: "Housing",
          purpose:
            "Assistance to build pucca houses for eligible rural households.",
        },
      },
    },
    benefits: {
      title: "What yojana saathi helps with",
      items: [
        {
          title: "Find schemes for your situation",
          text: "Describe your situation in plain language and get relevant schemes.",
        },
        {
          title: "Clear eligibility guidance",
          text: "Understand who can apply and what conditions apply.",
        },
        {
          title: "Official and trusted sources",
          text: "Direct links to government portals and official information.",
        },
        {
          title: "Independent and unbiased",
          text: "We help you discover and prepare. We don't submit applications.",
        },
      ],
    },
    how: {
      eyebrow: "A clearer next step",
      title: "How it works",
      lead: "From your situation to the right opportunities, in three simple steps.",
      step: "Step {n}",
      forExample: "For example",
      step1Title: "Tell us about your situation",
      step1SrHint: " (Share your needs)",
      step1Text: "Describe your background, needs and goals in plain language.",
      step1Link: "Describe your situation",
      step2Title: "Get a personalised match",
      step2Text:
        "We find relevant schemes and show key details for your review.",
      step2Tag: "AI + Rule checks",
      step3Title: "Take the next step",
      step3Text:
        "Follow official links and prepare your application with confidence.",
      step3Tag: "Official links & checklist",
    },
    categories: {
      title: "Explore scheme categories",
      lead: "Browse by category to see relevant government schemes.",
      viewAll: "View all schemes",
      regionLabel: "Popular categories",
      schemes: "Schemes",
    },
    sources: {
      title: "Trusted official sources",
      lead: "All scheme information is sourced from official government portals.",
      agriculture: "Ministry of Agriculture & Farmers Welfare",
      education: "Ministry of Education",
      rural: "Ministry of Rural Development",
      nationalPortal: "National Portal of India",
      governmentOfIndia: "Government of India",
      calloutTitle:
        "We help you prepare. We don’t submit, approve or track applications on your behalf.",
      calloutText:
        "Follow official procedures and use the provided links to complete your application.",
      calloutLink: "Explore scheme guidance",
    },
    guidance: {
      eyebrow: "Application roadmap",
      title: "Application guidance",
      lead: "Four clear stages to prepare and submit your government scheme application.",
      steps: [
        {
          title: "Check eligibility",
          text: "Read the checked conditions and resolve any missing or unverified details.",
        },
        {
          title: "Prepare documents",
          text: "Use the scheme’s personal checklist to prepare the documents its reviewed guidance lists.",
        },
        {
          title: "Apply through the official portal",
          text: "Follow the verified application route. Some schemes require an office visit instead.",
        },
        {
          title: "Track on the official portal",
          text: "Where tracking is available, keep your reference number and check with the responsible authority.",
        },
      ],
      note: "Yojana Saathi provides guidance and does not submit or approve government applications.",
      link: "Explore scheme guidance",
    },
  },
  discover: {
    eyebrow: "Discover schemes",
    title: "Find support that fits your situation",
    lead: "Describe your situation for a personal shortlist, or browse the catalogue by category and state.",
    browseEyebrow: "Browse by category",
    browseTitle: "Explore schemes",
    browseNote: "Browse without sharing a profile",
    categoriesLabel: "Support categories",
    searchLabel: "Search schemes",
    searchPlaceholder: "Search by scheme or support…",
    stateLabel: "Filter by state",
    allStates: "All states + national",
    search: "Search",
    clearFilters: "Clear filters",
    finding: "Finding schemes…",
    resultsOne: "{count} scheme on this page",
    resultsOther: "{count} schemes on this page",
    nextPage: "Next page",
    emptyTitle: "No schemes found for these filters",
    emptyText:
      "Try another category or broaden your search. National schemes are included when relevant.",
    catalogueEmptyTitle: "No schemes are available yet",
    catalogueEmptyText:
      "Schemes appear here once they have been reviewed against their official sources.",
    manualVerification: "Manual verification required · {status}",
  },
  profile: {
    title: "Tell us about your situation",
    badge: "Your profile",
    lead: "You don’t need to know a scheme’s name. Just share a few details about yourself.",
    textLabel: "Tell us about yourself",
    placeholder:
      "I’m a farmer in Maharashtra looking for support for my family…",
    example:
      "I’m a 24-year-old farmer from Maharashtra helping my family farm 1.5 acres.",
    tryExample: "Try an example",
    characters: "{count}/1000 characters",
    reviewing: "Reviewing your details…",
    findMySchemes: "Find my schemes",
    enterManually: "Enter details manually",
    mockNote:
      "Mock extraction returns the sample farmer profile. Use manual entry for your own details.",
    privacy: "Only share what’s needed. Don’t enter Aadhaar numbers.",
    reviewEyebrow: "02 / Check your details",
    reviewTitle: "Check your details",
    needsReview: "Needs your review",
    reviewLead:
      "Correct anything that doesn’t look right. Blank fields stay unknown; nothing is assumed.",
    supportNeedsPlaceholder: "education, housing, health (comma-separated)",
    provided: "{count} details provided",
    stillUnknown: "{count} still unknown",
    reviewLegend: "Review your profile facts",
    originUser: "Edited or confirmed by you",
    originBlank: "Not provided · stays unknown",
    originExtracted: "Extracted · please review",
    confirm: "Confirm my details",
    confirmUpdated: "Confirm updated details",
    clear: "Clear my details",
    confirmedNotice: "Your details are confirmed for this anonymous session.",
    confirmedShort: "Details confirmed for this anonymous session.",
    seeRecommendations: "See my recommendations →",
    statusReviewing: "Reviewing your details",
    statusSaving: "Saving confirmed details",
    confirmEyebrow: "02 / CONFIRM YOUR PROFILE",
    confirmTitle: "Let’s check your details.",
    confirmLead:
      "We found a few details from your message. Confirm or correct them before we look for matching schemes.",
    extractedSummary: "{count} details extracted · More information may be needed",
    extractedSummaryReady: "{count} details extracted · Ready for matching",
    manualEntrySummary: "Manual entry · Fill in what you know",
    extractedSectionTitle: "Extracted information",
    extractedSectionLead:
      "Details extracted from your description. Edit any field that looks incorrect.",
    extractedBadge: "Extracted from your message",
    correctedBadge: "Corrected by you",
    missingSectionTitle: "Anything else you’d like to add?",
    missingSectionLead:
      "Optional details that help refine matching. You can leave these unknown.",
    accordionTitle: "Add more details (optional)",
    accordionSubtitle:
      "Land records, student status, reservations, or disability criteria",
    continueMatching: "Continue to matching →",
    editOriginalMessage: "Edit my original message",
    privacyPanelText:
      "We’ll only ask for additional details when a scheme requires them. You can skip questions you’re unsure about.",
    privacyPanelAadhaar:
      "Never share Aadhaar numbers or confidential identity documents.",
    socialCategoryNote:
      "Used only by schemes providing reservations or specialized quotas.",
    disabilityNote:
      "Used only by schemes offering assistive devices or disability support.",
    currencySymbol: "₹",
    supportNeedPlaceholder: "Select or enter support type",
  },
  profilePage: {
    eyebrow: "Anonymous session",
    title: "Your profile & preferences",
    lead: "Your details are stored in this browser tab only. Review and adjust extracted facts to ensure accurate scheme eligibility matching.",
  },
  profileSummary: {
    eyebrow: "Active session",
    title: "Your profile",
    draft: "Draft",
    edit: "Edit details",
    note: "Stored in tab memory only · Cleared on close",
  },
  recommendations: {
    eyebrow: "Your story. Your possibilities.",
    title: "Let’s make your options clearer",
    lead: "A shortlist with the reasons, the unknowns, and your next steps.",
    startTitle: "Start with your details",
    startText:
      "Review and confirm a profile before checking scheme conditions. Profile data stays in this tab’s memory.",
    createProfile: "Create my profile",
    retry: "Retry matching",
    shortlist: "Your shortlist",
    countOne: "{count} scheme",
    countOther: "{count} schemes",
    evaluatedOne: "{count} scheme evaluated",
    evaluatedOther: "{count} schemes evaluated",
    showConditions: "Show conditions",
    allStatuses: "All statuses",
    shown: "{count} shown",
    noStatusTitle: "No schemes with this status",
    showAll: "Show all statuses",
    noMatchesTitle: "No matches found yet",
    noMatchesText:
      "Try correcting your details or explore the scheme catalogue.",
    editOrBrowse: "Edit profile or browse",
    yourProfile: "Your profile",
    editProfile: "Edit profile",
    correctionsNote: "Your corrections take priority over extracted details.",
    nextEyebrow: "A match is a starting point",
    nextTitleLine1: "Read the conditions.",
    nextTitleLine2: "Check the source.",
    nextText:
      "Only the relevant government authority can determine eligibility and approve an application.",
    guidanceNote: "Guidance note",
    guidanceTitle: "Read the conditions · Check the source",
    guidanceText:
      "Only the relevant government authority can determine official eligibility and approve an application. A match is your starting point.",
  },
  eligibilityPage: {
    eyebrow: "Rule-based analysis",
    title: "Eligibility & rule explanations",
    lead: "See which criteria pass, which fail, and which need manual verification based on your confirmed profile details.",
  },
  match: {
    supportAtAGlance: "Support at a glance",
    preliminaryLabel: "Preliminary · unverified",
    preliminaryText:
      "This record matched your profile metadata, but its eligibility conditions and source have not been independently verified. Treat it as a lead for manual checking, not government guidance.",
    matchingReasons: "Matching reasons",
    missingInformation: "Still needed or must be verified",
    noOfficialSource:
      "No verified official source is attached to this preliminary record.",
    documents: "Possible documents",
    howToApply: "Draft application information",
    why: "Why this match?",
    whyText:
      "These are the service’s checks for the reviewed scheme version. An unknown condition still needs information. Passing these checks does not mean official approval.",
    verifiedVersion: "Last verified on {date} · Version {version}",
    unknownOne: "{count} condition still unknown",
    unknownOther: "{count} conditions still unknown",
    readEvery: "Read every condition before applying",
    explore: "Explore this scheme",
    sourceCitation: "Source citation · {id}",
    sourceUnavailable: "Source reference unavailable · {id}",
    unknownStatus: "Unknown status",
  },
  followUp: {
    eyebrow: "One helpful question",
    title: "Check a missing detail",
    retry: "Retry question",
    why: "Why we ask this",
    answerPlaceholder: "Enter your answer…",
    update: "Update my matches",
    skip: "Skip for now",
    cancel: "Cancel edit",
    manual:
      "This question needs manual review. No sensitive information is collected.",
    none: "There are no further questions right now. Check any remaining unknown conditions on the official source.",
    editPrevious: "Edit my previous answer",
    unsupported:
      "This question is not a supported profile field. Please use manual verification.",
  },
  changes: {
    added: "{scheme}: added to your shortlist.",
    status: "{scheme}: {from} → {to}.",
    unresolved: "{scheme}: its unresolved conditions changed.",
    none: "Your answer was saved. No scheme status changed; unresolved conditions still need verification.",
  },
  scheme: {
    unavailable: "Scheme details are unavailable.",
    backToDiscovery: "Back to discovery",
    backToRecommendations: "Back to my recommendations",
    manualVerification:
      "Manual verification required. This source is marked “{status}”; check the current requirements with the official authority.",
    supportEyebrow: "The support",
    benefits: "Benefits at a glance",
    eligibility: "Eligibility & exclusions",
    eligibilityNote:
      "Conditions come from the reviewed source. Your checked outcomes appear only when available for this exact version.",
    requiredCondition: "Required condition",
    exclusions: "Exclusions",
    noExclusions:
      "No separate exclusion entries were supplied. This is not a guarantee that no exclusions apply.",
    notCheckedBefore:
      "Your profile has not been checked against this scheme version.",
    notCheckedLink: "Review your profile",
    notCheckedAfter: "to get matching results.",
    documents: "Documents",
    conditional:
      "Conditional requirement. Confirm whether it applies to your situation.",
    noDocuments:
      "Document requirements have not been supplied. Confirm them with the official authority.",
    howToApply: "How to apply",
    noSteps:
      "Verified application steps are unavailable. Please confirm the process with the official authority.",
    portalNote:
      "Applications take place on the official portal. Yojana Saathi does not submit applications.",
    sourcesEyebrow: "Trace it to the source",
    sources: "Official sources",
    sourcesNote: "Check the original policy and its latest updates.",
    readOriginal: "Read original source",
    version: "Scheme version: {version}",
    prepareTitle: "Prepare with clarity",
    prepareText:
      "Keep track of requirements before you visit the official portal. Never upload identity documents here.",
    prepareLink: "Prepare my checklist",
  },
  guidance: {
    back: "Back to scheme",
    eyebrow: "A prepared next step",
    title: "Know what to take. Know where to go",
    lead: "Application guidance, with a checklist you can work through at your pace.",
    unavailable: "Guidance is unavailable.",
    retry: "Retry guidance",
    print: "Print checklist",
    versionChanged:
      "Scheme information changed between requests. Refresh this page before relying on these steps.",
    preconditions: "Before you apply, check these details",
    pathwayEyebrow: "The official pathway",
    steps: "Application steps",
    sourceUnavailable: "Source reference unavailable.",
    noSteps:
      "Verified steps are unavailable. Confirm the process with the government authority.",
    readyEyebrow: "When you’re ready",
    readyTitle: "The next step is yours",
    readyText:
      "Applications are handled by the government’s official portal. We help you prepare; we do not submit or approve applications.",
    apply: "Apply on official portal",
    closed: "Applications are closed.",
    windowUnknown: "The application window is unknown.",
    linkUnverified: "An application link could not be verified.",
    confirmProcess: "Confirm the current process with the official authority.",
    sourcesTitle: "Sources behind these steps",
  },
  checklist: {
    eyebrow: "Get your documents together",
    title: "Your personal checklist",
    ready: "{checked} / {total} marked ready",
    note: "“I have it” is your own note. It does not verify a document or indicate government approval. These notes stay in this page only.",
    progressLabel: "Documents marked ready by you",
    haveIt: "I have it",
    sourceUnavailable:
      "Source reference unavailable. Confirm the requirement with the authority.",
    empty:
      "Document requirements are unavailable. Check the current official requirements.",
  },
  saved: {
    eyebrow: "Bookmarked items",
    title: "Saved schemes",
    lead: "Access your saved schemes anytime. Remember to verify deadlines and requirements on each official portal before applying.",
    emptyTitle: "No saved schemes yet",
    emptyText:
      "As you explore schemes in discovery or recommendations, you can save them here to revisit anytime during your session.",
    countOne: "{count} scheme bookmarked",
    countOther: "{count} schemes bookmarked",
    bookmarkedOn: "Bookmarked on {date}",
    remove: "Remove",
  },
  about: {
    title: "Support starts with understanding.",
    intro:
      "yojana saathi is an independent project that helps citizens discover government schemes, understand checked conditions and prepare application documents.",
    aiTitle: "AI assists. Rules explain.",
    aiText:
      "AI can extract details from your description. You review and correct them before rule-based matching. Missing details stay unknown, and ambiguous conditions need manual verification.",
    authorityTitle: "The authority remains with government.",
    authorityText:
      "A match is preliminary guidance. The responsible department determines eligibility and makes the final decision. Mock mode uses clearly labelled synthetic examples.",
  },
  disclaimerPage: {
    title: "Preliminary guidance, clear limits.",
    intro:
      "yojana saathi is independent and is not an official government service. Government portals and authorities make final eligibility and approval decisions.",
    matchTitle: "What a match means",
    matchText:
      "“All checked conditions met” means that the available verified rules passed for your confirmed profile. It is not a guarantee of eligibility or approval. Unknown and manually reviewed conditions require further verification.",
    currentTitle: "Check current information",
    currentText:
      "Criteria, benefits and application processes may change. Read the scheme’s source references and verification date, and confirm current requirements with the responsible authority.",
    examplesTitle: "Examples and application actions",
    examplesText:
      "Mock results are synthetic contract demonstrations. Showcase schemes are examples and are not personalized matches. We do not submit forms, verify identity documents or track applications on your behalf.",
    cta: "Understand the process",
  },
  help: {
    eyebrow: "Made to make things clearer",
    titleLine1: "A few details.",
    titleLine2: "A better starting point.",
    steps: [
      {
        title: "Tell us about yourself",
        text: "Share only what is needed. Never enter Aadhaar numbers, bank details or identity documents.",
      },
      {
        title: "Check your details",
        text: "Review every extracted fact. Correct mistakes or leave anything you don’t know blank.",
      },
      {
        title: "Understand your options",
        text: "Read which conditions pass, fail or need more information. Follow the source links and prepare your documents.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Does a match mean I am officially eligible?",
        a: "No. Results explain checked conditions. The responsible government authority makes the final decision.",
      },
      {
        q: "What if I do not know an answer?",
        a: "Leave a field blank or choose “Not sure.” It remains unknown. You can correct it later.",
      },
      {
        q: "Can I use the service without AI extraction?",
        a: "Yes. Choose “Enter details manually,” review your profile and confirm it before matching.",
      },
      {
        q: "Does this platform submit or track my application?",
        a: "No. Follow the scheme’s verified official application route. Tracking, where offered, is handled by the responsible portal or authority.",
      },
      {
        q: "Why do I see mock mode?",
        a: "Mock mode demonstrates the workflow with synthetic fixtures. Those results are not real scheme recommendations.",
      },
      {
        q: "Which languages can I use?",
        a: "The interface is available in English, Hindi and Kannada. Scheme names, rules and official documents are shown as published by the source, usually in English.",
      },
    ],
    cta: "Start discovering",
  },
  privacy: {
    title: "Privacy and your profile",
    intro:
      "Share only the details needed to understand scheme requirements. Do not enter Aadhaar numbers, bank account numbers or identity-document images.",
    keepsTitle: "What this interface keeps",
    keepsText:
      "Your description stays in this tab’s memory. When you are signed in, only profile facts you confirm are saved with your Supabase account so they can be restored for matching and application guidance. In live mode, confirmed facts are also sent to a temporary backend session. Your language choice is saved in a cookie.",
    aiTitle: "When you use AI extraction",
    aiText:
      "In live mode, your description is sent to the configured backend, which can use Gemini to extract profile details. You can use manual entry instead. Provider handling and retention depend on that service’s configuration and policies.",
    clearTitle: "Clearing your details",
    clearText:
      "“Clear my details” removes the confirmed profile from your signed-in account, requests deletion of the backend session and clears this interface’s profile and matching state. Backend sessions also expire. This action does not promise deletion of records held by external providers.",
    mockText:
      "Mock mode runs synthetic examples in the frontend instead of making those live API requests.",
    cta: "Review or clear my profile",
  },
  speech: {
    voiceLanguage: "Voice language",
    audioLanguage: "Audio language",
    speak: "Speak instead",
    listening: "Listening…",
    transcribing: "Transcribing…",
    listeningHint:
      "Listening… recording stops automatically when you finish speaking.",
    privacyNote:
      "Your recording is sent to Sarvam AI and is not saved by Yojana Saathi.",
    readAloud: "Read aloud",
    stopAudio: "Stop audio",
    translatedAudio: "AI-translated audio; check the original text.",
    errors: {
      unsupported: "Voice recording is not supported in this browser.",
      recordingFailed:
        "The recording could not be completed. Please try again.",
      noSpeech: "No speech was detected. Please try again and speak clearly.",
      microphone: "Microphone permission is needed for voice input.",
      playback: "The generated audio could not be played.",
    },
  },
  guidePage: {
    meta: "Application guide — yojana saathi",
    metaDescription:
      "How to prepare a government scheme application: documents, steps and official portals.",
    eyebrow: "Application guide",
    title: "Prepare your application with confidence",
    lead: "Each scheme has its own documents and steps, taken from its official source. Choose a scheme to open its personal checklist and official application route.",
    stagesTitle: "Four stages, every scheme",
    schemesTitle: "Choose a scheme",
    schemesLead:
      "Documents and steps appear only where a reviewed official source lists them. We never fill gaps with guesses.",
    prepare: "Prepare checklist",
    empty: "No schemes are available right now.",
    browseAll: "Browse all schemes",
  },
  notFound: {
    title: "Page not found",
    text: "The page or scheme you were looking for doesn’t exist or may have been moved.",
    home: "Return to home",
  },
};

export type Messages = typeof en;
