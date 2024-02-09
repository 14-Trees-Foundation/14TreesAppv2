import axios from 'axios';
import { Buffer } from "buffer";
import { ToastAndroid } from 'react-native';
import { Strings } from './Strings';

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  let errorMsg;
  let requestDescriptor = null;
  if (error.request) {
    const request = error.request;
    console.log(request)
    if (request.responseURL) {
      requestDescriptor = `${request._method} ${request.responseURL}.`
    }
    else if (request._response) {
      requestDescriptor = `${request._response}.`
    }
    else {
      requestDescriptor = `${request._method} ${request._url}.`
    }
  }
  if (error.response) {
    if (error.response.data) {
      errorMsg = Strings.alertMessages.FailedAtServer + (error.response.data)
    }
    else {
      errorMsg = error.message;
    }
  }
  else if (error.request) {
    errorMsg = `Request to be sent: ${error.request}`
  }
  else {
    errorMsg = error.message;
  }
  ToastAndroid.show(errorMsg, ToastAndroid.LONG);
  if (requestDescriptor) {
    requestDescriptor = ` (${requestDescriptor})`;
    ToastAndroid.show(requestDescriptor, ToastAndroid.LONG);
  }
  console.log(error);
  return null;
});

export class DataService {

  
  static productionHostName = 'https://api.14trees.org';
  //static hostName = 'https://vk061k4q-7000.inc1.devtunnels.ms';
  static hostName = 'http://10.0.2.2:7000';
  static serverBase = `${this.hostName}/api/appv2`;

  static async loginUser(userDataPayload) {
    const url = `${DataService.serverBase}/login`;
    console.log("url: ", url);
    console.log("userdata payload: ", userDataPayload);
    let result = await axios.post(url, userDataPayload);
    // result = JSON.parse(result);
    //console.log("result: ", result);
    return result;
  }

  static async fetchHelperData(user_id, lasthash, onDownloadProgress = undefined) {
    const url = `${DataService.serverBase}/fetchHelperData`;
    return await axios.post(url, {
      userId: user_id,
      lastHash: lasthash
    }, {
      onDownloadProgress,
    });

  }

  static async fetchPlotSaplings(user_id, lasthash) {
    const url = `${DataService.serverBase}/fetchPlotSaplings`;
    return await axios.post(url, {
      userId: user_id,
      lastHash: lasthash
    });
  }


  static async fetchUsers(adminID) {
    console.log('fetching users')
    const url = `${DataService.serverBase}/getUnverifiedUsers`;
    return await axios.post(url, {
      adminID: adminID
    });
  }


  static async verifyUser(user_id, adminID) {
    console.log('verifying user')
    const url = `${DataService.serverBase}/verifyUser`;
    return await axios.post(url, {
      adminID: adminID,
      staffID: user_id
    });
  }

  static async updateSapling(adminID, sapling) {
    const url = `${DataService.serverBase}/updateSapling`;
    return await axios.post(url, { adminID: adminID, sapling: sapling });
  }

  static async uploadTrees(treeList) {
    const url = `${DataService.serverBase}/uploadTrees`;
    const response = await axios.post(url, treeList);
    if (response) {
      return response.data;
    }
    return;
  }

  static async fetchTreeDetails(saplingID, adminID) {
    const url = `${DataService.serverBase}/getSapling`
    const response = (await axios.post(url, {
      adminID: adminID,
      saplingID: saplingID
    }))
    if (response) {
      return response.data;
    }
  }

  static async fileURLToBase64(url) {
    try {
      // Send a GET request to the URL
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      // Convert the response data to a Base64 string
      const base64String = Buffer.from(response.data, 'binary').toString('base64');

      return base64String;
    } catch (error) {
      console.error('Error:', error);
    }
  }

}