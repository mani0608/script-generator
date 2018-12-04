import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-qb',
  templateUrl: './help-qb.component.html',
  styleUrls: ['./help-qb.component.scss']
})
export class HelpQbComponent implements OnInit {

  @Input('themeType') themeType: string;

  constructor() { }

  ngOnInit() {
  }

}
