import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-experience',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand-experience.component.html',
  styleUrl: './brand-experience.component.css'
})
export class BrandExperienceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('expVideo') videoRef?: ElementRef<HTMLVideoElement>;
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.muted = true;
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.25 } // Se activa cuando al menos el 25% del video es visible en el viewport
      );

      this.observer.observe(video);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
