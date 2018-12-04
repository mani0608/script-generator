import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-help-ie',
  templateUrl: './help-ie.component.html',
  styleUrls: ['./help-ie.component.scss']
})
export class HelpIeComponent implements OnInit {

  @Input('themeType') themeType: string;

  constructor() { }

  ngOnInit() {
  }

}
