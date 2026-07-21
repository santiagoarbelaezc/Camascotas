import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CategoriasService, Categoria, Subcategoria } from '../../services/categorias.service';

@Component({
  selector: 'app-explorer-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './explorer-categorias.component.html',
  styleUrl: './explorer-categorias.component.css'
})
export class ExplorerCategoriasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sectionRef') sectionRef?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;
  private isInViewport = false;

  categorias: Categoria[] = [];
  cargando: boolean = true;
  categoriaSeleccionadaId: number | null = null;
  subcategoriaSeleccionadaId: number | null = null;
  
  categoriaActiva: Categoria | null = null;
  isFadingOut = false;

  // Timers para la rotación automática
  private autoPlayTimer: any;
  private pauseTimer: any;
  private readonly ROTATION_INTERVAL = 3000; // 3 segundos entre categorías
  private readonly USER_PAUSE_DELAY = 7000;  // 7 segundos de espera tras clic manual

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoriasService.getCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.cargando = false;
        
        this.route.queryParams.subscribe(params => {
          const catIdFromUrl = params['categoria_id'] ? +params['categoria_id'] : null;
          
          if (catIdFromUrl) {
            const found = this.categorias.find(c => c.id === catIdFromUrl);
            if (found) {
              this.selectCategoriaInternal(found);
              this.subcategoriaSeleccionadaId = params['subcategoria_id'] ? +params['subcategoria_id'] : null;
            }
          } else if (this.categorias.length > 0) {
            this.selectCategoriaInternal(this.categorias[0]);
          }

          // Si ya está en pantalla al cargar, iniciamos el carrusel
          if (this.isInViewport) {
            this.startAutoPlay();
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.sectionRef?.nativeElement) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.isInViewport = true;
              this.startAutoPlay();
            } else {
              this.isInViewport = false;
              this.stopAutoPlay();
            }
          });
        },
        { threshold: 0.2 } // Se activa cuando al menos el 20% del componente es visible en el viewport
      );

      this.observer.observe(this.sectionRef.nativeElement);
    }
  }

  private startAutoPlay(): void {
    // Solo inicia si el componente está actualmente visible en pantalla
    if (!this.isInViewport) return;

    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.rotarSiguienteCategoria();
    }, this.ROTATION_INTERVAL);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private rotarSiguienteCategoria(): void {
    if (!this.categorias || this.categorias.length === 0) return;
    
    const currentIndex = this.categorias.findIndex(c => c.id === this.categoriaSeleccionadaId);
    const nextIndex = (currentIndex + 1) % this.categorias.length;
    this.selectCategoriaInternal(this.categorias[nextIndex]);
  }

  private selectCategoriaInternal(cat: Categoria): void {
    if (this.categoriaSeleccionadaId === cat.id && this.categoriaActiva) return;

    if (this.categoriaActiva) {
      this.isFadingOut = true;
      setTimeout(() => {
        this.categoriaSeleccionadaId = cat.id;
        this.categoriaActiva = cat;
        this.subcategoriaSeleccionadaId = null;
        this.isFadingOut = false;
      }, 250);
    } else {
      this.categoriaSeleccionadaId = cat.id;
      this.categoriaActiva = cat;
      this.subcategoriaSeleccionadaId = null;
    }
  }

  toggleCategoria(cat: Categoria): void {
    this.selectCategoriaInternal(cat);

    this.stopAutoPlay();
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }

    this.pauseTimer = setTimeout(() => {
      if (this.isInViewport) {
        this.startAutoPlay();
      }
    }, this.USER_PAUSE_DELAY);
  }

  seleccionarSubcategoria(subId: number): void {
    this.subcategoriaSeleccionadaId = subId;
  }

  verTodo(): void {
    if (this.categoriaActiva) {
      this.router.navigate(['/productos'], {
        queryParams: { 
          categoria_id: this.categoriaActiva.id, 
          subcategoria_id: this.subcategoriaSeleccionadaId 
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
