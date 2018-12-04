import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';

type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public configObservable = new Subject<AOA>();

  constructor() { }

  transform(file: File): void {

    let jsonData;

    const reader: FileReader = new FileReader();
    //For reading file as binary string
    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      jsonData = <AOA>(XLSX.utils.sheet_to_json(ws, { raw: true, header: 1 }));

      this.configObservable.next(jsonData);
    };

    reader.readAsBinaryString(file);

  }

}
