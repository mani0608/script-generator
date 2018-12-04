var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class LenCondition {
       
    constructor() {
        this.condValue = null;
        this.condOperand = null;
        this.condOperator = null;
    }

    setCondValue(value) { this.condValue = value; }

    getCondValue() { return this.condValue; }

    setCondOperand(operand) { this.condOperand = operand; }

    getCondOperand() { return this.condOperand; }

    setCondOperator(operator) { this.condOperator = operator; }

    getCondOperator() { return this.condOperator; }
 
}

module.exports = LenCondition;