import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mision-vision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mision-vision.component.html',
  styleUrl: './mision-vision.component.css'
})
export class MisionVisionComponent {
  modalActivo: 'mision' | 'vision' | 'valores' | null = null;

  abrirModal(tipo: 'mision' | 'vision' | 'valores') {
    this.modalActivo = tipo;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  cerrarModal() {
    this.modalActivo = null;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}
