export enum BeerAttr {
  NAME = 'Name',
  CATEGORY = 'Category',
  STYLE = 'Style',
  ABV = 'Alcohol By Volume',
  IBU = 'International Bitterness Units',
  DESCRIPTION = 'Description',
}

export type BeerEntity = {
  [key in BeerAttr]?: string
}
