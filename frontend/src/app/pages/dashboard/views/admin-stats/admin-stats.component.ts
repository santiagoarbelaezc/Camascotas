import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
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
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 class="text-lg font-bold text-slate-800">Estadísticas de Productos</h3>
            <div class="relative">
              <input type="text" [(ngModel)]="filtroProducto" (ngModelChange)="paginaProd = 1" 
                     placeholder="Buscar producto..." 
                     class="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-brand-turquesa/20 w-full md:w-48">
              <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th class="px-8 py-4">Producto</th>
                  <th class="px-8 py-4 text-right">Vistas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let prod of productosPaginados" class="hover:bg-slate-50/30 transition-colors group">
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
          <!-- Pagination -->
          <div class="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center gap-2" *ngIf="totalPaginasProd > 1">
             <button (click)="paginaProd = paginaProd - 1" [disabled]="paginaProd === 1" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
             <span class="text-xs font-bold text-slate-500 self-center">Página {{ paginaProd }} de {{ totalPaginasProd }}</span>
             <button (click)="paginaProd = paginaProd + 1" [disabled]="paginaProd === totalPaginasProd" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>

        <!-- Recent Logs -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800">Últimas Visitas</h3>
            <span class="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-full tracking-wider">Tiempo Real</span>
          </div>
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th class="px-8 py-4">IP Address</th>
                  <th class="px-8 py-4">Página</th>
                  <th class="px-8 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let log of logsPaginados" class="hover:bg-slate-50/30 transition-colors group">
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
          <!-- Pagination -->
          <div class="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center gap-2" *ngIf="totalPaginasLogs > 1">
             <button (click)="paginaLogs = paginaLogs - 1" [disabled]="paginaLogs === 1" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
             <span class="text-xs font-bold text-slate-500 self-center">Página {{ paginaLogs }} de {{ totalPaginasLogs }}</span>
             <button (click)="paginaLogs = paginaLogs + 1" [disabled]="paginaLogs === totalPaginasLogs" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
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

  // Logic for Logs Pagination
  paginaLogs = 1;
  itemsPorPaginaLogs = 10;

  get logsPaginados(): any[] {
    const inicio = (this.paginaLogs - 1) * this.itemsPorPaginaLogs;
    return this.logs.slice(inicio, inicio + this.itemsPorPaginaLogs);
  }

  get totalPaginasLogs(): number {
    return Math.ceil(this.logs.length / this.itemsPorPaginaLogs);
  }

  // Logic for Products Stats
  paginaProd = 1;
  itemsPorPaginaProd = 10;
  filtroProducto = '';

  get productosFiltrados(): any[] {
    if (!this.filtroProducto) return this.topProductos;
    return this.topProductos.filter(p => 
      p.nombre.toLowerCase().includes(this.filtroProducto.toLowerCase())
    );
  }

  get productosPaginados(): any[] {
    const filtrados = this.productosFiltrados;
    const inicio = (this.paginaProd - 1) * this.itemsPorPaginaProd;
    return filtrados.slice(inicio, inicio + this.itemsPorPaginaProd);
  }

  get totalPaginasProd(): number {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPaginaProd);
  }
}
