var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class CaseWhen {
    
    constructor() {
        this.caseValue = null;
        this.elseValue = null;
        this.conditions = new Array();
    }

    setCaseValue(value) { this.caseValue = value; }

    getCaseValue() { return this.caseValue; }

    setElseValue(value) { this.elseValue = value; }

    getElseValue() { return this.elseValue }

    setConditions(conditions) { this.conditions = conditions; }

    getConditions() { return this.conditions; }
}

module.exports = CaseWhen;