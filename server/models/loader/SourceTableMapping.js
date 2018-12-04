var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var Util = require('../../utils/ServerUtils');
var _ = require('lodash');

class SourceTableMapping {

    constructor() {
        this.sourceTable = null;
        this.primaryKeyCol = null;
        this.destinationTableMappings = null;
    }

    setSourceTable(table) {
        this.sourceTable = table;
    }

    getSourceTable() {
        return this.sourceTable;
    }

    setPrimaryKeyCol(column) {
        this.primaryKeyCol = column;
    }

    getPrimaryKeyCol() {
        return this.primaryKeyCol;
    }

    setDestinationTableMappings(mappings) {
        this.destinationTableMappings = mappings;
    }

    getDestinationTableMappings() {
        return this.destinationTableMappings;
    }
    
    addDestTableMapping(dtMapping) {
        if (Util.contains(this.dest)) {
            var destinationTableMapping = null;
            _.each(this.destinationTableMappings, (mapping, index, mappings) => {
                if (_.isEqual(mapping, dtmapping)) destinationTableMapping = mapping;
            });

            destinationTableMapping.getMappingProperties().addEach(dtMapping.getMappingProperties());
        } else{
            destinationTableMapping.push(dtMapping);
        }
    }

}

module.exports = SourceTableMapping;