var _ = require('lodash');

class MappingProperties {
    
    constructor() {
        this.sourceColumn = null;
        this.destinationColumn = null;
        this.destValue = null;
        this.joinTable = null;
        this.conditions = null;
        this.isProcessed = false;
        this.relSrcTables = null; //Array
        this.relDestTables = null; //Array
        this.destTablesCount = 0;
        this.sourceTablesCount = 0;
        this.propertyRank = 0;
    }

    setRelSrcTables(tables) {
        this.relSrcTables = tables;
    }

    getRelSrcTables() {
        return this.relSrcTables;
    }

    setSourceTablesCount(count) {
        this.sourceTablesCount = count;
    }

    getSourceTablesCount() {
        return this.sourceTablesCount;
    }

    setRelDestTables(tables) {
        this.relDestTables = tables;
    }

    getRelDestTables() {
        this.relDestTables;
    }

    setDestTablesCount(count) {
        this.destTablesCount = count;
    }

    getDestTablesCount() {
        return this.destTablesCount;
    }

    setSourceColumn(column) {
        this.sourceColumn = column;
    }

    getSourceColumn() {
        return this.sourceColumn;
    }

    setDestinationColumn(column) {
        this.destinationColumn = column;
    }

    getDestinationColumn() {
        return this.destinationColumn;
    }

    setDestValue(value) {
        if (!_.isNull(value) && _.size(_.trim(value)) > 0) {
            this.destValue = _.toLower(_.toString(value));
        }
    }

    getDestValue() {
        return this.destValue;
    }

    setJoinTable(table) {
        this.joinTable = table;
    }

    getJoinTable() {
        return this.joinTable;
    }

    setConditions(conditions) {
        this.conditions = conditions;
    }

    getConditions() {
        return this.conditions;
    }

    setIsProcessed(flag) {
        this.isProcessed = flag;
    }

    getIsProcessed() {
        return this.isProcessed;
    }

    setPropertyRank(rank) {
        this.propertyRank = rank;
    }

    getPropertyRank() {
        return this.propertyRank;
    }

    //Applicable only for non-relational mapping
    getDestColumn() {
        return this.destinationColumn.getColumn(0);
    }
}

module.exports = MappingProperties;