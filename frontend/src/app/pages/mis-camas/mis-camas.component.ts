import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamasPersonalizadasService, CamaPersonalizada, BED_CONFIG } from '../../services/camas-personalizadas.service';
import { LoadingService } from '../../services/loading.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-mis-camas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-camas.component.html',
  styleUrl: './mis-camas.component.css'
})
export class MisCamasComponent implements OnInit {
  camas: CamaPersonalizada[] = [];
  cargando = true;

  constructor(
    private camasService: CamasPersonalizadasService,
    private loading: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMisCamas();
  }

  cargarMisCamas(): void {
    this.cargando = true;
    this.camasService.getMisCamas().subscribe({
      next: (res) => {
        this.camas = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar mis camas', err);
        this.cargando = false;
      }
    });
  }

  editarDiseno(cama: CamaPersonalizada): void {
    this.router.navigate(['/personalizar-cama'], { state: { camaEdit: cama } });
  }

  imprimirDiseno(): void {
    window.print();
  }

  getBaseFilter(colorName: string): string {
    const col = BED_CONFIG.baseColors.find(c => c.name === colorName);
    return col ? col.filter : 'none';
  }

  getCushionFilter(colorName: string): string {
    const col = BED_CONFIG.cushionColors.find(c => c.name === colorName);
    return col ? col.filter : 'none';
  }

  getPillowFilter(colorName: string): string {
    const col = BED_CONFIG.pillowColors.find(c => c.name === colorName);
    return col ? col.filter : 'none';
  }

  getFontFamily(fontName: string): string {
    const font = BED_CONFIG.fonts.find(f => f.name === fontName);
    return font ? font.fontFamily : 'inherit';
  }

  getEmbroideryColor(colorName: string): string {
    const col = BED_CONFIG.embroideryColors.find(c => c.name === colorName);
    return col ? col.value : '#000000';
  }
}
