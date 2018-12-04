var ExecutionData = require('../models/ExecutionData');
var CacheManager = require('../CacheManager');
var SQLModelService = require('./SQLModelService');
var CacheConstants = require('../common/CacheConstants');
var _ = require('lodash');

class ProcessorService {
    constructor() {
        this.executionData = null;
        this.cacheManager = new CacheManager();
        this.sqlModelService = new SQLModelService();
    }

    process() {

        this.getDataFromCache();
        this.sqlModelService.setExecutionData(this.executionData);
        _.forEach(this.executionData.getMappings().getMappingData(),
            (mappingData, index, allMappingData) => {
                this.sqlModelService.createSQL(mappingData, index);
            });
        
        this.updateDataInCache();
    }

    getDataFromCache() {

        this.executionData = this.cacheManager.getCache(CacheConstants.EXECUTION_DATA);
    }

    updateDataInCache() {
        this.cacheManager.addCache(CacheConstants.EXECUTION_DATA, this.executionData);
    }
}

module.exports = ProcessorService;