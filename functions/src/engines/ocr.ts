import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

import fetch from 'node-fetch';

export const MIN_BOUNDING_BOX_SIZE = 100;

export function area (serializedBb) {
  const [_, __, width, height ] = serializedBb.split(',');
  return width * height;
}

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
export const ocr = functions.https.onRequest(async ({ query }, response) => {
  const { url } = query;

  // const subscriptionKey = functions.config().azure.subscription_key;
  const host = 'eastus.api.cognitive.microsoft.com';
  const path = '/vision/v1.0/ocr?language=unk&detectOrientation=true';

  try {
    const result = await fetch(`http://${host}${path}`, {
      method : 'POST',
      headers : {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : functions.config().azure.computer_vision,
      },
      body: JSON.stringify({ url })
    }).then(res => res.json())

    if (!result.regions) {
      response.status(404).send({ message: 'No content available - result.regions is empty'})
      return;
    }

    const terms = result.regions.reduce((regionAcc, region) => [
      ...regionAcc,
      ...region.lines.reduce((acc, line) => [...acc, ...line.words], [])
    ], [])
    
    const sortedTerms = terms
      .slice()
      .sort(({ boundingBox: a }, { boundingBox: b }) => area(b) - area(a));

    console.log(sortedTerms);

    const searchTerm = sortedTerms
      .filter(({ boundingBox }) => area(boundingBox) > MIN_BOUNDING_BOX_SIZE)
      .map(({ text }) => text)
      .slice(0, 4)
      .join(' ')
      .toLowerCase();
    
    console.log(searchTerm);

    if (searchTerm.trim().length === 0) {
      response.send({
        hits: []
      })
      return;
    }
    const searchResponse = await searchIndex.search(searchTerm);

    console.log(searchResponse)

    response.send(searchResponse);
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});