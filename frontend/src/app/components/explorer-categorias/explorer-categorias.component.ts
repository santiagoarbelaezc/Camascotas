import { Component, OnInit } from '@angular/core';
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
export class ExplorerCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaSeleccionadaId: number | null = null;
  subcategoriaSeleccionadaId: number | null = null;
  
  // Para efectos de animación y visualización
  categoriaActiva: Categoria | null = null;

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
          this.categoriaSeleccionadaId = catIdFromUrl;
          this.subcategoriaSeleccionadaId = params['subcategoria_id'] ? +params['subcategoria_id'] : null;
          this.categoriaActiva = this.categorias.find(c => c.id === this.categoriaSeleccionadaId) || null;
        } else if (this.categorias.length > 0) {
          // SELECCIÓN POR DEFECTO: Perros
          this.toggleCategoria(this.categorias[0]);
        }
      });
    });
  }

  toggleCategoria(cat: Categoria): void {
    if (this.categoriaSeleccionadaId === cat.id) {
      // Opcional: Deseleccionar si ya está activa
      // this.categoriaSeleccionadaId = null;
      // this.categoriaActiva = null;
    } else {
      this.categoriaSeleccionadaId = cat.id;
      this.categoriaActiva = cat;
      this.subcategoriaSeleccionadaId = null;
    }
  }

  seleccionarSubcategoria(subId: number): void {
    this.subcategoriaSeleccionadaId = subId;
    // Navegar solo cuando sea necesario o usar skipLocationChange: true si se quiere persistir sin scroll
    // Por ahora, solo estado local para evitar el salto
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
}
