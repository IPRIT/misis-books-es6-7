import { Edition, EditionCategory, EditionAuthor, EditionFave, File, User } from '../../index';
import { ensureArguments } from './utils';
import { filterEntity as filter } from '../../../utils';
import deap from 'deap';

export async function getFaves(user, args) {
  let ensuredArgs = ensureArguments(args);
  let { offset, limit, categoryIds, fields } = ensuredArgs;
  let exclude = [
    'createdAt', 'updatedAt', 'deletedAt', 'categoryId',
    'documentUuid', 'coverUuid', 'EditionToAuthors', 'aliases', 'EditionFave'
  ];

  const userFavesConfig = {
    where: {
      categoryId: {
        $in: categoryIds
      }
    },
    order: [ [ 'createdTime', 'DESC' ] ],
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
      model: User,
      required: false,
      where: {
        uuid: user.uuid
      }
    }],
    limit, offset
  };
  if (!categoryIds.length || categoryIds[0] === 1) {
    delete userFavesConfig.where.categoryId;
  }
  let userFaves = await user.getEditions(userFavesConfig);
  
  const metaResultInfo = {
    total: await user.countEditions(),
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
            'Users',
            'starred',
            array => Array.isArray(array) && array.length > 0
          ] ]
        }
      );
    })
  };
  return deap.extend(metaResultInfo, response);
}

export async function addFave(user, args) {
  let { editionId } = args;
  let result = await user.addEdition(editionId);
  return {
    success: true,
    added: result.length > 0
  };
}

export async function removeFave(user, args) {
  let { editionId = 1 } = args;
  console.log(user.__proto__);
  return {
    success: true,
    removed: await user.removeEdition(editionId) > 0 // because it returns only `zero` or `not zero`
  };
}