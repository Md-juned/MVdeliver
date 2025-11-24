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
import adminRoute from './src/api/admin/auth/index.js';
import productRoute from './src/api/admin/product/index.js';
import restaurantRoute from './src/api/admin/restaurant/index.js';
import deliverymanRoute from './src/api/admin/deliveryman/index.js';

const app = express();

const server = createServer(app);

app.use(cors());
app.use(bodyParser.json());

// file upload on local
app.use('/assets', express.static('assets'));

// Serve static files from src/templates 
app.use("/templates", express.static(path.join(process.cwd(), "src/templates")));

// swagger for API documentation
const swaggerSpec = JSON.parse(fs.readFileSync(new URL('./swagger.json', import.meta.url)));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
    res.json({message: "Hello from the server"});
})

// routes
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/admin", productRoute);
app.use("/admin", restaurantRoute);
app.use("/admin", deliverymanRoute);





// database connectivity
database;
console.log(`Database connected to url ${database.url}`)

// server
server.listen(config.PORT, config.HOST, () =>{
    console.log(`Server is running on http://${config.HOST}:${config.PORT}`);
})