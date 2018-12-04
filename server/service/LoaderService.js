var CacheManager = require('../CacheManager');
var ExecutionData = require('../models/ExecutionData');
var LoaderUtil = require('../utils/LoaderUtil');
var CacheConstants = require('../common/CacheConstants');

class LoaderService {
    
    constructor(){
        this.cacheManager = new CacheManager();
        this.executionData = new ExecutionData();
        this.loaderUtil = new LoaderUtil();
    }

    load(mappingJsonArray) {
        let mappings = this.loaderUtil.readFile(mappingJsonArray);
        this.executionData.setMappings(mappings);
        this.cacheManager.addCache(CacheConstants.EXECUTION_DATA, this.executionData);
    }

}

module.exports = LoaderService;