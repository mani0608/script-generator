var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class Join {

    constructor() {
        this.tableName = null;
        this.tableAlias = null;
        this.joinConditions = new Array();
        this.joinType = null;
    }

    setTableName(name) {  this.tableName = name; }

    getTableName() {  return this.tableName; }

    setTableAlias(alias) {  this.tableAlias = alias; }

    getTableAlias() {  return this.tableAlias; }

    setJoinConditions(conditions) {  this.joinConditions = conditions; }

    getJoinConditions() { return this.joinConditions; }

    setJoinType(type) { this.joinType = type; }

    getJoinType() { return this.joinType; }

}

module.exports = Join;