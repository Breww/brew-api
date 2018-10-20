import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';
import { BeerEntity, InferenceMap } from '../../typings';
import { maybeInitializeApp } from '../../utils/app-instance';

maybeInitializeApp();

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
export const recommendCategorical = functions.https.onRequest(async ({ query }, response) => {
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
      preferredCategories,
    } = result.data();

    if (!Array.isArray(preferredCategories) || !preferredCategories.length) {
      response.send({
        content: []
      });
      return;
    }

    const searchFilter = preferredCategories
      .map(category => `Category:"${category} "`)
      .join('OR ')
      .trimRight();

    const searchResponse = await searchIndex.search({
      filters: searchFilter,
      length: queryLimit,
      offset: queryOffset,
    });

    const { hits, params } = searchResponse;

     // TODO: Find coherent reducer for type matching
    const trainingSet = hits.map(
      ({ id, category: content }: BeerEntity) => ({ id, content })
    )

    const joinedTrainingSet = trainingSet.concat({
      id: '-1',
      content: preferredCategories.join(' ')
    })

    const referenceMap: InferenceMap = hits.reduce((acc, item) => ({
      ...acc,
      [item.id]: item
    }), {})

    recommender.train(joinedTrainingSet);

    const similarDocuments = recommender.getSimilarDocuments('-1', 0, queryLimit);

    const matchedDocuments = similarDocuments.map(
      ({ id, score }) => ({
        ...referenceMap[id],
        score
      })
    );

    response.send({
      params,
      content: matchedDocuments,
    })
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


