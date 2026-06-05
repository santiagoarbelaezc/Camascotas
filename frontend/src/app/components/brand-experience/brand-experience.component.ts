import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-experience',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand-experience.component.html',
  styleUrl: './brand-experience.component.css'
})
export class BrandExperienceComponent {}
