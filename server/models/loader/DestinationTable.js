var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var _ = require('lodash');

class DestinationTable {
    constructor() {
        this.name = null;
        this.nameComp = null;
        this.indexes = new Array();
        //{"mappingRank": 1,"propRanks": [1.11,1.12] }
        this.rank = null;
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

    addIndex(index) {
        this.indexes.push(index);
    }

    setRank(rank) {
        this.rank = rank;
    }

    getRank() {
        return this.rank;
    }
}

module.exports = DestinationTable;