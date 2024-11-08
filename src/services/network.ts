
import NetInfo from "@react-native-community/netinfo";
import { ApiClient } from "./api/api";
import { dummyFileData } from "./api/dummy_file";

function getByteSize() {
    let byteSize = 0;
    for (let i = 0; i < dummyFileData.length; i++) {
      const charCode = dummyFileData.charCodeAt(i);
      if (charCode < 0x80) {
        byteSize += 1; // 1 byte for characters in the range U+0000 to U+007F
      } else if (charCode < 0x800) {
        byteSize += 2; // 2 bytes for characters in the range U+0080 to U+07FF
      } else if (charCode < 0x10000) {
        byteSize += 3; // 3 bytes for characters in the range U+0800 to U+FFFF
      } else {
        byteSize += 4; // 4 bytes for characters in the range U+10000 to U+10FFFF
      }
    }
    return byteSize;
  }

export const measureNetworkSpeed = async () => {

    try {
        const info = await NetInfo.fetch();
        if (info.isConnected) {
          const apiClient = new ApiClient();
      
          const timeTaken = await apiClient.uploadDummyFile();
          const dataSize = getByteSize();
          return (dataSize * 1000) / (1024 * timeTaken); // KBps
      
        } else {
          throw new Error("You are not connected to internet!")
        }
    } catch(error: any) {
        throw new Error(error.message);
    }
};
