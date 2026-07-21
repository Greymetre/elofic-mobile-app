import RNFetchBlob from 'react-native-blob-util';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

const downloadExpenseImage = async (url: any, fileName = null) => {
  try {
    // Show downloading alert
    Alert.alert('Downloading...', 'Please wait');

    // Request permission for Android
    // if (Platform.OS === 'android') {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    //   );
    //   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //     Alert.alert('Permission Denied', 'Storage permission is required to download files');
    //     return;
    //   }
    // }

    // Extract original filename if not provided
    const originalName = url.split('/').pop();
    const finalFileName = fileName || originalName;

    const config = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: finalFileName,
        description: 'Downloading expense document...',
        mime: getMimeType(url),
        mediaScannable: true,
        path: Platform.OS === 'android'
          ? RNFetchBlob.fs.dirs.DownloadDir + '/' + finalFileName
          : undefined,
      },
      path: Platform.OS === 'ios'
        ? RNFetchBlob.fs.dirs.DocumentDir + '/' + finalFileName
        : undefined,
    };

    const res = await RNFetchBlob.config(config).fetch('GET', url);

    if (res.info().status === 200) {
      Alert.alert(
        'Download Successful',
        `File saved as: ${finalFileName}\n\nLocation: ${Platform.OS === 'android' ? 'Downloads' : 'Files'} folder`
      );
    } else {
      Alert.alert('Download Failed', 'Please try again');
    }
  } catch (error: any) {
    console.error('Download Error:', error);
    Alert.alert('Error', 'Failed to download file: ' + error.message);
  }
};

// Helper to get MIME type
const getMimeType = (url: any) => {
  if (url.endsWith('.pdf')) return 'application/pdf';
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  if (url.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
};

export default downloadExpenseImage;