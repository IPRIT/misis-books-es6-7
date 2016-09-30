import { User, AuthToken, Subscription } from '../models';

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
  let curTime = new Date().getTime();
  let user = await tokenInstance.getUser({
    attributes: {
      exclude: [ 'deletedAt' ]
    },
    include: [{
      model: Subscription,
      required: false,
      where: {
        $and: {
          startTime: {
            $lt: curTime
          },
          finishTime: {
            $gt: curTime
          }
        }
      }
    }]
  });
  if (!user) {
    return null;
  }
  user.hasPremium = user.Subscriptions.length > 0;
  return user;
}