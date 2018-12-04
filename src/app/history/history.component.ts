import { Component, OnInit, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SelectItem } from '../common/types/select-item';
import { Messages, Message } from '@common/types/messages';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '@services/app.service';
import * as _ from 'lodash';
import { shrinkHF, hfAnimation } from '@common/animations/animation';
import { MessageHandlerComponent } from '@common/components/message-handler/message-handler.component';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {

  title: string = 'Browse historical uploads';

  /* @HostBinding('@hfAnimation') */
  isAnimate: boolean = true;
  subscriptions: Array<Subscription>;
  names: SelectItem[];
  versions: SelectItem[];
  selectedName: string;
  selectedVersion: string;
  history: Array<any>;
  messages: Messages;
  isVersionDisabled: boolean;

  constructor(private route: ActivatedRoute,
    private _router: Router,
    private _service: AppService,
    private _dService: SharedService,
    private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.subscriptions = [];
    this.names = new Array();
    this.versions = new Array();
    let data = this.route.data;
    this.isVersionDisabled = true;

    this.subscriptions.push(data.subscribe((res) => {
      this.history = res.history.value;
      this.loadSelectedItems();
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

  loadSelectedItems() {

    let firstOption = this.history[0];

    this.selectedName = firstOption.itn;
    this.selectedVersion = firstOption.vsn[0];

    this.isVersionDisabled = false;

    _.forEach(this.history, (opt, optIdx, opts) => {
      this.names.push({ label: opt.itn, value: opt.itn });
    });

    _.forEach(this.history[0].vsn, (vrsn, vsnIdx, vrsns) => {
      this.versions.push({ label: vrsn, value: vrsn });
    });
  }

  getVersions(value) {

    let selectedImport = value;

    this.selectedName = value;

    let versionsOfName: Array<string> = _.chain(this.history).filter(opt => _.isEqual(opt.itn, selectedImport)).head().get('vsn').value();

    this.versions = new Array();

    this.isVersionDisabled = false;

    _.forEach(versionsOfName, (vrsn, vsnIdx, vrsns) => {
      if (vsnIdx == 0) {
        this.selectedVersion = vrsn;
      }
      this.versions.push({ label: vrsn, value: vrsn });
    });

  }

  persistTarget(value) {
    this.selectedVersion = value;
  }

  search() {
    this.messages = new Messages();
    if (_.isNull(this.selectedName) || _.size(_.trim(this.selectedName)) == 0) {
      this.messages.addMessage('error', 'Error Message', 'Please select an import to search');
    }

    if (_.isNull(this.selectedVersion) || _.size(_.trim(this.selectedVersion)) == 0) {
      this.messages.addMessage('error', 'Error Message', 'Please select an import to search');
    }
    if (_.size(this.messages.messages) == 0) {

      this._dService.store({
        reviewFlag: false,
        content: {
          name: this.selectedName,
          version: this.selectedVersion
        }
      });
      this._router.navigate(['result', { path: 'qr' }], { relativeTo: this.route, skipLocationChange: true });
    } else {
      this.showMessage();
    }
  }

  clear() {
    this._router.navigate(['/home/history'], { skipLocationChange: true });
  }

  showMessage() {
    let snackbarRef = this.snackbar.openFromComponent(MessageHandlerComponent, {
      data: this.messages
    });

    this.subscriptions.push (snackbarRef.afterDismissed().subscribe(() => { }));
  }

}
