var LoaderService = require('./LoaderService');
var ProcessorService = require('./ProcessorService');
var FinisherService = require('./FinisherService');
var CacheManager = require('../CacheManager');
const winston = require('winston');
var Constants = require('../common/Constants');

class ExecutorService {

    constructor() {
        this.loader = new LoaderService();
        this.processor = new ProcessorService();
        this.finisher = new FinisherService();
        this.cacheManager = new CacheManager();
    }

    execute (mappingDataArray, importSchemaName) {

        winston.info('Loader started at: ' + new Date());
        this.loader.load(mappingDataArray);
        winston.info('Loader completed at: ' + new Date());

        winston.info('Processor started at: ' + new Date());
        this.processor.process();
        winston.info('Processor completed at: ' + new Date());

        winston.info('Finisher started at: ' + new Date());
        this.finisher.finish(importSchemaName);
        winston.info('Finisher completed at: ' + new Date());

        return this.getResultFromCache();
    }

    executeStart (mappingDataArray) {

        winston.info('Loader started at: ' + new Date());
        this.loader.load(mappingDataArray);
        winston.info('Loader completed at: ' + new Date());

        winston.info('Processor started at: ' + new Date());
        this.processor.process();
        winston.info('Processor completed at: ' + new Date());

        return this.getResultsForReview();
    }

    executeComplete(mappingDataArray) {

        winston.info('Finisher started at: ' + new Date());
        this.finisher.finish();
        winston.info('Finisher completed at: ' + new Date());

        return this.getResultFromCache();

    }

    getOtherConditionOperands() {
        return Constants.COPERANDS;
    }

    getWhereConditionTypes() {
        return Constants.CTYPES;
    }

    getJoinTypes() {
        return Constants.JTYPES;
    }

    getValTypes() {
        return Constants.VALTYPES;
    }

    getICOperators() {
        return Constants.ICOPERANDS;
    }

    getICTypes() {
        return Constants.ICTYPES;
    }

    getJoinConditionOperands() {
        return Constants.JCOPERANDS;
    }

    getResultFromCache() {
       return this.cacheManager.getCache('executionData').getSqlQuery();
    }

    getResultsForReview() {
        return this.cacheManager.getCache('executionData').getQueries();
    }

}

module.exports = ExecutorService;