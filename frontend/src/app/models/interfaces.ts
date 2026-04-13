export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: number;
  imagen: string;
  stock: number;
  tipo: string; // Cubo, Cuadrada, Sofa, Hexagonal, etc.
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente';
}
