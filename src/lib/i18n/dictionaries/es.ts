import type { Dictionary } from "../types";

export const es: Dictionary = {
  locale: "es",
  htmlLang: "es",
  brand: "Dootter",
  brandTag: "Conversor de documentos gratis",
  meta: {
    converterTitle: "{title}: gratis, sin subir archivos y sin marca de agua | {brand}",
    legalTitle: "{title} | {brand}",
  },

  nav: {
    home: "Inicio",
    converters: "Conversores",
    how: "Cómo funciona",
    faq: "Preguntas",
    about: "Nosotros",
    privacy: "Privacidad",
    terms: "Condiciones",
    contact: "Contacto",
    menu: "Menú",
    close: "Cerrar",
  },

  hero: {
    eyebrow: "100% privado: la conversión ocurre en tu navegador",
    title: "Convierte PDF y archivos de Office en segundos",
    subtitle:
      "PDF a Word, Word a PDF, Excel a Word y Word a Excel. Sin subidas, sin colas, sin marcas de agua. Tus archivos nunca salen de tu dispositivo.",
    ctaPrimary: "Elegir un conversor",
    ctaSecondary: "Cómo funciona",
    badge1: "Sin registro",
    badge2: "Sin límite de tamaño",
    badge3: "Gratis siempre",
  },

  trust: {
    title: "Por qué la gente cambia a este conversor",
    items: [
      {
        h: "Los archivos se quedan en tu dispositivo",
        p: "Cada conversión se ejecuta dentro de tu navegador. No se sube nada, así que contratos, facturas y documentos personales nunca tocan un servidor.",
      },
      {
        h: "Resultado editable, no una copia plana",
        p: "Word a PDF mantiene texto real y seleccionable. Excel a Word genera una tabla de Word auténtica con encabezado que se repite en cada página.",
      },
      {
        h: "Funciona cuando otros sitios están caídos",
        p: "Sin cuenta, sin correo, sin muro de pago. Abres la página, conviertes, descargas. La herramienta sigue funcionando incluso con una conexión lenta.",
      },
      {
        h: "Sin marca de agua ni límite de páginas",
        p: "Muchos conversores gratuitos añaden marca de agua o limitan a tres páginas. Nosotros no: no hay límite de páginas.",
      },
    ],
  },

  convertersSection: {
    title: "Cuatro conversores en una página",
    subtitle: "Elige la dirección que necesitas. Cada herramienta está ajustada a ese par de formatos.",
    open: "Abrir conversor",
  },

  stepsSection: {
    title: "Cómo funciona",
    subtitle: "Tres pasos, sin cuenta y sin esperas.",
    steps: [
      {
        h: "1. Suelta tu archivo",
        p: "Arrastra un archivo PDF, Word o Excel al conversor, o selecciónalo desde tu ordenador o móvil.",
      },
      {
        h: "2. Conversión local",
        p: "Tu navegador lee el archivo y lo reconstruye en el nuevo formato. Tarda segundos, no minutos.",
      },
      {
        h: "3. Descarga el resultado",
        p: "Guarda el archivo terminado y ábrelo en Word, Excel, Google Docs o cualquier otro editor.",
      },
    ],
  },

  faqSection: {
    title: "Las preguntas que más se hacen",
    subtitle: "Respuestas cortas sobre privacidad, calidad y límites.",
  },

  ctaSection: {
    title: "Cuando quieras",
    subtitle: "No hace falta cuenta. No se sube nada. Solo convierte.",
    button: "Empezar a convertir",
  },

  homeFaq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Se sube mi archivo a un servidor?",
        a: "No. Los motores de conversión son librerías de JavaScript que se ejecutan en la pestaña de tu navegador. El archivo se lee de tu disco, se convierte en memoria y te se devuelve como descarga. Nunca sale de tu dispositivo, y por eso podemos ofrecer el servicio sin límites y sin cuenta.",
      },
      {
        q: "¿Se conserva exactamente el diseño?",
        a: "En Word a PDF y Excel a Word, sí: reconstruimos estructuras reales, con texto real, tablas reales, encabezados que se repiten y saltos de página automáticos. En PDF a Word depende del origen: los PDF con capa de texto convierten con mucha fidelidad, mientras que los PDF escaneados (imágenes de página) no contienen texto y necesitan reconocimiento óptico, algo que señalamos en lugar de devolver en silencio un archivo vacío.",
      },
      {
        q: "¿Qué tamaño de archivo puedo convertir?",
        a: "No hay límite del servidor porque no hay servidor. El límite es la memoria libre de tu dispositivo; en la práctica, archivos de varios cientos de megabytes se convierten sin problema en un portátil o móvil moderno.",
      },
      {
        q: "¿El archivo tendrá marca de agua o publicidad?",
        a: "No. El archivo que descargas está limpio: sin marca de agua, sin límite de páginas, sin texto publicitario y sin registro obligatorio.",
      },
      {
        q: "¿Guardáis una copia de mis documentos?",
        a: "No hay nada que guardar. El archivo se procesa en la memoria del navegador y se descarta en cuanto cierras o recargas la página. No podríamos acceder a él ni aunque quisiéramos.",
      },
      {
        q: "¿Puedo convertir un archivo protegido con contraseña?",
        a: "Un PDF cifrado o un Word con contraseña debe desbloquearse primero, porque el contenido no se puede leer mientras está cifrado. Quita la contraseña en el programa original y deja el archivo aquí.",
      },
      {
        q: "¿Funciona sin conexión?",
        a: "Sí, una vez cargada la página. La conversión no necesita red, así que puedes trabajar en un avión o donde no haya cobertura.",
      },
      {
        q: "¿En qué idiomas está la interfaz?",
        a: "Inglés, ruso, español, alemán y francés. El sitio recuerda el idioma que elegiste y el contenido de los archivos nunca se traduce ni se modifica.",
      },
    ],
  },

  converters: {
    pdfToWord: {
      id: "pdfToWord",
      slug: "pdf-to-word",
      title: "Conversor de PDF a Word",
      short: "Convierte un PDF en un .docx editable con párrafos, títulos y tablas reales.",
      long:
        "Este conversor de PDF a Word reconstruye tu documento como un archivo de Word real y editable. Los títulos siguen siendo títulos, los párrafos siguen siendo párrafos y las tablas se recuperan como tablas de Word auténticas con bordes, no como imágenes de tablas. El texto sigue siendo seleccionable y buscable, así que puedes editar, copiar y reutilizar cada línea. La conversión ocurre por completo dentro de tu navegador, por lo que el documento nunca se sube a ninguna parte.",
      dropzoneTitle: "Suelta aquí tu PDF",
      dropzoneHint: "o haz clic para elegir un archivo: .pdf de cualquier tamaño",
      convertButton: "Convertir a Word",
      sourceExt: "PDF",
      targetExt: "DOCX",
      howTitle: "Cómo convertir PDF a Word",
      howSteps: [
        "Abre el conversor de PDF a Word en esta página.",
        "Suelta tu archivo .pdf en la zona de carga, o haz clic para buscarlo.",
        "Espera unos segundos mientras tu navegador convierte las páginas localmente.",
        "Descarga el .docx resultante y ábrelo en Word, Google Docs o LibreOffice.",
      ],
      whyTitle: "Lo que obtienes",
      whyItems: [
        "Un archivo .docx editable, no una imagen dentro de un documento",
        "Títulos, listas y párrafos detectados a partir del diseño de la página",
        "Tablas recuperadas como tablas nativas de Word con bordes y celdas combinadas",
        "Texto seleccionable y buscable, ideal para reutilizar tu propio contenido",
        "Todo se procesa en tu dispositivo, no se sube nada",
      ],
      faqTitle: "Preguntas sobre PDF a Word",
      faq: [
        {
          q: "¿Por qué mi PDF escaneado sale vacío?",
          a: "Un escaneo es una imagen de la página, así que el archivo no contiene texto seleccionable que el conversor pueda leer. Cuando lo detectamos lo decimos explícitamente en lugar de devolver un archivo roto. Pasa primero el PDF por un OCR o escribe el documento directamente en Word.",
        },
        {
          q: "¿Qué precisión tiene el diseño?",
          a: "Para PDF generados a partir de Word o Excel el resultado es muy parecido: los mismos párrafos, el mismo orden de lectura, las mismas tablas. Para diseños exóticos —desplegues de revista, folletos a varias columnas, formularios con cuadros de texto flotantes— puede hacer falta algún retoque manual.",
        },
        {
          q: "¿Se conservan las imágenes del PDF?",
          a: "La prioridad son el texto y la estructura. Las imágenes incrustadas se mantienen donde están en el flujo de texto, mientras que los gráficos puramente decorativos y los fondos pueden omitirse.",
        },
        {
          q: "¿Puedo convertir varios PDF a la vez?",
          a: "Si quieres un único documento continuo, únelos primero en un solo PDF y convierte después el resultado.",
        },
      ],
      keywords: [
        "pdf a word",
        "convertir pdf a docx",
        "pdf a word online gratis",
        "convertir pdf a word editable",
        "pdf a docx sin subir archivos",
        "convertir pdf a word",
      ],
    },

    wordToPdf: {
      id: "wordToPdf",
      slug: "word-to-pdf",
      title: "Conversor de Word a PDF",
      short: "Guarda cualquier .doc o .docx como un PDF limpio que se ve igual en cualquier dispositivo.",
      long:
        "Convierte un documento de Word a PDF sin perder lo importante. Los títulos conservan su tamaño, los párrafos su espaciado, las imágenes siguen nítidas y cada tabla se redibuja como una tabla PDF auténtica con su encabezado repetido en cada página nueva. El texto del PDF es texto real y seleccionable, así que sigue siendo buscable y copiable. Nada se sube: el documento se convierte dentro de tu navegador.",
      dropzoneTitle: "Suelta aquí tu archivo de Word",
      dropzoneHint: "o haz clic para elegir un archivo: .docx o .doc",
      convertButton: "Convertir a PDF",
      sourceExt: "DOCX",
      targetExt: "PDF",
      howTitle: "Cómo convertir Word a PDF",
      howSteps: [
        "Abre el conversor de Word a PDF en esta página.",
        "Suelta tu archivo .docx o .doc en la zona de carga.",
        "Tu navegador lo reconstruye como un PDF paginado con texto real.",
        "Descarga el PDF y envíaselo a quien quieras: se abre igual en todas partes.",
      ],
      whyTitle: "Lo que obtienes",
      whyItems: [
        "Texto real y seleccionable en el PDF, no una captura de la página",
        "Saltos de página automáticos: nada se corta en el borde",
        "Encabezados de tabla repetidos cuando una tabla ocupa varias páginas",
        "Imágenes y formato básico conservados",
        "Cirílico, griego y otros alfabetos se muestran correctamente",
      ],
      faqTitle: "Preguntas sobre Word a PDF",
      faq: [
        {
          q: "¿Por que aquí el texto se puede seleccionar y en otros sitios no?",
          a: "Otros conversores imprimen tu documento como imagen y envuelven esa imagen en un PDF, por eso su resultado no se puede buscar ni copiar. Nosotros construimos el texto como texto, de modo que el PDF pesa menos, se ve nítido al ampliar y lo usan bien los lectores de pantalla.",
        },
        {
          q: "¿Cómo se deciden los saltos de página?",
          a: "Componemos el documento como lo hace Word: márgenes superior e inferior, altura de línea según el espaciado original y una página nueva cuando la línea siguiente cruzaría el margen inferior. Si una tabla no cabe en el espacio restante pasa a la página siguiente repitiendo su encabezado.",
        },
        {
          q: "¿Qué pasa con una tabla muy ancha?",
          a: "Las tablas anchas se reducen al ancho imprimible de la página y, si aún no basta, la página cambia a orientación apaisada. Si la tabla de verdad no cabe en una página, se añade una nota indicando que la tabla es demasiado grande.",
        },
        {
          q: "¿Puedo unir varios documentos en un PDF?",
          a: "Conviértelos uno a uno y fusiona después los PDF, o coloca antes todos los documentos en un único archivo de Word si quieres un resultado continuo.",
        },
      ],
      keywords: [
        "word a pdf",
        "docx a pdf",
        "convertir word a pdf online",
        "word a pdf gratis",
        "convertir doc a pdf sin subirlo",
        "docx a pdf con texto seleccionable",
      ],
    },

    excelToWord: {
      id: "excelToWord",
      slug: "excel-to-word",
      title: "Conversor de Excel a Word",
      short: "Convierte una hoja de cálculo en una tabla de Word de verdad, que se comporta como tabla.",
      long:
        "Este conversor de Excel a Word no pega tu hoja como texto plano ni como imagen. Crea una tabla de Word auténtica: celdas, bordes, alineación, fila de encabezado en negrita y anchos de columna medidos a partir de tus datos. El encabezado se repite automáticamente en cada página y, cuando la tabla es demasiado grande para caber, se divide entre páginas en lugar de cortarse por la mitad. Si una tabla no se puede ajustar, el documento lo dice explícitamente en lugar de esconder el problema.",
      dropzoneTitle: "Suelta aquí tu archivo de Excel",
      dropzoneHint: "o haz clic para elegir un archivo: .xlsx, .xls o .csv",
      convertButton: "Convertir a Word",
      sourceExt: "XLSX",
      targetExt: "DOCX",
      howTitle: "Cómo convertir Excel a Word",
      howSteps: [
        "Abre el conversor de Excel a Word en esta página.",
        "Suelta tu archivo .xlsx, .xls o .csv en la zona de carga.",
        "Elige vertical u horizontal si tu hoja es ancha.",
        "Descarga el .docx: si la tabla es grande se dividirá en varias páginas con el encabezado repetido.",
      ],
      whyTitle: "Lo que obtienes",
      whyItems: [
        "Una tabla nativa de Word, no texto ni una captura",
        "Fila de encabezado en negrita que se repite en cada página",
        "Anchos de columna calculados a partir del contenido real de las celdas",
        "Página vertical o apaisada, para que las hojas anchas sigan siendo legibles",
        "Una nota clara en el documento cuando una tabla es demasiado grande",
      ],
      faqTitle: "Preguntas sobre Excel a Word",
      faq: [
        {
          q: "¿Qué pasa si mi tabla no cabe en una página?",
          a: "Primero intentamos ajustarla: los anchos de columna se reducen al ancho imprimible y la página puede pasar a apaisada. Si la tabla sigue siendo más alta que la página, Word la divide por sí mismo y repite el encabezado en cada parte. La nota de tabla demasiado grande aparece solo cuando la tabla no se puede ajustar de ningún modo, por ejemplo con decenas de columnas. Así ves la situación en el documento en lugar de un truncamiento silencioso.",
        },
        {
          q: "¿Se conservan las fórmulas y el formato?",
          a: "Las fórmulas se sustituyen por sus valores calculados, que suele ser lo que quieres en un documento. Se trasladan los formatos numéricos, negrita, cursiva, colores, celdas combinadas y alineación.",
        },
        {
          q: "¿Puedo convertir una sola hoja?",
          a: "Por defecto se convierten todas las hojas, cada una en su página con su nombre como título. Borra o vacía las hojas que no necesites antes de convertir.",
        },
        {
          q: "¿Y las hojas muy largas?",
          a: "Se dividen en tantas páginas como haga falta, repitiendo el encabezado, así que una hoja de 5000 filas sigue siendo legible e imprimible.",
        },
      ],
      keywords: [
        "excel a word",
        "xlsx a docx",
        "excel a word tabla",
        "convertir excel a word online",
        "hoja de calculo a word",
        "excel a docx con encabezado repetido",
      ],
    },

    wordToExcel: {
      id: "wordToExcel",
      slug: "word-to-excel",
      title: "Conversor de Word a Excel",
      short: "Lleva cada tabla de Word a una hoja de cálculo limpia con números y fechas reales.",
      long:
        "Convierte las tablas de un documento de Word en un libro de Excel de verdad. Cada tabla se convierte en su propia hoja, la primera fila se detecta como encabezado, las celdas combinadas se expanden y los valores que parecen números, porcentajes, monedas o fechas se escriben como valores reales de Excel y no como texto. Se trasladan el formato, los encabezados en negrita, la alineación y el ancho de celda, así que el resultado se abre en Excel y Google Sheets listo para calcular.",
      dropzoneTitle: "Suelta aquí tu archivo de Word",
      dropzoneHint: "o haz clic para elegir un archivo: .docx o .doc",
      convertButton: "Convertir a Excel",
      sourceExt: "DOCX",
      targetExt: "XLSX",
      howTitle: "Cómo convertir Word a Excel",
      howSteps: [
        "Abre el conversor de Word a Excel en esta página.",
        "Suelta tu archivo .docx o .doc en la zona de carga.",
        "Cada tabla del documento se convierte en una hoja separada del libro.",
        "Descarga el .xlsx y ábrelo en Excel, Numbers o Google Sheets.",
      ],
      whyTitle: "Lo que obtienes",
      whyItems: [
        "Una hoja por cada tabla de Word, con nombre reconocible",
        "La primera fila se detecta como encabezado y queda fija en la hoja",
        "Números, porcentajes, monedas y fechas se guardan como valores reales",
        "Celdas combinadas expandidas, filas vacías y párrafos sueltos eliminados",
        "Anchos de columna ajustados al contenido para ver los datos de un vistazo",
      ],
      faqTitle: "Preguntas sobre Word a Excel",
      faq: [
        {
          q: "¿Cómo se reconocen los números?",
          a: "El texto de la celda se interpreta según el formato local: 1.234,56, 12 %, -45 €, 1 234,56 y fechas como 12.03.2026 se convierten en celdas numéricas o de fecha, mientras que lo ambiguo se mantiene como texto para que nunca pierdas información por una suposición equivocada.",
        },
        {
          q: "Mi tabla de Word tiene celdas combinadas. ¿Es un problema?",
          a: "No. Las combinaciones horizontales se convierten en el valor repetido en cada fila afectada y las verticales se rellenan hacia abajo, de modo que todas las filas mantienen la misma longitud y los datos sirven para fórmulas y para ordenar.",
        },
        {
          q: "¿Qué pasa con el texto que está fuera de las tablas?",
          a: "Los títulos y párrafos se añaden en una hoja de notas para que no se pierda contenido en silencio. Si el documento no tiene ninguna tabla, la herramienta lo dice en lugar de entregarte un libro vacío.",
        },
        {
          q: "¿Se conserva el estilo original?",
          a: "Encabezados en negrita, bordes, alineación y ancho de celda se reproducen de forma aproximada, así que la hoja resulta familiar. Excel no puede copiar el estilo de Word uno a uno, por lo que las fuentes se normalizan a las de la hoja de cálculo.",
        },
      ],
      keywords: [
        "word a excel",
        "docx a xlsx",
        "tabla de word a excel",
        "convertir word a excel online",
        "word a excel con tablas",
        "convertir tabla word a hoja de calculo",
      ],
    },
  },

  ui: {
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    language: "Idioma",
    switchToDark: "Cambiar al tema oscuro",
    switchToLight: "Cambiar al tema claro",
    drop: "Suelta un archivo aquí",
    browse: "buscar",
    remove: "Quitar",
    convert: "Convertir",
    converting: "Convirtiendo",
    print: "Imprimir",
    download: "Descargar",
    downloadAgain: "Descargar de nuevo",
    convertingFile: "Convirtiendo",
    startOver: "Convertir otro archivo",
    errorTitle: "Algo ha salido mal",
    unsupportedFile: "Esta herramienta solo acepta archivos {ext}.",
    tooLarge: "Este archivo es demasiado grande para la memoria del dispositivo. Prueba con uno más pequeño.",
    emptyFile: "El archivo parece vacío, no hay nada que convertir.",
    encryptedPdf: "El archivo está protegido con contraseña. Quítala e inténtalo de nuevo.",
    scannedPdf: "PDF escaneado detectado",
    scannedPdfHint:
      "Las páginas son imágenes, así que no hay capa de texto que convertir. Pasa el archivo por un OCR y convierte el resultado.",
    noTextPdf: "No se ha encontrado texto seleccionable en este PDF.",
    noTables: "No se han encontrado tablas en el documento, el libro quedaría vacío.",
    tooLargeNotice: "El diseño era más ancho que la página, así que se redujo para que cupiera.",
    tableTooLargeNotice: "Esta tabla tiene {n} columnas y no cabe en una sola página.",
    tableWillSplit: "La tabla continúa en {n} página(s) más, con la fila de encabezado repetida.",
    resultReady: "Tu archivo está listo",
    resultSize: "Tamaño",
    processingLocally: "Procesado en tu dispositivo",
    privacyNote: "Tu archivo se procesa en esta pestaña del navegador y nunca se sube.",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    optional: "opcional",
    orientation: "Orientación de la página",
    orientationAuto: "Automática",
    orientationPortrait: "Vertical",
    orientationLandscape: "Horizontal",
    sheetsIncluded: "{n} hoja(s) incluida(s)",
    from: "De",
    to: "A",
  },

  footer: {
    blurb: "Un conversor de documentos gratuito y privado. Los archivos se procesan en tu navegador y nunca se suben.",
    product: "Producto",
    company: "Proyecto",
    legal: "Legal",
    rights: "Todos los derechos reservados.",
    madeWith: "Hecho para quien solo necesita que el archivo funcione.",
  },
  ads: {
    label: "Publicidad",
  },
  stats: {
    visitors: "visitantes en total",
    conversions: "conversiones realizadas",
  },

  pages: {
    about: {
      title: "Sobre Dootter",
      intro:
        "Dootter es un conversor de documentos que hace una sola cosa y se niega a hacer algo dudoso con tus archivos.",
      sections: [
        {
          h: "Por qué lo creamos",
          p: "Los conversores gratuitos suelen funcionar igual: subes un archivo, esperas una cola y descargas algo con marca de agua en la tercera página. Algunos además guardan una copia de tu documento, lo cual es un problema real cuando el documento es un contrato, un informe médico o una declaración de impuestos.",
        },
        {
          h: "En qué se diferencia el nuestro",
          p: "Enviamos los motores de conversión a tu navegador en lugar de ejecutarlos en un servidor. Las mismas bibliotecas que construyen el archivo se descargan en tu dispositivo, leen el archivo localmente y producen el resultado en memoria. Esa única decisión elimina el tiempo de subida, elimina la cola, elimina el límite de tamaño y convierte la privacidad en una propiedad de la arquitectura y no en una promesa de la política de privacidad.",
        },
        {
          h: "Lo que eso nos cuesta",
          p: "Un conversor que se ejecuta en el dispositivo del usuario no puede monetizar tus datos, así que se financia con la publicidad de la página, siendo sencillo y fiable. Mantenemos la herramienta gratuita y sin registro. También dejamos visibles los límites honestos: un PDF escaneado no tiene capa de texto y no se puede convertir sin OCR, y lo decimos en lugar de devolver calladamente un archivo vacío.",
        },
        {
          h: "Para quién es",
          p: "Estudiantes maquetando un trabajo de fin de carrera, contables que llevan una tabla a Word, autónomos que envían un PDF en lugar de una hoja de cálculo, y cualquiera que alguna vez haya necesitado convertir un documento antes de comer. Si la tarea es pasar un archivo de A a B sin entregárselo a un desconocido, este sitio es para ti.",
        },
      ],
    },
    privacy: {
      title: "Política de privacidad",
      intro:
        "En corto: nunca recibimos tus archivos, así que no podemos perderlos, venderlos ni filtrarlos.",
      sections: [
        {
          h: "Los archivos se quedan en tu dispositivo",
          p: "Los documentos los convierte código JavaScript que se ejecuta en tu navegador. El archivo se lee de tu disco local, se procesa en memoria y se guarda de nuevo en tu dispositivo. Nunca se transmite a nosotros ni a terceros, y no tenemos servidor que pudiera recibirlo.",
        },
        {
          h: "Qué se procesa en nuestros servidores",
          p: "Normalmente nada que te identifique. Si tu proveedor de alojamiento guarda registros estándar del servidor, esos registros contienen datos técnicos como dirección IP, tipo de navegador y URL solicitada, y se rigen por la política del propio proveedor.",
        },
        {
          h: "Cookies y almacenamiento local",
          p: "Guardamos tu elección de tema (claro u oscuro) y de idioma en el almacenamiento local del navegador. Son datos locales de tu dispositivo, nunca se envían a nosotros y sirven solo para que el sitio se vea como lo dejaste.",
        },
        {
          h: "Contadores de visitas y conversiones",
          p: "Las páginas muestran cuántos visitantes ha tenido el sitio en total y cuántas conversiones se han completado. Son solo cifras agregadas. Para no contar varias veces a la misma persona, un visitante se identifica mediante un hash de la dirección de la solicitud y del tipo de navegador; ese hash se combina con una clave que cambia cada día y el resultado se descarta a los dos días. La dirección en sí no se guarda, no se usan cookies y los contadores no permiten identificar a ninguna persona concreta. Usamos estos totales únicamente para saber si el sitio resulta útil.",
        },
        {
          h: "Publicidad",
          p: "Las páginas llevan publicidad. La red publicitaria que la sirve puede usar cookies o tecnologías similares para medir cuántas veces se mostró un anuncio y si se hizo clic. Lo hace en su propio nombre y según su propia política, y nunca recibe los documentos que conviertes. Tu archivo se lee y se procesa dentro del navegador, así que la red publicitaria no tiene acceso a él y el sitio no lo sube a ningún sitio.",
        },
        {
          h: "Servicios de terceros",
          p: "Los enlaces salientes a otras webs están señalizados. Una vez sigues uno, se aplica la política de privacidad de ese sitio. No incrustamos widgets de chat ni rastreadores de analítica de terceros.",
        },
        {
          h: "Menores",
          p: "El servicio es una herramienta de uso general para archivos y no va dirigida a menores. No recopilamos conscientemente información personal de nadie, de ninguna edad.",
        },
        {
          h: "Contacto",
          p: "Las dudas sobre privacidad pueden enviarse por la página de contacto. Como no tenemos documentos de usuarios, no hay datos que exportar, corregir ni borrar: el borrado más respetuoso es el que nunca llegó a existir.",
        },
      ],
    },
    terms: {
      title: "Condiciones de uso",
      intro:
        "Condiciones en lenguaje claro. Si usas el sitio con normalidad, no te chocarás con ninguna.",
      sections: [
        {
          h: "El servicio",
          p: "Dootter convierte documentos en tu propio dispositivo y se ofrece de forma gratuita, sin garantía de ningún tipo y sin compromiso de disponibilidad. Podemos cambiar, suspender o discontinuation el servicio en cualquier momento.",
        },
        {
          h: "Uso aceptable",
          p: "Usa el servicio solo con archivos que te pertenezcan o que estés autorizado a procesar, y solo con fines lícitos. No lo uses para convertir material sobre el que no tienes derechos, ni intentes alterar el servicio o eludir sus límites.",
        },
        {
          h: "Tu contenido",
          p: "Conservas todos los derechos que tenías sobre tus archivos. Como la conversión ocurre localmente, no reclamamos derechos sobre tus documentos y no recibimos copia alguna.",
        },
        {
          h: "Sin garantía",
          p: "Los formatos de documento son complejos y la conversión automática no siempre es perfecta. Guarda siempre el original y revisa el resultado antes de confiar en él para algo importante. No respondemos por pérdida de datos, lucro cesante ni ningún daño indirecto derivado del uso del servicio.",
        },
        {
          h: "Limitación de responsabilidad",
          p: "En la máxima medida permitida por la ley, nuestra responsabilidad total por cualquier reclamación relacionada con el servicio se limita a la mayor entre lo que has pagado por el servicio —que es cero— y el mínimo exigido por la ley.",
        },
        {
          h: "Cambios",
          p: "Podemos actualizar estas condiciones. La versión publicada en esta página es la aplicable. Seguir usando el servicio tras un cambio significa que aceptas las condiciones actualizadas.",
        },
      ],
    },
    contact: {
      title: "Contacto",
      intro:
        "¿Has encontrado un error, has topado con un archivo raro o necesitas una conversión que aún no tenemos? Cuéntanos.",
      sections: [
        {
          h: "Antes de escribir",
          p: "Lo que más a menudo resuelve una conversión fallida es usar otro archivo: un PDF escaneado, un documento protegido o un archivo que en realidad es un .doc renombrado pueden dar resultados raros. Si el problema continúa, queremos saberlo.",
        },
        {
          h: "Qué incluir",
          p: "Describe la conversión que intentabas, qué esperabas y qué ocurrió en su lugar. Indica tu navegador y sistema operativo. Por favor no adjuntes el documento: como nunca recibimos tus archivos, con la descripción nos basta, y así tus datos no acaban en un hilo de correo.",
        },
        {
          h: "Peticiones de conversión",
          p: "Estamos abiertos a añadir direcciones como PDF a Excel, imagen a PDF o PDF a texto plano. Las peticiones que llegan de varias personas se construyen primero.",
        },
        {
          h: "Plazo de respuesta",
          p: "Intentamos responder a los informes de error en pocos días laborables. Esta web es un proyecto independiente y pequeño, así que los fines de semana puede tardar más.",
        },
      ],
    },
  },
};
