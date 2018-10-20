# breww-api

## API

### GET - User recommendations

`https://us-central1-breww-220002.cloudfunctions.net/userPrefRecommendation?uuid={uuid}`

#### Params
- `uuid`: Unique user id tied to an account
- `limit`: Query limit, max number of records to fetch
- `offset`: Query offset, starting cursor (useful for pagination)

<<<<<<< HEAD
### Sample Response

```
http://localhost:5000/breww-220002/us-central1/userPrefRecommendation?uuid=36301CA1-2B4B-40EF-820C-A17E09CC1FCA&limit=1

{
   "params":"filters=Category%3A%22Irish%20Ale%20%22OR%20Category%3A%22German%20Lager%20%22&length=1&offset=0",
   "content":[
      {
         "Name":"Aventinus Weizen-Eisbock",
         "id":"399",
         "brewery_id":"1023",
         "cat_id":"7",
         "style_id":"90",
         "Alcohol By Volume":"12.0",
         "International Bitterness Units":"0",
         "Standard Reference Method":"0",
         "Universal Product Code":"0",
         "filepath":"",
         "Description":"",
         "add_user":"0",
         "last_mod":"2010-07-23T01:30:00+05:30",
         "Style":"Traditional German-Style Bock",
         "Category":"German Lager",
         "Brewer":"Private Weissbierbrauerei G. Schneider & Sohn GmbH",
         "Address":"Emil-Ott-Strasse 1-5",
         "City":"Kelheim",
         "State":"",
         "Country":"Germany",
         "Coordinates":"48.9175, 11.8735",
         "Website":"http://www.schneider-weisse.de",
         "objectID":"54713121",
         "_highlightResult":{
            "Name":{
               "value":"Aventinus Weizen-Eisbock",
               "matchLevel":"none",
               "matchedWords":[

               ]
            },
            "Style":{
               "value":"Traditional German-Style Bock",
               "matchLevel":"none",
               "matchedWords":[

               ]
            },
            "Category":{
               "value":"German Lager",
               "matchLevel":"none",
               "matchedWords":[

               ]
            }
         },
         "score":0.38754563863781427
      }
   ]
}
```
=======

### GET - Get Autocomplete

`https://us-central1-breww-220002.cloudfunctions.net/getAutoComplete?name={name}`

#### Params
- `name`: Substring to search for in indexed DB
- `limit`: Query limit, max number of records to fetch
- `offset`: Query offset, starting cursor (useful for pagination)
>>>>>>> 902b100f8e30f381083391fa1f004d79dac66095