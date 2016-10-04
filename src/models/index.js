import Log from 'log4js';
import sequelize from './sequelize';
import { Edition, EditionAuthor, EditionCategory, EditionFave } from './Edition';
import User from './User';
import AuthToken from './AuthToken';
import Subscription from './Subscription';
import File from './File';
import Query from './Query';
import Download from './Download';

import OldUser from './OldUser';
import OldPayment from './OldPayment';
import OldEdition from './OldEdition';
import OldQuery from './OldQuery';

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
User.hasMany(Query, { foreignKey: 'userUuid', targetKey: 'uuid' });
User.hasMany(Download, { foreignKey: 'userUuid', targetKey: 'uuid' });
Edition.belongsTo(EditionCategory, { foreignKey: 'categoryId' });
Edition.belongsTo(File, { foreignKey: 'documentUuid', as: 'Document' });
Edition.belongsTo(File, { foreignKey: 'coverUuid', as: 'Cover' });
Edition.hasMany(Download, { foreignKey: 'editionId' });
Edition.belongsToMany(EditionAuthor, { through: 'EditionToAuthors', timestamps: false });
EditionAuthor.belongsToMany(Edition, { through: 'EditionToAuthors', timestamps: false });
/* Fave relations */
User.belongsToMany(Edition, {
  through: EditionFave,
  foreignKey: 'userUuid',
  timestamps: false,
  constraints: false
});
Edition.belongsToMany(User, {
  through: EditionFave,
  foreignKey: 'editionId',
  timestamps: false,
  constraints: false
});


export {
  OldUser, OldPayment, OldQuery, OldEdition,
  Subscription, User, AuthToken, File, Query, Download,
  Edition, EditionAuthor, EditionCategory, EditionFave
};
