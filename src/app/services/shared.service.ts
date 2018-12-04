import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService implements OnInit, OnDestroy {

  public dataV: any;
  public dataSubscribe: BehaviorSubject<any> = new BehaviorSubject("");
  public dataObservable: Observable<any> = this.dataSubscribe.asObservable();
  public themeTypeValue: string;
  public themeTypeSubscribe: BehaviorSubject<string> = new BehaviorSubject("");
  public themeTypeObservable: Observable<string> = this.themeTypeSubscribe.asObservable();
  public historyCountValue: number = 0;
  public historyCountSubscribe: BehaviorSubject<number> = new BehaviorSubject(0);
  public historyCountObservable: Observable<number> = this.historyCountSubscribe.asObservable();

  constructor(private _service: AppService) {
    this.initHistoryCount();
  }

  ngOnInit(): void { }

  storeThemeType(type: string): void {
    this.themeTypeValue = type;
    this.themeTypeSubscribe.next(type);
  }

  get themeType(): Observable<string> {
    return this.themeTypeObservable;
  }

  initHistoryCount(): void {
    this._service.getDocsCount().then((response: any) => {
      this.historyCountValue = response.count;
      this.historyCountSubscribe.next(this.historyCountValue);
    });
  }

  incrementHistoryCount(): void {
    this.historyCountValue = this.historyCountValue + 1;
    this.historyCountSubscribe.next(this.historyCountValue);
  }

  get historyCount(): Observable<number> {
    return this.historyCountObservable;
  }

  isEmpty(): boolean {
    this.dataV = this.dataSubscribe.value();
    return this.dataV === null || this.dataV === undefined;
  }

  store(data: any): void {
    this.dataV = data;
    this.dataSubscribe.next(data);
  }

  get data(): Observable<any> {
    return this.dataObservable;
  }

  ngOnDestroy(): void {
    this.dataObservable = null;
    this.dataSubscribe = null;
    this.themeTypeObservable = null;
    this.themeTypeSubscribe = null;
    this.historyCountObservable = null;
    this.historyCountSubscribe = null;
  }

}
