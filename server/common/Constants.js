var Map = require("collections/map");
const PHCT = new Map();
var _ = require('lodash');

class Constants {

    static get START() { return 'START'; }
    static get END() { return 'END'; }
    static get NA() { return 'NA'; }
    static get SPACE() { return ' '; }
    static get COMMA() { return ','; }
    static get PERIOD() { return '.'; }
    static get EMPTY() { return ''; }
    static get PLUS() { return '+'; }
    static get PERCENT() { return '%'; }
    static get SEMI_COLON() { return ';'; }
    static get UNDERSCORE() { return '_'; }
    static get HYPHEN() { return '-'; }
    static get COLON() { return ':'; }
    static get SBRACKET() { return '['; }
    static get EBRACKET() { return ']'; }
    static get GREATER_SYM() { return '>'; }
    static get LESSER_SYM() { return '<'; }
    static get OPEN_FLWR_BRACKET() { return '{'; }
    static get CLOSE_FLWR_BRACKET() { return '}'; }
    static get OPEN_PARAN() { return '('; }
    static get CLOSE_PARAN() { return ')'; }
    static get DEST_VAL_PH() { return '_VALUE'; }
    static get NEWLINE_PH() { return '_NL'; }
    static get NEWLINE_CHAR() { return '\n'; }
    static get IMPORT_PH() { return 'import'; }

    static get KEY_PH() { return '_KEY:'; }

    static get DBL_QUOTE() { return "\""; }
    static get SINGLE_QUOTE() { return '\''; }
    static get CT_IN() { return ' IN '; }
    static get ALIAS_KW() { return 'AS'; }
    static get CT_NOT_IN() { return ' NOT IN '; }
    static get CT_LIKE() { return ' LIKE '; }
    static get CT_NOT_LIKE() { return ' NOT LIKE '; }
    static get CT_EQ() { return ' = '; }
    static get CT_NOT_EQ() { return ' <> '; }
    static get CT_NULL() { return ' IS NULL '; }
    static get CT_NOT_NULL() { return ' IS NOT NULL '; }
    static get VALUE_NULL() { return ' NULL '; }
    static get CT_CHARIDX() { return 'CHARINDEX '; }
    static get CT_PATIDX() { return 'PATINDEX '; }
    static get SRC_REL_ALIAS_PFX() { return 'SRC'; }
    static get TGT_REL_ALIAS_PFX() { return 'TGT'; }
    static get COMP_PFX() { return 'Comp'; }
    static get CROSS_APPLY_PREFIX() {  return 'CROSS APPLY ( VALUES '; }
    static get CROSS_APPLY_ALIAS() { return 'CA '; }
    static get NL_CHAR_PH() { return '@newlinechar'; }
    static get BOOL_TRUE_STR() { return "true"; }
    static get BOOL_FALSE_STR() { return "false"; }

    static get CONTAINS_PH() { return " CONTAINS "; }
    static get IS_ALPHA_PH() { return " ISALPHA "; }
    static get IS_NUMERIC_PH() { return " ISNUMERIC "; }
    static get IS_AN_PH() { return " ISALPHANUMERIC "; }
    static get LEN_COND_PH() { return " LEN " }
    static get DATEDIFF_PH() { return "DATEDIFF " }
    static get WHERE_CLAUSE_AND() { return "AND"; }
    static get WHERE_CLAUSE_OR() { return "OR"; }
    static get JOIN_TYPE_INNER() { return "INNER JOIN"; }
    static get JOIN_TYPE_LO() { return "LEFT OUTER JOIN"; }
    static get JOIN_TYPE_RO() { return "RIGHT OUTER JOIN"; }

    static get COND_AND_PH() { return " : " }
    static get COND_OR_PH() { return " :: " }
    static get CW_ASSIGN_OPTR() { return ' ?= '; }
    static get CW_ELSE_VALUE_OPTR() { return ' := '; }

    static get SRC_COND_PH() { return 's$:'; }

    static get TGT_COND_PH() { return 't$:'; }

    static get VT_ALPHA_NUMERIC() { return "%[^a-Z,0-9,'' '']%" }
    static get VT_ALPHA() { return "%[^a-Z,'' '']%" }
    static get VT_NUMERIC() { return "'%[^0-9]%'" }

    static get NR_COND_TYPES() {
        return [this.COND_AND_PH, this.COND_OR_PH];
    }
    
    static get COPERANDS() {
        return [this.CT_NOT_EQ, this.CT_EQ, this.CT_NOT_IN, this.CT_IN,
        this.CT_NOT_NULL, this.CT_NULL, this.CT_NOT_LIKE, this.CT_LIKE,
        this.CT_CHARIDX, this.CT_PATIDX, this.LEN_COND_PH];
    }

    static get JCOPERANDS() {
        return [this.CT_NOT_EQ, this.CT_EQ];
    }

    static get ICOPERATORS() {
        return [this.CT_NOT_EQ, this.CT_EQ, this.GREATER_SYM, this.LESSER_SYM];
    }

    static ICTYPES() {
        return [this.CT_CHARIDX, this.CT_PATIDX];
    }

    static get CTYPES() {
        return [this.WHERE_CLAUSE_AND, this.WHERE_CLAUSE_OR];
    }

    static get JTYPES() {
        return [this.JOIN_TYPE_INNER, this.JOIN_TYPE_LO, this.JOIN_TYPE_RO];
    }

    static get VALTYPES() {
        return [this.VT_ALPHA, this.VT_NUMERIC, this.VT_ALPHA_NUMERIC];
    }

    static get VALOPERANDS() {
        return [this.CONTAINS_PH, this.IS_ALPHA_PH, this.IS_NUMERIC_PH, this.IS_AN_PH, this.DATEDIFF_PH];
    }

    static get MULTIVALUES() { return [this.CT_IN, this.CT_NOT_IN]; }
    static get LIKES() { return [this.CT_LIKE, this.CT_NOT_LIKE]; }

    static getClauseForType(type) {

        if (type === this.COND_AND_PH) return this.WHERE_CLAUSE_AND;

        if (type === this.COND_OR_PH) return this.WHERE_CLAUSE_OR;

        return null;

    }


    static convertBoolStrToBit(boolStr) {

        boolStr = _.toLower(boolStr);

        switch(boolStr) {

            case this.BOOL_TRUE_STR: 
                return 1;

            case this.BOOL_FALSE_STR: 
                return 0;

            default: 
                return boolStr;

        }

    }

    static getElseCondition(conditionType) {

        switch (conditionType) {

            case this.CT_IN:
                return this.CT_NOT_IN;
            case this.CT_NOT_IN:
                return this.CT_IN;
            case this.CT_LIKE:
                return this.CT_NOT_LIKE;
            case this.CT_NOT_LIKE:
                return this.CT_LIKE;
            case this.CT_EQ:
                return this.CT_NOT_EQ;
            case this.CT_NOT_EQ:
                return this.CT_EQ;
            case this.CT_NULL:
                return this.CT_NOT_NULL;
            case this.CT_NOT_NULL:
                return this.CT_NULL;
            default:
                return null;

        }

    }

}

module.exports = Object.freeze(Constants);