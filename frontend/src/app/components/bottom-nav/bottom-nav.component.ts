import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css'
})
export class BottomNavComponent {
  @Input() isAssistantMode: boolean = false;

  navItems = [
    { label: 'Inicio', icon: 'home', link: '/' },
    { label: 'Productos', icon: 'shopping-bag', link: '/productos' },
    { label: 'Asistente', icon: 'sparkles', link: '/asistente' },
    { label: 'Contacto', icon: 'chat-bubble', link: '/contacto' },
    { label: 'Nosotros', icon: 'users', link: '/nosotros' }
  ];
}
