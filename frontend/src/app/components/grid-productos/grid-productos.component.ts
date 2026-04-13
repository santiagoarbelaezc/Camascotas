import { Component } from '@angular/core';
import { Producto } from '../../models/interfaces';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-grid-productos',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './grid-productos.component.html',
  styleUrl: './grid-productos.component.css'
})
export class GridProductosComponent {
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Cama Cubo Premium',
      descripcion: 'Diseño minimalista para gatos y perros pequeños.',
      precio: 150000,
      categoria_id: 1,
      imagen: 'assets/images/11.jpeg',
      stock: 5,
      tipo: 'Cubo'
    },
    {
      id: 2,
      nombre: 'Sofá Mascotas Confort',
      descripcion: 'Máxima elegancia para el descanso de tu mascota.',
      precio: 210000,
      categoria_id: 2,
      imagen: 'assets/images/12.jpeg',
      stock: 3,
      tipo: 'Sofa'
    },
    {
      id: 3,
      nombre: 'Cama Hexagonal',
      descripcion: 'Forma geométrica moderna que se adapta a cualquier rincón.',
      precio: 180000,
      categoria_id: 1,
      imagen: 'assets/images/13.jpeg',
      stock: 4,
      tipo: 'Hexagonal'
    },
    {
      id: 4,
      nombre: 'Cama Nube Ultra Soft',
      descripcion: 'La suavidad convertida en cama para dulces sueños.',
      precio: 140000,
      categoria_id: 2,
      imagen: 'assets/images/14.jpeg',
      stock: 10,
      tipo: 'Cama Nube'
    },
    {
      id: 5,
      nombre: 'Cama Cuadrada Clásica',
      descripcion: 'El estilo tradicional con materiales de alta calidad.',
      precio: 120000,
      categoria_id: 1,
      imagen: 'assets/images/15.jpeg',
      stock: 8,
      tipo: 'Cuadrada'
    },
    {
      id: 6,
      nombre: 'Caja Gatos Divertida',
      descripcion: 'Espacio cerrado para que tu gato se sienta seguro.',
      precio: 95000,
      categoria_id: 3,
      imagen: 'assets/images/18.jpeg',
      stock: 6,
      tipo: 'Caja Gatos'
    }
  ];
}

