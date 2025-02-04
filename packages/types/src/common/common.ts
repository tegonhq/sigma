// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PostRequestBody = Record<string, any>;

export type RequestHeaders = Record<'headers', Record<string, string>>;

export enum DateFilterEnum {
  EQ = 'eq',
  GTE = 'gte',
  LTE = 'lte',
  GT = 'gt',
  LT = 'lt',
}

export const DateFilterType = {
  EQ: 'eq',
  GTE: 'gte',
  LTE: 'lte',
  GT: 'gt',
  LT: 'lt',
};

export type DateFilterType =
  (typeof DateFilterType)[keyof typeof DateFilterType];
