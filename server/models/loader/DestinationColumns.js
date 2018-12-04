var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class DestinationColumns {

    constructor() {
        this.columns = new Array();
    }

    setColumns(columns) {
        this.columns = columns;
    }

    getColumns() {
        return this.columns;
    }

    getColumnsCount() {
        return this.columns.length;
    }

    addColumn(column) {
        this.columns.push(column);
    }

    getColumn(index) {
        return this.columns.get(index);
    }

}

module.exports = DestinationColumns;