import * as functions from 'firebase-functions';
import * as https from 'https';

const DEFAULT_FILTER_LIMIT = 1;

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */

export const getBeerImage = functions.https.onRequest(async ({ query }, response) => {
  const { brand } = query;

  const subscriptionKey = functions.config().azure.subscription_key;
  const host = 'api.cognitive.microsoft.com';
  const path = '/bing/v7.0/images/search';

  const request_params = {
    method : 'GET',
    hostname : host,
    path : path + '?q=' + encodeURIComponent(`${brand} logo`) + `&count=${DEFAULT_FILTER_LIMIT}`,
    headers : {
    'Ocp-Apim-Subscription-Key' : subscriptionKey,
    }
  };
  try {
    const res = await new Promise( function (resolve, reject) {
      const response_handler = function (resp) {
        let body = '';
        resp.on('data', function (d) {
            body += d;
        });
        resp.on('end', function () {
          const imageResults = JSON.parse(body);
          if (imageResults.value.length > 0) {
              const firstImageResult = imageResults.value[0];
              resolve(firstImageResult.thumbnailUrl)
          }
          else {
              console.log("Couldn't find image results!");
          }
        });
        resp.on('error', function (e) {
            console.log('Error: ' + e.message);
            reject(e)
        });
      };
      const req = https.request(request_params, response_handler);
      req.end()
    })

    console.log(res)

    response.send(res)
  } catch (e) {
    response.send({
      message: e.message
    });
  }
});


