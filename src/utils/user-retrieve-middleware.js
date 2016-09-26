import { User, AuthToken } from '../models';

export default async (req, res, next) => {
  if (req.user) {
    //todo: remove in production (this case is only for assertion)
    return next(new HttpError('The user already exists'));
  }
  let token = req.header('X-Token');
  if (!token || typeof token !== 'string') {
    return next();
  }
  getUser(token).then(user => {
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  }).catch(next);
};

async function getUser(token) {
  let tokenInstance = await AuthToken.findOne({
    where: { token }
  });
  if (!tokenInstance) {
    return null;
  }
  return tokenInstance.getUser({
    attributes: {
      exclude: [ 'deletedAt' ]
    }
  });
}