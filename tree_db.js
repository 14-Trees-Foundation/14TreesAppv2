import { enablePromise, openDatabase } from 'react-native-sqlite-storage';

const tableName = 'tree';
const treetypeName = 'treetype';
const plotName = 'plot';
const users = 'users';
enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: 'tree.db', location: 'default' });
};

export const deleteTable = async db => {
  const query = `drop table ${tableName}`;
  await db.executeSql(query);
};

// add lat lng later !!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const createTable = async db => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
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
          Foreign Key (saplingid) references ${tableName}(saplingid)
      );`;

  await db.executeSql(query);
  await db.executeSql(query2);
};

export const getAllTrees = async db=>{
  try {
    const trees = [];
    const results = await db.executeSql(
      `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng, uploaded FROM ${tableName}`,
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
    throw Error('Failed to get treedata !!!');
  }
}
export const getTreesByUploadStatus = async (db,uploaded) => {
  try {
    const trees = [];
    const results = await db.executeSql(
      `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng FROM ${tableName} where uploaded=${uploaded}`,
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
    throw Error('Failed to get treedata !!!');
  }
};

export const getTreeImages = async (db, saplingid) => {
  try {
    const treesimgs = [];
    const results = await db.executeSql(
      `SELECT imageid as name, image as data,remark,timestamp as captureTimestamp FROM sapling_images where saplingid='${saplingid}'`,
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        const image = {
          name: result.rows.item(index).name,
          data: result.rows.item(index).data,
          meta: {
            remark: result.rows.item(index).remark,
            captureTimestamp: result.rows.item(index).captureTimestamp,
          },
        };
        treesimgs.push(image);
      }
    });
    return treesimgs;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get treeimgdata !!!');
  }
};

// get coordinates of all trees from table 'tree'

const getTreeCoordinates = async (db, saplingid) => {
  try {
    const coordinates = [];
    const results = await db.executeSql(
      `SELECT   where saplingid='${saplingid}'`,
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        treesimgs.push(result.rows.item(index));
      }
    });
    return treesimgs;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get treeimgdata !!!');
  }
};


export const getAllTreeCount = async db => {
  try {
    let res = await db.executeSql(`SELECT * FROM ${tableName}`);
    return res[0].rows.length;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get tree count !!!');
  }
};

export const setFalse = async db => {
  try {
    let res = await db.executeSql(`update ${tableName} set uploaded=0`);
    return res[0].rows.length;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get tree count !!!');
  }
};  

export const saveTrees = async (db, i, uploaded) => {
  
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(treeid, saplingid, lat, lng, plotid, uploaded, user_id) values` +
    `('${i.treeid}', '${i.saplingid}', '${i.lat}', '${i.lng}', '${i.plotid}', ${uploaded}, '${i.user_id}')`;
  console.log('insterting tree');
  return db.executeSql(insertQuery);
  
};

// save tree images

export const saveTreeImages = async (db, i) => {
    
    const insertQuery =
        `INSERT OR REPLACE INTO sapling_images(saplingid, image, imageid, remark, timestamp) values` +
        `('${i.saplingid}', '${i.image}', '${i.imageid}', '${i.remark}', '${i.timestamp}')`;
    console.log('image stored!')
    return db.executeSql(insertQuery);
};

export const updateUpload = async (db, id) => {
  const updateQuery = `update ${tableName} set uploaded=1 where saplingid = '${id}'`;
  await db.executeSql(updateQuery);
};

export const createTreeTbl = async db => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${treetypeName}(
    name TEXT NOT NULL,
    value TEXT NOT NULL PRIMARY KEY
  );`;
  await db.executeSql(query);
};

export const updateTreetbl = async (db, tree) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${treetypeName}(name, value) values` +
    `('${tree.name}', '${tree.tree_id}')`;
  return db.executeSql(insertQuery);
};

// get tree names for given list of tree ids
export const getTreeTypes = async db =>{
  const selectQuery = `SELECT * FROM ${treetypeName}`;
  const treeTypes = []
  try{
    let res = await db.executeSql(selectQuery);
    for(let result of res){
      for (let index = 0; index < result.rows.length; index++) {
        treeTypes.push(result.rows.item(index));
      }
    }
    return treeTypes;
  }
  catch(err){
    console.log(err)
  }
}
export const getTreeNames = async db => {
  const selectQuery = `SELECT * FROM ${treetypeName} WHERE value IN (SELECT treeid FROM ${tableName})`;
  const treeNames = [];

  try {
    let res = await db.executeSql(selectQuery);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        treeNames.push(result.rows.item(index));
      }
    });
    return treeNames;
  }
  catch (error) {
    console.error(error);
    throw Error('Failed to get tree names !!!');
  }
  
};

export const getPlotNames = async db => {
  const selectQuery = `SELECT * FROM ${plotName} WHERE value IN (SELECT plotid FROM ${tableName})`;
  const plotNames = [];

  try {
    let res = await db.executeSql(selectQuery);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        plotNames.push(result.rows.item(index));
      }
    });
    return plotNames;
  }
  catch (error) {
    console.error(error);
    throw Error('Failed to get plot names !!!');
  }
  
}

// get sapling ids of all trees from table 'tree'

export const getSaplingIds = async db => {
  const saplings = [];
  try {
    let res = await db.executeSql(`SELECT saplingid as name FROM ${tableName}`);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        saplings.push(result.rows.item(index));
      }
    });
    return saplings;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get saplingids !!!');
  }
};



export const getTreesList = async db => {
  const trees = [];
  try {
    let res = await db.executeSql(`SELECT * FROM ${treetypeName}`);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        trees.push(result.rows.item(index));
      }
    });
    return trees;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get tree !!!');
  }
};

export const createPlotTbl = async db => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${plotName}(
    name TEXT NOT NULL,
    value TEXT NOT NULL PRIMARY KEY
  );`;

  await db.executeSql(query);
};

export const updatePlotTbl = async (db, plot) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${plotName}(name, value) values` +
    `('${plot.name}', '${plot.plot_id}')`;
  return db.executeSql(insertQuery);
};

export const getPlotsList = async db => {
  const plots = [];
  try {
    let res = await db.executeSql(`SELECT * FROM ${plotName}`);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        plots.push(result.rows.item(index));
      }
    });
    return plots;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get plots !!!');
  }
};

export const createUsersTbl = async db => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${users}(
    name TEXT NOT NULL,
    user_id TEXT NOT NULL PRIMARY KEY
  );`;

  await db.executeSql(query);
};

export const updateUsersTbl = async (db, user) => {
  console.log("Userr : ", user)
  const insertQuery =
    `INSERT OR REPLACE INTO ${users}(name, user_id) values` +
    `('${user.name}', '${user.user_id}')`;
  let res = await db.executeSql(insertQuery);
  return res;
};

export const getUsersList = async db => {
  const retRes = [];
  try {
    let res = await db.executeSql(`SELECT * FROM ${users}`);
    console.log(res);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        retRes.push(result.rows.item(index));
      }
    });
    return retRes;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Users !!!');
  }
};