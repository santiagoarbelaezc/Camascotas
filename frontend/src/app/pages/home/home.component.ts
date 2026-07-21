import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
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
import { RegistroBannerComponent } from '../../components/registro-banner/registro-banner.component';
import { BannerContactoAvisoComponent } from '../../components/banner-contacto-aviso/banner-contacto-aviso.component';
import { BannerIntroCamascotasComponent } from '../../components/banner-intro-camascotas/banner-intro-camascotas.component';
import { ProductoAdminService, ProductoAdmin } from '../../services/producto-admin.service';
import { CommonModule } from '@angular/common';
import { ComponentesService, ComponenteDinamico } from '../../services/componentes.service';
import { RouterModule } from '@angular/router';

const FALLBACK_IMG = 'assets/images/placeholder.jpg';

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
    categoria:   categoria,
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
    HuskyBannerComponent,
    RegistroBannerComponent,
    BannerContactoAvisoComponent,
    BannerIntroCamascotasComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  recientesItems: CarruselItem[] = [];
  novedadesItems: CarruselItem[] = [];
  cargandoRecientes = true;
  cargandoNovedades = true;
  componentesDinamicos: ComponenteDinamico[] = [];

  private scrollTimer: any;
  private readonly SCROLL_KEY = 'home_scroll_position';

  constructor(
    private productosService: ProductoAdminService,
    private componentesService: ComponentesService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    
    // Guardar posición de scroll con debounce ligero
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      sessionStorage.setItem(this.SCROLL_KEY, window.scrollY.toString());
    }, 100);
  }

  @HostListener('window:beforeunload', [])
  onBeforeUnload(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.SCROLL_KEY, window.scrollY.toString());
    }
  }

  filtrarProductosPorCategoria(categoriaName: string): CarruselItem[] {
    if (!categoriaName) return this.recientesItems;
    const search = categoriaName.toLowerCase();
    return this.recientesItems.filter(item => (item.categoria ?? '').toLowerCase().includes(search));
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Cargar componentes dinámicos activos
    this.componentesService.getComponentes().subscribe({
      next: (res) => {
        this.componentesDinamicos = res.filter(c => c.activo == 1 || c.activo === true);
        this.restaurarScrollGuardado();
      },
      error: (err) => console.warn('Error cargando componentes dinámicos:', err)
    });

    // Top carrousel: 20 productos recientes
    this.productosService.getRecientes(20).subscribe({
      next: (productos) => {
        this.recientesItems = productos.map(toCarruselItem);
        this.cargandoRecientes = false;
        this.restaurarScrollGuardado();
      },
      error: (err) => {
        console.warn('Error cargando recientes:', err);
        this.cargandoRecientes = false;
      }
    });

    // Bottom carrousel: 16 productos aleatorios
    this.productosService.getAleatorios(16).subscribe({
      next: (productos) => {
        this.novedadesItems = productos.map(toCarruselItem);
        this.cargandoNovedades = false;
        this.restaurarScrollGuardado();
      },
      error: (err) => {
        console.warn('Error cargando novedades:', err);
        this.cargandoNovedades = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.restaurarScrollGuardado();
  }

  private restaurarScrollGuardado(): void {
    if (typeof window === 'undefined') return;
    const savedPos = sessionStorage.getItem(this.SCROLL_KEY);
    if (savedPos) {
      const targetY = parseInt(savedPos, 10);
      if (!isNaN(targetY) && targetY > 0) {
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
        }, 150);
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
        }, 400);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
  }
}
