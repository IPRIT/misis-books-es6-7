import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let Download = sequelize.define('Download', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  downloadedAt: {
    type: Sequelize.DATE,
    defaultValue: () => new Date()
  },
  isApiDownload: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  engine: 'MYISAM',
  timestamps: false
});

export default Download;