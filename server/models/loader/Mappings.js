var Array = require('collections/shim-array');
require("collections/listen/array-changes");

class Mappings {

    constructor() {
        this.mappingData = new Array();
    }

    setMappingData(data) {
        this.mappingData = data;
    }

    getMappingData() {
        return this.mappingData;
    }

    addMapping(mapping) {
        this.mappingData.push(mapping);
    }

}

module.exports = Mappings;