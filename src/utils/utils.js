export function parseImageName(imageUrl) {
  let nameRegexp = /\/([a-zA-Z-_.0-9]+\.(?:png|jpe?g|gif|web(?:p|m)|svg))$/i;
  return parseNameFromUrl(imageUrl, nameRegexp);
}

export function parseDocumentName(documentUrl) {
  let nameRegexp = /\/([a-zA-Z-_.0-9]+\.(?:pdf|doc(?:x|m)?|zip|rar|xls(?:x|m)?|rtf|fb2|epub))$/i;
  return parseNameFromUrl(documentUrl, nameRegexp);
}

export function parseNameFromUrl(url, nameRegexp) {
  let nullIterableObject = [ null, null ];
  if (typeof url !== 'string') {
    return nullIterableObject;
  }
  let match = url.match(nameRegexp);
  if (!match) {
    return nullIterableObject;
  }
  let ownHostRegexp = /^(?:https?:\/\/s\.twosphere\.ru)/i;
  let isLocalHost = ownHostRegexp.test(url);
  return [ match[1], isLocalHost ];
}