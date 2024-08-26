import express from 'express';
import { knex } from 'knex';
import dbConfig  from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createGetEventsController } from './controllers/get-events';
import { getSettingsByClientId, putSettingsByClientId } from './controllers/settings';

// initialize Knex
const Knex = knex(dbConfig.development);

// Initialize DALs
const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);


const app = express();

app.use(express.json());

app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));

app.get('/settings/:clientId', getSettingsByClientId);

app.put('/settings/:clientId', putSettingsByClientId);

app.use('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

app.listen(3000, () => {
  console.log('Server Started')
});
