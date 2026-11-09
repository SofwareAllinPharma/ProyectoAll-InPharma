import { DashboardChartsService } from './dashboard.charts.service';
import { DashboardAlertsService } from './dashboard.alerts.service';

export const DashboardService = {
  ...DashboardChartsService,
  ...DashboardAlertsService,
};
