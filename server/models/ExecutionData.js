var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var SQLQuery = require('./finisher/SQLQuery');
var _ = require('lodash');

class ExecutionData {

    constructor() {
        this.mappings = null;
        this.mappingFilePath = null;
        this.queryIndex = null;
        this.importQueryIndex = null;
        this.importQueryInstanceIndex = null;
        this.importFieldIndex = null;
        this.queries = new Array();
        this.sqlQuery = new SQLQuery();
    }

    getMappings() {
        return this.mappings;
    }

    setMappings(mappings) {
        this.mappings = mappings;
    }

    getMappingFilePath() {
        return this.mappingFilePath;
    }

    setMappingFilePath(path) {
        this.mappingFilePath = path;
    }

    getQueryIndex() {
        if(this.queryIndex || this.queryIndex == 0)
            return this.queryIndex;
        else 
            return -1;
    }

    getImportQueryIndex() {
        if(this.importQueryIndex || this.importQueryIndex == 0)
            return this.importQueryIndex;
        else 
            return -1;
    }

    getImportQueryInstanceIndex() {
        if(this.importQueryInstanceIndex || this.importQueryInstanceIndex == 0)
            return this.importQueryInstanceIndex;
        else 
            return -1;
    }

    getImportFieldIndex() {
        if (this.importFieldIndex || this.importFieldIndex == 0)
            return this.importFieldIndex;
        else 
            return -1;
    }

    setImportFieldIndex(index) {
        this.importFieldIndex = index;
    }

    getQueries() {
        return this.queries;
    }

    setQueries(queries) {
        this.queries = queries;
    }

    getSqlQuery() {
        return this.sqlQuery;
    }

    setSqlQuery(query) {
        this.sqlQuery = query;
    }

    increamentQI() {
        this.queryIndex = _.size(this.queries) - 1;
    }

    increamentIQI() {
        this.importQueryIndex = _.size(this.getQueries().get(this.getQueryIndex()).getImportTables()) - 1;
    }

    increamentIQII() {
        this.importQueryInstanceIndex =_.size(this.getQueries().get(this.getQueryIndex()).getImportTables()
        .get(this.getImportQueryIndex()).getITQInstances()) - 1;
    }

    increamentIFI() {
        this.importFieldIndex = _.size(this.getQueries().get(this.getQueryIndex()).getImportTables()
        .get(this.getImportQueryIndex()).getITQInstances().get(this.getImportQueryInstanceIndex()).getInsertFields()) - 1;
    }

}

module.exports = ExecutionData;