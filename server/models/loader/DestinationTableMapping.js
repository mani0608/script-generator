var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var _ = require('lodash');

class DestinationTableMapping {

    constructor() {
        this.destinationTable = null;
        this.mappingProperties = new Array();
        this.mappingCount = 0;
        this.mappingRank = 0;
    }

    setMappingRank(rank) {
        this.mappingRank = rank;
    }

    getMappingRank() {
        return this.mappingRank;
    }

    setDestinationTable(table) {
        this.destinationTable = table;
    }

    getDestinationTable() {
        return this.destinationTable;
    }

    setMappingProperties(properties) {
        this.mappingProperties = properties;
    }

    getMappingProperties() {
        return this.mappingProperties;
    }

    setMappingCount(count) {
        this.mappingCount = count;
    }

    getMappingCount() {
        return this.mappingCount;
    }

}

module.exports = DestinationTableMapping;