import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandExperienceComponent } from '../../components/brand-experience/brand-experience.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, BrandExperienceComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {

}
