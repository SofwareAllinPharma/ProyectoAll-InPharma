import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma'; // prisma es la instancia única del Prisma Client, sirve para hablar con la base de datos PostgreSQL usando schema.prisma
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

//Healthcheck endpoint, sirve para monitorear si la API y la base de datos están funcionando correctamente
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      db: 'up',
      time: new Date().toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      db: 'down',
      error: e?.message ?? 'unknown',
    });
  }
});


// Routes
app.use('/', (req, res) => {
  res.send('API corriendo correctamente');
});



app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));