var ExecutionData = require('../models/ExecutionData');
var SourceTableQuery = require('../models/processor/SourceTableQuery');
var ImportTableQuery = require('../models/processor/ImportTableQuery');
var ITQInstance = require('../models/processor/ITQInstance');
var QueryField = require('../models/processor/QueryField');
var ConcatField = require('../models/processor/ConcatField');
var Param = require('../models/Param');
var Constants = require('../common/Constants');
var Condition = require('../models/processor/Condition');
var IdxCondition = require('../models/processor/IdxCondition');
var LenCondition = require('../models/processor/LenCondition');
var Join = require('../models/processor/Join');
var CaseWhen = require('../models/processor/CaseWhen');
var ProcessorUtil = require('../utils/ProcessorUtil');
var StringUtils = require('../utils/StringUtils');

class QueryService {

    constructor() {
        this.executionData = null;
    }

    setExecutionData(executionData) {
        this.executionData = executionData;
    }

    initializeQuery(stName, stAlias) {
        let stQuery = new SourceTableQuery();
        stQuery.setSourceTable(stName);
        stQuery.setSourceTableAlias(stAlias);
        this.executionData.getQueries().push(stQuery);
        this.executionData.increamentQI();
    }

    initializeImportQuery(itName) {
        let itQuery = new ImportTableQuery();
        itQuery.setImportTableName(itName);
        this.getSTQ().getImportTables().push(itQuery);
        this.executionData.increamentIQI();
    }

    updateRelationshipFlag(flag) {
        this.getITQInstance().setIsRelationship(flag);
    }

    addImportQueryInstance() {
        let itqInstance = new ITQInstance();
        this.getITQ().addITQInstance(itqInstance);
        this.executionData.increamentIQII();
    }

    createPrefixedSelectField(param) {
        let qField = new QueryField();
        qField.setSourceAliasName(param.getColumnAlias());
        qField.setSourceFieldName(param.getSourceColumn());
        qField.setPkPrefix(ProcessorUtil.getFormattedConcatValue(param.getColumnPrefix()));
        qField.setImportFieldName(param.getImportColumn());
        // let matchedIndex = ProcessorUtil.isDuplicateQueryField(this.getITQ().getInsertFields(), qField);
        // if (matchedIndex > 0) {
        //     this.executionData.setImportFieldIndex(matchedIndex);
        // } else {
        //     this.getITQ().getInsertFields().push(qField);
        //     this.executionData.increamentIFI();
        // }
        qField.setFieldIndex(this.executionData.getImportFieldIndex() + 1);
        this.getITQInstance().getInsertFields().push(qField);
        this.executionData.increamentIFI();
    }

    createSelectField(param) {
        let qField = new QueryField();
        qField.setSourceAliasName(param.getColumnAlias());
        qField.setConcatValue(ProcessorUtil.getFormattedConcatValue(param.getConcatValue()));
        qField.setSourceFieldName(param.getSourceColumn());
        qField.setImportFieldName(param.getImportColumn());
        qField.setIsNewLineRequired(param.getIsNLReq());
        // let matchedIndex = ProcessorUtil.isDuplicateQueryField(this.getITQ().getInsertFields(), qField);
        // if (matchedIndex > 0) {
        //     this.executionData.setImportFieldIndex(matchedIndex);
        // } else {
        //     this.getITQ().getInsertFields().push(qField);
        //     this.executionData.increamentIFI();
        // }
        qField.setFieldIndex(this.executionData.getImportFieldIndex() + 1);
        this.getITQInstance().getInsertFields().push(qField);
        this.executionData.increamentIFI();
    }

    createConcatField(concatFieldName, concatValue, isNLReq) {
        let concatField = new ConcatField();
        concatField.setFieldName(concatFieldName);
        concatField.setConcatValue(ProcessorUtil.getFormattedConcatValue(concatValue));
        concatField.setIsNewLineRequired(isNLReq);
        this.getQF().getConcatCandidates().push(concatField);
    }

    addInConditions(param) {

        let condition = null;

        if (param.getConditionType() === Constants.CT_IN) {
            condition = new Condition();
            condition.setInCondition(param.getInConditionValues());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        } else if (param.getConditionType() === Constants.CT_NOT_IN) {
            condition = new Condition();
            condition.setNotInCondition(param.getInConditionValues());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        }

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {

            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }

        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }
    }

    addLikeCondition(param) {

        let condition = null;

        if (param.getConditionType() === Constants.CT_LIKE) {
            condition = new Condition();
            condition.setLikeCondition(param.getConditionValue());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        } else if (param.getConditionType() === Constants.CT_NOT_LIKE) {
            condition = new Condition();
            condition.setNotLikeCondition(param.getConditionValue());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        }

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    addEqualsCondition(param) {

        let condition = null;

        if (param.getConditionType() === Constants.CT_EQ) {
            condition = new Condition();
            condition.setEqCondition(param.getConditionValue());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        } else if (param.getConditionType() === Constants.CT_NOT_EQ) {
            condition = new Condition();
            condition.setNeqCondition(param.getConditionValue());
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        }

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    addNullCondition(param) {

        let condition = null;

        if (param.getConditionType() === Constants.CT_NULL) {
            condition = new Condition();
            condition.setIsNullCondition(true);
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        } else if (param.getConditionType() === Constants.CT_NOT_NULL) {
            condition = new Condition();
            condition.setIsNotNullCondition(true);
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        }

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    addIndexCondition(param) {

        let condition = null;
        let idxCondition = null;

        if (param.getConditionType() === Constants.CT_CHARIDX) {
            condition = new Condition();

            idxCondition = new IdxCondition();
            idxCondition.setCondValue(param.getConditionValue());
            idxCondition.setCondOperand(param.getIdxConditionOperand());
            idxCondition.setCondOperator(param.getIdxConditionOperator());

            condition.setCharIdxCondition(idxCondition);
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        } else if (param.getConditionType() === Constants.CT_PATIDX) {
            condition = new Condition();

            idxCondition = new IdxCondition();
            idxCondition.setCondValue(param.getConditionValue());
            idxCondition.setCondOperand(param.getIdxConditionOperand());
            idxCondition.setCondOperator(param.getIdxConditionOperator());

            condition.setPatIdxCondition(idxCondition);
            condition.setField(param.getSourceColumn());
            condition.setActiveCondition(param.getConditionType());
            condition.setIsFieldRef(param.getIsFieldRef());
            condition.setWhereConditionType(param.getWhereConditionType());
        }

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    addLenCondition(param) {

        let condition = null;
        let lenCondition = null;

        condition = new Condition();

        lenCondition = new LenCondition();
        lenCondition.setCondValue(param.getConditionValue());
        lenCondition.setCondOperand(param.getLenConditionOperand());
        lenCondition.setCondOperator(param.getLenConditionOperator());

        condition.setLenCondition(lenCondition);
        condition.setField(param.getSourceColumn());
        condition.setActiveCondition(param.getConditionType());
        condition.setIsFieldRef(param.getIsFieldRef());
        condition.setWhereConditionType(param.getWhereConditionType());


        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    addDateDiffCondition(param) {

        let condition = null;

        condition = new Condition();
        condition.setDateDiffCondition(param.getConditionValue());
        condition.setActiveCondition(param.getConditionType());
        condition.setIsFieldRef(param.getIsFieldRef());
        condition.setWhereConditionType(param.getWhereConditionType());

        if (param.getIsJoinCondition()) {
            let join = new Join();
            join.setTableName(param.getTableName());
            join.setTableAlias(param.getTableAlias());
            join.setJoinType(Constants.JOIN_TYPE_INNER);
            join.getJoinConditions().push(condition);

            if (!ProcessorUtil.isDuplicateJoin(this.getITQInstance().getTableJoins(), join)) {
                this.getITQInstance().getTableJoins().push(join);
            }
        } else if (param.getIsCaseCondition()) {
            let cw = null;

            if (param.getIsMultipleWhen()) {
                cw = new CaseWhen();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());
                cw.getConditions().push(condition);

                if (!ProcessorUtil.isDuplicateCondition(this.getQF().getCaseWhenCandidates(), cw)
                    && !ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    this.getQF().getCaseWhenCandidates().push(cw);
                }
            } else {
                cw = this.getCW();
                cw.setCaseValue(param.getCaseValue());
                cw.setElseValue(param.getElseValue());

                if (!ProcessorUtil.isDuplicateCondition(this.getCW(), condition)) {
                    cw.getConditions().push(condition);
                }
            }
        } else {
            if (!ProcessorUtil.isDuplicateCondition(this.getITQInstance().getWhereConditions(), condition)) {
                this.getITQInstance().getWhereConditions().push(condition);
            }
        }

    }

    populateCaseElseValues(caseValue, elseValue) {
        this.getQF().setCaseValue(caseValue);
        this.getQF().setElseValue(elseValue);
    }

    getSTQ() {
        return this.executionData.getQueries().get(this.executionData.getQueryIndex());
    }

    getITQ() {
        return this.executionData.getQueries().get(this.executionData.getQueryIndex()).getImportTables()
            .get(this.executionData.getImportQueryIndex());
    }

    getITQInstance() {
        return this.executionData.getQueries().get(this.executionData.getQueryIndex()).getImportTables()
            .get(this.executionData.getImportQueryIndex()).getITQInstances().get(this.executionData.getImportQueryInstanceIndex());
    }

    getQF() {
        return this.getITQInstance().getInsertFields().get(this.executionData.getImportFieldIndex());
    }

    getCW() {
        let cw = this.getQF().getCaseWhenCandidates().get(this.getCWLen() - 1);
        if (!cw) {
            cw = new CaseWhen();
            this.getQF().getCaseWhenCandidates().push(cw);
        }
        return cw;
    }

    getCWLen() {
        return this.getQF().getCaseWhenCandidates().length;
    }
}

module.exports = QueryService;