import { Injectable } from '@angular/core';

@Injectable()
export class DataStorageService {

  public data: any;

  constructor() { }

  isEmpty(): boolean {
    return this.data === null || this.data === undefined;
  }

  clear(): void {
    this.data = null;
  }

  store(data:any) {
    this.data = data;
  }

  fetch(): any {

    if (this.isEmpty()) return {};

    let temp: any = this.data
    this.clear();
    return temp;
  }

}
