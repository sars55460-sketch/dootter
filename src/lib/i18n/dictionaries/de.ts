import type { Dictionary } from "../types";

export const de: Dictionary = {
  locale: "de",
  htmlLang: "de",
  brand: "Dootter",
  brandTag: "Kostenloser Dokumentenkonverter",
  meta: {
    converterTitle: "{title} — kostenlos, ohne Upload, ohne Wasserzeichen | {brand}",
    legalTitle: "{title} | {brand}",
  },

  nav: {
    home: "Start",
    converters: "Konverter",
    how: "So funktioniert es",
    faq: "Fragen",
    about: "Über uns",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    contact: "Kontakt",
    menu: "Menü",
    close: "Schließen",
  },

  hero: {
    eyebrow: "100 % privat — die Konvertierung läuft im Browser",
    title: "PDF- und Office-Dateien in Sekunden umwandeln",
    subtitle:
      "PDF zu Word, Word zu PDF, Excel zu Word und Word zu Excel. Ohne Upload, ohne Warteschlange, ohne Wasserzeichen. Ihre Dateien verlassen Ihr Gerät nie.",
    ctaPrimary: "Konverter auswählen",
    ctaSecondary: "So funktioniert es",
    badge1: "Ohne Anmeldung",
    badge2: "Kein Dateilimit",
    badge3: "Für immer gratis",
  },

  trust: {
    title: "Warum Menschen zu diesem Konverter wechseln",
    items: [
      {
        h: "Dateien bleiben auf Ihrem Gerät",
        p: "Jede Konvertierung läuft in Ihrem eigenen Browser. Es wird nichts hochgeladen, sodass Verträge, Rechnungen und persönliche Dokumente keinen Server berühren.",
      },
      {
        h: "Editierbares Ergebnis statt flacher Kopie",
        p: "Word zu PDF behält echten, markierbaren Text. Excel zu Word erzeugt eine echte Word-Tabelle mit Kopfzeile, die sich auf jeder Seite wiederholt.",
      },
      {
        h: "Funktioniert auch, wenn andere Seiten down sind",
        p: "Kein Konto, keine E-Mail, keine Bezahlschranke. Seite öffnen, konvertieren, herunterladen. Das Tool funktioniert auch bei langsamer Verbindung.",
      },
      {
        h: "Kein Wasserzeichen, kein Seitenlimit",
        p: "Viele kostenlose Konverter setzen ein Wasserzeichen oder begrenzen auf drei Seiten. Wir nicht — es gibt keine Seitenbegrenzung.",
      },
    ],
  },

  convertersSection: {
    title: "Vier Konverter auf einer Seite",
    subtitle: "Wählen Sie die Richtung, die Sie brauchen. Jedes Werkzeug ist auf dieses Formatpaar abgestimmt.",
    open: "Konverter öffnen",
  },

  stepsSection: {
    title: "So funktioniert es",
    subtitle: "Drei Schritte, kein Konto, kein Warten.",
    steps: [
      {
        h: "1. Datei ablegen",
        p: "Ziehen Sie eine PDF-, Word- oder Excel-Datei auf den Konverter oder wählen Sie sie vom Rechner oder Telefon aus.",
      },
      {
        h: "2. lokal konvertieren",
        p: "Ihr Browser liest die Datei und baut sie im neuen Format neu auf. Das dauert Sekunden, nicht Minuten.",
      },
      {
        h: "3. Ergebnis herunterladen",
        p: "Speichern Sie die fertige Datei und öffnen Sie sie in Word, Excel, Google Docs oder einem anderen Editor.",
      },
    ],
  },

  faqSection: {
    title: "Fragen, die wirklich gestellt werden",
    subtitle: "Kurze Antworten zu Datenschutz, Qualität und Grenzen.",
  },

  ctaSection: {
    title: "Bereit, wenn Sie es sind",
    subtitle: "Kein Konto nötig. Nichts wird hochgeladen. Einfach konvertieren.",
    button: "Konvertierung starten",
  },

  homeFaq: {
    title: "Häufige Fragen",
    items: [
      {
        q: "Wird meine Datei auf einen Server hochgeladen?",
        a: "Nein. Die Konvertierungs-Engines sind JavaScript-Bibliotheken, die in Ihrem Browser-Tab laufen. Die Datei wird von Ihrer Festplatte gelesen, im Speicher konvertiert und Ihnen als Download zurückgegeben. Sie verlässt Ihr Gerät nie — deshalb können wir den Dienst ohne Limits und ohne Konto anbieten.",
      },
      {
        q: "Bleibt das Layout exakt erhalten?",
        a: "Bei Word zu PDF und Excel zu Word ja: Wir bauen echte Dokumentstrukturen nach — echter Text, echte Tabellen, wiederholte Kopfzeilen und automatische Seitenumbrüche. Bei PDF zu Word hängt es von der Quelle ab: PDFs mit Textebene konvertieren mit sehr hoher Genauigkeit, während gescannte PDFs (Seitenbilder) gar keinen Text enthalten und eine Texterkennung brauchen — das weisen wir aus, statt still eine leere Datei zurückzugeben.",
      },
      {
        q: "Wie groß darf meine Datei sein?",
        a: "Es gibt kein serverseitiges Limit, weil es keinen Server gibt. Der freie Speicher Ihres Geräts ist die Grenze; in der Praxis lassen sich Dateien von mehreren hundert Megabytes auf einem modernen Laptop oder Telefon problemlos konvertieren.",
      },
      {
        q: "Bekommt die konvertierte Datei ein Wasserzeichen oder Werbung?",
        a: "Nein. Die heruntergeladene Datei ist sauber: kein Wasserzeichen, kein Seitenlimit, keine eingefügten Werbetexte und keine erzwungene Anmeldung.",
      },
      {
        q: "Bewahren Sie Kopien meiner Dokumente auf?",
        a: "Es gibt nichts aufzubewahren. Die Datei wird im Browserspeicher verarbeitet und verworfen, sobald Sie die Seite schließen oder neu laden. Wir könnten nicht einmal auf sie zugreifen, wenn wir es wollten.",
      },
      {
        q: "Kann ich eine passwortgeschützte Datei konvertieren?",
        a: "Ein verschlüsseltes PDF oder eine passwortgeschützte Word-Datei muss zuerst entsperrt werden, denn solange sie verschlüsselt ist, kann der Inhalt nicht gelesen werden. Entfernen Sie das Passwort im Originalprogramm und legen Sie die Datei dann hier ab.",
      },
      {
        q: "Funktioniert es offline?",
        a: "Ja, sobald die Seite geladen ist. Die Konvertierung selbst braucht keine Netzwerkverbindung, Sie können also im Flugzeug oder ohne Empfang arbeiten.",
      },
      {
        q: "In welchen Sprachen gibt es die Oberfläche?",
        a: "Englisch, Russisch, Spanisch, Deutsch und Französisch. Die Website merkt sich die gewählte Sprache, und der Inhalt der Dateien wird niemals übersetzt oder verändert.",
      },
    ],
  },

  converters: {
    pdfToWord: {
      id: "pdfToWord",
      slug: "pdf-to-word",
      title: "PDF-zu-Word-Konverter",
      short: "Macht aus einem PDF eine bearbeitbare .docx mit Absätzen, Überschriften und echten Tabellen.",
      long:
        "Dieser PDF-zu-Word-Konverter baut Ihr Dokument als echte, bearbeitbare Word-Datei neu auf. Überschriften bleiben Überschriften, Absätze bleiben Absätze, und Tabellen werden als echte Word-Tabellen mit Rahmen wiederhergestellt — nicht als Bilder von Tabellen. Der Text bleibt markierbar und durchsuchbar, sodass Sie jede Zeile bearbeiten, kopieren und weiterverwenden können. Die Konvertierung läuft vollständig in Ihrem Browser, das Dokument wird also nirgendwohin hochgeladen.",
      dropzoneTitle: "PDF hier ablegen",
      dropzoneHint: "oder klicken, um eine Datei zu wählen — .pdf in beliebiger Größe",
      convertButton: "In Word konvertieren",
      sourceExt: "PDF",
      targetExt: "DOCX",
      howTitle: "So konvertieren Sie PDF in Word",
      howSteps: [
        "Öffnen Sie den PDF-zu-Word-Konverter auf dieser Seite.",
        "Legen Sie Ihre .pdf-Datei in den Upload-Bereich oder klicken Sie ihn an.",
        "Warten Sie ein paar Sekunden, während Ihr Browser die Seiten lokal konvertiert.",
        "Laden Sie die fertige .docx herunter und öffnen Sie sie in Word, Google Docs oder LibreOffice.",
      ],
      whyTitle: "Das bekommen Sie",
      whyItems: [
        "Eine bearbeitbare .docx-Datei, kein Bild in einem Dokument",
        "Überschriften, Listen und Absätze werden aus dem Seitenlayout erkannt",
        "Tabellen als native Word-Tabellen mit Rahmen und verbundenen Zellen",
        "Markierbarer, durchsuchbarer Text — ideal, um eigene Inhalte weiterzuverwenden",
        "Alles wird auf Ihrem Gerät verarbeitet, nichts wird hochgeladen",
      ],
      faqTitle: "Fragen zu PDF in Word",
      faq: [
        {
          q: "Warum kommt mein gescanntes PDF leer heraus?",
          a: "Ein Scan ist ein Bild der Seite, die Datei enthält also keinen markierbaren Text, den der Konverter lesen könnte. Wir erkennen das und sagen es ausdrücklich, statt eine kaputte Datei zurückzugeben. Lassen Sie das PDF zuerst durch eine Texterkennung laufen oder tippen Sie das Dokument direkt in Word.",
        },
        {
          q: "Wie genau ist das Layout?",
          a: "Bei PDFs, die aus Word oder Excel stammen, ist das Ergebnis sehr nah dran: dieselben Absätze, dieselbe Lesereihenfolge, dieselben Tabellen. Bei ausgefallenen Layouts — Zeitspiegel, mehrspaltige Broschüren, Formulare mit schwebenden Textfeldern — sind ein paar manuelle Korrekturen nötig.",
        },
        {
          q: "Bleiben Bilder aus dem PDF erhalten?",
          a: "Text und Struktur haben Vorrang. Eingebettete Bilder bleiben dort, wo sie im Textfluss stehen, rein dekorative Grafiken und Hintergrundbilder können entfallen.",
        },
        {
          q: "Kann ich mehrere PDFs auf einmal konvertieren?",
          a: "Führen Sie sie zuerst zu einem PDF zusammen, wenn Sie ein durchgehendes Dokument möchten, und konvertieren Sie dann das Ergebnis in einem Durchgang.",
        },
      ],
      keywords: [
        "pdf in word",
        "pdf zu word konvertieren",
        "pdf to word",
        "pdf in word online kostenlos",
        "pdf bearbeitbar in word umwandeln",
        "pdf in docx ohne upload",
      ],
    },

    wordToPdf: {
      id: "wordToPdf",
      slug: "word-to-pdf",
      title: "Word-zu-PDF-Konverter",
      short: "Speichert jede .doc oder .docx als sauberes PDF, das überall gleich aussieht.",
      long:
        "Konvertieren Sie ein Word-Dokument in PDF, ohne wichtiges zu verlieren. Überschriften behalten ihre Größe, Absätze ihren Abstand, Bilder bleiben scharf, und jede Tabelle wird als echte PDF-Tabelle neu gezeichnet, deren Kopfzeile sich auf jeder neuen Seite wiederholt. Der Text im fertigen PDF ist echter, markierbarer Text, bleibt also durchsuchbar und kopierbar. Nichts wird hochgeladen — das Dokument wird im Browser konvertiert.",
      dropzoneTitle: "Word-Datei hier ablegen",
      dropzoneHint: "oder klicken, um eine Datei zu wählen — .docx oder .doc",
      convertButton: "In PDF konvertieren",
      sourceExt: "DOCX",
      targetExt: "PDF",
      howTitle: "So konvertieren Sie Word in PDF",
      howSteps: [
        "Öffnen Sie den Word-zu-PDF-Konverter auf dieser Seite.",
        "Legen Sie Ihre .docx- oder .doc-Datei in den Upload-Bereich.",
        "Ihr Browser baut sie als PDF mit Seitenumbrüchen und echtem Text neu auf.",
        "Laden Sie das PDF herunter und schicken Sie es weiter — es öffnet sich überall gleich.",
      ],
      whyTitle: "Das bekommen Sie",
      whyItems: [
        "Echter, markierbarer Text im PDF — kein Screenshot einer Seite",
        "Automatische Seitenumbrüche, nichts wird am Seitenrand abgeschnitten",
        "Tabellenköpfe werden automatisch wiederholt, wenn eine Tabelle über mehrere Seiten geht",
        "Bilder und grundlegende Formatierung bleiben erhalten",
        "Kyrillisch, Griechisch und andere Alphabete werden korrekt dargestellt",
      ],
      faqTitle: "Fragen zu Word in PDF",
      faq: [
        {
          q: "Warum ist der Text hier markierbar und bei anderen Konvertern nicht?",
          a: "Andere Konverter drucken Ihr Dokument als Bild und legen dieses Bild in ein PDF, weshalb sich ihr Ergebnis nicht durchsuchen oder kopieren lässt. Wir bauen echten Text, dadurch ist das PDF kleiner, beim Zoomen schärfer und für Screenreader nutzbar.",
        },
        {
          q: "Wie werden Seitenumbrüche festgelegt?",
          a: "Wir setzen das Dokument so um wie Word: obere und untere Ränder, Zeilenhöhe entsprechend dem ursprünglichen Abstand und eine neue Seite, sobald die nächste Zeile den unteren Rand überschreiten würde. Passt eine Tabelle nicht mehr in den verbleibenden Platz, wandert sie auf die nächste Seite und wiederholt ihre Kopfzeile.",
        },
        {
          q: "Was passiert mit einer sehr breiten Tabelle?",
          a: "Breite Tabellen werden auf die druckbare Seitenbreite verkleinert, und wenn das nicht reicht, wechselt die Seite ins Querformat. Passt die Tabelle wirklich auf keine Seite, wird ein Hinweis ergänzt, dass die Tabelle zu groß ist.",
        },
        {
          q: "Kann ich mehrere Dokumente in ein PDF zusammenführen?",
          a: "Konvertieren Sie sie einzeln und führen Sie die PDFs anschließend zusammen, oder legen Sie alle Dokumente vorher in eine Word-Datei, wenn Sie ein durchgehendes Ergebnis möchten.",
        },
      ],
      keywords: [
        "word in pdf",
        "docx in pdf",
        "word in pdf online konvertieren",
        "word to pdf kostenlos",
        "doc in pdf ohne upload",
        "docx in pdf mit markierbarem text",
      ],
    },

    excelToWord: {
      id: "excelToWord",
      slug: "excel-to-word",
      title: "Excel-zu-Word-Konverter",
      short: "Macht aus einer Tabelle eine echte Word-Tabelle, die sich auch wie eine verhält.",
      long:
        "Dieser Excel-zu-Word-Konverter fügt Ihr Tabellenblatt weder als reinen Text noch als Bild ein. Er erzeugt eine echte Word-Tabelle: Zellen, Rahmen, Ausrichtung, fett formatierte Kopfzeile und Spaltenbreiten, gemessen an Ihren Daten. Die Kopfzeile wiederholt sich auf jeder Seite automatisch, und wenn die Tabelle zu groß für die Seite ist, wird sie über Seiten verteilt, statt in der Mitte abgeschnitten zu werden. Lässt sich eine Tabelle wirklich nicht einpassen, steht das ausdrücklich im Dokument, statt das Problem zu verstecken.",
      dropzoneTitle: "Excel-Datei hier ablegen",
      dropzoneHint: "oder klicken, um eine Datei zu wählen — .xlsx, .xls oder .csv",
      convertButton: "In Word konvertieren",
      sourceExt: "XLSX",
      targetExt: "DOCX",
      howTitle: "So konvertieren Sie Excel in Word",
      howSteps: [
        "Öffnen Sie den Excel-zu-Word-Konverter auf dieser Seite.",
        "Legen Sie Ihre .xlsx-, .xls- oder .csv-Datei in den Upload-Bereich.",
        "Wählen Sie Hoch- oder Querformat, wenn Ihr Blatt breit ist.",
        "Laden Sie die .docx herunter — ist die Tabelle groß, teilt sie sich mit wiederholter Kopfzeile auf mehrere Seiten.",
      ],
      whyTitle: "Das bekommen Sie",
      whyItems: [
        "Eine native Word-Tabelle, kein Text und kein Screenshot",
        "Fette Kopfzeile, die sich auf jeder Seite automatisch wiederholt",
        "Spaltenbreiten aus dem tatsächlichen Zellinhalt berechnet",
        "Hoch- oder Querformat, damit breite Blätter lesbar bleiben",
        "Ein deutlicher Hinweis im Dokument, wenn eine Tabelle zu groß ist",
      ],
      faqTitle: "Fragen zu Excel in Word",
      faq: [
        {
          q: "Was passiert, wenn meine Tabelle nicht auf eine Seite passt?",
          a: "Zuerst versuchen wir es anzupassen: Die Spaltenbreiten werden auf die druckbare Breite reduziert und die Seite wechselt nötigenfalls ins Querformat. Ist die Tabelle danach immer noch höher als eine Seite, teilt Word sie selbst und wiederholt die Kopfzeile auf jedem Teil. Den Hinweis „Tabelle zu groß“ gibt es erst, wenn sich die Tabelle gar nicht einpassen lässt, etwa bei dutzenden Spalten. So sehen Sie die Lage im Dokument, statt eine stillschweigende Kürzung.",
        },
        {
          q: "Bleiben Formeln und Formatierung erhalten?",
          a: "Formeln werden durch ihre berechneten Werte ersetzt, was in einem Dokument meist das Gewünschte ist. Zahlenformate, Fett, Kursiv, Farben, verbundene Zellen und Ausrichtung werden übernommen.",
        },
        {
          q: "Kann ich nur ein Blatt konvertieren?",
          a: "Standardmäßig werden alle Blätter konvertiert, jedes auf eigener Seite mit dem Blattnamen als Überschrift. Entfernen oder leeren Sie die Blätter, die Sie nicht brauchen.",
        },
        {
          q: "Wie sieht es mit sehr langen Blättern aus?",
          a: "Sie werden auf so viele Seiten verteilt, wie nötig, mit wiederholter Kopfzeile. Ein Blatt mit 5000 Zeilen bleibt so lesbar und druckbar.",
        },
      ],
      keywords: [
        "excel in word",
        "xlsx in docx",
        "excel tabelle in word",
        "excel in word online konvertieren",
        "tabelle excel in word",
        "excel in docx mit wiederholter kopfzeile",
      ],
    },

    wordToExcel: {
      id: "wordToExcel",
      slug: "word-to-excel",
      title: "Word-zu-Excel-Konverter",
      short: "Holt jede Word-Tabelle in eine saubere Tabelle mit echten Zahlen und Datumswerten.",
      long:
        "Verwandelt die Tabellen eines Word-Dokuments in eine echte Excel-Arbeitsmappe. Jede Tabelle wird zu einem eigenen Blatt, die erste Zeile wird als Kopfzeile erkannt, verbundene Zellen werden aufgelöst, und Werte, die nach Zahlen, Prozenten, Währung oder Datum aussehen, werden als echte Excel-Werte geschrieben statt als Text. Textformatierung, fette Kopfzeilen, Ausrichtung und Zellenbreite werden übernommen, sodass das Ergebnis in Excel und Google Sheets bereit zum Rechnen öffnet.",
      dropzoneTitle: "Word-Datei hier ablegen",
      dropzoneHint: "oder klicken, um eine Datei zu wählen — .docx oder .doc",
      convertButton: "In Excel konvertieren",
      sourceExt: "DOCX",
      targetExt: "XLSX",
      howTitle: "So konvertieren Sie Word in Excel",
      howSteps: [
        "Öffnen Sie den Word-zu-Excel-Konverter auf dieser Seite.",
        "Legen Sie Ihre .docx- oder .doc-Datei in den Upload-Bereich.",
        "Jede Tabelle im Dokument wird zu einem eigenen Blatt der Arbeitsmappe.",
        "Laden Sie die .xlsx herunter und öffnen Sie sie in Excel, Numbers oder Google Sheets.",
      ],
      whyTitle: "Das bekommen Sie",
      whyItems: [
        "Ein Blatt pro Word-Tabelle mit sprechendem Namen",
        "Die erste Zeile wird als Kopfzeile erkannt und im Blatt fixiert",
        "Zahlen, Prozentwerte, Währung und Datumswerte werden als echte Werte gespeichert",
        "Verbundene Zellen aufgelöst, leere Zeilen und Streuparagrafen entfernt",
        "Spaltenbreiten an den Inhalt angepasst, damit die Daten sofort lesbar sind",
      ],
      faqTitle: "Fragen zu Word in Excel",
      faq: [
        {
          q: "Wie werden Zahlen erkannt?",
          a: "Der Zelltext wird länderspezifisch ausgewertet: 1.234,56, 12 %, −45 €, 1 234,56 und Daten wie 12.03.2026 werden zu Zahlen- oder Datumszellen, während Zweideutiges Text bleibt. So verlieren Sie nie Informationen durch eine falsche Vermutung.",
        },
        {
          q: "Meine Word-Tabelle hat verbundene Zellen. Ist das ein Problem?",
          a: "Nein. Horizontale Verbindungen werden zu wiederholten Werten in jeder betroffenen Zeile, vertikale werden nach unten ausgefüllt. Dadurch behalten alle Zeilen dieselbe Länge, und die Daten lassen sich mit Formeln und Sortierung verwenden.",
        },
        {
          q: "Was passiert mit Text außerhalb der Tabellen?",
          a: "Überschriften und Absätze kommen auf ein separates Notizblatt, damit kein Inhalt still verloren geht. Enthält das Dokument gar keine Tabelle, meldet das Werkzeug das, statt Ihnen eine leere Arbeitsmappe zu geben.",
        },
        {
          q: "Bleibt die ursprüngliche Gestaltung erhalten?",
          a: "Fette Kopfzeilen, Rahmen, Ausrichtung und Zellenbreite werden annähernd nachgebildet, sodass das Blatt vertraut wirkt. Excel kann Word-Gestaltung nicht eins zu eins übernehmen, daher werden Schriften auf die Tabellen-Standard Schrift normalisiert.",
        },
      ],
      keywords: [
        "word in excel",
        "docx in xlsx",
        "word tabelle in excel",
        "word in excel online konvertieren",
        "word tabelle in excel",
        "docx in xlsx umwandeln",
      ],
    },
  },

  ui: {
    theme: "Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "System",
    language: "Sprache",
    switchToDark: "Zum dunklen Design wechseln",
    switchToLight: "Zum hellen Design wechseln",
    drop: "Datei hier ablegen",
    browse: "auswählen",
    remove: "Entfernen",
    convert: "Konvertieren",
    converting: "Wird konvertiert",
    print: "Drucken",
    download: "Herunterladen",
    downloadAgain: "Erneut herunterladen",
    convertingFile: "Wird konvertiert",
    startOver: "Weitere Datei konvertieren",
    errorTitle: "Etwas ist schiefgelaufen",
    unsupportedFile: "Dieses Werk nimmt nur {ext}-Dateien an.",
    tooLarge: "Diese Datei ist zu groß für den Gerätespeicher. Versuchen Sie eine kleinere Datei.",
    emptyFile: "Diese Datei sieht leer aus, es gibt nichts zu konvertieren.",
    encryptedPdf: "Diese Datei ist passwortgeschützt. Entfernen Sie das Passwort und versuchen Sie es erneut.",
    scannedPdf: "Gescanntes PDF erkannt",
    scannedPdfHint:
      "Die Seiten sind Bilder, es gibt also keine Textebene zum Konvertieren. Lassen Sie die Datei durch eine Texterkennung laufen und konvertieren Sie das Ergebnis.",
    noTextPdf: "In diesem PDF wurde kein markierbarer Text gefunden.",
    noTables: "Im Dokument wurden keine Tabellen gefunden, die Arbeitsmappe wäre leer.",
    tooLargeNotice: "Das Layout war breiter als die Seite und wurde deshalb zum Einpassen verkleinert.",
    tableTooLargeNotice: "Diese Tabelle hat {n} Spalten und passt nicht auf eine Seite.",
    tableWillSplit: "Die Tabelle geht auf {n} weitere Seite(n) weiter, die Kopfzeile wird wiederholt.",
    resultReady: "Ihre Datei ist fertig",
    resultSize: "Größe",
    processingLocally: "Auf Ihrem Gerät verarbeitet",
    privacyNote: "Ihre Datei wird in diesem Browser-Tab verarbeitet und nie hochgeladen.",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert",
    optional: "optional",
    orientation: "Seitenorientierung",
    orientationAuto: "Automatisch",
    orientationPortrait: "Hochformat",
    orientationLandscape: "Querformat",
    sheetsIncluded: "{n} Blatt/Blätter enthalten",
    from: "Von",
    to: "Nach",
  },

  footer: {
    blurb: "Ein kostenloser, privater Dokumentenkonverter. Dateien werden im Browser verarbeitet und nie hochgeladen.",
    product: "Produkt",
    company: "Projekt",
    legal: "Rechtliches",
    rights: "Alle Rechte vorbehalten.",
    madeWith: "Gemacht für alle, denen die Datei einfach funktionieren soll.",
  },

  pages: {
    about: {
      title: "Über Dootter",
      intro:
        "Dootter ist ein Dokumentenkonverter, der genau eine Sache tut und sich weigert, etwas Fragwürdiges mit Ihren Dateien anzustellen.",
      sections: [
        {
          h: "Warum wir das gebaut haben",
          p: "Kostenlose Online-Konverter funktionieren meist gleich: Sie laden eine Datei hoch, warten in einer Schlange und laden dann etwas mit Wasserzeichen auf Seite drei herunter. Manche behalten zusätzlich eine Kopie Ihres Dokuments — bei einem Vertrag, einem Arztbericht oder einer Steuererklärung ein echtes Problem.",
        },
        {
          h: "Worin sich unserer unterscheidet",
          p: "Wir liefern die Konvertierungs-Engines an Ihren Browser, statt sie auf einem Server zu betreiben. Dieselben Bibliotheken, die die Datei bauen, werden auf Ihr Gerät geladen, lesen die Datei lokal und erzeugen das Ergebnis im Speicher. Diese eine Entscheidung entfernt Upload-Zeit, entfernt die Schlange, entfernt das Größenlimit und macht Datenschutz zu einer Eigenschaft der Architektur statt zu einem Versprechen in der Datenschutzerklärung.",
        },
        {
          h: "Was uns das kostet",
          p: "Ein Konverter, der auf dem Gerät des Nutzers läuft, kann Ihre Daten nicht monetarisieren, also finanziert er sich durch Einfachheit und Verlässlichkeit. Das Werkzeug bleibt gratis, werbefrei und ohne Anmeldung. Außerdem halten wir die ehrlichen Grenzen sichtbar: Ein gescanntes PDF hat keine Textebene und lässt sich ohne Texterkennung nicht konvertieren — das sagen wir, statt still eine leere Datei zurückzugeben.",
        },
        {
          h: "Für wen das gedacht ist",
          p: "Studierende, die eine Abschlussarbeit formatieren, Buchhalter, die eine Tabelle nach Word übernehmen, Freiberufler, die einem Kunden ein PDF statt einer Tabelle schicken, und jeder, der schon einmal ein Dokument vor dem Mittagessen umwandeln musste. Wenn die Aufgabe lautet, eine Datei von A nach B zu bringen, ohne sie einem Fremden zu geben, ist diese Seite für Sie.",
        },
      ],
    },
    privacy: {
      title: "Datenschutzerklärung",
      intro:
        "Kurz gesagt: Wir erhalten Ihre Dateien nie, also können wir sie weder verlieren noch verkaufen noch versehentlich weitergeben.",
      sections: [
        {
          h: "Dateien bleiben auf Ihrem Gerät",
          p: "Dokumente konvertiert JavaScript-Code, der in Ihrem Browser läuft. Die Datei wird von Ihrer lokalen Festplatte gelesen, im Speicher verarbeitet und wieder auf Ihrem Gerät gespeichert. Sie wird weder an uns noch an Dritte übertragen, und wir haben keinen Server, der sie empfangen könnte.",
        },
        {
          h: "Was auf unseren Servern verarbeitet wird",
          p: "Für gewöhnlich nichts, das Sie identifiziert. Wenn Ihr Hosting-Anbieter Standard-Serverprotokolle führt, enthalten diese technische Daten wie IP-Adresse, Browsertyp und abgerufene URL und fallen unter die Datenschutzerklärung dieses Anbieters.",
        },
        {
          h: "Cookies und lokaler Speicher",
          p: "Wir speichern Ihre Designwahl (hell oder dunkel) und Ihre Sprachwahl im lokalen Speicher Ihres Browsers. Diese Daten bleiben auf Ihrem Gerät, werden nie an uns gesendet und dienen nur dazu, dass die Seite so aussieht, wie Sie sie verlassen haben. Werbe- oder Tracking-Cookies verwenden wir nicht.",
        },
        {
          h: "Drittanbieter-Dienste",
          p: "Ausgehende Links zu anderen Websites sind als solche gekennzeichnet. Sobald Sie einem folgen, gilt die Datenschutzerklärung dieser Seite. Wir binden keine Tracker, Chat-Widgets oder Werbenetzwerke Dritter ein.",
        },
        {
          h: "Kinder",
          p: "Der Dienst ist ein allgemeines Dateitool und richtet sich nicht an Kinder. Wir erheben wissentlich keine personenbezogenen Daten — von niemandem, in keinem Alter.",
        },
        {
          h: "Kontakt",
          p: "Fragen zum Datenschutz senden Sie gern über die Kontaktseite. Da wir keine Nutzerdokumente halten, gibt es keine Daten, die wir exportieren, berichtigen oder löschen müssten — das datenschutzfreundlichste Löschen ist das, das nie stattgefunden hat.",
        },
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      intro:
        "Bedingungen in klarer Sprache. Wenn Sie die Seite normal nutzen, werden Sie nicht darüber stolpern.",
      sections: [
        {
          h: "Der Dienst",
          p: "Dootter konvertiert Dokumente auf Ihrem eigenen Gerät und wird kostenlos, ohne jede Gewährleistung und ohne Zusage der Verfügbarkeit bereitgestellt. Wir können den Dienst jederzeit ändern, aussetzen oder einstellen.",
        },
        {
          h: "Zulässige Nutzung",
          p: "Nutzen Sie den Dienst nur mit Dateien, die Ihnen gehören oder die Sie bearbeiten dürfen, und nur zu rechtmäßigen Zwecken. Verwenden Sie die Seite nicht, um Material ohne Berechtigung umzuwandeln, und versuchen Sie nicht, den Dienst zu stören oder seine Grenzen zu umgehen.",
        },
        {
          h: "Ihre Inhalte",
          p: "Alle Rechte an Ihren Dateien bleiben bei Ihnen. Da die Konvertierung lokal stattfindet, machen wir keine Rechte an Ihren Dokumenten geltend und erhalten keine Kopie.",
        },
        {
          h: "Ohne Gewährleistung",
          p: "Dokumentenformate sind kompliziert, und automatische Konvertierung ist nicht immer perfekt. Bewahren Sie immer die Originaldatei auf und prüfen Sie das Ergebnis, bevor Sie sich in etwas Wichtigem darauf verlassen. Wir haften nicht für Datenverlust, entgangenen Gewinn oder indirekte Schäden.",
        },
        {
          h: "Haftungsbeschränkung",
          p: "Soweit gesetzlich zulässig, ist unsere gesamte Haftung für Ansprüche im Zusammenhang mit dem Dienst auf den höheren Betrag aus dem, was Sie für den Dienst bezahlt haben — also null — und den gesetzlichen Mindestbetrag begrenzt.",
        },
        {
          h: "Änderungen",
          p: "Wir können diese Bedingungen aktualisieren. Maßgeblich ist die auf dieser Seite veröffentlichte Fassung. Weiterer Nutzung nach einer Änderung gilt als Zustimmung zur aktualisierten Fassung.",
        },
      ],
    },
    contact: {
      title: "Kontakt",
      intro:
        "Fehler gefunden, an einer seltsamen Datei gescheitert oder eine Konvertierung gewünscht, die es noch nicht gibt? Sagen Sie Bescheid.",
      sections: [
        {
          h: "Bevor Sie schreiben",
          p: "Am schnellsten löst meist ein anderes File eine fehlgeschlagene Konvertierung: ein gescanntes PDF, ein passwortgeschütztes Dokument oder eine Datei, die in Wahrheit ein umbenanntes .doc ist, können seltsame Ergebnisse liefern. Bleibt das Problem bestehen, möchten wir davon erfahren.",
        },
        {
          h: "Was Sie angeben sollten",
          p: "Beschreiben Sie die Konvertierung, die Sie versucht haben, was Sie erwartet haben und was stattdessen passiert ist. Nennen Sie Browser und Betriebssystem. Bitte hängen Sie das Dokument nicht an — da wir Ihre Dateien nie erhalten, reicht uns eine Beschreibung, und so landen Ihre Daten nicht in einem E-Mail-Verlauf.",
        },
        {
          h: "Konvertierungswünsche",
          p: "Wir sind offen für weitere Richtungen wie PDF zu Excel, Bild zu PDF oder PDF zu reinem Text. Anfragen, die von mehreren Menschen kommen, bauen wir zuerst.",
        },
        {
          h: "Antwortzeit",
          p: "Wir antworten auf Fehlermeldungen in der Regel innerhalb weniger Werktage. Diese Website ist ein kleines unabhängiges Projekt, deshalb kann es am Wochenende dauern.",
        },
      ],
    },
  },
};
