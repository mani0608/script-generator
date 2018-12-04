var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class ImportTableQuery {
    constructor() {
        this.importTableName = null;
        this.itqInstances = new Array();
    }

    setImportTableName(name) { this.importTableName = name; }

    getImportTableName() { return this.importTableName; }

    setITQInstances(instances) { this.itqInstances = instances; }

    getITQInstances() { return this.itqInstances; }

    addITQInstance(instance) {
        this.getITQInstances().push(instance);
    }

    getITQInstanceAtIndex(index) {
        this.getITQInstances.get(index);
    }

}

module.exports = ImportTableQuery;