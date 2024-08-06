import { enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { Alert } from 'react-native';
import { Strings } from './Strings';
import { Constants } from './Utils';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const treeTableName = 'tree'; //for local trees
const treetypeName = 'plant_type';
const plotName = 'plot';
const previousShiftTableName = 'previousShifts'; //live shift
const saplingsTableName = 'saplings'; //for live trees
const localShiftTable = 'localShifts'; //local shift
const updatePlotsTable = 'updatePlotsTable';
const newImageTable = "newImageTable";

enablePromise(true);

export class LocalDatabase {
    db = null;

    constructor() {
        this.getDBConnection();
    }

    getDBConnection = async () => {
        if (!this.db) {
            this.db = await openDatabase({ name: 'new_tree.db', location: 'default' });
        }
        return this.db;
    };

    deleteTables = async () => {
        const deleteTable = async (tableName) => {
            const query = `drop table ${tableName}`;
            await this.db.executeSql(query);

            console.log("Delete", tableName);
        }

        deleteTable(treetypeName);
        deleteTable(plotName);
        deleteTable(previousShiftTableName);
        deleteTable(treeTableName);
        deleteTable(saplingsTableName);
        deleteTable(localShiftTable);
        deleteTable(updatePlotsTable);
        deleteTable(newImageTable);
        deleteTable('logs_table');
        deleteTable('sapling_images');
    };

    createTreesTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${treeTableName}(
                plant_type_id INTEGER NOT NULL,
                sapling_id TEXT NOT NULL PRIMARY KEY,
                lat TEXT,
                lng TEXT,
                plot_id INTEGER NOT NULL,
                uploaded INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                tree_status TEXT CHECK (tree_status IN ('alive', 'dead', 'lost')) NOT NULL DEFAULT 'alive',
                timestamp TEXT NOT NULL
            );`;


            // multiple images for a sapling
            const query2 = `CREATE TABLE IF NOT EXISTS sapling_images(
                sapling_id TEXT NOT NULL,
                image TEXT NOT NULL,
                image_id TEXT NOT NULL PRIMARY KEY,
                remark TEXT,
                timestamp TEXT NOT NULL,
                Foreign Key (sapling_id) references ${treeTableName}(sapling_id)
            );`;

            //id represents shifts no on local db.
            const query3 = `
            CREATE TABLE IF NOT EXISTS ${localShiftTable} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shift_id INTEGER,
                shift_type TEXT,
                user_id INTEGER NOT NULL,
                shift_ended INTEGER NOT NULL,
                shift_upload_complete INTEGER NOT NULL,
                plot_selected TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                time_taken TEXT NOT NULL,
                trees_planted INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                saplings TEXT
            )`

            const query4 = `
            CREATE TABLE IF NOT EXISTS ${updatePlotsTable} (
                sapling_id TEXT NOT NULL,
                new_plot INTEGER NOT NULL,
                old_plot INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                uploaded INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            )
            `
            await this.db.executeSql(query);
            await this.db.executeSql(query2);
            await this.db.executeSql(query3);
            await this.db.executeSql(query4);

            console.log('Shift table created successfully---------');

        } catch (error) {
            console.log("error creating trees table---", error);
        }
    };

    createNewImageTable = async () => {
        try {
            const newImageTablequery = `
            CREATE TABLE IF NOT EXISTS ${newImageTable} (
                user_id TEXT NOT NULL,
                sapling_id TEXT NOT NULL PRIMARY KEY,
                image TEXT,
                image_id TEXT,
                remark TEXT,  
                uploaded INTEGER NOT NULL,
                inActive INTEGER NOT NULL,
                lat TEXT,
                lng TEXT,
                timestamp TEXT NOT NULL
               )`;

            await this.db.executeSql(newImageTablequery);

        } catch (error) {
            console.log("error creating new image table---", error);
        }


    };

    //Shift table
    createShiftTblLive = async () => {
        try {
            const shiftTableQuery = `
            CREATE TABLE IF NOT EXISTS ${previousShiftTableName} (
                shift_id INTEGER NOT NULL PRIMARY KEY,
                shift_type TEXT,
                user_id INTEGER NOT NULL,
                plot_selected TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                time_taken TEXT NOT NULL,
                trees_planted INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                shift_ended INTEGER NOT NULL,
                shift_upload_complete INTEGER NOT NULL,
                saplings TEXT      
               )`;

            await this.db.executeSql(shiftTableQuery);

        } catch (error) {
            console.log("error creating live shift table  table---", error);
        }


    };

    createLogsTable = async () => {

        try {
            const query = `
                CREATE TABLE IF NOT EXISTS logs_table(
                    user_id INTEGER,
                    device_info TEXT,
                    phone_info TEXT,
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


    logExceptionLocalDB = async (logs) => {
        try {
            const phoneInfo = await DeviceInfo.getPhoneNumber() || await AsyncStorage.getItem(Constants.phoneNumber);
            const deviceManufacture = await DeviceInfo.getManufacturer();
            const deviceName = await DeviceInfo.getDeviceName();
            const deviceInfo = deviceManufacture + "" + deviceName;
            const timestamp = new Date().toISOString();
            let userId = await AsyncStorage.getItem(Constants.userIdKey);
            userId = parseInt(userId);
            const [results] = await this.db.executeSql(`
            SELECT * FROM logs_table 
            WHERE device_info = ? AND phone_info = ? AND logs = ?`,
                [deviceInfo, phoneInfo, logs]
            );

            const existingLogs = results.rows.raw();

            console.log("existing duplicate logs: ", existingLogs);
            // If the log already exists, log a message and skip insertion
            if (existingLogs.length > 0) {
                console.log("Log already exists, skipping insertion");
                return;
            }

            const query = 
                `INSERT INTO logs_table (user_id, device_info, phone_info, logs, timestamp) 
                VALUES (?, ?, ?, ?, ?)`;

            await this.db.executeSql(query, [userId, deviceInfo, phoneInfo, logs, timestamp]);

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


    getTreesWithNewPlots = async (uploaded) => {
        try {
            const trees = [];

            const query = `SELECT * FROM ${updatePlotsTable} WHERE uploaded=${uploaded}`;
            const results = await this.db.executeSql(query);

            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });

            //console.log("final plot data before syncing---", trees);
            return trees;

        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get Trees With New Plots from local db(inside tree_tb(getTreesWithNewPlots))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    }

    getShiftsLocalDB = async (uploaded) => {
        try {
            const shiftData = [];

            const query = `SELECT * FROM ${localShiftTable} WHERE shift_upload_complete=${uploaded} ORDER BY id DESC;`;
            const results = await this.db.executeSql(query);

            for (let index = 0; index < results.length; index++) {
                const result = results[index];
                for (let i = 0; i < result.rows.length; i++) {
                    let item = result.rows.item(i);
                    let saplings = JSON.parse(item.saplings);
                    // Remove the uploaded field from each sapling
                    saplings = saplings.map(({ uploaded, ...rest }) => rest);
                    item = { ...item, saplings: saplings };
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


    getAllShiftID = async () => {
        try {
            const query = `SELECT * FROM ${localShiftTable} ORDER BY id DESC;`;
            const [results] = await this.db.executeSql(query);
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

    //localShiftTable saplings
    getSaplingsLocalShiftDB = async (id) => {
        try {
            const results = await this.db.executeSql(`SELECT saplings,shift_type FROM ${localShiftTable} WHERE id = ?`, [id]);
            const result = results[0].rows.item(0);
            let saplingArray = JSON.parse(result?.saplings || '[]');
            let shiftType = result?.shift_type || null
            //console.log("sapling for local shift ", id, " ", saplingArray);

            return { saplingArray, shiftType };
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get  Saplings from LocalShiftDB(inside tree_tb(getSaplingsLocalShiftDB))",
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
                `SELECT sapling_id, plant_type_id, plot_id, user_id, lat,lng, uploaded, tree_status, timestamp FROM ${treeTableName}`,
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
            const queryString = `SELECT sapling_id, plant_type_id, plot_id, user_id, lat,lng, tree_status, uploaded FROM ${treeTableName} WHERE sapling_id = ?`
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

    getTreeImageBySaplingID = async (saplingId) => {

        try {

            const trees = [];
            const queryString = `SELECT * FROM ${newImageTable} WHERE sapling_id = ?`

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
                `SELECT sapling_id, plant_type_id, plot_id, user_id, lat,lng, tree_status, timestamp FROM ${treeTableName} where uploaded=${uploaded}`,
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
        await this.db.executeSql(query, [1]);
        return await this.getAllTrees();
    }

    deleteNewImageTable = async () => {
        const query = `DROP table ${newImageTable}`;
        await this.db.executeSql(query)
    }

    deleteSyncedImageTrees = async () => {

        try {
            const results = await this.db.executeSql(
                `SELECT sapling_id FROM ${newImageTable} where uploaded = 1`

            );
            const trees = [];
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });

            //console.log("------------------------trees uploaded--------", trees);

            const query = `DELETE FROM ${newImageTable} where uploaded = ?`;
            //console.log("-----------------deletinggg--------------------");
            await this.db.executeSql(query, [1]);
            return await this.getAllTreesWithNewImage();
        } catch (error) {
            console.error("deleteSyncedImageTrees---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to delete Synced Image Trees(inside tree_tb(deleteSyncedImageTrees))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    }

    getTreeImages = async (saplingId) => {
        try {
            const treesImgs = [];
            const results = await this.db.executeSql(
                `SELECT image_id as name, image as data,remark,timestamp as captureTimestamp FROM sapling_images where sapling_id='${saplingId}'`,
            );
            console.log("Images ---", JSON.stringify(results))
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
                    treesImgs.push(image);
                }
            });
            return treesImgs;
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

    getAllTreesWithNewPlots = async () => {
        try {
            const trees = [];

            const query = `SELECT * FROM ${updatePlotsTable}`;
            const results = await this.db.executeSql(query);

            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            return trees;

        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get Trees With New Plots from local db(inside tree_tb(getTreesWithNewPlots))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
            return [];
        }
    }

    getAllTreesWithNewImage = async () => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT user_id,sapling_id,image,image_id,remark,uploaded,inActive,lat,lng,timestamp FROM ${newImageTable}`

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
                msg: "happened while trying to get trees with new image(inside tree_tb(getAllTreeesWithNewImages))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getTreesWithNewImage = async (uploaded) => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT user_id,sapling_id,image,image_id,remark,lat,lng,timestamp,uploaded,inActive FROM ${newImageTable} WHERE uploaded='${uploaded}'`

            );
            //console.log("--------------results----------",results)
            results.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            //console.log("--------------trees in newImagesTable----------",trees)
            return trees;
        } catch (error) {
            //TODO: remove raw throw. Convert to Alert.
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata', Strings.english));
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to get unuploaded trees with new image(inside tree_tb(getUnUploadedTreesWithNewImage))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

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

    saveUpdatePlots = async (tree) => {
        try {

            const insertQuery = `
        INSERT OR REPLACE INTO ${updatePlotsTable} (sapling_id, new_plot, old_plot, user_id, uploaded, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

            await this.db.executeSql(insertQuery, [
                tree.sapling_id,
                tree.new_plot,
                tree.old_plot,
                tree.user_id,
                tree.uploaded,
                tree.timestamp
            ]);

        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save Update Plots to localDB(inside tree_tb(saveUpdatePlots))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    deleteSaplingUpdatePlotDB = async (saplingid) => {
        try {
            const query = `DELETE from ${updatePlotsTable} WHERE sapling_id = ?`
            await this.db.executeSql(query, [saplingid]);
            console.log("deleted the sapling---", saplingid);
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to delete Sapling UpdatePlotDB(inside tree_tb(deleteSaplingUpdatePlotDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    checkSaplingUpdatePlotDB = async (saplingid) => {
        try {
            const query = `SELECT sapling_id FROM ${updatePlotsTable} WHERE sapling_id = ?`;
            const [results] = await this.db.executeSql(query, [saplingid]);

            if (results.rows.length > 0) {
                const sapling = results.rows.item(0).sapling_id;

                //console.log("sapling got-----", sapling, saplingid);
                return sapling === saplingid;
            } else {
                //console.log("No sapling found with id:", saplingid);
                return false;
            }

        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to checkSaplingUpdatePlotDB(inside tree_tb(checkSaplingUpdatePlotDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    deleteShiftLocalDB = async (id) => {
        try {

            if (id) {
                const query = `DELETE FROM ${localShiftTable} WHERE id = ?`;
                await this.db.executeSql(query, [id]);
                console.log("delete the shift with id:--", id);
            }
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to delete shift from LocalDB(inside tree_tb(deleteShiftLocalDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    saveShifts = async (shiftData) => { //local shifts table
        try {
            console.log('inserting into shift table---', shiftData.id);

            if (shiftData.id) {
                console.log("shift already exists, updating row");

                if (shiftData.sapling) {
                    const results = await this.db.executeSql(`SELECT saplings FROM ${localShiftTable} WHERE id = ?`, [shiftData.id]);
                    const result = results[0].rows.item(0);
                    let saplingArray = JSON.parse(result.saplings || '[]');
                    saplingArray.push(shiftData.sapling);
                    const updateQuery = `UPDATE ${localShiftTable} 
                     SET plot_selected = ?, 
                         start_time = ?, 
                         shift_ended = ?, 
                         shift_upload_complete = ?, 
                         end_time = ?, 
                         time_taken = ?, 
                         trees_planted = ?, 
                         saplings = ? 
                     WHERE id = ?`;

                    await this.db.executeSql(updateQuery, [
                        shiftData.plot_selected,
                        shiftData.start_time,
                        shiftData.shift_ended,
                        shiftData.shift_upload_complete,
                        shiftData.end_time,
                        shiftData.time_taken,
                        shiftData.trees_planted,
                        JSON.stringify(saplingArray),
                        shiftData.id
                    ]);
                } else {
                    const updateQuery = `UPDATE ${localShiftTable} 
                     SET plot_selected = ?, 
                         start_time = ?, 
                         shift_ended = ?, 
                         shift_upload_complete = ?, 
                         end_time = ?, 
                         time_taken = ?, 
                         trees_planted = ? 
                     WHERE id = ?`;

                    await this.db.executeSql(updateQuery, [
                        shiftData.plot_selected,
                        shiftData.start_time,
                        shiftData.shift_ended,
                        shiftData.shift_upload_complete,
                        shiftData.end_time,
                        shiftData.time_taken,
                        shiftData.trees_planted,
                        shiftData.id
                    ]);
                }

                return null;


            } else {
                console.log("shift does not exist, inserting row", shiftData);

                const dateString = new Date(); // Current timestamp
                let timestamp = dateString.toISOString().split('T')[0];
                timestamp = timestamp.split('-').reverse().join('-');

                const insertQuery = `INSERT INTO ${localShiftTable} 
                     (shift_type, user_id, shift_ended, shift_upload_complete, plot_selected, start_time, end_time, time_taken, trees_planted, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                await this.db.executeSql(insertQuery, [
                    shiftData.shift_type,
                    shiftData.user_id,
                    shiftData.shift_ended,
                    shiftData.shift_upload_complete,
                    shiftData.plot_selected,
                    shiftData.start_time,
                    shiftData.end_time,
                    shiftData.time_taken,
                    shiftData.trees_planted,
                    timestamp
                ]);


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

    deleteSaplingInShiftDB = async (sapling_id, id) => {
        try {
            console.log("sapling got--", sapling_id, id);

            const query = `SELECT saplings,trees_planted FROM ${localShiftTable} WHERE id = ?`;
            const result = await this.db.executeSql(query, [id]);
            let saplings = result[0].rows.item(0).saplings;
            let treesPlanted = result[0].rows.item(0).trees_planted;
            treesPlanted = Number(treesPlanted) - 1;

            saplings = JSON.parse(saplings);

            saplings = saplings.filter(sapling => (sapling.sapling_id !== sapling_id));

            console.log("updated saplings before delete----", saplings, treesPlanted);

            const updateQuery = `UPDATE ${localShiftTable} 
                SET  saplings = ?, trees_planted = ?
                WHERE id = ?`;

            await this.db.executeSql(updateQuery, [JSON.stringify(saplings), treesPlanted, id]);

            // const get = `SELECT * from ${localShiftTable} WHERE id = ?`;
            // const [result1] = await this.db.executeSql(get, [id])
            // console.log("Shift updated successfully---", result1.rows.item(0));

        } catch (error) {
            console.log("Error deleting sapling of the local shift table---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to updating sapling of the local shift table(inside tree_tb(deleteSaplingInShiftDB))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    updateSaplingLocalShiftDb = async (newSaplingId, inSaplingId, id) => {
        try {
            const query = `SELECT saplings FROM ${localShiftTable} WHERE id = ?`;
            const result = await this.db.executeSql(query, [id]);
            let saplings = result[0].rows.item(0).saplings;

            saplings = JSON.parse(saplings);

            saplings = saplings.map(sapling => {
                if (sapling.sapling_id === inSaplingId) {
                    return { ...sapling, sapling_id: newSaplingId };
                }
                return sapling;
            });

            console.log("upadted saplings----", saplings);
            const updateQuery = `UPDATE ${localShiftTable} 
            SET  saplings = ?
            WHERE id = ?`;

            await this.db.executeSql(updateQuery, [JSON.stringify(saplings), id]);

        } catch (error) {
            console.log("Error updating sapling of the local shift table---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to updating sapling of the local shift table(inside tree_tb(updateSaplingLocalShiftDb))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    updateSaplingImageUpload = async (id) => {
        try {
            const updateQuery = `update ${newImageTable} set uploaded=1 where sapling_id = '${id}'`;
            await this.db.executeSql(updateQuery);
        } catch (error) {
            console.log("Error updating sapling of the Image Upload---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to updating sapling of the Image Upload shift table(inside tree_tb(updateSaplingImageUpload))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }

    };

    saveImage = async (tree, uploaded) => {
        try {

            const insertQuery = `
            INSERT OR REPLACE INTO ${newImageTable} 
            (user_id, sapling_id, image, image_id, remark, uploaded, inActive, lat, lng, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            const params = [
                tree.user_id,
                tree.sapling_id,
                tree.image?.data,
                tree.image?.name,
                tree.image?.meta.remark,
                uploaded,
                tree.inActive,
                tree.lat,
                tree.lng,
                tree.timestamp
            ];

            this.db.executeSql(insertQuery, params);
            console.log("succesfully inserted image---");
        } catch (error) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save tree image to localDB(inside tree_tb(saveImage))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    saveTree = async (tree, uploaded) => {
        //console.log('insterting tree---', tree);
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO ${treeTableName}(plant_type_id, sapling_id, lat, lng, plot_id, uploaded, user_id, tree_status, timestamp ) values` +
                `('${tree.plant_type_id}', '${tree.sapling_id}', '${tree.lat}', '${tree.lng}', '${tree.plot_id}', ${uploaded}, '${tree.user_id}', '${tree.tree_status}', '${tree.timestamp}')`;

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

    deleteSaplingShiftDB = async (saplingId, id) => {
        try {
            if (id) {

                const query = `SELECT saplings FROM ${localShiftTable} WHERE id = ?`;
                const result = await this.db.executeSql(query, [id]);
                let saplings = result[0].rows.item(0).saplings;

                saplings = JSON.parse(saplings);

                saplings = saplings.filter(sapling => sapling.sapling_id !== saplingId);

                console.log("upadted saplings before deleteing----", saplings);

                const updateQuery = `UPDATE ${localShiftTable} 
            SET  saplings = ?
            WHERE id = ?`;

                await this.db.executeSql(updateQuery, [JSON.stringify(saplings), id]);
            } else {

                //find the saplings array from the table which contain that sapling_id and delete the sapling_id from saplings array
                // and update the table 
                //here we don't have id
                // Find the saplings array from the table which contains that sapling_id

                const selectQuery = `SELECT id, saplings FROM ${localShiftTable} WHERE shift_type="updatePlot" ORDER BY id DESC;`;
                const result = await this.db.executeSql(selectQuery);

                for (let i = 0; i < result[0].rows.length; i++) {
                    let row = result[0].rows.item(i);
                    let saplings = JSON.parse(row.saplings);

                    // Check if the saplings array contains the sapling_id
                    const hasSapling = saplings.some(sapling => sapling.sapling_id === saplingId);

                    if (hasSapling) {
                        // Remove the sapling_id from the saplings array
                        saplings = saplings.filter(sapling => sapling.sapling_id !== saplingId);

                        console.log("Updated saplings before deleting----", saplings, row.id);

                        // Update the table with the new saplings array
                        const updateQuery = `UPDATE ${localShiftTable} 
                        SET saplings = ?
                        WHERE id = ?`;

                        return await this.db.executeSql(updateQuery, [JSON.stringify(saplings), row.id]);
                    }
                }
            }

        } catch (error) {
            console.log("Error deleting sapling of the local shift table---", error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to deleting sapling of the local shift table(inside tree_tb(updateSaplingLocalShiftDb))",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    // save tree images
    deleteTree = async (saplingId) => {
        const deleteQuery = `DELETE FROM ${treeTableName} where sapling_id = ?`;
        await this.db.executeSql(deleteQuery, [saplingId]);
        return;
    }

    deleteTreeImages = async (saplingId) => {
        const deleteQuery = `DELETE FROM sapling_images where sapling_id = ?`;
        await this.db.executeSql(deleteQuery, [saplingId]);
        return;
    }

    deleteAddTreeImagesBySaplingId = async (saplingId) => {
        const deleteQuery = `DELETE FROM ${newImageTable} where sapling_id = ?`;
        await this.db.executeSql(deleteQuery, [saplingId]);
        console.log("deleted sapling newImageTable----", saplingId);
    }

    saveTreeImages = async (treeImage) => {
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO sapling_images(sapling_id, image, image_id, remark, timestamp) values` +
                `('${treeImage.sapling_id}', '${treeImage.image}', '${treeImage.image_id}', '${treeImage.remark.replace("'", "''")}', '${treeImage.timestamp}')`;
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
        const updateQuery = `update ${treeTableName} set uploaded=1 where sapling_id = '${id}'`;
        await this.db.executeSql(updateQuery);
    };

    updateTreePlotUpload = async (id) => {
        const updateQuery = `update ${updatePlotsTable} set uploaded=1 where sapling_id = '${id}'`;
        await this.db.executeSql(updateQuery);
    };

    updateShiftUpload = async (id, shift_id, uploadedSaplings) => {
        try {

            const query = `SELECT shift_ended, saplings FROM ${localShiftTable} WHERE id = ?`;
            const result = await this.db.executeSql(query, [id]);
            const shiftEnded = result[0].rows.item(0).shift_ended;
            let saplings = result[0].rows.item(0).saplings;

            //console.log("shiftended---", shiftended, "saplings got--", saplings);

            saplings = JSON.parse(saplings);

            uploadedSaplings.forEach(item1 => {
                for (let i = 0; i < saplings.length; i++) {
                    const item2 = saplings[i];
                    if (item1.sapling_id === item2.sapling_id) {
                        item2.uploaded = 1;
                        break;
                    }
                }
            });

            let updateQuery = null;
            //console.log("---------------uploadedSaplings.length------------------", uploadedSaplings, uploadedSaplings.length, "-------------------saplings.length----------------", saplings, saplings.length)
            if (shiftEnded === 1 && saplings.length === uploadedSaplings.length) {
                updateQuery =
                    `UPDATE ${localShiftTable} 
                 SET shift_id = ?, shift_upload_complete = 1, saplings = ?
                 WHERE id = ?`

                await this.db.executeSql(updateQuery, [shift_id, JSON.stringify(saplings), id]);
            } else {
                updateQuery =
                    `UPDATE ${localShiftTable} 
                 SET shift_id = ?, saplings = ?
                 WHERE id = ?`
                await this.db.executeSql(updateQuery, [shift_id, JSON.stringify(saplings), id]);

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

    changeShiftPlot = async (plotName, shiftID) => {
        try {
            const updateQuery = `UPDATE ${localShiftTable} SET plot_selected = ? WHERE id = ?`;
            return this.db.executeSql(updateQuery, [plotName, shiftID]);
        }
        catch (error) {
            console.log(
                '----------error while changing plot for shift in tree_db-------',
                error,
            );
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to change plot in local shiftTable (inside tree_tb(changeShiftPLot))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    updateTreesWithChangedPlot = async (plot_id, id) => {
        //console.log("shift id updateTreesWithChangedPlot---", id);

        try {
            const results = await this.db.executeSql(`SELECT saplings,shift_type FROM ${localShiftTable} WHERE id = ?`, [id]);
            const result = results[0].rows.item(0);
            let saplingArray = JSON.parse(result?.saplings || '[]');

            const updatePromises = saplingArray.map(sapling => {
                const updateQuery = `UPDATE ${treeTableName} SET plot_id = ? WHERE sapling_id = ?`;
                return this.db.executeSql(updateQuery, [plot_id, sapling.sapling_id]);
            });

            await Promise.all(updatePromises);

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


    updateTreesWithChangedPlotInPlotsTable = async (old_plot, new_plot, id) => {
        console.log("old---" , old_plot, "new---" , new_plot, "id---" , id);
        try {
            const results = await this.db.executeSql(`SELECT saplings,shift_type FROM ${localShiftTable} WHERE id = ?`, [id]);
            const result = results[0].rows.item(0);
            let saplingArray = JSON.parse(result?.saplings || '[]');

            const updatePromises = saplingArray.map(sapling => {
                const updateQuery = `UPDATE ${updatePlotsTable} SET old_plot = ?, new_plot = ? WHERE sapling_id = ?`;
                return this.db.executeSql(updateQuery, [old_plot, new_plot, sapling.sapling_id]);
            });

            await Promise.all(updatePromises);

        } catch (error) {
            console.log(
                '----------error while changing plot for trees in tree_db-------',
                error,
            );
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to update tree with changed plot (inside tree_tb(updateTreesWithChangedPlotInPlotsTable))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    createTreetTypesTbl = async () => {

        try {
            // create table if not exists
            const query = `CREATE TABLE IF NOT EXISTS ${treetypeName}(
            id INTEGER NULL,
            name TEXT NOT NULL,
            value TEXT NOT NULL PRIMARY KEY
        );`;
            await this.db.executeSql(query);
            console.log("tree type created")
        } catch (error) {
            console.log("error creating tree types table---", error);
        }

    };

    updateTreeTypeTbl = async (tree) => {
        try {
            const insertQuery =
                `INSERT OR REPLACE INTO ${treetypeName}(id, name, value) values` +
                `(${tree.id}, '${tree.name}', '${tree.plant_type_id}')`;
            return await this.db.executeSql(insertQuery);
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
        const selectQuery = `SELECT * FROM ${treetypeName} WHERE value IN (SELECT plant_type_id FROM ${treeTableName})`;
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
        const selectQuery = `SELECT * FROM ${plotName} WHERE value IN (SELECT plot_id FROM ${treeTableName})`;
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
            let res = await this.db.executeSql(`SELECT sapling_id as name FROM ${treeTableName}`);
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
            id INTEGER NULL,
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
            `INSERT OR REPLACE INTO ${plotName}(id, name, value) values` +
            `(${plot.id}, '${plot.name}', '${plot.plot_id}')`;
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

    deleteShiftTblLive = async () => {
        console.log("----------Deleting old data and inserting latest in shifts tablet--------- ")
        await this.db.executeSql(`DELETE FROM ${previousShiftTableName}`);
    }

    updateShiftTblLive = async (shift) => {
        // console.log("---------------shift add----------", shift.saplings);

        try {
            const insertShiftsQuery = `
            INSERT OR REPLACE INTO ${previousShiftTableName} (
                end_time, shift_id, shift_type, plot_selected, start_time, timestamp, time_taken, trees_planted, user_id, shift_ended, shift_upload_complete, saplings 
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
                shift.shift_ended,
                shift.shift_upload_complete,
                JSON.stringify(shift.saplings)
            ]);


        } catch (error) {
            console.error('Error updating shift table:', error);
        }
    };

    getAllShiftsLive = async () => {
        const liveShifts = [];
        try {
            let res = await this.db.executeSql( 
                `SELECT * FROM ${previousShiftTableName} ORDER BY shift_id DESC;`,
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

    getSaplingsInLiveShifts = async (id) => {

        try {
            const results = await this.db.executeSql(
                `SELECT saplings,shift_type FROM ${previousShiftTableName} WHERE shift_id = ?`, [id]
            );

            const result = results[0].rows.item(0);
            let saplingArray = JSON.parse(result?.saplings || '[]');
            let shiftType = result?.shift_type || null
            //console.log("sapling for local shift ", id, " ", saplingArray);

            return { saplingArray, shiftType };

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
            plot_id INTEGER NOT NULL,
            sapling_id TEXT NOT NULL PRIMARY KEY,
            lat FLOAT(10,7) NOT NULL,
            lng FLOAT(10,7) NOT NULL
          );`;
            console.log('sapling plot table created')
            await this.db.executeSql(query);
        } catch (error) {
            console.log("error creating sapling plot table--", error);
        }

    }


    //check manjur
    storePlotSaplings = async (plot_id, saplings) => {
        let insertQuery =
            `INSERT OR REPLACE INTO sapling_plot(plot_id,sapling_id ,lat, lng) VALUES`
        for (let i = 0; i < saplings.length; i++) {
            const sapling = saplings[i];
            insertQuery = insertQuery + `(${plot_id},'${sapling[0]}','${sapling[1]}','${sapling[2]}')`;
            if (i != saplings.length - 1) {
                insertQuery = insertQuery + ",";
            }
        }
        insertQuery = insertQuery + ";";

        await this.db.executeSql(insertQuery);
        console.log('trees stored for plot id: ', plot_id)

    }

    deleteSyncedShifts = async (shift_ids) => {
        console.log('-------------deleting shifts------------', shift_ids);
        try {
            for (let i = 0; i < shift_ids.length; i++) {
                //console.log('------------shift_id[i]---------', typeof shift_ids[i]);
                const results = await this.db.executeSql(
                    `SELECT saplings FROM ${localShiftTable} WHERE shift_id = ?`, [shift_ids[i]]
                );

                const result = results[0].rows.item(0);
                let saplingArray = JSON.parse(result?.saplings || '[]');
                console.log("sapling for live shift---", saplingArray);

                //if all saplings uploaded delete the entire shift else keep the tree.
                let uploadedShift = true;
                for (const sapling of saplingArray) {
                    if (sapling.uploaded == 0) {
                        uploadedShift = false;
                        break;
                    }
                }

                if (uploadedShift) {
                    console.log("--------deleteing older shift data and fetching new ones-----");
                    const query = `DELETE FROM ${localShiftTable} where shift_id = '${shift_ids[i]}'`;
                    await this.db.executeSql(query);
                }
            }
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'Error occurred while trying to delete synced shifts from local db (inside tree_db(deleteSyncedShifts))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }


    };

    deleteUpdateTreesPlots = async (sapling_id) => {
        if (sapling_id) {
            const query = `DELETE FROM ${updatePlotsTable} WHERE sapling_id = ?`;
            return this.db.executeSql(query, [sapling_id]);
        } else {
            const query = `DELETE FROM ${updatePlotsTable}`;
            return this.db.executeSql(query);
        }
    }

    deletePlotSaplings = async () => {
        const query = `DELETE FROM sapling_plot`;
        return this.db.executeSql(query);
    }

    checkIfSaplingExistsLocally = async sapling => {
        try {
            let res1 = await this.db.executeSql(
                `SELECT * FROM ${treeTableName} WHERE sapling_id='${sapling}'`,
            );
            const rowCount = res1[0].rows.length;
            // Check if the sapling exists
            return rowCount > 0;
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'Error occurred while trying to check if sapling exists locally (inside tree_db(checkIfSaplingExistsLocally))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    checkIfSaplingExistsInLiveDB = async (sapling) => {
        try {
            let res1 = await this.db.executeSql(
                `SELECT * FROM ${saplingsTableName} WHERE sapling_id='${sapling}'`,
            );
            const rowCount = res1[0].rows.length;

            // Check if the sapling exists
            return rowCount > 0;
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'Error occurred while trying to check if sapling exists in liveDB(inside tree_db(checkIfSaplingExistsLocally))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    };

    checkIfImageAddedAlready = async (sapling) => {
        try {

            let res1 = await this.db.executeSql(`SELECT * FROM ${newImageTable} WHERE sapling_id='${sapling}'`);

            const rowCount = res1[0].rows.length;

            return rowCount > 0;

        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'Error occurred while trying to check if image added already (inside tree_db(checkIfImageAddedAlready))',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await this.logExceptionLocalDB(JSON.stringify(errorLog));
        }
    }

    getSaplingsforPlot = async (plotId) => {

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

