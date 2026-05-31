import Constants from 'expo-constants';

const executionEnvironment = String(Constants.executionEnvironment ?? '');
const appOwnership = String(Constants.appOwnership ?? '');

export const isExpoGo =
  executionEnvironment === 'storeClient' || appOwnership === 'expo';
