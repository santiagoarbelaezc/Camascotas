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

  comoLlegar(): void {
    const destinationAddress = "Espumas+y+Pl%C3%A1sticos+SAS,+Cra.+19+%2319+-+27,+Armenia,+Quind%C3%ADo";
    const destCoords = "4.5356482,-75.6748259";

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/${lat},${lng}/${destinationAddress}/@${destCoords},14z?entry=ttu`;
          window.open(url, '_blank');
        },
        (_error) => {
          // Fallback directo a Google Maps si se rechaza el permiso o falla la ubicación
          const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationAddress}`;
          window.open(url, '_blank');
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationAddress}`;
      window.open(url, '_blank');
    }
  }
}
