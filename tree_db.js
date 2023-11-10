import { enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { Alert } from 'react-native';
import { Strings } from './Strings';
const treeTableName = 'tree';
const treetypeName = 'treetype';
const plotName = 'plot';
const users = 'users';
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
        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS ${treeTableName}(
            treeid TEXT NOT NULL,
            saplingid TEXT NOT NULL PRIMARY KEY,
            lat TEXT ,
            lng TEXT ,
            plotid TEXT NOT NULL,
            uploaded INTEGER NOT NULL,
            user_id TEXT NOT NULL
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

        await this.db.executeSql(query);
        await this.db.executeSql(query2);
    };

    getAllTrees = async () => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng, uploaded FROM ${treeTableName}`,
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
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata',Strings.english));
        }
    }
    getTreesByUploadStatus = async (uploaded) => {
        try {
            const trees = [];
            const results = await this.db.executeSql(
                `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng FROM ${treeTableName} where uploaded=${uploaded}`,
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
            Alert.alert(Strings.alertMessages.getString('FailedGetTreedata',Strings.english));
        }
    };
    deleteSyncedTrees = async()=>{
        const query = `DELETE FROM ${treeTableName} where uploaded = ?`;
        console.log(query);
        await this.db.executeSql(query,[1]);
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
                            remark: result.rows.item(index).remark.replace("''","'"),
                            capturetimestamp: result.rows.item(index).captureTimestamp,
                        },
                    };
                    treesimgs.push(image);
                }
            });
            return treesimgs;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeImages',Strings.english));
        }
    };

    getAllTreeCount = async () => {
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${treeTableName}`);
            return res[0].rows.length;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeCount',Strings.english));
        }
    };

    setFalse = async () => {
        try {
            let res = await this.db.executeSql(`update ${treeTableName} set uploaded=0`);
            return res[0].rows.length;
        } catch (error) {
            console.error(error);
            Alert.alert(Strings.alertMessages.getString('FailedSetFalse',Strings.english));
        }
    };

    saveTrees = async (tree, uploaded) => {

        const insertQuery =
            `INSERT OR REPLACE INTO ${treeTableName}(treeid, saplingid, lat, lng, plotid, uploaded, user_id) values` +
            `('${tree.treeid}', '${tree.saplingid}', '${tree.lat}', '${tree.lng}', '${tree.plotid}', ${uploaded}, '${tree.user_id}')`;
        console.log('insterting tree');
        return this.db.executeSql(insertQuery);

    };

    // save tree images

    saveTreeImages = async (treeimage) => {

        const insertQuery =
            `INSERT OR REPLACE INTO sapling_images(saplingid, image, imageid, remark, timestamp) values` +
            `('${treeimage.saplingid}', '${treeimage.image}', '${treeimage.imageid}', '${treeimage.remark.replace("'","''")}', '${treeimage.timestamp}')`;
        console.log('image stored!')
        return this.db.executeSql(insertQuery);
    };

    updateUpload = async (id) => {
        const updateQuery = `update ${treeTableName} set uploaded=1 where saplingid = '${id}'`;
        await this.db.executeSql(updateQuery);
    };

    createTreetTypesTbl = async () => {
        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS ${treetypeName}(
        name TEXT NOT NULL,
        value TEXT NOT NULL PRIMARY KEY
    );`;
        await this.db.executeSql(query);
    };

    updateTreeTypeTbl = async (tree) => {
        const insertQuery =
            `INSERT OR REPLACE INTO ${treetypeName}(name, value) values` +
            `('${tree.name}', '${tree.tree_id}')`;
        return this.db.executeSql(insertQuery);
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
        catch (err) {
            console.log(err)
        }
    }
    getTreeNames = async () => {
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
            Alert.alert(Strings.alertMessages.getString('FailedGetTreeNames',Strings.english));
        }

    };

    getPlotNames = async () => {
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
            Alert.alert(Strings.alertMessages.getString('FailedGetPlotNames',Strings.english));
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
            Alert.alert(Strings.alertMessages.getString('FailedGetSaplingIds',Strings.english));
        }
    };



    getTreesList = async () => {
        const trees = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${treetypeName}`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    trees.push(result.rows.item(index));
                }
            });
            return trees;
        } catch (error) {
            console.error(error);
        }
    };

    createPlotTbl = async () => {
        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS ${plotName}(
      name TEXT NOT NULL,
      value TEXT NOT NULL PRIMARY KEY
    );`;

        await this.db.executeSql(query);
    };

    updatePlotTbl = async (plot) => {
        const insertQuery =
            `INSERT OR REPLACE INTO ${plotName}(name, value) values` +
            `('${plot.name}', '${plot.plot_id}')`;
        return this.db.executeSql(insertQuery);
    };

    getPlotsList = async () => {
        const plots = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${plotName}`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    plots.push(result.rows.item(index));
                }
            });
            return plots;
        } catch (error) {
            console.error(error);
        }
    };

    // a table of sapling ids with their corresponding plot ids and lat,long
    


    createSaplingPlotTbl = async () => {
        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS sapling_plot(
      plotid TEXT NOT NULL,
      saplingid TEXT NOT NULL PRIMARY KEY,
      lat FLOAT(10,7) NOT NULL,
      lng FLOAT(10,7) NOT NULL
    );`;
            console.log('sapling plot table created')
        await this.db.executeSql(query);
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

    getSaplingsforPlot = async () => {
        // console.log('plot id: ', plot_id)
        const saplings = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM sapling_plot`);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    saplings.push(result.rows.item(index));
                }
            });
            return saplings;
        } catch (error) {
            console.error(error);
        }
    }

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
    

    createUsersTbl = async () => {
        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS ${users}(
      name TEXT NOT NULL,
      user_id TEXT NOT NULL PRIMARY KEY
    );`;

        await this.db.executeSql(query);
    };

    updateUsersTbl = async (user) => {
        console.log("Userr : ", user)
        const insertQuery =
            `INSERT OR REPLACE INTO ${users}(name, user_id) values` +
            `('${user.name}', '${user.user_id}')`;
        let res = await this.db.executeSql(insertQuery);
        return res;
    };

    getUsersList = async () => {
        const retRes = [];
        try {
            let res = await this.db.executeSql(`SELECT * FROM ${users}`);
            console.log(res);
            res.forEach(result => {
                for (let index = 0; index < result.rows.length; index++) {
                    retRes.push(result.rows.item(index));
                }
            });
            return retRes;
        } catch (error) {
            console.error(error);
        }
    };
}

