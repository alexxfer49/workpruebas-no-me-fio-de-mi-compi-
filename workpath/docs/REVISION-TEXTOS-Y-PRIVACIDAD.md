# Revisión pendiente antes de publicar

Este documento NO es asesoramiento legal. Es una lista de cosas que conviene revisar con las fuentes oficiales
y, en lo legal, con un profesional.

## 1. Documentos y pasos (`js/proceso-datos.js`)
- `DOCS_EXTRA` y `pasosDe()` son orientativos. Contrastar cada vía con la hoja de requisitos del consulado de España
  competente para Honduras y con la sede oficial (extranjería / exteriores).
- Certificado médico: confirmar si se pide y su antigüedad máxima en cada trámite (en hojas de otros consulados
  aparecen plazos como 3 meses; no asumir el mismo para Honduras).
- Antecedentes penales: confirmar antigüedad máxima, apostilla/legalización y traducción jurada si procede.
- Pasaporte: confirmar vigencia mínima exigida (varía entre consulados en las hojas consultadas).
- Revisar `CLAVES_DOC`: son palabras de control orientativas; ajustarlas con documentos reales (con datos tapados).

## 2. Fotografía (`REQUISITOS_FOTO`)
- Criterios comunes encontrados en hojas de consulados: reciente, color, fondo blanco, rostro descubierto y de frente,
  sin gafas/gorro, sin retoque digital (algún consulado remite a la norma ICAO).
- **El tamaño varía por consulado** (en las hojas consultadas aparecen 3×4 cm, 40×40 mm y «tamaño pasaporte»).
  El texto de la web NO fija una medida: confirmar la del consulado de Honduras y, si es única, añadirla.

## 3. Privacidad (datos sensibles)
Se guardan pasaportes, antecedentes penales y certificados médicos (estos últimos, datos de salud: categoría especial en el RGPD).
Revisar con un profesional / el responsable de datos:
- Política de privacidad completa y enlace visible (hoy solo hay un aviso resumido en `proceso.html`).
- Base legal y **consentimiento explícito** para datos de salud antes de subir el certificado médico.
- Plazo de conservación y borrado de cuenta (qué pasa con las fotos del bucket al borrar al usuario).
- Quién tiene acceso (políticas RLS del bucket y de la tabla) y registro de accesos.
- Cifrado en reposo/en tránsito y copias de seguridad.
- Que el texto de «Dónde se guardan» en `proceso.js` (`textoDondeSeGuarda`) sea cierto para la versión desplegada.
- La lectura OCR se hace en el navegador (la imagen no se envía), pero Tesseract.js descarga su modelo de idioma desde un CDN: valorar alojarlo en local.

## 4. Mejoras posibles (no incluidas)
- Convertir la primera página de un PDF a imagen (pdf.js) para aceptar PDF.
- Guardar el texto corregido en la revisión asistida (requiere ampliar el contrato de `Almacen`).
- Alojar en local Supabase JS y Tesseract (+ idioma `spa`) y fijar versiones/SRI.
