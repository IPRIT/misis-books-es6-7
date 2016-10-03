import { Edition, EditionCategory, EditionAuthor, File, EditionFave } from '../../../index';
import { typeCheck as isType } from 'type-check';

export default async function collateIds(user, ids, include = [], exclude = []) {
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
    }, {
      model: EditionFave,
      association: Edition.associations.Users,
      required: false,
      where: {
        uuid: user.uuid
      }
    }]
  };
  return Edition.findAll(editionConfig);
}