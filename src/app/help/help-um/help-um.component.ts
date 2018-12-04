import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-um',
  templateUrl: './help-um.component.html',
  styleUrls: ['./help-um.component.scss']
})
export class HelpUmComponent implements OnInit {

  @Input('themeType') themeType: string;

  constructor() { }

  ngOnInit() {
  }

}
