import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class ExplorerCategoriasComponent implements OnInit, OnDestroy {
  categorias: Categoria[] = [];
  categoriaSeleccionadaId: number | null = null;
  subcategoriaSeleccionadaId: number | null = null;
  
  // Para efectos de animación y visualización
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
    this.categoriasService.getCategorias().subscribe(cats => {
      this.categorias = cats;
      
      // Intentar recuperar del estado de la URL si existe
      this.route.queryParams.subscribe(params => {
        const catIdFromUrl = params['categoria_id'] ? +params['categoria_id'] : null;
        
        if (catIdFromUrl) {
          const found = this.categorias.find(c => c.id === catIdFromUrl);
          if (found) {
            this.selectCategoriaInternal(found);
            this.subcategoriaSeleccionadaId = params['subcategoria_id'] ? +params['subcategoria_id'] : null;
          }
        } else if (this.categorias.length > 0) {
          // SELECCIÓN POR DEFECTO: Primera categoría
          this.selectCategoriaInternal(this.categorias[0]);
        }

        // Iniciar carrusel automático
        this.startAutoPlay();
      });
    });
  }

  private startAutoPlay(): void {
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
    // Al hacer clic manual: cambiamos categoría, pausamos el carrusel y lo reanudamos tras USER_PAUSE_DELAY
    this.selectCategoriaInternal(cat);

    this.stopAutoPlay();
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }

    this.pauseTimer = setTimeout(() => {
      this.startAutoPlay();
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
  }
}
