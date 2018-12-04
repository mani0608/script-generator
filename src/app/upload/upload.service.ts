import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs/Subject';

type AOA = any[][];

@Injectable()
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
      jsonData = <AOA>(XLSX.utils.sheet_to_json(ws, { raw:true, header: 1 }));

      this.configObservable.next(jsonData);

      //  this._service.sendNodeFile(jsonData).then((response) => {
      //    console.log("File Sent successfully: ", response);
      //    this._router.navigateByUrl('results');
      //  }, (error) => {
      //    console.log("Issue while sending file to the server: ", error);
      //  });
    };

    reader.readAsBinaryString(file);

  }

}
