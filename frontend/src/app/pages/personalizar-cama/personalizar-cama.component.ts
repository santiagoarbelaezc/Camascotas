import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CamasPersonalizadasService, CamaPersonalizada } from '../../services/camas-personalizadas.service';
interface ColorOption {
  name: string;
  value: string; // CSS color representation for selector
  filter: string; // CSS filter to apply to the image
}

interface FontOption {
  name: string;
  fontFamily: string;
  className: string;
}

@Component({
  selector: 'app-personalizar-cama',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './personalizar-cama.component.html',
  styleUrl: './personalizar-cama.component.css'
})
export class PersonalizarCamaComponent {
  // Configuración de Colores para la Estructura Exterior (Ampliada con tonos oscuros y elegantes)
  baseColors: ColorOption[] = [
    { name: 'Rojo Borgoña', value: '#800020', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(330deg) brightness(0.6)' },
    { name: 'Azul Marino', value: '#1d2a44', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(200deg) brightness(0.5)' },
    { name: 'Verde Oliva', value: '#556b2f', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(70deg) brightness(0.6)' },
    { name: 'Terracota', value: '#b35a38', filter: 'grayscale(1) sepia(1) saturate(2.2) hue-rotate(15deg) brightness(0.7)' },
    { name: 'Rosa Viejo', value: '#d48a94', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(320deg) brightness(0.9)' },
    { name: 'Azul Acero', value: '#7fa9c7', filter: 'grayscale(1) sepia(1) saturate(1.8) hue-rotate(190deg) brightness(0.95)' },
    { name: 'Verde Salvia', value: '#7fc796', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(110deg) brightness(0.9)' },
    { name: 'Océano Muted', value: '#6da6ad', filter: 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(160deg) brightness(0.95)' },
    { name: 'Lila Muted', value: '#9b8ab5', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(245deg) brightness(0.95)' },
    { name: 'Gris Grafito', value: '#475569', filter: 'grayscale(1) brightness(0.6)' },
    { name: 'Negro Carbón', value: '#1e293b', filter: 'grayscale(1) brightness(0.35)' },
    { name: 'Mostaza Muted', value: '#c7b48a', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(15deg) brightness(0.9)' }
  ];

  // Configuración de Colores para el Cojín Base (basado en la imagen base gris oscura)
  cushionColors: ColorOption[] = [
    { name: 'Blanco Crudo', value: '#f3f4f6', filter: 'grayscale(1) brightness(2.1) contrast(0.8)' },
    { name: 'Gris Cemento', value: '#9ca3af', filter: 'grayscale(1) brightness(1.3)' },
    { name: 'Gris Carbón', value: '#374151', filter: 'grayscale(1) brightness(0.7)' },
    { name: 'Beige Arena', value: '#d1c7bd', filter: 'grayscale(1) sepia(1) saturate(1.2) hue-rotate(15deg) brightness(1.8)' },
    { name: 'Rosa Viejo Suave', value: '#e2b5bb', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(315deg) brightness(1.7)' },
    { name: 'Celeste Muted', value: '#a8c5db', filter: 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(190deg) brightness(1.8)' },
    { name: 'Menta Muted', value: '#adcbba', filter: 'grayscale(1) sepia(1) saturate(1.4) hue-rotate(130deg) brightness(1.8)' },
    { name: 'Marrón Chocolate', value: '#5c4033', filter: 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(10deg) brightness(0.8)' }
  ];

  // Configuración de Colores para el Cojín Corazón (Enfocado en variedad de hermosos tonos rojos y complementos)
  pillowColors: ColorOption[] = [
    { name: 'Rojo Pasión', value: '#c1121f', filter: 'grayscale(1) sepia(1) saturate(8) hue-rotate(320deg) brightness(0.65) contrast(1.3)' },
    { name: 'Rojo Borgoña', value: '#660708', filter: 'grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) brightness(0.4) contrast(1.3)' },
    { name: 'Rojo Carmín', value: '#9e0a1b', filter: 'grayscale(1) sepia(1) saturate(7.5) hue-rotate(322deg) brightness(0.55) contrast(1.3)' },
    { name: 'Rojo Cereza', value: '#d90429', filter: 'grayscale(1) sepia(1) saturate(8.5) hue-rotate(324deg) brightness(0.75) contrast(1.35)' },
    { name: 'Rojo Terracota', value: '#b85a3a', filter: 'grayscale(1) sepia(1) saturate(6.5) hue-rotate(335deg) brightness(0.65) contrast(1.2)' },
    { name: 'Rojo Fresa', value: '#ff4d6d', filter: 'grayscale(1) sepia(1) saturate(7) hue-rotate(310deg) brightness(0.9) contrast(1.2)' },
    { name: 'Azul Oxford', value: '#03045e', filter: 'grayscale(1) sepia(1) saturate(5) hue-rotate(185deg) brightness(0.4) contrast(1.1)' },
    { name: 'Verde Pino', value: '#132a13', filter: 'grayscale(1) sepia(1) saturate(3.5) hue-rotate(85deg) brightness(0.4) contrast(1.1)' },
    { name: 'Rosa Muted', value: '#d89bb0', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(295deg) brightness(0.9)' },
    { name: 'Coral Muted', value: '#db9e8a', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(340deg) brightness(0.9)' },
    { name: 'Ocre Suave', value: '#bfad7c', filter: 'grayscale(1) sepia(1) saturate(2.2) hue-rotate(10deg) brightness(0.9)' },
    { name: 'Salvia Suave', value: '#9bcb9b', filter: 'grayscale(1) sepia(1) saturate(2) hue-rotate(85deg) brightness(0.85)' },
    { name: 'Azul Calma', value: '#89a8cc', filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(175deg) brightness(0.9)' },
    { name: 'Morado Imperial', value: '#4a154b', filter: 'grayscale(1) sepia(1) saturate(4) hue-rotate(245deg) brightness(0.45) contrast(1.2)' }
  ];

  // Configuración de Fuentes
  fonts: FontOption[] = [
    { name: 'Cursiva Elegante', fontFamily: "'Great Vibes', cursive", className: 'font-cursive' },
    { name: 'Moderna Minimalista', fontFamily: "'Montserrat', sans-serif", className: 'font-modern' },
    { name: 'Clásica Serif', fontFamily: "'Playfair Display', serif", className: 'font-classic' },
    { name: 'Divertida Infantil', fontFamily: "'Fredoka One', cursive", className: 'font-playful' }
  ];

  // Configuración de Colores del Hilo (Bordado)
  embroideryColors = [
    { name: 'Dorado Metálico', value: '#d4af37' },
    { name: 'Plateado Brillante', value: '#e2e2e2' },
    { name: 'Blanco Puro', value: '#ffffff' },
    { name: 'Negro Azabache', value: '#1a1a1a' },
    { name: 'Rosa Fucsia', value: '#ff007f' },
    { name: 'Azul Marino', value: '#000080' }
  ];

  // Estado del Configurador
  selectedBase = this.baseColors[0];
  selectedCushion = this.cushionColors[0];
  selectedPillow = this.pillowColors[0];
  selectedFont = this.fonts[0];
  selectedEmbroideryColor = this.embroideryColors[0];
  
  petName = '';
  showPillow = true;
  activeTab = 'estructura'; // 'estructura', 'cojin', 'corazon', 'nombre'

  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private camasService: CamasPersonalizadasService,
    private router: Router
  ) {}

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  generarEnlaceWhatsApp(): string {
    const telefono = '+573000000000'; // Reemplazar con el número real de Camascotas
    const texto = `¡Hola Camascotas! 🐾 He diseñado una cama personalizada en su web y quiero ordenarla. Aquí tienes las especificaciones:
    
✨ *CONFIGURACIÓN DE LA CAMA:*
• Estructura Exterior: ${this.selectedBase.name}
• Cojín Base Fluffy: ${this.selectedCushion.name}
• Cojín Auxiliar de Corazón: ${this.showPillow ? this.selectedPillow.name : 'Sin cojín'}
• Nombre Bordado: ${this.petName ? `"${this.petName}"` : 'Sin nombre'}
• Estilo de Letra: ${this.petName ? this.selectedFont.name : 'N/A'}
• Color del Bordado: ${this.petName ? this.selectedEmbroideryColor.name : 'N/A'}

¿Me podrían confirmar el precio y el tiempo de entrega? ¡Gracias!`;

    return `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(texto)}`;
  }

  guardarDiseno(): void {
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const diseno: CamaPersonalizada = {
      base_color_name: this.selectedBase.name,
      base_color_value: this.selectedBase.value,
      cushion_color_name: this.selectedCushion.name,
      cushion_color_value: this.selectedCushion.value,
      pillow_color_name: this.selectedPillow.name,
      pillow_color_value: this.selectedPillow.value,
      show_pillow: this.showPillow,
      font_name: this.selectedFont.name,
      embroidery_color_name: this.selectedEmbroideryColor.name,
      pet_name: this.petName
    };

    this.camasService.guardarDiseño(diseno).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensajeExito = '¡Tu diseño se ha guardado correctamente!';
        setTimeout(() => this.router.navigate(['/mis-camas']), 2000);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = 'Error al guardar el diseño. Intenta nuevamente.';
        console.error(err);
      }
    });
  }

  imprimirDiseno(): void {
    window.print();
  }
}
