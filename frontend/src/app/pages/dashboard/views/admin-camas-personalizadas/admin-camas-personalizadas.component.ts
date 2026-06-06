import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamasPersonalizadasService, CamaPersonalizada } from '../../../../services/camas-personalizadas.service';

@Component({
  selector: 'app-admin-camas-personalizadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-camas-personalizadas.component.html',
  styleUrl: './admin-camas-personalizadas.component.css'
})
export class AdminCamasPersonalizadasComponent implements OnInit {
  camas: CamaPersonalizada[] = [];
  cargando = true;

  constructor(private camasService: CamasPersonalizadasService) {}

  ngOnInit(): void {
    this.cargarCamas();
  }

  cargarCamas(): void {
    this.cargando = true;
    this.camasService.getTodasCamasAdmin().subscribe({
      next: (res) => {
        this.camas = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar diseños:', err);
        this.cargando = false;
      }
    });
  }
}
