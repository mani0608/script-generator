var ExecutionData = require('../models/ExecutionData');
var CacheManager = require('../CacheManager');
var NodeSQLService = require('./NodeSQLService');
var CacheConstants = require('../common/CacheConstants');
var _ = require('lodash');

class FinisherService {
    constructor(){
        this.executionData = null;
        this.cacheManager = new CacheManager();
        this.sqlService = new NodeSQLService();
    }

    finish(importSchemaName) {
        this.getDataFromCache();
        this.sqlService.setSchemaName(importSchemaName);
        _.forEach(this.executionData.getQueries(), (query, index, queries) => {
            this.executionData.getSqlQuery().addQuery(this.sqlService.generateScript(query, index));
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

module.exports = FinisherService;