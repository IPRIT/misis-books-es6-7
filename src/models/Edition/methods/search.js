import { Edition } from '../index';
import Sphinx from 'sphinx-promise';
import { ensureArguments, sphinx } from './utils';
import { filterEntity as filter } from '../../../utils';

export default async (args = {}) => {
  let { query, offset, limit, categoryIds, authorIds, fields, types } = ensureArguments(args);
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
  let editionsIds = await sphinx.query(query, { filters, limits, matchMode, resultAsIds: true });
  let results = await Edition.collateIds(editionsIds, fields, excludedFields);
  
  return results.map(result => {
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
  });
}