import axios from 'axios';
import { ToastAndroid} from 'react-native';
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  let errorMsg;
  let requestDescriptor=null;
  if(error.request){
    const request = error.request;
    requestDescriptor = `${request._method} ${request.responseURL}.`
  }
  if(error.response){
    if(error.response.data){
      errorMsg = `Request failed at server: ${error.response.data}`
    }
    else{
      errorMsg = error.message;
    }

  }
  else if(error.request){
    errorMsg = `Request to be sent: ${error.request}`
  }
  else{
    errorMsg = error.message;
  }
  ToastAndroid.show(errorMsg,ToastAndroid.LONG);
  if(requestDescriptor){
    requestDescriptor = ` (${requestDescriptor})`;
    ToastAndroid.show(requestDescriptor,ToastAndroid.LONG);
  }
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

    // remove the hardcoded adminID later
    static async fetchUsers(adminID){
      console.log('fetching users')
        const url = `${DataService.serverBase}/getUnverifiedUsers`;
        return await axios.post(url,{
          // adminID : adminID
          adminID: "61596d30e78e3cc6282560d0"
      });
    }

    // remove the hardcoded adminID later
    static async verifyUser(user_id){
      console.log('verifying user')
        const url = `${DataService.serverBase}/verifyUser`;
        return await axios.post(url,{
            adminID: "61596d30e78e3cc6282560d0",
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