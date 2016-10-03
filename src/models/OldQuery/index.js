import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let OldQuery = sequelize.define('OldQuery', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  query: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  time: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  ip: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  api: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  engine: 'MYISAM',
  timestamps: false,
  indexes: [{
    name: 'user_id',
    fields: [ 'user_id' ]
  }]
});

export default OldQuery;