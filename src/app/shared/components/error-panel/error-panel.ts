import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-panel',
  templateUrl: './error-panel.html',
})
export class ErrorPanel {
  readonly message = input.required<string>();
  readonly retryable = input(false);
  readonly retry = output<void>();
}
