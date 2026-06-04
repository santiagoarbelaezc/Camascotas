import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface BannerValue {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-banner-valores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banner-valores.component.html',
  styleUrl: './banner-valores.component.css'
})
export class BannerValoresComponent implements OnInit, OnDestroy {
  @ViewChild('stickyWrapper', { static: true }) stickyWrapper!: ElementRef<HTMLElement>;
  activeIndex: number = 0;

  values: BannerValue[] = [
    {
      id: 0,
      subtitle: 'MARCA COLOMBIANA, DISEÑO Y CALIDAD.',
      title: '100% colombiano',
      description: 'Hecho por manos colombianas, impulsando la industria local y el crecimiento del país.',
      image: 'assets/images/banner-colombiano.png'
    },
    {
      id: 1,
      subtitle: 'CAMAS FABRICADAS CON MATERIAL RECICLABLE, CON RESPONSABILIDAD EN CADA DETALLE.',
      title: 'Compromiso con el planeta',
      description: 'Elegimos materiales reciclables y procesos responsables, sin perder calidad.',
      image: 'assets/images/banner-planeta.png'
    },
    {
      id: 2,
      subtitle: 'SE LAVAN FÁCIL, NO PIERDEN LA FORMA Y ESTÁN PENSADAS PARA DURAR.',
      title: 'Hechas para el día a día',
      description: 'Materiales resistentes y funcionales para mantener la cama impecable sin esfuerzo.',
      image: 'assets/images/banner-diadia.png'
    }
  ];

  ngOnInit(): void {
    window.addEventListener('scroll', this.onWindowScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  onWindowScroll = () => {
    if (!this.stickyWrapper) return;

    const rect = this.stickyWrapper.nativeElement.getBoundingClientRect();
    const wrapperHeight = rect.height;
    
    // Calculamos cuánto ha hecho scroll el usuario respecto al inicio de la sección
    const relativeScroll = -rect.top;
    const scrollableRange = wrapperHeight - window.innerHeight;

    if (scrollableRange <= 0) return;

    // Calcular el porcentaje de progreso (0 a 1)
    let progress = relativeScroll / scrollableRange;
    progress = Math.max(0, Math.min(1, progress));

    // Mapear el progreso al activeIndex (0, 1, 2)
    let newIndex = 0;
    if (progress < 0.33) {
      newIndex = 0;
    } else if (progress < 0.66) {
      newIndex = 1;
    } else {
      newIndex = 2;
    }

    if (newIndex !== this.activeIndex) {
      this.activeIndex = newIndex;
    }
  }

  scrollToIndex(index: number): void {
    if (!this.stickyWrapper) return;
    const rect = this.stickyWrapper.nativeElement.getBoundingClientRect();
    const scrollableRange = this.stickyWrapper.nativeElement.offsetHeight - window.innerHeight;
    
    // Posición absoluta en la página del wrapper + la porción del progreso
    const progressOffset = (index / (this.values.length - 1)) * scrollableRange;
    const absoluteTarget = window.scrollY + rect.top + progressOffset;

    window.scrollTo({
      top: absoluteTarget,
      behavior: 'smooth'
    });
  }
}
