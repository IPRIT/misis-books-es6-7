import { typeCheck as isType } from 'type-check';

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

export class AsyncQueue {
  queue = [];
  inProcess = false;
  
  wait(element, cb) {
    return new Promise(resolve => {
      this.queue.push([ element, cb, resolve ]);
      this.added();
    })
  }
  
  added() {
    if (this.inProcess) {
      return;
    }
    this.process();
  }
  
  async process() {
    this.inProcess = true;
    let queuedElement;
    while (queuedElement = this.queue.shift()) {
      let [ element, process, resolver ] = queuedElement;
      resolver(await process(element));
    }
    this.inProcess = false;
  }
}

export function ensureValue(actual, type, defaultValue, fn = () => {}) {
  const regOppositeExpression = /\^\((.+)\)/i;
  
  let isOppositeType = type.startsWith('^');
  if (isOppositeType) {
    type = type.replace(regOppositeExpression, '$1');
  }
  let isProperlyType = isType(type, actual);
  if (isOppositeType) {
    isProperlyType = !isProperlyType;
  }
  if (!isProperlyType) {
    actual = defaultValue;
  }
  try {
    let regulatedValue = fn(actual, defaultValue);
    return isType('Undefined', regulatedValue) ?
      actual : regulatedValue;
  } catch (err) {
    return defaultValue;
  }
}