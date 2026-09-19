import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './shell-layout.html',
})
export class ShellLayout {}
