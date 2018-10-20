import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';

admin.initializeApp()
admin.firestore().settings({
  timestampsInSnapshots: true
})

const algoliaConfig = functions.config().algolia;

const searchClient = algoliasearch(
  algoliaConfig.app_id,
  algoliaConfig.search_key
);

const searchIndex = searchClient.initIndex('breww-index-engine');

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */
export const userPrefRecommendation = functions.https.onRequest(async ({ query }, response) => {
  const { uuid } = query;

  try {
    const result = await admin.firestore().collection('users').doc(uuid).get();
    const resolvedData = result.data();

    const searchTerm = resolvedData.preferredCategories.join(' ');
    const searchResult = await searchIndex.search(searchTerm);

    response.send(searchResult);
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


