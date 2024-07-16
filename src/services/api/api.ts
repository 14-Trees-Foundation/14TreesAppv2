import axios from 'axios'
import { Strings } from '../Strings';
import { ToastAndroid } from 'react-native';
import { UserService } from './users';
import { TreeService } from './trees';

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
  

export class ApiClient {
    private serverBase = 'https://api.14trees.org';
    private api = axios.create({
        baseURL: this.serverBase,
    });
    public users = new UserService(this.api);
    public trees = new TreeService(this.api);
} 