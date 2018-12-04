import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AppService } from '@services/app.service';
import * as _ from 'lodash';

@Injectable()
export class HistoryResolver implements Resolve<Observable<any>> {
  constructor(private _service: AppService) { }

  resolve() {
    let allNames: Array<string> = new Array();
    let allVersions: Array<string> = new Array();
    return this._service.getOptions().then((response) => {
      let options: any = response.docs;
      return of(_.chain(options).uniqWith(_.isEqual).groupBy('name').values().map(
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