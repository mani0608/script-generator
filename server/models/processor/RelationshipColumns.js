var _ = require("lodash");
var Array = require('collections/shim-array');

class RelationshipColumns {
  constructor() {
    this.relSourceColumns = new Array();
    this.relDestColumns = new Array();
  }

  setRelSourceColumns(columns) { this.relSourceColumns = columns; }

  getRelSourceColumns() { return this.relSourceColumns; }

  setRelDestColumns(columns) { this.relDestColumns = columns; }

  getRelDestColumns() { return this.relDestColumns; }

  addSourceColumn(srcColumn) {
    this.relSourceColumns.push(srcColumn);
  }

  addDestColumn(tgtColumn) {
    this.relDestColumns.push(tgtColumn);
  }
}

module.exports = RelationshipColumns;