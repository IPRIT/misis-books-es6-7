import { Edition } from '../index';
import Sphinx from 'sphinx-promise';
import { ensureArguments, sphinx } from './utils';
import { filterEntity as filter } from '../../../utils';
import deap from 'deap';

export default async (args = {}) => {
  let ensuredArgs = ensureArguments(args);
  let { query, offset, limit, categoryIds, authorIds, fields, types } = ensuredArgs;
  let filters = []
    , limits = { offset, limit, maxMatches: 10000 }
    , matchMode = Sphinx.SPH_MATCH_EXTENDED2
    , excludedFields = [
      'createdAt', 'updatedAt', 'deletedAt', 'categoryId',
      'documentUuid', 'coverUuid', 'EditionToAuthors', 'aliases'
    ];
  if (categoryIds.length &&
    (categoryIds.length > 1 || categoryIds[0] !== 1)) {
    filters.push({
      attr: 'categoryid',
      values: categoryIds
    });
  }
  if (authorIds.length) {
    filters.push({
      attr: 'authorid',
      values: authorIds
    });
  }
  let result = await sphinx.query(query, { filters, limits, matchMode });
  let editionsIds = sphinx.getIdsFromResult(result);
  let editions = await Edition.collateIds(editionsIds, fields, excludedFields);
  
  const metaResultInfo = {
    total: result.total,
    sid: args.sid,
    args: ensuredArgs
  };
  
  let response = {
    items: editions.map(result => {
      return filter(
        result.get({ plain: true }), {
          deep: true,
          include: fields,
          exclude: excludedFields,
          replace: [ [
            'EditionCategory',
            'category'
          ], [
            'EditionAuthors',
            'authors'
          ], [
            'Document',
            'document'
          ], [
            'Cover',
            'imageCover'
          ] ]
        }
      );
    })
  };
  return deap.extend(metaResultInfo, response);
}