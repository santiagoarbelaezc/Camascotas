import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamasPersonalizadasService, CamaPersonalizada } from '../../services/camas-personalizadas.service';
import { LoadingService } from '../../services/loading.service';
import { RouterLink } from '@angular/router';

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
    private loading: LoadingService
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

  imprimirDiseno(): void {
    window.print();
  }
}
