import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';
import { Message, Messages } from '@common/types/messages';
import * as _ from 'lodash';

@Component({
  selector: 'app-message-handler',
  templateUrl: './message-handler.component.html',
  styleUrls: ['./message-handler.component.scss']
})
export class MessageHandlerComponent implements OnInit {

  public warnMessages: Message;
  public errorMessages: Message;
  public infoMessages: Message;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public messages: Array<Message>, 
            public snackbarRef: MatSnackBarRef<MessageHandlerComponent>) { }

  ngOnInit() {
    this.segregateMessages();
  }

  segregateMessages(): void {
    this.errorMessages = _.filter(this.messages, (msg) => msg.severity === "error")[0];
    this.warnMessages = _.filter(this.messages, (msg) => msg.severity === "warn")[0];
    this.infoMessages = _.filter(this.messages, (msg) => msg.severity === "info")[0];
  }

  close() {
    this.snackbarRef.dismiss();
  }

}
