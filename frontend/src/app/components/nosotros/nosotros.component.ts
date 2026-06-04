import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

interface Founder {
  key: string;
  name: string;
  role: string;
  image: string;
  description: string;
  quote: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent implements OnInit, OnDestroy {
  selectedFounder: Founder | null = null;
  private routeSub!: Subscription;

  founders: Record<string, Founder> = {
    luisa: {
      key: 'luisa',
      name: 'Luisa',
      role: 'Fundadora y Directora de Diseño',
      image: 'assets/images/luisa.jpeg',
      description: 'Apasionada por el diseño de interiores y el confort de los animales de compañía. Luisa lidera la conceptualización estética y ergonómica de todo nuestro catálogo, asegurando que cada pieza de mobiliario sea una adición elegante para el hogar moderno y brinde el soporte óptimo que los perros y gatos necesitan.',
      quote: '“El diseño premium no es solo cómo se ve un objeto, sino cómo mejora el día a día de nuestras mascotas y armoniza la convivencia en casa.”'
    },
    mateo: {
      key: 'mateo',
      name: 'Mateo',
      role: 'Fundador y Director de Producción',
      image: 'assets/images/mateo.jpeg',
      description: 'Especialista en ebanistería de precisión y desarrollo estructural. Mateo supervisa directamente nuestro taller artesanal, seleccionando maderas sustentables de la mejor calidad y coordinando los rigurosos procesos de ensamble, lijado y acabados no tóxicos para dar vida a piezas increíblemente duraderas.',
      quote: '“Trabajamos artesanalmente con las manos y el corazón. Cada unión y costura se diseña pensando en la seguridad de quien más amamos.”'
    },
    sebas: {
      key: 'sebas',
      name: 'Sebas',
      role: 'Director de Operaciones y Experiencia',
      image: 'assets/images/sebas.jpeg',
      description: 'La voz directa de Camascotas con las familias pet lovers y responsable de que la magia llegue en óptimas condiciones. Sebas lidera la atención personalizada, asesora en medidas/textiles ideales y gestiona la logística de envíos rápidos y seguros a nivel nacional.',
      quote: '“La felicidad del cliente empieza con una gran asesoría y se consolida cuando ven a su mascota acurrucarse y disfrutar de su nueva Camascota.”'
    }
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const founderKey = params['founder']?.toLowerCase();
      if (founderKey && this.founders[founderKey]) {
        this.selectedFounder = this.founders[founderKey];
        // Bloquear scroll de la página de fondo
        document.body.style.overflow = 'hidden';
      } else {
        this.selectedFounder = null;
        document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    // Asegurar que el body vuelva a la normalidad
    document.body.style.overflow = '';
  }

  selectFounder(key: string): void {
    // Si estamos en la página de inicio o cualquier otra ruta diferente a /nosotros, redirigir
    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/nosotros') {
      this.router.navigate(['/nosotros'], { queryParams: { founder: key } });
    } else {
      // Guardar posición de scroll actual
      const scrollY = window.scrollY;
      // Si ya estamos en /nosotros, simplemente actualizamos el query param
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { founder: key },
        queryParamsHandling: 'merge'
      }).then(() => {
        // Restaurar posición de scroll de inmediato
        window.scrollTo(0, scrollY);
      });
    }
  }

  closeFounderModal(): void {
    const scrollY = window.scrollY;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { founder: null },
      queryParamsHandling: 'merge'
    }).then(() => {
      // Restaurar posición de scroll de inmediato
      window.scrollTo(0, scrollY);
    });
  }
}

