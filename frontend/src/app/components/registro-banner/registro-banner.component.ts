import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './registro-banner.component.html',
  styleUrl: './registro-banner.component.css'
})
export class RegistroBannerComponent {
  constructor(public auth: AuthService) {}
}
