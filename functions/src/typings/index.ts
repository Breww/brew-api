export enum BeerAttr {
  ID = 'id',
  RATING = 'rating',
  NAME = 'name',
  CATEGORY = 'category',
  STYLE = 'style',
  ABV = 'abv',
  IBU = 'ibu',
  DESCRIPTION = 'description',
}

export type BeerEntity = {
  [key in BeerAttr]?: string
}

export type InferenceMap = { [itemId: string]: BeerEntity };
