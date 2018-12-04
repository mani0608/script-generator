var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var _ = require('lodash');

class Rank {
    constructor() {
        this.mappingRank = 0; 
        this.propRanks = new Array();
    }

    setMappingRank(rank) {
        this.mappingRank = rank;
    }

    getMappingRank() {
        return this.mappingRank;
    }

    setPropRanks(ranks) {
        this.propRanks = ranks;
    }

    getPropRanks() {
        return this.propRanks;
    }

    addPropRank(rank) {
        this.propRanks.push(rank);
    }

    addPropRanks(ranks) {
       this.propRanks = _.concat(this.propRanks, ranks);
    }
}

module.exports = Rank;