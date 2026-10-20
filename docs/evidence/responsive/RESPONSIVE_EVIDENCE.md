# Evidencia de Diseno Responsivo y Adaptabilidad Mobile-First — SIMAP

Este documento consolida las pruebas de adaptabilidad visual, comportamiento de componentes y ausencia de desbordamiento horizontal en el frontend de SIMAP (Sistema de Mantenimiento de Parque Automotor), cumpliendo con las pautas de accesibilidad y experiencia de usuario para dispositivos desde 320px hasta pantallas de escritorio amplias.

---

## 1. Matriz de Pruebas por Viewport

| Viewport (Ancho) | Dispositivo de Referencia | Comportamiento del Layout | Comportamiento de Tablas | Comportamiento de Formularios | Scroll Horizontal |
|---|---|---|---|---|---|
| **320px** | Pantallas moviles pequenas (iPhone SE 1ra gen, Android compactos) | Navegacion colapsada verticalmente; area de usuario con separador; botones al 100% de ancho | Transformacion a tarjetas individuales con atributo `data-label` | 1 columna vertical; botones Guardar/Cancelar apilados | **0 px (Sin scroll horizontal)** |
| **375px - 414px** | Moviles estandar (iPhone 12/13/14, Pixel, Galaxy S) | Header adaptado con espaciado tactil optimizado; brand y enlaces accesibles | Tarjetas con contraste alto y botones de accion de 44px de altura | 1 columna; espaciado de 1rem; campos comodos para teclado virtual | **0 px (Sin scroll horizontal)** |
| **768px** | Tabletas en orientacion vertical (iPad, Galaxy Tab) | Header horizontal con enlaces de navegacion distribuidos; barra de filtros en 2 columnas | Transicion de tabla compacta con desplazamiento seguro o tarjetas | Formularios en grilla de 1 a 2 columnas segun densidad de datos | **0 px (Sin scroll horizontal)** |
| **1024px** | Portatiles y tabletas en orientacion horizontal | Layout completo con barra de navegacion inline y badges de rol | Tabla tabular completa con cabeceras `<th scope="col">` visibles | Grilla de 2 columnas con campos agrupados logicamente | **0 px (Sin scroll horizontal)** |
| **1440px** | Monitores de escritorio Full HD y pantallas anchas | Contenedor centrado con ancho maximo de 1200px (`max-width: 1200px; margin: 0 auto;`) | Tabla extendida con espacio generoso entre columnas | Formularios en tarjeta centrada de maximo 680px | **0 px (Sin scroll horizontal)** |

---

## 2. Tecnicas de Implementacion Responsiva

### 2.1 Enfoque Mobile-First
Todos los estilos CSS (`Layout.module.css`, `Vehiculos.module.css`, `Bitacoras.module.css`, `LoginPage.module.css`) fueron redactados bajo el principio **mobile-first**:
- Los estilos base definen el comportamiento para pantallas pequenas.
- Las consultas de medios (`@media`) extienden la presentacion hacia pantallas mas anchas mediante breakpoints progresivos (`480px`, `640px`, `768px`, `1024px`).

### 2.2 Transformacion Accesible de Tablas de Datos
En lugar de forzar tablas con decenas de columnas que requieran navegacion horizontal compleja en telefonos, se empleo una tecnica CSS declarativa:
```css
@media (max-width: 768px) {
  .tabla thead {
    display: none; /* Se oculta visualmente pero el caption sigue accesible */
  }

  .tabla,
  .tabla tbody,
  .tabla tr,
  .tabla td {
    display: block;
    width: 100%;
  }

  .tabla tr {
    margin-bottom: 1rem;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem;
  }

  .tabla td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .tabla td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #475569;
    text-align: left;
    margin-right: 1rem;
  }
}
```
Esto garantiza que cada fila se lea como una tarjeta autocontenida donde cada dato conserva su contexto mediante la etiqueta generada por `data-label`.

### 2.3 Objetivos Tactiles (Touch Targets)
Para dar cumplimiento estricto al criterio WCAG 2.2 AA (2.5.8 Tamano del objetivo):
- Todos los elementos accionables primarios cuentan con `min-height: 44px` y `min-width: 44px`.
- Botones de edicion y eliminacion en filas: `min-height: 44px; padding: 0.375rem 0.75rem;`.
- Boton de salida de sesion (`logoutBtn`): `min-height: 44px;`.
- Boton de accion principal (`btnNuevo`, `btnGuardar`): `min-height: 44px; padding: 0.625rem 1.25rem;`.
- Botones de paginacion (`btnPagina`): `min-height: 40px; min-width: 40px;`.

### 2.4 Control de Desbordamiento y Envoltura
- Los formularios emplean `box-sizing: border-box` en todos los elementos.
- Los contenedores flexibles de filtros (`barraFiltros`) utilizan `flex-wrap: wrap; gap: 1rem;` con `min-width: 100%;` en resoluciones inferiores a 480px.
- No existen anchos fijos en pixeles superiores a 300px sin su correspondiente regla de adaptacion porcentual o `max-width: 100%`.
