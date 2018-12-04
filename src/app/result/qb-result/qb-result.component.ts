import { Component, OnInit, ViewChild, Injectable, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TreeService } from '@services/tree.service';
import { FileNode } from '@common/types/file-node';
import { QueryBuilderComponent } from '@dialog/query-builder/query-builder.component';
import { SharedService } from '@services/shared.service';
import { AppService } from '@services/app.service';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { Doc } from '@common/types/doc';
import { ModalData } from '@common/types/modal-data';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-qb-result',
  templateUrl: './qb-result.component.html',
  styleUrls: ['./qb-result.component.scss']
})
export class QbResultComponent implements OnInit, OnDestroy {

  title: string = 'Results for review';
  data: any;
  stIndex: number;
  dtIndex: number;
  nestedTreeControl: NestedTreeControl<FileNode>;
  nestedDataSource: MatTreeNestedDataSource<FileNode>;
  subscriptions: Array<Subscription>;

  constructor(private _dsService: SharedService,
    private _tService: TreeService,
    private _service: AppService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this._dsService.dataObservable.subscribe((param) => {
      this.data = JSON.parse(param.content.data);
      this.nestedDataSource.data = this._tService.createTree(this.data);
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

  launchBuilder(stIndex: number, dtIndex: number, instIdx: number) {
    this.stIndex = stIndex;
    this.dtIndex = dtIndex;

    this._service.getConditionTypes().then(res => {

      let modalOptions: ModalData = {
        query: this.data[stIndex].importTables[dtIndex].itqInstances[instIdx],
        itName: this.data[stIndex].importTables[dtIndex].importTableName,
        src: this.data[stIndex].sourceTable + ' ' + this.data[stIndex].sourceTableAlias,
        wcTypes: res.wcTypes,
        jTypes: res.jTypes,
        operands: res.operands,
        jcOperands: res.jcOperands,
        icTypes: res.icTypes,
        icOperators: res.icOperators,
        valTypes: res.valTypes
      };

      this.showDialog(modalOptions);
    }, err => {
      console.log('Error while fetching condition types');
    });

  }

  hasNestedChild = (_: number, nodeData: FileNode) => !nodeData.type;

  private _getChildren = (node: FileNode) => node.children;

  showDialog(modalOptions: ModalData): void {
    const dialogRef = this.dialog.open(QueryBuilderComponent, {
      data: modalOptions
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result: ModalData) => {
      if (result && result.list.length > 0) {
        this.dialogClosed(result);
      }
    }));
  }

  dialogClosed(event) {
    let query = event.query;
  }

}
