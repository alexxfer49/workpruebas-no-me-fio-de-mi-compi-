
// =====================================================
// visados-ficha-datos.js
// Datos de los visados por país. Para añadir un país o un visado
// solo hay que copiar un bloque y cambiar los textos.
// IMPORTANTE: las claves (canada, alemania...) deben ser iguales
// que los "value" del desplegable de países del cuestionario.
// =====================================================
 
var PAISES = {
 
  canada: {
    nombre: "Canadá",
    bandera: "🇨🇦",
    web: "https://www.canada.ca/en/services/immigration-citizenship.html",
    visados: [
      {
        id: "express-entry",
        nombre: "Express Entry",
        tipo: "Residencia permanente",
        descripcion: "Sistema de puntos para vivir y trabajar en Canadá de forma permanente. Se puntúan estudios, experiencia, edad e idiomas.",
        datos: {
          "Tasa": "Consulta la tasa actual en la web oficial",
          "Plazo de resolución": "Varios meses desde la solicitud completa",
          "Cuándo solicitar": "Tras crear el perfil y recibir una invitación",
          "Validez": "Residencia permanente",
          "Renovación": "La tarjeta de residente se renueva cada 5 años"
        },
        aviso: "Todos los documentos que no estén en inglés o francés deben ir acompañados de traducción jurada.",
        documentos: [
          "Pasaporte en vigor.",
          "Resultado de una prueba de idioma reconocida (inglés o francés).",
          "Evaluación de las credenciales educativas (ECA) de tus estudios.",
          "Cartas que acrediten tu experiencia laboral.",
          "Certificado de antecedentes penales.",
          "Examen médico realizado por un médico autorizado.",
          "Prueba de fondos para mantenerte al llegar."
        ],
        pasos: [
          "Comprueba si cumples los requisitos mínimos.",
          "Haz la prueba de idioma y la evaluación de estudios.",
          "Crea tu perfil en línea en el portal oficial.",
          "Espera una invitación a presentar la solicitud.",
          "Presenta la solicitud con todos los documentos."
        ],
        minimo: "Grado Superior (FP)"
      },
      {
        id: "permiso-trabajo",
        nombre: "Permiso de trabajo con oferta de empleo",
        tipo: "Permiso temporal",
        descripcion: "Permiso para trabajar en Canadá para una empresa concreta que te ha ofrecido un contrato.",
        datos: {
          "Tasa": "Consulta la tasa actual en la web oficial",
          "Plazo de resolución": "Depende del país de residencia",
          "Cuándo solicitar": "Cuando la empresa te entrega la oferta y los documentos necesarios",
          "Validez": "Según la duración del contrato",
          "Renovación": "Se puede pedir una prórroga antes de que caduque"
        },
        aviso: "Normalmente la empresa debe demostrar que no encuentra a un trabajador canadiense para ese puesto.",
        documentos: [
          "Pasaporte en vigor.",
          "Oferta de empleo firmada por la empresa.",
          "Documento de la empresa que autoriza contratar a extranjeros.",
          "Currículum y títulos de estudios.",
          "Certificado de antecedentes penales."
        ],
        pasos: [
          "Consigue una oferta de empleo de una empresa canadiense.",
          "Pide a la empresa los documentos de autorización.",
          "Presenta la solicitud en línea.",
          "Entrega huellas y documentos si te los piden."
        ],
        minimo: "Sin mínimo fijo (depende del puesto)"
      },
      {
        id: "working-holiday",
        nombre: "Working Holiday (Experiencia Internacional Canadá)",
        tipo: "Permiso temporal",
        descripcion: "Permiso para jóvenes que quieren viajar y trabajar en Canadá durante un tiempo limitado.",
        datos: {
          "Tasa": "Consulta la tasa actual en la web oficial",
          "Plazo de resolución": "Tras ser seleccionado en el sorteo",
          "Cuándo solicitar": "Cuando abre el plazo de inscripción en el sorteo",
          "Validez": "Hasta 12 o 24 meses según el país",
          "Renovación": "No se renueva"
        },
        aviso: "Hay límite de edad y plazas limitadas: se asignan por sorteo.",
        documentos: [
          "Pasaporte de un país con acuerdo con Canadá.",
          "Dinero suficiente para los primeros meses.",
          "Seguro médico durante toda la estancia.",
          "Certificado de antecedentes penales."
        ],
        pasos: [
          "Comprueba si tu país tiene acuerdo y tu edad.",
          "Entra en el sorteo en el portal oficial.",
          "Si te seleccionan, presenta la solicitud.",
          "Recibe la carta de introducción y viaja."
        ],
        minimo: "Sin mínimo de estudios"
      }
    ]
  },
 
  alemania: {
    nombre: "Alemania",
    bandera: "🇩🇪",
    web: "https://www.make-it-in-germany.com/en/",
    visados: [
      {
        id: "tarjeta-azul",
        nombre: "Tarjeta Azul UE (Blue Card)",
        tipo: "Visados nacionales",
        descripcion: "Para personas con estudios superiores y un contrato de trabajo cualificado en Alemania.",
        datos: {
          "Tasa": "Consulta la tasa en la embajada alemana",
          "Plazo de resolución": "Entre 1 y 3 meses aproximadamente",
          "Cuándo solicitar": "Con el contrato de trabajo ya firmado",
          "Validez": "Según el contrato, hasta 4 años",
          "Renovación": "Se puede renovar en Alemania"
        },
        aviso: "Los títulos extranjeros suelen tener que ser reconocidos en Alemania.",
        documentos: [
          "Formulario de solicitud de visado nacional.",
          "Pasaporte en vigor.",
          "Contrato de trabajo o oferta firmada.",
          "Título universitario y su reconocimiento.",
          "Seguro de salud."
        ],
        pasos: [
          "Consigue un contrato de trabajo cualificado.",
          "Reúne los documentos y haz que reconozcan tu título.",
          "Pide cita en la embajada o consulado.",
          "Entrega la solicitud y espera la resolución."
        ],
        minimo: "Universidad"
      },
      {
        id: "tarjeta-oportunidades",
        nombre: "Tarjeta de Oportunidades (Chancenkarte)",
        tipo: "Visados nacionales",
        descripcion: "Permite viajar a Alemania para buscar trabajo. Se concede por un sistema de puntos.",
        datos: {
          "Tasa": "Consulta la tasa en la embajada alemana",
          "Plazo de resolución": "Varias semanas",
          "Cuándo solicitar": "Antes de viajar, sin necesidad de contrato",
          "Validez": "Hasta 1 año",
          "Renovación": "No consta: consúltalo en la embajada"
        },
        aviso: "Hay que demostrar que tienes dinero para mantenerte mientras buscas trabajo.",
        documentos: [
          "Pasaporte en vigor.",
          "Título o certificado de formación.",
          "Prueba de nivel de idioma (alemán o inglés).",
          "Prueba de fondos suficientes.",
          "Currículum."
        ],
        pasos: [
          "Comprueba que alcanzas los puntos necesarios.",
          "Reúne los documentos.",
          "Pide cita en la embajada.",
          "Viaja y busca trabajo durante la vigencia."
        ],
        minimo: "Grado Medio (FP)"
      },
      {
        id: "trabajador-cualificado",
        nombre: "Visado de trabajador cualificado (FP)",
        tipo: "Visados nacionales",
        descripcion: "Para personas con formación profesional que tienen una oferta de trabajo en su profesión.",
        datos: {
          "Tasa": "Consulta la tasa en la embajada alemana",
          "Plazo de resolución": "Entre 1 y 3 meses aproximadamente",
          "Cuándo solicitar": "Con la oferta de trabajo ya firmada",
          "Validez": "Según el contrato",
          "Renovación": "Se puede renovar en Alemania"
        },
        aviso: "Tu formación debe ser equivalente a una formación profesional alemana.",
        documentos: [
          "Formulario de visado nacional.",
          "Pasaporte en vigor.",
          "Contrato de trabajo.",
          "Títulos y certificados de formación.",
          "Seguro de salud."
        ],
        pasos: [
          "Consigue una oferta de trabajo en tu profesión.",
          "Pide el reconocimiento de tu formación.",
          "Solicita cita en la embajada.",
          "Presenta los documentos."
        ],
        minimo: "Grado Medio (FP)"
      }
    ]
  }
 
};
 
