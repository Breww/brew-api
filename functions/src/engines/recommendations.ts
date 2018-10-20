import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

import { BeerAttr } from '../model/beer';

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */
export const userPrefRecommendation = functions.https.onRequest(({ body }, response) => {
  const { uuid, limit, } = body;

  const searchClient = algoliasearch(
    functions.config().algolia.app_id,
    functions.config().algolia.search_key
  )

  const searchIndex = searchClient.initIndex('breww-index-engine')

  searchIndex.setSettings({
    attributesToRetrieve: [
      BeerAttr.NAME,
      BeerAttr.CATEGORY,
      BeerAttr.STYLE,
      BeerAttr.ABV,
      BeerAttr.IBU,
      BeerAttr.DESCRIPTION,
    ],
    hitsPerPage: 500,
  }).then(() => {
    searchIndex.browseAll().then(searchResult => {
      response.send(searchResult)
    }).catch(() => response.status(404).send({
      message: 'No valid response'
    }));
  })
});


