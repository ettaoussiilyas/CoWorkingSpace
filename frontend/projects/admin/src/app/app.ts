import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from './shared/icons/icons.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('admin');
}
