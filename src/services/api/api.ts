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
    ToastAndroid.show('Something went wrong. Please contact the IT Team!', ToastAndroid.LONG);
    console.log(error);
    return null;
  });
  

export class ApiClient {
    private serverBase = API_HOST;
    private uploadDuration: number | null = null;

    private api = axios.create({
        baseURL: this.serverBase,
        onUploadProgress: progressEvent => {
            if (progressEvent.loaded === progressEvent.total) {
                const endTime = performance.now();
                if (this.uploadDuration) {
                  this.uploadDuration = endTime - this.uploadDuration;
                }
            }
        }
    });
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
      return this.uploadDuration;
    }
} 