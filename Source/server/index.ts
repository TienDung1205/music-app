import express, {Express} from 'express';
import dotenv from 'dotenv';
import * as database from "./config/database";

import clientRoutesApiVer1 from './api/v1/routes/client/index.route';

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

clientRoutesApiVer1(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});