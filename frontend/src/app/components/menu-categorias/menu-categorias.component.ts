import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriasService, Categoria, Subcategoria } from '../../services/categorias.service';

@Component({
  selector: 'app-menu-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-categorias.component.html',
  styleUrl: './menu-categorias.component.css'
})
export class MenuCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaSeleccionadaId: number | null = null;
  subcategoriaSeleccionadaId: number | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoriasService.getCategorias().subscribe(cats => {
      this.categorias = cats;
    });

    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionadaId = params['categoria_id'] ? +params['categoria_id'] : null;
      this.subcategoriaSeleccionadaId = params['subcategoria_id'] ? +params['subcategoria_id'] : null;
    });
  }

  seleccionarCategoria(catId: number | null): void {
    this.router.navigate(['/productos'], {
      queryParams: { categoria_id: catId },
      queryParamsHandling: 'merge'
    });
  }

  seleccionarSubcategoria(catId: number, subId: number): void {
    this.router.navigate(['/productos'], {
      queryParams: { categoria_id: catId, subcategoria_id: subId },
      queryParamsHandling: 'merge'
    });
  }

  limpiarFiltros(): void {
    this.router.navigate(['/productos'], { queryParams: {} });
  }
}
