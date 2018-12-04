import {
  Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef,
  ElementRef, HostBinding, Inject
} from '@angular/core';
import * as _ from 'lodash';
import { SelectItem } from '@common/types/select-item';
import { qbAnimation } from '@common/animations/animation';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ModalData } from '@common/types/modal-data';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit {

  /* @HostBinding('@qbAnimation') */
  public dialogStatus: string = 'none';

  @ViewChild('dialogBtn') dialogBtn: ElementRef;

  itQuery: any;

  itQueryBackup: any;

  ddOptions: any;

  whereConditionTypes: Array<string>;

  joinConditionOperators: Array<string>;

  conditionOperators: Array<string>;

  indexConditionTypes: Array<string>;

  indexConditionOperators: Array<string>;

  idxValueTypes: Array<string>;

  joinTypes: Array<string>;

  //condition operand - =, <>, IN, NOT IN etc
  public cOperators: Array<SelectItem>;

  //AND, OR
  public wcTypes: Array<SelectItem>;

  //== and <>
  public jcOperators: Array<SelectItem>;

  //Join Types - INNER JOIN, OUTER JOIN etc
  public jTypes: Array<SelectItem>;

  //Where condition types - AND, OR
  public whereCondTypes: Array<SelectItem>;

  //Index condition types - CHARINDEX, PATINDEX
  public icTypes: Array<SelectItem>;

  //Operators for CHARINDEX, PATINDEX: =, <>, >, <
  public icOperators: Array<SelectItem>;

  //Value types for CHARINDEX, PATINDEX: ALPHA, NUMERIC, ALPHA-NUMERIC
  public valTypes: Array<SelectItem>;

  public title: string;

  public msgs: Array<any>;

  public sourceTable: string;

  constructor(private _cdref: ChangeDetectorRef,
    public dialogRef: MatDialogRef<QueryBuilderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData,
    private snackbar: MatSnackBar) {
    //this._cdref.detectChanges();
  }

  ngOnInit() {
    this.dialogStatus = 'none';
    this.initialize();
  }

  initialize() {
    this.msgs = [];
    this.wcTypes = [];
    this.jcOperators = [];
    this.cOperators = [];
    this.jTypes = [];
    this.icTypes = [];
    this.icOperators = [];
    this.valTypes = [];
    this.whereCondTypes = [];
    this.ddOptions = {
      opertors: null,
      types: null,
      icTypes: null,
      icOperators: null,
      icValTypes: null
    }
    this.itQuery = this.data.query;
    this.itQueryBackup = this.data.query;
    this.whereConditionTypes = this.data.wcTypes;
    this.joinTypes = this.data.jTypes;
    this.joinConditionOperators = this.data.jcOperands;
    this.conditionOperators = this.data.operands;
    this.indexConditionTypes = this.data.icTypes,
      this.indexConditionOperators = this.data.icOperators;
    this.idxValueTypes = this.data.valTypes;
    this.sourceTable = this.data.src;
    this.title = "Query Builder: " + this.data.itName;
    this.populateTypes();
    this.dialogBtn.nativeElement.click();
    this.dialogStatus = 'show';
    this._cdref.detectChanges();
  }

  populateTypes() {

    _.forEach(this.whereConditionTypes, (type, index, types) => {
      this.wcTypes.push({ label: type, value: type });
    });

    _.forEach(this.joinConditionOperators, (type, index, types) => {
      this.jcOperators.push({ label: type, value: type });
    });

    _.forEach(this.conditionOperators, (type, index, types) => {
      this.cOperators.push({ label: type, value: type });
    });

    _.forEach(this.joinTypes, (type, index, types) => {
      this.jTypes.push({ label: type, value: type });
    });

    _.forEach(this.indexConditionTypes, (type, index, types) => {
      this.icTypes.push({ label: type, value: type });
    });

    _.forEach(this.indexConditionOperators, (type, index, types) => {
      this.icOperators.push({ label: type, value: type });
    });

    _.forEach(this.idxValueTypes, (type, index, types) => {
      this.valTypes.push({ label: type, value: type });
    });

  }

  isSimpleField(item) {
    return (item.caseWhenCandidates.length == 0 && item.concatCandidates.length == 0)
  }

  generateItem(items, selectItems, source) {
    items.push({ label: 'Select ' + source, value: null });
    _.forEach(items, (type, index, types) => {
      selectItems.push({ label: type, value: type });
    });
  }

  getDDOptions(type) {

    switch (type) {

      case 'caseWhenCandidates':
        this.ddOptions.opertors = this.cOperators;
        this.ddOptions.types = this.wcTypes;
        this.ddOptions.icTypes = this.icTypes;
        this.ddOptions.icOperators = this.icOperators;
        this.ddOptions.icValTypes = this.valTypes;
        return this.ddOptions;
      case 'tableJoins':
        this.ddOptions.opertors = this.jcOperators;
        this.ddOptions.types = this.wcTypes;
        this.ddOptions.icTypes = this.icTypes;
        this.ddOptions.icOperators = this.icOperators;
        this.ddOptions.icValTypes = this.valTypes;
        return this.ddOptions;
      case 'whereConditions':
        this.ddOptions.opertors = this.cOperators;
        this.ddOptions.types = this.wcTypes;
        this.ddOptions.icTypes = this.icTypes;
        this.ddOptions.icOperators = this.icOperators;
        this.ddOptions.icValTypes = this.valTypes;
        return this.ddOptions;
      default:
        return this.ddOptions;
    }

  }

  typeChanged(event, component, property, parentIdx, childIdx) {

    let comp;
    let pIdx;
    let cIdx;
    let prop;

    if (component) comp = component;
    else comp = event.component;

    if (parentIdx || parentIdx == 0) pIdx = parentIdx;
    else pIdx = event.parentIdx;

    if (childIdx || childIdx == 0) cIdx = childIdx;
    else cIdx = event.childIdx;

    if (property) prop = property;
    else prop = event.property;

    let val = event.value;

    switch (comp) {
      case 'whereConditions': {
        this.itQuery.whereConditions[pIdx]['whereConditionType'] = val;
        break;
      }
      case 'tableJoins': {
        this.itQuery.tableJoins[pIdx][prop] = val;
        break;
      }
      default:
        break;
    }
  }

  operandChanged(event) {

    let comp = event.component;
    let prop = event.property;
    let pIdx = event.parentIdx;
    let cIdx = event.childIdx;
    let val = event.value;
    let spIdx = event.sParentIdx;

    switch (comp) {

      case 'caseWhenCandidates': {
        let propValue = this.itQuery.insertFields[spIdx].caseWhenCandidates[pIdx].conditions[cIdx][prop];
        let propCond = this.getPropForCondition(val);
        this.itQuery.insertFields[spIdx].caseWhenCandidates[pIdx].conditions[cIdx][propCond] = propValue;
        this.itQuery.insertFields[spIdx].caseWhenCandidates[pIdx].conditions[cIdx][prop] = null;
        break;
      }
      case 'concatCandidates': {
        let propValue = this.itQuery.insertFields[pIdx].concatCandidates[cIdx][prop];
        let propCond = this.getPropForCondition(val);
        this.itQuery.insertFields[pIdx].concatCandidates[cIdx][propCond] = propValue;
        this.itQuery.insertFields[pIdx].concatCandidates[cIdx][prop] = null;
        break;
      }
      case 'tableJoins': {
        let propValue = this.itQuery.tableJoins[pIdx].joinConditions[cIdx][prop];
        let propCond = this.getPropForCondition(val);
        this.itQuery.tableJoins[pIdx].joinConditions[cIdx][propCond] = propValue;
        this.itQuery.tableJoins[pIdx].joinConditions[cIdx][prop] = null;
        break;
      }
      case 'whereConditions': {
        let propValue = this.itQuery.whereConditions[pIdx][prop];
        let propCond = this.getPropForCondition(val);
        this.itQuery.whereConditions[pIdx][propCond] = propValue;
        this.itQuery.whereConditions[pIdx][prop] = null;
        break;
      }
    }
  }

  getPropForCondition(cond) {

    switch (cond) {
      case '<>':
        return 'neqCondition';
      case '=':
        return 'eqCondition';
      case 'IS NOT NULL':
        return 'isNotNullCondition';
      case 'IS NULL':
        return 'isNullCondition';
      case 'NOT IN':
        return 'notInCondition';
      case 'IN':
        return 'inCondition';
      case 'NOT LIKE':
        return 'notLikeCondition';
      case 'LIKE':
        return 'likeCondition';
    }

  }

  add(type) {

    switch (type) {

      case 'whereConditions':
        break;
      case 'caseWhenCandidates':
        break;
      default:
        break;
    }

  }

  remove(type, pIdx, cIdx) {

    switch (type) {

      case 'caseWhenCandidates': {
        _.remove(this.itQuery.insertFields[pIdx].caseWhenCandidates, (cand, idx, cands) => (idx === cIdx));
        break;
      }
      case 'concatCandidates': {
        _.remove(this.itQuery.insertFields[pIdx].concatCandidates, (cand, idx, cands) => (idx === cIdx));
        break;
      }
      case 'tableJoins': {
        _.remove(this.itQuery.tableJoins[pIdx].joinConditions, (cand, idx, cands) => (idx === cIdx));
        break;
      }
      case 'whereConditions': {
        _.remove(this.itQuery.whereConditions, (cond, idx, conds) => (idx === pIdx));
        break;
      }
    }
  }

  save() {
    let result = {
      query: this.itQuery
    }
    this.reset();
  }

  reset() {
    this.msgs = [];
  }

  closePopup() {

    let editedData = {
      query: this.itQuery
    }
    this.dialogStatus = 'none';
    this.dialogRef.close(editedData);
  }

}
