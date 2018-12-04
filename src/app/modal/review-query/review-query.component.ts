import { Component, 
  OnInit, 
  Input, 
  ViewChild, 
  Output, EventEmitter } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import * as hljs from 'highlightjs';
import * as _ from 'lodash';

import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component';
import { Quill } from 'quill';

@Component({
  selector: 'app-review-query',
  templateUrl: './review-query.component.html',
  styleUrls: ['./review-query.component.css']
})
export class ReviewQueryComponent implements OnInit {

  @ViewChild('editor') editor: QuillEditorComponent;

  //Close without save
  @Output() onCancel = new EventEmitter<any>();

  //Save & Close
  @Output() onSave = new EventEmitter<any>();

  @Input() public list: Array<any>;

  @Input() public title: string;

  public quill: any;

  public display: boolean;

  public editorText: string;

  public editedText: string;

  public editIndex: number;

  public isEditor: boolean;

  public isEditorInit: boolean;

  public modules = {};

  public formats: Array<string>;

  constructor() {
  }

  ngOnInit() {
    this.display = false;
    this.isEditor = false;
    this.isEditorInit = false;

    this.formats = [];

    this.initQuillModules();

    hljs.configure({   // optionally configure hljs
      languages: ['javascript', 'ruby', 'python', 'sql']
    });
  }

  initQuillModules() {
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

  show(data: any) {
    this.list = data.list;
    this.title = data.title;
    this.display = true;
  }

  onEditorCreated(event) {
    this.quill = event;
  }

  onContentChanged(event) {
    if (!this.isEditorInit) {
      let size = _.size(this.editor.quillEditor.getText());
      this.editor.quillEditor.formatLine(0, size, { 'code-block': true });
      this.isEditorInit = true;
    }
    //this.cdr.detectChanges();
    this.editedText = event.text;
  }

  convertNLToParagraph(text) {
    let temp = '<p>' + text + '</p>';
    temp = _.replace(temp, /\r\n\r\n/g, "</p><p>")
    temp = _.replace(temp, /\n\n/g, "</p><p>");
    temp = _.replace(temp, /\r\n/g, "</p><p>")
    return _.replace(temp, /\n/g, "</p><p>");
  }

  showEditor(index) {
    this.editIndex = index;
    this.editorText = this.convertNLToParagraph(this.list[index].destinationTableQuery);
    this.isEditor = true;
    //this.editorSubject.next(true);
  }

  doneEditing() {
    this.list[this.editIndex].destinationTableQuery = this.editedText;
    this.resetEditor();
  }

  resetEditor() {
    this.isEditorInit = false;
    this.editorText = null;
    this.editIndex = null;
    this.isEditor = false;
    this.editedText = null;
  }

  saveAndClose() {
    
    let savedData = {
      list: this.list,
      index: this.editIndex,
      editedText: this.editedText,
      status: 'Saved'
    }

    this.resetEditor();
    this.display = false;
    
    this.onSave.emit(savedData);
  }

  closePopup() {
    this.resetEditor();
    this.display = false;

    let editedData = {
      status: 'Cancelled'
    }

    this.onCancel.emit(editedData);
  }

}


