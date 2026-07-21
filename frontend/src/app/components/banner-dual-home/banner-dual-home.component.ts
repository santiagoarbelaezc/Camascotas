import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DualBannerSlide {
  id: number;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  categoriaParam: string;
  btnText: string;
}

@Component({
  selector: 'app-banner-dual-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banner-dual-home.component.html',
  styleUrl: './banner-dual-home.component.css'
})
export class BannerDualHomeComponent implements OnInit, OnDestroy {
  @ViewChild('stickyWrapper', { static: true }) stickyWrapper!: ElementRef<HTMLElement>;
  activeIndex: number = 0;

  slides: DualBannerSlide[] = [
    {
      id: 0,
      subtitle: 'MUNDO CANINO',
      title: 'Confort Exclusivo para tu Perro',
      description: 'Muebles y camas ergonómicas diseñadas para brindarle el mejor descanso a tu mejor amigo.',
      image: 'assets/images/bannerperrocopy.png',
      categoriaParam: 'Perros',
      btnText: 'EXPLORAR PERROS'
    },
    {
      id: 1,
      subtitle: 'MUNDO FELINO',
      title: 'Diseño de Lujo para tu Gato',
      description: 'Estructuras artesanales y espacios de relax que se integran perfectamente con la decoración de tu hogar.',
      image: 'assets/images/bannergato.png',
      categoriaParam: 'Gatos',
      btnText: 'EXPLORAR GATOS'
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
    
    const relativeScroll = -rect.top;
    const scrollableRange = wrapperHeight - window.innerHeight;

    if (scrollableRange <= 0) return;

    let progress = relativeScroll / scrollableRange;
    progress = Math.max(0, Math.min(1, progress));

    const newIndex = progress < 0.5 ? 0 : 1;

    if (newIndex !== this.activeIndex) {
      this.activeIndex = newIndex;
    }
  };

  scrollToIndex(index: number): void {
    if (!this.stickyWrapper) return;
    const rect = this.stickyWrapper.nativeElement.getBoundingClientRect();
    const scrollableRange = this.stickyWrapper.nativeElement.offsetHeight - window.innerHeight;
    
    const progressOffset = (index / (this.slides.length - 1)) * scrollableRange;
    const absoluteTarget = window.scrollY + rect.top + progressOffset;

    window.scrollTo({
      top: absoluteTarget,
      behavior: 'smooth'
    });
  }
}
