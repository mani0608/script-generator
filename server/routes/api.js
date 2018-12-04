const express = require('express');
const router = express.Router();
const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));
const winston = require('winston');
const _ = require('lodash');
const ExecutorService = require('../service/ExecutorService');
var FileReader = require('filereader');
var XLSX = require('xlsx');

var db = new PouchDB("queries");

db.createIndex({
    index: {
        fields: ['_id'],
        ddoc: "ids-design-doc"
    }
}).then((result) => {
    winston.info('Created index for ids successfully');
}).catch((error) => {
    winston.error('Error while creating index for ids ', error);
});

db.createIndex({
    index: {
        fields: ['name', 'version', 'sourceTable'],
        ddoc: "search-design-doc"
    }
}).then((result) => {
    winston.info('Created index for name & version successfully');
}).catch((error) => {
    winston.error('Error while creating index for name & version ', error);
});


let countIndex = {
    _id: '_design/count_index',
    views: {
        'count_index': {
            map: function (doc) {
                emit([doc.name, doc.version], { version: doc.version });
            }.toString(),
            reduce: '_count'
        }
    }
};

db.put(countIndex).then((result) => {
    winston.info('Created index for counting import versions');
}).catch((error) => {
    winston.error('Error while creating index for counting import versions', error);
});

router.post('/process', (req, res, next) => {

    var fileObj = req.files.jsonFile.data;
    var isn = req.body.isn;
    var suffix = _.toLower(_(req.files.file.name).split('.').initial().join('.'));
    var splitData = _.split(suffix, '_');
    var importName = splitData[0];
    var importVersion = splitData[1];
    var file = JSON.parse(fileObj);

    var service = new ExecutorService();
    var sqlQuery = service.execute(file, isn);
    var sqlSourceTableQueries = sqlQuery.getQueries();
    var isError = false;

    _.forEach(sqlSourceTableQueries, (stQuery, index, stQueries) => {

        let doc = {
            _id: stQuery.getSourceTableName() + '_' + suffix,
            name: importName,
            version: importVersion,
            importSchema: isn,
            sourceTable: stQuery.getSourceTableName(),
            destTableQueries: stQuery.getQueries()
        };

        db.get(doc._id).then((dbDoc) => {
            doc._rev = dbDoc._rev;
            return db.put(doc).then((response) => {
                winston.info("Data for source table " + stQuery.getSourceTableName() + " added successfully");
            }).catch((error) => {
                winston.error("Error while adding data for source table " + stQuery.getSourceTableName());
                winston.error(error);
                isError = true;
                return false;
            });
        }).then((response) => {
            winston.info("Update data for source table: " + stQuery.getSourceTableName());
        }).catch((error) => {
            winston.info("Document doesn't exist. Hence adding");
            return db.put(doc).then((response) => {
                winston.info("Data for source table " + stQuery.getSourceTableName() + " added successfully");
            }).catch((error) => {
                winston.error("Error while adding data for source table " + stQuery.getSourceTableName());
                winston.error(error);
                isError = true;
                return false;
            });
        });
    });

    if (isError) {
        res.json({
            result: {
                name: importName,
                version: importVersion,
                message: 'error'
            }
        });
    } else {
        res.json({
            result: {
                name: importName,
                version: importVersion,
                message: 'success'
            }
        });
    }

});

router.post('/processqb', (req, res, next) => {

    var fileObj = req.files.jsonFile.data;
    var isn = req.body.isn;
    var suffix = _.toLower(_(req.files.file.name).split('.').initial().join('.'));
    var splitData = _.split(suffix, '_');
    var importName = splitData[0];
    var importVersion = splitData[1];
    var file = JSON.parse(fileObj);

    var service = new ExecutorService();
    var stQueries = service.executeStart(file);

    res.json({
        result: {
            name: importName,
            version: importVersion,
            message: 'success',
            data: JSON.stringify(stQueries)
        }
    });


});

router.get('/ctypes', (req, res, next) => {

    var service = new ExecutorService();

    res.json({
        wcTypes: service.getWhereConditionTypes(),
        jTypes: service.getJoinTypes(),
        jcOperands: service.getJoinConditionOperands(),
        operands: service.getOtherConditionOperands(),
        icTypes: service.getICTypes(),
        icOperators: service.getICOperators(),
        valTypes: service.getValTypes()
    });

});

router.get('/loadAll', (req, res, next) => {

    db.find({
        selector: {
            _id: { '$gt': null },
            name: { '$exists': true },
            version: { '$exists': true }
        },
        // use_index: 'search-design-doc'
    }).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error('Error while fetching all docs ', error);
    });

});

router.get('/load/:id', (req, res, next) => {

    var id = req.params.id;

    db.get(id).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error("Error while fetching documents with id: " + id);
    });

});

router.post('/save', (req, res, next) => {

    let doc = req.body;

    db.get(doc._id).then((dbDoc) => {
        doc._rev = dbDoc._rev;
        db.put(doc).then((response) => {
            winston.info("Data for source table " + doc.sourceTable + " udpated successfully");
        }).catch((error) => {
            winston.error("Error while updating data for source table " + doc.sourceTable, error);
        });
    });

    res.json({ result: 'success' });

});

router.get('/ids', (req, res, next) => {

    db.find({
        selector: {
            _id: { '$gt': null }
        },
        fields: ['_id'],
        use_index: 'ids-design-doc'
    }).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error('error while fetching ids ', error);
    });

});

router.get('/options', (req, res, next) => {

    db.find({
        selector: {
            name: { '$gt': null },
            version: { '$gt': null }
        },
        fields: ['name', 'version'],
        use_index: 'search-design-doc'
    }).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error('error while fetching options ', error);
    });

});

router.get('/search/:name/:ver', (req, res, next) => {

    var importName = req.params.name;
    var importVersion = req.params.ver;

    db.find({
        selector: {
            name: importName,
            version: importVersion
        },
        use_index: 'search-design-doc'
    }).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error('Error during search ', error);
    });

});

router.get('/tcd/:name/:ver/:stname', (req, res, next) => {

    var importName = req.params.name;
    var importVersion = req.params.ver;
    var sourceTableName = req.params.stname;

    db.find({
        selector: {
            name: importName,
            version: importVersion,
            sourceTable: sourceTableName
        },
        use_index: 'search-design-doc'
    }).then((response) => {
        res.json(response);
    }).catch((error) => {
        winston.error('Error during search ', error);
    });

});

router.get('/count', (req, res, next) => {

    /* db.allDocs().then((response) => {
        res.json({ count: response.rows.length });
    }).catch((error) => {
        winston.error('Error while fetching document count ', error);
    }); */

    db.query('count_index', {
        group: true
    }).then((response) => {
        res.json({ count:response.rows.length});
    }).catch(function (error) {
        winston.error('Error while fetching version count for destination table ' + iname, error);
    });

});

router.get('/versions/:iname', (req, res, next) => {

    var iname = req.params.iname;

    db.find({
        selector: {
            name: { '$eq': iname },
            version: { '$gt': null }
        },
        fields: ['version'],
        use_index: 'search-design-doc'
    }).then((response) => {
        res.json(_(response.docs).uniqBy('version').map(obj => obj.version).value());
    }).catch((error) => {
        winston.error('error while fetching options ', error);
    });

});

router.get('/vc/:iname', (req, res, next) => {

    var iname = req.params.iname;

    db.query('count_index', {
        startkey: [iname],
        endkey: [iname, {}],
        group: true
    }).then((response) => {
        res.json({ count:response.rows.length});
    }).catch(function (error) {
        winston.error('Error while fetching version count for destination table ' + iname, error);
    });

});

module.exports = router;