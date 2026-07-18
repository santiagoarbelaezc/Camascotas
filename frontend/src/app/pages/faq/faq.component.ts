import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  activeIndex: number | null = null;
  activeCategory = 'productos';

  categories = [
    { id: 'productos', label: 'Productos', icon: 'productos' },
    { id: 'pedidos', label: 'Pedidos', icon: 'pedidos' },
    { id: 'envios', label: 'Envíos', icon: 'envios' },
    { id: 'cuenta', label: 'Mi Cuenta', icon: 'cuenta' },
  ];

  faqsByCategory: Record<string, { question: string; answer: string }[]> = {
    productos: [
      {
        question: '¿De qué materiales están hechas las camas?',
        answer: 'Utilizamos materiales premium: telas hipoalergénicas, espumas de alta densidad certificadas, y estructuras de madera sostenible. Todos nuestros materiales pasan un control de calidad antes de ser utilizados para garantizar durabilidad y el máximo confort para tu mascota.'
      },
      {
        question: '¿Qué tallas de camas tienen disponibles?',
        answer: 'Manejamos tallas estándar S, M, L y XL, pero todas nuestras camas se pueden fabricar en tamaños totalmente personalizados al gusto y necesidades específicas del cliente. ¡Contáctanos y diseñamos la medida exacta que tu peludito necesita!'
      },
      {
        question: '¿Cómo debo lavar la cama?',
        answer: 'La mayoría de nuestros cojines tienen fundas desenfundables. Las fundas pueden lavarse en lavadora en ciclo suave con agua fría y jabón neutro. Recomendamos secar al aire libre y no usar secadora. La estructura de madera solo debe limpiarse con un paño húmedo.'
      },
    ],
    pedidos: [
      {
        question: '¿Cómo realizo un pedido?',
        answer: 'Puedes contactarnos directamente a través de nuestro formulario de contacto o por WhatsApp. Un asesor te ayudará a seleccionar el producto ideal, confirmar disponibilidad y coordinar los detalles del pago y envío.'
      },
      {
        question: '¿Qué formas de pago aceptan?',
        answer: 'Aceptamos transferencias bancarias, Nequi, Daviplata y pagos en efectivo a través de corresponsales bancarios. También realizamos pagos contra entrega en ciudades seleccionadas (consultar disponibilidad).'
      },
      {
        question: '¿Puedo cancelar o modificar un pedido?',
        answer: 'Puedes cancelar o modificar tu pedido sin ningún costo siempre y cuando el producto no haya sido despachado. Una vez generada la guía de envío, ya no es posible realizar cambios. Para productos personalizados, no se admiten cancelaciones una vez iniciada la fabricación.'
      },
      {
        question: '¿Tienen productos en stock o todo es bajo pedido?',
        answer: 'Manejamos stock de los modelos más populares en tallas estándar. Los productos personalizados siempre son fabricados bajo pedido. La disponibilidad se confirma al momento de contactarnos.'
      },
    ],
    envios: [
      {
        question: '¿A qué ciudades hacen envíos?',
        answer: 'Realizamos envíos a todo el territorio colombiano a través de transportadoras aliadas. Para ciudades principales como Bogotá, Medellín, Cali y Pereira, los tiempos son de 2 a 4 días hábiles. Para otras ciudades y municipios, de 4 a 8 días hábiles.'
      },
      {
        question: '¿Cuánto cuesta el envío?',
        answer: 'El costo del envío depende del peso volumétrico del producto y la ciudad de destino. Se calcula y confirma al momento de realizar el pedido. Constantemente ofrecemos promociones de envío gratuito en compras que superen cierto monto (consulta nuestra página principal para conocer las ofertas vigentes).'
      },
      {
        question: '¿Cómo puedo rastrear mi pedido?',
        answer: 'Una vez despachado tu pedido, te enviaremos el número de guía y el enlace de la transportadora al correo o WhatsApp registrado. Con ese número podrás consultar el estado de tu envío en tiempo real directamente en el sitio de la transportadora.'
      },
      {
        question: '¿Qué hago si mi pedido llega dañado o incompleto?',
        answer: 'Si tu pedido llega con el empaque averiado o con algún producto faltante, debes reportarlo en las primeras 24 horas después de la entrega escribiéndonos a contacto@camascotas.com con fotos del estado del paquete. Gestionaremos la garantía con la transportadora y te daremos una solución a la brevedad.'
      },
    ],
    cuenta: [
      {
        question: '¿Para qué sirve crear una cuenta?',
        answer: 'Con tu cuenta podrás guardar tus diseños personalizados de camas, acceder a un historial de pedidos, recibir notificaciones de ofertas exclusivas y agilizar futuros procesos de compra sin tener que ingresar tus datos nuevamente.'
      },
      {
        question: '¿Por qué me piden verificar mi correo electrónico?',
        answer: 'La verificación de correo es un paso de seguridad para confirmar que eres el dueño de la dirección de email ingresada. Esto protege tu cuenta de accesos no autorizados. Recibirás un código de 6 dígitos que debes ingresar en la pantalla de verificación.'
      },
      {
        question: '¿Qué hago si no recibí el código de verificación?',
        answer: 'Primero, revisa tu carpeta de correo no deseado o "Spam", ya que a veces nuestros correos pueden llegar allí. Si no aparece, puedes solicitar un nuevo código desde la pantalla de verificación (disponible cada 15 minutos). Si el problema persiste, escríbenos a contacto@camascotas.com.'
      },
    ]
  };

  get activeFaqs() {
    return this.faqsByCategory[this.activeCategory] ?? [];
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
    this.activeIndex = null;
  }

  toggleFaq(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
