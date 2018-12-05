var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var QueryService = require('./QueryService');
var ExecutionData = require('../models/ExecutionData');
var ProcessorUtil = require('../utils/ProcessorUtil');
var _ = require('lodash');
var Param = require('../models/Param');
var Columns = require('../common/Columns');
var StringUtils = require('../utils/StringUtils');
var ServerUtils = require('../utils/ServerUtils');
var Constants = require('../common/Constants');

class SQLModelService {

    constructor() {
        this.queryService = new QueryService();
        this.sourceTable = null;
        this.primaryKeyCol = null;
        this.executionData = null;
        this.splitImportTables = new Array();
        this.hasRelationshipImport = false;
    }

    setExecutionData(executionData) {
        this.executionData = executionData;
    }

    createSQL(stMapping, queryIndex) {
        this.queryService.setExecutionData(this.executionData);
        this.sourceTable = stMapping.getSourceTable();
        this.primaryKeyCol = stMapping.getPrimaryKeyCol();
        this.queryService.initializeQuery(this.sourceTable, ProcessorUtil.getAlias(this.sourceTable));

        let sortedMappingByRank = ProcessorUtil.orderByRank(stMapping.getDestinationTableMappings());

        _.forEach(sortedMappingByRank, (dtMapping, mIndex, dtMappings) => {

            let isMappingSplit = false;

            this.queryService.initializeImportQuery(dtMapping.getDestinationTable());

            let splitDTMappings = ProcessorUtil.verifyAndSplitMapping(dtMapping, dtMapping.getDestinationTable(), this.splitImportTables);

            if (_.size(splitDTMappings) > 1) {
                this.splitImportTables.push(dtMapping.getDestinationTable());
                isMappingSplit = true;
            }

            _.forEach(splitDTMappings, (sdtm, sidx, sdtms) => {

                let splitOnColumn = null;

                if (isMappingSplit) {
                    splitOnColumn = sdtm.getMappingProperties().get(0).sourceColumn;
                }

                this.hasRelationshipImport = false;

                this.queryService.addImportQueryInstance();

                let param = new Param();
                param.setSourceColumn(ProcessorUtil.getAliasedField(this.primaryKeyCol, this.sourceTable));
                param.setImportColumn(Columns.INSERT_COL_ID);
                param.setColumnPrefix(ProcessorUtil.generatePrefix(sdtm.getDestinationTable(), splitOnColumn));
                param.setColumnAlias(Columns.PK_ALIAS);

                this.queryService.createPrefixedSelectField(param);

                param = new Param();
                param.setImportColumn(Columns.INSERT_COL_TRID);
                param.setConcatValue(1);
                param.setColumnAlias(Columns.TRID_ALIAS);

                this.queryService.createSelectField(param);

                _.forEach(sdtm.getMappingProperties(), (prop, mpIndex, props) => {
                    if (!prop.getIsProcessed()) {
                        let candidates = ProcessorUtil.findConcatCandidates(sdtm, prop);
                        let isNLReq = (!_.isNull(candidates) && (_.size(candidates) > 0));
                        this.generateScript(prop, sdtm.getDestinationTable(), isNLReq);
                        _.forEach(candidates, (candidate, ccIndex, candidates) => {
                            this.generateConcatScript(candidate, sdtm.getDestinationTable());
                        });
                    }
                });

                if (this.hasRelationshipImport) {
                    let param = new Param();
                    param.setImportColumn(Columns.INSERT_COL_REL_NAME);
                    param.setConcatValue(ProcessorUtil.getRelationshipName(sdtm.getDestinationTable()));
                    param.setColumnAlias(Columns.NAME_ALIAS);

                    this.queryService.createSelectField(param);
                }

                if (isMappingSplit) {

                    let param = new Param();
                    param.setSourceColumn(ProcessorUtil.getAliasedField(splitOnColumn, this.sourceTable));
                    param.setConditionType(Constants.CT_NOT_NULL);
                    param.setWhereConditionType(Constants.WHERE_CLAUSE_AND);

                    this.queryService.addNullCondition(param);

                    param = new Param();
                    param.setSourceColumn(ProcessorUtil.getAliasedField(splitOnColumn, this.sourceTable));
                    param.setConditionType(Constants.LEN_COND_PH);
                    param.setWhereConditionType(Constants.WHERE_CLAUSE_AND);
                    param.setConditionValue(0);
                    param.setLenConditionOperator(Constants.GREATER_SYM);

                    this.queryService.addLenCondition(param);
                }

            });

        });

    }

    generateScript(prop, destinationTable, isNLReq) {

        if (!this.isRelationship(prop.getDestinationColumn())) {

            if (StringUtils.isNotEmpty(prop.getDestValue())) {
                this.formatAndCreateSelectField(prop.getDestColumn(), prop.getDestValue(),
                    prop.getSourceColumn(), isNLReq);
            } else {
                let param = new Param();
                param.setSourceColumn(ProcessorUtil.getAliasedField(prop.getSourceColumn(), this.sourceTable));
                param.setImportColumn(prop.getDestColumn());
                param.setColumnAlias(ProcessorUtil.getAlias(prop.getDestColumn()));

                this.queryService.createSelectField(param);
            }

        } else {
            this.queryService.updateRelationshipFlag(true);
            if (!this.hasRelationshipImport) {
                this.hasRelationshipImport = true;
            }
            this.createSourceAndDestFields(prop);
        }

        if (StringUtils.isNotEmpty(prop.getJoinTable())) {
            this.parseTableJoins(prop.getJoinTable());
        }

        let nonRelationalConditions = ProcessorUtil.getNonRelationalConditions(prop.getConditions(),
            prop.getSourceTablesCount(), prop.getDestTablesCount());

        if (StringUtils.isNotEmpty(nonRelationalConditions)) {

            let caseConditions = ProcessorUtil.getNonRelationalCaseConditions(nonRelationalConditions);

            if (StringUtils.isNotEmpty(caseConditions)) {

                this.parseNonRelCaseWhenConditions(caseConditions);

            } else {

                this.processConditions(nonRelationalConditions);

                /* let condParam = new Param();
                condParam.setSourceColumn(prop.getSourceColumn());
                condParam.setConditionValue(nonRelationalConditions);
                condParam.setIsFieldRef(false);
                condParam.setIsJoinCondition(false);
                condParam.setIsCaseCondition(false);
                condParam.setWhereConditionType(Constants.WHERE_CLAUSE_AND);

                this.parseAndCreateConditions(condParam); */
            }
        }

        prop.setIsProcessed(true);

    }

    generateConcatScript(prop, destTable) {

        let destValue = StringUtils.remove(prop.getDestValue(), Constants.DBL_QUOTE);

        this.queryService.createConcatField(ProcessorUtil.getAliasedField(prop.getSourceColumn(), this.sourceTable),
            _.trim(destValue), true);

        prop.setIsProcessed(true);

    }

    formatAndCreateSelectField(destColumn, value, sourceColumn, isNLReq) {

        var destValue = StringUtils.remove(value, Constants.DBL_QUOTE);
        var destValue = StringUtils.remove(destValue, Constants.SINGLE_QUOTE);
        let param = null;

        if (_.endsWith(destValue, Constants.HYPHEN)) {
            param = new Param();
            param.setSourceColumn(ProcessorUtil.getAliasedField(sourceColumn, this.sourceTable));
            param.setImportColumn(destColumn);
            param.setConcatValue(_.trim(destValue));
            param.setColumnAlias(ProcessorUtil.getAlias(destColumn));
            param.setIsNLReq(isNLReq);

            this.queryService.createSelectField(param);

        } else {

            if (destValue === Constants.BOOL_TRUE_STR
                || destValue === Constants.BOOL_FALSE_STR) {
                destValue = Constants.convertBoolStrToBit(destValue);
            }

            param = new Param();
            param.setImportColumn(destColumn);
            //param.setSourceColumn(ProcessorUtil.getAliasedField(sourceColumn, this.sourceTable));
            param.setConcatValue(_.trim(destValue));
            param.setColumnAlias(ProcessorUtil.getAlias(destColumn));
            param.setIsNLReq(isNLReq);

            this.queryService.createSelectField(param);

        }

    }

    createSourceAndDestFields(prop) {

        let relColumns = ProcessorUtil.extractSourceAndDestColumns(prop.getDestinationColumn().getColumns(), prop.getConditions());

        prop.setRelSrcTables(relColumns.getRelSourceColumns());
        prop.setRelDestTables(relColumns.getRelDestColumns());
        prop.setDestTablesCount(_.size(relColumns.getRelDestColumns()));
        prop.setSourceTablesCount(_.size(relColumns.getRelSourceColumns()));

        _.forEach(relColumns.getRelSourceColumns(), (stc, index, stcs) => {
            let srcParam = new Param();
            srcParam.setSourceColumn(ProcessorUtil.getAliasedField(prop.getSourceColumn(), this.sourceTable));
            srcParam.setImportColumn(stc.getColumnName());
            srcParam.setColumnPrefix(ProcessorUtil.generatePrefix(stc.getFormattedColumnName(), null));
            srcParam.setColumnAlias(ProcessorUtil.getRelationAlias(stc.getFormattedColumnName(),
                Constants.SRC_REL_ALIAS_PFX));

            this.queryService.createPrefixedSelectField(srcParam);

            let caseValue = StringUtils.concat(true, srcParam.getColumnPrefix(), Constants.PLUS, srcParam.getSourceColumn());

            if (stc.hasRelConditions()) {
                this.parseRelCaseWhenConditions(stc.getConditionArray(), Constants.SRC_COND_PH, caseValue, Constants.EMPTY);
            }
        });

        let param = new Param();
        param.setSourceColumn(ProcessorUtil.getAliasedField(prop.getSourceColumn(), this.sourceTable));
        param.setConditionType(Constants.CT_NOT_NULL);
        param.setWhereConditionType(Constants.WHERE_CLAUSE_AND);

        this.queryService.addNullCondition(param);

        _.forEach(relColumns.getRelDestColumns(), (dtc, index, dtcs) => {

            let dstParam = new Param();
            dstParam.setSourceColumn(ProcessorUtil.getAliasedField(this.primaryKeyCol, this.sourceTable));
            dstParam.setImportColumn(dtc.getColumnName());
            dstParam.setColumnPrefix(ProcessorUtil.generatePrefix(dtc.getFormattedColumnName(), null));
            dstParam.setColumnAlias(ProcessorUtil.getRelationAlias(dtc.getFormattedColumnName(),
                Constants.TGT_REL_ALIAS_PFX));

            this.queryService.createPrefixedSelectField(dstParam);

            let caseValue = StringUtils.concat(true, dstParam.getColumnPrefix(), Constants.PLUS, dstParam.getSourceColumn());

            if (dtc.hasRelConditions()) {
                this.parseRelCaseWhenConditions(dtc.getConditionArray(), Constants.TGT_COND_PH, caseValue, Constants.EMPTY);
            }

        });

    }

    parseAndCreateConditions(condParam) {

        let conditions = ServerUtils.getValueAsArray(condParam.getConditionValue(), Constants.SEMI_COLON);

        let operands = _.union(Constants.COPERANDS, Constants.VALOPERANDS);

        _.forEach(conditions, (condition, index, conditions) => {

            let condType = _.chain(operands).filter(TYP => _.includes(_.toLower(condition), _.toLower(TYP))).first().value();

            switch (condType) {
                case Constants.CT_NOT_IN:

                    this.queryService.addInConditions(this.generateInConditionParam(condition, condParam, Constants.CT_NOT_IN));

                    break;

                case Constants.CT_IN:

                    this.queryService.addInConditions(this.generateInConditionParam(condition, condParam, Constants.CT_IN));

                    break;

                case Constants.CT_NOT_LIKE:

                    this.queryService.addLikeCondition(this.generateConditionParam(condition, condParam, Constants.CT_NOT_LIKE));

                    break;

                case Constants.CT_LIKE:

                    this.queryService.addLikeCondition(this.generateConditionParam(condition, condParam, Constants.CT_LIKE));

                    break;

                case Constants.CT_NOT_EQ:

                    this.queryService.addEqualsCondition(this.generateConditionParam(condition, condParam, Constants.CT_NOT_EQ));

                    break;

                case Constants.CT_EQ:

                    this.queryService.addEqualsCondition(this.generateConditionParam(condition, condParam, Constants.CT_EQ));

                    break;

                case Constants.CT_NOT_NULL:

                    this.queryService.addNullCondition(this.generateConditionParam(condition, condParam, Constants.CT_NOT_NULL));

                    break;

                case Constants.CT_NULL:

                    this.queryService.addNullCondition(this.generateConditionParam(condition, condParam, Constants.CT_NULL));

                    break;

                case Constants.CONTAINS_PH:

                    this.queryService.addIndexCondition(this.generateIdxConditionParam(condition, condParam, Constants.CT_CHARIDX));

                    break;

                case Constants.IS_ALPHA_PH:

                    this.queryService.addIndexCondition(this.generateIdxConditionParam(condition, condParam, Constants.CT_PATIDX));

                    break;

                case Constants.IS_NUMERIC_PH:

                    this.queryService.addIndexCondition(this.generateIdxConditionParam(condition, condParam, Constants.CT_PATIDX));

                    break;

                case Constants.IS_AN_PH:

                    this.queryService.addIndexCondition(this.generateIdxConditionParam(condition, condParam, Constants.CT_PATIDX));

                    break;

                case Constants.LEN_COND_PH:

                    this.queryService.addLenCondition(this.generateLenCondition(condParam, Constants.LEN_COND_PH));

                    break;

                case Constants.DATEDIFF_PH:

                    this.queryService.addDateDiffCondition(this.generateDateDiffCondition(condParam, Constants.DATEDIFF_PH));

                    break;

                default:
                    break;
            }

        });

    }

    generateDateDiffCondition(condParam, conditionType) {

        let param = new Param();
        param.setConditionValue(condParam.getConditionValue());
        param.setConditionType(conditionType);
        param.setTableName(condParam.getTableName());
        param.setTableAlias(condParam.getTableAlias());
        param.setIsFieldRef(condParam.getIsFieldRef());
        param.setIsCaseCondition(condParam.getIsCaseCondition());
        param.setIsJoinCondition(condParam.getIsJoinCondition());
        param.setWhereConditionType(condParam.getWhereConditionType());
        param.setCaseValue(condParam.getCaseValue());
        param.setElseValue(condParam.getElseValue());
        param.setIsMultipleWhen(condParam.getIsMultipleWhen());

        return param;
    }

    generateLenCondition(condParam, conditionType) {

        let param = new Param();
        param.setConditionValue(condParam.getConditionValue());
        param.setConditionType(conditionType);
        param.setTableName(condParam.getTableName());
        param.setTableAlias(condParam.getTableAlias());
        param.setIsFieldRef(condParam.getIsFieldRef());
        param.setIsCaseCondition(condParam.getIsCaseCondition());
        param.setIsJoinCondition(condParam.getIsJoinCondition());
        param.setWhereConditionType(condParam.getWhereConditionType());
        param.setCaseValue(condParam.getCaseValue());
        param.setElseValue(condParam.getElseValue());
        param.setIsMultipleWhen(condParam.getIsMultipleWhen());
        param.setLenConditionOperator(condParam.getLenConditionOperator());
        param.setLenConditionOperand(condParam.getLenConditionOperand());

        return param;
    }

    generateInConditionParam(condition, condParam, conditionType) {

        let conditionValue = ProcessorUtil.extractConditionValue(condition, conditionType);

        let conditionValues = StringUtils.split(conditionValue, Constants.COMMA);

        let conditionField = ProcessorUtil.extractConditionField(condition, conditionType);

        let param = new Param();
        param.setInConditionValues(conditionValues);
        param.setConditionType(conditionType);
        param.setTableName(condParam.getTableName());
        param.setTableAlias(condParam.getTableAlias());
        param.setIsFieldRef(condParam.getIsFieldRef());
        param.setIsCaseCondition(condParam.getIsCaseCondition());
        param.setIsJoinCondition(condParam.getIsJoinCondition());
        param.setWhereConditionType(condParam.getWhereConditionType());
        param.setCaseValue(condParam.getCaseValue());
        param.setElseValue(condParam.getElseValue());
        param.setIsMultipleWhen(condParam.getIsMultipleWhen());

        if (StringUtils.isNotEmpty(conditionField)) {
            param.setSourceColumn(conditionField);
        } else {
            param.setSourceColumn(ProcessorUtil.getAliasedField(condParam.getSourceColumn(), this.sourceTable));
        }

        return param;

    }

    generateIdxConditionParam(condition, condParam, conditionType) {

        let condParts = ProcessorUtil.extractIdxConditionParts(condition, conditionType);

        let param = new Param();

        param.setConditionValue(condParts.condValue);
        param.setConditionType(conditionType);
        param.setTableName(condParam.getTableName());
        param.setTableAlias(condParam.getTableAlias());
        param.setIsCaseCondition(condParam.getIsCaseCondition());
        param.setIsFieldRef(condParam.getIsFieldRef());
        param.setIsJoinCondition(condParam.getIsJoinCondition());
        param.setWhereConditionType(condParam.getWhereConditionType());
        param.setCaseValue(condParam.getCaseValue());
        param.setElseValue(condParam.getElseValue());
        param.setIsMultipleWhen(condParam.getIsMultipleWhen());
        param.setSourceColumn(condParts.condField);
        param.setIdxConditionOperand(condParts.condOperand);
        param.setIdxConditionOperator(condParts.condOperator);

        return param;
    }

    generateConditionParam(condition, condParam, conditionType) {

        let conditionValue = ProcessorUtil.extractConditionValue(condition, conditionType);

        let conditionField = ProcessorUtil.extractConditionField(condition, conditionType);

        let param = new Param();

        param.setConditionValue(conditionValue);
        param.setConditionType(conditionType);
        param.setTableName(condParam.getTableName());
        param.setTableAlias(condParam.getTableAlias());
        param.setIsCaseCondition(condParam.getIsCaseCondition());
        param.setIsFieldRef(condParam.getIsFieldRef());
        param.setIsJoinCondition(condParam.getIsJoinCondition());
        param.setWhereConditionType(condParam.getWhereConditionType());
        param.setCaseValue(condParam.getCaseValue());
        param.setElseValue(condParam.getElseValue());
        param.setIsMultipleWhen(condParam.getIsMultipleWhen());

        if (StringUtils.isNotEmpty(conditionField)) {
            param.setSourceColumn(conditionField);
        } else {
            param.setSourceColumn(ProcessorUtil.getAliasedField(condParam.getSourceColumn(), this.sourceTable));
        }

        return param;
    }

    /**
     * 
     * @param {*} joinTable A set of table join conditions
     * @description Parse join conditions based on separator
     */
    parseTableJoins(joinTable) {

        let joinConfigurations = null;
        let param = null;
        let joinConfiguration = null;

        joinConfigurations = ServerUtils.getValueAsArray(joinTable, Constants.NEWLINE_CHAR);

        _.forEach(joinConfigurations, (config, idx, configs) => {

            let tableConfig = ServerUtils.getValueAsArray(config, Constants.SEMI_COLON);

            param = new Param();
            param.setTableName(tableConfig.get(0));
            param.setConditionValue(ProcessorUtil.getAliasedCondition(
                this.sourceTable, tableConfig.get(0), tableConfig.get(1)));
            param.setTableAlias(ProcessorUtil.getAlias(tableConfig.get(0)));
            param.setConditionValue(ProcessorUtil.getAliasedCondition(
                this.sourceTable, tableConfig.get(0), tableConfig.get(1)));
            param.setIsFieldRef(true);
            param.setIsJoinCondition(true);
            param.setIsCaseCondition(false);

            this.parseAndCreateConditions(param);
        });
    }

    parseRelCaseWhenConditions(conditions, condPrefix, caseValue, elseValue) {

        _.forEach(conditions, (cond, index, conds) => {

            cond = StringUtils.remove(cond, condPrefix);

            this.processCaseConditions(cond, true, caseValue, elseValue);

        });

    }

    parseNonRelCaseWhenConditions(condStr) {

        let conditions = ServerUtils.getValueAsArray(condStr, Constants.SEMI_COLON);

        _.forEach(conditions, (cond, index, conds) => {

            this.processCaseConditions(cond, false, null, null)

        });

    }

    //Mostly Applicable for Non-Case conditions
    processConditions(cond) {

        let type = _.find(Constants.NR_COND_TYPES, (typ, idx, typs) => _.includes(cond, typ));

        let param;

        let mtIdx = -1;
        let matchType = [];
        _.forEach(Constants.NR_COND_TYPES, (typ, idx, typs) => {
            mtIdx = -1;
            while ((mtIdx = cond.indexOf(typ, mtIdx + 1)) != -1) {
                matchType.push({ type: typ, idx: mtIdx });
            }
        });

        let total = _.sumBy(matchType, 'idx') + _.sumBy(matchType, (obj) => _.size(obj.type));

        matchType.push({ type: Constants.NA, idx: total });

        matchType = _.sortBy(matchType, ['idx']);
        let prevIdx = 0;
        let typeResult;

        _.forEach(matchType, (mtyp, idx, mtyps) => {
            if (mtyp.type === Constants.NA) {
                typeResult = cond.substring(prevIdx);
            } else {
                typeResult = cond.substring(prevIdx, mtyp.idx);
            }

            let valTypeOperator = ProcessorUtil.getOperator(typeResult, Constants.VALOPERANDS);

            if (valTypeOperator) {
                typeResult = this.getParsedCondition(typeResult, valTypeOperator);
            }

            param = new Param();
            param.setConditionValue(typeResult);
            param.setIsCaseCondition(false);
            param.setIsJoinCondition(false);
            param.setIsFieldRef(false);
            param.setWhereConditionType(Constants.getClauseForType(mtyp.type));

            this.parseAndCreateConditions(param);
            prevIdx = mtyp.idx + _.size(mtyp.type);
        });

    }

    processCaseConditions(cond, isRelation, relCaseValue, relElseValue) {

        //: - AND, :: - OR
        let type = _.find(Constants.NR_COND_TYPES, (typ, idx, typs) => _.includes(cond, typ));

        let isMultipleWhen = ProcessorUtil.isMultipleWhen(cond);

        let caseValues = null;
        let condValue = null;
        let caseValue = null;
        let elseValue = null;
        let condWithoutValue = null;

        if (!isMultipleWhen) {

            caseValues = ServerUtils.getValueAsArray(ServerUtils.extractStringAfter(cond, Constants.CW_ASSIGN_OPTR), Constants.CW_ELSE_VALUE_OPTR);

            condWithoutValue = cond;

            if (_.includes(cond, Constants.CW_ASSIGN_OPTR)) {
                condWithoutValue = ServerUtils.extractStringBefore(cond, Constants.CW_ASSIGN_OPTR);
            }

            cond = condWithoutValue;
        }

        let param;

        let mtIdx = -1;
        let matchType = [];
        _.forEach(Constants.NR_COND_TYPES, (typ, idx, typs) => {
            mtIdx = -1;
            while ((mtIdx = cond.indexOf(typ, mtIdx + 1)) != -1) {
                matchType.push({ type: typ, idx: mtIdx });
            }
        });

        let total = _.sumBy(matchType, 'idx') + _.sumBy(matchType, (obj) => _.size(obj.type));

        matchType.push({ type: Constants.NA, idx: total });

        matchType = _.sortBy(matchType, ['idx']);
        let prevIdx = 0;
        let typeResult;

        _.forEach(matchType, (mtyp, idx, mtyps) => {
            if (mtyp.type === Constants.NA) {
                typeResult = cond.substring(prevIdx);
            } else {
                typeResult = cond.substring(prevIdx, mtyp.idx);
            }
            //condResult.push(cond.substring(mtyp.idx + _.size(mtyp.type)));

            if (isMultipleWhen) {
                caseValue = ServerUtils.extractStringAfter(typeResult, Constants.CW_ASSIGN_OPTR);
                typeResult = ServerUtils.extractStringBefore(typeResult, Constants.CW_ASSIGN_OPTR);

                //Condition value of last WHEN will have the else value in case of multiple when
                //Case When - When - When - Else
                if (idx == _.size(matchType) - 1) {
                    if (!_.includes(caseValue, Constants.CW_ELSE_VALUE_OPTR)) {
                        elseValue = Constants.EMPTY;
                    } else if (_.includes(caseValue, Constants.CW_ELSE_VALUE_OPTR)) {
                        condValue = caseValue;
                        caseValue = ServerUtils.extractStringBefore(condValue, Constants.CW_ELSE_VALUE_OPTR);
                        elseValue = ServerUtils.extractStringAfter(condValue, Constants.CW_ELSE_VALUE_OPTR);
                    }
                }
            } else {

                if (idx == _.size(matchType) - 1) {
                    if (isRelation) {
                        caseValue = relCaseValue;
                        elseValue = relElseValue;
                    } else {
                        caseValue = caseValues[0];
                        elseValue = caseValues[1];
                    }
                }

            }

            let valTypeOperator = ProcessorUtil.getOperator(typeResult, Constants.VALOPERANDS);

            if (valTypeOperator) {
                typeResult = this.getParsedCondition(typeResult, valTypeOperator);
            }

            param = new Param();
            param.setConditionValue(typeResult);
            param.setIsCaseCondition(true);
            param.setIsJoinCondition(false);
            param.setIsFieldRef(false);
            param.setWhereConditionType(Constants.getClauseForType(mtyp.type));
            param.setIsMultipleWhen(isMultipleWhen);
            param.setCaseValue(caseValue);
            param.setElseValue(elseValue);

            this.parseAndCreateConditions(param);
            prevIdx = mtyp.idx + _.size(mtyp.type);

        });

    }

    isRelationship(columns) {
        return (columns.getColumnsCount() > 1
            && _.countBy(columns.getColumns(), (val) => _.includes(val, Columns.DEST_TBL_PFX))[Constants.BOOL_TRUE_STR] > 0
            && _.countBy(columns.getColumns(), (val) => _.includes(val, Columns.SRC_TBL_PFX))[Constants.BOOL_TRUE_STR] > 0);
    }

    getParsedCondition(condition, operator) {

        let parsedCond = null;
        let field = null;
        let value = null;

        switch (operator) {

            case Constants.CONTAINS_PH: {
                field = ServerUtils.extractStringBefore(condition, operator);
                value = ServerUtils.extractStringAfter(condition, operator);
                return ProcessorUtil.createIdxCondition(Constants.CT_CHARIDX, field, value, Constants.GREATER_SYM, '0');
            }
            case Constants.IS_ALPHA_PH: {
                field = ServerUtils.extractStringBefore(condition, operator);
                value = Constants.VT_ALPHA;
                return ProcessorUtil.createIdxCondition(Constants.CT_PATIDX, field, value, Constants.GREATER_SYM, '0');
            }
            case Constants.IS_NUMERIC_PH: {
                field = ServerUtils.extractStringBefore(condition, operator);
                value = Constants.VT_NUMERIC;
                return ProcessorUtil.createIdxCondition(Constants.CT_PATIDX, field, value, Constants.GREATER_SYM, '0');
            }
            case Constants.IS_AN_PH: {
                field = ServerUtils.extractStringBefore(condition, operator);
                value = Constants.VT_ALPHA_NUMERIC;
                return ProcessorUtil.createIdxCondition(Constants.CT_PATIDX, field, value, Constants.GREATER_SYM, '0');
            }
            case Constants.DATEDIFF_PH: {
                return condition;
            }
            default:
                return null;
        }

    }

}

module.exports = SQLModelService;