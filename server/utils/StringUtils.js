var Constants = require('../common/Constants');
var _ = require('lodash');

class StringUtils {

    static indexOf(str, searchStr, start) {

        if (this.isEmpty(str) || this.isEmpty(searchStr)) return -1;

        return str.indexOf(searchStr, start);

    }

    static split(str, splitChar) {

        if (this.isEmpty(str) || this.isEmpty(splitChar)) return [];

        return str.split(splitChar);

    }

    static remove(str, remove) {

        return StringUtils.replace(str, remove, Constants.EMPTY);

    }

    static removeStart (str, remove) {

        if (this.isEmpty(str) || this.isEmpty(remove)) return str;

        if (str.startsWith(remove)) return str.substring(remove.length);

        return str;
    }

    static removeEnd (str, remove) {

        if (this.isEmpty(str) || this.isEmpty(remove)) return str;

        if (str.endsWith(remove)) return str.substring(0, str.length - remove.length);

        return str;
    }

    static isNotEmpty(stringParam) {

        if (!stringParam) return false;

        if (_.size(_.trim(stringParam)) == 0) return false;

        return true;

    }

    static isNotBlank(stringParam) {

        if (!stringParam) return false;

        if (stringParam.length == 0) return false;

        return true;

    }

    static isNull (stringParam) {
        return (stringParam == null);
    }

    static isNotNull(stringParam) {
        return (stringParam != null);
    }

    static isEmpty(stringParam) {

        if (!stringParam) return true;

        if (_.size(_.trim(stringParam)) == 0) return true;

        return false;

    }

    static isBlank(stringParam) {

        if (!stringParam) return true;

        if (stringParam.length == 0) return true;

        return false;

    }

    //True: '', ' '
    static isEmptyString(stringParam) {

        if (!stringParam) return false;

        if (_.size(_.trim(stringParam)) == 0) return true;

        return false;

    }

    static left (str, len) {

        if (!str) return null;

        if (len < 0) return Constants.EMPTY;

        if (str.length <= len) return str;

        return str.substring(0, len);

    }

    static right (str, len) {

        if (!str) return null;

        if (len < 0) return Constants.EMPTY;

        if (str.length <= len) return str;

        return str.substring(str.length - len);

    }

    static mid(str, pos, len) {

        if (!str) return null;
        
        if (len < 0 || pos > str.length) return Constants.EMPTY;
        
        if (pos < 0) pos = 0;
        
        if (str.length <= pos + len) {
            return str.substring(pos);
        }
        return str.substring(pos, pos + len);
    }

    
    static replace(str, searchStr, replace) {

        if (this.isBlank(str) || this.isBlank(searchStr) || this.isNull(replace)) return str;

        var regExp = new RegExp(_.escapeRegExp(searchStr), "g");

        return _.trim(_.replace(str, regExp, replace));
    }

    static concat (isSpaceReq, ...values) {

        let result = Constants.EMPTY;

        if (values.length == 0) return Constants.EMPTY;

        _.each(values, (val, index, vals) => {
            if (index > 0 && isSpaceReq) result = result + Constants.SPACE;
            result = result + val;
        });

        return result;

    }

    static countChar(str, char) {

        return _.countBy(str)[char] || 0;

    }

    static emptyIfNull (str) {

        if (_.isNull(str)) return Constants.EMPTY;

    }

}

module.exports = StringUtils;