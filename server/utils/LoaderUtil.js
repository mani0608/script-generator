var Array = require('collections/shim-array');
require("collections/listen/array-changes");
var XLSX = require("xlsx");
var Map = require("collections/map");
var _ = require("lodash");
var Constants = require('../common/Constants');
var Columns = require('../common/Columns');
var ServerUtils = require('../utils/ServerUtils');
var StringUtils = require('../utils/StringUtils');
var Mappings = require('../models/loader/Mappings');
var SourceTable = require('../models/loader/SourceTable');
var DestinationTable = require('../models/loader/DestinationTable');
var Rank = require('../models/loader/Rank');
var SourceTableMapping = require('../models/loader/SourceTableMapping');
var DestinationTableMapping = require('../models/loader/DestinationTableMapping');
var MappingProperties = require('../models/loader/MappingProperties');
var DestinationColumns = require('../models/loader/DestinationColumns');

class LoaderUtil {

    constructor() {
        this.mappingData = new Mappings();
        this.hdrs = new Map();
        this.sourceTablesImported = new Array();
        this.jsonData = new Array();
    }

    readFile(mappingDataArray) {
        this.jsonData.addEach(mappingDataArray);
        this.init();
        this.load();
        return this.mappingData;
    }

    init() {

        this.readHeaderRow();

        this.readSourceTables();
    }

    readHeaderRow() {
        var hdrRow = this.jsonData.get(0);

        _.forEach(hdrRow, (col, index, row) => {
            this.hdrs.set(this.getFormattedValue(col), index);
        });

    }

    readSourceTables() {

        var records = _.takeRight(this.jsonData, _.size(this.jsonData) - 1);

        _.each(records, (record, rIndex, records) => {

            var stName = this.getCellValue(record, Columns.SOURCE_TABLE);

            let sTable;

            if (!ServerUtils.containsObjectValue(this.sourceTablesImported, 'name', stName)) {
                sTable = new SourceTable();
                sTable.setName(stName);
                sTable.addIndex(parseInt(rIndex + 1));
                sTable.setDestTableIndexes(new Array());
                this.sourceTablesImported.push(sTable);
            } else {
                sTable = _.find(this.sourceTablesImported, _.matchesProperty('nameComp', _.trim(_.toLower(stName))));
                sTable.getIndexes().push(parseInt(rIndex + 1));
            }

            if (!this.isPrimaryKeyRecord(record)) {
                let destTables = this.getDestTables(record);
                let ranks = this.segregateRanks(this.getCellValue(record, Columns.RANK));

                _.forEach(destTables, (dtName, dtIndex, tables) => {

                    let dtIndexes = sTable.getDestTableIndexes();

                    if (!ServerUtils.containsObjectValue(dtIndexes, 'name', dtName)) {
                        let destTable = new DestinationTable();
                        destTable.setName(dtName);
                        destTable.addIndex(parseInt(rIndex + 1));
                        destTable.setRank(ranks.get(0));
                        sTable.addDestTableIndex(destTable);
                    } else {
                        let destTable = _.find(sTable.getDestTableIndexes(), _.matchesProperty('nameComp', _.trim(_.toLower(dtName))));
                        destTable.getIndexes().push(parseInt(rIndex + 1));
                        destTable.getRank().addPropRanks(ranks.get(0).getPropRanks());
                    }

                });
            }

        });

    }

    segregateRanks(ranks) {
        var gth = 1;
        var mrnks = new Array();
        var prnks = new Array();
        var rank = null;
        var head = 0;

        _.forEach(_.split(ranks, ','), (rnk, idx, rnks) => {
            if (head == 0) {
                head = _.round(rnk);
            } else if (_.ceil(head + gth, 2) == _.round(rnk)) {
                rank = new Rank();
                rank.setMappingRank(head);
                rank.setPropRanks(prnks);
                mrnks.push(rank);
                prnks = new Array();
                head = _.round(rnk);
            } 

            prnks.push(_.toNumber(rnk));
            
            if (idx + 1 == _.size(rnks)) {
                rank = new Rank();
                rank.setMappingRank(head);
                rank.setPropRanks(prnks);
                mrnks.push(rank);
            } 
        });

        return mrnks;
    }

    load() {

        _.forEach(this.sourceTablesImported, (sTable, index, sTables) => {
            let stMapping = new SourceTableMapping();
            stMapping.setSourceTable(sTable.getName());

            _.forEach(sTable.getIndexes(), (stIndex, index, stIndexes) => {
                let record = this.jsonData.get(stIndex);

                if (this.isPrimaryKeyRecord(record)) {
                    stMapping.setPrimaryKeyCol(this.extractkey(this.getCellValue(record, Columns.SOURCE_COLUMN)));
                } else {
                    let dtMappings = new Array();

                    _.forEach(sTable.getSortedDestTableIndexes(), (dtIndexConfig, index, dtIndexConfigurations) => {
                        let dtMapping = new DestinationTableMapping();
                        let rank = dtIndexConfig.getRank();
                        dtMapping.setDestinationTable(dtIndexConfig.getName());
                        dtMapping.setMappingCount(_.size(dtIndexConfig.getIndexes()));
                        dtMapping.setMappingRank(rank.getMappingRank());

                        let mappingProps = new Array();
                        let propRanks = rank.getPropRanks();

                        _.forEach(dtIndexConfig.getIndexes(), (dtIndex, index, dtIndexes) => {
                            let dtRecord = this.jsonData.get(dtIndex);

                            if (this.isNonRelationalDestColumn(dtRecord)) {
                                _.forEach(this.getDestColumns(dtRecord), (dtColumn, cIdx, dtColumns) => {
                                    let mappingProp = new MappingProperties();
                                    mappingProp.setSourceColumn(this.getFormattedColumn(
                                        this.getCellValue(dtRecord, Columns.SOURCE_COLUMN)));
                                    mappingProp.setDestinationColumn(this.createDestinationColumn(dtColumn));
                                    mappingProp.setDestValue(this.getCellValue(dtRecord, Columns.DEST_VALUE));
                                    mappingProp.setJoinTable(this.getCellValue(dtRecord, Columns.JOIN_TABLE_COLUMN));
                                    mappingProp.setConditions(this.getCellValue(dtRecord, Columns.CONDITIONS));
                                    mappingProp.setPropertyRank(propRanks.get(index));
                                    mappingProp.setIsProcessed(false);
                                    mappingProps.push(mappingProp);
                                });
                            } else {
                                let mappingProp = new MappingProperties();
                                mappingProp.setSourceColumn(this.getFormattedColumn(
                                    this.getCellValue(dtRecord, Columns.SOURCE_COLUMN)));
                                mappingProp.setDestinationColumn(this.createDestinationColumn(
                                    this.getCellValue(dtRecord, Columns.DEST_COLUMN)));
                                mappingProp.setDestValue(this.getCellValue(dtRecord, Columns.DEST_VALUE));
                                mappingProp.setJoinTable(this.getCellValue(dtRecord, Columns.JOIN_TABLE_COLUMN));
                                mappingProp.setConditions(this.getCellValue(dtRecord, Columns.CONDITIONS));
                                mappingProp.setPropertyRank(propRanks.get(index));
                                mappingProp.setIsProcessed(false);
                                mappingProps.push(mappingProp);
                            }

                        });

                        dtMapping.setMappingProperties(mappingProps);
                        dtMappings.push(dtMapping);

                    });

                    stMapping.setDestinationTableMappings(dtMappings);
                }

            });

            this.mappingData.addMapping(stMapping);

        });

    }

    getFormattedValue(val) {

        var result = StringUtils.replace(val, Constants.SPACE, Constants.EMPTY);

        return _.trim(result);

    }

    getCellValue(record, colName) {
        let value = record.get(this.hdrs.get(colName));
        value = StringUtils.remove(value, Constants.SINGLE_QUOTE);
        value = StringUtils.remove(value, Constants.DBL_QUOTE);
        return value;
    }

    isPrimaryKeyRecord(record) {

        var value = this.getCellValue(record, Columns.SOURCE_COLUMN);

        return (_.includes(value, Constants.KEY_PH));
    }

    getDestTables(record) {
        var destTableContent = this.getCellValue(record, Columns.DEST_TABLE);
        let destTables = ServerUtils.getValueAsArray(destTableContent, Constants.COMMA);

        return _.map(destTables, (dTable, idx, dTables) => {
            if (!_.endsWith(dTable, '_')) {
                return dTable + Constants.UNDERSCORE;
            } else {
                return dTable;
            }
        });
    }

    getDestColumns(record) {
        var destColumnContent = this.getCellValue(record, Columns.DEST_COLUMN);

        return ServerUtils.getValueAsArray(destColumnContent, Constants.COMMA);
    }

    getFormattedColumn(value) {
        let result = [];
        if (!_.startsWith(value, Constants.SBRACKET)) {
            result.push(Constants.SBRACKET);
        }

        result.push(value);

        if (!_.endsWith(value, Constants.EBRACKET)) {
            result.push(Constants.EBRACKET);
        }

        return result.join(Constants.EMPTY);

    }

    extractkey(value) {
        let key = StringUtils.replace(value, Constants.KEY_PH, Constants.EMPTY);

        return this.getFormattedColumn(_.trim(key));
    }

    isNonRelationalDestColumn(dtRecord) {
        let destColumns = this.getCellValue(dtRecord, Columns.DEST_COLUMN);
        if (ServerUtils.hasMultiple(destColumns)) {
            if (!_.includes(destColumns, Columns.SRC_TBL_PFX)
                && !_.includes(destColumns, Columns.DEST_TBL_PFX)) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    createDestinationColumn(dtColumns) {
        let destinationColumns = new DestinationColumns();
        let dtColumnsArray = ServerUtils.getValueAsArray(dtColumns, Constants.COMMA);

        _.forEach(dtColumnsArray, (column, index, columns) => {
            if (!_.endsWith(column, Constants.UNDERSCORE)) {
                column = column + Constants.UNDERSCORE;
            }
            destinationColumns.getColumns().push(column);
        });

        return destinationColumns;
    }

}

module.exports = LoaderUtil;