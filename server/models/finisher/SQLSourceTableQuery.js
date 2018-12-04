var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class SQLSourceTableQuery {

    constructor() {
        this.queryIndex = null;
        this.sourceTableName = null;
        this.importQueries = new Array();
    }

    setQueryIndex(index) {
        this.queryIndex = index;
    }

    getQueryIndex() {
        return this.queryIndex;
    }

    setSourceTableName(tableName) {
        this.sourceTableName = tableName;
    }

    getSourceTableName() {
        return this.sourceTableName;
    }

    setQueries(queries) {
        this.importQueries = queries;
    }

    getQueries() {
        return this.importQueries;
    }

    addQuery(query) {
        this.importQueries.push(query);
    }

}

module.exports = SQLSourceTableQuery;