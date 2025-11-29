import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private refreshCallbacks: (() => void)[] = [];

  registerRefresh(callback: () => void) {
    this.refreshCallbacks.push(callback);
  }

  refresh() {
    this.refreshCallbacks.forEach(cb => cb());
  }
}
