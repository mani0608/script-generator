var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var _ = require("lodash");

class SourceTable {
    constructor() {
        this.name = null;
        this.nameComp = null;
        this.indexes = new Array();
        this.destTableIndexes = new Array();
    }

    setName(name) {
        this.name = name;
        this.nameComp = _.trim(_.toLower(name));
    }

    getName() {
        return this.name;
    }

    getNameComp() {
        return this.nameComp;
    }

    setIndexes(indexes) {
        this.indexes = indexes;
    }

    getIndexes() {
        return this.indexes;
    }

    setDestTableIndexes(dtIndexes) {
        this.destTableIndexes = dtIndexes;
    }

    getDestTableIndexes() {
        return this.destTableIndexes;
    }

    addIndex(index) {
        this.indexes.push(index);
    }

    addDestTableIndex(index) {
        this.destTableIndexes.push(index);
    }

    getSortedDestTableIndexes() {
        return _.orderBy(this.destTableIndexes, 'name', 'asc');
    }
}

module.exports = SourceTable;