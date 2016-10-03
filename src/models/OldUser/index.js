import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import OldPayment from '../OldPayment';

let OldUser = sequelize.define('OldUser', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  vk_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  email: {
    type: Sequelize.TEXT
  },
  first_name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  vk_domain: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  photo: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  register_time: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  access_keys: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  recent_activity_time: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dl_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  end_subscription_time: {
    type: Sequelize.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  count_queries: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  access_level: {
    type: Sequelize.INTEGER(4),
    allowNull: false,
    defaultValue: 5
  },
  last_logged_time: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  engine: 'INNODB',
  timestamps: false,
  indexes: [{
    name: 'vk_id',
    fields: [ 'vk_id' ]
  }],
  instanceMethods: {
    async getPaymentSum() {
      let sum = await OldPayment.sum('amount', {
        where: {
          user_id: this.id
        }
      });
      return sum || 0;
    }
  }
});

export default OldUser;