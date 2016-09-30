import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let EditionFave = sequelize.define('EditionFave', {
  createdTime: {
    type: Sequelize.BIGINT,
    defaultValue: () => new Date().getTime()
  }
}, {
  engine: 'INNODB',
  timestamps: false
});

export default EditionFave;