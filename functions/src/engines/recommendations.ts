import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';

const DEFAULT_FILTER_OFFSET = 0;
const DEFAULT_FILTER_LIMIT = 10;

admin.initializeApp()
admin.firestore().settings({
  timestampsInSnapshots: true
})

const algoliaConfig = functions.config().algolia || {};

const searchClient = algoliasearch(
  algoliaConfig.app_id,
  algoliaConfig.search_key,
);

const searchIndex = searchClient.initIndex('breww-index-engine');

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */
export const userPrefRecommendation = functions.https.onRequest(async ({ query }, response) => {
  const { uuid, offset, limit } = query;

  if (!uuid) {
    response.status(404).send({ message: '`uuid` required as a request param' });
    return;
  }

  try {
    const result = await admin.firestore().collection('users').doc(uuid).get();
    
    const {
      preferredCategories,
    } = result.data();

    if (!Array.isArray(preferredCategories) || !preferredCategories.length) {
      // TODO: Handle not instantiated
    }

    const searchFilter = preferredCategories
      .map(category => `Category:"${category} "`)
      .join('OR ')
      .trimRight();

    const searchResponse = await searchIndex.search({
      filters: searchFilter,
      length: limit || DEFAULT_FILTER_LIMIT,
      offset: offset || DEFAULT_FILTER_OFFSET,
    });

    response.send(searchResponse)
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


