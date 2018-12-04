import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { rcAnimation } from '../../shared/animation';
import { HostBinding } from '@angular/core';
import { SelectItem } from './../../shared/types/SelectItem.type';

@Component({
  selector: 'app-review-condition',
  templateUrl: './review-condition.component.html',
  styleUrls: ['./review-condition.component.css'],
  animations: [rcAnimation]
})
export class ReviewConditionComponent implements OnInit {

  @Input() condition: any;
  @Input() switch: string;
  @Input() spIdx: number;
  @Input() pIdx: number;
  @Input() cIdx: number;
  @Input() ddOptions: any;
  @Input() comp: string;

  @HostBinding('@rcAnimation') display: boolean = true;

  @Output() operandChange = new EventEmitter<any>();
  @Output() typeChange = new EventEmitter<any>();

  operators: Array<SelectItem>;
  types: Array<SelectItem>;
  icOperators: Array<SelectItem>;
  icValTypes: Array<SelectItem>;
  icTypes: Array<SelectItem>;

  isTypeDisplayed: boolean;

  config: any;

  constructor() { }

  ngOnInit() {
    this.isTypeDisplayed = false;

    if (this.cIdx && this.cIdx > 0) this.isTypeDisplayed = true;
    else if (this.pIdx && this.pIdx > 0) this.isTypeDisplayed = true;

    this.config = {
      displayKey: "label",
      search: false
    }

    this.operators = this.ddOptions.operators;
    this.types = this.ddOptions.types;
    this.icTypes = this.ddOptions.icTypes;
    this.icOperators = this.ddOptions.icOperators;
    this.icValTypes = this.ddOptions.icValTypes;

  }

  operatorChanged(event, prop) {

    let changeData = {
      value: event.value,
      component: this.comp,
      property: prop,
      sParentIdx: this.spIdx,
      parentIdx: this.pIdx,
      childIdx: this.cIdx
    }

    this.operandChange.emit(changeData);

  }

  typeChanged(event, prop) {

    let changeData = {
      value: event.value,
      component: this.comp,
      property: prop,
      sParentIdx: this.spIdx,
      parentIdx: this.pIdx,
      childIdx: this.cIdx
    }

    this.typeChange.emit(changeData);

  }

}
