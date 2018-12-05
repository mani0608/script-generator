var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class ITQInstance {
    constructor() {
        this.insertFields = new Array(); //query fields
        this.whereConditions = new Array(); //condition
        this.tableJoins = new Array(); //Join
        this.groupByFields = new Array(); 
        this.havingConditions = new Array(); //condition
        this.isRelationship = false;
    }

    setInsertFields(fields) { this.insertFields = fields; }

    getInsertFields() { return this.insertFields; }

    setWhereConditions(conditions) { this.whereConditions = conditions; }

    getWhereConditions() { return this.whereConditions; }

    setTableJoins(joins) { this.tableJoins = joins; }

    getTableJoins() { return this.tableJoins; }

    setGroupByFields(fields) { this.groupByFields = fields; }

    getGroupByFields() { return this.groupByFields; }

    setHavingConditions(conditions) { this.havingConditions = conditions; }

    getHavingConditions() { return this.havingConditions; }

    setIsRelationship(flag) { this.isRelationship = flag; }

    getIsRelationship() { return this.isRelationship; }

}

module.exports = ITQInstance;