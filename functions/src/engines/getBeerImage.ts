import * as functions from 'firebase-functions';
import * as https from 'https';

const DEFAULT_FILTER_OFFSET = 0;
const DEFAULT_FILTER_LIMIT = 1;

/**
 * Given a users uuid, we will perform lookup for their records,
 * open comm channel with algolia and return strong recommendation set
 */

export const getBeerImage = functions.https.onRequest(async ({ query }, response) => {
  const { brand, offset, limit } = query;

  let subscriptionKey = functions.config().azure.subscription_key;
  let host = 'api.cognitive.microsoft.com';
  let path = '/bing/v7.0/images/search';

  let request_params = {
    method : 'GET',
    hostname : host,
    path : path + '?q=' + encodeURIComponent(`${brand} logo`) + `&count=${DEFAULT_FILTER_LIMIT}`,
    headers : {
    'Ocp-Apim-Subscription-Key' : subscriptionKey,
    }
  };
  try {
    const res = await new Promise( function (resolve, reject) {
      let response_handler = function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
          let imageResults = JSON.parse(body);
          if (imageResults.value.length > 0) {
              let firstImageResult = imageResults.value[0];
              resolve(firstImageResult.thumbnailUrl)
          }
          else {
              console.log("Couldn't find image results!");
          }
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
            reject(e)
        });
      };
      let req = https.request(request_params, response_handler);
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


