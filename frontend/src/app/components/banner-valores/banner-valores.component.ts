import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './banner-valores.component.html',
  styleUrl: './banner-valores.component.css'
})
export class BannerValoresComponent {
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

  setActive(index: number) {
    this.activeIndex = index;
  }
}
