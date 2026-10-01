import type { Dictionary } from "../types";

export const en: Dictionary = {
  locale: "en",
  htmlLang: "en",
  brand: "Dootter",
  brandTag: "Free document converter",
  meta: {
    converterTitle: "{title} — free, no upload, no watermark | {brand}",
    legalTitle: "{title} | {brand}",
  },

  nav: {
    home: "Home",
    converters: "Converters",
    how: "How it works",
    faq: "FAQ",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    menu: "Menu",
    close: "Close",
  },

  hero: {
    eyebrow: "100% private — conversion happens in your browser",
    title: "Convert PDF and Office files in seconds",
    subtitle:
      "PDF to Word, Word to PDF, Excel to Word and Word to Excel. No uploads, no queues, no watermarks. Your files never leave your device.",
    ctaPrimary: "Choose a converter",
    ctaSecondary: "How it works",
    badge1: "No sign-up",
    badge2: "No file limit",
    badge3: "Free forever",
  },

  trust: {
    title: "Why people switch to this converter",
    items: [
      {
        h: "Files stay on your device",
        p: "Every conversion runs inside your own browser. Nothing is uploaded, so contracts, invoices and personal documents never touch a server.",
      },
      {
        h: "Editable output, not a flat copy",
        p: "Word to PDF keeps real, selectable text. Excel to Word produces a real Word table with repeating headers that continues across pages.",
      },
      {
        h: "Works when other sites are down",
        p: "No account, no email, no paywall. Open the page, convert, download. The tool keeps working even on a slow connection.",
      },
      {
        h: "No watermark, no page cap",
        p: "Many free converters add a watermark or limit you to three pages. We do not — there is no limit on the number of pages.",
      },
    ],
  },

  convertersSection: {
    title: "Four converters, one page",
    subtitle: "Pick the direction you need. Each tool is tuned for that specific format pair.",
    open: "Open converter",
  },

  stepsSection: {
    title: "How it works",
    subtitle: "Three steps, no account, no waiting.",
    steps: [
      {
        h: "1. Drop your file",
        p: "Drag a PDF, Word or Excel file onto the converter, or pick it from your computer or phone.",
      },
      {
        h: "2. Convert locally",
        p: "Your browser reads the file and rebuilds it in the new format. The progress takes seconds, not minutes.",
      },
      {
        h: "3. Download the result",
        p: "Save the finished file and open it in Word, Excel, Google Docs or any other editor.",
      },
    ],
  },

  faqSection: {
    title: "Questions people actually ask",
    subtitle: "Short answers about privacy, quality and limits.",
  },

  ctaSection: {
    title: "Ready when you are",
    subtitle: "No account required. Nothing is uploaded. Just convert.",
    button: "Start converting",
  },

  homeFaq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Is my file uploaded to a server?",
        a: "No. The conversion engines are JavaScript libraries that run inside your browser tab. The file is read from your disk, converted in memory, and handed back to you as a download. It never leaves your device, which is why we can offer the service without limits and without an account.",
      },
      {
        q: "Will the layout stay exactly the same?",
        a: "For Word to PDF and Excel to Word, yes — we rebuild real document structures: real text, real tables, repeating header rows and automatic page breaks. For PDF to Word it depends on the source: PDFs that contain a text layer convert with very good fidelity, while scanned PDFs (images of pages) contain no text at all and need optical character recognition, which we flag instead of silently returning an empty file.",
      },
      {
        q: "How large a file can I convert?",
        a: "There is no server-side limit, because there is no server. Your device's free memory is the limit, and in practice files of several hundred megabytes still convert comfortably on a modern laptop or phone.",
      },
      {
        q: "Will the converted file have a watermark or ads?",
        a: "No. The file you download is clean. There is no watermark, no page limit, no ad-injected text and no forced sign-up.",
      },
      {
        q: "Do you keep a copy of my documents?",
        a: "There is nothing to keep. The file is processed in your browser's memory and discarded as soon as you close or reload the page. We cannot access it even if we wanted to.",
      },
      {
        q: "Can I convert a file that is password protected?",
        a: "An encrypted PDF or password protected Word file has to be unlocked first, because the content cannot be read while it is encrypted. Remove the password in the original program, then drop the file here.",
      },
      {
        q: "Does it work offline?",
        a: "Once the page has loaded, yes. The conversion itself needs no network connection, so you can work on a plane or in a place with no signal.",
      },
      {
        q: "Which languages does the interface support?",
        a: "English, Russian, Spanish, German and French. The site remembers the language you chose, and the file contents themselves are never translated or modified.",
      },
    ],
  },

  converters: {
    pdfToWord: {
      id: "pdfToWord",
      slug: "pdf-to-word",
      title: "PDF to Word converter",
      short: "Turn a PDF into an editable .docx with paragraphs, headings and real tables.",
      long:
        "This PDF to Word converter rebuilds your document as a real, editable Word file. Headings stay headings, paragraphs stay paragraphs, and tables are restored as actual Word tables with borders — not as pictures of tables. Text remains selectable and searchable, so you can edit, copy and repurpose every line. The conversion runs entirely inside your browser, so the document is never uploaded anywhere.",
      dropzoneTitle: "Drop a PDF here",
      dropzoneHint: "or click to choose a file — .pdf, any size",
      convertButton: "Convert to Word",
      sourceExt: "PDF",
      targetExt: "DOCX",
      howTitle: "How to convert PDF to Word",
      howSteps: [
        "Open the PDF to Word converter on this page.",
        "Drop your .pdf file into the upload area, or click it to browse.",
        "Wait a few seconds while your browser converts the pages locally.",
        "Download the resulting .docx and open it in Word, Google Docs or LibreOffice.",
      ],
      whyTitle: "What you get",
      whyItems: [
        "An editable .docx file, not an image wrapped in a document",
        "Headings, lists and paragraphs detected from the page layout",
        "Tables restored as native Word tables with borders and merged cells",
        "Selectable, searchable text — ideal for re-using your own content",
        "Everything processed on your device, nothing uploaded",
      ],
      faqTitle: "PDF to Word questions",
      faq: [
        {
          q: "Why does my scanned PDF come out empty?",
          a: "A scan is a picture of a page, so the file contains no selectable text for the converter to read. When we detect this we say so explicitly instead of returning a broken file. Run the PDF through OCR first, or type the document straight into Word.",
        },
        {
          q: "How accurate is the layout?",
          a: "For PDFs produced from a Word or Excel original, the result is very close: the same paragraphs, the same reading order, the same tables. For exotic layouts — magazine spreads, multi-column brochures, forms with floating text boxes — a few manual tweaks may be needed.",
        },
        {
          q: "Are images from the PDF preserved?",
          a: "Text and structure are the priority. Embedded images are kept where they sit in the text flow, while purely decorative graphics and background artwork may be dropped.",
        },
        {
          q: "Can I convert several PDFs at once?",
          a: "Merge them into a single PDF first if you want one continuous document, then convert the result in one go.",
        },
      ],
      keywords: [
        "pdf to word",
        "convert pdf to docx",
        "pdf to word converter",
        "pdf to word online free",
        "convert pdf to editable word",
        "pdf to docx without uploading",
      ],
    },

    wordToPdf: {
      id: "wordToPdf",
      slug: "word-to-pdf",
      title: "Word to PDF converter",
      short: "Save any .doc or .docx as a clean PDF that looks right on every device.",
      long:
        "Convert a Word document to PDF without losing anything that matters. Headings keep their size, paragraphs keep their spacing, images stay sharp and every table is redrawn as a proper PDF table with its header row repeated on each new page. The text in the resulting PDF is real, selectable text, so it stays searchable and copy-pasteable. Nothing is uploaded — the document is converted inside your browser.",
      dropzoneTitle: "Drop a Word file here",
      dropzoneHint: "or click to choose a file — .docx or .doc",
      convertButton: "Convert to PDF",
      sourceExt: "DOCX",
      targetExt: "PDF",
      howTitle: "How to convert Word to PDF",
      howSteps: [
        "Open the Word to PDF converter on this page.",
        "Drop your .docx or .doc file into the upload area.",
        "Your browser rebuilds it as a paginated PDF with real text.",
        "Download the PDF and send it to anyone — it opens the same way everywhere.",
      ],
      whyTitle: "What you get",
      whyItems: [
        "Real, selectable text in the PDF — not a screenshot of a page",
        "Automatic page breaks, so nothing is cut off at the page edge",
        "Table headers repeated automatically when a table spans pages",
        "Images and basic formatting preserved",
        "Cyrillic, Greek and other alphabets render correctly",
      ],
      faqTitle: "Word to PDF questions",
      faq: [
        {
          q: "Why is the text in my PDF selectable here but not on other sites?",
          a: "Other converters usually print your document to an image and wrap that image in a PDF, which is why their output cannot be searched or copied. We rebuild the text as real text, so the PDF is smaller, sharper on zoom and usable with screen readers.",
        },
        {
          q: "How are page breaks decided?",
          a: "We lay the document out the way Word does: top and bottom margins, line height matching the original spacing, and a new page whenever the next line would cross the bottom margin. If a table is too tall for the remaining space it moves to the next page and repeats its header row.",
        },
        {
          q: "What about a very wide table?",
          a: "Wide tables are scaled down to the printable width of the page, and if that is still not enough, the page switches to landscape orientation. If the table genuinely cannot be shown on one page, a note is added saying the table is too large.",
        },
        {
          q: "Can I convert several documents into one PDF?",
          a: "Convert them one by one and then merge the PDF files, or place all documents into a single Word file first if you want a single continuous result.",
        },
      ],
      keywords: [
        "word to pdf",
        "docx to pdf",
        "convert word to pdf online",
        "word to pdf converter free",
        "convert doc to pdf without uploading",
        "docx to pdf with selectable text",
      ],
    },

    excelToWord: {
      id: "excelToWord",
      slug: "excel-to-word",
      title: "Excel to Word converter",
      short: "Turn a spreadsheet into a real Word table that behaves like a table.",
      long:
        "This Excel to Word converter does not paste your sheet as plain text or as a picture. It creates a genuine Word table: cells, borders, alignment, bold header row, and column widths measured from your data. The header row repeats automatically on every page, and when the table is too large to fit the page it is split across pages instead of being cut in half. If a table simply cannot be made to fit, the document says so explicitly instead of hiding the problem.",
      dropzoneTitle: "Drop an Excel file here",
      dropzoneHint: "or click to choose a file — .xlsx, .xls or .csv",
      convertButton: "Convert to Word",
      sourceExt: "XLSX",
      targetExt: "DOCX",
      howTitle: "How to convert Excel to Word",
      howSteps: [
        "Open the Excel to Word converter on this page.",
        "Drop your .xlsx, .xls or .csv file into the upload area.",
        "Choose portrait or landscape if you have a wide sheet.",
        "Download the .docx — the table is split over pages with a repeating header if needed.",
      ],
      whyTitle: "What you get",
      whyItems: [
        "A native Word table, not text or a screenshot",
        "Bold header row that repeats on every page automatically",
        "Column widths calculated from your actual cell contents",
        "Portrait or landscape page, so wide sheets stay readable",
        "A clear note in the document when a table is too large to fit",
      ],
      faqTitle: "Excel to Word questions",
      faq: [
        {
          q: "What happens if my table is too big for one page?",
          a: "First we try to make it fit: column widths are reduced to the printable width and the page may switch to landscape. If the table is still taller than a page, Word splits it across pages by itself and repeats the header row on each one. Only when a table cannot be fitted at all — for example with dozens of columns — do we add a visible note saying the table is too large, so the situation is clear in the document instead of silently truncated.",
        },
        {
          q: "Will my formulas and formatting survive?",
          a: "Formulas are replaced by their calculated values, which is usually what you want in a document. Number formats, bold, italic, colours, merged cells and cell alignment are carried over.",
        },
        {
          q: "Can I convert only one sheet?",
          a: "All sheets are converted by default, each on its own page with its name as a heading. Remove or empty the sheets you do not need before converting.",
        },
        {
          q: "What about very long sheets?",
          a: "They are split across as many pages as needed, with the header row repeated, so a 5000-row sheet stays readable and printable.",
        },
      ],
      keywords: [
        "excel to word",
        "xlsx to docx",
        "excel to word table",
        "convert excel to word online",
        "spreadsheet to word table",
        "excel to docx with repeating header",
      ],
    },

    wordToExcel: {
      id: "wordToExcel",
      slug: "word-to-excel",
      title: "Word to Excel converter",
      short: "Pull every Word table into a clean spreadsheet with real numbers and dates.",
      long:
        "Turn the tables in a Word document into a proper Excel workbook. Each table becomes its own worksheet, the first row is detected as the header, merged cells are expanded, and values that look like numbers, percentages, currency or dates are written as real Excel values instead of text. Text formatting, bold headers, cell alignment and empty rows are all handled, so the result opens in Excel and Google Sheets ready to calculate.",
      dropzoneTitle: "Drop a Word file here",
      dropzoneHint: "or click to choose a file — .docx or .doc",
      convertButton: "Convert to Excel",
      sourceExt: "DOCX",
      targetExt: "XLSX",
      howTitle: "How to convert Word to Excel",
      howSteps: [
        "Open the Word to Excel converter on this page.",
        "Drop your .docx or .doc file into the upload area.",
        "Every table in the document becomes a separate sheet in the workbook.",
        "Download the .xlsx and open it in Excel, Numbers or Google Sheets.",
      ],
      whyTitle: "What you get",
      whyItems: [
        "One worksheet per Word table, named after the table or the section",
        "First row detected as the header and frozen in the sheet",
        "Numbers, percentages, currency and dates stored as real values",
        "Merged cells expanded, empty rows and stray paragraphs removed",
        "Column widths sized to the content so the data is readable at once",
      ],
      faqTitle: "Word to Excel questions",
      faq: [
        {
          q: "How are numbers recognised?",
          a: "Cell text is parsed with locale awareness: 1,234.56, 12 %, -45 €, 1 234,56 and dates such as 12.03.2026 are turned into numeric or date cells, while anything ambiguous stays as text so you never lose information to a wrong guess.",
        },
        {
          q: "My Word table has merged cells. Is that a problem?",
          a: "No. Horizontal merges become duplicated values in each affected row and vertical merges are filled down, which keeps every row the same length and keeps the data usable for formulas and sorting.",
        },
        {
          q: "What happens to the text outside the tables?",
          a: "Headings and paragraphs are added as a notes sheet so no content is silently thrown away. If the document contains no tables at all, the tool says so instead of handing you an empty workbook.",
        },
        {
          q: "Will the workbook keep the original styling?",
          a: "Bold headers, borders, alignment and cell width are reproduced approximately, so the sheet looks familiar. Excel cannot copy Word styling one to one, so fonts are normalised to the spreadsheet default.",
        },
      ],
      keywords: [
        "word to excel",
        "docx to xlsx",
        "convert word table to excel",
        "word table to spreadsheet",
        "convert docx to excel online",
        "word to excel with tables",
      ],
    },
  },

  ui: {
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    language: "Language",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
    drop: "Drop a file here",
    browse: "browse",
    remove: "Remove",
    convert: "Convert",
    converting: "Converting",
    print: "Print",
    download: "Download",
    downloadAgain: "Download again",
    convertingFile: "Converting",
    startOver: "Convert another file",
    errorTitle: "Something went wrong",
    unsupportedFile: "This tool only accepts {ext} files.",
    tooLarge: "This file is too large for your device memory. Try a smaller file.",
    emptyFile: "This file looks empty, so there is nothing to convert.",
    encryptedPdf: "This file is password protected. Remove the password and try again.",
    scannedPdf: "Scanned PDF detected",
    scannedPdfHint:
      "The pages are images, so there is no text layer to convert. Run the file through OCR first, then convert the result.",
    noTextPdf: "No selectable text was found in this PDF.",
    noTables: "No tables were found in this document, so the workbook is empty.",
    tooLargeNotice: "The layout was wider than the page, so it was scaled down to fit.",
    tableTooLargeNotice: "This table has {n} columns, which does not fit on one page.",
    tableWillSplit: "The table continues on {n} more page(s), with the header row repeated.",
    resultReady: "Your file is ready",
    resultSize: "Size",
    processingLocally: "Processed on your device",
    privacyNote: "Your file is processed in this browser tab and never uploaded.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    optional: "optional",
    orientation: "Page orientation",
    orientationAuto: "Auto",
    orientationPortrait: "Portrait",
    orientationLandscape: "Landscape",
    sheetsIncluded: "{n} sheet(s) included",
    from: "From",
    to: "To",
  },

  footer: {
    blurb: "A free, private document converter. Files are processed in your browser and never uploaded.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    rights: "All rights reserved.",
    madeWith: "Built for people who just need the file to work.",
  },
  ads: {
    label: "Advertisement",
    interstitialLabel: "Advertisement",
  },
  stats: {
    visitors: "visitors so far",
    conversions: "conversions done",
    online: "here right now",
    onlineForms: {
      one: "here right now",
      few: "here right now",
      many: "here right now",
      other: "here right now",
    },
  },

  pages: {
    about: {
      title: "About Dootter",
      intro:
        "Dootter is a document converter that does one thing and refuses to do anything sketchy with your files.",
      sections: [
        {
          h: "Why we built it",
          p: "Free online converters usually work the same way: you upload a file, wait in a queue, and then download something with a watermark on page three. Some of them also keep a copy of your document, which is a real problem when the document is a contract, a medical record or a tax return.",
        },
        {
          h: "How ours is different",
          p: "We ship the conversion engines to your browser instead of running them on a server. The same libraries that build the file are downloaded to your device, read your file locally and produce the result in memory. That single decision removes upload time, removes the queue, removes the file-size ceiling and makes privacy a property of the architecture rather than a promise in a privacy policy.",
        },
        {
          h: "What that costs us",
          p: "A self-hosted converter cannot monetise your data, so it is funded by the advertising on the page and by being simple and dependable. We keep the tool free and without sign-up. We also keep the honest limits visible: a scanned PDF has no text layer and cannot be converted without OCR, and we say so instead of quietly returning an empty file.",
        },
        {
          h: "Who it is for",
          p: "Students formatting a thesis, accountants moving a ledger into Word, freelancers sending a client a PDF instead of a spreadsheet, and anyone who has ever needed a document converted before lunch. If the task is move a file from A to B without handing it to a stranger, this site is for you.",
        },
      ],
    },
    privacy: {
      title: "Privacy policy",
      intro:
        "The short version: we never receive your files, so we cannot lose them, sell them or leak them.",
      sections: [
        {
          h: "Files stay on your device",
          p: "Documents are converted by JavaScript code running in your browser. The file is read from your local disk, processed in memory and saved back to your device. It is never transmitted to us or to any third party, and we have no server that could receive it.",
        },
        {
          h: "What is processed on our servers",
          p: "Ordinarily nothing that identifies you. If your hosting provider keeps standard web server logs, those logs contain technical data such as IP address, browser type and requested URL, and are handled under that provider's own policy.",
        },
        {
          h: "Cookies and local storage",
          p: "We store your theme choice (light or dark) and your language choice in your browser's local storage. This is local to your device, is never sent to us, and is used only so the site looks the way you left it.",
        },
        {
          h: "Visit and conversion counters",
          p: "The pages show how many visitors the site has had in total, how many conversions have been completed, and how many people are on the site right now. The numbers are aggregate only. To avoid counting the same person repeatedly, a visitor is identified by a hash of the request address and browser type, the hash is combined with a key that changes every day, and the result is discarded after two days. While a tab is open the browser sends a short request every 30 seconds, and that hash is kept in server memory for no more than five minutes; none of it reaches disk, and a restart simply clears it. Your address itself is never stored, no cookie is used, and the counters cannot be traced back to you. We use these totals to understand whether the site is useful, and for nothing else.",
        },
        {
          h: "Advertising",
          p: "The pages carry advertising. The advertising network that serves it may place cookies or use similar technologies to measure how often an advert is shown and whether it was clicked. It does this on its own behalf and under its own policy, and it never receives the documents you convert. Your file is read and processed inside your browser, so the advert network has no access to it, and the site itself never uploads it anywhere.",
        },
        {
          h: "Third-party services",
          p: "Outgoing links to other websites are marked as such. Once you follow one, that site's own privacy policy applies. We do not embed chat widgets or third-party analytics trackers.",
        },
        {
          h: "Children",
          p: "The service is a general-purpose file tool and is not directed at children. We do not knowingly collect personal information from anyone, of any age.",
        },
        {
          h: "Contact",
          p: "Questions about privacy can be sent through the contact page. Because we hold no user documents, there is no user data for us to export, correct or delete — the most privacy-respecting deletion is the one that never happened.",
        },
      ],
    },
    terms: {
      title: "Terms of use",
      intro:
        "Plain-language terms. If you use the site in a normal way, you will not run into any of them.",
      sections: [
        {
          h: "The service",
          p: "Dootter converts documents on your own device and is provided free of charge, without warranty of any kind and without any promise of availability. We may change, suspend or discontinue the service at any time.",
        },
        {
          h: "Acceptable use",
          p: "Use the service only for files you own or are authorised to process, and only for lawful purposes. Do not use the site to convert material you have no right to use, and do not attempt to disrupt the service or circumvent its limits.",
        },
        {
          h: "Your content",
          p: "You keep every right you had in your files. Because conversion happens locally, we claim no rights in your documents and receive no copy of them.",
        },
        {
          h: "No warranty",
          p: "Document formats are complicated and automatic conversion is not always perfect. Always keep your original file and review the result before relying on it for anything important. We are not liable for lost data, lost profit or any indirect damage arising from your use of the service.",
        },
        {
          h: "Limitation of liability",
          p: "To the maximum extent permitted by law, our total liability to you for any claim related to the service is limited to the greater of the amount you paid for the service — which is zero — and the minimum required by law.",
        },
        {
          h: "Changes",
          p: "We may update these terms. The version published on this page is the version that applies. Continued use of the service after a change means you accept the updated terms.",
        },
      ],
    },
    contact: {
      title: "Contact",
      intro:
        "Found a bug, hit a strange file, or need a conversion we do not support yet? Tell us about it.",
      sections: [
        {
          h: "Before you write",
          p: "The fastest fix for a failed conversion is usually another file: a scanned PDF, a password protected document or a file that is actually a renamed .doc can all produce odd results. If the problem persists, we want to hear about it.",
        },
        {
          h: "What to include",
          p: "Describe the conversion you attempted, what you expected, and what happened instead. Mention your browser and operating system. Please do not attach the document itself — since we never receive your files, a description is all we can act on, and it keeps your data out of an email thread.",
        },
        {
          h: "Conversion requests",
          p: "We are open to adding directions such as PDF to Excel, image to PDF or PDF to plain text. Requests that several people ask for get built first.",
        },
        {
          h: "Response time",
          p: "We aim to reply to bug reports within a few working days. This site is run as a small independent project, so weekends may be slower.",
        },
      ],
    },
  },
};
