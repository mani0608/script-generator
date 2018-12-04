var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class QueryField {
    constructor() {
        this.importFieldName = null;
        this.sourceFieldName = null;
        this.sourceAliasName = null;
        this.pkPrefix = null;
        this.concatValue = null;
        this.caseValue = null;
        this.elseValue = null;
        this.concatCandidates = new Array();
        this.caseWhenCandidates = new Array();
        this.isNewLineRequired = false;
        this.isProcessed = false;
        this.fieldIndex = null;
    }

    setImportFieldName(name) { this.importFieldName = name; }

    getImportFieldName() { return this.importFieldName; }

    setSourceFieldName(name) { this.sourceFieldName = name; }

    getSourceFieldName() { return this.sourceFieldName; }

    setSourceAliasName(name) { this.sourceAliasName = name; }

    getSourceAliasName() { return this.sourceAliasName; }

    setPkPrefix(prefix) { this.pkPrefix = prefix; }

    getPkPrefix() { return this.pkPrefix; }

    setConcatValue(value) { this.concatValue = value; }

    getConcatValue() { return this.concatValue; }

    setConcatCandidates(candidates) { this.concatCandidates = candidates; }

    getConcatCandidates() { return this.concatCandidates; }

    setCaseWhenCandidates(candidates) { this.caseWhenCandidates = candidates; }

    getCaseWhenCandidates() { return this.caseWhenCandidates; }

    setIsNewLineRequired(flag) { this.isNewLineRequired = flag; }

    getIsNewLineRequired() { return this.isNewLineRequired; }

    setIsProcessed(flag) { this.isProcessed = flag; }

    getIsProcessed() { return this.isProcessed; }

    setFieldIndex(index) { this.fieldIndex = index; }

    getFieldIndex() { return this.fieldIndex; }

    setCaseValue(value) { return this.caseValue = value; }

    getCaseValue() { return this.caseValue; }

    setElseValue(value) { return this.elseValue = value; }

    getElseValue() { return this.elseValue; }

}

module.exports = QueryField;