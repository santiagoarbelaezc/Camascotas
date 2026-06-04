import { Component, OnInit } from '@angular/core';
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
import { HuskyBannerComponent } from '../../components/husky-banner/husky-banner.component';
import { ProductoAdminService, ProductoAdmin } from '../../services/producto-admin.service';
import { CommonModule } from '@angular/common';
import { ComponentesService, ComponenteDinamico } from '../../services/componentes.service';
import { RouterModule } from '@angular/router';

const FALLBACK_IMG = 'assets/images/placeholder.jpg';

/**
 * Map a ProductoAdmin to CarruselItem.
 * - imagen      = imagenes[1] (second image, as requested)
 * - imagenHover = imagenes[0] (principal, shown on hover)
 */
function toCarruselItem(p: ProductoAdmin): CarruselItem {
  const imgs     = p.imagenes ?? [];
  const segunda  = imgs[1] ?? imgs[0] ?? FALLBACK_IMG;
  const primera  = imgs[0] ?? FALLBACK_IMG;

  const catNombre = (p.categoria ?? '').toLowerCase();
  let categoria = 'Todos';
  if (catNombre.includes('perro')) categoria = 'Perros';
  else if (catNombre.includes('gato')) categoria = 'Gatos';

  return {
    id:          p.id,
    nombre:      p.nombre,
    precio:      p.precio,
    desde:       !!p.desde,
    imagen:      segunda,
    imagenHover: primera,
    categoria,
    colores:     p.colores ?? []
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    CustomServiceComponent,
    HuskyBannerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  /** Top carousel: most recently added products (ordered by id DESC) */
  recientesItems: CarruselItem[] = [];

  /** Bottom carousel: random discovery products */
  novedadesItems: CarruselItem[] = [];

  /** Dynamic customizable landing components */
  componentesDinamicos: ComponenteDinamico[] = [];

  constructor(
    private productosService: ProductoAdminService,
    private componentesService: ComponentesService
  ) {}

  filtrarProductosPorCategoria(categoriaName: string): CarruselItem[] {
    if (!categoriaName) return this.recientesItems;
    // Normalize string match
    const search = categoriaName.toLowerCase();
    return this.recientesItems.filter(item => (item.categoria ?? '').toLowerCase().includes(search));
  }

  ngOnInit(): void {
    // Cargar componentes dinámicos activos
    this.componentesService.getComponentes().subscribe({
      next: (res) => {
        this.componentesDinamicos = res.filter(c => c.activo == 1 || c.activo === true);
      },
      error: (err) => console.warn('Error cargando componentes dinámicos:', err)
    });

    // Top carousel: 20 most recent products (user can expand to see all)
    this.productosService.getRecientes(20).subscribe({
      next: (productos) => {
        this.recientesItems = productos.map(toCarruselItem);
      },
      error: (err) => console.warn('Error cargando recientes:', err)
    });

    // Bottom carousel: 16 random products for discovery
    this.productosService.getAleatorios(16).subscribe({
      next: (productos) => {
        this.novedadesItems = productos.map(toCarruselItem);
      },
      error: (err) => console.warn('Error cargando novedades:', err)
    });
  }
}
