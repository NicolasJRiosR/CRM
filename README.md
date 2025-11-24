

# Importante
proxy.conf.json es para evitar CORS durante el desarrollo

# CRM 

## Backend (Spring Boot)
- Arranque: mvn -f backend/pom.xml spring-boot:run
- URL: http://localhost:9080/

## Frontend (Angular)
- Instalar: cd frontend && npm install
- Desarrollo: npm start  # con proxy.conf.json
- URL: http://localhost:4200/

## Base de datos (MySQL)
- Crear: ejecutar docs/schema.sql y docs/data.sql en MySQL Workbench
La base de datos es: crmdb

## Endpoints
- /api/clientes, /api/productos, /api/proveedores, /api/ventas, /api/compras, /api/interacciones, /api/auth
