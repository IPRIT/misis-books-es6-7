import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let Query = sequelize.define('Query', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  query: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createdTime: {
    type: Sequelize.DATE,
    defaultValue: () => new Date(),
    allowNull: false
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isApiQuery: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  engine: 'MYISAM',
  timestamps: false
});

export default Query;