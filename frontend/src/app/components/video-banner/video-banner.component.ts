import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-video-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './video-banner.component.html',
  styleUrl: './video-banner.component.css'
})
export class VideoBannerComponent {}
