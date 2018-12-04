import { Component, OnInit, Input, ViewChild, Output, EventEmitter, Inject } from '@angular/core';
import * as hljs from 'highlightjs';
import * as _ from 'lodash';
import { QuillEditorComponent } from 'ngx-quill';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalData } from '@common/types/modal-data';

@Component({
  selector: 'app-review-query',
  templateUrl: './review-query.component.html',
  styleUrls: ['./review-query.component.scss']
})
export class ReviewQueryComponent implements OnInit {

  @ViewChild('editor') editor: QuillEditorComponent;

  @Input() public list: Array<any>;

  @Input() public title: string;

  public quill: any;

  public editorText: string;

  public editedText: string;

  public editIndex: number;

  public isEditor: boolean;

  public isEditorInit: boolean;

  public modules = {};

  public formats: Array<string>;

  constructor(public dialogRef: MatDialogRef<ReviewQueryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData) {
  }

  ngOnInit(): void {

    this.isEditor = false;
    this.isEditorInit = false;
    this.list = this.data.list;
    this.title = this.data.title;

    this.formats = [];

    this.initQuillModules();

    hljs.configure({   // optionally configure hljs
      languages: ['javascript', 'ruby', 'python', 'sql']
    });
  }

  initQuillModules(): void {
    this.modules = {
      formula: false,
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean'],                                         // remove formatting button

        ['link', 'image', 'video']                         // link and image, video
      ],
      syntax: {
        highlight: text => hljs.highlightAuto(text).value
      }
    }
  }

  onEditorCreated(event): void {
    this.quill = event;
  }

  onContentChanged(event): void {
    if (!this.isEditorInit) {
      let size = _.size(this.editor.quillEditor.getText());
      this.editor.quillEditor.formatLine(0, size, { 'code-block': true });
      this.isEditorInit = true;
    }
    //this.cdr.detectChanges();
    this.editedText = event.text;
  }

  convertNLToParagraph(text): string {
    let temp = '<p>' + text + '</p>';
    temp = _.replace(temp, /\r\n\r\n/g, "</p><p>")
    temp = _.replace(temp, /\n\n/g, "</p><p>");
    temp = _.replace(temp, /\r\n/g, "</p><p>")
    return _.replace(temp, /\n/g, "</p><p>");
  }

  showEditor(index): void {
    this.editIndex = index;
    this.editorText = this.convertNLToParagraph(this.list[index].destinationTableQuery);
    this.isEditor = true;
    //this.editorSubject.next(true);
  }

  doneEditing(): void {
    this.list[this.editIndex].destinationTableQuery = this.editedText;
    this.resetEditor();
  }

  resetEditor(): void {
    this.isEditorInit = false;
    this.editorText = null;
    this.editIndex = null;
    this.isEditor = false;
    this.editedText = null;
  }

  hideEditor(): void {
    this.resetEditor();
  }

  saveAndClose(): void {

    this.doneEditing();

    let savedData = {
      list: this.list,
      index: this.editIndex,
      editedText: this.editedText,
      status: 'Saved'
    }
    this.resetEditor();
    this.dialogRef.close(savedData);
  }

  closePopup(): void {
    this.resetEditor();

    let editedData = {
      list: [],
      status: 'Cancelled'
    }

    this.dialogRef.close(editedData);
  }
}