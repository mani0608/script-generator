var _ = require("lodash");
var Array = require('collections/shim-array');
var ServerUtils = require('../../utils/ServerUtils');
var Constants = require('../../common/Constants');

class RelationshipColumn {
    constructor() {
        this.columnName = null;
        this.formattedColumnName = null;
        this.conditions = null;
    }

    setColumnName(name) { this.columnName = name; }

    getColumnName() { return this.columnName; }

    setFormattedColumnName(name) { this.formattedColumnName = name; }

    getFormattedColumnName() { return this.formattedColumnName; } 

    setConditions(conds) { this.conditions = conds }

    getConditions() { return this.conditions; }

    hasRelConditions() {
        return (this.conditions != null && _.size(this.conditions) > 0);
    }

    getConditionArray() {
        return ServerUtils.getValueAsArray(this.conditions, Constants.SEMI_COLON);
    }

}

module.exports = RelationshipColumn;