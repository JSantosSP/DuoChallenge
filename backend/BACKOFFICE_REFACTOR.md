# Refactorización del Backoffice - DuoChallenge

## 📋 Resumen de Cambios

Esta refactorización redefine el rol del administrador en el sistema, haciéndolo más estructurado, escalable y alineado con la generación automática de retos a partir de datos de usuarios.

### Cambios Principales

1. **Generación Automática de Retos**: Los retos ahora se generan automáticamente a partir de los datos que suben los usuarios.
2. **Rol del Administrador Redefinido**: El administrador define plantillas y categorías, pero no crea retos manualmente.
3. **Vista de Solo Lectura**: El administrador puede visualizar niveles generados y datos de usuarios para soporte.

---

## 🗄️ Nuevos Modelos MongoDB

### 1. Category (Categoría)
```javascript
{
  name: String,           // Nombre único de la categoría
  description: String,    // Descripción de la categoría
  active: Boolean,        // Estado activo/inactivo
  timestamps: true
}
```

**Ejemplo**: "Fechas especiales", "Lugares memorables", "Personas importantes"

### 2. LevelTemplate (Plantilla de Nivel)
```javascript
{
  name: String,                 // Nombre de la plantilla
  description: String,          // Descripción
  categoryId: ObjectId,         // Referencia a Category
  dataType: String,             // Tipo de dato: nombre, foto, fecha, lugar, etc.
  challengesPerLevel: Number,   // Número de retos por nivel (1-10)
  difficulty: String,           // easy, medium, hard
  order: Number,                // Orden de aparición
  active: Boolean,              // Estado activo/inactivo
  timestamps: true
}
```

**Tipos de Datos Soportados**:
- `nombre`: Nombres de personas
- `foto`: Imágenes/fotografías
- `fecha`: Fechas importantes
- `lugar`: Ubicaciones/lugares
- `texto`: Texto libre
- `numero`: Números
- `telefono`: Números telefónicos
- `email`: Correos electrónicos
- `otro`: Otros tipos personalizados

---

## 🔌 Backend - Nuevos Endpoints

### Categorías
```
GET    /admin/categories          - Listar todas las categorías
GET    /admin/categories/:id      - Obtener una categoría
POST   /admin/categories          - Crear categoría
PUT    /admin/categories/:id      - Actualizar categoría
DELETE /admin/categories/:id      - Eliminar categoría (verifica dependencias)
```

### Plantillas de Nivel
```
GET    /admin/level-templates              - Listar plantillas (filtrable por categoryId)
GET    /admin/level-templates/:id          - Obtener una plantilla
GET    /admin/level-templates/data-types   - Obtener tipos de datos disponibles
POST   /admin/level-templates              - Crear plantilla
PUT    /admin/level-templates/:id          - Actualizar plantilla
DELETE /admin/level-templates/:id          - Eliminar plantilla
```

### Niveles Generados (Solo Lectura)
```
GET    /admin/levels                - Listar niveles generados (filtrable por userId)
```

### Datos de Usuarios (Solo Lectura + Toggle)
```
GET    /admin/userdata              - Listar todos los datos de usuarios
PATCH  /admin/userdata/:id/toggle   - Activar/desactivar un dato
```

---

## 🎨 Frontend - Nuevas Páginas

### 1. Categories (`/categories`)
**Funcionalidad**: CRUD completo de categorías
- ✅ Crear nueva categoría
- ✅ Editar categoría existente
- ✅ Eliminar categoría (con validación de dependencias)
- ✅ Activar/desactivar categorías
- 📊 Contador de categorías totales

### 2. Level Templates (`/level-templates`)
**Funcionalidad**: CRUD de plantillas de nivel
- ✅ Crear plantilla con selector de categoría y tipo de dato
- ✅ Editar plantilla existente
- ✅ Eliminar plantilla
- ✅ Configurar número de retos por nivel (1-10)
- ✅ Establecer dificultad (fácil, medio, difícil)
- ✅ Definir orden de aparición
- 📊 Contador de plantillas totales

### 3. Generated Levels (`/generated-levels`)
**Funcionalidad**: Vista de solo lectura de niveles generados
- 👁️ Ver todos los niveles generados automáticamente
- 🔍 Ver detalles de cada nivel (retos asociados, usuario, estado)
- 📊 Estadísticas de niveles (completados, en progreso, total retos)
- ⚠️ Indicador visual de "solo lectura"

### 4. User Data (`/userdata`) - Actualizada
**Funcionalidad**: Vista y gestión de datos de usuarios
- 👁️ Ver datos de todos los usuarios
- 🔄 Activar/desactivar datos específicos (para soporte)
- 📋 Ver detalles completos de datos por usuario
- ℹ️ Información de ayuda para gestión

---

## 📂 Estructura de Archivos

### Backend
```
backend/src/
├── models/
│   ├── Category.model.js           ✨ NUEVO
│   ├── LevelTemplate.model.js      ✨ NUEVO
│   └── index.js                    📝 Actualizado
├── controllers/
│   ├── category.controller.js      ✨ NUEVO
│   ├── levelTemplate.controller.js ✨ NUEVO
│   └── admin.controller.js         📝 Actualizado
├── routes/
│   ├── category.routes.js          ✨ NUEVO
│   ├── levelTemplate.routes.js     ✨ NUEVO
│   └── admin.routes.js             📝 Actualizado
└── server.js                        📝 Actualizado
```

### Frontend
```
backoffice/src/
├── pages/
│   ├── Categories.jsx              ✨ NUEVO
│   ├── LevelTemplates.jsx          ✨ NUEVO
│   ├── GeneratedLevels.jsx         ✨ NUEVO
│   └── UserData.jsx                📝 Actualizado
├── router/
│   └── index.jsx                   📝 Actualizado
└── components/
    └── Layout/
        └── Sidebar.jsx             📝 Actualizado
```

---

## 🔐 Autenticación y Permisos

Todos los nuevos endpoints requieren:
- ✅ Token JWT válido (`verifyToken`)
- ✅ Rol de administrador (`checkRole('admin')`)

---

## 🎯 Flujo de Trabajo del Administrador

### Antes (Sistema Antiguo)
1. Admin crea plantillas de retos
2. Admin crea variables de datos
3. Admin crea retos manualmente
4. Admin asigna retos a usuarios

### Ahora (Sistema Nuevo)
1. **Admin crea Categorías** (Ej: "Fechas Especiales", "Lugares Memorables")
2. **Admin crea Plantillas de Nivel** vinculadas a categorías
   - Define tipo de dato (nombre, foto, fecha, etc.)
   - Establece número de retos por nivel
   - Configura dificultad
3. **Sistema genera niveles automáticamente** usando datos de usuarios
4. **Admin solo visualiza**:
   - Niveles generados (solo lectura)
   - Datos de usuarios (para soporte)
5. **Admin gestiona**:
   - Premios base disponibles
   - Activación/desactivación de datos problemáticos
   - Usuarios (activar/desactivar)

---

## 🚀 Migración del Sistema Antiguo

### Mantenido (Legacy)
Las siguientes secciones se mantienen para compatibilidad:
- `/templates` - Plantillas antiguas (marcadas como "Legacy")
- `/variables` - Variables antiguas (marcadas como "Legacy")

### Recomendación
- Migrar gradualmente plantillas antiguas al nuevo sistema
- Mantener ambos sistemas funcionando durante la transición
- Eventualmente deprecar el sistema antiguo

---

## 📊 Menú de Navegación Reorganizado

### Principal
- 🏠 Dashboard
- 📊 Estadísticas

### Configuración
- 📁 Categorías
- 📋 Plantillas de Nivel
- 🏆 Premios Base

### Consulta (Solo Lectura)
- 🎯 Niveles Generados
- 💾 Datos de Usuarios

### Gestión
- 👤 Usuarios

### Sistema Antiguo (Legacy)
- 🧩 Plantillas (Legacy)
- 📝 Variables (Legacy)

---

## ✅ Validaciones Implementadas

### Categorías
- ✅ Nombre único requerido
- ✅ No se puede eliminar si hay plantillas asociadas
- ✅ Validación de longitud mínima (3 caracteres)

### Plantillas de Nivel
- ✅ Categoría debe existir
- ✅ Tipo de dato debe ser válido
- ✅ Número de retos entre 1 y 10
- ✅ Dificultad debe ser easy/medium/hard

### Datos de Usuario
- ✅ Toggle de estado solo por admin
- ✅ Límite de 1000 resultados para rendimiento

### Niveles Generados
- ✅ Límite de 500 resultados para rendimiento
- ✅ Filtrado por usuario opcional

---

## 🔄 Próximos Pasos Recomendados

1. **Implementar generación automática de niveles**
   - Servicio que tome plantillas activas
   - Use datos de usuarios para crear niveles
   - Asigne retos según configuración de plantilla

2. **Dashboard actualizado**
   - Estadísticas del nuevo sistema
   - Métricas de categorías y plantillas
   - Alertas de datos inactivos

3. **Notificaciones**
   - Alertar cuando un dato de usuario causa problemas
   - Notificar al admin cuando se generen nuevos niveles

4. **Exportación de datos**
   - Exportar niveles generados a CSV/Excel
   - Reportes de uso por categoría

5. **Testing**
   - Tests unitarios para nuevos controllers
   - Tests de integración para flujo completo
   - Tests E2E para interfaz de admin

---

## 📝 Notas de Desarrollo

### Índices MongoDB
Los nuevos modelos incluyen índices optimizados:
```javascript
// LevelTemplate
levelTemplateSchema.index({ categoryId: 1, dataType: 1 });
levelTemplateSchema.index({ active: 1, order: 1 });

// UserData (existente)
userDataSchema.index({ userId: 1, tipoDato: 1 });
```

### Manejo de Errores
- Código 11000: Nombre duplicado (categorías)
- 400: Validación fallida
- 404: Recurso no encontrado
- 500: Error del servidor

### Consideraciones de Rendimiento
- Límites en queries para evitar sobrecarga
- Populate selectivo (solo campos necesarios)
- Paginación futura si crece el volumen de datos

---

## 👥 Soporte y Mantenimiento

Para problemas o preguntas sobre la nueva estructura:
1. Revisar esta documentación
2. Verificar logs del servidor
3. Consultar colecciones de MongoDB directamente
4. Revisar código en los controladores nuevos

---

**Fecha de Refactorización**: 2025-10-11
**Versión**: 2.0.0
**Estado**: ✅ Implementado y funcional
