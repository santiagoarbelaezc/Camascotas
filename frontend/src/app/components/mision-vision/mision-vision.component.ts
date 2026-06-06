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
  mostrarModalValores = false;

  abrirModalValores() {
    this.mostrarModalValores = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  cerrarModalValores() {
    this.mostrarModalValores = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}
