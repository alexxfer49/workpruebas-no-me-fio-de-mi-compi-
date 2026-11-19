// =====================================================
// visados-datos.js
// Vías para trabajar en ESPAÑA siendo de Honduras, y cálculo de la más
// recomendada. Lo usan resultado.js y visados.js.
// IMPORTANTE: información orientativa (revisada en noviembre de 2026, según el
// Reglamento de Extranjería en vigor desde mayo de 2025). Las normas cambian:
// confirma siempre en la fuente oficial.
// =====================================================

var NOMBRES_ESTUDIOS = {
    eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)",
    gs: "Grado Superior (FP)", universidad: "Universidad"
};
var NIVEL_ESTUDIOS = { eso: 0, bachillerato: 1, gm: 2, gs: 3, universidad: 4 };
var TEXTO_UBICACION = {
    honduras: "estás en Honduras",
    "espana-menos": "ya estás en España desde hace menos de 2 años",
    "espana-mas": "llevas 2 años o más en España"
};

// Para cada vía:
// desde = situaciones desde las que se puede pedir; oferta = "si" (la exige) o "no" (no la exige);
// minEstudios; tiempos = duraciones a las que encaja; remoto = true si es para teletrabajo;
// avisoUbicacion = qué decir si tu situación no encaja.
var INFO_PAISES = {
    espana: {
        nombre: "España", ue: false, fuente: "https://www.inclusion.gob.es",
        notas: [
            "Como persona de Honduras puedes entrar en España sin visado hasta 90 días como turista, pero eso no te permite trabajar. Puede exigirse una autorización electrónica de viaje (ETIAS): compruébalo antes de viajar.",
            "Para trabajar o vivir más de 90 días necesitas una autorización de residencia o un visado de larga duración.",
            "Con 2 años de residencia legal puedes pedir la nacionalidad española (régimen iberoamericano), sin renunciar a la hondureña.",
            "El proceso extraordinario de regularización de 2026 cerró el 30 de junio de 2026. Consulta en la web oficial si hay novedades."
        ],
        visados: [
            { id: "cuenta-ajena", nombre: "Residencia y trabajo por cuenta ajena", tipo: "Con oferta de empleo",
              resumen: "Una empresa española te contrata y presenta la solicitud. Una vez concedida, se pide el visado en el consulado.",
              paraQuien: "Personas con una oferta de trabajo de una empresa en España.",
              requisitos: ["Contrato u oferta de una empresa que presente la solicitud", "Puesto en el catálogo de ocupaciones de difícil cobertura, o que la empresa demuestre que no encuentra candidatos", "Visado en el consulado de España"],
              duracion: "Autorización inicial de un año, limitada a una comunidad autónoma y a un sector; renovable.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "si", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "temporada", nombre: "Trabajo de temporada", tipo: "Temporal",
              resumen: "Para campañas agrícolas y otras actividades de temporada, con contrato o por contratación colectiva en origen cuando hay convocatoria.",
              paraQuien: "Personas que quieren trabajar unos meses en una campaña.",
              requisitos: ["Oferta o contrato para la campaña", "Compromiso de volver a Honduras al terminar", "Visado en el consulado de España"],
              duracion: "Limitada a la duración de la campaña.",
              minEstudios: "eso", tiempos: ["meses"], oferta: "si", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "cuenta-propia", nombre: "Residencia y trabajo por cuenta propia (autónomo)", tipo: "Emprender",
              resumen: "Para montar tu propio negocio o trabajar como autónomo en España.",
              paraQuien: "Emprendedores y profesionales con un proyecto viable.",
              requisitos: ["Proyecto viable y medios económicos suficientes", "Licencias o titulación necesarias para esa actividad", "Visado en el consulado de España"],
              duracion: "Un año inicialmente, limitada a un sector y comunidad autónoma; renovable.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "no", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "busqueda-empleo", nombre: "Visado de búsqueda de empleo", tipo: "Búsqueda de empleo",
              resumen: "Permite ir a España hasta 12 meses a buscar trabajo, pero solo en casos concretos.",
              paraQuien: "Hijos o nietos de españoles de origen, y quienes cumplan las ocupaciones y territorios que fije el Gobierno.",
              requisitos: ["Estar en uno de los supuestos previstos", "Medios económicos para mantenerte", "Visado en el consulado de España"],
              duracion: "12 meses.",
              minEstudios: "eso", tiempos: ["1-2"], oferta: "no", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "tarjeta-azul", nombre: "Tarjeta Azul UE", tipo: "Perfil universitario",
              resumen: "Para titulados superiores con un empleo cualificado y un salario mínimo.",
              paraQuien: "Titulados universitarios (o con experiencia profesional equivalente) con oferta de empleo cualificado.",
              requisitos: ["Titulación superior o experiencia profesional equivalente", "Oferta de empleo cualificado con el salario anual mínimo exigido", "Visado en el consulado de España"],
              duracion: "Varios años, renovable, con movilidad por la UE.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"], oferta: "si", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "alta-cualificacion", nombre: "Profesional altamente cualificado", tipo: "Perfil cualificado",
              resumen: "Para titulados o profesionales con experiencia que tienen un empleo cualificado en España.",
              paraQuien: "Profesionales con título superior o experiencia suficiente.",
              requisitos: ["Título superior o experiencia profesional suficiente", "Contrato cualificado con un salario mínimo", "Empresa que presente la solicitud"],
              duracion: "Varios años, renovable.",
              minEstudios: "universidad", tiempos: ["1-2", "siempre"], oferta: "si", desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "teletrabajo", nombre: "Visado de teletrabajo de carácter internacional", tipo: "Trabajo remoto",
              resumen: "Para vivir en España trabajando en remoto para empresas o clientes de fuera de España.",
              paraQuien: "Teletrabajadores y autónomos con ingresos regulares desde el extranjero.",
              requisitos: ["Trabajar para empresas o clientes fuera de España", "Ingresos mensuales regulares por encima del mínimo exigido", "Formación o experiencia que respalde tu actividad"],
              duracion: "Residencia temporal, renovable.",
              minEstudios: "eso", tiempos: ["meses", "1-2", "siempre"], oferta: "no", remoto: true, desde: ["honduras"],
              avisoUbicacion: "Se tramita desde Honduras, antes de viajar a España." },
            { id: "estudios", nombre: "Estancia por estudios", tipo: "Estudiar y trabajar",
              resumen: "Visado para estudiar en España. Con el reglamento de 2025 puedes trabajar hasta 30 horas semanales y, al terminar, pasar a una vía de trabajo.",
              paraQuien: "Personas que quieren estudiar en España y trabajar a la vez.",
              requisitos: ["Admisión en un centro de estudios en España", "Medios económicos y seguro médico", "Visado de estudios (para personas de Honduras, las tasas consulares están exentas por convenio)"],
              duracion: "La del curso; ampliable.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "no", desde: ["honduras"],
              avisoUbicacion: "El visado de estudios se pide desde Honduras, antes de viajar." },
            { id: "familiar", nombre: "Residencia por familiar de español o de ciudadano de la UE", tipo: "Familiar",
              resumen: "Para familiares de personas con nacionalidad española o de otro país de la UE (cónyuge o pareja, hijos, ascendientes...).",
              paraQuien: "Personas con un vínculo familiar demostrable con un español o ciudadano de la UE.",
              requisitos: ["Vínculo familiar demostrable", "Condiciones de convivencia o sostenimiento según el caso", "Solicitud en España o visado desde Honduras, según tu situación"],
              duracion: "Varios años, renovable.",
              minEstudios: "eso", tiempos: ["meses", "1-2", "siempre"], oferta: "no", desde: ["honduras", "espana-menos", "espana-mas"],
              avisoUbicacion: "" },
            { id: "arraigo-sociolaboral", nombre: "Arraigo sociolaboral", tipo: "Ya estoy en España",
              resumen: "Para quien lleva al menos 2 años en España sin papeles y tiene un contrato de trabajo.",
              paraQuien: "Personas que ya viven en España en situación irregular y tienen una oferta de contrato.",
              requisitos: ["2 años seguidos en España (con ausencias breves)", "Contrato de trabajo", "Sin antecedentes penales"],
              duracion: "Un año, renovable. Permite trabajar.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "si", desde: ["espana-mas"],
              avisoUbicacion: "Hay que llevar al menos 2 años seguidos en España." },
            { id: "arraigo-social", nombre: "Arraigo social", tipo: "Ya estoy en España",
              resumen: "Para quien lleva al menos 2 años en España y demuestra vínculos sociales y medios económicos.",
              paraQuien: "Personas que ya viven en España en situación irregular y están integradas.",
              requisitos: ["2 años seguidos en España", "Informe de integración social", "Medios económicos suficientes y sin antecedentes penales"],
              duracion: "Un año, renovable. Permite trabajar.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "no", desde: ["espana-mas"],
              avisoUbicacion: "Hay que llevar al menos 2 años seguidos en España." },
            { id: "arraigo-socioformativo", nombre: "Arraigo socioformativo", tipo: "Ya estoy en España",
              resumen: "Para quien lleva 2 años en España y se compromete a hacer formación reglada o cursos de ocupaciones de difícil cobertura.",
              paraQuien: "Personas ya en España que quieren estudiar (por ejemplo, un grado medio de FP).",
              requisitos: ["2 años seguidos en España", "Matrícula o plaza en formación reglada o en un curso del SEPE", "Informe de integración social y sin antecedentes penales"],
              duracion: "Un año; permite trabajar hasta 30 horas semanales. Solo puede concederse una vez cada tres años.",
              minEstudios: "eso", tiempos: ["1-2", "siempre"], oferta: "no", desde: ["espana-mas"],
              avisoUbicacion: "Hay que llevar al menos 2 años seguidos en España." }
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

// Lee las respuestas del cuestionario que vienen en la dirección (el destino siempre es España)
function leerRespuestas(params) {
    return {
        estudios: params.get("estudios"), titulo: params.get("titulo"),
        formacion: params.getAll("formacion"), pais: "espana",
        ubicacion: params.get("ubicacion"), oferta: params.get("oferta"),
        tiempo: params.get("tiempo"), modalidad: params.get("modalidad"),
        jornada: params.get("jornada"), areas: params.getAll("area"),
        comentarios: params.get("comentarios")
    };
}

// Puntúa una vía según el perfil y explica por qué
function puntuar(v, r) {
    var p = 0, motivos = [], avisos = [];

    if (v.desde.indexOf(r.ubicacion) !== -1) {
        p += 3; motivos.push("Puedes empezar este trámite en tu situación actual (" + TEXTO_UBICACION[r.ubicacion] + ").");
    } else {
        p -= 4; avisos.push(v.avisoUbicacion);
    }

    if (NIVEL_ESTUDIOS[r.estudios] >= NIVEL_ESTUDIOS[v.minEstudios]) {
        p += 3; motivos.push("Tu nivel de estudios cumple lo que suele pedirse.");
    } else {
        p -= 3; avisos.push("Suele pedir más estudios: " + NOMBRES_ESTUDIOS[v.minEstudios] + " o superior.");
    }

    if (v.oferta === "si") {
        if (r.oferta === "si") {
            p += 3; motivos.push("Tienes oferta o contrato de trabajo, que es lo que se necesita.");
        } else {
            p -= 3; avisos.push("Necesita una oferta o contrato de trabajo y has dicho que todavía no la tienes.");
        }
    } else if (r.oferta === "no") {
        p += 1; motivos.push("No necesitas tener una oferta de trabajo para empezar.");
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

    return { visado: v, puntos: p, motivos: motivos, avisos: avisos };
}

// Devuelve las vías ordenadas: la primera es la más recomendada
function ordenarVisados(r) {
    var info = INFO_PAISES[r.pais];
    if (!info) return [];
    return info.visados
        .map(function (v, i) { var x = puntuar(v, r); x.orden = i; return x; })
        .sort(function (a, b) { return (b.puntos - a.puntos) || (a.orden - b.orden); });
}
