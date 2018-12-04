import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  path: string;
  subscriptions: Array<Subscription>;

  constructor(private _ar: ActivatedRoute) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this._ar.params.subscribe((data) => {
      this.path = data['path'];
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

}
