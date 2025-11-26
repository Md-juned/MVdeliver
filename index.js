import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import database from './src/common/config/db.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import config from './src/common/config/envConfig.js';
import path from 'path';
import { createServer } from 'http';
import basicAuth from "express-basic-auth";

// ROUTES
import userRoute from './src/api/user/auth/index.js';
import homeRoute from './src/api/user/home/index.js';
import favoritesRoute from './src/api/user/favorites/index.js';
import cartRoute from './src/api/user/cart/index.js';
import addressesRoute from './src/api/user/addresses/index.js';

import adminRoute from './src/api/admin/auth/index.js';
import productRoute from './src/api/admin/product/index.js';
import restaurantRoute from './src/api/admin/restaurant/index.js';
import deliverymanRoute from './src/api/admin/deliveryman/index.js';
import promotionRoute from './src/api/admin/promotion/index.js';

const app = express();
const server = createServer(app);

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];

    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// STATIC FILES
app.use('/assets', express.static('assets'));
app.use('/templates', express.static(path.join(process.cwd(), "src/templates")));

// PORT / HOST
const port = config.PORT || 3000;
const host = config.HOST || 'localhost';
const serverUrl = `http://${host}:${port}`;


// const swaggerSpec = JSON.parse(fs.readFileSync(new URL('./admin_swagger.json', import.meta.url)));
// app.use('/api-docs-admin', basicAuth({users: { admin: "123456" }, challenge: true,}), swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// const swaggerSpecTest = JSON.parse(fs.readFileSync(new URL('./user_swagger.json', import.meta.url)));
// app.use('/api-docs-user', basicAuth({users: { admin: "123456" }, challenge: true,}), swaggerUi.serve, swaggerUi.setup(swaggerSpecTest))

 

// ---- ADMIN SWAGGER ---- //
const adminSwagger = JSON.parse(
  fs.readFileSync(new URL("./admin_swagger.json", import.meta.url))
);

app.use(
  "/api-docs-admin",
  basicAuth({ users: { admin: "123456" }, challenge: true }),
  swaggerUi.serveFiles(adminSwagger, {}),
  swaggerUi.setup(adminSwagger)
);

// ---- USER SWAGGER ---- //
const userSwagger = JSON.parse(
  fs.readFileSync(new URL("./user_swagger.json", import.meta.url))
);

app.use(
  "/api-docs-user",
  basicAuth({ users: { admin: "123456" }, challenge: true }),
  swaggerUi.serveFiles(userSwagger, {}),
  swaggerUi.setup(userSwagger)
);


app.get('/', (req, res) => {
  res.json({ message: "Hello from server" });
});

// ROUTES
app.use("/user", userRoute);
app.use("/user", homeRoute);
app.use("/user", favoritesRoute);
app.use("/user", cartRoute);
app.use("/user", addressesRoute);

app.use("/admin", adminRoute);
app.use("/admin", productRoute);
app.use("/admin", restaurantRoute);
app.use("/admin", deliverymanRoute);
app.use("/admin", promotionRoute);

// DATABASE
database;
console.log(`Database connected to url ${database.url}`);

// START SERVER
const bindHost = "0.0.0.0";

server.listen(port, bindHost, () => {
  console.log(`Server running on http://${host}:${port}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(`Free the port: lsof -ti:${port} | xargs kill -9`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
