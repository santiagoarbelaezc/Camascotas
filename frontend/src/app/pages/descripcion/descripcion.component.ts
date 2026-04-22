import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderIndexComponent } from '../../components/header-index/header-index.component';
import { DescripcionProductosComponent } from '../../components/descripcion-productos/descripcion-productos.component';
import { GridProductosComponent } from '../../components/grid-productos/grid-productos.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-descripcion',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderIndexComponent, 
    DescripcionProductosComponent, 
    GridProductosComponent, 
    FooterComponent
  ],
  templateUrl: './descripcion.component.html',
  styleUrl: './descripcion.component.css'
})
export class DescripcionComponent {
  constructor(private loadingService: LoadingService) {
    this.loadingService.show(800);
  }
}
