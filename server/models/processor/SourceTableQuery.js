var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class SourceTableQuery {
    constructor() {
        this.sourceTable = null;
        this.sourceTableAlias = null;
        this.importTables = new Array();
    }

    setSourceTable(table) { this.sourceTable = table; }

    getSourceTable() { return this.sourceTable; }

    setSourceTableAlias(alias) { this.sourceTableAlias = alias; }

    getSourceTableAlias() { return this.sourceTableAlias; }

    setImportTables(tables) { this.importTables = tables; }

    getImportTables() { return this.importTables; }
}

module.exports = SourceTableQuery;