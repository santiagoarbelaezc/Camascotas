import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-custom-service',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './custom-service.component.html',
  styleUrl: './custom-service.component.css'
})
export class CustomServiceComponent {
  generarEnlaceWhatsApp() {
    const mensaje = encodeURIComponent("Hola Camascotas, quiero personalizar un mueble para mi mascota.");
    return `https://wa.me/573000000000?text=${mensaje}`;
  }
}
