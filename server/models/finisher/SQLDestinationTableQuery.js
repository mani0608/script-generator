var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class SQLDestinationTableQuery {

    constructor() {
        this.queryIndex = null;
        this.destinationTable = null;
        this.destinationTableQuery = null;
        this.isRelationship = false;
    }

    setQueryIndex(index) {
        this.queryIndex = index;
    }

    getQueryIndex() {
        return this.queryIndex;
    }

    setDestinationTable(table) {
        this.destinationTable = table;
    }

    getDestinationTable() {
        return this.destinationTable;
    }

    setDestinationTableQuery(query) {
        this.destinationTableQuery = query;
    }

    getDestinationTableQuery() {
        return this.destinationTableQuery;
    }

    getIsRelationship() {  
        return this.isRelationship;
    }

    setIsRelationship(flag) {
        this.isRelationship = flag;
    }

}

module.exports = SQLDestinationTableQuery;