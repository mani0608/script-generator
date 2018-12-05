import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService } from '@services/app.service';
import { ReviewQueryComponent } from '@dialog/review-query/review-query.component';
import * as _ from 'lodash';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { Doc } from '@common/types/doc';
import { SharedService } from '@services/shared.service';
import { ResultService } from '@services/result.service';
import { ModalData } from '@common/types/modal-data';
import { Subscription } from 'rxjs';
import { QueryCompareComponent } from '@dialog/query-compare/query-compare.component';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss']
})
export class QueryResultComponent implements OnInit, OnDestroy {

  public docs: Array<Doc>;
  docName: string;
  docVersion: string;
  subscriptions: Array<Subscription>;
  versionCount: number;

  reviewType: string;
  reviewSTIndex: number; //array index
  reviewITIndex: number; //queryIndex property of dtquery

  ompareType: string;
  compareSTIndex: number; //array index
  compareITIndex: number; //queryIndex property of dtquery

  constructor(private _service: AppService,
    private _rservice: ResultService,
    private _dsService: SharedService,
    public dialog: MatDialog,
    private _router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscriptions = [];

    this.subscriptions.push(this._dsService.data.subscribe((content) => {
      let storedData = content;
      if (storedData.data) {
        this.docs = storedData.data;
      } else {

        this.docName = storedData.content.name;
        this.docVersion = storedData.content.version;

        this._service.search(storedData.content.name, storedData.content.version).then((response) => {
          this.docs = response.docs;
        }).catch((error) => {
          console.log('error while retrieving docs ', error);
        });

        this._service.getVersionCount(this.docName).then((response) => {
          this.versionCount = response.count;
        });
      }
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

  //review single
  reviewSingleQuery(event) {

    const index = event.stIndex;
    const dtq = event.dtQuery;
    let queries: Array<any> = new Array();

    this.reviewType = 'IMPORT';
    this.reviewSTIndex = index;
    this.reviewITIndex = dtq.queryIndex;

    queries.push(dtq);
    let modalData: ModalData = {
      list: queries,
      title: 'Query for table: ' + dtq.destinationTable
    };
    this.showReviewDialog(modalData);
  }

  //review multiple
  reviewMultipleQueries(event) {

    const index = event.stIndex;
    const stq = this.docs[index];
    let queries: Array<any> = stq.destTableQueries;

    this.reviewType = 'SOURCE';
    this.reviewSTIndex = index;
    this.reviewITIndex = null;

    let modalData: ModalData = {
      list: queries,
      title: 'Query for table: ' + stq.sourceTable
    };
    this.showReviewDialog(modalData);
  }

  compareSingleQuery(event): void {

    const stIndex = event.stIndex;
    const stq = this.docs[stIndex];
    const dtq = event.dtQuery;
    let queries: Array<any> = new Array();

    this.reviewType = 'IMPORT';
    this.reviewSTIndex = stIndex;
    this.reviewITIndex = dtq.queryIndex;

    queries.push(dtq);
    let modalData: ModalData = {
      impName: this.docName,
      impVersion: this.docVersion,
      itName: dtq.destinationTable,
      stName: stq.sourceTable,
      index: dtq.queryIndex,
      list: queries,
      isMultiCompare: false,
      title: 'Compare: ' + dtq.destinationTable
    };
    this.showCompareDialog(modalData);
  }

  compareMultipleQueries(event) {

    let stIndex = event.stIndex;
    const stq = this.docs[stIndex];
    let queries: Array<any> = stq.destTableQueries;

    this.reviewType = 'SOURCE';
    this.reviewSTIndex = stIndex;
    this.reviewITIndex = null;

    let modalData: ModalData = {
      impName: this.docName,
      impVersion: this.docVersion,
      stName: stq.sourceTable,
      list: queries,
      isMultiCompare: true,
      title: 'Compare: ' + stq.sourceTable
    };
    this.showCompareDialog(modalData);
  }

  showReviewDialog(modalOptions: ModalData): void {
    const dialogRef = this.dialog.open(ReviewQueryComponent, {
      data: modalOptions
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result: ModalData) => {
      if (result && result.list.length > 0) {
        this.reviewSaved(result);
      }
    }));
  }

  showCompareDialog(modalOptions: ModalData): void {
    const dialogRef = this.dialog.open(QueryCompareComponent, {
      data: modalOptions
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result: ModalData) => {
      if (result.status === 'saved') {
        this.compareSaved(result);
      }
    }));
  }

  //Save & Close
  reviewSaved(event) {

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

  compareSaved(event: ModalData) {

    let srcDoc: any = this.docs[this.reviewSTIndex];
    let tgtDoc: Doc = event.tgtDoc;

    this._service.saveEdits(srcDoc).then((res) => {
      console.log('Source Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving source edits');
    });

    this._service.saveEdits(tgtDoc).then((res) => {
      console.log('Target Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving target edits');
    });


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
    let stName: string;
    let dtName: string;
    let nextDTName = null;
    let fileNamePrefix: string;
    let importSchema: string = '';
    let mergedDestinationQueries: string = '';
    let finalQuery: string = '';
    let queryComment: string = '';
    let truncateQuery: string = '';

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      //      let destQueries =  _.sortBy(_.map(result, _.partial(_.ary(_.pick, 2), _, ['importSchema', 'destTableQueries'])), "destinationTable");
      const elevatedRecord = _.flatMap(result, (st) => {
        return _.map(st.destTableQueries, (dt) => {
          return {
            sourceTableName: st.sourceTable,
            importSchema: st.importSchema,
            destinationTable: dt.destinationTable,
            destinationTableQuery: dt.destinationTableQuery,
            isRelationship: dt.isRelationship
          };
        })
      })
      const groupDestTableRecords: Array<any> = _.flatMap(_.chain(elevatedRecord).groupBy("destinationTable").value());

      _.forEach(groupDestTableRecords, (dtQuery, dtIndex, dtQueries) => {

        nextDTName = null;
        fileNamePrefix = '';

        if (dtIndex + 1 < _.size(groupDestTableRecords)) {
          nextDTName = groupDestTableRecords[dtIndex + 1].destinationTable;
        }

        if (dtQuery.isRelationship) {
          fileNamePrefix = "rel_";
        }

        stName = _.replace(_.upperCase(dtQuery.destinationTable),  new RegExp(" ","g"), '');
        dtName = _.replace(_.upperCase(dtQuery.sourceTableName),  new RegExp(" ","g"), '');

        queryComment = '--CREATE ' + dtName + ' FOR ' + stName  + '\n';

        if (!_.isNull(dtQuery.importSchema) && _.size(_.trim(dtQuery.importSchema)) > 0) {
          importSchema = dtQuery.importSchema + '.' + 'import.';
        }

        if (nextDTName && _.isEqual(nextDTName, dtQuery.destinationTable)) {
          mergedDestinationQueries = mergedDestinationQueries + queryComment + dtQuery.destinationTableQuery + '\n\n';
        } else {
          nextDTName = null;
          if (mergedDestinationQueries && mergedDestinationQueries.trim().length > 0) {
            finalQuery = mergedDestinationQueries + queryComment + dtQuery.destinationTableQuery;
            mergedDestinationQueries = '';
          } else {
            finalQuery = queryComment + dtQuery.destinationTableQuery + '\n\n';
          }

          truncateQuery = 'BEGIN TRY TRUNCATE TABLE ' + importSchema + dtQuery.destinationTable + '\n\n';
          truncateQuery = truncateQuery + ' END TRY \n\n BEGIN CATCH \n\n';
          truncateQuery = truncateQuery + ' DELETE FROM ' + importSchema + dtQuery.destinationTable + '\n\n';

          finalQuery = truncateQuery + finalQuery;

          const splitQuery = _.split(finalQuery, /\r?\n/);

          let prevText = null;
          let offsetCount = 0;

          //finalQuery = _.chain(splitQuery).map(text => _.replace(text, /\t{2,}/, '')).join('\r\n').value();
          finalQuery = _.map(splitQuery,  (text) => {
            let count = text.search(/\S/);
            if (prevText === null) {
              prevText = text;
            } else {
              if (prevText === '' && text !== '' && text.trim().length > 0 && count > 0) {
                offsetCount = count;
                prevText = text;
              } else if (text === '' || count === 0) {
                offsetCount = 0;
                prevText = text;
              }
            }
            
            if (count > 0) {
              let repeatCount = 0;
              if (count > offsetCount + 2) {
                repeatCount = Math.abs(offsetCount - _.round(count/2));
              }
              return _.repeat(' ', repeatCount) + _.replace(text, /\s+/, '');
            }
            return text;
          }).join('\r\n');

          let record: any = {
            dtn: dtQuery.destinationTable,
            fnp: fileNamePrefix,
            dtq: finalQuery
          }
          records.push(record);
        }
      });

      this._rservice.exportAsZipFile(records);
    });

  }

}
