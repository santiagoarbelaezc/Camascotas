import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-diseno-personalizado-contacto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diseno-personalizado-contacto.component.html',
  styleUrl: './diseno-personalizado-contacto.component.css'
})
export class DisenoPersonalizadoContactoComponent {
  generarEnlaceWhatsApp(): string {
    const mensaje = encodeURIComponent("Hola Camascotas, quiero hablar con un asesor para crear mi propio diseño personalizado de cama para mi mascota.");
    return `https://api.whatsapp.com/send?phone=573207793380&text=${mensaje}`;
  }
}
