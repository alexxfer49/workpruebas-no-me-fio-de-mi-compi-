// =====================================================
// resultado.js
// Lee las respuestas del cuestionario (vienen en la URL),
// las enseña en un resumen y propone vías de visado.
// =====================================================

// Orden de los estudios, para poder compararlos con un número
var NIVEL = { eso: 0, bachillerato: 1, gm: 2, gs: 3, universidad: 4 };

// Textos bonitos para mostrar lo que ha respondido
var TEXTOS = {
    estudios: { eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)", gs: "Grado Superior (FP)", universidad: "Universidad" },
    ingles: { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    pais: {
        alemania: "Alemania", francia: "Francia", italia: "Italia", irlanda: "Irlanda",
        "reino-unido": "Reino Unido", "paises-bajos": "Países Bajos", portugal: "Portugal",
        eeuu: "Estados Unidos", canada: "Canadá", otro: "Otro país"
    },
    tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
    modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
    jornada: { completa: "Completa", parcial: "Media jornada" },
    formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
    area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};

// Países donde un ciudadano de la UE no necesita visado
var PAISES_UE = ["alemania", "francia", "italia", "irlanda", "paises-bajos", "portugal"];

// Páginas oficiales donde comprobar la información
var FUENTES = {
    alemania: "https://www.make-it-in-germany.com",
    francia: "https://france-visas.gouv.fr",
    italia: "https://vistoperitalia.esteri.it",
    irlanda: "https://enterprise.gov.ie",
    "reino-unido": "https://www.gov.uk/skilled-worker-visa",
    "paises-bajos": "https://ind.nl/en",
    portugal: "https://vistos.mne.gov.pt",
    eeuu: "https://travel.state.gov",
    canada: "https://www.canada.ca/en/services/immigration-citizenship.html"
};

// Vías de visado por país.
// minEstudios = nivel mínimo de estudios que suele pedirse.
// soloSi (opcional) = función que decide si la opción tiene sentido para esta persona.
// Información orientativa: las condiciones cambian, hay que verificarlas en la fuente oficial.
var VISADOS = {
    alemania: [
        { nombre: "Chancenkarte (tarjeta de oportunidades)", minEstudios: "gm",
          descripcion: "Permite ir a Alemania a buscar trabajo durante un tiempo limitado, sin oferta previa.",
          requisitos: "Título de FP o universitario reconocido, y nivel básico de alemán o de inglés. Se valora con un sistema de puntos." },
        { nombre: "Visado de trabajador cualificado", minEstudios: "gm",
          descripcion: "Para trabajar en Alemania con una oferta de empleo ya firmada.",
          requisitos: "Oferta de empleo y título profesional reconocido en Alemania." },
        { nombre: "Tarjeta Azul UE", minEstudios: "universidad",
          descripcion: "Vía para perfiles universitarios con un empleo cualificado.",
          requisitos: "Título universitario, oferta de empleo y un salario mínimo anual." }
    ],
    francia: [
        { nombre: "Visado de trabajo de larga duración", minEstudios: "gm",
          descripcion: "Para trabajar en Francia con un contrato de una empresa francesa.",
          requisitos: "Contrato de trabajo y autorización de trabajo tramitada por la empresa." },
        { nombre: "Passeport Talent", minEstudios: "universidad",
          descripcion: "Permiso de residencia para perfiles cualificados o con salarios altos.",
          requisitos: "Normalmente estudios universitarios y un salario mínimo." }
    ],
    italia: [
        { nombre: "Visado de trabajo por cupos (Decreto Flussi)", minEstudios: "eso",
          descripcion: "Italia fija cada año un número limitado de permisos de trabajo para personas de fuera de la UE.",
          requisitos: "Oferta de una empresa italiana y que haya cupo disponible." }
    ],
    irlanda: [
        { nombre: "Critical Skills Employment Permit", minEstudios: "universidad",
          descripcion: "Para ocupaciones muy demandadas, como algunas del sector tecnológico.",
          requisitos: "Oferta de empleo, salario mínimo y ocupación incluida en la lista oficial." },
        { nombre: "General Employment Permit", minEstudios: "gm",
          descripcion: "Permiso de trabajo general para ocupaciones no incluidas en la lista anterior.",
          requisitos: "Oferta de empleo con salario mínimo; las empresas deben cumplir condiciones." }
    ],
    "reino-unido": [
        { nombre: "Skilled Worker visa", minEstudios: "gs",
          descripcion: "Visado para trabajar en el Reino Unido con una oferta de empleo.",
          requisitos: "Oferta de una empresa autorizada (sponsor), nivel de inglés y salario mínimo." }
    ],
    "paises-bajos": [
        { nombre: "Highly Skilled Migrant (kennismigrant)", minEstudios: "gs",
          descripcion: "Para trabajadores cualificados contratados por empresas reconocidas.",
          requisitos: "Empresa reconocida como sponsor y salario mínimo." }
    ],
    portugal: [
        { nombre: "Visado de búsqueda de empleo", minEstudios: "gm",
          descripcion: "Permite ir a Portugal a buscar trabajo durante un periodo limitado.",
          requisitos: "Solicitud ante el consulado, medios económicos y alojamiento." },
        { nombre: "Visado D8 (teletrabajo)", minEstudios: "eso",
          descripcion: "Para quien trabaja en remoto para empresas de fuera de Portugal.",
          requisitos: "Contrato o clientes fuera de Portugal e ingresos mínimos demostrables.",
          soloSi: function (r) { return r.modalidad === "remoto" || r.modalidad === "hibrido" || r.areas.indexOf("autonomo") !== -1; } }
    ],
    eeuu: [
        { nombre: "J-1 (prácticas o formación)", minEstudios: "gm",
          descripcion: "Estancias temporales de prácticas o formación a través de una entidad patrocinadora.",
          requisitos: "Patrocinador autorizado, oferta de prácticas y buen nivel de inglés.",
          soloSi: function (r) { return r.tiempo !== "siempre"; } },
        { nombre: "H-1B (ocupaciones especializadas)", minEstudios: "universidad",
          descripcion: "Para trabajos que exigen estudios universitarios, con una empresa que te patrocine.",
          requisitos: "Título universitario, oferta de empleo y selección en un sorteo anual." }
    ],
    canada: [
        { nombre: "Working Holiday (IEC)", minEstudios: "eso",
          descripcion: "Permiso temporal para viajar y trabajar, solo para algunas nacionalidades y edades.",
          requisitos: "Tener entre 18 y 35 años y una nacionalidad incluida en el acuerdo.",
          soloSi: function (r) { return r.tiempo !== "siempre"; } },
        { nombre: "Express Entry", minEstudios: "gs",
          descripcion: "Sistema de puntos para vivir y trabajar en Canadá de forma permanente.",
          requisitos: "Estudios, experiencia y nivel de inglés o francés suficientes para entrar en el sistema de puntos.",
          soloSi: function (r) { return r.tiempo !== "meses"; } }
    ]
};

// ---------- Utilidades ----------

// Crea un elemento con texto. Usamos textContent (nunca innerHTML)
// para que lo que escriba el usuario no se pueda ejecutar como código.
function crear(etiqueta, texto, clase) {
    var el = document.createElement(etiqueta);
    if (texto) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function traducir(grupo, valor) {
    return (TEXTOS[grupo] && TEXTOS[grupo][valor]) || valor;
}

function agregarFila(lista, titulo, valor) {
    if (!valor) return;
    lista.appendChild(crear("dt", titulo));
    lista.appendChild(crear("dd", valor));
}

// ---------- Programa principal ----------

document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);

    // Si entra sin haber rellenado el cuestionario, lo devolvemos al formulario
    if (!params.get("pais")) {
        window.location.replace("cuestionario.html");
        return;
    }

    var r = {
        estudios: params.get("estudios"),
        titulo: params.get("titulo"),
        formacion: params.getAll("formacion"),
        ingles: params.get("ingles"),
        pais: params.get("pais"),
        tiempo: params.get("tiempo"),
        modalidad: params.get("modalidad"),
        jornada: params.get("jornada"),
        areas: params.getAll("area"),
        comentarios: params.get("comentarios"),
        ue: params.get("ue") // solo existe si añades la pregunta de nacionalidad
    };

    var nombrePais = traducir("pais", r.pais);

    // 1. Resumen de respuestas
    var resumen = document.getElementById("resumen");
    agregarFila(resumen, "Estudios", traducir("estudios", r.estudios));
    agregarFila(resumen, "Título", r.titulo);
    agregarFila(resumen, "Formación extra", r.formacion.map(function (v) { return traducir("formacion", v); }).join(", "));
    agregarFila(resumen, "Inglés", traducir("ingles", r.ingles));
    agregarFila(resumen, "País de destino", nombrePais);
    agregarFila(resumen, "Duración", traducir("tiempo", r.tiempo));
    agregarFila(resumen, "Modalidad", traducir("modalidad", r.modalidad));
    agregarFila(resumen, "Jornada", traducir("jornada", r.jornada));
    agregarFila(resumen, "Áreas de interés", r.areas.map(function (v) { return traducir("area", v); }).join(", "));
    agregarFila(resumen, "Comentarios", r.comentarios);

    // 2. Aviso para ciudadanos de la UE que van a un país de la UE
    var contenedorOpciones = document.getElementById("opciones");
    var esDestinoUE = PAISES_UE.indexOf(r.pais) !== -1;

    if (r.ue === "si" && esDestinoUE) {
        var aviso = document.getElementById("avisoUE");
        aviso.hidden = false;
        aviso.appendChild(crear("h2", "No necesitas visado para " + nombrePais));
        aviso.appendChild(crear("p",
            "Con pasaporte o DNI de un país de la UE puedes vivir y trabajar en otro país de la UE sin visado de trabajo. " +
            "Lo que sí suele hacer falta es registrarte como residente al llegar. Consulta el procedimiento en la web oficial."));
        document.getElementById("tituloOpciones").hidden = true;
        return;
    }

    // 3. Vías de visado
    var opciones = VISADOS[r.pais];

    if (!opciones) {
        contenedorOpciones.appendChild(crear("p",
            "Todavía no tenemos información sobre ese destino. Consulta la embajada o el consulado del país al que quieres ir."));
        return;
    }

    // Quitamos las que no tienen sentido (por ejemplo, una de teletrabajo si quiere presencial)
    opciones = opciones.filter(function (o) { return !o.soloSi || o.soloSi(r); });

    var nivelUsuario = NIVEL[r.estudios];

    // Primero las que encajan con sus estudios
    opciones.sort(function (a, b) {
        var aEncaja = nivelUsuario >= NIVEL[a.minEstudios] ? 0 : 1;
        var bEncaja = nivelUsuario >= NIVEL[b.minEstudios] ? 0 : 1;
        return aEncaja - bEncaja;
    });

    opciones.forEach(function (o) {
        var encaja = nivelUsuario >= NIVEL[o.minEstudios];

        var tarjeta = crear("article", null, "visado " + (encaja ? "encaja" : "noEncaja"));
        tarjeta.appendChild(crear("h3", o.nombre));
        tarjeta.appendChild(crear("p", o.descripcion));
        tarjeta.appendChild(crear("p", "Requisitos habituales: " + o.requisitos, "requisitos"));

        tarjeta.appendChild(crear("p",
            encaja
                ? "Encaja con tu nivel de estudios."
                : "Suele pedir como mínimo: " + traducir("estudios", o.minEstudios) + ".",
            "etiqueta"));

        contenedorOpciones.appendChild(tarjeta);
    });

    // Enlace a la fuente oficial
    if (FUENTES[r.pais]) {
        var p = crear("p", "Comprueba siempre las condiciones actuales en ", "fuente");
        var enlace = crear("a", FUENTES[r.pais]);
        enlace.href = FUENTES[r.pais];
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        p.appendChild(enlace);
        contenedorOpciones.appendChild(p);
    }
});
