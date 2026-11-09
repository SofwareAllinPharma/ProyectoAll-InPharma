import { InventarioGlobalService } from '../../inventario/services/inventario.service';
import { MovimientoService } from '../../movimientos/services/movimiento.service';
import type { InventoryAlerts, CompanyAlertsData, PendingMovementAlert } from '../types/dashboard.types';

export const DashboardAlertsService = {
  async getInventoryAlerts(): Promise<InventoryAlerts> {
    try {
      const resumen = await InventarioGlobalService.getResumenEstadosGlobal();
      
      return {
        total: resumen.bajo + resumen.critico,
        critico: resumen.critico,
        bajo: resumen.bajo,
      };
    } catch (error) {
      console.error('DashboardService.getInventoryAlerts error', error);
      return {
        total: 0,
        critico: 0,
        bajo: 0,
      };
    }
  },

  async getCompanyAlerts(): Promise<CompanyAlertsData> {
    try {
      // Obtener movimientos pendientes
      const movimientos = await MovimientoService.getAllMovimientos();
      const pendingMovements: PendingMovementAlert[] = movimientos
        .filter(m => m.estado === 'CREADO' || m.estado === 'EN_CAMINO')
        .map(m => {
          let fechaCreacion = new Date(m.fechaCreacion);
          if (isNaN(fechaCreacion.getTime())) {
             fechaCreacion = new Date();
          }
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - fechaCreacion.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

          let tiempoTranscurrido = '';
          if (diffDays === 0) {
             tiempoTranscurrido = `${diffHours} horas`;
          } else {
             tiempoTranscurrido = `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
             if (diffHours > 0) {
                tiempoTranscurrido += ` y ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
             }
          }

          return {
            idMovimiento: m.id,
            referencia: m.referencia || `MOV-${m.id}`,
            origen: m.depositoOrigen?.nombre || 'Desconocido',
            destino: m.depositoDestino?.nombre || 'Externo',
            estado: m.estado,
            fecha: m.fechaCreacion,
            diasPendiente: diffDays,
            tiempoTranscurrido,
            nombreProducto: m.producto?.nombreComercial || 'Producto desconocido',
            responsable: m.responsable || 'Sin responsable asignado'
          };
        });

      return {
        movimientos: pendingMovements
      };

    } catch (error) {
      console.error('Error fetching company alerts:', error);
      return { movimientos: [] };
    }
  },
};
