import { Client } from '@botpress/client';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  token: process.env.BOTPRESS_ACCESS_TOKEN,
  botId: 'c224629f-dc31-4e3f-9ae1-8055d25ae701',
  workspaceId: 'wkspace_01J7H0V7Y417AWH4ZXQZZ9P7HJ'
});

export default client;