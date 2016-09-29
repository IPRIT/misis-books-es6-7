import { User, OldUser } from '../../../../../models';
import Log from 'log4js';
import { rememberUser } from "../session-manager";

const log = Log.getLogger('Vk Auth');

export default (req, res, next) => {
  let vkUser = req.vkUser;

  getOrCreateUser(vkUser).then(user => {
    return rememberUser(user);
  }).then(tokenInstance => {
    res.json({
      token: tokenInstance.token
    });
  }).catch(next);
};

function getOrCreateUser(vkUser) {
  let { id } = vkUser;
  return User.findOne({
    where: {
      vkId: id
    }
  }).then(user => {
    if (user) {
      console.log();
      log.info('Got user:\t', user && user.get({ plain: true }).fullname);
      return user;
    }
    return createUser( vkUser );
  });
}

async function createUser(vkUser) {
  let { id, photo, first_name, last_name, domain } = vkUser;
  log.info('Creating user...:\t', `[id${id}]: [${first_name} ${last_name}]`);
  let newUserObject = {
    firstName: first_name,
    lastName: last_name,
    vkId: id,
    vkDomain: domain || 'id' + id,
    vkPhoto: photo,
    email: null,
    balance: 0,
    searchesNumber: 0,
    downloadsNumber: 0,
    registerTime: new Date()
  };
  let newUser = await User.create(newUserObject);
  return await tryRestoreUserFromBackup(newUser) || newUser;
}

async function tryRestoreUserFromBackup(user) {
  log.info('Restoring user from the old table...');
  let userObject = user.get({ plain: true });
  let { vkId } = userObject;
  let oldUser = await OldUser.findOne({
    where: {
      vk_id: vkId
    }
  });
  if (!oldUser) {
    log.info('Old table does not exists current user');
    return null;
  }
  let oldUserObject = oldUser.get({ plain: true });
  let [ oldRegisterTime, oldDownloadsNumber, oldSearchesNumber, balance ] = [
    oldUserObject.register_time,
    oldUserObject.dl_count,
    oldUserObject.count_queries,
    await oldUser.getPaymentSum()
  ];
  let currentTime = new Date();
  let subscriptionEndsAt = new Date(oldUserObject.end_subscription_time * 1000);
  if (subscriptionEndsAt > currentTime) {
    log.info('Creating subscription...');
    var userSubscription = await user.createSubscription({
      startTime: currentTime.getTime(),
      finishTime: subscriptionEndsAt.getTime(),
      paymentTime: currentTime.getTime()
    });
    log.info('Subscription has been created', userSubscription.get({ plain: true }));
  }
  log.info('Updating user...');
  return user.update({
    registerTime: oldRegisterTime * 1000,
    downloadsNumber: oldDownloadsNumber,
    searchesNumber: oldSearchesNumber,
    balance
  });
}