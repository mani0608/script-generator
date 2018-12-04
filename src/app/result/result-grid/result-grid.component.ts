import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Doc } from '@common/types/doc';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { AppService } from '@services/app.service';

@Component({
  selector: 'app-result-grid',
  templateUrl: './result-grid.component.html',
  styleUrls: ['./result-grid.component.scss']
})
export class ResultGridComponent implements OnInit, AfterViewInit {

  @Input('data') data: Array<any>;
  @Input('pIndex') pIndex: number;
  @Input('versionCount') versionCount: number;

  @Output() reviewMultiple: EventEmitter<any> = new EventEmitter();
  @Output() reviewSingle: EventEmitter<any> = new EventEmitter();

  @Output() compareSingle: EventEmitter<any> = new EventEmitter();
  @Output() compareMultiple: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['queryIndex', 'destinationTable', 'destinationTableQuery', 'actions'];
  columnLabels: string[] = ['S.no', 'Import Table', 'Script', ''];
  dataSource: MatTableDataSource<any>;

  constructor() { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  reviewMultipleQueries() {
    const data: any = {
      stIndex: this.pIndex
    }

    this.reviewMultiple.emit(data);
  }

  reviewSingleQuery(dtQuery: any) {
    const data: any = {
      stIndex: this.pIndex,
      dtQuery: dtQuery
    }
    this.reviewSingle.emit(data);
  }

  compareSingleQuery(row: any): void {
    const data: any = {
      stIndex: this.pIndex,
      dtQuery: row
    }
    this.compareSingle.emit(data);
  }

  compareMultipleQueries(): void {
    const data: any = {
      stIndex: this.pIndex
    }

    this.compareMultiple.emit(data);
  }

}
