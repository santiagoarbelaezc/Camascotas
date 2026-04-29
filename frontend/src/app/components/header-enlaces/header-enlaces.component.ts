import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-enlaces',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-enlaces.component.html',
  styleUrl: './header-enlaces.component.css'
})
export class HeaderEnlacesComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  
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
      // Solo auto-slide si no es móvil o si queremos forzarlo (opcional)
      // En este caso lo mantendremos pero para móvil usaremos scrollToSlide
      this.nextSlide();
    }, 6000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.items.length;
    this.scrollToSlide(next);
  }

  scrollToSlide(index: number) {
    this.currentSlide = index;
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
    // Reset timer
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  onScroll(event: Event) {
    const container = event.target as HTMLElement;
    const scrollLeft = container.scrollLeft;
    const slideWidth = container.offsetWidth;
    
    // Calcular el slide actual basado en la posición del scroll
    const newSlide = Math.round(scrollLeft / slideWidth);
    if (newSlide !== this.currentSlide) {
      this.currentSlide = newSlide;
    }
  }
}
