import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import { AppService } from '../app.service';
import * as _ from 'lodash';

@Injectable()
export class HistoryResolver implements Resolve<Observable<any>> {
  constructor(private _service: AppService) { }

  resolve() {
    let allNames: Array<string> = new Array();
    let allVersions: Array<string> = new Array();
    return this._service.getOptions().then((response) => {
      let options: any = response.docs;
      return Observable.of(_.chain(options).uniqWith(_.isEqual).groupBy('name').values().map(
        (group) => {
          return {
            itn: _.get(group[0], "name"),
            vsn: _.map(group, "version")
          }
        }
      ).value());
    });
  }
}