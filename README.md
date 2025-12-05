

# Importante
proxy.conf.json es para evitar CORS durante el desarrollo

# CRM 

## Backend (Spring Boot)
- Arranque: mvn clean 
            mvn -f backend/pom.xml spring-boot:run
- URL: http://localhost:9080/

## Frontend (Angular)
- Instalar: cd frontend y npm install
- Desarrollo: 
npm start  # con proxy.conf.json 
o 
ng serve --proxy-config proxy.conf.json
- URL: http://localhost:4200/

## Base de datos (MySQL)
- CREATE DATABASE crmdb;
    ejecutar docs/schema.sql y docs/data.sql en MySQL Workbench
La base de datos es: crmdb


## Endpoints
- /api/clientes, /api/productos, /api/proveedores, /api/ventas, /api/compras, /api/interacciones, /api/auth

## Docker
-docker-compose up -d