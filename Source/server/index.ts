import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import * as database from "./config/database";

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.get('/topics', (req: Request, res: Response) => {
  res.json('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});