import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private _title = 'lydian-front';
  private _environmentFile = environment;

  ngOnInit() {
    this._forceHttps();
    this.logVersionApp();
  }

  get title(): string {
    return this._title;
  }

  private logVersionApp(): void {
    console.info('VersionApp: ' + this._environmentFile.versionAPP);
  }

  private _forceHttps(): void {
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      window.location.replace('https://' + window.location.href.split('//')[1]);
    }
  }
}
