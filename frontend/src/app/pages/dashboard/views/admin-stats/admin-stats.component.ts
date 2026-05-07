import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
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

      <!-- KPI Cards Row 1 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="kpi-card">
          <div class="kpi-icon bg-blue-50 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p class="kpi-label">Visitas Hoy</p>
          <h3 class="kpi-value">{{ resumen.hoy }}</h3>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon bg-emerald-50 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p class="kpi-label">Usuarios Únicos</p>
          <h3 class="kpi-value">{{ resumen.unicos }}</h3>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon bg-violet-50 text-violet-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="kpi-label">Visitas esta Semana</p>
          <h3 class="kpi-value">{{ resumen.semana }}</h3>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon bg-amber-50 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <p class="kpi-label">Total Histórico</p>
          <h3 class="kpi-value">{{ resumen.total }}</h3>
        </div>
      </div>

      <!-- KPI Cards Row 2 -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="kpi-card">
          <div class="kpi-icon bg-pink-50 text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="kpi-label">Mensajes al Chat</p>
          <h3 class="kpi-value">{{ resumen.totalChat }}</h3>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon bg-orange-50 text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="kpi-label">Tasa de Bots</p>
          <h3 class="kpi-value">{{ resumen.tasaBots }}%</h3>
        </div>

        <div class="kpi-card col-span-2 md:col-span-1">
          <div class="kpi-icon bg-teal-50 text-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p class="kpi-label">Página Top</p>
          <h3 class="kpi-value text-lg truncate" [title]="resumen.paginaTop">{{ resumen.paginaTop }}</h3>
        </div>
      </div>

      <!-- Traffic Chart -->
      <div class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-6">Tráfico en la última semana</h3>
        <div class="h-[300px]">
          <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="'line'"></canvas>
        </div>
      </div>

      <!-- Pages Ranking + Chat Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Pages Ranking -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-50">
            <h3 class="text-lg font-bold text-slate-800">Páginas más visitadas</h3>
            <p class="text-xs text-slate-400 mt-1">Rutas con más tráfico del sitio</p>
          </div>
          <div class="p-6 space-y-4">
            <div *ngFor="let p of paginasRanking" class="space-y-1">
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-slate-600 truncate max-w-[60%]">{{ p.pagina_visitada }}</span>
                <span class="text-xs font-black text-brand-turquesa">{{ p.total }} visitas</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-brand-turquesa to-blue-400 rounded-full transition-all duration-700"
                     [style.width.%]="p.porcentaje"></div>
              </div>
            </div>
            <p *ngIf="paginasRanking.length === 0" class="text-center text-slate-400 text-sm py-4">Sin datos aún</p>
          </div>
        </div>

        <!-- Chat Activity -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-50">
            <h3 class="text-lg font-bold text-slate-800">Actividad del Chat Husky 🐾</h3>
            <p class="text-xs text-slate-400 mt-1">Últimos 7 días</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center p-3 bg-slate-50 rounded-2xl">
                <p class="text-2xl font-black text-slate-800">{{ chatData.totalMensajes }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Total Msj</p>
              </div>
              <div class="text-center p-3 bg-slate-50 rounded-2xl">
                <p class="text-2xl font-black text-brand-turquesa">{{ chatData.totalUsuario }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Del Usuario</p>
              </div>
              <div class="text-center p-3 bg-slate-50 rounded-2xl">
                <p class="text-2xl font-black text-violet-600">{{ chatData.sesionesUnicas }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Sesiones</p>
              </div>
            </div>
            <div class="h-[160px]">
              <canvas baseChart [data]="chatChartData" [options]="chatChartOptions" [type]="'bar'"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Devices + Products -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Device & Browser Breakdown -->
        <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-50">
            <h3 class="text-lg font-bold text-slate-800">Dispositivos y Navegadores</h3>
            <p class="text-xs text-slate-400 mt-1">Perfil tecnológico de los visitantes</p>
          </div>
          <div class="p-6 grid grid-cols-2 gap-6">
            <!-- Dispositivos donut -->
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Dispositivo</p>
              <div class="h-[160px]">
                <canvas baseChart [data]="dispositivosChartData" [options]="donutOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
            <!-- Navegadores donut -->
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Navegador</p>
              <div class="h-[160px]">
                <canvas baseChart [data]="navegadoresChartData" [options]="donutOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
          </div>
        </div>

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
                <tr *ngFor="let prod of productosPaginados" class="hover:bg-slate-50/30 transition-colors">
                  <td class="px-8 py-4"><span class="text-sm font-bold text-slate-600">{{ prod.nombre }}</span></td>
                  <td class="px-8 py-4 text-right">
                    <span class="px-3 py-1 bg-brand-turquesa/10 text-brand-turquesa text-xs font-black rounded-full">{{ prod.vistas }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center gap-2" *ngIf="totalPaginasProd > 1">
            <button (click)="paginaProd = paginaProd - 1" [disabled]="paginaProd === 1" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <span class="text-xs font-bold text-slate-500 self-center">Página {{ paginaProd }} de {{ totalPaginasProd }}</span>
            <button (click)="paginaProd = paginaProd + 1" [disabled]="paginaProd === totalPaginasProd" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
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
                <th class="px-8 py-4">Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let log of logsPaginados" class="hover:bg-slate-50/30 transition-colors">
                <td class="px-8 py-4"><span class="text-sm font-mono text-slate-600">{{ log.ip_address }}</span></td>
                <td class="px-8 py-4"><span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{{ log.pagina_visitada }}</span></td>
                <td class="px-8 py-4 text-xs text-slate-400">{{ log.fecha_visita | date:'shortTime' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center gap-2" *ngIf="totalPaginasLogs > 1">
          <button (click)="paginaLogs = paginaLogs - 1" [disabled]="paginaLogs === 1" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <span class="text-xs font-bold text-slate-500 self-center">Página {{ paginaLogs }} de {{ totalPaginasLogs }}</span>
          <button (click)="paginaLogs = paginaLogs + 1" [disabled]="paginaLogs === totalPaginasLogs" class="p-2 disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .kpi-card {
      background: white; padding: 1.5rem; border-radius: 1.5rem;
      border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      display: flex; flex-direction: column; gap: 0.5rem;
      transition: box-shadow 0.2s;
    }
    .kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .kpi-icon { width: 3rem; height: 3rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
    .kpi-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; }
    .kpi-value { font-size: 1.75rem; font-weight: 900; color: #1e293b; line-height: 1; }
  `]
})
export class AdminStatsComponent implements OnInit {

  resumen: any = { hoy: 0, unicos: 0, total: 0, semana: 0, paginaTop: '—', tasaBots: 0, totalChat: 0 };
  logs: any[] = [];
  topProductos: any[] = [];
  paginasRanking: any[] = [];
  chatData: any = { totalMensajes: 0, totalUsuario: 0, sesionesUnicas: 0, grafica: [] };

  // ── Traffic Chart ──────────────────────────────────────────
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [{
      data: [], label: 'Visitas',
      backgroundColor: 'rgba(79,70,229,0.1)', borderColor: '#4f46e5',
      pointBackgroundColor: '#4f46e5', fill: 'origin', tension: 0.4
    }],
    labels: []
  };
  public lineChartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  };

  // ── Chat Chart ─────────────────────────────────────────────
  public chatChartData: ChartConfiguration['data'] = {
    datasets: [{
      data: [], label: 'Mensajes',
      backgroundColor: 'rgba(0,179,188,0.7)', borderRadius: 8
    }],
    labels: []
  };
  public chatChartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  };

  // ── Donut Charts ───────────────────────────────────────────
  public dispositivosChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [], backgroundColor: ['#00B3BC', '#B1D616'] }],
    labels: ['Móvil', 'Desktop']
  };
  public navegadoresChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [], backgroundColor: ['#4f46e5', '#f59e0b', '#ef4444', '#10b981', '#94a3b8'] }],
    labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Otro']
  };
  public donutOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } }
  };

  // ── Pagination ─────────────────────────────────────────────
  paginaLogs = 1; itemsPorPaginaLogs = 10;
  paginaProd = 1; itemsPorPaginaProd = 10; filtroProducto = '';

  constructor(private statsService: StatsService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.statsService.getResumen().subscribe({
      next: (res) => { if (res) this.resumen = { ...this.resumen, ...res }; }
    });
    this.statsService.getLogs().subscribe({
      next: (res) => { if (Array.isArray(res)) this.logs = res; }
    });
    this.statsService.getTopProductos().subscribe({
      next: (res) => { if (Array.isArray(res)) this.topProductos = res; }
    });
    this.statsService.getGrafica().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.lineChartData.labels = res.map((i: any) => i.fecha);
          this.lineChartData.datasets[0].data = res.map((i: any) => i.cantidad);
        }
      }
    });
    this.statsService.getPaginasRanking().subscribe({
      next: (res) => { if (Array.isArray(res)) this.paginasRanking = res; }
    });
    this.statsService.getDispositivos().subscribe({
      next: (res) => {
        if (res?.dispositivos) {
          this.dispositivosChartData.datasets[0].data = [res.dispositivos['Movil'] ?? 0, res.dispositivos['Desktop'] ?? 0];
        }
        if (res?.navegadores) {
          const nav = res.navegadores;
          this.navegadoresChartData.datasets[0].data = [nav.Chrome ?? 0, nav.Safari ?? 0, nav.Firefox ?? 0, nav.Edge ?? 0, nav.Otro ?? 0];
        }
      }
    });
    this.statsService.getChatActividad().subscribe({
      next: (res) => {
        if (res) {
          this.chatData = res;
          if (Array.isArray(res.grafica)) {
            this.chatChartData.labels = res.grafica.map((i: any) => i.fecha);
            this.chatChartData.datasets[0].data = res.grafica.map((i: any) => i.mensajes);
          }
        }
      }
    });
  }

  get logsPaginados(): any[] {
    const inicio = (this.paginaLogs - 1) * this.itemsPorPaginaLogs;
    return this.logs.slice(inicio, inicio + this.itemsPorPaginaLogs);
  }
  get totalPaginasLogs(): number { return Math.ceil(this.logs.length / this.itemsPorPaginaLogs); }

  get productosFiltrados(): any[] {
    if (!this.filtroProducto) return this.topProductos;
    return this.topProductos.filter(p => p.nombre.toLowerCase().includes(this.filtroProducto.toLowerCase()));
  }
  get productosPaginados(): any[] {
    const inicio = (this.paginaProd - 1) * this.itemsPorPaginaProd;
    return this.productosFiltrados.slice(inicio, inicio + this.itemsPorPaginaProd);
  }
  get totalPaginasProd(): number { return Math.ceil(this.productosFiltrados.length / this.itemsPorPaginaProd); }
}
