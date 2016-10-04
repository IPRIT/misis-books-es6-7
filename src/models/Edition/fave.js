import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let EditionFave = sequelize.define('EditionFave', {
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: () => new Date()
  }
}, {
  engine: 'INNODB',
  timestamps: false
});

export default EditionFave;