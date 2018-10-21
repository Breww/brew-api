import * as functions from 'firebase-functions';
import fetch from 'node-fetch';


/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */

export const processBeer = functions.https.onRequest(async ({ query }, response) => {
  const { url } = query;

  // const subscriptionKey = functions.config().azure.subscription_key;
  const host = 'eastus.api.cognitive.microsoft.com';
  const path = '/vision/v1.0/ocr?language=unk&detectOrientation=true';

  try {
    fetch(`http://${host}${path}`, {
      method : 'POST',
      headers : {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key' : functions.config().azure.computer_vision,
      },
      body: JSON.stringify({"url":url})
    })
    .then(res => res.json())
    .then(json => response.send(json));

  } catch (e) {
    response.send({
      message: e.message
    });
  }
});