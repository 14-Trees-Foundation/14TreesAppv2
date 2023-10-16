import axios from 'axios';
export class DataService{
    // serverBase = 'https://47e1-103-21-124-76.ngrok.io';
    static hostName = 'https://vk061k4q-7000.inc1.devtunnels.ms'
    static serverBase = `${this.hostName}/api/v2`
    static async loginUser(userDataPayload){
        const url = `${DataService.serverBase}/login`;
        return await axios.post(url, userDataPayload);
    }
    static async fetchHelperData(user_id){
      const url = `${DataService.serverBase}/fetchHelperData`;
      return await axios.post(url,{
          userId: user_id
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