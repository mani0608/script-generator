import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { SharedService } from '@services/shared.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  currentTheme: string = 'indigo-light-theme';
  isHistoryEnabled: boolean;
  subscriptions: Array<Subscription>;

  constructor(private _rend: Renderer2, private _service: SharedService,
    private _route: ActivatedRoute, private _router: Router,
    private _dService: SharedService) {
    this._rend.addClass(document.body, 'indigo-light-theme');
  }

  ngOnInit() {
    this.subscriptions = [];
    this.isHistoryEnabled = false;
    this._service.storeThemeType('light');
    this._router.navigate(['./upload'], { relativeTo: this._route });
    this.subscriptions.push(this._dService.historyCount.subscribe((count) => this.isHistoryEnabled = (count > 0)));
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      this.subscriptions.forEach((subs) => {
        if (subs) {
          subs.unsubscribe();
        }
      });
    }
  }

  changeTheme(theme: string) {
    let container = document.body;
    if (this.currentTheme !== theme) {

      this.currentTheme = theme;
      if (_.includes(theme, 'dark')) {
        this._service.storeThemeType('dark');
      } else {
        this._service.storeThemeType('light');
      }

      // remove old theme class and add new theme class
      // we're removing any css class that contains '-theme' string but your theme classes can follow any pattern
      const overlayContainerClasses = container.classList;
      const themeClassesToRemove = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));
      if (themeClassesToRemove.length) {
        overlayContainerClasses.remove(...themeClassesToRemove);
      }
      overlayContainerClasses.add(theme);

    }
  }
}
