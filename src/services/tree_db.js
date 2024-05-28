import { enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { Alert } from 'react-native';
import { Strings } from './Strings';
import { Constants } from './Utils';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const treeTableName = 'tree'; //for local trees
const treetypeName = 'treetype';
const plotName = 'plot';
const previousShiftTableName = 'previousShifts'; //live shift
const saplingsInLiveShifts = 'saplingsInLiveShifts' //live saplings in shift table
const saplingsInLocalShifts = 'saplingsInLocalShifts'
const users = 'users';
const saplingsTableName = 'saplings'; //for live trees
const localShiftTable = 'localShifts'; //local shift

enablePromise(true);

export class LocalDatabase {
    db = null;
    constructor() {
        this.getDBConnection();
    }
    getDBConnection = async () => {
        if (!this.db) {
            this.db = await openDatabase({ name: 'tree.db', location: 'default' });
        }
        return this.db;
    };

    deleteTable = async () => {
        const query = `drop table ${treeTableName}`;
        await this.db.executeSql(query);

    };

    // add lat lng later !!!!!!!!!!!!!!!!!!!!!!!!!!!!

    createTreesTable = async () => {
        try {
            //create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS ${treeTableName}(
            treeid TEXT NOT NULL,
            saplingid TEXT NOT NULL PRIMARY KEY,
            lat TEXT,
            lng TEXT,
            plotid TEXT NOT NULL,
            uploaded INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );`;


            // multiple images for a sapling

            const query2 = `CREATE TABLE IF NOT EXISTS sapling_images(
            saplingid TEXT NOT NULL,
            image TEXT NOT NULL,
            imageid TEXT NOT NULL PRIMARY KEY,
            remark TEXT,
            timestamp TEXT NOT NULL,
            Foreign Key (saplingid) references ${treeTableName}(saplingid)
        );`;

            //id represents shifts no on local db.
            const query3 = `
            CREATE TABLE IF NOT EXISTS ${localShiftTable} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shift_id TEXT,
                shifttype TEXT,
                user_id TEXT NOT NULL,
                shiftended INTEGER NOT NULL,
                shiftuploadcomplete INTEGER NOT NULL,
                plotselected TEXT NOT NULL,
                starttime TEXT NOT NULL,
                endtime TEXT NOT NULL,
                timetaken TEXT NOT NULL,
                treesplanted TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )`

            await this.db.executeSql(query);
            await this.db.executeSql(query2);
            await this.db.executeSql(query3);
            console.log('Shift table created successfully---------');
        } catch (error) {
            console.log("error creating trees table---", error);
        }
    };

    //Shift table
    createShiftTblLive = async () => {
        try {
            console.log('------------setting live shifts---------');
            const shiftTableQuery = `
            CREATE TABLE IF NOT EXISTS ${previousShiftTableName} (
                shift_id TEXT NOT NULL PRIMARY KEY,
                shifttype TEXT,
                user_id TEXT NOT NULL,
                plotselected TEXT NOT NULL,
                starttime TEXT NOT NULL,
                endtime TEXT NOT NULL,
                timetaken TEXT NOT NULL,
                treesplanted TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                shiftended INTEGER NOT NULL,
                shiftuploadcomplete INTEGER NOT NULL      
               )`;


            const saplingsInLiveShiftTable = `CREATE TABLE IF NOT EXISTS ${saplingsInLiveShifts} (
        shiftID TEXT NOT NULL,
        sapling_id TEXT PRIMARY KEY, 
        sequence_no TEXT,
        uploaded BOOLEAN,
        FOREIGN KEY (shiftID) REFERENCES ${previousShiftTableName} (shift_id)
    );`

            const saplingsInLocalShiftTable = `CREATE TABLE IF NOT EXISTS ${saplingsInLocalShifts} (
        shiftID TEXT ,
        sapling_id TEXT PRIMARY KEY,
        sequence_no TEXT,
        uploaded BOOLEAN,
        FOREIGN KEY (shiftID) REFERENCES ${localShiftTable} (id)
    );`

            await this.db.executeSql(shiftTableQuery);
            await this.db.executeSql(saplingsInLiveShiftTable);
            await this.db.executeSql(saplingsInLocalShiftTable);
        } catch (error) {
            console.log("error creating live shift table  table---", error);
        }


    };

    createLogsTable = async () => {

        try {
            const query = `
                CREATE TABLE IF NOT EXISTS logs_table(
                    userid TEXT,
                    deviceinfo TEXT,
                    phoneinfo TEXT,
                    logs TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            `;
            await this.db.executeSql(query);
            console.log('Logs table created successfully---------');
        } catch (error) {
            console.error('Error creating logs table:', error);
        }
    };

    //Manjur
    logExceptionLocalDB = async (logs) => {
        try {
            const phoneinfo = await DeviceInfo.getPhoneNumber() || await AsyncStorage.getItem(Constants.phoneNumber);
            const deviceManufacter = await DeviceInfo.getManufacturer();
            const deviceName = await DeviceInfo.getDeviceName();
            const deviceinfo = deviceManufacter + "" + deviceName;
            const timestamp = new Date().toISOString();
            const userid = await AsyncStorage.getItem(Constants.userIdKey);
            // console.log("inserting  logs to local db------------");
            // console.log("phone no: ", phoneinfo, " deviceinfo: ", deviceinfo, "user_id: ", userid);
            // console.log("logs got: ", logs);

            // Check if the log already exists in the local database
            const [results] = await this.db.executeSql(`
            SELECT * FROM logs_table 
            WHERE deviceinfo = ? AND phoneinfo = ? AND logs = ?`,
                [deviceinfo, phoneinfo, logs]
            );

            const existingLogs = results.rows.raw();

            console.log("existing duplicate logs: ", existingLogs);
            // If the log already exists, log a message and skip insertion
            if (existingLogs.length > 0) {
                console.log("Log already exists, skipping insertion");
                return;
            }

            const query = `
        INSERT INTO logs_table (userid, deviceinfo, phoneinfo, logs, timestamp) 
        VALUES (?, ?, ?, ?, ?)`;

            await this.db.executeSql(query, [userid, deviceinfo, phoneinfo, logs, timestamp]);

        } catch (error) {
            console.error("error inserting logs to log_table", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to insert logs into db(inside tree_tb(logExceptionLocalDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getAllLogs = async () => {
        try {
            const query = `SELECT * FROM logs_table`;
            const [results] = await this.db.executeSql(query);
            console.log('sending Logs--------------');
            const logs = results.rows.raw();
            return logs;
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all logs(inside tree_tb(getAllLogs))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    };


    getShiftsLocalDB = async (uploaded) => {
        try {
            const shiftData = [];
            const query = `SELECT * FROM ${localShiftTable} WHERE shiftuploadcomplete=${uploaded}`;
            const results = await this.db.executeSql(query);

            for (let index = 0; index < results.length; index++) {
                const result = results[index];

                for (let i = 0; i < result.rows.length; i++) {
                    let item = result.rows.item(i);
                    const saplingsInfo = await this.getTreesByShiftID(item.id); //shiftID-> id
                    item = { ...item, saplings: saplingsInfo };
                    shiftData.push(item);
                }
            }

            //console.log("final shift data before syncing---", shiftData);
            return shiftData;
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all shifts from local db(inside tree_tb(getShiftsLocalDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    }

    getTreesByShiftID = async (shift_id) => {
        try {
            // console.log("id--", shift_id)
            const trees = [];
            const query = `SELECT  sapling_id, sequence_no FROM ${saplingsInLocalShifts} WHERE shiftID = ?`;
            const results = await this.db.executeSql(
                query, [shift_id]
            );
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            //console.log("getTreesByShiftID----", trees);
            return trees;
        } catch (error) {
            console.error('Error fetching trees:', error);
            return [];
        }
    }

    getAllShiftID = async () => {
        try {
            const query = `SELECT * FROM ${localShiftTable}`;
            const [results] = await this.db.executeSql(query);
            //console.log('sending Logs--------------');
            return results.rows.raw();
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all shiftID from local db(inside tree_tb(getAllShiftID))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    }

    deleteAllLogs = async () => {
        const deleteQuery = `DELETE FROM logs_table`;
        await this.db.executeSql(deleteQuery);
    }

    getAllSaplingsLocalShiftDB = async () => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT * FROM ${saplingsInLocalShifts}`,
            );

            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });


            return trees;
        } catch (error) {
            //TODO: remove raw throw. Convert to Alert.
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get All Saplings from LocalShiftDB(inside tree_tb(getAllSaplingsLocalShiftDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getAllTrees = async () => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng, uploaded, timestamp FROM ${treeTableName}`,
            );
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            return trees;
        } catch (error) {
            //TODO: remove raw throw. Convert to Alert.
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree data(inside tree_tb(getAllTrees))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getTreeBySaplingID = async (saplingId) => {

        try {
            const trees = [];
            const queryString = `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng, uploaded FROM ${treeTableName} WHERE sapling_id = ?`
            const results = await this.db.executeSql(
                queryString, [saplingId]
            );
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            return trees;
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree by saplingID(inside tree_tb(getTreeBySaplingID))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    }

    getTreesByUploadStatus = async (uploaded) => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng, timestamp FROM ${treeTableName} where uploaded=${uploaded}`,
            );
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            return trees;
        } catch (error) {
            //TODO: remove raw throw. Convert to Alert.
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree data(inside tree_tb(getAllTreesByUploadStatus))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    deleteSyncedTrees = async () => {
        const query = `DELETE FROM ${treeTableName} where uploaded = ?`;
        console.log(query);
        await this.db.executeSql(query, [1]);
        return await this.getAllTrees();
    }

    getTreeImages = async (saplingid) => {
        try {
            const treesimgs = [];
            const results = await this.db.executeSql(
                `SELECT imageid as name, image as data,remark,timestamp as captureTimestamp FROM sapling_images where saplingid='${saplingid}'`,
            );
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    const image = {
                        name: result.rows.item(index).name,
                        data: result.rows.item(index).data,
                        meta: {
                            remark: result.rows.item(index).remark.replace("''", "'"),
                            capturetimestamp: result.rows.item(index).captureTimestamp,
                        },
                    };
                    treesimgs.push(image);
                }
            });
            return treesimgs;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeImages', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree images(inside tree_tb(getTreeImages))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    getAllTreeCount = async () => {
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${treeTableName}`);
            return res[0].rows.length;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeCount', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree count(inside tree_tb(getAllTreeCount))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    setFalse = async () => {
        try {
            let res = await this.db.executeSql(`update ${treeTableName} set uploaded=0`);
            return res[0].rows.length;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedSetFalse', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to setFalse state(inside tree_tb(setFalse))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    saveShifts = async (shiftData) => { //local shifts table
        try {
            console.log('inserting into shift table---', shiftData.id);

            if (shiftData.id) {

                console.log("shift already exists, updating row");
                const updateQuery = `UPDATE ${localShiftTable} 
                                 SET plotselected='${shiftData.plotselected}', 
                                     starttime='${shiftData.starttime}', 
                                     shiftended='${shiftData.shiftended}',
                                     shiftuploadcomplete='${shiftData.shiftuploadcomplete}',
                                     endtime='${shiftData.endtime}', 
                                     timetaken='${shiftData.timetaken}', 
                                     treesplanted='${shiftData.treesplanted}' 
                                 WHERE id='${shiftData.id}'`;
                await this.db.executeSql(updateQuery);
                return null;
            } else {
                console.log("shift does not exist, inserting row");

                const dateString = new Date(); // Current timestamp
                let timestamp = dateString.toISOString().split('T')[0];
                timestamp = timestamp.split('-').reverse().join('-');

                const insertQuery = `INSERT INTO ${localShiftTable} 
                             (shifttype, user_id, shiftended, shiftuploadcomplete, plotselected, starttime, endtime, timetaken, treesplanted, timestamp) 
                             VALUES ('add saplings', '${shiftData.user_id}','${shiftData.shiftended}', '${shiftData.shiftuploadcomplete}', '${shiftData.plotselected}', '${shiftData.starttime}', '${shiftData.endtime}', '${shiftData.timetaken}', '${shiftData.treesplanted}', '${timestamp}')`;


                await this.db.executeSql(insertQuery);

                const lastIDQuery = `SELECT last_insert_rowid() AS lastID`;
                const [results] = await this.db.executeSql(lastIDQuery);
                const existingShiftID = results.rows.item(0).lastID;
                return existingShiftID;
            }

        } catch (error) {
            console.log("Error inserting shift---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save shifts to localDB(inside tree_tb(saveShifts))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    saveSaplingsLocalShiftDB = async (tree) => {
        try {
            console.log("inserting Saplings to LocalShiftDB-------------");

            const insertQuery =
                `INSERT OR REPLACE INTO ${saplingsInLocalShifts}(shiftID, sapling_id, sequence_no, uploaded) values` +
                `('${tree.shiftID}', '${tree.sapling_id}', '${tree.sequence_no}', ${tree.uploaded})`;

            //console.log("insert query saveSaplingsLocalShiftDB---", insertQuery);
            return this.db.executeSql(insertQuery);

        } catch (error) {
            console.log("error inserting Saplings to LocalShiftDB--------", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to inserting Saplings to LocalShiftDB(inside tree_tb(saveSaplingsLocalShiftDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    saveTree = async (tree, uploaded) => {
        //console.log('insterting tree---', tree);
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO ${treeTableName}(treeid, saplingid, lat, lng, plotid, uploaded, user_id, timestamp ) values` +
                `('${tree.treeid}', '${tree.saplingid}', '${tree.lat}', '${tree.lng}', '${tree.plotid}', ${uploaded}, '${tree.user_id}', '${tree.timestamp}')`;

            return this.db.executeSql(insertQuery);
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save tree to localDB(inside tree_tb(saveTree))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    // save tree images
    deleteTree = async (saplingId) => {
        const deleteQuery = `DELETE FROM ${treeTableName} where saplingid = ?`;
        await this.db.executeSql(deleteQuery, [saplingId]);
        return;
    }

    deleteTreeImages = async (saplingId) => {
        const deleteQuery = `DELETE FROM sapling_images where saplingid = ?`;
        await this.db.executeSql(deleteQuery, [saplingId]);
        return;
    }

    saveTreeImages = async (treeimage) => {
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO sapling_images(saplingid, image, imageid, remark, timestamp) values` +
                `('${treeimage.saplingid}', '${treeimage.image}', '${treeimage.imageid}', '${treeimage.remark.replace("'", "''")}', '${treeimage.timestamp}')`;
            console.log('image stored!')
            return this.db.executeSql(insertQuery);
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save tree images localDB(inside tree_tb(saveTreeImages))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    updateUpload = async (id) => {
        const updateQuery = `update ${treeTableName} set uploaded=1 where saplingid = '${id}'`;
        await this.db.executeSql(updateQuery);
    };

    updateShiftUpload = async (id, shift_id) => {
        try {
            // Fetch shiftended value from the database

            const query = `SELECT shiftended FROM ${localShiftTable} WHERE id = ?`;
            const [result] = await this.db.executeSql(query, [id]);
            const shiftended = result.rows.item(0).shiftended;

            console.log("shiftended---", shiftended);

            let updateQuery = null;

            if (shiftended === 1) {
                updateQuery =
                    `UPDATE ${localShiftTable} 
                 SET shift_id = ?, shiftuploadcomplete = 1
                 WHERE id = ?`

                await this.db.executeSql(updateQuery, [shift_id, id]);
            } else {
                updateQuery =
                    `UPDATE ${localShiftTable} 
                 SET shift_id = ?
                 WHERE id = ?`
                await this.db.executeSql(updateQuery, [shift_id, id]);

            }


            // const get = `SELECT * from ${localShiftTable} WHERE id = ?`;
            // const [result1] = await this.db.executeSql(get, [id])
            // console.log("Shift updated successfully---", result1.rows.item(0));
        } catch (error) {

            console.error("Error updating shift:", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to update local shift Table(inside tree_tb(updateShiftUpload))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    updateTreeUpload = async (id) => {
        try {

            const updateQuery =
                `UPDATE ${saplingsInLocalShifts} 
             SET uploaded = true WHERE shiftID = ?`
            await this.db.executeSql(updateQuery, [id]);
            const get = `SELECT * from ${saplingsInLocalShifts} WHERE shiftID = ?`;
            const [result1] = await this.db.executeSql(get, [id])
            console.log("saplingsInLocalShifts updated successfully---", result1.rows.item(0));
        } catch (error) {
            console.error("Error updating sapling in local shift table:", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to update sapling in local shift table(inside tree_tb(updateTreeUpload))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    updateTreesWithChangedPlot = async (plot_id, shiftID) => {
        const updateQuery = `UPDATE ${treeTableName} SET plotid = '${plot_id}' where shiftID = '${shiftID}'`;

        try {
            await this.db.executeSql(updateQuery);
        } catch (error) {
            console.log(
                '----------error while changing plot for trees in tree_db-------',
                error,
            );
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to update tree with changed plot (inside tree_tb(updateTreesWithChangedPlot))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };
    //check manjur
    createTreetTypesTbl = async () => {

        try {
            // create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS ${treetypeName}(
            name TEXT NOT NULL,
            value TEXT NOT NULL PRIMARY KEY
        );`;
            await this.db.executeSql(query);
        } catch (error) {
            console.log("error creating tree types table---", error);
        }

    };

    updateTreeTypeTbl = async (tree) => {
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO ${treetypeName}(name, value) values` +
                `('${tree.name}', '${tree.tree_id}')`;
            return this.db.executeSql(insertQuery);
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to update Tree Type Table(inside tree_tb(updateTreeTypeTbl))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    };

    // get tree names for given list of tree ids
    getTreeTypes = async () => {
        const selectQuery = `SELECT * FROM ${treetypeName}`;
        const treeTypes = []
        try {
            let res = await this.db.executeSql(selectQuery);
            for (let result of res) {
                for (let index = 0; index < result.rows.length; index++) {
                    treeTypes.push(result.rows.item(index));
                }
            }
            return treeTypes;
        }
        catch (error) {
            console.log(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree types(inside tree_tb(getTreeTypes))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getTreeTypesUsedByLocalTrees = async () => {
        const selectQuery = `SELECT * FROM ${treetypeName} WHERE value IN (SELECT treeid FROM ${treeTableName})`;
        const treeNames = [];

        try {
            let res = await this.db.executeSql(selectQuery);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    treeNames.push(result.rows.item(index));
                }
            });
            return treeNames;
        }
        catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeNames', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get tree names(inside tree_tb(getTreeTypesUsedByLocalTrees))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    };

    getPlotNamesUsedByLocalTrees = async () => {
        const selectQuery = `SELECT * FROM ${plotName} WHERE value IN (SELECT plotid FROM ${treeTableName})`;
        const plotNames = [];

        try {
            let res = await this.db.executeSql(selectQuery);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    plotNames.push(result.rows.item(index));
                }
            });
            return plotNames;
        }
        catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetPlotNames', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get plot names(inside tree_tb(getPlotNamesUsedByLocalTrees))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    }

    // get sapling ids of all trees from table 'tree'

    getSaplingIds = async () => {
        const saplings = [];
        try {
            let res = await this.db.executeSql(`SELECT saplingid as name FROM ${treeTableName}`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    saplings.push(result.rows.item(index));
                }
            });
            return saplings;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetSaplingIds', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get saplingIds(inside tree_tb(getSaplingIds))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    };



    getAllTreeTypes = async () => {
        const trees = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${treetypeName}`);
            res.forEach(result => {

                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            //console.log("result from select treeTypes query : ",trees)
            return trees;
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all tree types(inside tree_tb(getAllTreeTypes))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };
    //check manjur
    createPlotTbl = async () => {
        try {
            // create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS ${plotName}(
            name TEXT NOT NULL,
            value TEXT NOT NULL PRIMARY KEY
          );`;

            await this.db.executeSql(query);
        } catch (error) {
            console.log("error creating plot table---", error);
        }

    };

    updatePlotTbl = async (plot) => {
        const insertQuery =
            `INSERT OR REPLACE INTO ${plotName}(name, value) values` +
            `('${plot.name}', '${plot.plot_id}')`;
        return this.db.executeSql(insertQuery);
    };

    getAllPlots = async () => {
        const plots = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${plotName}`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    plots.push(result.rows.item(index));
                }
            });
            //console.log("result from select plots query : ",res)
            return plots;
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all plot types(inside tree_tb(getAllPlots))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };



    updateShiftTblLive = async (shift) => {
        //console.log("---------------shift----------", shift);

        try {
            console.log("----------Deleting old data and inserting lates in shifts tablet--------- ")
            await this.db.executeSql(`DELETE FROM ${previousShiftTableName}`);

            const insertShiftsQuery = `
            INSERT OR REPLACE INTO ${previousShiftTableName} (
                endtime, shift_id, shifttype, plotselected, starttime, timestamp, timetaken, treesplanted, user_id, shiftended, shiftuploadcomplete 
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            await this.db.executeSql(insertShiftsQuery, [
                shift.end_time,
                shift.shift_id,
                shift.shift_type,
                shift.plot_selected,
                shift.start_time,
                shift.timestamp,
                shift.time_taken,
                shift.trees_planted,
                shift.user_id,
                shift.shiftended,
                shift.shiftuploadcomplete
            ]);

            const saplings = shift.saplings;

            console.log("----------Deleting old data and inserting lates in shifts tablet--------- ")
            await this.db.executeSql(`DELETE FROM ${saplingsInLiveShifts}`);

            for (const sapling of saplings) {
                //console.log("------------saplings----------", shift.shift_id)
                const insertSaplingQuery = `
                    INSERT OR REPLACE INTO ${saplingsInLiveShifts} (shiftID, sapling_id, sequence_no, uploaded) 
                    VALUES (?, ?, ?, ?)`;

                await this.db.executeSql(insertSaplingQuery, [
                    shift.shift_id,
                    sapling.sapling_id,
                    sapling.sequence_no,
                    sapling.uploaded,
                ]);
            }
        } catch (error) {
            console.error('Error updating shift table:', error);
        }
    };

    getAllShiftsLive = async () => {
        const liveShifts = [];
        try {
            let res = await this.db.executeSql(
                `SELECT * FROM ${previousShiftTableName}`,
            );
            //console.log("------------res.rows----- ",res.rows.item[0])

            res.forEach(result => {
                //console.log("------------result----- ", result)
                for (let index = 0; index < result.rows.length; index++) {

                    liveShifts.push(result.rows.item(index));
                }
            });
            //console.log("----------liveShifts----------", liveShifts)
            return liveShifts;

        } catch (error) {
            console.error("------error fetching shifts----", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to get all shifts(inside tree_tb(getAllShiftsLive))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    getAllSaplingsInShifts = async () => {
        const saplingsInShifts = [];

        try {
            let res = await this.db.executeSql(
                `SELECT * FROM ${saplingsInLiveShifts}`,
            );

            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    saplingsInShifts.push(result.rows.item(index));
                }
            });

            //console.log("result from select plots query------ ", saplingsInShifts)
            return saplingsInShifts;

        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to get all saplings from shifts(inside tree_tb(getAllSaplingsInShift))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    createSaplingTbl = async () => {
        try {
            // create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS ${saplingsTableName} (
            sapling_id TEXT NOT NULL PRIMARY KEY
        );`;
            await this.db.executeSql(query);
        } catch (error) {
            console.log("error creating sapling table---", error);
        }

    };

    updateSaplingTbl = async (saplingDocs) => {
        if (!Array.isArray(saplingDocs) || saplingDocs.length === 0) {
            console.log("empty sapling array in tree_db.js")
        }
        //Delete all existing records
        console.log("----------Deleting old data and inserting latest--------- ")
        await this.db.executeSql(`DELETE FROM ${saplingsTableName}`);
        const values = saplingDocs.map((saplingDoc) => `('${saplingDoc.saplingid}')`).join(',');
        const insertQuery = `INSERT OR REPLACE INTO ${saplingsTableName} (sapling_id) VALUES ${values}`;
        return this.db.executeSql(insertQuery);
    };


    getAllSaplingsInLiveDB = async () => {
        const saplingsArray = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${saplingsTableName}`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    saplingsArray.push(result.rows.item(index));
                }
            });
            //console.log("resposnse from select query Saplings: ", res)
            return saplingsArray;
        }

        catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get all saplings in live DB(inside tree_tb(getAllSaplingsInLiveDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    };


    // a table of sapling ids with their corresponding plot ids and lat,long


    //check manjur
    createSaplingPlotTbl = async () => {
        try {
            // create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS sapling_plot(
            plotid TEXT NOT NULL,
            saplingid TEXT NOT NULL PRIMARY KEY,
            lat FLOAT(10,7) NOT NULL,
            lng FLOAT(10,7) NOT NULL
          );`;
            console.log('sapling plot table created')
            await this.db.executeSql(query);
        } catch (error) {
            console.log("error creating sapling plot table--", error);
        }

    }

    // let Data = [{ "id": 2, "first_name": "Shani", "last_name": "Tiwari", "is_deleted": "0" }, { "id": 3, "first_name": "John", "last_name": "Carter", "is_deleted": "0" }, { "id": 4, "first_name": "captain", "last_name": "marvel", "is_deleted": "0" }];
    // let query = "INSERT INTO users (id, first_name, last_name, is_deleted) VALUES";
    // for (let i = 0; i < Data.length; ++i) {
    //   query = query + "('"
    //     + Data[i].id //id
    //     + "','"
    //     + Data[i].first_name //first_name
    //     + "','"
    //     + Data[i].last_name //last_name
    //     + "','"
    //     + Data[i].is_deleted //is_deleted
    //     + "')";
    //   if (i != Data.length - 1) {
    //     query = query + ",";
    //   }
    // }
    // query = query + ";";
    // console.log(query);

    // let multipleInsert = await this.ExecuteQuery(query, []);
    // console.log(multipleInsert);
    //check manjur
    storePlotSaplings = async (plot_id, saplings) => {
        let insertQuery =
            `INSERT OR REPLACE INTO sapling_plot(plotid,saplingid ,lat, lng) VALUES`
        for (let i = 0; i < saplings.length; i++) {
            const sapling = saplings[i];
            insertQuery = insertQuery + `('${plot_id}','${sapling[0]}','${sapling[1]}','${sapling[2]}')`;
            if (i != saplings.length - 1) {
                insertQuery = insertQuery + ",";
            }
        }
        insertQuery = insertQuery + ";";
        // console.log(insertQuery)
        await this.db.executeSql(insertQuery);
        console.log('trees stored for plot id: ', plot_id)

    }


    deletePlotSaplings = async () => {
        const query = `DELETE FROM sapling_plot`;
        return this.db.executeSql(query);
    }

    getSaplingsforPlot = async (plotId) => {
        // console.log('plot id: ', plot_id)
        const saplings = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM sapling_plot WHERE plotid = '${plotId}'`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    saplings.push(result.rows.item(index));
                }
            });
            return saplings;
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get saplings for plot(inside tree_tb(getSaplingsforPlot))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }
    //check manjur
    updateSaplingPlotTbl = async (plot_id, sapling_id, latitude, longitude) => {
        // first delete the previous entry for sapling id
        const deleteQuery = `DELETE FROM sapling_plot WHERE saplingid = '${sapling_id}'`;
        await this.db.executeSql(deleteQuery);
        // then insert the new values
        const insertQuery =
            `INSERT OR REPLACE INTO sapling_plot(saplingid, plotid, lat, lng) values` +
            `('${sapling_id}', '${plot_id}', '${latitude}', '${longitude}')`;
        return this.db.executeSql(insertQuery);
    }

}

