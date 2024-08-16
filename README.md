# Entrega Final - Curso de Backend - CODERHOUSE
# Proyecto de Aplicación Web

Este proyecto es una aplicación web construida con Node.js, que incluye funcionalidades como gestión de productos, carrito de compras, autenticación de usuarios, y más. A continuación, se detallan las características principales, la estructura del proyecto y cómo configurarlo y ejecutarlo en tu entorno local.

## Características

- **Gestión de Productos:** CRUD de productos con vistas y controladores.
- **Carrito de Compras:** Permite agregar y eliminar productos del carrito.
- **Autenticación de Usuarios:** Registro, inicio de sesión, y restablecimiento de contraseña.
- **Chat en Tiempo Real:** Comunicación entre usuarios mediante websockets.
- **Sistema de Envío de Correos:** Notificaciones por correo para diferentes eventos.

## Requisitos

- Node.js 14.x o superior
- npm 6.x o superior

## Instalación

1. Clona este repositorio:
    ```bash
    git clone https://github.com/fede_readyset/backend-course-entrega-final.git
    cd backend-course-entrega-final
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Configura las variables de entorno necesarias en un archivo `.env`.

## Uso

Para iniciar la aplicación en un entorno de desarrollo, utiliza el siguiente comando:

```bash
npm start
```

Esto iniciará el servidor en http://localhost:3000.

## Estructura del proyecto
```
├── src/
│   ├── controllers/          # Controladores de la aplicación
│   ├── routes/               # Definición de rutas
│   ├── services/             # Lógica de negocio
│   ├── views/                # Vistas con Handlebars
│   └── index.js              # Archivo principal de la aplicación
├── test/
│   └── supertest.test.js     # Pruebas automatizadas
├── README.md                 # Documentación del proyecto
└── package.json              # Dependencias y scripts de npm
```

## Scripts disponibles
- `npm start`: Inicia el servidor en modo de producción.
- `npm run dev`: Inicia el servidor en modo de desarrollo con nodemon.
- `npm test`: Ejecuta las pruebas unitarias.

## Contribuciones
Si deseas contribuir a este proyecto, por favor sigue los siguientes pasos:

- Realiza un fork del repositorio.
- Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
- Realiza tus cambios y haz commit de ellos (git commit -am 'Agrega nueva funcionalidad').
- Sube tus cambios (git push origin feature/nueva-funcionalidad).
- Envía un Pull Request.

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para obtener más detalles.

## Contacto
Si tienes alguna duda o sugerencia, puedes contactar al equipo de desarrollo a través de torres.federico@gmail.com

