import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

@Injectable()
export class AppService {

  public sendPathBaseURL: string = "http://localhost:3000/api/process";
  public getAllDocsURL: string = "http://localhost:3000/api/loadAll";
  public getDocURL: string = "http://localhost:3000/api/load";
  public saveEditsURL: string = "http://localhost:3000/api/save";
  public idsURL: string = "http://localhost:3000/api/ids";
  public searchURL: string = "http://localhost:3000/api/search";
  public optionsURL: string = "http://localhost:3000/api/options";
  public conditionTypesURL: string = "http://localhost:3000/api/ctypes";
  public countURL: string = "http://localhost:3000/api/count";

  constructor(private _http: Http) { }

  //This is for spring version
  public sendFile(file: File) {
    console.log(file);
    let formData: FormData = new FormData();
    formData.append("file[]", file, file.name);
    let headers = new Headers();
    //headers.append('Content-Type', undefined);
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', 'http://localhost:4200');
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this.sendPathBaseURL, formData, options).toPromise().then(this.extractData).catch(this.handleError);
  }

  //This is for node version
  //@Deprecated. using Dropzone api call instead
  public sendNodeFile(jsonData: any) {
    let formData: FormData = new FormData();
    formData.append("file[]", JSON.stringify(jsonData));
    let jsonObj = { data: jsonData };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    //headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this.sendPathBaseURL, jsonData).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getAllDocs() {
    return this._http.get(this.getAllDocsURL).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getDocsCount() {
    return this._http.get(this.countURL).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getDoc(id) {
    let url = this.getDocURL + "/" + id;
    return this._http.get(url).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getAllIds() {
    return this._http.get(this.idsURL).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getOptions() {
    return this._http.get(this.optionsURL).toPromise().then(this.extractData).catch(this.handleError);
  }

  public search(name:string, version:string) {
    var url = this.searchURL + '/' + name + '/' + version;
    return this._http.get(url).toPromise().then(this.extractData).catch(this.handleError);
  }

  public getConditionTypes() {
    return this._http.get(this.conditionTypesURL).toPromise().then(this.extractData).catch(this.handleError);
  }

  public saveEdits(data: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this.saveEditsURL, data, options).toPromise().then(this.extractData).catch(this.handleError);
  }

  public extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  public handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

}
