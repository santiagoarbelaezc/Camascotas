import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-enlaces',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-enlaces.component.html',
  styleUrl: './header-enlaces.component.css'
})
export class HeaderEnlacesComponent {
  items = [
    {
      title: 'Camas Premium',
      img: 'assets/images/home2.jpeg',
      link: '/productos'
    },
    {
      title: 'Espacios Gatos',
      img: 'assets/images/home1.jpeg',
      link: '/productos'
    },
    {
      title: 'Sofás de Descanso',
      img: 'assets/images/home3.jpeg',
      link: '/productos'
    },
    {
      title: 'Edición Limitada',
      img: 'assets/images/home4.jpeg',
      link: '/productos'
    }
  ];
}
