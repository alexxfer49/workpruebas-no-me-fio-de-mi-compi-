# WorkPath · estructura del proyecto

Web estática (HTML + CSS + JS clásico, sin bundler) + Supabase. Se abre con cualquier servidor estático.

## Estructura

```
css/
  base.css          variables, tipografía, botones (.boton-enlace, .botones button, .btn), badges,
                    tarjetas/fieldset, avisos (.aviso, .error), estados (.estado ok|revisar|leyendo|pendiente|error),
                    animaciones, reduced-motion
  layout.css        cabecera, menú, .banda, .pagina, footer y stepper (.trayecto)
  home.css          portada (index.html)
  cuestionario.css  preguntas, opciones, campos, barra de progreso
  resultado.css     vías, tarjetas y ficha
  visados.css       visados.html
  proceso.css       documentos, subida/lectura, fotografía, privacidad
  panel.css         panel.html
  formulario.css    login.html (hoja independiente)
  visados-ficha.css hoja heredada (antes "Visados ficha.css"): no se carga en ninguna página; borrable
js/
  DATOS Y REGLAS PURAS   visados-datos.js · proceso-datos.js
  SERVICIOS              almacen-documentos.js · imagen-ocr.js · supabase-config.js
  HELPERS DE UI/SESIÓN   ui.js · auth.js · proteger.js
  PÁGINAS                cuestionario.js · resultado.js · visados.js · panel.js · proceso.js
docs/
  REVISION-TEXTOS-Y-PRIVACIDAD.md   pendiente de revisar antes de publicar
```

Orden de carga en `<head>`: `base.css` → `layout.css` → hoja de la página. Las páginas que no cargan `base.css`+`layout.css`
son solo `login.html` (usa `formulario.css`).

Orden de scripts en `proceso.html`: supabase → config → proteger → ui → visados-datos → proceso-datos → tesseract →
imagen-ocr → almacen-documentos → proceso.js.

## Contratos que NO deben cambiar

- **Dirección de proceso:** `proceso.html?origen=Honduras&pais=espana&visado=<id>`.
- **Almacen** (`js/almacen-documentos.js`), todas devuelven Promise:
  `cargar(ctx) → { [idx]: { foto, estado, listo } }`, `guardarFoto(ctx, idx, blob, estado, listo)`,
  `guardarListo(ctx, idx, listo)`, `quitarFoto(ctx, idx)`. `ctx = { pais, visado }`. `estado` = `"ok" | "revisar" | null`.
  `foto` puede ser `Blob` o URL (string).
  Propiedad opcional `Almacen.modo`: `"local"` (este archivo) o cualquier otro valor/nada = almacenamiento en cuenta;
  solo sirve para elegir el texto de privacidad en `proceso.js`.
- **ImagenOCR** (`js/imagen-ocr.js`): `comprobarArchivo`, `preparar` (JPG, máx. 2000 px), `leer` (cola secuencial), `avisosDeCalidad`, `disponible`.
- **proceso-datos.js:** `documentosDe(v)`, `pasosDe(v)`, `CLAVES_DOC`, `palabrasDe`, `coincidenciasDe`, `sinTildes`, `esFotografia`, `REQUISITOS_FOTO`.

## ⚠️ Almacén de este zip

El `almacen-documentos.js` que venía en el zip era la versión **local** (IndexedDB + localStorage). Si en tu repositorio ya
tienes la versión Supabase (bucket privado `documentos`, tabla `documentos_visado`, URLs firmadas), **sustitúyelo tal cual**:
mantiene el mismo contrato. Opcional: añade `modo: "nube"` a su objeto devuelto.

## Comprobación manual tras cualquier cambio

1. `index.html` → entrar → cuestionario completo → llega a `resultado.html` con vías ordenadas.
2. En una ficha, «Empezar con este visado» → `proceso.html` con título y subtítulo correctos.
3. Subir una foto legible (JPG/PNG): fases visibles, estado «Parece correcto», progreso sube.
4. Subir un PDF → aviso claro, no se guarda nada. Subir una foto borrosa/pequeña → avisos de calidad.
5. Fotografía reciente: se sube sin lectura, lista de comprobación, se marca lista a mano.
6. Recargar: fotos, estados y casillas persisten. «Quitar foto» la elimina.
7. Móvil (≈390 px): sin desbordes ni texto cortado.
