import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuAbierto = false;
  scrolled = false;
  grupoAbierto = false; // Para el dropdown en mobile

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuAbierto) {
      const target = event.target as HTMLElement;
      const isClickInside = target.closest('.mobile-menu') || target.closest('.hamburger');
      if (!isClickInside) {
        this.closeMenu();
      }
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    if (window.innerWidth > 768 && this.menuAbierto) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      this.grupoAbierto = false;
    }
  }

  toggleGrupo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.grupoAbierto = !this.grupoAbierto;
  }

  closeMenu(): void {
    this.menuAbierto = false;
    this.grupoAbierto = false;
    document.body.style.overflow = '';
  }

  navigateAndClose(): void {
    this.closeMenu();
  }
}
