import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService, Usuario } from '../../../../services/auth.service';
import { ProductoAdminService } from '../../../../services/producto-admin.service';
import { CategoriasService } from '../../../../services/categorias.service';

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
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();

    this.productosService.getAll().subscribe({
      next: p => {
        this.totalProductos = p.length;
        this.procesarDatosGrafica(p);
      },
      error: () => {}
    });

    this.categoriasService.getCategorias().subscribe({
      next: c => this.totalCategorias = c.length,
      error: () => {}
    });
  }

  private procesarDatosGrafica(productos: any[]): void {
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
}
