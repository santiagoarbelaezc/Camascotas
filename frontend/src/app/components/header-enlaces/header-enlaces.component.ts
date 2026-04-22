import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-enlaces',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-enlaces.component.html',
  styleUrl: './header-enlaces.component.css'
})
export class HeaderEnlacesComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideInterval: any;

  items = [
    {
      title: 'Línea para perros',
      subtitle: 'Todo en un solo lugar: descanso, viaje y diversión',
      img: 'assets/images/home2.jpeg',
      link: '/productos'
    },
    {
      title: 'Mundo Gaturro',
      subtitle: 'Explora rascadores y camas diseñadas para su instinto',
      img: 'assets/images/home1.jpeg',
      link: '/productos'
    },
    {
      title: 'Sofás de Lujo',
      subtitle: 'Confort de otro nivel para los que más quieres',
      img: 'assets/images/home3.jpeg',
      link: '/productos'
    },
    {
      title: 'Novedades 2024',
      subtitle: 'Descubre las tendencias en descanso para mascotas',
      img: 'assets/images/home4.jpeg',
      link: '/productos'
    }
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.items.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.items.length) % this.items.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    // Reset timer when user manually interacts
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
