import axios from 'axios'
import { Strings } from '../Strings';
import { ToastAndroid } from 'react-native';
import { UserService } from './users';
import { TreeService } from './trees';
import { PlotService } from './plots';
import { SiteService } from './sites';
import { VisitService } from './visits';
import { VisitImageService } from './visit_images';
import { API_HOST } from '../../constants/constants';
import { TreeSnapshotService } from './tree_snapshots';
import { dummyFileData } from './dummy_file';
import { SyncInfoService } from './sync_info';
import { PlantTypeService } from './plant_type';


export class ApiClient {
    private serverBase = API_HOST;
    private uploadDuration: number | null = null;

    private api = axios.create({
        baseURL: this.serverBase,
        onUploadProgress: progressEvent => {
            if (progressEvent.loaded === progressEvent.total) {
                const endTime = performance.now();
                if (this.uploadDuration !== null) {
                  this.uploadDuration = endTime - this.uploadDuration;
                }
            }
        }
    });

    constructor() {
        // Response Interceptor
        this.api.interceptors.response.use(function (response) {
            return response;
          }, function (error) {
            let errorMsg;
            let requestDescriptor = null;
            if (error.request) {
              const request = error.request;
              console.log("Request from Intereptor: ", request)
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
            ToastAndroid.show('Something went wrong. Please contact the IT Team!', ToastAndroid.LONG);
            console.log("Response Interceptor Error (log)", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.warn("Response Interceptor Error (warn)", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error("Response Interceptor Error (error)", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            return null;
          });

        // Request Interceptor: Log outgoing requests
        this.api.interceptors.request.use(
          (config) => {
            let dataToLog = config.data;
            if (typeof config.data === 'object' && config.data !== null) {
              try {
                dataToLog = JSON.parse(JSON.stringify(config.data));
              } catch (e) {
                dataToLog = '[Non-serializable data]';
              }
            }
            console.log('Starting Request:');
            console.log('Method:', config.method?.toUpperCase());
            console.log('URL:', config.url);
            // console.log('Headers:', config.headers);
            console.log('Data:', dataToLog);
            return config;
          },
          (error) => {
            console.error('Request Error:', error.message);
            return Promise.reject(error);
          }
        );
    }

    public users = new UserService(this.api);
    public trees = new TreeService(this.api);
    public plots = new PlotService(this.api);
    public sites = new SiteService(this.api);
    public visits = new VisitService(this.api);
    public visitImages = new VisitImageService(this.api);
    public treeSnapshots = new TreeSnapshotService(this.api);
    public syncInfo = new SyncInfoService(this.api);
    public plantTypes = new PlantTypeService(this.api);

    //  this is to check network speed
    async uploadDummyFile(): Promise<number> {
      const url = `/api/appv2/test-upload`;
      this.uploadDuration = performance.now();
      const response = await this.api.post<void>(url, { data: dummyFileData });
      return this.uploadDuration || 0;
    }
} 