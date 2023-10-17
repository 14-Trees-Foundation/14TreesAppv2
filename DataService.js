import axios from 'axios';
export class DataService{
    // serverBase = 'https://47e1-103-21-124-76.ngrok.io';
    static serverBase = 'https://vk061k4q-7000.inc1.devtunnels.ms'
    static async loginUser(userDataPayload){
        const url = `${DataService.serverBase}/api/v2/login`;
        return await axios.post(url, userDataPayload);
    }
      static async fetchHelperData(user_id,lasthash){
        const url = `${DataService.serverBase}/v2/fetchHelperData`;
        return await axios.post(url,{
            userId: user_id,
            lastHash: lasthash
        });
    }

    static async fetchUsers(adminID){
        const url = `${DataService.serverBase}/api/v2/getUnverifiedUsers`;
        return await axios.post(url,{
          adminID : adminID
      });
    }

    static async verifyUser(user_id){
        const url = `${DataService.serverBase}/api/v2/verifyUser`;
        return await axios.post(url,{
            adminID: Utils.adminId,
            staffID: user_id
        });
    }

    static async uploadTrees(treeList){
        const url = `${DataService.serverBase}/api/v2/uploadTrees`;
        return await axios.post(url,treeList);
    }
}