import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescripcionProductosComponent } from '../../components/descripcion-productos/descripcion-productos.component';
import { CarruselDestacadosComponent, CarruselItem } from '../../components/carrusel-destacados/carrusel-destacados.component';
import { LoadingService } from '../../services/loading.service';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-descripcion',
  standalone: true,
  imports: [
    CommonModule, 
    DescripcionProductosComponent, 
    CarruselDestacadosComponent
  ],
  templateUrl: './descripcion.component.html',
  styleUrl: './descripcion.component.css'
})
export class DescripcionComponent implements OnInit {
  recomendadosItems: CarruselItem[] = [];

  constructor(
    private loadingService: LoadingService,
    private productosService: ProductosService
  ) {
    this.loadingService.show(800);
  }

  ngOnInit(): void {
    // Cargamos algunos productos para el carrusel de recomendados
    this.productosService.getProductos().subscribe(prods => {
      this.recomendadosItems = prods.slice(0, 6).map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        desde: false,
        imagen: p.imagen,
        imagenHover: p.imagen, // Por ahora igual
        categoria: 'Muebles',
        colores: ['#004153', '#00B3BC']
      }));
    });
  }
}
