import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';

import { AppService } from '../../app.service';
import { DataStorageService } from '../../shared/data-storage.service';
import { QueryBuilderComponent } from '../../modal/query-builder/query-builder.component';
import { TreeNode } from 'primeng/api';
import * as _ from 'lodash';
import { treeNodeAnimation } from '../../shared/animation'

@Component({
  selector: 'app-review-scripts',
  templateUrl: './review-scripts.component.html',
  styleUrls: ['./review-scripts.component.css'],
  animations: [ treeNodeAnimation ]
})
export class ReviewScriptsComponent implements OnInit {

  data: any;

  stIndex: number;

  dtIndex: number;

  dtInstancesTree: any;

  treeInstance: Array<TreeNode>;

  @HostBinding('@treeNodeAnimation')
  treeStatus: string = "collapsed";


  @ViewChild(QueryBuilderComponent) qbComponent: QueryBuilderComponent;

  constructor(private _dsService: DataStorageService,
    private _service: AppService) { }

  ngOnInit() {

    let storedData = this._dsService.fetch();
    this.data = JSON.parse(storedData.content.data);
    console.log(this.data);
    this.prepareTree();
  }

  launchBuilder(stIndex: number, dtIndex: number, instIdx: number) {
    this.stIndex = stIndex;
    this.dtIndex = dtIndex;

    this._service.getConditionTypes().then(res => {

      let modalOptions = {
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

      this.qbComponent.show(modalOptions);
    }, err => {
      console.log('Error while fetching condition types');
    });

  }

  prepareTree() {

    this.dtInstancesTree = { };

    _.forEach(this.data, (st, idx, sts) => {
      _.forEach(st.importTables, (it, idx, its) => {
        this.dtInstancesTree[it.importTableName] = this.getTreeValue(it);
      });
    });

  }

  getTreeValue(it: any): Array<TreeNode> {

    this.treeInstance = new Array();

    let treeContent: TreeNode = {};

    treeContent.label = it.importTableName + "(" + _.size(it.itqInstances) + ")";
    treeContent.data = { isDoAction: false };
    treeContent.children = new Array<TreeNode>();

    _.forEach(it.itqInstances, (inst, idx, insts) => {
      let childNode: TreeNode = {};
      childNode.label = it.importTableName + (idx + 1);
      childNode.data = { isDoAction: true, instIdx: idx };
      treeContent.children.push(childNode);
    });

    if (_.size(it.itqInstances) == 1) {
      treeContent.leaf = true;
    }

    this.treeInstance.push(treeContent);

    return this.treeInstance;
  }

  nodeExpand(data) {
    this.treeStatus = "expanded";
  }

  nodeCollapse(data) {
    this.treeStatus = "collapsed";
  }

  dialogClosed(event) {
    console.log('Closed builder');
    let query = event.query;
  }

  dialogSaved(event) {
    console.log('Saved Builder');
  }

}
