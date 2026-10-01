export type ConverterId = "pdfToWord" | "wordToPdf" | "excelToWord" | "wordToExcel";

export type FaqItem = { q: string; a: string };

export type ConverterCopy = {
  id: ConverterId;
  slug: string;
  title: string;
  short: string;
  long: string;
  dropzoneTitle: string;
  dropzoneHint: string;
  convertButton: string;
  sourceExt: string;
  targetExt: string;
  howTitle: string;
  howSteps: string[];
  whyTitle: string;
  whyItems: string[];
  faqTitle: string;
  faq: FaqItem[];
  keywords: string[];
};

export type LegalPage = { title: string; intro: string; sections: { h: string; p: string }[] };

export type Dictionary = {
  locale: string;
  htmlLang: string;
  brand: string;
  brandTag: string;
  meta: {
    /** `{title}` and `{brand}` are replaced at render time. */
    converterTitle: string;
    legalTitle: string;
  };
  nav: {
    home: string;
    converters: string;
    how: string;
    faq: string;
    about: string;
    privacy: string;
    terms: string;
    contact: string;
    menu: string;
    close: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge1: string;
    badge2: string;
    badge3: string;
  };
  trust: { title: string; items: { h: string; p: string }[] };
  convertersSection: { title: string; subtitle: string; open: string };
  stepsSection: { title: string; subtitle: string; steps: { h: string; p: string }[] };
  faqSection: { title: string; subtitle: string };
  ctaSection: { title: string; subtitle: string; button: string };
  homeFaq: { title: string; items: FaqItem[] };
  converters: Record<ConverterId, ConverterCopy>;
  ui: {
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    language: string;
    switchToDark: string;
    switchToLight: string;
    drop: string;
    browse: string;
    remove: string;
    convert: string;
    converting: string;
    download: string;
    downloadAgain: string;
    /** Label for the button that sends the document to the printer. */
    print: string;
    convertingFile: string;
    startOver: string;
    errorTitle: string;
    unsupportedFile: string;
    tooLarge: string;
    emptyFile: string;
    encryptedPdf: string;
    scannedPdf: string;
    scannedPdfHint: string;
    noTextPdf: string;
    noTables: string;
    tooLargeNotice: string;
    tableTooLargeNotice: string;
    tableWillSplit: string;
    resultReady: string;
    resultSize: string;
    processingLocally: string;
    privacyNote: string;
    copyLink: string;
    linkCopied: string;
    optional: string;
    orientation: string;
    orientationAuto: string;
    orientationPortrait: string;
    orientationLandscape: string;
    sheetsIncluded: string;
    from: string;
    to: string;
  };
  footer: {
    blurb: string;
    product: string;
    company: string;
    legal: string;
    rights: string;
    madeWith: string;
  };
  ads: {
    label: string;
  };
  stats: {
    visitors: string;
    conversions: string;
    // Russian needs three plural forms for each noun ("1 посетитель",
    // "2 посетителя", "5 посетителей"), so the label cannot be a fixed string.
    // The keys are Intl.PluralRules categories; every locale has to list them
    // all, and a locale that only needs "other" may repeat it.
    visitorsForms?: Record<"one" | "few" | "many" | "other", string>;
    conversionsForms?: Record<"one" | "few" | "many" | "other", string>;
    online: string;
    onlineForms?: Record<"one" | "few" | "many" | "other", string>;
  };
  pages: {
    about: LegalPage;
    privacy: LegalPage;
    terms: LegalPage;
    contact: LegalPage;
  };
};
