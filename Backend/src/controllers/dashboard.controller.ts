import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getWeeklyProduction = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 7 days if not provided
    const end = endDate ? new Date(String(endDate)) : new Date();
    const start = startDate ? new Date(String(startDate)) : new Date();
    
    if (!startDate) {
        start.setDate(end.getDate() - 6); // 7 days including today
    }
    
    // Set times to start and end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const pedidos = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
        cantAProducir_gramos: true,
      },
    });

    // Group by day
    const productionByDay: Record<string, number> = {};
    
    // Initialize all days in range with 0
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dayKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        productionByDay[dayKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    pedidos.forEach(pedido => {
      const dayKey = pedido.createdAt.toISOString().split('T')[0];
      if (productionByDay[dayKey] !== undefined) {
        productionByDay[dayKey] += pedido.cantAProducir_gramos;
      }
    });

    // Format for frontend
    const data = Object.entries(productionByDay).map(([date, grams]) => ({
      date,
      grams,
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(data);
  } catch (error) {
    console.error('Error getting weekly production:', error);
    res.status(500).json({ error: 'Error al obtener la producción semanal' });
  }
};
