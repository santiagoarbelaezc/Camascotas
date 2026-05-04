import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriasService, Categoria, Subcategoria } from '../../../../services/categorias.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="admin-section animate-fade-in">
  <div class="section-header">
    <div>
      <h1 class="section-title">Gestión de Categorías</h1>
      <p class="section-sub">Organiza el catálogo de productos por categorías y subcategorías.</p>
    </div>
    <button class="btn-create" (click)="abrirModalCat()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      Nueva Categoría
    </button>
  </div>

  <!-- Loader -->
  <div *ngIf="cargando" class="loader-wrap">
    <div class="loader-spin"></div>
    <span>Cargando categorías...</span>
  </div>

  <!-- Empty State -->
  <div *ngIf="!cargando && categorias.length === 0" class="empty-state">
    <img src="assets/images/icon-navbar.png" alt="Empty" class="w-16 h-16 opacity-20 mb-4 mx-auto">
    <p>No hay categorías registradas.</p>
  </div>

  <!-- Categories Grid -->
  <div class="categories-grid" *ngIf="!cargando && categorias.length > 0">
    <div *ngFor="let cat of categorias" class="category-card">
      <div class="category-header">
        <div class="cat-info">
          <img [src]="cat.imagen || 'assets/images/placeholder.jpg'" class="cat-icon">
          <h3 class="cat-name">{{ cat.nombre }}</h3>
        </div>
        <div class="cat-actions">
          <button (click)="abrirModalCat(cat)" class="btn-icon" title="Editar Categoría">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button (click)="eliminarCategoria(cat)" class="btn-icon delete" title="Eliminar Categoría">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <!-- Subcategories Section -->
      <div class="subcategories-area">
        <div class="sub-header">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Subcategorías</span>
          <button (click)="abrirModalSub(cat.id)" class="btn-add-sub">
            + Añadir
          </button>
        </div>
        <div class="sub-list">
          <div *ngFor="let sub of cat.subcategorias" class="sub-item">
            <span class="sub-name">{{ sub.nombre }}</span>
            <div class="sub-actions">
              <button (click)="abrirModalSub(cat.id, sub)" class="sub-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button (click)="eliminarSubcategoria(sub)" class="sub-btn delete">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <p *ngIf="cat.subcategorias.length === 0" class="no-sub-msg">Sin subcategorías</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Categoría -->
  <div class="modal-overlay" *ngIf="mostrarModalCat">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ catForm.id > 0 ? 'Editar' : 'Nueva' }} Categoría</h2>
        <button class="modal-close" (click)="mostrarModalCat = false">×</button>
      </div>
      <div class="modal-body">
        <div class="product-form">
          <div class="form-group full">
            <label>Nombre de la Categoría</label>
            <input type="text" [(ngModel)]="catForm.nombre" placeholder="Ej: Perros, Gatos...">
          </div>
          <div class="form-group full">
            <label>Icono / Imagen</label>
            <div class="upload-zone" (click)="fileInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{{ archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic para subir imagen' }}</span>
              <input type="file" #fileInput (change)="onFileSelected($event)" hidden accept="image/*">
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-cancel" (click)="mostrarModalCat = false">Cancelar</button>
            <button class="btn-save" [disabled]="guardando" (click)="guardarCategoria()">
              {{ guardando ? 'Guardando...' : 'Guardar Categoría' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Subcategoría -->
  <div class="modal-overlay" *ngIf="mostrarModalSub">
    <div class="modal-box small">
      <div class="modal-header">
        <h2>{{ subForm.id > 0 ? 'Editar' : 'Nueva' }} Subcategoría</h2>
        <button class="modal-close" (click)="mostrarModalSub = false">×</button>
      </div>
      <div class="modal-body">
        <div class="product-form">
          <div class="form-group full">
            <label>Nombre de la Subcategoría</label>
            <input type="text" [(ngModel)]="subForm.nombre" placeholder="Ej: Camas, Rascadores...">
          </div>
          <div class="form-actions">
            <button class="btn-cancel" (click)="mostrarModalSub = false">Cancelar</button>
            <button class="btn-save" [disabled]="guardando" (click)="guardarSubcategoria()">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" [class.visible]="toast.visible" [class.error]="toast.error">
    {{ toast.message }}
  </div>
</div>
  `,
  styles: [`
.admin-section { width: 100%; animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.section-title { font-size: 1.8rem; font-weight: 800; color: #004153; margin: 0; }
.section-sub { color: #94a3b8; font-size: 0.9rem; margin-top: 4px; }
.btn-create { background: #00B3BC; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
.btn-create:hover { background: #009ba3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 179, 188, 0.2); }
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.category-card { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0, 65, 83, 0.04); overflow: hidden; display: flex; flex-direction: column; }
.category-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.cat-info { display: flex; align-items: center; gap: 14px; }
.cat-icon { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; background: #eee; }
.cat-name { font-size: 1.1rem; font-weight: 800; color: #004153; margin: 0; }
.cat-actions { display: flex; gap: 4px; }
.btn-icon { background: white; border: 1px solid #e2e8f0; color: #64748b; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-icon svg { width: 16px; height: 16px; }
.btn-icon:hover { background: #f8fafc; color: #00B3BC; border-color: #00B3BC; }
.btn-icon.delete:hover { background: #fee2e2; color: #ef4444; border-color: #ef4444; }
.subcategories-area { padding: 20px 24px 24px; flex: 1; display: flex; flex-direction: column; }
.sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn-add-sub { background: #f1f5f9; color: #64748b; border: none; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; cursor: pointer; }
.btn-add-sub:hover { background: #e2e8f0; color: #004153; }
.sub-list { display: flex; flex-direction: column; gap: 8px; }
.sub-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border-radius: 10px; transition: background 0.2s; }
.sub-item:hover { background: #f1f5f9; }
.sub-name { font-size: 0.85rem; font-weight: 600; color: #475569; }
.sub-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
.sub-item:hover .sub-actions { opacity: 1; }
.sub-btn { background: none; border: none; color: #94a3b8; padding: 4px; cursor: pointer; display: flex; align-items: center; }
.sub-btn svg { width: 14px; height: 14px; }
.sub-btn:hover { color: #00B3BC; }
.sub-btn.delete:hover { color: #ef4444; }
.no-sub-msg { font-size: 0.8rem; color: #cbd5e1; text-align: center; margin-top: 10px; font-style: italic; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 65, 83, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: white; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 25px 60px rgba(0,65,83,0.2); animation: modalIn 0.3s ease; }
.modal-box.small { max-width: 400px; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.1rem; font-weight: 800; color: #004153; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 24px; }
.product-form { display: flex; flex-direction: column; gap: 16px; }
.form-group label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block; }
.form-group input { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; transition: border-color 0.2s; }
.form-group input:focus { border-color: #00B3BC; outline: none; }
.upload-zone { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; color: #94a3b8; cursor: pointer; }
.upload-zone:hover { border-color: #00B3BC; color: #00B3BC; background: #f0fbfc; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-save { background: #004153; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-save:hover { background: #00B3BC; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #004153; color: white; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 0.9rem; box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(20px); opacity: 0; transition: all 0.3s; }
.toast.visible { transform: translateY(0); opacity: 1; }
.toast.error { background: #ef4444; }
.loader-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; color: #94a3b8; }
.loader-spin { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #00B3BC; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando = true;

  // Modales
  mostrarModalCat = false;
  mostrarModalSub = false;
  guardando = false;

  // Forms
  catForm = { id: 0, nombre: '' };
  subForm = { id: 0, nombre: '', categoria_id: 0 };
  archivoSeleccionado: File | null = null;

  // Toast
  toast = { visible: false, message: '', error: false };

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.categoriasService.getCategorias().subscribe({
      next: (res) => { this.categorias = res; this.cargando = false; },
      error: () => { this.cargando = false; this.showToast('Error al cargar datos', true); }
    });
  }

  // --- CATEGORÍAS ---
  abrirModalCat(cat?: Categoria): void {
    if (cat) {
      this.catForm = { id: cat.id, nombre: cat.nombre };
    } else {
      this.catForm = { id: 0, nombre: '' };
    }
    this.archivoSeleccionado = null;
    this.mostrarModalCat = true;
  }

  onFileSelected(event: any): void {
    this.archivoSeleccionado = event.target.files[0];
  }

  guardarCategoria(): void {
    if (!this.catForm.nombre.trim()) {
      this.showToast('El nombre es obligatorio', true);
      return;
    }

    if (/^\d+$/.test(this.catForm.nombre.trim())) {
      this.showToast('El nombre de la categoría no puede ser solo números', true);
      return;
    }

    const fd = new FormData();
    fd.append('nombre', this.catForm.nombre);
    if (this.archivoSeleccionado) {
      fd.append('icono', this.archivoSeleccionado);
    }

    this.guardando = true;
    const req = this.catForm.id > 0 
      ? this.categoriasService.actualizarCategoria(this.catForm.id, fd)
      : this.categoriasService.crearCategoria(fd);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModalCat = false;
        this.cargarDatos();
        this.showToast('Categoría guardada exitosamente');
      },
      error: (err) => {
        this.guardando = false;
        this.showToast(err?.error?.error || 'Error al guardar', true);
      }
    });
  }

  eliminarCategoria(cat: Categoria): void {
    if (confirm(`¿Eliminar la categoría "${cat.nombre}"? Se eliminarán todas sus subcategorías.`)) {
      this.categoriasService.eliminarCategoria(cat.id).subscribe({
        next: () => { this.cargarDatos(); this.showToast('Categoría eliminada'); },
        error: () => this.showToast('No se pudo eliminar la categoría', true)
      });
    }
  }

  // --- SUBCATEGORÍAS ---
  abrirModalSub(catId: number, sub?: Subcategoria): void {
    if (sub) {
      this.subForm = { id: sub.id, nombre: sub.nombre, categoria_id: catId };
    } else {
      this.subForm = { id: 0, nombre: '', categoria_id: catId };
    }
    this.mostrarModalSub = true;
  }

  guardarSubcategoria(): void {
    if (!this.subForm.nombre.trim()) {
      this.showToast('El nombre es obligatorio', true);
      return;
    }

    if (/^\d+$/.test(this.subForm.nombre.trim())) {
      this.showToast('El nombre no puede ser solo números', true);
      return;
    }

    this.guardando = true;
    const req = this.subForm.id > 0
      ? this.categoriasService.actualizarSubcategoria(this.subForm.id, this.subForm)
      : this.categoriasService.crearSubcategoria(this.subForm);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModalSub = false;
        this.cargarDatos();
        this.showToast('Subcategoría guardada');
      },
      error: () => { this.guardando = false; this.showToast('Error al guardar subcategoría', true); }
    });
  }

  eliminarSubcategoria(sub: Subcategoria): void {
    if (confirm(`¿Eliminar la subcategoría "${sub.nombre}"?`)) {
      this.categoriasService.eliminarSubcategoria(sub.id).subscribe({
        next: () => { this.cargarDatos(); this.showToast('Subcategoría eliminada'); },
        error: () => this.showToast('Error al eliminar', true)
      });
    }
  }

  showToast(msg: string, isError = false): void {
    this.toast = { visible: true, message: msg, error: isError };
    setTimeout(() => this.toast.visible = false, 3000);
  }
}
