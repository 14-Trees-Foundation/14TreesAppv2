import axios from 'axios';
import { Buffer } from "buffer";
import { ToastAndroid } from 'react-native';
import { Strings } from './Strings';
import { Constants, Utils } from './Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  static devHostName = 'https://dev-api.14trees.org';
  static hostName = 'http://10.0.2.2:8088';
  static phoneHostName = "http://192.168.1.5:8088";
  static serverBase = `${this.phoneHostName}/api/appv2`;

  static async loginUser(userDataPayload) {
    const url = `${DataService.serverBase}/login`;
    console.log("url: ", url);
    console.log("userdata payload: ", userDataPayload);
    let result = await axios.post(url, userDataPayload);
    return result;
  }

  static async fetchHelperData(userId, lastHash, onDownloadProgress = undefined) {
    const token = await AsyncStorage.getItem(Constants.authToken);
    const url = `${DataService.serverBase}/fetchHelperData`;
    return await axios.post(url, {
      user_id: userId,
      last_ash: lastHash
    }, {
      headers: {
        'x-access-token': token
      },
      onDownloadProgress,
    });

  }

  static async fetchShifts(userId, lastHash) {
    const token = await AsyncStorage.getItem(Constants.authToken);
    const url = `${DataService.serverBase}/fetchShifts`;
    return await axios.post(url, {
      user_id: userId,
      last_hash: lastHash,
    },
    {
      headers: {
        'x-access-token': token
      },
    });

  }

  static async fetchPlotSaplings(user_id, lasthash) {
    const token = await AsyncStorage.getItem(Constants.authToken);
    const url = `${DataService.serverBase}/fetchPlotSaplings`;
    return await axios.post(url, {
      userId: user_id,
      lastHash: lasthash
    },{
      headers: {
        'x-access-token': token
      },
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

  static async updateSapling(sapling) {
    const token =  await AsyncStorage.getItem(Constants.authToken);
    const url = `${DataService.serverBase}/updateSapling`;
    return await axios.post(url, sapling, { headers: { 'x-access-token': token } });
  }
  static async uploadLogs(logs) {
    const url = `${DataService.serverBase}/uploadLogs`;
    const response = await axios.post(url, logs);
    if (response) {
      return response.data;
    }
    return;
  }

  static async uploadShifts(shifts) {
    const url = `${DataService.serverBase}/uploadShifts`;
    const response = await axios.post(url, shifts);
    if (response) {
      return response.data;
    }
    return;
  }

  static async uploadTrees(treeList) {
    console.log("treelist images:---", treeList, treeList.length);
    const url = `${DataService.serverBase}/uploadTrees`;
    const response = await axios.post(url, treeList);
    if (response) {
      return response.data;
    }
    return;
  }

  static async uploadNewImages(treeList) {
    const url = `${DataService.serverBase}/uploadNewImages`;
    const response = await axios.post(url, treeList);
    if (response) {
      return response.data;
    }
    return;
  }

  static async uploadTreesNewPlot(treeList) {
    console.log("treelist:---", treeList, treeList.length);
    const url = `${DataService.serverBase}/treesUpdatePlot`;
    const response = await axios.post(url, treeList);
    if (response) {
      return response.data;
    }
    return;
  }

  static async fetchTreeDetails(saplingId) {
    const token = await AsyncStorage.getItem(Constants.authToken);
    const url = `${DataService.serverBase}/getSapling`
    const response = await axios.post(url, {
      sapling_id: saplingId
    },
    {
      headers: {
        'x-access-token': token
      }
    })
    //console.log("response from fetchTreeDetails:- ", response);
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
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while trying to convert fileURLToBase64",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await Utils.logException(JSON.stringify(errorLog));
    }
  }

}