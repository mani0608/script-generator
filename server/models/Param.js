var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class Param {

    constructor() {
        this.sourceColumn = null;
        this.importColumn = null;
        this.columnAlias = null;
        this.columnPrefix = null;
        this.concatValue = null;
        this.isNLReq = false;
        this.tableName = null;
        this.tableAlias = null;
        this.concatField = null;
        this.inConditionValues = new Array();
        this.conditionValue = null;
        this.conditionType = null;
        this.isFieldRef = false;
        this.isJoinCondition = false;
        this.isCaseCondition = false;
        this.whereConditionType = null;
        this.joinType = null;
        this.isMultipleWhen = false;
        this.caseValue = null;
        this.elseValue = null;
        this.idxConditionOperator = null;
        this.idxConditionOperand = null;
        this.lenConditionOperator = null;
        this.lenConditionOperand = null;
    }

    setSourceColumn(column) { this.sourceColumn = column; }

    getSourceColumn() { return this.sourceColumn; }

    setImportColumn(column) { this.importColumn = column; }

    getImportColumn() { return this.importColumn; }

    setColumnAlias(alias) { this.columnAlias = alias; }

    getColumnAlias() { return this.columnAlias; }

    setColumnPrefix(prefix) { this.columnPrefix = prefix; }

    getColumnPrefix() { return this.columnPrefix; }

    setConcatValue(value) { this.concatValue = value; }

    getConcatValue() { return this.concatValue; }

    setIsNLReq(flag) { this.isNLReq = flag; }

    getIsNLReq() { return this.isNLReq; }

    setTableName(name) { this.tableName = name; }

    getTableName() { return this.tableName; }

    setTableAlias(alias) { this.tableAlias = alias; }

    getTableAlias() { return this.tableAlias; }

    setConcatField(field) { this.concatField = field; }

    getConcatField() { return this.concatField; }

    setInConditionValues(values) { this.inConditionValues = values; }

    getInConditionValues() { return this.inConditionValues; }

    setConditionValue(value) { this.conditionValue = value; }

    getConditionValue() { return this.conditionValue; }

    setConditionType(type) { this.conditionType = type; }

    getConditionType() { return this.conditionType; }

    setIsFieldRef(ref) { this.isFieldRef = ref; }

    getIsFieldRef() { return this.isFieldRef; }

    setIsJoinCondition(flag) { this.isJoinCondition = flag; }

    getIsJoinCondition() { return this.isJoinCondition; }

    setIsCaseCondition(flag) { this.isCaseCondition = flag; }

    getIsCaseCondition() { return this.isCaseCondition; }

    setWhereConditionType(type) { this.whereConditionType = type; }

    getWhereConditionType() { return this.whereConditionType; }

    setJoinType(type) { this.joinType = type; }

    getJoinType() { return this.joinType; }

    setIsMultipleWhen(flag) { this.isMultipleWhen = flag; }

    getIsMultipleWhen() { return this.isMultipleWhen; }

    setCaseValue(value) { this.caseValue = value; }

    getCaseValue() { return this.caseValue; }

    setElseValue(value) { this.elseValue = value; }
    
    getElseValue() { return this.elseValue; }

    setIdxConditionOperand(operand) { this.idxConditionOperand = operand; }

    getIdxConditionOperand() { return this.idxConditionOperand; }

    setIdxConditionOperator(operator) { this.idxConditionOperator = operator; }

    getIdxConditionOperator() { return this.idxConditionOperator; }

    setLenConditionOperator(operator) { this.lenConditionOperator = operator; }

    getLenConditionOperator() { return this.lenConditionOperator; }

    setLenConditionOperand(operand) { this.lenConditionOperand = operand; }

    getLenConditionOperand() { return this.lenConditionOperand; }
}

module.exports = Param;