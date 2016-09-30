import { Edition, EditionCategory, EditionAuthor, EditionFave, File } from '../../index';
import { ensureArguments } from './utils';
import { filterEntity as filter } from '../../../utils';
import deap from 'deap';

export async function getPopular(user, args) {
  let ensuredArgs = ensureArguments(args);
  let { offset, limit, categoryIds, authorIds, fields } = ensuredArgs;
  let exclude = [
    'createdAt', 'updatedAt', 'deletedAt', 'categoryId',
    'documentUuid', 'coverUuid', 'EditionToAuthors', 'aliases', 'EditionFave'
  ];

  
  
  const metaResultInfo = {
    total: await user.countFaves(),
    totalCurrent: userFaves.length,
    sid: args.sid,
    args: { offset, limit, categoryIds, fields }
  };
  
  let response = {
    items: userFaves.map(result => {
      return filter(
        result.get({ plain: true }), {
          deep: true,
          include: fields,
          exclude,
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
          ], [
            'Faves',
            'starred',
            array => Array.isArray(array) && array.length > 0
          ] ]
        }
      );
    })
  };
  return deap.extend(metaResultInfo, response);
}