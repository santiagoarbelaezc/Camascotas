import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  activeIndex: number | null = null;

  toggleFaq(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }

  faqs = [
    {
      question: '¿De qué materiales están hechas las camas?',
      answer: 'Utilizamos materiales premium, como telas hipoalergénicas, espumas de alta densidad y estructuras de madera sostenible para garantizar durabilidad y comodidad.'
    },
    {
      question: '¿Puedo personalizar la cama de mi mascota?',
      answer: '¡Sí! Puedes usar nuestro personalizador 3D para elegir el color de la estructura, el cojín, añadir un cojín corazón y bordar el nombre de tu peludito.'
    },
    {
      question: '¿Cómo puedo lavar la cama?',
      answer: 'La mayoría de nuestros cojines son desenfundables. Puedes lavar las fundas a máquina en ciclo suave con agua fría. Recomendamos secar al aire libre.'
    },
    {
      question: '¿Cuánto tardan en procesar un pedido?',
      answer: 'Para camas de stock estándar, el procesamiento toma de 1 a 2 días hábiles. Para camas personalizadas, el tiempo de elaboración es de 5 a 7 días hábiles antes del envío.'
    }
  ];
}
