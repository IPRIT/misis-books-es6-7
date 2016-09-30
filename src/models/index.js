import Log from 'log4js';
import sequelize from './sequelize';
import { Edition, EditionAuthor, EditionCategory, EditionFave } from './Edition';
import User from './User';
import AuthToken from './AuthToken';
import Subscription from './Subscription';
import File from './File';

import OldUser from './OldUser';
import OldPayment from './OldPayment';
import OldEdition from './OldEdition';

const log = Log.getLogger('models');

log.info('Models are syncing...');
sequelize.sync(/**{ force: true }/**/).then(() => {
  log.info('Models synced!');
}).catch(log.fatal.bind(log, 'Error:'));

/**
 * Define relatives between models
 */
User.hasMany(AuthToken, { foreignKey: 'userUuid', targetKey: 'uuid' });
User.hasMany(Subscription, { foreignKey: 'userUuid', targetKey: 'uuid' });
Edition.belongsTo(EditionCategory, { foreignKey: 'categoryId' });
Edition.belongsTo(File, { foreignKey: 'documentUuid', as: 'Document' });
Edition.belongsTo(File, { foreignKey: 'coverUuid', as: 'Cover' });
Edition.belongsToMany(EditionAuthor, { through: 'EditionToAuthors', timestamps: false });
EditionAuthor.belongsToMany(Edition, { through: 'EditionToAuthors', timestamps: false });
User.belongsToMany(Edition, {
  through: EditionFave,
  foreignKey: 'userUuid',
  as: 'Faves',
  timestamps: false,
  constraints: false
});
Edition.belongsToMany(User, {
  through: EditionFave,
  foreignKey: 'editionId',
  as: 'Faves',
  timestamps: false,
  constraints: false
});

export {
  User, AuthToken, OldUser,
  Subscription, OldPayment, Edition,
  EditionAuthor, EditionCategory, OldEdition,
  File
};
