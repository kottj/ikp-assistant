import type { Question } from '@/types';

/**
 * Predefined cardiology triage questions
 * Based on:
 * - ESC Guidelines (European Society of Cardiology)
 * - NCBI Cardiovascular Interview Questions
 * - Polish medical interview standards (wywiad lekarski)
 * - ASCVD/EZ-CVD risk assessment tools
 */

export const cardiologyQuestions: Question[] = [
  // ===== CHIEF COMPLAINT / GŁÓWNA DOLEGLIWOŚĆ =====
  {
    id: 'chief_complaint_main',
    category: 'chief_complaint',
    text: 'Jaki jest główny powód Pana/Pani wizyty u kardiologa?',
    type: 'select',
    options: [
      { value: 'chest_pain', label: 'Ból w klatce piersiowej' },
      { value: 'shortness_of_breath', label: 'Duszność' },
      { value: 'palpitations', label: 'Kołatanie serca / Uczucie nierównego bicia serca' },
      { value: 'syncope', label: 'Omdlenia lub zasłabnięcia' },
      { value: 'fatigue', label: 'Zmęczenie i osłabienie' },
      { value: 'edema', label: 'Obrzęki (nogi, kostki)' },
      { value: 'hypertension', label: 'Nadciśnienie tętnicze' },
      { value: 'routine_checkup', label: 'Badanie kontrolne' },
      { value: 'other', label: 'Inne dolegliwości' },
    ],
    required: true,
    helpText: 'Proszę wybrać główny objaw lub powód wizyty',
  },
  {
    id: 'chief_complaint_description',
    category: 'chief_complaint',
    text: 'Proszę opisać szczegółowo swoje dolegliwości własnymi słowami.',
    type: 'textarea',
    required: true,
    placeholder: 'Opisz swoje objawy, jak się manifestują, co Cię niepokoi...',
    helpText: 'Im więcej szczegółów Pan/Pani poda, tym lepiej lekarz będzie mógł przygotować się do wizyty',
  },
  {
    id: 'symptom_duration',
    category: 'chief_complaint',
    text: 'Od jak dawna występują te objawy?',
    type: 'select',
    options: [
      { value: 'hours', label: 'Od kilku godzin' },
      { value: 'days', label: 'Od kilku dni' },
      { value: 'weeks', label: 'Od kilku tygodni' },
      { value: 'months', label: 'Od kilku miesięcy' },
      { value: 'years', label: 'Od roku lub dłużej' },
      { value: 'intermittent', label: 'Objawy pojawiają się i ustępują' },
    ],
    required: true,
  },
  {
    id: 'symptom_character',
    category: 'chief_complaint',
    text: 'Jeśli odczuwa Pan/Pani ból w klatce piersiowej, jaki jest jego charakter?',
    type: 'multiselect',
    options: [
      { value: 'pressing', label: 'Uciskowy (jakby coś naciskało na klatkę)' },
      { value: 'burning', label: 'Piekący' },
      { value: 'stabbing', label: 'Kłujący' },
      { value: 'dull', label: 'Tępy' },
      { value: 'radiating', label: 'Promieniujący do ramienia/szyi/szczęki' },
      { value: 'none', label: 'Nie odczuwam bólu w klatce piersiowej' },
    ],
    required: false,
    helpText: 'Można wybrać kilka opcji',
  },
  {
    id: 'symptom_triggers',
    category: 'chief_complaint',
    text: 'Co nasila Pana/Pani dolegliwości?',
    type: 'multiselect',
    options: [
      { value: 'physical_exertion', label: 'Wysiłek fizyczny' },
      { value: 'emotional_stress', label: 'Stres emocjonalny' },
      { value: 'cold', label: 'Zimno' },
      { value: 'meals', label: 'Posiłki' },
      { value: 'lying_down', label: 'Pozycja leżąca' },
      { value: 'nothing_specific', label: 'Brak konkretnych czynników' },
      { value: 'spontaneous', label: 'Objawy pojawiają się spontanicznie' },
    ],
    required: true,
  },
  {
    id: 'symptom_relief',
    category: 'chief_complaint',
    text: 'Co łagodzi Pana/Pani dolegliwości?',
    type: 'multiselect',
    options: [
      { value: 'rest', label: 'Odpoczynek' },
      { value: 'nitroglycerin', label: 'Nitrogliceryna (jeśli przepisana)' },
      { value: 'position_change', label: 'Zmiana pozycji ciała' },
      { value: 'medications', label: 'Leki przeciwbólowe' },
      { value: 'nothing', label: 'Nic nie pomaga' },
      { value: 'unknown', label: 'Nie wiem' },
    ],
    required: true,
  },

  // ===== CARDIOVASCULAR RISK FACTORS / CZYNNIKI RYZYKA =====
  {
    id: 'hypertension',
    category: 'risk_factors',
    text: 'Czy rozpoznano u Pana/Pani nadciśnienie tętnicze?',
    type: 'radio',
    options: [
      { value: 'yes_treated', label: 'Tak, przyjmuję leki' },
      { value: 'yes_untreated', label: 'Tak, ale nie leczę się' },
      { value: 'no', label: 'Nie' },
      { value: 'unknown', label: 'Nie wiem' },
    ],
    required: true,
    helpText: 'Nadciśnienie tętnicze to ciśnienie powyżej 140/90 mmHg',
  },
  {
    id: 'diabetes',
    category: 'risk_factors',
    text: 'Czy choruje Pan/Pani na cukrzycę?',
    type: 'radio',
    options: [
      { value: 'type1', label: 'Tak, cukrzyca typu 1' },
      { value: 'type2', label: 'Tak, cukrzyca typu 2' },
      { value: 'prediabetes', label: 'Stan przedcukrzycowy' },
      { value: 'no', label: 'Nie' },
      { value: 'unknown', label: 'Nie wiem' },
    ],
    required: true,
  },
  {
    id: 'hyperlipidemia',
    category: 'risk_factors',
    text: 'Czy ma Pan/Pani podwyższony poziom cholesterolu lub triglicerydów?',
    type: 'radio',
    options: [
      { value: 'yes_treated', label: 'Tak, przyjmuję leki (statyny lub inne)' },
      { value: 'yes_untreated', label: 'Tak, ale nie leczę się' },
      { value: 'no', label: 'Nie' },
      { value: 'unknown', label: 'Nie wiem / Dawno nie badałem' },
    ],
    required: true,
  },
  {
    id: 'smoking',
    category: 'risk_factors',
    text: 'Czy pali Pan/Pani papierosy lub inne wyroby tytoniowe?',
    type: 'radio',
    options: [
      { value: 'current_heavy', label: 'Tak, palę powyżej 10 papierosów dziennie' },
      { value: 'current_light', label: 'Tak, palę do 10 papierosów dziennie' },
      { value: 'former', label: 'Nie palę, ale paliłem w przeszłości' },
      { value: 'never', label: 'Nigdy nie paliłem' },
      { value: 'ecigarettes', label: 'Używam e-papierosów' },
    ],
    required: true,
  },
  {
    id: 'smoking_history',
    category: 'risk_factors',
    text: 'Jeśli pali Pan/Pani lub palił(a) w przeszłości - przez ile lat?',
    type: 'text',
    required: false,
    placeholder: 'np. 15 lat, rzuciłem 3 lata temu',
  },
  {
    id: 'family_history',
    category: 'risk_factors',
    text: 'Czy w Pana/Pani najbliższej rodzinie (rodzice, rodzeństwo) występowały choroby serca?',
    type: 'multiselect',
    options: [
      { value: 'mi_early_male', label: 'Zawał serca u mężczyzny przed 55 r.ż.' },
      { value: 'mi_early_female', label: 'Zawał serca u kobiety przed 65 r.ż.' },
      { value: 'mi_late', label: 'Zawał serca w późniejszym wieku' },
      { value: 'sudden_death', label: 'Nagły zgon sercowy' },
      { value: 'stroke', label: 'Udar mózgu' },
      { value: 'none', label: 'Nie występowały' },
      { value: 'unknown', label: 'Nie mam informacji' },
    ],
    required: true,
    helpText: 'Wczesny zawał w rodzinie zwiększa ryzyko chorób serca',
    allowOther: true,
    otherPlaceholder: 'Podaj inne choroby serca w rodzinie...',
  },
  {
    id: 'obesity',
    category: 'risk_factors',
    text: 'Jaki jest Pana/Pani przybliżony wzrost i waga?',
    type: 'text',
    required: true,
    placeholder: 'np. 175 cm, 85 kg',
    helpText: 'Te informacje pozwolą ocenić wskaźnik BMI',
  },

  // ===== MEDICAL HISTORY / PRZEBYTE CHOROBY =====
  {
    id: 'cardiac_history',
    category: 'medical_history',
    text: 'Czy był(a) Pan/Pani wcześniej leczony(a) z powodu chorób serca?',
    type: 'multiselect',
    options: [
      { value: 'mi', label: 'Zawał serca' },
      { value: 'angina', label: 'Choroba niedokrwienna serca / dławica piersiowa' },
      { value: 'heart_failure', label: 'Niewydolność serca' },
      { value: 'arrhythmia', label: 'Zaburzenia rytmu serca (arytmia)' },
      { value: 'afib', label: 'Migotanie przedsionków' },
      { value: 'valve_disease', label: 'Wada zastawkowa serca' },
      { value: 'cardiomyopathy', label: 'Kardiomiopatia' },
      { value: 'none', label: 'Nie byłem leczony kardiologicznie' },
    ],
    required: true,
    allowOther: true,
    otherPlaceholder: 'Podaj inną chorobę serca...',
  },
  {
    id: 'cardiac_procedures',
    category: 'medical_history',
    text: 'Czy przeszedł/przeszła Pan/Pani zabiegi kardiologiczne?',
    type: 'multiselect',
    options: [
      { value: 'angioplasty', label: 'Angioplastyka wieńcowa (PCI) / stent' },
      { value: 'cabg', label: 'Pomostowanie aortalno-wieńcowe (CABG)' },
      { value: 'ablation', label: 'Ablacja' },
      { value: 'pacemaker', label: 'Wszczepienie stymulatora serca' },
      { value: 'icd', label: 'Wszczepienie kardiowertera-defibrylatora (ICD)' },
      { value: 'valve_surgery', label: 'Operacja zastawki serca' },
      { value: 'angiography', label: 'Koronarografia (diagnostyczna)' },
      { value: 'none', label: 'Nie przechodziłem żadnych zabiegów' },
    ],
    required: true,
    allowOther: true,
    otherPlaceholder: 'Podaj inny zabieg kardiologiczny...',
  },
  {
    id: 'hospitalizations',
    category: 'medical_history',
    text: 'Czy był(a) Pan/Pani hospitalizowany(a) z przyczyn kardiologicznych w ciągu ostatnich 5 lat?',
    type: 'radio',
    options: [
      { value: 'yes_recent', label: 'Tak, w ciągu ostatniego roku' },
      { value: 'yes_past', label: 'Tak, ponad rok temu' },
      { value: 'no', label: 'Nie' },
    ],
    required: true,
  },
  {
    id: 'comorbidities',
    category: 'medical_history',
    text: 'Czy choruje Pan/Pani na inne choroby przewlekłe?',
    type: 'multiselect',
    options: [
      { value: 'kidney', label: 'Choroby nerek' },
      { value: 'thyroid', label: 'Choroby tarczycy' },
      { value: 'lung', label: 'Choroby płuc (POChP, astma)' },
      { value: 'liver', label: 'Choroby wątroby' },
      { value: 'autoimmune', label: 'Choroby autoimmunologiczne' },
      { value: 'cancer', label: 'Choroba nowotworowa' },
      { value: 'sleep_apnea', label: 'Bezdech senny' },
      { value: 'none', label: 'Brak innych chorób przewlekłych' },
    ],
    required: true,
    allowOther: true,
    otherPlaceholder: 'Podaj inne choroby przewlekłe...',
  },

  // ===== MEDICATIONS / LEKI =====
  {
    id: 'current_cardiac_meds',
    category: 'medications',
    text: 'Jakie leki kardiologiczne Pan/Pani przyjmuje?',
    type: 'multiselect',
    options: [
      { value: 'beta_blockers', label: 'Beta-blokery (np. bisoprolol, metoprolol)' },
      { value: 'ace_inhibitors', label: 'Inhibitory ACE (np. ramipril, perindopril)' },
      { value: 'arb', label: 'Sartany (np. losartan, valsartan)' },
      { value: 'calcium_blockers', label: 'Blokery kanału wapniowego (np. amlodypina)' },
      { value: 'diuretics', label: 'Leki moczopędne (np. furosemid, torasemid)' },
      { value: 'statins', label: 'Statyny (np. atorwastatyna, rosuwastatyna)' },
      { value: 'anticoagulants', label: 'Leki przeciwzakrzepowe (np. warfaryna, NOAC)' },
      { value: 'antiplatelet', label: 'Leki przeciwpłytkowe (np. aspiryna, klopidogrel)' },
      { value: 'nitrates', label: 'Azotany (np. nitrogliceryna)' },
      { value: 'antiarrhythmics', label: 'Leki antyarytmiczne (np. amiodaron)' },
      { value: 'none', label: 'Nie przyjmuję leków kardiologicznych' },
      { value: 'unknown', label: 'Nie pamiętam nazw leków' },
    ],
    required: true,
    helpText: 'Jeśli nie pamięta Pan/Pani nazw, proszę przynieść listę leków na wizytę',
    allowOther: true,
    otherPlaceholder: 'Podaj inne leki kardiologiczne...',
  },
  {
    id: 'other_medications',
    category: 'medications',
    text: 'Jakie inne leki Pan/Pani regularnie przyjmuje?',
    type: 'textarea',
    required: false,
    placeholder: 'Proszę wymienić inne leki, suplementy, witaminy...',
  },
  {
    id: 'allergies',
    category: 'medications',
    text: 'Czy ma Pan/Pani alergie na leki?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Tak' },
      { value: 'no', label: 'Nie' },
      { value: 'unknown', label: 'Nie wiem' },
    ],
    required: true,
  },
  {
    id: 'allergies_details',
    category: 'medications',
    text: 'Jeśli tak, proszę podać na jakie leki:',
    type: 'text',
    required: false,
    placeholder: 'np. penicylina, sulfonamidy, jod...',
  },

  // ===== LIFESTYLE / STYL ŻYCIA =====
  {
    id: 'physical_activity',
    category: 'lifestyle',
    text: 'Jak często wykonuje Pan/Pani aktywność fizyczną?',
    type: 'radio',
    options: [
      { value: 'daily', label: 'Codziennie lub prawie codziennie' },
      { value: 'regular', label: '3-4 razy w tygodniu' },
      { value: 'occasional', label: '1-2 razy w tygodniu' },
      { value: 'rare', label: 'Rzadko (kilka razy w miesiącu)' },
      { value: 'sedentary', label: 'Prowadzę siedzący tryb życia' },
    ],
    required: true,
  },
  {
    id: 'activity_type',
    category: 'lifestyle',
    text: 'Jaki rodzaj aktywności fizycznej Pan/Pani wykonuje?',
    type: 'text',
    required: false,
    placeholder: 'np. spacery, pływanie, rower, siłownia...',
  },
  {
    id: 'diet',
    category: 'lifestyle',
    text: 'Jak ocenia Pan/Pani swoją dietę?',
    type: 'radio',
    options: [
      { value: 'healthy', label: 'Zdrowa (dużo warzyw, owoców, ryb)' },
      { value: 'moderate', label: 'Umiarkowanie zdrowa' },
      { value: 'unhealthy', label: 'Niezdrowa (dużo przetworzonej żywności)' },
      { value: 'high_salt', label: 'Wysoka zawartość soli' },
      { value: 'high_fat', label: 'Wysoka zawartość tłuszczów nasyconych' },
    ],
    required: true,
  },
  {
    id: 'alcohol',
    category: 'lifestyle',
    text: 'Jak często spożywa Pan/Pani alkohol?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Nie piję alkoholu' },
      { value: 'occasional', label: 'Okazjonalnie (kilka razy w miesiącu)' },
      { value: 'weekly', label: 'Regularnie (kilka razy w tygodniu)' },
      { value: 'daily', label: 'Codziennie' },
    ],
    required: true,
  },
  {
    id: 'stress_level',
    category: 'lifestyle',
    text: 'Jak ocenia Pan/Pani swój poziom stresu?',
    type: 'scale',
    required: true,
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: 'Niski stres', max: 'Bardzo wysoki stres' },
    helpText: '1 = minimalny stres, 10 = ekstremalnie wysoki stres',
  },
  {
    id: 'sleep_quality',
    category: 'lifestyle',
    text: 'Jak ocenia Pan/Pani jakość swojego snu?',
    type: 'radio',
    options: [
      { value: 'good', label: 'Dobra (7-8 godzin, odpoczywam)' },
      { value: 'moderate', label: 'Umiarkowana' },
      { value: 'poor', label: 'Słaba (problemy z zasypianiem/budzeniem)' },
      { value: 'very_poor', label: 'Bardzo słaba (chroniczne bezsenności)' },
    ],
    required: true,
  },

  // ===== FUNCTIONAL STATUS / STAN FUNKCJONALNY =====
  {
    id: 'exercise_tolerance',
    category: 'functional_status',
    text: 'Jak daleko może Pan/Pani chodzić bez odczuwania duszności lub zmęczenia?',
    type: 'radio',
    options: [
      { value: 'unlimited', label: 'Bez ograniczeń' },
      { value: 'moderate', label: 'Około 500 metrów lub więcej' },
      { value: 'limited', label: 'Około 100-500 metrów' },
      { value: 'very_limited', label: 'Poniżej 100 metrów' },
      { value: 'at_rest', label: 'Duszność występuje nawet w spoczynku' },
    ],
    required: true,
    helpText: 'Ta informacja odpowiada klasyfikacji NYHA stosowanej przez kardiologów',
  },
  {
    id: 'stairs_climbing',
    category: 'functional_status',
    text: 'Ile pięter może Pan/Pani wejść po schodach bez zatrzymywania się?',
    type: 'radio',
    options: [
      { value: 'more_than_2', label: 'Więcej niż 2 piętra bez problemu' },
      { value: '1_2_floors', label: '1-2 piętra' },
      { value: 'less_than_1', label: 'Mniej niż 1 piętro' },
      { value: 'cannot', label: 'Nie mogę wchodzić po schodach' },
    ],
    required: true,
  },
  {
    id: 'daily_activities',
    category: 'functional_status',
    text: 'Czy dolegliwości ograniczają Pana/Pani codzienne aktywności?',
    type: 'radio',
    options: [
      { value: 'no', label: 'Nie, wykonuję wszystkie czynności normalnie' },
      { value: 'slightly', label: 'Nieznacznie ograniczają' },
      { value: 'moderately', label: 'Umiarkowanie ograniczają' },
      { value: 'severely', label: 'Znacznie ograniczają (potrzebuję pomocy)' },
    ],
    required: true,
  },
  {
    id: 'night_symptoms',
    category: 'functional_status',
    text: 'Czy budzi się Pan/Pani w nocy z powodu duszności?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Nie, nigdy' },
      { value: 'rarely', label: 'Rzadko (kilka razy w miesiącu)' },
      { value: 'often', label: 'Często (kilka razy w tygodniu)' },
      { value: 'every_night', label: 'Prawie każdej nocy' },
    ],
    required: true,
    helpText: 'Napadowa duszność nocna może wskazywać na niewydolność serca',
  },
  {
    id: 'pillows_needed',
    category: 'functional_status',
    text: 'Na ilu poduszkach Pan/Pani śpi?',
    type: 'radio',
    options: [
      { value: '1', label: '1 poduszka (pozycja płaska)' },
      { value: '2', label: '2 poduszki' },
      { value: '3_or_more', label: '3 lub więcej poduszek' },
      { value: 'sitting', label: 'Muszę spać w pozycji siedzącej' },
    ],
    required: true,
    helpText: 'Potrzeba spania na wielu poduszkach może wskazywać na problemy z sercem',
  },
  {
    id: 'additional_info',
    category: 'functional_status',
    text: 'Czy jest coś jeszcze, co chciałby/chciałaby Pan/Pani przekazać kardiologowi?',
    type: 'textarea',
    required: false,
    placeholder: 'Dodatkowe informacje, obawy, pytania do lekarza...',
  },
];

export const questionCategories: Record<string, { name: string; description: string }> = {
  chief_complaint: {
    name: 'Główna dolegliwość',
    description: 'Opis objawów i powodu wizyty',
  },
  risk_factors: {
    name: 'Czynniki ryzyka',
    description: 'Ocena czynników ryzyka sercowo-naczyniowego',
  },
  medical_history: {
    name: 'Historia medyczna',
    description: 'Przebyte choroby i zabiegi',
  },
  medications: {
    name: 'Leki',
    description: 'Przyjmowane leki i alergie',
  },
  lifestyle: {
    name: 'Styl życia',
    description: 'Aktywność fizyczna, dieta, nawyki',
  },
  functional_status: {
    name: 'Stan funkcjonalny',
    description: 'Tolerancja wysiłku i ograniczenia',
  },
};

export function getQuestionsByCategory(category: string): Question[] {
  return cardiologyQuestions.filter((q) => q.category === category);
}

export function getQuestionById(id: string): Question | undefined {
  return cardiologyQuestions.find((q) => q.id === id);
}

export function getTotalQuestions(): number {
  return cardiologyQuestions.length;
}
