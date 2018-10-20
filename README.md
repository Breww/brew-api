# breww-api

## API

### GET - User recommendations

`https://us-central1-breww-220002.cloudfunctions.net/userPrefRecommendation?uuid={uuid}`

#### Params
- `uuid`: Unique user id tied to an account
- `limit`: Query limit, max number of records to fetch
- `offset`: Query offset, starting cursor (useful for pagination)


### GET - Get Autocomplete

`http://localhost:5000/breww-220002/us-central1/getAutoComplete?name={name}`

#### Params
- `name`: Substring to search for in indexed DB
- `limit`: Query limit, max number of records to fetch
- `offset`: Query offset, starting cursor (useful for pagination)
