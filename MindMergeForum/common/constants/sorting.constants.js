export const SORT_CRITERIA = {
  DATE: 'date',
  LIKES: 'likes',
  COMMENTS: 'comments'
};

export const SORT_ORDERS = {
  ASC: 'Ascend',
  DESC: 'Descend'
};

export const SORT_LABELS = {
  [`${SORT_CRITERIA.DATE}_${SORT_ORDERS.DESC}`]: 'Latest Date',
  [`${SORT_CRITERIA.DATE}_${SORT_ORDERS.ASC}`]: 'Earliest Date',
  [`${SORT_CRITERIA.LIKES}_${SORT_ORDERS.DESC}`]: 'Most Liked',
  [`${SORT_CRITERIA.LIKES}_${SORT_ORDERS.ASC}`]: 'Least Liked',
  [`${SORT_CRITERIA.COMMENTS}_${SORT_ORDERS.DESC}`]: 'Most Active',
  [`${SORT_CRITERIA.COMMENTS}_${SORT_ORDERS.ASC}`]: 'Least Active'
};

export const DATE_RANGE = {
  FROM: 'from',
  TO: 'to'
};