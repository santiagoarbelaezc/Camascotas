import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 text-center text-gray-400">
      <h2 class="text-lg font-bold text-slate-700">Gestión de Categorías</h2>
      <p class="text-sm mt-2">Próximamente disponible</p>
    </div>
  `
})
export class AdminCategoriasComponent {}
