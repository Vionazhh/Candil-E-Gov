import appConfig from './app';
import * as firebase from './firebase';
import * as firestoreConfig from './firestore';
import navigation, { getTabIcon, getTabLabel, stackConfig, tabConfig } from './navigation';
import theme from './theme';

// Export all configurations
export {
  appConfig, firebase, firestoreConfig, getTabIcon,
  getTabLabel, stackConfig, tabConfig, theme
};

// Export default object with all configurations
export default {
  app: appConfig,
  theme,
  navigation,
  firebase,
  firestore: firestoreConfig
}; 