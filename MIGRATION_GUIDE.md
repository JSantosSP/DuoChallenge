# Guía de Migración al Nuevo Sistema de Backoffice

## 🎯 Objetivo

Esta guía te ayudará a migrar del sistema antiguo de administración al nuevo sistema basado en categorías y plantillas de nivel con generación automática de retos.

---

## 📋 Checklist de Migración

### Fase 1: Preparación (Pre-migración)
- [ ] Backup completo de la base de datos
- [ ] Documentar plantillas actuales y su uso
- [ ] Identificar usuarios activos
- [ ] Verificar que todos tengan node_modules actualizados

### Fase 2: Implementación Backend
- [x] ✅ Nuevos modelos MongoDB creados (Category, LevelTemplate)
- [x] ✅ Controladores nuevos implementados
- [x] ✅ Rutas configuradas
- [x] ✅ Middleware de autenticación aplicado
- [ ] Probar endpoints con Postman/Thunder Client

### Fase 3: Implementación Frontend
- [x] ✅ Páginas nuevas creadas (Categories, LevelTemplates, GeneratedLevels)
- [x] ✅ Router actualizado
- [x] ✅ Sidebar reorganizado
- [x] ✅ Página UserData actualizada
- [ ] Probar navegación y funcionalidad

### Fase 4: Migración de Datos
- [ ] Crear categorías base
- [ ] Migrar plantillas antiguas a nuevas plantillas de nivel
- [ ] Verificar que los datos de usuarios sean compatibles

### Fase 5: Testing
- [ ] Probar creación de categorías
- [ ] Probar creación de plantillas de nivel
- [ ] Verificar visualización de niveles generados
- [ ] Probar gestión de datos de usuarios
- [ ] Verificar restricciones y validaciones

### Fase 6: Deploy
- [ ] Deploy de backend
- [ ] Deploy de frontend
- [ ] Verificar variables de entorno
- [ ] Monitorear logs

---

## 🔄 Proceso de Migración Paso a Paso

### Paso 1: Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd backoffice
npm install
```

### Paso 2: Verificar Base de Datos

Asegúrate de que MongoDB esté corriendo:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Paso 3: Crear Datos Semilla (Seed)

Crea un script de seed para las categorías iniciales:

```bash
cd backend
node src/seeds/seedCategories.js
```

**Contenido de `backend/src/seeds/seedCategories.js`**:

```javascript
const mongoose = require('mongoose');
const { Category } = require('../models');
require('dotenv').config();

const categories = [
  {
    name: 'Fechas Especiales',
    description: 'Fechas importantes y memorables en la relación',
    active: true
  },
  {
    name: 'Lugares Memorables',
    description: 'Lugares significativos visitados juntos',
    active: true
  },
  {
    name: 'Personas Importantes',
    description: 'Familiares, amigos y personas especiales',
    active: true
  },
  {
    name: 'Fotos y Recuerdos',
    description: 'Fotografías y momentos capturados',
    active: true
  },
  {
    name: 'Datos Personales',
    description: 'Información personal y detalles íntimos',
    active: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    // Limpiar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️  Categorías anteriores eliminadas');

    // Insertar nuevas categorías
    const result = await Category.insertMany(categories);
    console.log(`✅ ${result.length} categorías creadas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
```

### Paso 4: Iniciar los Servidores

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd backoffice
npm run dev
```

### Paso 5: Acceder al Backoffice

1. Abre el navegador en `http://localhost:5173`
2. Inicia sesión con credenciales de admin
3. Verifica que veas el nuevo menú

---

## 📊 Mapeo de Funcionalidades

### Sistema Antiguo → Sistema Nuevo

| Sistema Antiguo | Sistema Nuevo | Acción |
|----------------|---------------|--------|
| Variables de datos | Tipos de dato (enum) | Migración automática |
| Plantillas de retos | Plantillas de nivel | Crear nuevas basadas en antiguas |
| Retos manuales | Niveles generados | Sistema automático |
| N/A | Categorías | Crear nuevas |

---

## 🔧 Script de Migración de Plantillas

Crea este script para migrar plantillas antiguas:

**`backend/src/seeds/migrateTemplates.js`**:

```javascript
const mongoose = require('mongoose');
const { ChallengeTemplate, LevelTemplate, Category } = require('../models');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    // Obtener plantillas antiguas
    const oldTemplates = await ChallengeTemplate.find();
    console.log(`📋 Encontradas ${oldTemplates.length} plantillas antiguas`);

    // Obtener categorías
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Migrar cada plantilla
    let migrated = 0;
    for (const oldTemplate of oldTemplates) {
      // Determinar categoría basada en el tipo o categoría antigua
      let categoryId;
      if (oldTemplate.category) {
        categoryId = categoryMap[oldTemplate.category] || categoryMap['Datos Personales'];
      } else {
        // Mapeo por tipo
        switch (oldTemplate.type) {
          case 'date_guess':
            categoryId = categoryMap['Fechas Especiales'];
            break;
          case 'photo_puzzle':
            categoryId = categoryMap['Fotos y Recuerdos'];
            break;
          case 'location':
            categoryId = categoryMap['Lugares Memorables'];
            break;
          default:
            categoryId = categoryMap['Datos Personales'];
        }
      }

      // Determinar tipo de dato
      let dataType = 'otro';
      if (oldTemplate.variables?.includes('fecha')) dataType = 'fecha';
      if (oldTemplate.variables?.includes('lugar')) dataType = 'lugar';
      if (oldTemplate.variables?.includes('nombre')) dataType = 'nombre';
      if (oldTemplate.type === 'photo_puzzle') dataType = 'foto';

      // Crear nueva plantilla
      const newTemplate = new LevelTemplate({
        name: oldTemplate.title || 'Plantilla migrada',
        description: oldTemplate.questionTemplate || '',
        categoryId,
        dataType,
        challengesPerLevel: 3,
        difficulty: oldTemplate.difficulty || 'medium',
        order: migrated,
        active: oldTemplate.active !== false
      });

      await newTemplate.save();
      migrated++;
    }

    console.log(`✅ ${migrated} plantillas migradas exitosamente`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrate();
```

**Ejecutar**:
```bash
node backend/src/seeds/migrateTemplates.js
```

---

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad Retroactiva
- El sistema antiguo (Templates y Variables) sigue funcionando
- Ambos sistemas pueden coexistir
- Migración gradual recomendada

### 2. Datos de Usuarios
- Los datos de usuarios existentes siguen siendo válidos
- Asegúrate de que el campo `tipoDato` coincida con los nuevos tipos

### 3. Niveles Existentes
- Los niveles ya generados NO se ven afectados
- Solo aplica a nuevos niveles generados después de la migración

### 4. Premios
- Los premios existentes siguen funcionando sin cambios
- Usa la sección "Premios Base" para gestionar

---

## 🧪 Testing Post-Migración

### Test 1: Crear Categoría
1. Ve a `/categories`
2. Crea una categoría de prueba
3. Verifica que aparezca en la lista
4. Edítala y verifica cambios
5. Intenta eliminarla (debe funcionar si no tiene plantillas)

### Test 2: Crear Plantilla de Nivel
1. Ve a `/level-templates`
2. Crea una plantilla de prueba
3. Selecciona la categoría creada
4. Verifica que aparezca con todos los datos

### Test 3: Ver Niveles Generados
1. Ve a `/generated-levels`
2. Verifica que se muestren niveles existentes
3. Click en "Ver detalles" de un nivel
4. Verifica que toda la información sea correcta

### Test 4: Gestionar Datos de Usuario
1. Ve a `/userdata`
2. Selecciona un usuario
3. Verifica que se muestren sus datos
4. Prueba activar/desactivar un dato

---

## 🚨 Rollback (En caso de problemas)

Si algo sale mal, puedes revertir:

### Opción 1: Rollback de Código
```bash
git checkout [commit-anterior]
npm install
npm start
```

### Opción 2: Rollback de Base de Datos
```bash
mongorestore --db duochallenge /path/to/backup
```

### Opción 3: Desactivar Nuevas Rutas
Comenta las nuevas rutas en `server.js`:
```javascript
// app.use('/admin/categories', categoryRoutes);
// app.use('/admin/level-templates', levelTemplateRoutes);
```

---

## 📈 Monitoreo Post-Migración

### Logs a Revisar
1. Errores en console del navegador
2. Logs del servidor backend
3. Queries lentas en MongoDB
4. Errores de validación

### Métricas Importantes
- Tiempo de respuesta de endpoints
- Número de categorías creadas
- Número de plantillas activas
- Tasa de error en creación de niveles

---

## ✅ Confirmación de Migración Exitosa

La migración es exitosa cuando:
- [ ] ✅ Puedes crear categorías sin errores
- [ ] ✅ Puedes crear plantillas de nivel sin errores
- [ ] ✅ Los niveles generados se visualizan correctamente
- [ ] ✅ La gestión de datos de usuarios funciona
- [ ] ✅ No hay errores en consola de navegador
- [ ] ✅ No hay errores en logs del servidor
- [ ] ✅ Los usuarios pueden seguir jugando sin problemas

---

## 🆘 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del servidor
2. Verifica la consola del navegador
3. Consulta esta guía
4. Revisa `BACKOFFICE_REFACTOR.md` para detalles técnicos
5. Contacta al equipo de desarrollo

---

**Fecha**: 2025-10-11
**Versión**: 2.0.0
**Estado**: 📋 Guía completa de migración
