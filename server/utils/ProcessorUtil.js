var _ = require("lodash");
var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var Constants = require('../common/Constants');
var RelationshipColumns = require('../models/processor/RelationshipColumns');
var RelationshipColumn = require('../models/processor/RelationshipColumn');
var ServerUtils = require('./ServerUtils');
var StringUtils = require('./StringUtils');
var Columns = require('../common/Columns');
var MappingProperties = require('../models/loader/MappingProperties');
var DestinationTableMapping = require('../models/loader/DestinationTableMapping');

class ProcessorUtil {

    static findConcatCandidates(dtMapping, mappingProp) {

        let eligibleCandidates = _.flatten(_(dtMapping.getMappingProperties())
            .groupBy("sourceColumn").filter((group) => group.length == 1).value());

        if (_.size(eligibleCandidates) > 0) {
            let filtered = _.chain(eligibleCandidates).filter(prop =>
                (!prop.getIsProcessed() && prop.getDestinationColumn().getColumnsCount() == 1))
                .filter(prop => prop.getDestColumn() === mappingProp.getDestColumn())
                .groupBy('destinationColumn').values().filter(value => value.length > 1)
                .value();

            return _.chain(filtered.get(0)).filter(prop => !_.isEqual(prop, mappingProp)).value();
        } else {
            return new Array();
        }
    }

    // ? The following method is an old implementation of determining relationship case when conditions
    static isRelationshipCaseWhenCandidateOld(condition, tableCount, operator) {

        if (operator != '=' && operator != "<>") return false;

        let conditionValue = ServerUtils.extractStringAfter(condition, operator);

        let valueCount = StringUtils.countChar(conditionValue, Constants.COMMA) + 1;

        return (valueCount == tableCount);
    }

    // ? s$court, t$collection_case, t$litigation_matter
    // ? s$collection_case, s$litigation_matter, t$collection_case, t$litigation_matter
    static isRelationshipCaseWhenCandidate(conditions, stc, ttc) {

        let srcConditionCount = StringUtils.countChar(conditions, Constants.SRC_COND_PH);
        let destConditionCount = StringUtils.countChar(conditions, Constants.TGT_COND_PH);

        return (srcConditionCount === stc || destConditionCount === ttc) ? true : false;
    }


    // ? deprecated version of fetching non relational case when conditions
    static getRelationshipCaseWhenConditionsOld(conditions, tableCount) {
        let candidates = new Array();

        _.forEach(conditions, (cond, idx, conds) => {
            let operator = ProcessorUtil.getOperator(cond, Constants.COPERANDS);
            if (this.isRelationshipCaseWhenCandidate(cond, tableCount, operator)) {
                candidates.push(cond);
            }
        });

        return candidates;
    }

    static getRelationshipCaseWhenConditions(conditions) {

        return _.filter(conditions, (val) =>
            !(_.includes(val, Constants.SRC_COND_PH) || _.includes(val, Constants.TGT_COND_PH)))
            .join(Constants.SEMI_COLON);
    }

    static extractConditionValue(conditionExpression, conditionType) {
        let condTypeIndex = conditionExpression.indexOf(conditionType);
        let conditionValue = conditionExpression.substring(condTypeIndex + conditionType.length);
        conditionValue = _.trim(conditionValue);

        if (_.includes(Constants.MULTIVALUES, conditionType)) {
            conditionValue = StringUtils.remove(conditionValue, Constants.OPEN_PARAN);
            conditionValue = StringUtils.remove(conditionValue, Constants.CLOSE_PARAN);
        }

        conditionValue = StringUtils.remove(conditionValue, Constants.SINGLE_QUOTE);

        conditionValue = StringUtils.remove(conditionValue, Constants.DBL_QUOTE);

        return _.trim(conditionValue);
    }

    static extractConditionField(conditionExpression, conditionType) {
        var test = "test";
        let condTypeIndex = conditionExpression.indexOf(conditionType);
        let conditionValue = conditionExpression.substring(0, condTypeIndex);

        return _.trim(conditionValue);
    }

    static extractIdxConditionParts(condition, operator) {

        let condParts = { condValue: null, condField: null, condOperand: null, condOperator: null };

        var arr = _(condition).replace(operator + '(', '').replace(',', '').replace(')', '').split(' ').value();

        condParts.condValue = arr[0];
        condParts.condField = arr[1];
        condParts.condOperator = arr[2];
        condParts.condOperand = arr[3];

        return condParts;
    }

    static extractSourceAndDestColumns(destColumns, conditions) {

        let relColumns = new RelationshipColumns();
        let rc = null;

        const relSourceTables = _.chain(destColumns).map(col => _.trim(col))
            .filter(col => _.startsWith(col, Columns.SRC_TBL_PFX)).value();

        const relDestTables = _.chain(destColumns).map(col => _.trim(col))
            .filter(col => _.startsWith(col, Columns.DEST_TBL_PFX)).value();

        const srcTableConds = this.extractSrcTblRelCondition(conditions, _.size(relSourceTables), _.size(relDestTables));

        const tgtTableConds = this.extractTgtTblRelCondition(conditions, _.size(relSourceTables), _.size(relDestTables));

        _.forEach(relSourceTables, (st, idx, sts) => {
            rc = new RelationshipColumn();
            rc.setColumnName(st);
            rc.setFormattedColumnName(StringUtils.remove(st, Columns.SRC_TBL_PFX));
            if (_.size(srcTableConds) > 0) {
                rc.setConditions(srcTableConds.get(idx));
            }
            relColumns.addSourceColumn(rc);
        });

        _.forEach(relDestTables, (dt, idx, dts) => {
            rc = new RelationshipColumn();
            rc.setColumnName(dt);
            rc.setFormattedColumnName(StringUtils.remove(dt, Columns.TGT_TBL_PFX));
            if (_.size(tgtTableConds) > 0) {
                rc.setConditions(tgtTableConds.get(idx));
            }
            relColumns.addDestColumn(rc);
        });

        return relColumns;

    }

    static getAlias(param) {

        param = StringUtils.remove(param, Constants.SBRACKET);

        param = StringUtils.remove(param, Constants.EBRACKET);

        param = StringUtils.removeEnd(param, Constants.UNDERSCORE);

        if (param.length <= 3) return param.toUpperCase();

        let alias = StringUtils.left(param, 1);

        if (_.includes(param, Constants.UNDERSCORE)) {
            alias += ServerUtils.getCharBeforeEach(param, Constants.UNDERSCORE);
        } else {
            alias += StringUtils.mid(param, (param.length / 2), 1);
            alias += StringUtils.right(param, 1);
        }

        return alias.toUpperCase();
    }

    static getAliasedField(field, table) {
        return _.chain(new Array()).push(this.getAlias(table)).push(Constants.PERIOD).push(field).join('').value();
    }

    static generatePrefix(table, splitOn) {
        if (StringUtils.isNotEmpty(splitOn)) {
            return _.chain(new Array()).push(this.getAlias(table)).push(Constants.UNDERSCORE)
                .push(this.getAlias(splitOn)).push(Constants.UNDERSCORE).join('').value();
        }

        return _.chain(new Array()).push(this.getAlias(table)).push(Constants.UNDERSCORE).join('').value();
    }

    static getRelationAlias(relTable, prefix) {
        return _.chain(new Array()).push(prefix).push(Constants.UNDERSCORE).push(this.getAlias(relTable)).join('').value();
    }

    static extractCaseWhenValue(condition, matchStartChar, matchEndChar, boundaryInclusive) {
        return StringUtils.split(ServerUtils.extractStringBetween(
            condition, matchStartChar, matchEndChar), Constants.COMMA, boundaryInclusive);
    }

    static extractRelationshipCondition(condition, index, operator) {
        let conditionValue = ServerUtils.extractStringAfter(condition, operator);
        return ServerUtils.getValueAt(conditionValue, index);
    }

    static isLikeCondition(conditionType) {
        return _.includes(Constants.LIKES, conditionType);
    }

    static isConcatRequired(qf) {
        return ((StringUtils.isNotEmpty(qf.getConcatValue())
            && StringUtils.isNotEmpty(qf.getSourceFieldName()))
            || (ServerUtils.isNotEmpty(qf.getConcatCandidates())
                && StringUtils.isNotEmpty(qf.getSourceFieldName())));
    }

    static isDuplicateJoin(joins, newJoin) {
        if (ServerUtils.isEmpty(joins)) return false;

        if (_.isNull(newJoin)) return false;

        let count = _.size(_.filter(joins, (join) => {
            return ((join.getTableName() === newJoin.getTableName())
                && (join.getTableAlias() === newJoin.getTableAlias())
                && (_(join.getJoinConditions()).differenceWith(newJoin.getJoinConditions(), _.isEqual).isEmpty()));
        }));

        return (count > 0);
    }

    static isDuplicateQueryField(queryFields, queryField) {

        if (ServerUtils.isEmpty(queryFields)) return false;

        if (_.isNull(queryField)) return false;

        let matchIndex = -1;

        _.forEach(queryFields, (qf, index, fields) => {
            if ((qf.getImportFieldName() === queryField.getImportFieldName())
                && (qf.getSourceFieldName() === queryField.getSourceFieldName())
                && (qf.getSourceAliasName() === queryField.getSourceAliasName())
                && (qf.getPkPrefix() === queryField.getPkPrefix())
                && (qf.getConcatValue() === queryField.getConcatValue())
                && (qf.getIsNewLineRequired() === queryField.getIsNewLineRequired()))
                matchIndex = index;
        });

        return matchIndex;
    }

    static isDuplicateCondition(conditions, newCondition) {

        if (ServerUtils.isEmpty(conditions)) return false;

        let count = _.size(_.filter(conditions, _.matches(newCondition)));

        return (count > 0);
    }

    // ? Deprecated version of fetching all non-relational conditions
    static getNonRelationalConditionsOld(conditionStr, sourceTableCount, targetTablesCount) {

        let conditions = ServerUtils.getValueAsArray(conditionStr, Constants.SEMI_COLON);

        return _.filter(conditions, (val) =>
            !this.isRelationshipCaseWhenCandidate(val, targetTablesCount, ProcessorUtil.getOperator(val, Constants.COPERANDS)))
            .join(Constants.SEMI_COLON);
    }

    static getNonRelationalConditions(conditionStr, sourceTableCount, targetTablesCount) {

        let conditions = ServerUtils.getValueAsArray(conditionStr, Constants.SEMI_COLON);

        return _.filter(conditions, (val) =>
            !(_.includes(val, Constants.SRC_COND_PH) || _.includes(val, Constants.TGT_COND_PH)))
            .join(Constants.SEMI_COLON);
    }

    static getOperator(condition, operands) {
        return _.find(operands, (typ) => _.includes(condition, typ));
    }

    static getNonRelationalCaseConditions(nonRelConditionStr) {

        let conditions = ServerUtils.getValueAsArray(nonRelConditionStr, Constants.SEMI_COLON);

        return _.filter(conditions, (val) => (_.includes(val, Constants.CW_ASSIGN_OPTR)))
            .join(Constants.SEMI_COLON);
    }

    static getFormattedConcatValue(concatValue) {

        if (StringUtils.isEmpty(concatValue)) return null;

        let formattedValue = StringUtils.remove(concatValue, Constants.DBL_QUOTE);

        if (!_.startsWith(formattedValue, Constants.SINGLE_QUOTE)) {
            formattedValue = StringUtils.concat(false, Constants.SINGLE_QUOTE,
                formattedValue, Constants.SINGLE_QUOTE);
        }

        return formattedValue;

    }

    // ? Case When & when
    static isMultipleWhen(condition) {
        let count = StringUtils.countChar(condition, Constants.CW_ASSIGN_OPTR);
        return (count > 1);
    }

    static getValidCWValue(value, elseValue, newLine) {
        if (value
            || StringUtils.isEmptyString(value)) {
            return value + newLine;
        }
        return elseValue + newLine;
    }

    static createIdxCondition(condType, field, operator, value, operand) {
        let parsedCond = StringUtils.concat(false, condType, Constants.OPEN_PARAN, value, Constants.COMMA);
        parsedCond = StringUtils.concat(false, parsedCond, Constants.SPACE, field, Constants.CLOSE_PARAN);
        parsedCond = StringUtils.concat(false, parsedCond, Constants.SPACE, operator, Constants.SPACE, operand);

        return parsedCond;
    }

    static createLenCondition(condType, field, operator, value, operand) {

        let lenCondition = StringUtils.concat(false, condType, Constants.OPEN_PARAN, field, Constants.CLOSE_PARAN);
        lenCondition = StringUtils.concat(false, lenCondition, Constants.SPACE, operator, Constants.SPACE, value);

        return lenCondition;
    }

    // ? Extract relationship case when conditions for source tables
    static extractSrcTblRelCondition(conditions, stc, ttc) {

        let conds = ServerUtils.getValueAsArray(conditions, Constants.SEMI_COLON);

        let result = _.chain(conds).map(cond => _.trim(cond)).value();

        // ? special case - case_to_case mapping
        if (stc === ttc && stc > 1) {
            result = _.filter(result, (itm, idx, itms) => _.includes(itm, Constants.SRC_COND_PH));
            return (_.size(result) == stc) ? result : [];
        }

        if (_.size(result) > stc) {
            result = _.filter(result, (itm, idx, itms) => _.includes(itm, Constants.SRC_COND_PH));
        }

        if (_.size(result) == stc) {
            if (_.size(result) != ttc) {
                return result;
            }
        }

        return [];
    }

    //Extract relationship case when conditions for target tables
    static extractTgtTblRelCondition(conditions, stc, ttc) {

        let conds = ServerUtils.getValueAsArray(conditions, Constants.SEMI_COLON);

        let result = _.chain(conds).map(cond => _.trim(cond)).value();

        // ? special case - case_to_case mapping
        if (stc === ttc && ttc > 1) {
            result = _.filter(result, (itm, idx, itms) => _.includes(itm, Constants.TGT_COND_PH));
            return (_.size(result) == ttc) ? result : [];
        }

        if (_.size(result) > ttc) {
            result = _.filter(result, (itm, idx, itms) => _.includes(itm, Constants.TGT_COND_PH));
        }

        if (_.size(result) == ttc) {
            if (_.size(result) != stc) {
                return result;
            }
        }

        return [];
    }

    static verifyAndSplitMapping(dtMapping, destTable, splitTables) {

        let dtMappings = new Array();

        let threshold = 2;

        let newDTMapping = null;

        let splitProperties = null;

        let mappingGroups = null;

        let mProps = ProcessorUtil.prepareMappingProperties(dtMapping.getMappingProperties());

        let isRelationMapping = (_.size(dtMapping.getMappingProperties()) < _.size(mProps));

        let isSplitTable = false;

        // if (!isRelationMapping) {

        //     _.forEach(splitTables, (st, idx, sts) => {
        //         let count = _.chain(_.split(st, "_")).filter(tp => _.size(_.trim(tp)) > 0)
        //             .map(tp => tp + "_").filter(tp => _.isEqual(tp, destTable)).size().value();
        //         if (count > 0) {
        //             isSplitTable = true;
        //             return false;
        //         }
        //     });
        // } else {

        //     _.forEach(splitTables, (st, idx, sts) => {
        //         let count = _.chain(dtMapping.getMappingProperties()).flatMap(prop => prop.destinationColumn.columns)
        //             .filter(name => _.includes(name, st)).size().value();
        //         if (count > 0) {
        //             isSplitTable = true;
        //             return false;
        //         }
        //     });
        // }

        //  if (!isSplitTable && !isRelationMapping) {
        mappingGroups = ProcessorUtil.getMappingGroups(dtMapping.getMappingProperties());
        if (_.size(mappingGroups) > 1) {
            isSplitTable = true;
        } else {
            isSplitTable = false;
        }
        //  }

        if (isSplitTable) {

            _.forEach(mappingGroups, (group, idx1, groups) => {
                newDTMapping = new DestinationTableMapping();
                newDTMapping.setMappingRank(dtMapping.getMappingRank() + idx1 + 1);
                newDTMapping.setDestinationTable(destTable);
                newDTMapping.setMappingProperties(group);
                dtMappings.push(newDTMapping);
            });


        } else {
            dtMappings.push(dtMapping);
        }

        return dtMappings;
    }

    static prepareMappingProperties(mappingProps) {

        let resultProps = new Array();

        _.forEach(mappingProps, (prop, idx, props) => {

            let cols = prop.getDestinationColumn().getColumns();

            if (_.size(cols) > 1) {

                _.forEach(cols, (col, idx, cols) => {

                    let newProp = _.cloneDeep(prop);
                    newProp.setMapping
                    let newCols = new Array();
                    newCols.push(col);
                    newProp.getDestinationColumn().setColumns(newCols);
                    resultProps.push(newProp);

                });

            } else {
                resultProps.push(prop);
            }

        });

        return resultProps;

    }

    //gc: groupcount, th: threshold
    //mz: mappingsize, cc: source column count
    static getMappingGroups(mappingProps) {

        //let value = (Math.round(1.00000 * 100)/100).toFixed(2)
        //let rth = 0.10;
        let rth = 0.1;
        var grpCnt = 1;
        var head = 0;
        var groups = new Array();
        var group = new Array();
        let precision = 0;

        _.forEach(mappingProps, (prop, idx, props) => {
            if (idx == 0) {
                precision = ServerUtils.getPrecision(prop.getPropertyRank());
                //rth = _.toInteger((Math.round(rth * 100)/100).toFixed(precision));
            }
            if (head == 0) {
                head = prop.getPropertyRank();
            } else if (_.ceil(head + rth, precision) == prop.getPropertyRank()) {
                grpCnt = grpCnt + 1;
                head = prop.getPropertyRank();
                groups.push(group);
                group = new Array();
            }

            group.push(prop);

            if (idx + 1 == _.size(props)) {
                groups.push(group);
                group = new Array();
            }

        });

        return groups;

    }

    static orderByRank(dtMappings) {

        return _.sortBy(dtMappings, 'mappingRank');

    }

    //table1: person, table2: name_lookup
    //condition: [victim] =[name]
    static getAliasedCondition(table1, table2, condition) {

        let operator = ProcessorUtil.getOperator(condition, Constants.COPERANDS);

        let tables = new Array();
        tables.push(table1);
        tables.push(table2);
        return _.split(condition, operator).map((pt, idx, pts) =>
            ProcessorUtil.getAlias(tables.get(idx)) + '.' + pt).join(operator);
    }

    static getRelationshipName(destTable) {

        return StringUtils.remove(_.startCase(destTable), Constants.SPACE);

    }
}

module.exports = ProcessorUtil;