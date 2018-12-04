class ConcatField {
    constructor() {
        this.fieldName = null;
        this.concatValue = null;
        this.isNewLineRequired = false;
    }

    setFieldName(name) {
        this.fieldName = name;
    }

    getFieldName() {
        return this.fieldName;
    }

    setConcatValue(value) {
        this.concatValue = value;
    }

    getConcatValue() {
        return this.concatValue;
    }

    setIsNewLineRequired(flag) {
        this.isNewLineRequired = flag;
    }

    getIsNewLineRequired() {
        return this.isNewLineRequired;
    }
}

module.exports = ConcatField;