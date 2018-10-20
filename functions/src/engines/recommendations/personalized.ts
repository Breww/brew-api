import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as algoliasearch from 'algoliasearch';
import * as pluralize from 'pluralize';

const unique = require("array-unique").immutable;

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
export const recommendPersonal = functions.https.onRequest(async ({ query }, response) => {
  const ContentBasedRecommender = require('content-based-recommender')

  const { uuid, offset, limit } = query;

  const queryOffset = Number(offset || DEFAULT_FILTER_OFFSET);
  const queryLimit = Number(limit || DEFAULT_FILTER_LIMIT);

  if (!uuid) {
    response.status(404).send({ message: '`uuid` required as a request param' });
    return;
  }

  try {
    const result = await admin.firestore().collection('users').doc(uuid).get();
    
    const {
      beers,
      preferredCategories
    } = result.data();

    if (!Array.isArray(beers) || !beers.length) {
      response.send({
        content: []
      });
      return;
    }
    
    // filter out bad rating beers
    const filteredBeers = beers.filter(({ rating }: BeerEntity) => Boolean(Number(rating)))
    const mappedCategories = preferredCategories.map(category => ({ category }));

    const userPreferences = [
      ...filteredBeers,
      ...mappedCategories,
    ];

    const terms = userPreferences.reduce(({ categories }, { category }: BeerEntity) => ({
      categories: [...categories, category]
    }), { categories: [] });

    const searchFilter = Object.keys(terms).map(
      key => unique(terms[key]).map(prop => `${pluralize.singular(key)}:"${prop}" `).join('OR ')
    ).join('AND ')

    const { hits, params } = await searchIndex.search({
      filters: searchFilter,
      length: 1000,
      offset: queryOffset,
    });

    const trainingSet = hits.map(
      ({ id, category, style }: BeerEntity) => ({
        id,
        content: `${category} ${style}`
      })
    )

    const referenceMap: InferenceMap = hits.reduce((acc, hit) => ({
      ...acc,
      [hit.id]: hit
    }), {})

    const scoredResponseSets = beers.reduce((acc, { category }: BeerEntity) => {
      const recommender = new ContentBasedRecommender({
        minScore: DEFAULT_MIN_SCORE,
        maxSimilarDocuments: queryLimit * 5,
      });
      
      const joinedTrainingSet = trainingSet.concat({ id: '-1', content: category })
  
      recommender.train(joinedTrainingSet);
  
      const similarDocuments = recommender.getSimilarDocuments('-1', 0, queryLimit * 2);
  
      const matchedDocuments = similarDocuments.map(
        ({ id, score }) => ({
          ...referenceMap[id],
          score
        })
      );

      return [
        ...acc,
        ...matchedDocuments,
      ]
    }, []);

    const responseContent = scoredResponseSets.sort(({ score: a }, { score: b }) => Number(a) < Number(b))
      .slice(0, queryLimit)

    response.send({
      content: responseContent,
      params
    });
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


