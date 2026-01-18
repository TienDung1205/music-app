import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import * as database from "./config/database";

import Topic from './api/v1/models/topic.model';

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.get('/topics', async (req: Request, res: Response) => {
  const topics = await Topic.find({
    deleted: false
  })

  console.log(topics);

  res.json(topics);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});