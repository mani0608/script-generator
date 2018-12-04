var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class SQLQuery {

    constructor() {
        this.sqlSourceTableQueries = [];
    }

    setQueries(queries) {
        this.sqlSourceTableQueries = queries;
    }

    getQueries() {
        return this.sqlSourceTableQueries;
    }

    addQuery(query) {
        this.sqlSourceTableQueries.push(query);
    }

}

module.exports = SQLQuery;