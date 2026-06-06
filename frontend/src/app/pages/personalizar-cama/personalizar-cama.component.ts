import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CamasPersonalizadasService, CamaPersonalizada, BED_CONFIG, ColorOption, FontOption } from '../../services/camas-personalizadas.service';

@Component({
  selector: 'app-personalizar-cama',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './personalizar-cama.component.html',
  styleUrl: './personalizar-cama.component.css'
})
export class PersonalizarCamaComponent implements OnInit {
  baseColors = BED_CONFIG.baseColors;
  cushionColors = BED_CONFIG.cushionColors;
  pillowColors = BED_CONFIG.pillowColors;
  fonts = BED_CONFIG.fonts;
  embroideryColors = BED_CONFIG.embroideryColors;

  selectedBase = this.baseColors[0];
  selectedCushion = this.cushionColors[0];
  selectedPillow = this.pillowColors[0];
  selectedFont = this.fonts[0];
  selectedEmbroideryColor = this.embroideryColors[0];
  
  petName = '';
  showPillow = true;
  activeTab = 'estructura';

  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  
  editingId: number | null = null;

  constructor(
    private camasService: CamasPersonalizadasService,
    private router: Router
  ) {}

  ngOnInit() {
    const state = history.state as { camaEdit?: CamaPersonalizada };
    if (state && state.camaEdit) {
      const cama = state.camaEdit;
      this.editingId = cama.id || null;
      
      this.selectedBase = this.baseColors.find(c => c.name === cama.base_color_name) || this.baseColors[0];
      this.selectedCushion = this.cushionColors.find(c => c.name === cama.cushion_color_name) || this.cushionColors[0];
      
      this.showPillow = cama.show_pillow;
      if (this.showPillow) {
        this.selectedPillow = this.pillowColors.find(c => c.name === cama.pillow_color_name) || this.pillowColors[0];
      }
      
      this.petName = cama.pet_name || '';
      if (this.petName) {
        this.selectedFont = this.fonts.find(f => f.name === cama.font_name) || this.fonts[0];
        this.selectedEmbroideryColor = this.embroideryColors.find(c => c.name === cama.embroidery_color_name) || this.embroideryColors[0];
      }
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  generarEnlaceWhatsApp(): string {
    const telefono = '+573000000000';
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

    if (this.editingId) {
      this.camasService.actualizarDiseño(this.editingId, diseno).subscribe({
        next: (res) => {
          this.guardando = false;
          this.mensajeExito = '¡Tu diseño se ha actualizado correctamente!';
          setTimeout(() => this.router.navigate(['/mis-camas']), 2000);
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = 'Error al actualizar el diseño. Intenta nuevamente.';
          console.error(err);
        }
      });
    } else {
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
  }

  imprimirDiseno(): void {
    window.print();
  }
}
