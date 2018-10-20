import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

const DEFAULT_FILTER_OFFSET = 0;
const DEFAULT_FILTER_LIMIT = 10;

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
export const getAutoComplete = functions.https.onRequest(async ({ query }, response) => {
  const { name, offset, limit } = query;

  try {
    const searchResponse = await searchIndex.search({
      query: name || '',
      length: limit || DEFAULT_FILTER_LIMIT,
      offset: offset || DEFAULT_FILTER_OFFSET,
      restrictSearchableAttributes: [
        "name"
      ]
    });

    response.send(searchResponse)
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


