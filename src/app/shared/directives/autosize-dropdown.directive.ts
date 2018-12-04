import { Directive, ElementRef, Renderer, AfterViewInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Directive({
  selector: '[autosizeDropdown]'
})
export class AutosizeDropdownDirective implements AfterViewInit {

  @Input() items: Array<any>;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(private ele: ElementRef,
    private renderer: Renderer) { }

  ngAfterViewInit() {
    let offsetWidth = this.calculateWidth();
    this.renderer.setElementStyle(this.ele.nativeElement, 'width', offsetWidth + 50 + 'px');
  }

  calculateWidth(): number {

    let sizes: Array<number> = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = "1rem Segoe UI";

    _.forEach(this.items, (item, idx, items) => {
      sizes.push(this.ctx.measureText(item.label).width);
    });

    return _.max(sizes);

  }

}
