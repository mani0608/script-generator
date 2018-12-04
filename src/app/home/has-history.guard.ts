import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '@services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class HasHistoryGuard implements CanActivate {

  constructor(private _service: SharedService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let count = this._service.historyCountValue;
      return (count > 0) ? true : false;
  }
}
