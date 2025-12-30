import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  translation = inject(TranslationService);

  idiomaDestino: 'es' | 'en' = 'es';
  traduciendo = false;
  private routerSub?: Subscription;

  isDark = false;
  disabled = false;

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.isDark = saved === 'dark';
    if (this.isDark) {
      document.documentElement.classList.add('dark');
    }

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.idiomaDestino === 'en') {
          setTimeout(() => this.translatePage(), 200);
        }
      }
    });
  }

  toggleDark() {
    if (this.disabled) return;

    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');

    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 600);
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
    setTimeout(() => this.translatePage(), 200);
  }

  translatePage() {
    this.traduciendo = true;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const nodos: Node[] = [];

    while (walker.nextNode()) {
      const nodo = walker.currentNode;
      const parent = nodo.parentElement;
      if (
        nodo.nodeValue?.trim() &&
        parent &&
        !['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'BUTTON'].includes(
          parent.tagName,
        )
      ) {
        nodos.push(nodo);
      }
    }

    for (const nodo of nodos) {
      const original = nodo.nodeValue!;
      if (!nodo.parentElement?.dataset['original']) {
        nodo.parentElement!.dataset['original'] = original;
      }

      if (this.idiomaDestino === 'es') {
        nodo.nodeValue = nodo.parentElement!.dataset['original']!;
        continue;
      }

      this.translation.translate(original, 'es', this.idiomaDestino).subscribe({
        next: (res) => (nodo.nodeValue = res.translatedText),
        error: (err) => console.error('Error traduciendo', err),
      });
    }

    const inputs = document.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >('input[placeholder], textarea[placeholder]');

    inputs.forEach((el) => {
      const original =
        el.dataset['originalPlaceholder'] ||
        el.getAttribute('placeholder') ||
        '';
      el.dataset['originalPlaceholder'] = original;

      if (this.idiomaDestino === 'es') {
        el.setAttribute('placeholder', el.dataset['originalPlaceholder']!);
        return;
      }

      this.translation.translate(original, 'es', this.idiomaDestino).subscribe({
        next: (res) => el.setAttribute('placeholder', res.translatedText),
        error: (err) => console.error('Error traduciendo placeholder', err),
      });
    });

    this.traduciendo = false;
  }
  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }
}
