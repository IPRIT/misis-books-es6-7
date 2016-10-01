import { Edition, EditionCategory, EditionAuthor, EditionFave, File } from '../../index';
import { typeCheck as isType } from 'type-check';

export async function download(user, args) {
  const errDocumentNotFound = new HttpError('Document not found');
  const errDocumentTemporarilyNotAvailable = new HttpError('The document temporarily is not available');
  
  const { shortId } = args;
  if (!isType('String', shortId)) {
    throw errDocumentNotFound;
  }
  let edition = await Edition.findOne({
    where: { shortId },
    include: [{
      model: File,
      association: Edition.associations.Document,
      required: false
    }]
  });
  if (!edition) {
    throw errDocumentNotFound;
  }
  let { absoluteUrl } = edition.Document || {};
  if (!absoluteUrl) {
    // file doesn't exist
    // todo: download the document from elibrary.misis.ru
    throw errDocumentTemporarilyNotAvailable;
  }
  return { redirectUrl: absoluteUrl };
}