import { Component } from '@angular/core';
import { HeaderEnlacesComponent } from '../../components/header-enlaces/header-enlaces.component';
import { MenuCategoriasComponent } from '../../components/menu-categorias/menu-categorias.component';
import { GridProductosComponent } from '../../components/grid-productos/grid-productos.component';
import { NosotrosComponent } from '../../components/nosotros/nosotros.component';
import { MisionVisionComponent } from '../../components/mision-vision/mision-vision.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderEnlacesComponent,
    MenuCategoriasComponent,
    GridProductosComponent,
    NosotrosComponent,
    MisionVisionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}

