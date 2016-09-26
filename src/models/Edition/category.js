import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let EditionCategory = sequelize.define('EditionCategory', {
  id: {
    type: Sequelize.INTEGER(4),
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  engine: 'MYISAM',
  timestamps: false
});

export default EditionCategory;