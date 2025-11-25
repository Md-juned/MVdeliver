import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import database from './src/common/config/db.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import config from './src/common/config/envConfig.js';
import path from 'path';
import {createServer} from 'http';
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

// CORS configuration
// For development: allows all origins
// For production: configure ALLOWED_ORIGINS in .env file
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// file upload on local
app.use('/assets', express.static('assets'));

// Serve static files from src/templates 
app.use("/templates", express.static(path.join(process.cwd(), "src/templates")));

// swagger for API documentation
const swaggerSpec = JSON.parse(fs.readFileSync(new URL('./swagger.json', import.meta.url)));

// Update Swagger server URLs to match the actual server configuration
const port = config.PORT || 3000;
const host = config.HOST || 'localhost';
const serverUrl = `http://${host}:${port}`;

// Update swagger servers dynamically
swaggerSpec.servers = [
  {
    url: serverUrl,
    description: 'Current server'
  }
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
    res.json({message: "Hello from the server"});
})

// routes
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






// database connectivity
database;
console.log(`Database connected to url ${database.url}`)

// server
// Note: port and host are already defined above for Swagger config
// Bind to 0.0.0.0 to listen on all network interfaces
// This allows access via both localhost and network IP (192.168.1.35)
// The HOST in .env is still used for Swagger documentation URLs
const bindHost = '0.0.0.0';

server.listen(port, bindHost, () =>{
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Server is also accessible via http://localhost:${port}`);
    console.log(`API Documentation available at http://${host}:${port}/api-docs`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please use a different port.`);
        console.error(`To free the port, run: lsof -ti:${port} | xargs kill -9`);
    } else {
        console.error('Server error:', err.message);
        console.error('Error code:', err.code);
    }
    process.exit(1);
});