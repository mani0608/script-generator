import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-es',
  templateUrl: './help-es.component.html',
  styleUrls: ['./help-es.component.scss']
})
export class HelpEsComponent implements OnInit {

  @Input('themeType') themeType: string;

  constructor() { }

  ngOnInit() {
  }

}
