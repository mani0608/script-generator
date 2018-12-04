var _ = require('lodash');
var Constants = require('../common/Constants');
var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class ServerUtils {

    static contains(objects, value) {
        var isFound = false;
        _.forEach(objects, (object, index, objects) => {
            if (_.isEqual(object, value)) isFound = true;
        });

        return isFound;
    }

    static containsObjectValue(objects, propertyName, propertyValue) {

        var compPropertyName = propertyName + Constants.COMP_PFX;

        propertyValue = _.trim(_.toLower(propertyValue));

        var count = _.size(_.find(objects, _.matchesProperty(compPropertyName, propertyValue)));

        return (count > 0);
    }

    static getValueAsArray(value, splitChar, sorted) {
        var valArr = _.map(_.split(value, splitChar), (tbl) => {
            return _.trim(tbl);
        });

        if (!sorted) {
            return valArr;
        }

        return _.sortBy(valArr, [(o) => {
            return o;
        }]);
    }

    static getValueAsIntArray(value, splitChar) {
        var valArr = _.map(_.split(value, splitChar), (val) => {
            return _.toNumber(_.trim(val));
        });

        return _.sortBy(valArr, [(o) => {
            return o;
        }]);
    }

    static getValueAt(str, index) {
        let valueArr = this.getValueAsArray(str, Constants.COMMA);
        return valueArr[index];
    }

    static hasMultiple(dtColumns) {
        var count = _.countBy(dtColumns)[Constants.COMMA] || 0;
        return (count > 0);
    }

    static getCharBeforeEach(param, searchChar) {

        let builder = [];

        let splitString = new Array();

        splitString.addEach(_.split(param, searchChar));

        _.remove(splitString, (value, index, values) => {
            return (index == 0);
        });

        _.forEach(splitString, token => {
            builder.push(token.substring(0, 1));
        });

        return builder.join('');

    }

    static extractStringBefore(sourceString, matchChar) {

        if (_.includes(sourceString, matchChar)) {

            let startIndex = sourceString.indexOf(matchChar);

            startIndex = (!_.startsWith(matchChar, Constants.SPACE)) ? startIndex - 1 : startIndex;

            return sourceString.substring(0, startIndex);
        }

        return sourceString;
    }

    static extractStringAfter(sourceString, matchChar) {

        if (_.includes(sourceString, matchChar)) {

            let startIndex = sourceString.indexOf(matchChar) + matchChar.length;

            return sourceString.substring(startIndex);
        }

        return sourceString;

    }

    static extractStringBetween(condition, matchStartChar, matchEndChar, boundaryInclusive) {


        if (!_.includes(condition, matchStartChar) || !_.includes(condition, matchStartChar)) {
            return condition;
        }

        startIndex = condition.indexOf(matchStartChar) + matchStartChar.length;

        if (boundaryInclusive) startIndex = startIndex - 1;

        endIndex = condition.indexOf(matchEndChar);

        endIndex = (!_.startsWith(matchEndChar, Constants.SPACE)) ? endIndex - 1 : endIndex;

        if (boundaryInclusive) endIndex = endIndex + 1;

        let result = condition.substring(startIndex, endIndex);

        //result = StringUtils.remove(result, Constants.DBL_QUOTE);

        return _.trim(result);

    }

    static isNotEmpty(list) {

        return (list != null && _.size(list) > 0);

    }

    static isEmpty(list) {
        return (list == null || _.size(list) == 0);
    }

    static getPrecision(rank) {

        let e = 1, p = 0;

        while (Math.round(rank * e) / e !== rank) {
            rank *= 10; p++;
        }

        return p;

    }

}

module.exports = ServerUtils;