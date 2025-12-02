import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TranslationResponse {
  translatedText: string;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private apiUrl = '/translate';
  private cache = new Map<string, string>();
  private debug = true; 

  constructor(private http: HttpClient) {}

  translate(text: string, source = 'es', target = 'en'): Observable<TranslationResponse> {
    if (!text.trim()) {
      return of({ translatedText: '' });
    }

    const key = `${source}:${target}:${text}`;
    if (this.cache.has(key)) {
      if (this.debug) {
        console.log(`[Translation][CACHE] ${source} → ${target}: "${text}" → "${this.cache.get(key)}"`);
      }
      return of({ translatedText: this.cache.get(key)! });
    }

    return this.http.post<TranslationResponse>(this.apiUrl, {
      q: text,
      source,
      target,
      format: 'text'
    }).pipe(
      tap(res => {
        this.cache.set(key, res.translatedText);
        if (this.debug) {
          console.log(`[Translation][API] ${source} → ${target}: "${text}" → "${res.translatedText}"`);
        }
      })
    );
  }
}
