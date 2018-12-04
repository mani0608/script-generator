var squel = require("squel").useFlavour("mssql");

class CrossApplyBlock extends squel.cls.Block {

    constructor(options) {
        super(options);
        this._query = '';
    }

    crossApply(str) {
        this._query = str;
    }

    _buildString() {
        return {
            text: this._query,
            values: []
        };
    }

    _toParamString(options) {
        return {
            text: this._query,
            values: []
        };
    }   

}

module.exports = CrossApplyBlock;