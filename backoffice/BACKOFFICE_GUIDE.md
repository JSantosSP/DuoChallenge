# Guía del Backoffice Refactorizado - DuoChallenge

## 🎯 Visión General

El backoffice ha sido completamente refactorizado para adaptarse a un sistema de generación automática de retos. El administrador ahora tiene un rol más estratégico y menos operativo.

---

## 🧭 Navegación

### 📂 Estructura del Menú

#### **Principal**
- **Dashboard**: Resumen general del sistema
- **Estadísticas**: Métricas y análisis

#### **Configuración** (Nuevas funcionalidades principales)
- **Categorías**: Define categorías de datos (Ej: Fechas, Lugares)
- **Plantillas de Nivel**: Configura cómo se generan los niveles
- **Premios Base**: Gestiona premios disponibles

#### **Consulta** (Solo lectura)
- **Niveles Generados**: Ver niveles creados automáticamente
- **Datos de Usuarios**: Ver y gestionar datos de usuarios

#### **Gestión**
- **Usuarios**: Administrar cuentas de usuario

#### **Sistema Antiguo** (Compatibilidad)
- **Plantillas (Legacy)**: Sistema anterior de plantillas
- **Variables (Legacy)**: Sistema anterior de variables

---

## 📘 Guías de Uso

### 1️⃣ Crear una Categoría

**Ruta**: `/categories`

**Pasos**:
1. Click en "➕ Nueva Categoría"
2. Completa el formulario:
   - **Nombre**: Nombre único de la categoría (Ej: "Fechas Especiales")
   - **Descripción**: Descripción detallada
   - **Estado**: Activa (checkbox)
3. Click en "Crear"

**Ejemplo**:
```
Nombre: Fechas Memorables
Descripción: Fechas importantes en la vida de la pareja
Estado: ✓ Activa
```

**Validaciones**:
- ✅ Nombre debe ser único
- ✅ Mínimo 3 caracteres
- ⚠️ No se puede eliminar si tiene plantillas asociadas

---

### 2️⃣ Crear una Plantilla de Nivel

**Ruta**: `/level-templates`

**Pasos**:
1. Click en "➕ Nueva Plantilla"
2. Completa el formulario:
   - **Nombre**: Nombre de la plantilla
   - **Descripción**: Descripción opcional
   - **Categoría**: Selecciona de las categorías activas
   - **Tipo de Dato**: Tipo de dato que usará (nombre, foto, fecha, etc.)
   - **Retos por Nivel**: Cantidad de retos (1-10)
   - **Dificultad**: Fácil, Medio o Difícil
   - **Orden**: Orden de aparición (0 = primero)
   - **Estado**: Activa (checkbox)
3. Click en "Crear"

**Ejemplo**:
```
Nombre: Nivel de Aniversarios
Descripción: Niveles basados en fechas importantes
Categoría: Fechas Memorables
Tipo de Dato: Fecha
Retos por Nivel: 3
Dificultad: Medio
Orden: 0
Estado: ✓ Activa
```

**Tipos de Datos Disponibles**:
- 📝 **Nombre**: Para nombres de personas
- 📷 **Foto**: Para imágenes/fotografías
- 📅 **Fecha**: Para fechas importantes
- 📍 **Lugar**: Para ubicaciones
- 💬 **Texto**: Para texto libre
- 🔢 **Número**: Para números
- 📞 **Teléfono**: Para números telefónicos
- ✉️ **Email**: Para correos electrónicos
- ❓ **Otro**: Para tipos personalizados

---

### 3️⃣ Visualizar Niveles Generados

**Ruta**: `/generated-levels`

**Características**:
- 👁️ **Solo lectura**: No puedes editar, solo visualizar
- 📊 **Estadísticas**: Total de niveles, completados, en progreso
- 🔍 **Ver detalles**: Click en "Ver detalles" para info completa
- 🎯 **Información mostrada**:
  - Título y descripción del nivel
  - Usuario asociado
  - Retos del nivel
  - Estado (completado/en progreso)
  - Fechas de creación y completado

**Filtros**:
- Por usuario (query param: `?userId=xxx`)

---

### 4️⃣ Gestionar Datos de Usuarios

**Ruta**: `/userdata`

**Funcionalidades**:
1. **Ver lista de usuarios**: Solo jugadores (role: 'player')
2. **Click en "Editar"** (ícono de ojo): Ver datos del usuario
3. **En el modal**:
   - Ver todos los datos que ha subido el usuario
   - Ver estado (Activo/Inactivo)
   - **Activar/Desactivar** datos individuales

**Cuándo desactivar un dato**:
- ⚠️ Dato incorrecto o mal formateado
- ⚠️ Contenido inapropiado
- ⚠️ Problemas técnicos con ese dato
- ⚠️ Usuario reportó problema

**Nota**: Desactivar un dato evita que se use para generar nuevos retos.

---

### 5️⃣ Gestionar Premios Base

**Ruta**: `/prizes`

**Funcionalidad**:
- Crear premios disponibles para los usuarios
- Editar premios existentes
- Eliminar premios
- Reiniciar todos los premios (marcar como no usados)

**Campos**:
- Título del premio
- Descripción
- Código/valor del premio
- Estado (usado/disponible)

---

## 🔄 Flujo de Trabajo Recomendado

### Setup Inicial

1. **Crear Categorías** 📁
   ```
   Ejemplo:
   - Fechas Especiales
   - Lugares Memorables
   - Personas Importantes
   - Fotos de Recuerdos
   ```

2. **Crear Plantillas de Nivel** 📋
   ```
   Para cada categoría, crear plantillas que definan:
   - Qué tipo de dato usar
   - Cuántos retos por nivel
   - Dificultad
   ```

3. **Configurar Premios Base** 🏆
   ```
   Agregar premios disponibles para usuarios
   ```

### Operación Diaria

1. **Monitorear Niveles Generados** 🎯
   - Revisar que se generen correctamente
   - Verificar que los retos tengan sentido

2. **Gestionar Datos de Usuarios** 💾
   - Revisar reportes de problemas
   - Desactivar datos problemáticos
   - Reactivar cuando se corrija

3. **Revisar Estadísticas** 📊
   - Analizar métricas de uso
   - Identificar patrones

4. **Soporte a Usuarios** 👥
   - Activar/desactivar cuentas
   - Resolver problemas reportados

---

## 🎨 Características de la Interfaz

### Indicadores Visuales

**Estados**:
- 🟢 Verde: Activo/Completado
- 🟡 Amarillo: En progreso
- 🔴 Rojo: Inactivo/Error
- 🟣 Morado: Categoría
- 🔵 Azul: Tipo de dato

**Badges de Dificultad**:
- 🟢 Verde: Fácil
- 🟡 Amarillo: Medio
- 🔴 Rojo: Difícil

**Iconos**:
- 📁 Categorías
- 📋 Plantillas
- 🎯 Niveles
- 💾 Datos
- 🏆 Premios
- 👤 Usuarios
- 📊 Estadísticas

### Alertas e Información

**Alertas Amarillas** (⚠️):
- Información importante
- Advertencias no críticas

**Alertas Azules** (ℹ️):
- Información de ayuda
- Guías contextuales

**Alertas Rojas** (❌):
- Errores
- Acciones destructivas

---

## ⚙️ Validaciones y Restricciones

### Categorías
- ✅ Nombre único obligatorio
- ✅ Mínimo 3 caracteres
- ❌ No eliminar si tiene plantillas asociadas
- ✅ Puede desactivarse sin eliminar

### Plantillas de Nivel
- ✅ Categoría debe existir y estar activa
- ✅ Tipo de dato debe ser válido
- ✅ Retos por nivel: 1-10
- ✅ Dificultad: easy/medium/hard
- ✅ Puede desactivarse sin eliminar

### Datos de Usuario
- ✅ Solo admin puede activar/desactivar
- ⚠️ Desactivar no elimina el dato
- ✅ Puede reactivarse en cualquier momento

---

## 🆘 Resolución de Problemas

### Problema: No puedo eliminar una categoría
**Solución**: 
1. Verifica que no tenga plantillas asociadas
2. Ve a `/level-templates`
3. Elimina o reasigna las plantillas
4. Intenta eliminar la categoría nuevamente

### Problema: Los niveles no se generan
**Solución**:
1. Verifica que haya plantillas activas
2. Verifica que haya usuarios con datos
3. Verifica que los tipos de dato coincidan
4. Consulta logs del servidor

### Problema: Un dato de usuario causa errores
**Solución**:
1. Ve a `/userdata`
2. Busca el usuario afectado
3. Click en "Ver datos"
4. Desactiva el dato problemático
5. Contacta al usuario para que corrija y suba de nuevo

### Problema: No veo mis cambios en el frontend
**Solución**:
1. Refresca la página (F5)
2. Cierra sesión y vuelve a entrar
3. Limpia caché del navegador
4. Verifica que el backend esté corriendo

---

## 🔧 Configuración Técnica

### Variables de Entorno (Backend)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/duochallenge
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Ejecución Local

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend (Backoffice)**:
```bash
cd backoffice
npm install
npm run dev
```

### Acceso
- Backend: `http://localhost:4000`
- Backoffice: `http://localhost:5173`

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- `BACKOFFICE_REFACTOR.md`: Detalles técnicos de la refactorización
- `README.md`: Documentación general del proyecto
- API Collection: `backend/duochallenge_api_collection.json`

### Contacto y Soporte
Para dudas o problemas:
1. Revisar esta guía
2. Consultar logs del servidor
3. Revisar documentación técnica
4. Contactar al equipo de desarrollo

---

**Última Actualización**: 2025-10-11
**Versión Backoffice**: 2.0.0
