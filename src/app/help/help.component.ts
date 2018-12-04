import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy {

  title: string = 'Script generator help';
  themeType: string;
  subscriptions: Array<Subscription>;
  tabIndex: number = 1;
  maxIndex: number = 6;
  minIndex: number = 1

  constructor(private _service: SharedService) { }

  ngOnInit(): void {
    this.subscriptions = [];
    this.subscriptions.push(this._service.themeType.subscribe((data: string) => {
      this.themeType = data;
    }));
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

  goNext() {
    if (this.tabIndex < this.maxIndex) {
      this.tabIndex = this.tabIndex + 1;
    }
  }

  goPrevious() {
    if (this.tabIndex > this.minIndex) {
      this.tabIndex = this.tabIndex - 1;
    }
  }

  goToPage(index) {
    if (this.tabIndex != index) {
      this.tabIndex = index;
    }
  }

}
