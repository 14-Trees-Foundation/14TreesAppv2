import axios from 'axios';
import {
  createTreeTbl,
  updateTreetbl,
  getDBConnection,
  createPlotTbl,
  updatePlotTbl,
  createUsersTbl,
  updateUsersTbl,
} from './tree_db';

export async function fetch_tree_and_plot() {
//   try {
    const db = await getDBConnection();
    await createTreeTbl(db);
    await createPlotTbl(db);
    await createUsersTbl(db);
//     let res = await axios.get('http://13.235.20.199/api/trees/treetypes');
//     res.data.forEach(async tree => {
//       await updateTreetbl(db, tree);
//     });
//     let plotRes = await axios.get('http://13.235.20.199/api/plots');
//     plotRes.data.forEach(async plot => {
//       await updatePlotTbl(db, plot);
//     });
//     let userRes = await axios.get('http://13.235.20.199/api/admin/users/treelogging');
//     userRes.data.forEach(async user => {
//       await updateUsersTbl(db, user);
//     });
//   } catch (error) {
//     Alert.alert(error);
//   }
  return true;
}