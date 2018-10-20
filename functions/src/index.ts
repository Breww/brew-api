import * as admin from 'firebase-admin';

admin.initializeApp()

admin.firestore().settings({
  timestampsInSnapshots: true
})

export { recommendCategorical, recommendPersonalized } from './engines/recommendations';