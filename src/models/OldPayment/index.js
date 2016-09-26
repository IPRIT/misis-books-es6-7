import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import { User, OldUser } from '../index';

let OldPayment = sequelize.define('OldPayment', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  operation_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  datetime: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  sender: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  label: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  days: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  engine: 'INNODB',
  indexes: [{
    name: 'operation_id',
    fields: [ 'operation_id' ]
  }],
  classMethods: {
    async getSumByNewUser(user) {
      // check what type has variable
      // if user is a string that it uuid
      if (typeof user === 'string') {
        // find user by uuid
        user = await User.findByPrimary(user);
      }
      if (!user) {
        throw new HttpError('getSumByUser: User object is empty');
      }
      return this.sum('amount', {
        where: {
          user_id: await user.getOldId()
        }
      });
    }
  }
});

export default OldPayment;