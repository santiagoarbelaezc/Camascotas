import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-intro-camascotas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './banner-intro-camascotas.component.html',
  styleUrl: './banner-intro-camascotas.component.css'
})
export class BannerIntroCamascotasComponent {}
