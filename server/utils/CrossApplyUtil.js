var Constants = require('../common/Constants');
var Columns = require('../common/Columns');
var StringUtils = require('../utils/StringUtils');
var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var _ = require('lodash');


class CrossApplyUtil {

    constructor() { }

    static createCrossApply(queryFields) {

        let crossApplyFields = this.getCrossApplyMappingFields(queryFields);

        this.updateProcessedFlag(queryFields, crossApplyFields);

        let crossApplyAliases = StringUtils.concat(false, Constants.NEWLINE_CHAR, Constants.CROSS_APPLY_ALIAS, Constants.OPEN_PARAN);

        let selectFields = new Array();

        let crossApplyQuery = StringUtils.concat(false, Constants.CROSS_APPLY_PREFIX, Constants.NEWLINE_CHAR);

        if (_.size(crossApplyFields) > 0) {

            _(crossApplyFields).forEach((field, index, fields) => {

                if (index > 0) {
                    crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.COMMA, Constants.NEWLINE_CHAR);
                }

                crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.OPEN_PARAN);

                let values = _.get(field, "cv");

                _.forEach(values, (value, index, values) => {

                    if (index > 0) crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.COMMA);

                    let convertValue = Constants.convertBoolStrToBit(value);

                    if (_.isNumber(convertValue)) {
                        crossApplyQuery = StringUtils.concat(false, crossApplyQuery, convertValue);
                    } else if (StringUtils.isNotEmpty(convertValue)) {
                        crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.SINGLE_QUOTE, convertValue, Constants.SINGLE_QUOTE);
                    } else if (StringUtils.isEmpty(convertValue)) {
                        crossApplyQuery = StringUtils.concat(false, crossApplyQuery, _.get(field, "sfn"));
                    }

                });

                crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.CLOSE_PARAN);

            });

            crossApplyQuery = StringUtils.concat(false, crossApplyQuery, Constants.CLOSE_PARAN, Constants.SPACE);

            let values = _.get(crossApplyFields.get(0), "ifn");

            _.forEach(values, (value, index, values) => {

                if (index > 0) {
                    crossApplyAliases = StringUtils.concat(false, crossApplyAliases, Constants.COMMA);
                }

                crossApplyAliases = StringUtils.concat(false, crossApplyAliases, this.getFormattedAlias(value));
                selectFields.push(StringUtils.concat(false, _.trim(Constants.CROSS_APPLY_ALIAS), Constants.PERIOD,
                    Constants.SBRACKET, this.getFormattedAlias(value), Constants.EBRACKET));

            });

            crossApplyAliases = StringUtils.concat(false, crossApplyAliases, Constants.CLOSE_PARAN);

            crossApplyQuery = StringUtils.concat(false, crossApplyQuery, crossApplyAliases);

            return {
                query: crossApplyQuery,
                sFields: selectFields
            }

        } else {
            return {
                query: Constants.EMPTY,
                sFields: new Array()
            } 
        }

    }

    static getFormattedAlias(value) {
        let formattedValue = StringUtils.remove(value, Constants.UNDERSCORE);
        return StringUtils.concat(false, _.trim(Constants.CROSS_APPLY_ALIAS), _.toUpper(formattedValue));

    }

    static getCrossApplyMappingFields(queryFields) {

        let eligibleFields = _.takeRight(queryFields, _.size(queryFields) - 2);

        return _(eligibleFields).uniqWith(_.isEqual).sortBy("sourceFieldName").groupBy("sourceFieldName")
            .values().map(
                (group) => {
                    return {
                        sfn: _.get(group[0], "sourceFieldName"),
                        ifn: _.map(group, "importFieldName"),
                        cv: _.map(group, "concatValue"),
                        idxs: _.map(group, "fieldIndex"),
                        qty: group.length
                    }
                }
            ).filter(obj => obj.qty > 1)
            .filter(obj => _.every(obj.ifn, (name) => (!_.includes(name, Columns.SRC_TBL_PFX)
                        && !_.includes(name, Columns.DEST_TBL_PFX))))
            .filter(obj => _.size(obj.cv) === 3 && _.some(obj.cv, (ele, index, eles) => ele !== null))
            .filter(obj => _.size(obj.ifn) === 3).value();
    }

    static updateProcessedFlag(queryFields, crossApplyFields) {

        let fieldIndexes = _.flatMapDeep(crossApplyFields, (obj, index, objs) => obj.idxs);

        _.forEach(fieldIndexes, (fieldIndex, index, fieldIndexes) => {
            let field = queryFields.get(fieldIndex);
            field.setIsProcessed(true);
        });
    }

}

module.exports = CrossApplyUtil;