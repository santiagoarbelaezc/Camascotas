import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [NgIf],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css'
})
export class SplashScreenComponent implements OnInit {
  visible = true;
  hiding = false;

  ngOnInit(): void {
    // Empieza a ocultar en 3.5s (animación de salida dura 0.5s)
    setTimeout(() => {
      this.hiding = true;
    }, 3500);

    // Elimina completamente el componente a los 4s
    setTimeout(() => {
      this.visible = false;
    }, 4000);
  }
}
