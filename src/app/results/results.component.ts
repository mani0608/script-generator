import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService } from '../app.service';
import { ResultsService } from '../shared/results.service';
import { DataStorageService } from '../shared/data-storage.service';
import { ReviewQueryComponent } from '../modal/review-query/review-query.component';

import { SelectItem } from './../shared/types/SelectItem.type';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, OnDestroy {

  @ViewChild(ReviewQueryComponent) rqComponent: ReviewQueryComponent;

  @Input() public docs: Array<any>;

  sortOptions: Array<SelectItem[]>;
  sortKey: Array<string>;
  sortField: Array<string>;
  sortOrder: Array<number>;
  reviewType: string;
  reviewSTIndex: number; //array index
  reviewITIndex: number; //queryIndex property of dtquery

  @Input() docName: string;
  @Input() docVersion: string;

  constructor(private _service: AppService,
    private _rservice: ResultsService,
    private _dsService: DataStorageService,
    private _router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    if (!this.docs || _.size(this.docs) == 0) {
      let storedData = this._dsService.fetch();

      if (storedData.data) {
        this.docs = storedData.data;
      } else {

        this.docName = storedData.content.name;
        this.docVersion = storedData.content.version;

        this._service.search(storedData.content.name, storedData.content.version).then((response) => {
          this.docs = response.docs;
          this.sortOptions = new Array();
          this.initializeSortOptions();
          this.sortField = new Array();
          this.sortOrder = new Array();
          this.sortKey = new Array();
        }).catch((error) => {
          console.log('error while retrieving docs ', error);
        });
      }
    } else {
      this.sortOptions = new Array();
      this.initializeSortOptions();
      this.sortField = new Array();
      this.sortOrder = new Array();
      this.sortKey = new Array();
    }
  }

  initializeSortOptions() {
    _.forEach(this.docs, (doc, index, docs) => {
      let sortOption: SelectItem[] = new Array();
      sortOption.push({ label: 'Sort Desc', value: '!destinationTable' });
      sortOption.push({ label: 'Sort Asc', value: 'destinationTable' });
      this.sortOptions.push(sortOption);
    });
  }

  onSortChange(event, index) {
    let value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder[index] = -1;
      this.sortField[index] = value.substring(1, value.length);
    }
    else {
      this.sortOrder[index] = 1;
      this.sortField[index] = value;
    }
  }

  reviewImportQuery(event, dtq, index) {

    let queries: Array<any> = new Array();

    this.reviewType = 'IMPORT';
    this.reviewSTIndex = index;
    this.reviewITIndex = dtq.queryIndex;

    queries.push(dtq);
    let modalOptions = {
      list: queries,
      title: 'Query for table: ' + dtq.destinationTable
    };
    this.rqComponent.show(modalOptions);
  }

  reviewSourceQuery(event, stq, index) {

    let queries: Array<any> = stq.destTableQueries;

    this.reviewType = 'SOURCE';
    this.reviewSTIndex = index;
    this.reviewITIndex = null;

    let modalOptions = {
      list: queries,
      title: 'Query for table: ' + stq.sourceTable
    };
    this.rqComponent.show(modalOptions);

  }

  //Save & Close
  dialogSaved(event) {

    let sourceTable: string;
    let dtQuery: any;
    let dtQueryIndex: number;
    let item: any = this.docs[this.reviewSTIndex];
    let list: Array<any> = event.list;

    if (this.reviewType === 'IMPORT') {
      dtQueryIndex = _.findIndex(item.destTableQueries, ['queryIndex', this.reviewITIndex]);
      dtQuery = item.destTableQueries[dtQueryIndex];
      dtQuery.destinationTableQuery = list[0].destinationTableQuery;
      //item.destTableQueries[dtQueryIndex] = dtQuery;
    } else if (this.reviewType === 'SOURCE') {
      item.destTableQueries = list;
    }

    let doc = {
      _id: item._id,
      _rev: item._rev,
      name: this.docName,
      version: this.docVersion,
      sourceTable: item.sourceTable,
      destTableQueries: item.destTableQueries
    };

    this._service.saveEdits(doc).then((res) => {
      console.log('Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving edits');
    });

  }

  //Closed without Saving
  dialogCancel(event) {
    console.log('Dialog cotent saved');
  }

  exportExcel() {

    let records: Array<Array<any>> = new Array();
    let tableIndex: number = 0;
    let importSchema: string = '';

    records.push(['S.No.', 'Source Table', 'Destination Table', 'Destination Table Query']);

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          tableIndex = tableIndex + 1;
          records.push([tableIndex, item.sourceTable, dtQuery.destinationTable, dtQuery.destinationTableQuery]);
        });
      });

      this._rservice.exportAsExcel(records);

    });

  }

  exportSQLSingle() {
    let records: Array<any> = new Array();
    let tableIndex: number = 0;
    let importSchema: string = '';

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        if (!_.isNull(item.importSchema) && _.size(_.trim(item.importSchema)) > 0) {
          importSchema = item.importSchema + '.' + 'import.';
        }
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          let truncateQuery = 'BEGIN TRY TRUNCATE TABLE ' + importSchema + dtQuery.destinationTable + '\n\n';
          truncateQuery = truncateQuery + ' END TRY \n\n BEGIN CATCH \n\n';
          truncateQuery = truncateQuery + ' DELETE from ' + importSchema + dtQuery.destinationTable + '\n\n';
          records.push([truncateQuery]);
          records.push([dtQuery.destinationTableQuery + '\n\n']);
        });
      });

      this._rservice.exportAsTextFile(records);
    });
  }

  exportSQLMultiple() {

    let records: Array<any> = new Array();
    let tableIndex: number = 0;
    let prevDTName = null;
    let suffix = null;
    let importSchema: string = '';

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        if (!_.isNull(item.importSchema) && _.size(_.trim(item.importSchema)) > 0) {
          importSchema = item.importSchema + '.' + 'import.';
        }
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          suffix = '';

          if (_.isEqual(prevDTName, dtQuery.destinationTable)) {
            suffix = '' + _.toString(dtIndex);
          } else {
            prevDTName = dtQuery.destinationTable;
          }

          let truncateQuery = 'BEGIN TRY TRUNCATE TABLE ' + importSchema + dtQuery.destinationTable + '\n\n';
          truncateQuery = truncateQuery + ' END TRY \n\n BEGIN CATCH \n\n';
          truncateQuery = truncateQuery + ' DELETE from ' + importSchema + dtQuery.destinationTable + '\n\n';

          let record: any = {
            dtn: dtQuery.destinationTable,
            sfx: suffix,
            tq: truncateQuery,
            dtq: dtQuery.destinationTableQuery + '\n\n'
          }
          records.push(record);
        });
      });

      this._rservice.exportAsZipFile(records);
    });

  }

  ngOnDestroy() {
  }

}
