import axios from 'axios';
import { ToastAndroid } from 'react-native';
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  let errorMsg;
  if(error.response){
    errorMsg = `Request failed at server: ${error.response.data}`
  }
  else if(error.request){
    errorMsg = `Request to be sent: ${error.request}`
  }
  else{
    errorMsg = error.message;
  }
  ToastAndroid.show(errorMsg,ToastAndroid.LONG);
  console.log(errorMsg);
  return null;
});
export class DataService{
    static hostName = 'https://vk061k4q-7000.inc1.devtunnels.ms'
    // static hostName = 'http://localhost:7000'
    static serverBase = `${this.hostName}/api/v2`
    static async loginUser(userDataPayload){
        const url = `${DataService.serverBase}/login`;
        return await axios.post(url, userDataPayload);
    }
      static async fetchHelperData(user_id,lasthash){
        const url = `${DataService.serverBase}/fetchHelperData`;
        return await axios.post(url,{
          userId: user_id,
          lastHash: lasthash
      });
    }

    static async fetchUsers(adminID){
        const url = `${DataService.serverBase}/getUnverifiedUsers`;
        return await axios.post(url,{
          adminID : adminID
      });
    }

    static async verifyUser(user_id){
        const url = `${DataService.serverBase}/verifyUser`;
        return await axios.post(url,{
            adminID: Utils.adminId,
            staffID: user_id
        });
    }

    static async uploadTrees(treeList){
        const url = `${DataService.serverBase}/uploadTrees`;
        return await axios.post(url,treeList);
    }
    static async fetchTreeDetails(saplingID, adminID){
      const url = `${DataService.serverBase}/getSapling`
      return (await axios.post(url,{
        adminID:adminID,
        saplingID:saplingID
      })).data
    }
}