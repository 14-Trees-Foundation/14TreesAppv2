import {RESULTS, requestMultiple} from 'react-native-permissions';

// This function can be used anywhere as it supports multiple permissions.
// It checks for permissions and then requests for it.
export async function checkMultiplePermissions(permissions) {
  let isPermissionGranted = false;
  const statuses = await requestMultiple(permissions);
  for (var index in permissions) {
    console.log(permissions[index] + ' : ' + statuses[permissions[index]]);
    if (statuses[permissions[index]] === RESULTS.GRANTED) {
      isPermissionGranted = true;
    } else {
      isPermissionGranted = false;
      break;
    }
  }
  return isPermissionGranted;
}