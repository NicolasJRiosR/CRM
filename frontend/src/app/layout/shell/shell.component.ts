import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  translation = inject(TranslationService);

  idiomaDestino: 'es' | 'en' = 'es';
  traduciendo = false;
  private routerSub?: Subscription;

  ngOnInit() {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.idiomaDestino === 'en') {
          setTimeout(() => this.translatePage(), 100);
        }
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  logout() {
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']);
  }

  toggleIdioma() {
    this.idiomaDestino = this.idiomaDestino === 'es' ? 'en' : 'es';
    setTimeout(() => this.translatePage(), 100);
  }

  translatePage() {
    this.traduciendo = true;

    // 1. Traducir nodos de texto visibles
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodos: Node[] = [];

    while (walker.nextNode()) {
      const nodo = walker.currentNode;
      const parent = nodo.parentElement;
      if (
        nodo.nodeValue?.trim() &&
        parent &&
        parent.offsetParent !== null &&
        !['SCRIPT', 'STYLE'].includes(parent.tagName)
      ) {
        nodos.push(nodo);
      }
    }

    for (const nodo of nodos) {
      const original = nodo.nodeValue!;
      const parent = nodo.parentElement as HTMLElement;
      if (!parent.dataset["original"]) {
        parent.dataset["original"] = original;
      }

      if (this.idiomaDestino === 'es') {
        nodo.nodeValue = parent.dataset["original"]!;
        continue;
      }

      this.translation.translate(original, 'es', this.idiomaDestino).subscribe({
        next: (res) => nodo.nodeValue = res.translatedText,
        error: (err) => console.error('Error traduciendo texto', err)
      });
    }

    // 2. Traducir atributos y texto visible
    const elementos = document.querySelectorAll(
      'input, button, textarea, a, span, div, h1, h2, h3, h4, h5, h6, label, legend, strong, p, section, header, footer, article, aside, main, [placeholder], [title], [alt]'
    );

    elementos.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.offsetParent) return;

      const attrs = ['placeholder', 'value', 'title', 'alt'];
      attrs.forEach(attr => {
        const original = htmlEl.getAttribute(attr);
        if (original && original.trim()) {
          if (!htmlEl.dataset[`original_${attr}`]) {
            htmlEl.dataset[`original_${attr}`] = original;
          }

          if (this.idiomaDestino === 'es') {
            htmlEl.setAttribute(attr, htmlEl.dataset[`original_${attr}`]!);
          } else {
            this.translation.translate(original, 'es', this.idiomaDestino).subscribe({
              next: (res) => htmlEl.setAttribute(attr, res.translatedText),
              error: (err) => console.error(`Error traduciendo atributo ${attr}`, err)
            });
          }
        }
      });

      const texto = (htmlEl.textContent || '').trim();
      if (texto.length < 2 || /^[^\w\s]+$/.test(texto)) return;

      if (!htmlEl.dataset["original_text"]) {
        htmlEl.dataset["original_text"] = texto;
      }

      if (this.idiomaDestino === 'es') {
        if (htmlEl.dataset["original_text"]) {
          htmlEl.textContent = htmlEl.dataset["original_text"];
        }
      } else {
        this.translation.translate(texto, 'es', this.idiomaDestino).subscribe({
          next: (res) => htmlEl.textContent = res.translatedText,
          error: (err) => console.error('Error traduciendo textContent', err)
        });
      }
    });

    this.traduciendo = false;
  }
}
