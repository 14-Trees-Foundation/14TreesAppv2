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
          Foreign Key (saplingid) references ${tableName}(saplingid)
      );`;

  await db.executeSql(query);
  await db.executeSql(query2);
};


export const getTreesToUpload = async db => {
  try {
    const trees = [];
    const results = await db.executeSql(
      `SELECT saplingid as sapling_id, treeid as type_id, plotid as plot_id, user_id, lat,lng FROM ${tableName} where uploaded=0`,
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        trees.push(result.rows.item(index));
        // const imgresults =  db.executeSql(`SELECT  imageid as name, image as data FROM sapling_images where saplingid='${result.rows.item(index).sapling_id}'`);
        // imgresults.forEach(imgresult => {
        //   for (let indexi = 0; indexi < imgresult.rows.length; indexi++) {
        //     images.push(imgresult.rows.item(indexi));
        //   }
        // });
        // const coordresults = db.executeSql(
        //   `SELECT lat, lng FROM ${tableName} where saplingid='${result.rows.item(
        //     index,
        //   ).saplingid}'`,
        // );
        // coordresults.forEach(coordresult => {
        //   for (let indexc = 0; indexc < coordresult.rows.length; indexc++) {
        //     coordinates.push(coordresult.rows.item(indexc));
        //   }
        // }
        // );
        // trees[index].images = getTreeImages(db,trees[index].sapling_id); 
        // trees[index].coordinates = getTreeCoordinates(db,trees[index].sapling_id);
      }

    });

    // for(index = 0; index < trees.length; index++){
      //fetch image and add to tree
      // trees[index].images = await getTreeImages(db,trees[index].sapling_id);
      // console.log(trees[index].sapling_id,' : ');
      // console.log(trees[index].images);
      //fetch coordinates and add to tree
      // trees[index].coordinates = await getTreeCoordinates(db,trees[index].sapling_id);
    // }



    // convert trees to dictionary
    // const treesDict = {};

    // trees.forEach(tree => {

    //   if (treesDict[tree.sapling_id] === undefined) {
    //     treesDict[tree.sapling_id] = {
    //       sapling_id: tree.sapling_id,
    //       type_id: tree.type_id,
    //       plot_id: tree.plot_id,
    //       user_id: tree.user_id,
    //       images: [],
    //       coordinates: []
    //     };
    //   }
    //   treesDict[tree.sapling_id].images.push(tree.images);
    //   treesDict[tree.sapling_id].coordinates.push(tree.coordinates);
    // }
    // );
    // console.log(treesDict);
    // return treesDict;

    return trees;


  } catch (error) {
    console.error(error);
    throw Error('Failed to get treedata !!!');
  }
};

export const getTreeImages = async (db, saplingid) => {
  try {
    const treesimgs = [];
    const results = await db.executeSql(
      `SELECT imageid as name, image as Data FROM sapling_images where saplingid='${saplingid}'`,
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        const image = {
          name: result.rows.item(index).name,
          data: result.rows.item(index).Data,
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
        `INSERT OR REPLACE INTO sapling_images(saplingid, image, imageid) values` +
        `('${i.saplingid}', '${i.image}', '${i.imageid}')`;
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

// get sapling ids of all trees from table 'tree'

export const getSaplingIds = async db => {
  const saplings = [];
  try {
    let res = await db.executeSql(`SELECT saplingid FROM ${tableName}`);
    res.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        saplings.push(result.rows.item(index).saplingid);
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