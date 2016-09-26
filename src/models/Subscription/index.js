import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let Subscription = sequelize.define('Subscription', {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  startTime: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  finishTime: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  paymentTime: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  isBlocked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isPromo: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isTrial: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'time_index',
    method: 'BTREE',
    fields: [ 'startTime', 'finishTime' ]
  }],
  defaultScope() {
    return {
      where: {
        isBlocked: false
      }
    };
  },
  classMethods: {
    getActiveSubscription(userUuid) {
      let curTime = new Date().getTime();
      return this.findOne({
        where: {
          userUuid,
          startTime: {
            $lte: curTime
          },
          finishTime: {
            $gte: curTime
          }
        }
      });
    },
    hasActiveSubscription(userUuid) {
      return this.getActiveSubscription(userUuid).then(sub => !!sub);
    }
  }
});

export default Subscription;