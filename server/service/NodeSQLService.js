var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var squel = require("squel").useFlavour("mssql");
var SQLSourceTableQuery = require('../models/finisher/SQLSourceTableQuery');
var SQLDestinationTableQuery = require('../models/finisher/SQLDestinationTableQuery');
var SQLQuery = require('../models/finisher/SQLQuery');
var ProcessorUtil = require('../utils/ProcessorUtil');
var ServerUtils = require('../utils/ServerUtils');
var StringUtils = require('../utils/StringUtils');
var Constants = require('../common/Constants');
var _ = require('lodash');
var CrossApplyBlock = require('../utils/CrossApplyBlock');
var CrossApplyUtil = require('../utils/CrossApplyUtil');
var sqlformatter = require('sqlformatter');

class NodeSQLService {
    constructor() {
        this.processedFields = null;
        this.isNewlineCharReq = false;
        this.importSchemaName = null;
    }

    setSchemaName(isn) {
        if (StringUtils.isNotEmpty(isn)) {
            //import_payson.import.
            this.importSchemaName = StringUtils.concat(false, isn,
                Constants.PERIOD, Constants.IMPORT_PH, Constants.PERIOD);
        } else {
            this.importSchemaName = Constants.EMPTY;
        }
    }

    generateScript(stQuery, queryIndex) {

        let qIndexOffset = 0;

        let sqlSTQuery = new SQLSourceTableQuery();

        sqlSTQuery.setQueryIndex(queryIndex + 1);

        stQuery.getImportTables().forEach((itQuery, index, itQueries) => {

            _.forEach(itQuery.getITQInstances(), (itqInst, instIdx, itqInsts) => {

                this.processedFields = new Array();

                this.isNewlineCharReq = false;

                let resultObj = squel.insert({ separator: "\n" })
                    .into(this.importSchemaName + itQuery.getImportTableName());

                let selectQuery = this.generateFrom(stQuery.getSourceTable(), stQuery.getSourceTableAlias(),
                    itqInst.getTableJoins(), itqInst.getInsertFields())
                    .where(this.buildCondition(itqInst.getWhereConditions()));

                let groupByQuery = this.generateGroupBy(itqInst.getGroupByFields());

                if (StringUtils.isNotEmpty(groupByQuery)) {
                    selectQuery = selectQuery.group(groupByQuery)
                    selectQuery = selectQuery.having(this.buildCondition(itqInst.getHavingConditions()));
                }

                resultObj = resultObj.fromQuery(
                    this.getInsertFields(itqInst.getInsertFields()),
                    selectQuery);

                let nlQuery = '';

                if (this.isNewlineCharReq) {
                    nlQuery = 'DECLARE ' + Constants.NL_CHAR_PH + ' AS CHAR(2) = CHAR(13) + CHAR(10)\n';
                }

                let result = nlQuery + resultObj.toString();

                if (instIdx > 0) {
                    qIndexOffset = qIndexOffset + 1;
                }

                result = sqlformatter.format(result);

                let sqlDTQuery = new SQLDestinationTableQuery();
                sqlDTQuery.setQueryIndex(index + qIndexOffset + 1);
                sqlDTQuery.setDestinationTable(itQuery.getImportTableName());
                sqlDTQuery.setDestinationTableQuery(result);

                sqlSTQuery.setSourceTableName(stQuery.getSourceTable());
                sqlSTQuery.getQueries().push(sqlDTQuery);
            });
        });

        return sqlSTQuery;
    }

    generateFrom(sourceTable, sourceTableAlias, joinTables, insertFields) {

        squel.mySelect = (options) => {
            return squel.select(options, [
                new squel.cls.StringBlock(options, 'SELECT'),
                new squel.cls.FunctionBlock(options),
                new squel.cls.DistinctBlock(options),
                new squel.cls.GetFieldBlock(options),
                new squel.cls.FromTableBlock(options),
                new squel.cls.JoinBlock(options),
                new CrossApplyBlock(options),
                new squel.cls.WhereBlock(options),
                new squel.cls.GroupByBlock(options),
                new squel.cls.HavingBlock(options),
                new squel.cls.OrderByBlock(options),
                new squel.cls.LimitBlock(options),
                new squel.cls.OffsetBlock(options),
                new squel.cls.UnionBlock(options)
            ]);
        }

        // let crossApplyQuery = CrossApplyUtil.createCrossApply(insertFields);

        let select = squel.mySelect({ separator: "\n" })
            .fields(this.getSelectFields(insertFields))
            //.fields(crossApplyQuery.sFields)
            .from(sourceTable, sourceTableAlias);

        if (ServerUtils.isNotEmpty(joinTables)) {
            _.forEach(joinTables, (jt, index, jts) => {
                select = select.join(jt.getTableName(), jt.getTableAlias(),
                    this.buildCondition(jt.getJoinConditions()));
            });
        }

        //select = select.crossApply(crossApplyQuery.query);

        return select;

    }

    getInsertFields(queryFields) {
        let nextWrapIndex = 4;
        let uniqFields = _.uniq(_.map(queryFields, (qf, index, qfs) => {
            return _.trim(qf.getImportFieldName());
        }));

        return _.map(uniqFields, (uf, idx, ufs) => {
            if (idx == nextWrapIndex) {
                nextWrapIndex = nextWrapIndex + 4;
            }
            return _.trim(uf);
        });
    }

    generateGroupBy(fields) {
        return (ServerUtils.isNotEmpty(fields)) ? fields.join(",") : Constants.EMPTY;
    }

    getSelectFields(queryFields) {

        let selectFields = new Array();
        let selectCaseWhen = squel.case();
        let concatFields = new Array();
        let tempFields = new Array();
        let nextWrapIndex = 2;
        let isMultipleCaseWhen = false;

        //Single QF configuration with case when - when - else config
        let isSingleQFCW = null;
        //case when - when - else config spread across fields
        let isCWAcrossMapping = null;

        let orderedFields = _.chain(queryFields)
            .filter(qf => !qf.getIsProcessed()).value();
        //.sortBy('importFieldName').value();

        _.forEach(orderedFields, (qf, index, qFields) => {

            concatFields.clear();
            tempFields.clear();

            if (!_.includes(this.processedFields, qf.getImportFieldName())) {

                this.processedFields.push(qf.getImportFieldName());

                let selectField = null;

                let isConcatRequired = ProcessorUtil.isConcatRequired(qf);

                if (isConcatRequired) {

                    if (StringUtils.isNotEmpty(qf.getConcatValue())) {
                        tempFields.push(qf.getConcatValue());
                    }

                    if (StringUtils.isNotEmpty(qf.getSourceFieldName())) {
                        tempFields.push(qf.getSourceFieldName());
                    }

                    if (ServerUtils.isNotEmpty(qf.getConcatCandidates())) {

                        tempFields.push(Constants.NL_CHAR_PH);

                        if (!this.isNewlineCharReq) this.isNewlineCharReq = true;

                        concatFields.push(this.generateCaseWhen(tempFields, qf.getSourceFieldName()));

                        concatFields.addEach(_.map(qf.getConcatCandidates(), (cf) => {
                            let localFields = new Array();

                            if (StringUtils.isNotNull(cf.getConcatValue())) {
                                localFields.push(cf.getConcatValue());
                            }

                            localFields.push(cf.getFieldName());

                            if (cf.getIsNewLineRequired()) {
                                localFields.push(Constants.NL_CHAR_PH);
                                if (!this.isNewlineCharReq) this.isNewlineCharReq = true;
                            }

                            return this.generateCaseWhen(localFields, cf.getFieldName());

                        }));

                    } else {

                        concatFields.push(this.generateCaseWhen(tempFields, qf.getSourceFieldName()));
                    }

                    selectField = concatFields.join(' + ');
                } else {

                    if (StringUtils.isNotEmpty(qf.getPkPrefix())) {
                        selectField = qf.getPkPrefix();
                    }

                    if (StringUtils.isNotEmpty(qf.getSourceFieldName())) {
                        if (selectField != null)
                            selectField = selectField + ' + ' + qf.getSourceFieldName();
                        else
                            selectField = qf.getSourceFieldName();
                    }

                    if (StringUtils.isNotEmpty(qf.getConcatValue())) {
                        selectField = qf.getConcatValue();
                    }

                    if (ServerUtils.isNotEmpty(qf.getCaseWhenCandidates())) {

                        if (index + 1 == _.size(orderedFields))
                            isMultipleCaseWhen = false;
                        else {
                            let nextField = orderedFields.get(index + 1);
                            if (nextField.getImportFieldName() == qf.getImportFieldName()
                                && ServerUtils.isNotEmpty(nextField.getCaseWhenCandidates())) {
                                isCWAcrossMapping = true;
                            } else if (qf.getCaseWhenCandidates().length > 1) {
                                isSingleQFCW = true;
                            } else {
                                isCWAcrossMapping = false;
                                isSingleQFCW = false;
                            }
                        }

                        if (isCWAcrossMapping || isSingleQFCW) {
                            let caseValue;
                            let elseValue;
                            if (_.size(qf.getCaseWhenCandidates()) > 0) {
                                selectField = squel.rstr(selectField);
                            }
                            _.forEach(qf.getCaseWhenCandidates(), (cw, idx, cws) => {
                                caseValue = ProcessorUtil.getValidCWValue(cw.getCaseValue(), selectField, Constants.EMPTY);
                                elseValue = cw.getElseValue();
                                selectCaseWhen = selectCaseWhen
                                    .when(this.buildCondition(cw.getConditions()))
                                    .then(caseValue);
                            });

                            if (!isCWAcrossMapping && index + 1 == _.size(qf.getCaseWhenCandidates())) {
                                selectCaseWhen = selectCaseWhen.else(elseValue);
                                selectField = selectCaseWhen.toString();
                                selectCaseWhen = squel.case();
                            }

                            isSingleQFCW = false;

                        } else if (!isCWAcrossMapping && !isSingleQFCW) {
                            if (selectCaseWhen.toString() === Constants.VALUE_NULL
                                || selectCaseWhen.toString() === _.trim(Constants.VALUE_NULL)) {
                                let conditions = qf.getCaseWhenCandidates().get(0).getConditions();
                                selectField = squel.rstr(selectField);
                                selectField = squel.case()
                                    .when(this.buildCondition(conditions))
                                    .then(selectField)
                                    .toString();
                            } else {
                                selectField = selectCaseWhen.toString();
                                selectCaseWhen = squel.case();
                            }
                        }
                    }
                }

                if (!isCWAcrossMapping || _.isNull(isCWAcrossMapping)) {
                    selectField = StringUtils.concat(true, selectField, Constants.ALIAS_KW, qf.getSourceAliasName());
                    if (_.size(selectFields) == nextWrapIndex && index < _.size(orderedFields) - 1) {
                        selectField = StringUtils.concat(true, selectField, Constants.SPACE);
                        selectFields.push(selectField);
                        nextWrapIndex = nextWrapIndex + 2;
                    } else {
                        selectFields.push(selectField);
                    }
                }

                qf.setIsProcessed(true);
            }
        });

        return selectFields;

    }

    generateCaseWhen(fields, sourceFieldName) {

        let concatFields = fields.join(' + ');

        return squel.case()
            .when(sourceFieldName + ' is not null')
            .then(concatFields).else('');

    }

    buildCondition(conditions) {

        var expr = squel.expr();

        if (ServerUtils.isEmpty(conditions)) return expr;

        _.forEach(conditions, (cond, index, conds) => {

            let param = {};

            switch (cond.getActiveCondition()) {

                case Constants.CT_NOT_IN:
                    expr = this.createExpr(cond, ' NOT IN ? ', cond.getNotInCondition(), param);
                    break;
                case Constants.CT_IN:
                    expr = this.createExpr(cond, ' IN ? ', cond.getInCondition(), param);
                    break;
                case Constants.CT_NOT_LIKE:
                    expr = this.createExpr(cond, ' NOT LIKE ? ', cond.getNotLikeCondition(), param);
                    break;
                case Constants.CT_LIKE:
                    expr = this.createExpr(cond, ' LIKE ? ', cond.getLikeCondition(), param);
                    break;
                case Constants.CT_NOT_EQ:
                    expr = this.createExpr(cond, ' <> ? ', cond.getNeqCondition(), param);
                    break;
                case Constants.CT_EQ:
                    expr = this.createExpr(cond, ' = ? ', cond.getEqCondition(), param);
                    break;
                case Constants.CT_NOT_NULL:
                    expr = this.createExpr(cond, ' IS NOT NULL');
                    break;
                case Constants.CT_NULL:
                    expr = this.createExpr(cond, ' IS NULL');
                    break;
                case Constants.CT_CHARIDX:
                    if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                        expr = expr.or(ProcessorUtil.createIdxCondition(Constants.CT_CHARIDX, cond.getField(),
                            cond.getCharIdxCondition().getCondOperator(), cond.getCharIdxCondition().getCondOperand()), param);
                    } else {
                        expr = expr.and(ProcessorUtil.createIdxCondition(Constants.CT_CHARIDX, cond.getField(),
                            cond.getCharIdxCondition().getCondOperator(), cond.getCharIdxCondition().getCondOperand()), param);
                    }
                    break;
                case Constants.CT_PATIDX:
                    if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                        expr = expr.or(ProcessorUtil.createIdxCondition(Constants.CT_PATIDX, cond.getField(),
                            cond.getPatIdxCondition().getCondOperator(), cond.getPatIdxCondition().getCondOperand()), param);
                    } else {
                        expr = expr.and(ProcessorUtil.createIdxCondition(Constants.CT_PATIDX, cond.getField(),
                            cond.getPatIdxCondition().getCondOperator(), cond.getPatIdxCondition().getCondOperand()), param);
                    }
                    break;
                case Constants.LEN_COND_PH:
                    if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                        expr = expr.or(ProcessorUtil.createLenCondition(Constants.LEN_COND_PH, cond.getField(),
                            cond.getLenCondition().getCondOperator(), cond.getLenCondition().getCondValue()), param);
                    } else {
                        expr = expr.and(ProcessorUtil.createLenCondition(Constants.LEN_COND_PH, cond.getField(),
                            cond.getLenCondition().getCondOperator(), cond.getLenCondition().getCondValue()), param);
                    }
                    break;
                case Constants.DATEDIFF_PH:
                    if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                        expr = expr.or(cond.getDateDiffCondition());
                    } else {
                        expr = expr.and(cond.getDateDiffCondition());
                    }
                    break;
                default:
                    break;

            }

        });

        return expr.toString();

    }

    createExpr(cond, expr, condValue, params) {

        if (!condValue || _.size(_.trim(condValue)) == 0) {
            if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                return squel.expr().or(cond.getField() + expr);
            } else {
                return squel.expr().and(cond.getField() + expr);
            }
        } else {
            const formattedCondition = this.formatCondition(condValue, cond.getIsFieldRef());
            if (cond.getWhereConditionType() === Constants.WHERE_CLAUSE_OR) {
                return squel.expr().or(cond.getField() + expr, formattedCondition, params);
            } else {
                return squel.expr().and(cond.getField() + expr, formattedCondition, params);
            }
        }
    }

    formatCondition(condition, isFieldRef) {
        let formattedCondition = condition;
        if (isFieldRef) {
            formattedCondition = squel.rstr(formattedCondition);
        }
        return formattedCondition;
    }
}

module.exports = NodeSQLService;