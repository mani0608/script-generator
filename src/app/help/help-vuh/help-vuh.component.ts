import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-vuh',
  templateUrl: './help-vuh.component.html',
  styleUrls: ['./help-vuh.component.scss']
})
export class HelpVuhComponent implements OnInit {

  @Input('themeType') themeType: string;

  constructor() { }

  ngOnInit() {
  }

}
