import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';
import fetch from 'node-fetch';
/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */


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

export const ocrBuffer = functions.https.onRequest(async ({ body }, response) => {
  const host = 'eastus.api.cognitive.microsoft.com';
  const path = '/vision/v1.0/ocr?language=unk&detectOrientation=true';
  try {
    console.log(body)
    const result = await fetch(`http://${host}${path}`, {
      method : 'POST',
      headers : {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key' : functions.config().azure.computer_vision,
      },
      body
    })
    .then(res => res.json())
    console.log(result)
    if (!result.regions) {
      response.status(404).send({ message: 'No content available - result.regions is empty'})
      return;
    }

    const terms = result.regions.reduce((regionAcc, region) => [
      ...regionAcc,
      ...region.lines.reduce((acc, line) => [...acc, ...line.words], [])
    ], [])
    
    const searchTerm: string = terms
      .slice()
      .sort(({ boundingBox: a }, { boundingBox: b }) => area(b) - area(a))
      .map(({ text }) => text)
      .slice(0, 4)
      .join(' ')
      .toLowerCase();
    
    if (searchTerm.trim().length === 0) {
      response.send({
        hits: []
      })
      return;
    }

    const searchResponse = await searchIndex.search(searchTerm);

    response.send(searchResponse);

  } catch (e) {
    response.send({
      message: e.message
    });
  }
});