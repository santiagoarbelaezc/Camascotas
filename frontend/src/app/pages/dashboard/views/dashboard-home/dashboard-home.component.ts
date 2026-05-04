import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService, Usuario } from '../../../../services/auth.service';
import { ProductoAdminService } from '../../../../services/producto-admin.service';
import { CategoriasService } from '../../../../services/categorias.service';
import { StatsService } from '../../../../services/stats.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  usuario: Usuario | null = null;
  totalProductos = 0;
  totalCategorias = 0;
  totalClientes = 0;

  // Chart 1: Productos por Categoría (Doughnut)
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#00B3BC', '#B1D616', '#004153', '#3b5f70', '#64748b'] }]
  };

  // Chart 2: Crecimiento (Bar)
  public barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { 
        data: [12, 19, 15, 25, 22, 30], 
        label: 'Nuevos Productos',
        backgroundColor: '#00B3BC',
        borderRadius: 6
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  constructor(
    private auth: AuthService,
    private productosService: ProductoAdminService,
    private categoriasService: CategoriasService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();

    this.productosService.getAll().subscribe({
      next: p => {
        this.totalProductos = p.length;
        this.procesarDatosGraficaCategorias(p);
        // Deshabilitado temporalmente a petición del usuario para evitar confusión con ingresos financieros
        this.setGraficaVacia(); 
      },
      error: () => {}
    });

    this.categoriasService.getCategorias().subscribe({
      next: c => this.totalCategorias = c.length,
      error: () => {}
    });

    this.statsService.getResumen().subscribe({
      next: res => this.totalClientes = res.total || 0,
      error: () => {}
    });
  }

  private procesarDatosGraficaCategorias(productos: any[]): void {
    const counts: { [key: string]: number } = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin Categoría';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    this.doughnutChartData = {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#00B3BC', '#B1D616', '#004153', '#3b5f70', '#94a3b8', '#cbd5e1']
      }]
    };
  }

  private setGraficaVacia(): void {
    const mesesLabels = [];
    const hoy = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const label = d.toLocaleString('es-ES', { month: 'short' });
      mesesLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
    }

    this.barChartData = {
      labels: mesesLabels,
      datasets: [
        { 
          data: [0, 0, 0, 0, 0, 0], 
          label: 'Nuevos Productos',
          backgroundColor: '#00B3BC',
          borderRadius: 6
        }
      ]
    };
  }

  private procesarDatosGraficaCrecimiento(productos: any[]): void {
    // 1. Obtener los últimos 6 meses (nombres de meses)
    const mesesLabels = [];
    const mesesMap: { [key: string]: number } = {};
    const hoy = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const label = d.toLocaleString('es-ES', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`; // Para agrupar
      mesesLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
      mesesMap[key] = 0;
    }

    // 2. Contar productos por mes
    productos.forEach(p => {
      if (p.created_at) {
        const fecha = new Date(p.created_at);
        const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        if (mesesMap.hasOwnProperty(key)) {
          mesesMap[key]++;
        }
      }
    });

    // 3. Asignar al gráfico
    this.barChartData = {
      labels: mesesLabels,
      datasets: [
        { 
          data: Object.values(mesesMap), 
          label: 'Nuevos Productos',
          backgroundColor: '#00B3BC',
          borderRadius: 6
        }
      ]
    };
  }
}
