
# Segundo Parcial – Aplicaciones Híbridas

Aplicación fullstack con gestión de proyectos, tareas e instrucciones diseñada para simular un flujo de trabajo real entre un **Project Manager (PM)** y traductores freelancers.

---

## Tecnologías utilizadas

### **Frontend**
- React  
- React Router  
- Context API  
- TailwindCSS  
- Axios  

### **Backend**
- Node.js  
- Express  
- MongoDB (driver nativo)  
- JWT  
- bcrypt  

---

## Autenticación y Roles

El sistema incluye un flujo completo de autenticación:

- Registro y Login  
- Contraseñas hasheadas con bcrypt  
- Generación de tokens JWT  
- Middleware de autenticación  
- Control de permisos por rol:  
  - **PM (Project Manager)**  
  - **Translator**

---

## Funcionalidades del PM (Project Manager)

- Crear proyectos  
- Editar nombre, descripción y estado  
- Eliminar proyectos  
- Ver detalle del proyecto  
- Crear tareas  
- Editar tareas (título, descripción, deadline, traductor asignado)  
- Cambiar estado  
- Reasignar tareas rechazadas  
- Eliminar tareas  
- Gestionar instrucciones (crear, editar, eliminar)

---

## Funcionalidades del Traductor

- Ver únicamente tareas asignadas  
- Tareas agrupadas por proyecto  
- Cambiar estado:  
  - **PENDING → ACCEPTED**  
  - **PENDING → REJECTED**  
  - **ACCEPTED → COMPLETED**  
- Ver fecha de completado  
- No puede acceder a proyectos ajenos  
- No puede modificar tareas ajenas  
- Las tareas rechazadas desaparecen del dashboard

---

## Lógica de estados implementada

### **Traductor**
- `PENDING → ACCEPTED`  
- `PENDING → REJECTED` (se desasigna y desaparece)  
- `ACCEPTED → COMPLETED` (registra fecha)

### **PM**
- Puede cambiar estados libremente  
- Puede reasignar tareas cuando están REJECTED  

---

## Protección de rutas

- Validación de JWT en el backend  
- Verificación por rol  
- Validación de `ownerId` para PMs  
- Validación de `assignedTo` para traductores  
- Las tareas rechazadas no se envían en las solicitudes  
- Rutas protegidas en frontend con React Router

---

## Informe del parcial

El informe completo del parcial se encuentra en el repositorio como PDF.

---

## Instalación en entorno local

### Backend
```
cd backend
npm install
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

---

## ✔ Estado del proyecto

**Proyecto finalizado**

---
