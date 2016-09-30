import { Edition, EditionCategory, EditionAuthor, File } from '../../../index';
import { typeCheck as isType } from 'type-check';

export default async function collateIds(ids, include = [], exclude = []) {
  if (!isType('[Number]', ids)) {
    throw new HttpError('Collate items must be array of numbers');
  }
  const editionConfig = {
    where: {
      id: {
        $in: ids
      }
    },
    [ (include.length || exclude.length) ? 'attributes' : null ]: {
      [ include.length ? 'include' : null ]: include,
      [ exclude.length ? 'exclude' : null ]: exclude,
    },
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
    }]
  };
  return Edition.findAll(editionConfig);
}