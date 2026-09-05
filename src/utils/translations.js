// =============================================================================
// src/utils/translations.js
// All UI strings in English, Hindi, Marathi, Telugu
// Usage: import { tx } from '../utils/translations';
//        tx('book_slot', language)
// =============================================================================

export const TRANSLATIONS = {
  // ── Navigation ─────────────────────────────────────────────────────────────
  nav_home:         { en: 'Home',    hi: 'होम',     mr: 'मुख्यपृष्ठ', te: 'హోమ్' },
  nav_farmer:       { en: 'Farmer',  hi: 'किसान',   mr: 'शेतकरी',     te: 'రైతు' },
  nav_admin:        { en: 'Admin',   hi: 'एडमिन',   mr: 'प्रशासक',    te: 'అడ్మిన్' },

  // ── Portal Title ───────────────────────────────────────────────────────────
  portal_title:     { en: 'DoCA Kisan Portal',                  hi: 'DoCA किसान पोर्टल',                 mr: 'DoCA शेतकरी पोर्टल',                te: 'DoCA కిసాన్ పోర్టల్' },
  portal_subtitle:  { en: 'Smart Agricultural Procurement',      hi: 'स्मार्ट कृषि खरीद प्रणाली',         mr: 'स्मार्ट कृषी खरेदी प्रणाली',          te: 'స్మార్ట్ వ్యవసాయ సేకరణ' },
  toll_free_label:  { en: 'Toll-Free',                          hi: 'टोल-फ्री',                           mr: 'टोल-फ्री',                            te: 'టోల్-ఫ్రీ' },
  toll_free_desc:   { en: '24/7 Farmer Helpline — Free from any phone', hi: '24/7 किसान हेल्पलाइन — किसी भी फोन से नि:शुल्क', mr: '24/7 शेतकरी हेल्पलाइन — कोणत्याही फोनवरून मोफत', te: '24/7 రైతు హెల్ప్‌లైన్ — ఏ ఫోన్ నుండైనా ఉచితం' },

  // ── Auth ───────────────────────────────────────────────────────────────────
  login_title:      { en: 'Welcome Back',                       hi: 'स्वागत है',                          mr: 'स्वागत आहे',                          te: 'స్వాగతం' },
  login_subtitle:   { en: 'Select your role to continue',       hi: 'जारी रखने के लिए भूमिका चुनें',      mr: 'सुरू ठेवण्यासाठी भूमिका निवडा',        te: 'కొనసాగించడానికి మీ పాత్రను ఎంచుకోండి' },
  farmer_login:     { en: 'Farmer Login',                       hi: 'किसान लॉगिन',                        mr: 'शेतकरी लॉगिन',                        te: 'రైతు లాగిన్' },
  admin_login:      { en: 'Admin Login',                        hi: 'एडमिन लॉगिन',                        mr: 'प्रशासक लॉगिन',                       te: 'అడ్మిన్ లాగిన్' },
  farmer_login_desc:{ en: 'Access your slots, queue & payments',hi: 'स्लॉट, कतार और भुगतान देखें',       mr: 'स्लॉट, रांग आणि देयके पहा',            te: 'మీ స్లాట్లు, క్యూ & చెల్లింపులు యాక్సెస్ చేయండి' },
  admin_login_desc: { en: 'Manage queue, verify & inspect DB',  hi: 'कतार, भुगतान और रिकॉर्ड प्रबंधन',   mr: 'रांग, देयके आणि रेकॉर्ड व्यवस्थापन',    te: 'క్యూ, పేమెంట్ & రికార్డులు నిర్వహించండి' },
  username_label:   { en: 'Username',                           hi: 'यूज़रनेम',                            mr: 'वापरकर्तानाव',                         te: 'యూజర్‌నేమ్' },
  password_label:   { en: 'Password',                           hi: 'पासवर्ड',                             mr: 'पासवर्ड',                              te: 'పాస్‌వర్డ్' },
  login_btn:        { en: 'Login',                              hi: 'लॉगिन करें',                          mr: 'लॉगिन करा',                            te: 'లాగిన్ చేయండి' },
  logging_in:       { en: 'Verifying…',                        hi: 'जाँच हो रही है…',                     mr: 'तपासत आहे…',                          te: 'ధృవీకరిస్తోంది…' },
  demo_creds:       { en: 'Demo Credentials',                   hi: 'डेमो क्रेडेंशियल',                    mr: 'डेमो क्रेडेन्शियल्स',                   te: 'డెమో ఆధారాలు' },
  select_role:      { en: 'Select your role',                   hi: 'अपनी भूमिका चुनें',                   mr: 'तुमची भूमिका निवडा',                   te: 'మీ పాత్రను ఎంచుకోండి' },
  enter_creds:      { en: 'Enter your credentials to continue', hi: 'लॉगिन के लिए अपनी जानकारी दर्ज करें', mr: 'लॉगिन करण्यासाठी माहिती प्रविष्ट करा', te: 'కొనసాగించడానికి మీ ఆధారాలు నమోదు చేయండి' },
  select_role_hint: { en: 'Select a role on the left to begin', hi: 'शुरू करने के लिए बाईं ओर भूमिका चुनें', mr: 'सुरू करण्यासाठी डावीकडील भूमिका निवडा', te: 'ప్రారంభించడానికి ఎడమవైపు పాత్రను ఎంచుకోండి' },

  // ── Farmer Dashboard ───────────────────────────────────────────────────────
  farmer_dashboard: { en: 'Farmer Dashboard',        hi: 'किसान डैशबोर्ड',       mr: 'शेतकरी डॅशबोर्ड',     te: 'రైతు డాష్‌బోర్డ్' },
  book_slot:        { en: 'Book New Slot',            hi: 'नया स्लॉट बुक करें',    mr: 'नवीन स्लॉट बुक करा',  te: 'కొత్త స్లాట్ బుక్ చేయండి' },
  book_slot_now:    { en: 'Book a Slot Now',          hi: 'अभी स्लॉट बुक करें',    mr: 'आत्ता स्लॉट बुक करा', te: 'ఇప్పుడే స్లాట్ బుక్ చేయండి' },
  active_booking:   { en: 'Your Active Booking',     hi: 'आपकी सक्रिय बुकिंग',    mr: 'तुमचे सक्रिय बुकिंग', te: 'మీ యాక్టివ్ బుకింగ్' },
  no_active_slot:   { en: 'No active slot — Book one now!', hi: 'कोई सक्रिय स्लॉट नहीं — अभी बुक करें!', mr: 'सक्रिय स्लॉट नाही — आत्ता बुक करा!', te: 'క్రియాశీల స్లాట్ లేదు — ఇప్పుడే బుక్ చేయండి!' },
  ivr_simulator:    { en: 'IVR Simulator',           hi: 'IVR सिमुलेटर',          mr: 'IVR सिम्युलेटर',      te: 'IVR సిమ్యులేటర్' },

  // ── Queue Tracker ──────────────────────────────────────────────────────────
  queue_tracker:    { en: 'Live Queue Tracker',       hi: 'लाइव कतार ट्रैकर',     mr: 'थेट रांग ट्रॅकर',     te: 'లైవ్ క్యూ ట్రాకర్' },
  your_token:       { en: 'YOUR TOKEN',               hi: 'आपका टोकन',             mr: 'तुमचा टोकन',           te: 'మీ టోకెన్' },
  now_serving:      { en: 'NOW SERVING',              hi: 'अभी सेवा',              mr: 'आत्ता सेवा',           te: 'ఇప్పుడు సేవలో' },
  ahead_of_you:     { en: 'AHEAD OF YOU',             hi: 'आपसे आगे',              mr: 'तुमच्यापुढे',          te: 'మీకు ముందు' },
  est_wait:         { en: 'EST. WAIT',                hi: 'अनुमानित प्रतीक्षा',    mr: 'अंदाजे प्रतीक्षा',    te: 'అంచనా వేచి ఉండే సమయం' },
  minutes:          { en: 'minutes',                  hi: 'मिनट',                  mr: 'मिनिटे',               te: 'నిమిషాలు' },
  farmers:          { en: 'farmers',                  hi: 'किसान',                 mr: 'शेतकरी',               te: 'రైతులు' },
  refresh:          { en: 'Refresh',                  hi: 'ताज़ा करें',             mr: 'रिफ्रेश करा',          te: 'రిఫ్రెష్ చేయండి' },

  // ── DBT Ledger ─────────────────────────────────────────────────────────────
  dbt_ledger:       { en: 'DBT Payment Ledger',       hi: 'DBT भुगतान लेखाबही',   mr: 'DBT देयक खतावणी',      te: 'DBT చెల్లింపు లెడ్జర్' },
  dbt_subtitle:     { en: 'Direct Benefit Transfer — 4-stage pipeline', hi: 'प्रत्यक्ष लाभ हस्तांतरण — 4 चरण', mr: 'थेट लाभ हस्तांतरण — 4 टप्पे', te: 'డైరెక్ట్ బెనిఫిట్ ట్రాన్స్ఫర్ — 4 దశలు' },
  payment_progress: { en: 'Payment Progress',         hi: 'भुगतान प्रगति',         mr: 'देयक प्रगती',          te: 'చెల్లింపు పురోగతి' },
  stage_crop:       { en: 'Crop Handed Over',         hi: 'फसल सौंपी गई',          mr: 'पीक सुपूर्त केले',      te: 'పంట అప్పగించబడింది' },
  stage_verified:   { en: 'Quality Verified',         hi: 'गुणवत्ता जाँची गई',     mr: 'गुणवत्ता तपासली',      te: 'నాణ్యత ధృవీకరించబడింది' },
  stage_invoice:    { en: 'Invoice Generated',        hi: 'Invoice बनाई गई',       mr: 'Invoice तयार झाली',    te: 'ఇన్‌వాయిస్ రూపొందించబడింది' },
  stage_dbt:        { en: 'DBT Funds Disbursed',      hi: 'DBT राशि जारी हुई',     mr: 'DBT निधी वितरित',      te: 'DBT నిధులు విడుదలయ్యాయి' },
  payment_success:  { en: 'Payment Successful!',      hi: 'भुगतान सफल!',           mr: 'देयक यशस्वी!',         te: 'చెల్లింపు విజయవంతమైంది!' },
  current_stage:    { en: 'CURRENT',                  hi: 'वर्तमान',               mr: 'सध्याचे',              te: 'ప్రస్తుత' },
  done_stage:       { en: 'DONE',                     hi: 'पूर्ण',                  mr: 'पूर्ण',                te: 'పూర్తయింది' },

  // ── Slot Booking Form ──────────────────────────────────────────────────────
  book_slot_title:  { en: 'Book Procurement Slot',    hi: 'खरीद स्लॉट बुक करें',   mr: 'खरेदी स्लॉट बुक करा', te: 'సేకరణ స్లాట్ బుక్ చేయండి' },
  step_centre:      { en: 'Select Centre',            hi: 'केंद्र चुनें',           mr: 'केंद्र निवडा',         te: 'కేంద్రం ఎంచుకోండి' },
  step_crop:        { en: 'Choose Crop',              hi: 'फसल चुनें',              mr: 'पीक निवडा',            te: 'పంట ఎంచుకోండి' },
  step_qty:         { en: 'Quantity & Date',          hi: 'मात्रा व तारीख',         mr: 'प्रमाण आणि तारीख',    te: 'పరిమాణం & తేదీ' },
  step_confirm:     { en: 'Confirm',                  hi: 'पुष्टि करें',            mr: 'पुष्टी करा',           te: 'నిర్ధారించండి' },
  full_name:        { en: 'Full Name',                hi: 'पूरा नाम',               mr: 'पूर्ण नाव',            te: 'పూర్తి పేరు' },
  mobile_number:    { en: 'Mobile Number',            hi: 'मोबाइल नंबर',            mr: 'मोबाइल नंबर',          te: 'మొబైల్ నంబర్' },
  proc_centre:      { en: 'Procurement Centre',       hi: 'खरीद केंद्र',            mr: 'खरेदी केंद्र',         te: 'సేకరణ కేంద్రం' },
  quantity_qtl:     { en: 'Quantity (Quintals)',       hi: 'मात्रा (क्विंटल)',       mr: 'प्रमाण (क्विंटल)',    te: 'పరిమాణం (క్వింటాల్)' },
  target_date:      { en: 'Target Date',              hi: 'लक्षित तारीख',           mr: 'लक्ष्य तारीख',         te: 'లక్ష్య తేదీ' },
  confirm_booking:  { en: 'Confirm Booking',          hi: 'बुकिंग कन्फर्म करें',    mr: 'बुकिंग पुष्टी करा',   te: 'బుకింగ్ నిర్ధారించండి' },
  booking_success:  { en: 'Slot Booked Successfully!',hi: 'स्लॉट सफलतापूर्वक बुक हुआ!', mr: 'स्लॉट यशस्वीरित्या बुक झाला!', te: 'స్లాట్ విజయవంతంగా బుక్ అయింది!' },
  your_token_num:   { en: 'YOUR TOKEN NUMBER',        hi: 'आपका टोकन नंबर',         mr: 'तुमचा टोकन नंबर',     te: 'మీ టోకెన్ నంబర్' },
  download_receipt: { en: 'Download Receipt',         hi: 'रसीद डाउनलोड करें',     mr: 'पावती डाउनलोड करा',   te: 'రసీదు డౌన్‌లోడ్ చేయండి' },
  next_btn:         { en: 'Next',                     hi: 'आगे',                    mr: 'पुढे',                 te: 'తదుపరి' },
  back_btn:         { en: 'Back',                     hi: 'वापस',                   mr: 'मागे',                 te: 'వెనక్కి' },
  cancel_btn:       { en: 'Cancel',                   hi: 'रद्द करें',              mr: 'रद्द करा',             te: 'రద్దు చేయండి' },
  done_btn:         { en: 'Done',                     hi: 'हो गया',                 mr: 'झाले',                 te: 'పూర్తయింది' },

  // ── Admin ──────────────────────────────────────────────────────────────────
  admin_portal:     { en: 'Admin Portal',             hi: 'एडमिन पोर्टल',          mr: 'प्रशासक पोर्टल',      te: 'అడ్మిన్ పోర్టల్' },
  queue_monitor:    { en: 'Omni-Channel Queue Monitor', hi: 'ऑम्नी-चैनल कतार मॉनिटर', mr: 'ऑम्नी-चॅनेल रांग मॉनिटर', te: 'ఆమ్నీ-ఛానెల్ క్యూ మానిటర్' },
  db_inspector:     { en: 'Visual Database Inspector', hi: 'विज़ुअल डेटाबेस निरीक्षक', mr: 'व्हिज्युअल डेटाबेस इन्स्पेक्टर', te: 'విజువల్ డేటాబేస్ ఇన్స్పెక్టర్' },
  serve_btn:        { en: 'Serve',                    hi: 'सेवा',                   mr: 'सेवा',                 te: 'సేవ' },
  filter_source:    { en: 'Filter by source:',        hi: 'स्रोत के अनुसार:',       mr: 'स्रोतानुसार फिल्टर:',  te: 'మూలం ద్వారా ఫిల్టర్:' },

  // ── Landing Page ───────────────────────────────────────────────────────────
  hero_heading_1:   { en: 'Smart Procurement',        hi: 'स्मार्ट खरीद',           mr: 'स्मार्ट खरेदी',        te: 'స్మార్ట్ సేకరణ' },
  hero_heading_2:   { en: 'for Every Kisan',          hi: 'हर किसान के लिए',        mr: 'प्रत्येक शेतकऱ्यासाठी', te: 'ప్రతి కిసాన్ కోసం' },
  open_kisan_mitra: { en: 'Open Kisan Mitra',         hi: 'किसान मित्र खोलें',      mr: 'किसान मित्र उघडा',     te: 'కిసాన్ మిత్ర తెరవండి' },
  try_ivr:          { en: 'Try IVR Simulator',        hi: 'IVR आज़माएं',             mr: 'IVR वापरून पहा',       te: 'IVR సిమ్యులేటర్ ట్రై చేయండి' },

  // ── Common ─────────────────────────────────────────────────────────────────
  farmer_label:     { en: 'Farmer',                   hi: 'किसान',                  mr: 'शेतकरी',               te: 'రైతు' },
  crop_label:       { en: 'Crop',                     hi: 'फसल',                    mr: 'पीक',                  te: 'పంట' },
  quantity_label:   { en: 'Quantity',                 hi: 'मात्रा',                  mr: 'प्रमाण',               te: 'పరిమాణం' },
  centre_label:     { en: 'Centre',                   hi: 'केंद्र',                  mr: 'केंद्र',               te: 'కేంద్రం' },
  date_label:       { en: 'Date',                     hi: 'तारीख',                   mr: 'तारीख',                te: 'తేదీ' },
  source_label:     { en: 'Source',                   hi: 'स्रोत',                   mr: 'स्रोत',                te: 'మూలం' },
  phone_label:      { en: 'Phone',                    hi: 'फोन',                     mr: 'फोन',                  te: 'ఫోన్' },
  status_pending:   { en: 'Pending',                  hi: 'प्रतीक्षित',              mr: 'प्रतीक्षित',           te: 'పెండింగ్' },
  status_serving:   { en: 'Serving',                  hi: 'सेवा में',                mr: 'सेवेत',                te: 'సేవలో' },
  status_completed: { en: 'Completed',                hi: 'पूर्ण',                   mr: 'पूर्ण झाले',           te: 'పూర్తయింది' },
  logout_label:     { en: 'Logout',                   hi: 'लॉग आउट',                mr: 'लॉग आउट',              te: 'లాగ్‌అవుట్' },
  you_label:        { en: 'You',                      hi: 'आप',                      mr: 'तुम्ही',               te: 'మీరు' },
  access_denied:    { en: 'Access Denied',            hi: 'पहुंच अस्वीकृत',          mr: 'प्रवेश नाकारला',       te: 'యాక్సెస్ నిరాకరించబడింది' },
  booking_summary:  { en: 'BOOKING SUMMARY',          hi: 'बुकिंग सारांश',           mr: 'बुकिंग सारांश',        te: 'బుకింగ్ సారాంశం' },
  selected_label:   { en: 'Selected',                 hi: 'चुना',                    mr: 'निवडले',               te: 'ఎంచుకున్నారు' },
  booking_loading:  { en: 'Booking…',                 hi: 'बुक हो रहा है…',          mr: 'बुकिंग होत आहे…',      te: 'బుక్ అవుతోంది…' },
};

// Lookup helper
export function tx(key, lang = 'en') {
  const entry = TRANSLATIONS[key];
  if (!entry) return key; // fallback to key if missing
  return entry[lang] || entry['hi'] || entry['en'] || key;
}
