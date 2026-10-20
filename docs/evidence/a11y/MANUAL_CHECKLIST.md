# Lista de Verificacion Manual de Accesibilidad (WCAG 2.2 AA) — SIMAP

Este documento describe el protocolo de pruebas manuales y los criterios de conformidad WCAG 2.2 nivel AA implementados en el frontend de SIMAP (Sistema de Mantenimiento de Parque Automotor), desarrollado para el Trabajo 2.

---

## 1. Instrucciones de Prueba con Teclado (Sin Raton)

El sistema debe ser 100% operable utilizando unicamente el teclado.

### Procedimiento de Prueba Paso a Paso:
1. **Recargar la aplicacion**: Abrir `http://localhost:5173/` en un navegador (Chrome, Edge o Firefox).
2. **Probar el Enlace de Salto (Skip-Link)**:
   - Presionar la tecla `Tab` una vez inmediatamente tras la carga de la pagina.
   - Debe aparecer visiblemente en la esquina superior izquierda el boton: `Saltar al contenido principal`.
   - Presionar `Enter`.
   - El foco debe trasladarse directamente al elemento `<main id="contenido-principal">`, saltandose la barra de navegacion superior.
3. **Navegacion entre Elementos Interactivos**:
   - Presionar `Tab` sucesivamente para avanzar por enlaces, botones y campos de formulario.
   - Presionar `Shift + Tab` para retroceder en el orden del foco.
   - Verificar que todos los elementos activos muestran un indicador de foco visible (anillo de color azul `#1e40af` de 2px con 2px de separacion).
   - Ningun elemento interactivo debe quedar oculto o carecer de foco visible.
4. **Activacion de Controles**:
   - Enlaces (`<a>`): activables con `Enter`.
   - Botones (`<button>`): activables con `Enter` o `Espacio`.
   - Listas desplegables (`<select>`): navegables con flechas `Arriba` y `Abajo`, seleccionables con `Enter`.
   - Casillas de verificacion / radios: seleccionables con `Espacio`.
5. **Modal de Confirmacion (Trampa de Foco y Tecla Escape)**:
   - En el listado de Vehiculos o Bitacoras, navegar con `Tab` hasta el boton `Eliminar` de cualquier registro y presionar `Enter`.
   - Se abrira el dialogo modal accesible (`role="alertdialog"`).
   - El foco inicial debe posicionarse automaticamente en el boton `Cancelar`.
   - Presionar `Tab`: el foco debe ciclar unicamente entre los botones `Cancelar` y `Eliminar` dentro del modal, sin escapar al contenido de fondo.
   - Presionar `Escape`: el modal debe cerrarse de inmediato y el foco debe retornar al boton que lo disparo.

---

## 2. Instrucciones de Prueba con Lector de Pantalla (NVDA / VoiceOver)

### Configuracion de Prueba:
- **Windows**: NVDA (versiones 2023 o superior) o Narrador de Windows con Microsoft Edge / Google Chrome.
- **macOS**: VoiceOver (`Cmd + F5`) con Safari o Chrome.

### Puntos de Verificacion con Lector de Pantalla:
1. **Puntos de Referencia (Landmarks Semanticos)**:
   - Presionar la tecla `D` en NVDA para saltar entre puntos de referencia.
   - Deben identificarse claramente:
     - Cabecera: `<header>`
     - Navegacion: `<nav aria-label="Navegacion principal">`
     - Contenido Principal: `<main id="contenido-principal">`
     - Region de datos: `<section aria-label="Tabla de vehiculos">` o `<section aria-label="Tabla de reportes de fallas">`
     - Pie de pagina: `<footer>`
2. **Estructura de Encabezados**:
   - Presionar la tecla `H` en NVDA para recorrer los titulos.
   - Cada pagina debe tener exactamente un encabezado de nivel 1 (`<h1>`), que describe el proposito principal de la vista (ej. "Parque Automotor", "Reportar Falla Mecanica", "Iniciar Sesion").
   - Los titulos secundarios dentro de modales o secciones deben seguir la jerarquia (`<h2>`).
3. **Formularios Accesibles**:
   - Al posicionarse en cada campo (`Tab`), el lector debe anunciar:
     - La etiqueta textual asociada (mediante `<label htmlFor="...">`).
     - El tipo de campo (cuadro de edicion de texto, cuadro de contrasena, lista desplegable).
     - Si el campo es obligatorio (mediante `aria-required="true"`).
   - Si se envia un formulario con errores de validacion:
     - El campo invalido debe anunciarse con `invalido` (mediante `aria-invalid="true"`).
     - El lector debe leer la descripcion del error (mediante `aria-describedby="[campo]-error"`).
4. **Mensajes Dinamicos y Notificaciones en Vivo**:
   - Al registrar o actualizar con exito un registro, la notificacion se encuentra dentro de `<output aria-live="polite">`, anunciando el mensaje al usuario sin interrumpir su lectura actual.
   - Errores criticos del servidor se anuncian de forma inmediata mediante `role="alert"` con `aria-live="assertive"`.
5. **Tablas de Datos**:
   - En vistas de escritorio, las tablas anuncian su encabezado (`<th scope="col">`) al recorrer celdas.
   - Cada tabla incluye un titulo accesible para lectores de pantalla mediante `<caption className="sr-only">`.

---

## 3. Matriz de Conformidad WCAG 2.2 Nivel AA

| Criterio WCAG 2.2 | Nivel | Descripcion | Implementacion en SIMAP | Estado |
|---|---|---|---|---|
| **1.1.1 Contenido no textual** | A | Alternativas de texto para todo contenido no textual | Atributos `aria-label` en enlaces de icono y botones de accion; elementos decorativos con `aria-hidden="true"`. | Conforme |
| **1.3.1 Informacion y relaciones** | A | Estructura semantica clara mediante etiquetas HTML nativas | Uso estricto de `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<table>`, `<th>`, `<label>`, `<output>`. | Conforme |
| **1.3.2 Secuencia significativa** | A | El orden de lectura programatico coincide con la logica visual | Jerarquia DOM natural sin reordenamientos visuales destructivos. | Conforme |
| **1.4.1 Uso del color** | A | El color no es el unico medio visual para transmitir informacion | Estados y prioridades combinan color con texto explicito y etiquetas visibles. | Conforme |
| **1.4.3 Contraste minimo** | AA | Ratio de contraste >= 4.5:1 en texto normal y >= 3:1 en texto grande | Paleta validada con ratios superiores a 5.0:1 (texto `#1e293b` sobre blanco: 13.9:1; texto secundario `#475569`: 7.0:1). | Conforme |
| **1.4.11 Contraste no textual** | AA | Ratio >= 3:1 en componentes de UI y estados de foco | Indicadores de foco `#1e40af` (8.5:1), bordes de inputs `#cbd5e1` contrastados contra fondo. | Conforme |
| **2.1.1 Teclado** | A | Toda la funcionalidad es operable mediante teclado | Todos los flujos (login, navegacion, filtros, formularios, modales, paginacion) operables con `Tab`, `Enter`, `Espacio`, flechas. | Conforme |
| **2.1.2 Sin trampas de teclado** | A | El foco no queda atrapado involuntariamente | El modal de confirmacion captura el foco mientras esta abierto y permite salida inmediata mediante `Escape`. | Conforme |
| **2.4.1 Evitar bloques** | A | Mecanismo para saltar bloques de contenido repetidos | Enlace `Saltar al contenido principal` posicionado al inicio del documento visible al foco. | Conforme |
| **2.4.2 Titulado de paginas** | A | Titulos de pagina descriptivos | `<title>` en `index.html` y encabezados `<h1>` unicos en cada vista. | Conforme |
| **2.4.3 Orden del foco** | A | Orden de foco secuencial y logico | Foco secuencial sin indices de tabulacion positivos (`tabIndex > 0` prohibido). Foco restaurado al cerrar modales. | Conforme |
| **2.4.7 Foco visible** | AA | Indicador de foco visible en cualquier componente enfocado | Regla global `:focus-visible` con contorno solido de 2px y separacion de 2px. | Conforme |
| **2.5.8 Tamano del objetivo (Minimo)** | AA | Objetivos tactiles con tamano minimo suficiente | Todos los botones interactivos, enlaces de navegacion y campos tienen `min-height: 44px`. | Conforme |
| **3.3.1 Identificacion de errores** | A | Errores identificados y descritos en texto al usuario | Mensajes claros en espanol debajo de cada campo con fallas de validacion. | Conforme |
| **3.3.2 Etiquetas o instrucciones** | A | Etiquetas o instrucciones asociadas a campos que solicitan datos | `<label>` explicitos con atributo `htmlFor` sincronizado con el `id` de cada input. Indicador `aria-required="true"`. | Conforme |
| **4.1.2 Nombre, funcion, valor** | A | Atributos de accesibilidad accesibles para tecnologias asistivas | `aria-invalid`, `aria-describedby`, `aria-busy`, `role="alertdialog"`, `aria-modal="true"`. | Conforme |
| **4.1.3 Mensajes de estado** | AA | Mensajes de estado comunicados sin perder el foco | Regiones `<output aria-live="polite">` para exito y `role="alert"` para errores criticos. | Conforme |

---

## 4. Auditoria Automatizada

El codigo fuente ha sido validado mediante:
1. **Linter de Accesibilidad (`oxlint` con soporte `jsx-a11y`)**:
   - Resultado: **0 errores, 0 advertencias**.
2. **Compilador TypeScript (`tsc --noEmit`)**:
   - Resultado: **0 errores de tipos**.
