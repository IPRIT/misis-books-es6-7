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
  
  const queryConfig = {
    where: {
      categoryId: {
        $in: categoryIds
      }
    },
    order: [ [ 'downloadsNumber', 'DESC' ] ],
    include: [{
      model: EditionCategory
    }, {
      model: EditionAuthor,
      required: false
    }, {
      model: File,
      association: Edition.associations.Document,
      required: false
    }, {
      model: File,
      association: Edition.associations.Cover,
      required: false
    }, {
      model: EditionFave,
      association: Edition.associations.Faves,
      required: false,
      where: {
        uuid: user.uuid
      }
    }],
    limit, offset
  };
  if (!categoryIds.length || categoryIds[0] === 1) {
    delete queryConfig.where.categoryId;
  }
  
  let editions = await Edition.findAll(queryConfig);
  
  const metaResultInfo = {
    total: await Edition.count(),
    totalCurrent: editions.length,
    sid: args.sid,
    args: { offset, limit, categoryIds, authorIds, fields }
  };
  
  let response = {
    items: editions.map(result => {
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