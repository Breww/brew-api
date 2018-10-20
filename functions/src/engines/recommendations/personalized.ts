import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';

if (!admin.app) {
  admin.initializeApp();
}

import * as pluralize from 'pluralize';

import { BeerEntity } from '../../model/beer';

const DEFAULT_FILTER_OFFSET = 0;
const DEFAULT_FILTER_LIMIT = 10;
const DEFAULT_MIN_SCORE = .1;

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
export const recommendPersonal = functions.https.onRequest(async ({ query }, response) => {
  const ContentBasedRecommender = require('content-based-recommender')

  const { uuid, offset, limit } = query;

  const queryOffset = Number(offset || DEFAULT_FILTER_OFFSET);
  const queryLimit = Number(limit || DEFAULT_FILTER_LIMIT);

  const recommender = new ContentBasedRecommender({
    minScore: DEFAULT_MIN_SCORE,
    maxSimilarDocuments: queryLimit
  });

  if (!uuid) {
    response.status(404).send({ message: '`uuid` required as a request param' });
    return;
  }

  try {
    const result = await admin.firestore().collection('users').doc(uuid).get();
    
    const {
      beers,
    } = result.data();

    if (!Array.isArray(beers) || !beers.length) {
      response.send({
        content: []
      });
      return;
    }

    const terms = beers.reduce(({ names, styles, categories }, { name, style, category }: BeerEntity) => ({
      names: [...names, name],
      styles: [...styles, style],
      categories: [...categories, category]
    }), { names: [], styles: [], categories: [] });

    const reducedTerms = Object.keys(terms).map(
      key => terms[key].map(prop => `${pluralize.singular(key)}:"${prop}"`).join('OR ')
    ).join('AND ')

    response.send(reducedTerms);
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


