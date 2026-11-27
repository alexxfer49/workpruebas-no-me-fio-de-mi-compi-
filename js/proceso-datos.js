// =====================================================
// proceso-datos.js  ·  DATOS Y REGLAS PURAS (sin DOM, sin red)
// Documentos y pasos de cada visado, calculados a partir de visados-datos.js,
// más las reglas para reconocer cada tipo de documento.
// Lo usan resultado.js y proceso.js. Información orientativa: confirma
// siempre los documentos exactos en la fuente oficial.
//
//   documentosDe(v) / pasosDe(v)      lista de documentos y de pasos de una vía
//   CLAVES_DOC, palabrasDe(texto)     palabras que suelen aparecer en cada documento
//   sinTildes(t), coincidenciasDe()   utilidades de comparación
//   esFotografia(texto)               ¿es el documento "Fotografía reciente"? (sin OCR)
//   REQUISITOS_FOTO                   requisitos de la fotografía tipo carnet
//
// Para añadir documentos a una vía, añade su id a DOCS_EXTRA.
// =====================================================

var DOCS_EXTRA = {
    "cuenta-ajena": ["Resolución de la autorización concedida a la empresa y contrato de trabajo."],
    "temporada": ["Oferta o contrato de trabajo para la campaña.", "Compromiso de volver a Honduras al terminar la campaña."],
    "cuenta-propia": ["Plan de negocio o proyecto que demuestre que la actividad es viable.", "Justificante de medios económicos e inversión prevista.", "Licencias, titulación o colegiación si la actividad las exige."],
    "busqueda-empleo": ["Justificante del supuesto previsto en el que encajas (formación u ocupación).", "Justificante de medios económicos para mantenerte."],
    "tarjeta-azul": ["Título universitario o prueba de experiencia profesional equivalente.", "Contrato u oferta de empleo cualificado con el salario mínimo exigido."],
    "alta-cualificacion": ["Título superior o prueba de experiencia profesional.", "Contrato cualificado y resolución de la autorización pedida por la empresa."],
    "teletrabajo": ["Contrato o relación acreditada con empresas o clientes fuera de España.", "Justificante de ingresos mensuales regulares.", "Título o prueba de experiencia que respalde tu actividad.", "Seguro médico con cobertura en España."],
    "estudios": ["Carta de admisión del centro de estudios en España.", "Justificante de medios económicos.", "Seguro médico con cobertura en España."],
    "familiar": ["Documentos que acrediten el vínculo familiar (matrimonio, nacimiento, etc.).", "Documentos de tu familiar en España (DNI, NIE o pasaporte)."],
    "arraigo-sociolaboral": ["Documentos que acrediten tus 2 años seguidos en España.", "Contrato de trabajo."],
    "arraigo-social": ["Documentos que acrediten tus 2 años seguidos en España.", "Informe de integración social.", "Justificante de medios económicos."],
    "arraigo-socioformativo": ["Documentos que acrediten tus 2 años seguidos en España.", "Matrícula o plaza en formación reglada o en un curso del SEPE.", "Informe de integración social."]
};

function desdeConsulado(v) { return v.desde.indexOf("honduras") !== -1; }
function desdeEspana(v) {
    return v.desde.some(function (d) { return d.indexOf("espana") === 0; });
}

// Lista de documentos de una vía
function documentosDe(v) {
    var docs = [
        "Pasaporte en vigor.",
        "Impreso de solicitud oficial (visado nacional o modelo de residencia, según el trámite).",
        "Certificado de antecedentes penales de Honduras (apostillado o legalizado)."
    ];
    if (desdeConsulado(v) && !desdeEspana(v)) { docs.push("Certificado médico."); }
    if (desdeEspana(v) && !desdeConsulado(v)) { docs.push("Certificado de empadronamiento que acredite tu tiempo en España."); }
    (DOCS_EXTRA[v.id] || []).forEach(function (d) { docs.push(d); });
    docs.push("Fotografía reciente.");
    return docs;
}

// Pasos del trámite de una vía
function pasosDe(v) {
    var pasos = [
        "Comprueba en la fuente oficial que cumples los requisitos actuales.",
        "Reúne los documentos de la lista y legaliza o apostilla los que vengan de Honduras."
    ];
    if (desdeConsulado(v) && desdeEspana(v)) {
        pasos.push("Presenta la solicitud en España o pide el visado en el consulado, según tu situación.");
    } else if (desdeConsulado(v)) {
        if (v.oferta === "si") { pasos.push("La empresa presenta la solicitud de autorización en España y te comunica la resolución."); }
        pasos.push("Pide cita y presenta el visado en el consulado de España que te corresponda.");
        pasos.push("Recoge el visado y viaja a España dentro del plazo indicado.");
    } else {
        pasos.push("Presenta la solicitud en la Oficina de Extranjería o por la sede electrónica.");
    }
    pasos.push("Pide cita para tomar huellas y solicita tu TIE (Tarjeta de Identidad de Extranjero), si corresponde.");
    return pasos;
}

// ---------- Reconocimiento orientativo de cada documento ----------
// Palabras que suelen aparecer en cada tipo de documento (sin tildes, en minúsculas).
// El primer elemento es una expresión que se prueba contra el texto del documento
// (ya sin tildes y en minúsculas, ver documentosDe).
var CLAVES_DOC = [
    [/pasaporte/, ["pasaporte", "passport", "honduras", "republica", "apellidos", "surname"]],
    [/antecedentes/, ["antecedentes", "penales", "policia", "apostilla", "certifica", "registro"]],
    [/medico/, ["medico", "salud", "sanitario", "certifica", "paciente"]],
    [/contrato|oferta/, ["contrato", "trabajo", "empresa", "salario", "cláusula", "clausula"]],
    [/seguro/, ["seguro", "poliza", "cobertura", "asegurado"]],
    [/titulo|titulacion|formacion|estudios/, ["titulo", "universidad", "grado", "diploma", "certificado"]],
    [/solicitud|impreso|formulario/, ["solicitud", "visado", "nacional", "formulario", "apellidos"]],
    [/ingresos|medios econ/, ["ingresos", "banco", "saldo", "nomina", "euros", "cuenta"]],
    [/resolucion|autorizacion/, ["autorizacion", "resolucion", "residencia", "trabajo", "extranjeria"]],
    [/plan de negocio|proyecto/, ["plan", "negocio", "proyecto", "inversion", "viabilidad"]],
    [/licencia|colegiacion/, ["licencia", "colegiado", "colegio", "habilita"]]
];

function sinTildes(t) {
    return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Palabras clave esperadas para un documento (lista vacía si no hay reglas para él)
function palabrasDe(documento) {
    var d = sinTildes(documento);
    for (var i = 0; i < CLAVES_DOC.length; i++) {
        if (CLAVES_DOC[i][0].test(d)) {
            return CLAVES_DOC[i][1].map(sinTildes);
        }
    }
    return [];
}

// Reparte las palabras esperadas en { halladas: [...], faltan: [...] } según el texto leído
function coincidenciasDe(texto, palabras) {
    var limpio = sinTildes(texto || "");
    var halladas = [], faltan = [];
    palabras.forEach(function (w) {
        if (limpio.indexOf(w) !== -1) { halladas.push(w); } else { faltan.push(w); }
    });
    return { halladas: halladas, faltan: faltan };
}

// La fotografía se sube y se guarda, pero NO se lee con OCR (no tiene texto que leer)
function esFotografia(documento) {
    return /fotograf/.test(sinTildes(documento));
}

// ---------- Fotografía tipo carnet ----------
// Criterios comunes en las hojas de requisitos de los consulados de España.
// OJO: el TAMAÑO exacto lo fija cada consulado (por ejemplo 3x4 cm, 40x40 mm,
// "tamaño pasaporte" o norma ICAO), por eso no se da una medida única:
// hay que confirmarlo en la hoja de requisitos del consulado que te corresponda.
var REQUISITOS_FOTO = {
    cumple: [
        "Reciente (hecha en los últimos meses) y en color.",
        "Fondo blanco, liso y sin sombras.",
        "Rostro de frente, descubierto y con expresión neutra.",
        "Bien enfocada, con luz uniforme y sin reflejos.",
        "Sin retoques digitales ni filtros."
    ],
    evita: [
        "Gafas con reflejos, gafas de sol, gorra, sombrero o pañuelo que tape la cara.",
        "Fotos de pantalla, selfis de lejos o fotos con otras personas.",
        "Fondos con muebles, paredes de color o sombras detrás de ti.",
        "Fotos antiguas, en blanco y negro o recortadas de otro documento."
    ],
    comprobar: [
        "Fondo blanco y liso",
        "Rostro de frente y descubierto",
        "Sin gafas con reflejos ni gorro",
        "Foto nítida y sin sombras",
        "Hecha hace poco y en color",
        "Sin retoques ni filtros"
    ],
    tamano: "El tamaño exacto lo fija cada consulado (según el consulado se piden, por ejemplo, 3×4 cm, 40×40 mm o tamaño pasaporte). Confírmalo en la hoja de requisitos del consulado de España que te corresponda y haz la foto impresa con esa medida. La foto que subes aquí es solo una copia de control: no sustituye a la impresa que se entrega."
};
