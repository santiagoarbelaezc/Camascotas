import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banner-dual-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banner-dual-home.component.html',
  styleUrl: './banner-dual-home.component.css'
})
export class BannerDualHomeComponent {}
