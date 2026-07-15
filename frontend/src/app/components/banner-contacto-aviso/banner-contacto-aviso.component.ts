import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-contacto-aviso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './banner-contacto-aviso.component.html',
  styleUrl: './banner-contacto-aviso.component.css'
})
export class BannerContactoAvisoComponent {
  generarEnlaceWhatsApp(): string {
    const mensaje = encodeURIComponent("Hola Camascotas, vengo desde el inicio de la tienda y quiero recibir asesoría.");
    return `https://api.whatsapp.com/send?phone=573207793380&text=${mensaje}`;
  }
}
