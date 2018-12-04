import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FileNode } from '../common/types/file-node';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  nodeData: Array<FileNode> = [];

  get data(): Array<FileNode> { return this.data; }

  constructor() {}

  createTree(data: any): Array<FileNode> {

    // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
    //     file node as children.
    this.nodeData = this.buildFileTree(data, 0);
    return this.nodeData;
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  buildFileTree(obj: {[key: string]: any}, level: number): Array<FileNode> {
    return Object.keys(obj).reduce<Array<FileNode>>((accumulator, key) => {
      const value = obj[key];
      const node = new FileNode();
      node.fileName = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.type = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}
