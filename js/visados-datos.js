// =====================================================
// visados-datos.js
// Información de los visados de trabajo de cada país y cálculo
// del visado más recomendado. Lo usan resultado.js y visados.js.
// IMPORTANTE: es información orientativa (revisada en noviembre de 2026).
// Las normas cambian a menudo: hay que confirmarlas en la fuente oficial.
// =====================================================

var NOMBRES_ESTUDIOS = {
    eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)",
    gs: "Grado Superior (FP)", universidad: "Universidad"
};
var NIVEL_ESTUDIOS = { eso: 0, bachillerato: 1, gm: 2, gs: 3, universidad: 4 };
var NIVEL_INGLES = { a1: 0, a2: 1, b1: 2, b2: 3, c1: 4, c2: 5 };

// Para cada visado: minEstudios, tiempos (duraciones a las que encaja),
// remoto (true si es para teletrabajo) y minIngles (opcional).
var INFO_PAISES = {
    alemania: {
        nombre: "Alemania", ue: true, fuente: "https://www.make-it-in-germany.com",
        visados: [
            { id: "chancenkarte", nombre: "Chancenkarte (tarjeta de oportunidades)", tipo: "Búsqueda de empleo",
              resumen: "Permiso de residencia de hasta 12 meses para buscar trabajo en Alemania sin tener oferta previa.",
              paraQuien: "Profesionales con título universitario o de FP reconocido, o con puntos suficientes en el sistema de puntos.",
              requisitos: ["Título reconocido, o puntos suficientes (idioma, experiencia, edad, vínculos con Alemania)", "Medios económicos para vivir durante la estancia", "Seguro médico"],
              duracion: "Hasta 12 meses; no se puede ampliar, pero se puede cambiar a otro permiso si encuentras trabajo.",
              minEstudios: "gm", tiempos: ["meses", "1-2"] },
            { id: "trabajador-cualificado", nombre: "Visado de trabajador cualificado", tipo: "Con oferta de empleo",
              resumen: "Para trabajar en Alemania con contrato, en una profesión para la que tu cualificación esté reconocida.",
              paraQuien: "Personas con FP o título universitario reconocido en Alemania y una oferta de empleo.",
              requisitos: ["Oferta de empleo o contrato", "Título reconocido en Alemania", "Solicitud del visado en el consulado"],
              duracion: "Residencia temporal renovable, con camino a la residencia permanente.",
              minEstudios: "gm", tiempos: ["1-2", "siempre"] },
            { id: "tarjeta-azul", nombre: "Tarjeta Azul UE", tipo: "Perfil universitario",
              resumen: "Permiso para titulados universitarios con un empleo cualificado y un salario mínimo.",
              paraQuien: "Titulados universitarios con oferta de empleo acorde a su título.",
              requisitos: ["Título universitario reconocido", "Oferta de empleo cualificado", "Salario mínimo anual que Alemania actualiza cada año"],
              duracion: "Residencia renovable, con camino a la permanente y movilidad dentro de la UE.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"] }
        ]
    },
    francia: {
        nombre: "Francia", ue: true, fuente: "https://france-visas.gouv.fr",
        visados: [
            { id: "visado-trabajo", nombre: "Visado de larga duración para trabajar", tipo: "Con oferta de empleo",
              resumen: "Para trabajar en Francia con un contrato de una empresa francesa, que tramita la autorización de trabajo.",
              paraQuien: "Personas con una oferta de empleo de una empresa francesa.",
              requisitos: ["Contrato o promesa de contrato", "Autorización de trabajo gestionada por la empresa", "Visado de larga duración solicitado en el consulado"],
              duracion: "Según el contrato; renovable.",
              minEstudios: "eso", tiempos: ["meses", "1-2", "siempre"] },
            { id: "passeport-talent", nombre: "Passeport Talent", tipo: "Perfil cualificado",
              resumen: "Permiso plurianual para perfiles muy cualificados, con varias categorías (empleo cualificado, investigación, empresa...).",
              paraQuien: "Titulados superiores o profesionales con experiencia y un empleo cualificado.",
              requisitos: ["Estudios superiores o experiencia equivalente", "Empleo cualificado con el salario mínimo de su categoría"],
              duracion: "Permiso de varios años, renovable.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"] }
        ]
    },
    italia: {
        nombre: "Italia", ue: true, fuente: "https://vistoperitalia.esteri.it",
        visados: [
            { id: "decreto-flussi", nombre: "Visado de trabajo por cupos (Decreto Flussi)", tipo: "Con oferta de empleo",
              resumen: "Italia fija cada año cuántos permisos de trabajo concede a personas de fuera de la UE; el empleador italiano presenta la solicitud.",
              paraQuien: "Personas con una oferta de una empresa italiana, dentro de los cupos anuales.",
              requisitos: ["Empleador italiano que solicite el permiso", "Que haya cupo disponible para ese tipo de trabajo", "Visado en el consulado tras la autorización"],
              duracion: "Según el contrato.",
              minEstudios: "eso", tiempos: ["meses", "1-2", "siempre"] },
            { id: "tarjeta-azul-it", nombre: "Tarjeta Azul UE (Italia)", tipo: "Perfil universitario",
              resumen: "Para titulados superiores con un empleo cualificado y un salario mínimo.",
              paraQuien: "Titulados universitarios con una oferta de empleo cualificado.",
              requisitos: ["Título superior reconocido", "Contrato cualificado", "Salario mínimo exigido"],
              duracion: "Residencia renovable.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"] }
        ]
    },
    irlanda: {
        nombre: "Irlanda", ue: true, fuente: "https://enterprise.gov.ie",
        visados: [
            { id: "critical-skills", nombre: "Critical Skills Employment Permit", tipo: "Perfil cualificado",
              resumen: "Para ocupaciones muy demandadas (por ejemplo, del sector tecnológico), con camino a la residencia.",
              paraQuien: "Profesionales, normalmente titulados, en una ocupación de la lista oficial.",
              requisitos: ["Oferta de empleo en una ocupación de la lista de ocupaciones críticas", "Salario mínimo anual", "Normalmente, título universitario"],
              duracion: "Permiso de varios años, con vía a la residencia.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"] },
            { id: "general-permit", nombre: "General Employment Permit", tipo: "Con oferta de empleo",
              resumen: "Permiso general para trabajos que no están en la lista de ocupaciones críticas.",
              paraQuien: "Personas con una oferta de empleo de una empresa irlandesa.",
              requisitos: ["Oferta de empleo de una empresa irlandesa", "Salario mínimo", "Ocupación no excluida de la lista oficial"],
              duracion: "Permiso temporal, renovable.",
              minEstudios: "gm", tiempos: ["meses", "1-2"] }
        ]
    },
    "reino-unido": {
        nombre: "Reino Unido", ue: false, fuente: "https://www.gov.uk/skilled-worker-visa",
        visados: [
            { id: "skilled-worker", nombre: "Skilled Worker visa", tipo: "Con oferta de empleo",
              resumen: "Visado de trabajo con una empresa autorizada. Desde julio de 2025 el puesto debe ser de nivel universitario (RQF 6), salvo excepciones.",
              paraQuien: "Personas con una oferta de una empresa con licencia de patrocinio, en un puesto de nivel universitario.",
              requisitos: ["Oferta de una empresa con licencia de patrocinio", "Puesto de nivel universitario o incluido en una lista de excepciones", "Salario mínimo y nivel de inglés exigidos"],
              duracion: "Varios años, ampliable.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"], minIngles: "b2" }
        ]
    },
    "paises-bajos": {
        nombre: "Países Bajos", ue: true, fuente: "https://ind.nl/en",
        visados: [
            { id: "kennismigrant", nombre: "Highly Skilled Migrant (kennismigrant)", tipo: "Perfil cualificado",
              resumen: "Residencia y trabajo con una empresa reconocida como patrocinadora por la administración neerlandesa.",
              paraQuien: "Profesionales cualificados contratados por una empresa reconocida.",
              requisitos: ["Contrato con una empresa reconocida por el IND", "Salario mínimo según edad y estudios"],
              duracion: "Permiso de varios años, renovable.",
              minEstudios: "gs", tiempos: ["1-2", "siempre"] },
            { id: "zoekjaar", nombre: "Año de orientación (zoekjaar)", tipo: "Búsqueda de empleo",
              resumen: "Para titulados recientes de universidades elegibles: hasta un año para buscar trabajo en el país.",
              paraQuien: "Recién titulados universitarios de centros neerlandeses o de universidades extranjeras reconocidas.",
              requisitos: ["Título reciente de una universidad elegible", "Solicitud ante el IND"],
              duracion: "Hasta un año.",
              minEstudios: "universidad", tiempos: ["meses", "1-2"] }
        ]
    },
    portugal: {
        nombre: "Portugal", ue: true, fuente: "https://vistos.mne.gov.pt",
        visados: [
            { id: "busqueda-empleo", nombre: "Visado de búsqueda de empleo", tipo: "Búsqueda de empleo",
              resumen: "Permite ir a Portugal a buscar trabajo durante un periodo limitado, sin oferta previa.",
              paraQuien: "Personas con cualificación académica o profesional que quieren buscar trabajo allí.",
              requisitos: ["Cualificación académica o profesional", "Medios económicos y alojamiento", "Registro previo en el servicio de empleo portugués"],
              duracion: "Periodo limitado; si no encuentras trabajo, hay que salir del país.",
              minEstudios: "gm", tiempos: ["meses", "1-2"] },
            { id: "trabajo-cuenta-ajena", nombre: "Visado de residencia para trabajo por cuenta ajena", tipo: "Con oferta de empleo",
              resumen: "Para trabajar en Portugal con un contrato de una empresa portuguesa.",
              paraQuien: "Personas con contrato o promesa de contrato de una empresa portuguesa.",
              requisitos: ["Contrato o promesa de contrato", "Visado de residencia solicitado en el consulado"],
              duracion: "Residencia temporal renovable.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"] },
            { id: "d8", nombre: "Visado D8 (teletrabajo)", tipo: "Trabajo remoto",
              resumen: "Para trabajar en remoto desde Portugal para empresas o clientes de fuera del país.",
              paraQuien: "Teletrabajadores o autónomos con ingresos regulares y elevados desde el extranjero.",
              requisitos: ["Ingresos mensuales regulares y altos (varios miles de euros) desde fuera de Portugal", "Contrato o clientes fuera de Portugal", "Alojamiento y seguro médico"],
              duracion: "Estancia temporal o residencia renovable.",
              minEstudios: "eso", tiempos: ["meses", "1-2", "siempre"], remoto: true }
        ]
    },
    eeuu: {
        nombre: "Estados Unidos", ue: false, fuente: "https://travel.state.gov",
        visados: [
            { id: "j1", nombre: "J-1 (prácticas y formación)", tipo: "Temporal",
              resumen: "Para hacer prácticas o formación en EE. UU. a través de un patrocinador autorizado.",
              paraQuien: "Estudiantes o recién titulados que quieren hacer prácticas temporales.",
              requisitos: ["Patrocinador autorizado por el Gobierno de EE. UU.", "Oferta de prácticas o formación", "Buen nivel de inglés"],
              duracion: "Temporal (meses o hasta un par de años, según el programa).",
              minEstudios: "gm", tiempos: ["meses", "1-2"], minIngles: "b2" },
            { id: "h1b", nombre: "H-1B (ocupaciones especializadas)", tipo: "Con oferta de empleo",
              resumen: "Para empleos que exigen título universitario. Las normas han cambiado mucho: sorteo ponderado por salario y una tasa alta para empresas, en disputa judicial.",
              paraQuien: "Titulados universitarios con una empresa estadounidense que los patrocine.",
              requisitos: ["Título universitario acorde al puesto", "Empresa que presente la solicitud", "Selección en el sorteo anual"],
              duracion: "Varios años, ampliable.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"], minIngles: "b2" }
        ]
    },
    canada: {
        nombre: "Canadá", ue: false, fuente: "https://www.canada.ca/en/services/immigration-citizenship.html",
        visados: [
            { id: "working-holiday", nombre: "Working Holiday (IEC)", tipo: "Temporal",
              resumen: "Permiso para viajar y trabajar un tiempo, solo para nacionalidades con acuerdo y con límite de edad.",
              paraQuien: "Jóvenes de países con acuerdo con Canadá que quieren una experiencia temporal.",
              requisitos: ["Nacionalidad de un país con acuerdo", "Estar en la franja de edad del programa", "Ser seleccionado en el sorteo de invitaciones"],
              duracion: "Temporal (de unos meses a un par de años).",
              minEstudios: "eso", tiempos: ["meses", "1-2"] },
            { id: "permiso-oferta", nombre: "Permiso de trabajo con oferta de empleo", tipo: "Con oferta de empleo",
              resumen: "Permiso temporal para trabajar con una empresa canadiense; muchas veces la empresa debe demostrar que no encuentra candidatos locales.",
              paraQuien: "Personas con una oferta de una empresa canadiense.",
              requisitos: ["Oferta de empleo", "En la mayoría de casos, evaluación del mercado laboral por parte de la empresa"],
              duracion: "Temporal, ligado al empleo.",
              minEstudios: "gm", tiempos: ["meses", "1-2"] },
            { id: "express-entry", nombre: "Express Entry", tipo: "Residencia permanente",
              resumen: "Sistema de puntos para vivir y trabajar en Canadá de forma permanente.",
              paraQuien: "Profesionales con estudios, experiencia y un buen nivel de idioma.",
              requisitos: ["Puntos por estudios, experiencia, edad e idioma", "Nivel alto de inglés o francés", "Ser seleccionado en los sorteos periódicos"],
              duracion: "Residencia permanente.",
              minEstudios: "gs", tiempos: ["siempre"], minIngles: "b2" }
        ]
    }
};

// ---------- Utilidades compartidas ----------

// Crea un elemento con texto (textContent: lo que escriba el usuario no se ejecuta)
function crear(etiqueta, texto, clase) {
    var el = document.createElement(etiqueta);
    if (texto) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

// Lee las respuestas del cuestionario que vienen en la dirección
function leerRespuestas(params) {
    return {
        estudios: params.get("estudios"), titulo: params.get("titulo"),
        formacion: params.getAll("formacion"), ingles: params.get("ingles"),
        pais: params.get("pais"), tiempo: params.get("tiempo"),
        modalidad: params.get("modalidad"), jornada: params.get("jornada"),
        areas: params.getAll("area"), comentarios: params.get("comentarios"),
        ue: params.get("ue")
    };
}

// Puntúa un visado según el perfil y explica por qué
function puntuar(v, r) {
    var p = 0, motivos = [], avisos = [];

    if (NIVEL_ESTUDIOS[r.estudios] >= NIVEL_ESTUDIOS[v.minEstudios]) {
        p += 3; motivos.push("Tu nivel de estudios cumple lo que suele pedirse.");
    } else {
        p -= 3; avisos.push("Suele pedir más estudios: " + NOMBRES_ESTUDIOS[v.minEstudios] + " o superior.");
    }

    if (v.tiempos.indexOf(r.tiempo) !== -1) {
        p += 2; motivos.push("Encaja con el tiempo que quieres quedarte.");
    } else {
        avisos.push("No es la vía más habitual para el tiempo que has indicado.");
    }

    if (v.remoto) {
        if (r.modalidad === "remoto" || r.modalidad === "hibrido") {
            p += 2; motivos.push("Está pensado para trabajar en remoto, como quieres.");
        } else {
            p -= 2; avisos.push("Es un visado de teletrabajo y has elegido trabajo presencial.");
        }
    }

    if (v.minIngles) {
        if (NIVEL_INGLES[r.ingles] >= NIVEL_INGLES[v.minIngles]) {
            p += 1; motivos.push("Tu nivel de inglés es suficiente.");
        } else {
            p -= 1; avisos.push("Piden inglés de nivel " + v.minIngles.toUpperCase() + " o más.");
        }
    }

    return { visado: v, puntos: p, motivos: motivos, avisos: avisos };
}

// Devuelve los visados del país ordenados: el primero es el más recomendado
function ordenarVisados(r) {
    var info = INFO_PAISES[r.pais];
    if (!info) return [];
    return info.visados
        .map(function (v, i) { var x = puntuar(v, r); x.orden = i; return x; })
        .sort(function (a, b) { return (b.puntos - a.puntos) || (a.orden - b.orden); });
}
