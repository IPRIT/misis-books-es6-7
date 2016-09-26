import config from './config';
import Promise from 'bluebird';
import deap from 'deap';
import crypto from 'crypto';

function isVkUserLike(obj) {
  let baseProperties = [ 'id', 'photo', 'first_name', 'last_name' ];
  return baseProperties.every(prop => obj && obj.hasOwnProperty(prop));
}

export default function (req, res, next) {
  let session = req.body;
  let vkUser = session.user;
  let secureKey = config.vk.secureKey;
  
  if (!isTrustedRequest(session, secureKey)) {
    throw new HttpError('Sign in request is not trusted');
  } else if (!isVkUserLike(vkUser)) {
    throw new HttpError('User object is not correct');
  }
  deap.extend(req, { vkUser });
  next();
};

function isTrustedRequest(session, secureKey) {
  let result = [ 'expire', 'mid', 'secret', 'sid' ].sort()
    .reduceRight((acc, currentProperty) => `${currentProperty}=${session[ currentProperty ]}${acc}`, secureKey);
  return crypto.createHash('md5').update(result).digest('hex') === session.sig;
}