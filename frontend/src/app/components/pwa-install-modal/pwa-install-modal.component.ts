import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

export interface PwaSlide {
  paso: string;
  titulo: string;
  descripcion: string;
  subtexto?: string;
  icono: string;
  destacado?: string;
}

@Component({
  selector: 'app-pwa-install-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-modal.component.html',
  styleUrl: './pwa-install-modal.component.css'
})
export class PwaInstallModalComponent implements OnInit, OnDestroy {
  mostrarModal = false;
  plataforma: 'ios' | 'android' = 'android';
  activeSlideIndex = 0;
  private sub?: Subscription;

  slidesIos: PwaSlide[] = [
    {
      paso: 'Ventajas de la App',
      titulo: 'Camascotas en tu iPhone',
      descripcion: 'Disfruta de la mejor experiencia instalando nuestra App sin ocupar memoria de la App Store.',
      subtexto: 'Navegación fluida, notificaciones de descuentos y acceso instantáneo desde tu pantalla de inicio.',
      icono: 'sparkles'
    },
    {
      paso: 'Paso 1 de 3',
      titulo: 'Abre el menú de Safari',
      descripcion: 'En la barra inferior de Safari, toca el botón de Compartir.',
      subtexto: 'Es el icono de un cuadrado con una flecha apuntando hacia arriba (⬆️).',
      icono: 'share-ios',
      destacado: 'Buscando el icono ⬆️ en la barra inferior'
    },
    {
      paso: 'Paso 2 de 3',
      titulo: 'Selecciona "Agregar a inicio"',
      descripcion: 'Desliza las opciones hacia abajo hasta encontrar "Agregar a inicio".',
      subtexto: 'Reconócelo por el icono del cuadrado con el signo más (➕).',
      icono: 'add-ios',
      destacado: 'Opción: "Agregar a inicio ➕"'
    },
    {
      paso: 'Paso 3 de 3',
      titulo: 'Confirma con "Agregar"',
      descripcion: 'Toca "Agregar" en la esquina superior derecha de la pantalla.',
      subtexto: '¡Y listo! El icono de Camascotas aparecerá en tu iPhone como una App nativa.',
      icono: 'check-ios'
    }
  ];

  slidesAndroid: PwaSlide[] = [
    {
      paso: 'Ventajas de la App',
      titulo: 'Camascotas en tu Android',
      descripcion: 'Instala la aplicación en segundos directamente desde Google Chrome sin descargas pesadas.',
      subtexto: 'Acceso directo con un toque, notificaciones exclusivas y navegación ultrarrápida.',
      icono: 'sparkles'
    },
    {
      paso: 'Paso 1 de 3',
      titulo: 'Abre el menú de Chrome',
      descripcion: 'En la esquina superior derecha de Google Chrome, toca el menú de opciones.',
      subtexto: 'Reconócelo por los tres puntos verticales (⋮).',
      icono: 'dots-android',
      destacado: 'Icono de 3 puntos (⋮) arriba a la derecha'
    },
    {
      paso: 'Paso 2 de 3',
      titulo: 'Toca "Instalar aplicación"',
      descripcion: 'En el menú desplegable, selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".',
      subtexto: 'Aparecerá una ventana de confirmación nativa de Android.',
      icono: 'download-android',
      destacado: 'Opción: "Instalar aplicación"'
    },
    {
      paso: 'Paso 3 de 3',
      titulo: 'Presiona "Instalar"',
      descripcion: 'Confirma tocando el botón "Instalar" en la ventana emergente.',
      subtexto: '¡Listo! Camascotas quedará agregada a tu cajón de aplicaciones.',
      icono: 'check-android'
    }
  ];

  constructor(public pwaService: PwaService) {}

  ngOnInit(): void {
    // Detectar automáticamente plataforma inicial
    if (this.pwaService.isIos) {
      this.plataforma = 'ios';
    } else {
      this.plataforma = 'android';
    }

    this.sub = this.pwaService.mostrarModal$.subscribe(show => {
      this.mostrarModal = show;
      if (show) {
        this.activeSlideIndex = 0;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  get currentSlides(): PwaSlide[] {
    return this.plataforma === 'ios' ? this.slidesIos : this.slidesAndroid;
  }

  get currentSlide(): PwaSlide {
    return this.currentSlides[this.activeSlideIndex] || this.currentSlides[0];
  }

  setPlataforma(plat: 'ios' | 'android'): void {
    this.plataforma = plat;
    this.activeSlideIndex = 0;
  }

  siguienteSlide(): void {
    if (this.activeSlideIndex < this.currentSlides.length - 1) {
      this.activeSlideIndex++;
    } else {
      this.cerrarModal();
    }
  }

  anteriorSlide(): void {
    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex--;
    }
  }

  irASlide(index: number): void {
    this.activeSlideIndex = index;
  }

  cerrarModal(): void {
    this.pwaService.ocultarModal();
  }

  async instalarDirecto(): Promise<void> {
    if (this.pwaService.puedesInstalarDirecto()) {
      const instalado = await this.pwaService.instalarAppDirecto();
      if (instalado) {
        this.cerrarModal();
      }
    }
  }
}
