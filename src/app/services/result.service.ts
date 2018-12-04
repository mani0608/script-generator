import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-style';
import * as JSZip from 'jszip';
import * as _ from 'lodash';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const SQL_TEXT_TYPE = 'application/sql';
const BLOB_TYPE = 'blob';
const EXCEL_EXTENSION = '.xlsx';
const SQL_TEXT_EXTENSION = '.sql';
const ZIP_EXTENSION = '.zip';

type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  constructor() { }

  public exportAsExcel(data: any[]) {

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'scripts');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //let excelBuffer = Buffer.from(excelBase64, 'base64');
    this.saveAsExcelFile(excelBuffer, 'generated');

  }

  saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportAsTextFile(scriptData: AOA) {
    const data: Blob = new Blob([scriptData.join('')], {
      type: SQL_TEXT_TYPE
    });
    FileSaver.saveAs(data, 'script' + '_export_' + new Date().getTime() + SQL_TEXT_EXTENSION);
  }

  exportAsZipFile(records: any[]) {

    var zip = new JSZip();

    _.forEach(records, (record, index, records) => {
      zip.file(this.createFileName(record.dtn, record.sfx), record.tq + record.dtq);
    });

    zip.generateAsync({ type: "blob" })
      .then(function (content) {
        // see FileSaver.js
        FileSaver.saveAs(content, "scripts.zip");
      });

  }

  createFileName(itName: string, suffix: string): string {
    let name: string = _.toLower(_.camelCase(itName));
    if (!_.isEmpty(suffix)) name = name + '_' + suffix;
    return 'create' + name + '.sql';
  }

}
