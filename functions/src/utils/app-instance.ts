import * as admin from 'firebase-admin';

export const maybeInitializeApp = (function _getInstance (...args) {
  let _cachedAppInstance = null;
  return () => {
    if (_cachedAppInstance) {
      return _cachedAppInstance;
    }
    _cachedAppInstance = admin.initializeApp(...args);

    admin.firestore().settings({ timestampsInSnapshots: true });
    return _cachedAppInstance;
  };
})()
