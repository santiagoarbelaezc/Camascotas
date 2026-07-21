import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-brand-story',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './brand-story.component.html',
  styleUrl: './brand-story.component.css'
})
export class BrandStoryComponent {}
