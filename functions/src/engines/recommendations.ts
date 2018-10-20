import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';

admin.initializeApp()
admin.firestore().settings({
  timestampsInSnapshots: true
})

const algoliaConfig = functions.config().algolia || {};

const searchClient = algoliasearch(
  algoliaConfig.app_id || '3H1HDP91P5',
  algoliaConfig.search_key || '650d307ff3d923192e3100fd418e03b5'
);

const searchIndex = searchClient.initIndex('breww-index-engine');

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */
export const userPrefRecommendation = functions.https.onRequest(async ({ query }, response) => {
  const { uuid } = query;

  if (!uuid) {
    response.status(404).send({ message: '`uuid` required as a request param' });
    return;
  }

  try {
    const result = await admin.firestore().collection('users').doc(uuid).get();
    
    const {
      preferredCategories,
    } = result.data();

    const searchFilter = preferredCategories
      .map(category => `Category:"${category} "`)
      .join('OR ')
      .trimRight();

    const searchResponse = await searchIndex.search({
      filters: searchFilter,
      length: 10,
      offset: 0,
    });

    response.send(searchResponse)
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


