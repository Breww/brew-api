export enum BeerAttr {
  ID = 'id',
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
