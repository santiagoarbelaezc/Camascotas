import { Component } from '@angular/core';
import { HeaderEnlacesComponent } from '../../components/header-enlaces/header-enlaces.component';
import { MenuCategoriasComponent } from '../../components/menu-categorias/menu-categorias.component';
import { GridProductosComponent } from '../../components/grid-productos/grid-productos.component';
import { NosotrosComponent } from '../../components/nosotros/nosotros.component';
import { MisionVisionComponent } from '../../components/mision-vision/mision-vision.component';
import { CarruselDestacadosComponent, CarruselItem } from '../../components/carrusel-destacados/carrusel-destacados.component';
import { BannerValoresComponent } from '../../components/banner-valores/banner-valores.component';
import { ExplorerCategoriasComponent } from '../../components/explorer-categorias/explorer-categorias.component';
import { BrandExperienceComponent } from '../../components/brand-experience/brand-experience.component';
import { BannerDualHomeComponent } from '../../components/banner-dual-home/banner-dual-home.component';
import { BrandStoryComponent } from '../../components/brand-story/brand-story.component';
import { CustomServiceComponent } from '../../components/custom-service/custom-service.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderEnlacesComponent,
    MenuCategoriasComponent,
    GridProductosComponent,
    NosotrosComponent,
    MisionVisionComponent,
    CarruselDestacadosComponent,
    BannerValoresComponent,
    ExplorerCategoriasComponent,
    BrandExperienceComponent,
    BannerDualHomeComponent,
    BrandStoryComponent,
    CustomServiceComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  favoritosItems: CarruselItem[] = [
    {
      id: 1,
      nombre: 'Cubo Premium Steel',
      precio: 85000,
      desde: false,
      imagen: 'assets/images/11.jpeg',
      imagenHover: 'assets/images/12.jpeg',
      categoria: 'Perros',
      colores: ['#8B7355', '#C4A882', '#6B6B6B']
    },
    {
      id: 3,
      nombre: 'Cama Cuadrada XL',
      precio: 120000,
      desde: true,
      imagen: 'assets/images/13.jpeg',
      imagenHover: 'assets/images/14.jpeg',
      categoria: 'Perros',
      colores: ['#D4B896', '#A0856C', '#8B6914']
    },
    {
      id: 4,
      nombre: 'Sofá Canino Elegance',
      precio: 150000,
      desde: true,
      imagen: 'assets/images/15.jpeg',
      imagenHover: 'assets/images/18.jpeg',
      categoria: 'Perros',
      colores: ['#4A4A4A', '#8B7355', '#C9B99A']
    },
    {
      id: 6,
      nombre: 'Rascador Multilevel',
      precio: 180000,
      desde: true,
      imagen: 'assets/images/other1.jpeg',
      imagenHover: 'assets/images/other2.jpeg',
      categoria: 'Gatos',
      colores: ['#C4A882', '#8B7355', '#6B6B6B']
    }
  ];

  novedadesItems: CarruselItem[] = [
    {
      id: 7,
      nombre: 'Cuna Felina Moon',
      precio: 75000,
      desde: false,
      imagen: 'assets/images/other3.jpeg',
      imagenHover: 'assets/images/other4.jpeg',
      categoria: 'Gatos',
      colores: ['#E8D5C4', '#D4B896', '#A89880']
    },
    {
      id: 9,
      nombre: 'Puff Camascotas',
      precio: 110000,
      desde: false,
      imagen: 'assets/images/other5.jpeg',
      imagenHover: 'assets/images/other6.jpeg',
      categoria: 'Accesorios',
      colores: ['#6B8E9F', '#4A7A8E', '#8B7355']
    },
    {
      id: 5,
      nombre: 'Mini Sofá Toy',
      precio: 95000,
      desde: false,
      imagen: 'assets/images/other7.jpeg',
      imagenHover: 'assets/images/other8.jpeg',
      categoria: 'Perros',
      colores: ['#E8C4C4', '#D4A0A0', '#B87878']
    },
    {
      id: 8,
      nombre: 'Comedero Ergonómico',
      precio: 45000,
      desde: false,
      imagen: 'assets/images/other9.jpeg',
      imagenHover: 'assets/images/other10.jpeg',
      categoria: 'Accesorios',
      colores: ['#F5E6D3', '#E8D0B3', '#C4A882']
    }
  ];
}
