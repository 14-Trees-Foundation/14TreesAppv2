import axios from 'axios';
import {
  createTreetTypesTbl,
  updateTreeTypeTbl,
  getDBConnection,
  createPlotTbl,
  updatePlotTbl,
  createUsersTbl,
  updateUsersTbl,
} from './tree_db';
import {Alert} from 'react-native';
const failedPlotIds = [];
export async function fetch_tree_and_plot() {
  try {
    const db = await getDBConnection();
    await createTreetTypesTbl(db);
    await createPlotTbl(db);
    await createUsersTbl(db);
    console.log('tables created')
    let res = await axios.get('http://13.235.20.199/api/trees/treetypes');
    res.data.forEach(async tree => {
      await updateTreeTypeTbl(db, tree);
    });
    let plotRes = await axios.get('http://13.235.20.199/api/plots');
    plotRes.data.forEach(async plot => {
      if(plot.name){
        plot.name = plot.name.replace("'","''");
        await updatePlotTbl(db, plot).catch((err)=>{
          Alert.alert('Plot Save Failure',`Failed to save plot, _id=${plot._id}`);
          failedPlotIds.push(plot._id);
        });
      }
      else{
        failedPlotIds.push(plot._id);
        console.log(plot)
      }
    });
    let userRes = await axios.get('http://13.235.20.199/api/admin/users/treelogging');
    userRes.data.forEach(async user => {
      await updateUsersTbl(db, user);
    });
  } catch (error) {
    Alert.alert(error);
  }
  return true;
}