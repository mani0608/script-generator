import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SelectItem } from '@common/types/select-item';

@Component({
  selector: 'app-dual-list',
  templateUrl: './dual-list.component.html',
  styleUrls: ['./dual-list.component.scss']
})
export class DualListComponent implements OnInit {

  @Input('source') source: Array<SelectItem>;
  @Input('target') target: Array<SelectItem>;

  @Output() fetchTarget: EventEmitter<string> = new EventEmitter();
  @Output() persistTarget: EventEmitter<string> = new EventEmitter();

  selectedSourceIndex: number;
  selectedTargetIndex: number;

  constructor() { }

  ngOnInit() {
    this.selectedSourceIndex = 0;
    this.selectedTargetIndex = 0;
  }

  populateTarget(index: number, value: string): void {
    if (this.selectedSourceIndex !== index) {
      this.selectedSourceIndex = index;
      this.fetchTarget.emit(value);
    }
  }

  search (index: number, value: string): void {
    this.selectedTargetIndex = index;
    this.persistTarget.emit(value);
  }

}
