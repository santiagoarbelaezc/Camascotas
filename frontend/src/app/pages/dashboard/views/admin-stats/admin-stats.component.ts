import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="p-2 lg:p-4 space-y-8 animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Analíticas de Tráfico</h1>
        <p class="text-slate-500 mt-1">Monitoreo en tiempo real de visitantes y actividad.</p>
      </header>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Visitas Hoy</p>
              <h3 class="text-2xl font-black text-slate-800">{{ resumen.hoy }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuarios Únicos</p>
              <h3 class="text-2xl font-black text-slate-800">{{ resumen.unicos }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Histórico</p>
              <h3 class="text-2xl font-black text-slate-800">{{ resumen.total }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-6">Tráfico en la última semana</h3>
        <div class="h-[300px]">
          <canvas baseChart
            [data]="lineChartData"
            [options]="lineChartOptions"
            [type]="'line'">
          </canvas>
        </div>
      </div>

      <!-- Top Products and Recent Logs Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Top Products -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-50">
            <h3 class="text-lg font-bold text-slate-800">Top 10 Productos</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th class="px-8 py-4">Producto</th>
                  <th class="px-8 py-4 text-right">Vistas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let prod of topProductos" class="hover:bg-slate-50/30 transition-colors group">
                  <td class="px-8 py-4">
                    <span class="text-sm font-bold text-slate-600">{{ prod.nombre }}</span>
                  </td>
                  <td class="px-8 py-4 text-right">
                    <span class="px-3 py-1 bg-brand-turquesa/10 text-brand-turquesa text-xs font-black rounded-full">{{ prod.vistas }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Logs -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800">Últimas Visitas</h3>
            <span class="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full tracking-wider">Tiempo Real</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th class="px-8 py-4">IP Address</th>
                  <th class="px-8 py-4">Página</th>
                  <th class="px-8 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let log of logs" class="hover:bg-slate-50/30 transition-colors group">
                  <td class="px-8 py-4">
                    <span class="text-sm font-mono text-slate-600">{{ log.ip_address }}</span>
                  </td>
                  <td class="px-8 py-4">
                    <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{{ log.pagina_visitada }}</span>
                  </td>
                  <td class="px-8 py-4 text-xs text-slate-400">{{ log.fecha_visita | date:'shortTime' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminStatsComponent implements OnInit {
  resumen = { hoy: 0, unicos: 0, total: 0 };
  logs: any[] = [];
  topProductos: any[] = [];

  // Chart Data
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Visitas',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: '#4f46e5',
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  constructor(private statsService: StatsService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.statsService.getResumen().subscribe({
      next: (res) => { if (res) this.resumen = res; },
      error: (err) => console.error('Error resumen:', err)
    });
    this.statsService.getLogs().subscribe({
      next: (res) => { if (Array.isArray(res)) this.logs = res; },
      error: (err) => console.error('Error logs:', err)
    });
    this.statsService.getTopProductos().subscribe({
      next: (res) => { if (Array.isArray(res)) this.topProductos = res; },
      error: (err) => console.error('Error top productos:', err)
    });
    this.statsService.getGrafica().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.lineChartData.labels = res.map((i: any) => i.fecha);
          this.lineChartData.datasets[0].data = res.map((i: any) => i.cantidad);
        }
      },
      error: (err) => console.error('Error grafica:', err)
    });
  }
}
