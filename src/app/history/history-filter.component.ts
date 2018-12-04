import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SelectItem } from './../shared/types/SelectItem.type';
import * as _ from 'lodash';
import { Message } from 'primeng/components/common/api';

import { AppService } from '../app.service';
import { ResultsComponent } from '../results/results.component';

import { shrinkHF, hfAnimation } from '../shared/animation';

@Component({
  selector: 'app-history-filter',
  templateUrl: './history-filter.component.html',
  styleUrls: ['./history-filter.component.css'],
  animations: [ shrinkHF, hfAnimation ]
})
export class HistoryFilterComponent implements OnInit {

  @HostBinding('@hfAnimation')
  isAnimate:boolean = true;

  @HostBinding('@shrinkHF')
  state: string = 'in';

  names: SelectItem[];
  versions: SelectItem[];
  selectedName: string;
  selectedVersion: string;
  history: Array<any>;
  messages: Array<Message> = [];
  docs: Array<any>;
  isVersionDisabled: boolean;

  @ViewChild(ResultsComponent) resultComponent: ResultsComponent;

  constructor(private route: ActivatedRoute,
    private _router: Router,
    private _service: AppService) { }

  ngOnInit() {
    this.names = new Array();
    this.versions = new Array();
    let data = this.route.data;
    this.isVersionDisabled = true;

    data.subscribe((res) => {
      this.history = res.history.value;
      this.loadSelectedItems();
    });
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

  getVersions(event) {

    this.docs = new Array();

    let selectedImport = event.value;

    let versionsOfName:Array<string> = _.chain(this.history).filter(opt => _.isEqual(opt.itn, selectedImport)).head().get('vsn').value();

    this.versions = new Array();

    this.isVersionDisabled = false;

    _.forEach(versionsOfName, (vrsn, vsnIdx, vrsns) => {
      if (vsnIdx == 0) {
        this.selectedVersion = vrsn;
      }
      this.versions.push({ label: vrsn, value: vrsn });
    });

  }

  search() {
    this.messages = [];
    if (_.isNull(this.selectedName) || _.size(_.trim(this.selectedName)) == 0) {
      this.messages.push({ severity: 'error', summary: 'Error Message', detail: 'Please select an import to search' });
    }

    if (_.isNull(this.selectedVersion) || _.size(_.trim(this.selectedVersion)) == 0) {
      this.messages.push({ severity: 'error', summary: 'Error Message', detail: 'Please select a version to search' });
    }
    if (_.size(this.messages) == 0) {
      this._service.search(this.selectedName, this.selectedVersion).then((response) => {
        //this.docs = _.map(response.docs, (obj, idx, objs) => Object.assign(new Doc(), obj));
        this.docs = response.docs;
        this.toggleHistorySection();
      }).catch((error) => {
        console.log('Error during search: ', error);
      })
    }
  }

  clear() {
    this.docs = [];
  }

  home() {
    this._router.navigateByUrl('/app');
  }

  toggleHistorySection() {
    if (this.state == 'in') this.state = 'out'; 
      else this.state = 'in';
  }

}
