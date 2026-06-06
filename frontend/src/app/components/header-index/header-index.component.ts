import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header-index',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-index.component.html',
  styleUrls: ['./header-index.component.css']
})
export class HeaderIndexComponent implements OnInit {
  menuAbierto = false;
  scrolled = false;
  grupoAbierto = false; // Para el dropdown en mobile
  isLogueado = false;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.isLogueado = this.auth.isLoggedIn();
  }

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
