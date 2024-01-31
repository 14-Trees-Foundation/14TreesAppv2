import { RESULTS, request, requestMultiple } from 'react-native-permissions';

// This function can be used anywhere as it supports multiple permissions.
// It checks for permissions and then requests for it.
export async function checkMultiplePermissions(permissions) {
  let isPermissionGranted = false;

  for (var index in permissions) {
    const statuses = await request(permissions[index]);
    console.log(permissions[index] + ' : ' + statuses);
    if (statuses === RESULTS.GRANTED) {
      isPermissionGranted = true;
    } else {
      isPermissionGranted = false;
      break;
    }
  }


  return isPermissionGranted;
}