import express, {Express} from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import * as database from "./config/database";

import clientRoutesApiVer1 from './api/v1/routes/client/index.route';
import adminRoutesApiVer1 from './api/v1/routes/admin/index.route';

dotenv.config();

database.connect();

const app: Express = express();
const port: string = process.env.PORT;

app.use(cors());

app.use(express.json()); // đọc JSON
app.use(express.urlencoded({ extended: true })); // đọc form

app.use(cookieParser()); // đọc cookie

// Client routes
clientRoutesApiVer1(app);

// Admin routes
adminRoutesApiVer1(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});