import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import userGroups from './userGroups';
import Subscription from '../Subscription';
import OldUser from '../OldUser';
import config from '../../utils/config';

let User = sequelize.define('User', {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  vkId: {
    type: Sequelize.INTEGER
  },
  vkDomain: {
    type: Sequelize.STRING
  },
  vkPhoto: {
    type: Sequelize.STRING,
    defaultValue: config.vk.defaultPhoto
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  isBan: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  balance: {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  accessGroup: {
    type: Sequelize.INTEGER,
    defaultValue: userGroups.groups.user.mask,
    get() {
      let mask = this.getDataValue('accessGroup');
      if (this.getDataValue('isBan')) {
        mask = userGroups.groups.locked.mask;
      }
      return userGroups.utils.groupByMask(mask);
    }
  },
  searchesNumber: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  downloadsNumber: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  recentActivityTime: {
    type: Sequelize.DATE,
    defaultValue: () => new Date()
  },
  lastLoggedTime: {
    type: Sequelize.DATE,
    defaultValue: () => new Date()
  },
  registerTime: {
    type: Sequelize.DATE,
    defaultValue: () => new Date()
  }
}, {
  getterMethods: {
    fullname() {
      let placeholder = '{firstName} {lastName}';
      return ['firstName', 'lastName'].reduce((placeholder, key) => {
        let regexp = new RegExp(`\{${key}\}`, 'gi');
        return placeholder.replace(regexp, this[ key ]);
      }, placeholder);
    }
  },
  setterMethods: {
    fullname(value) {
      var names = (value || "").trim().split(/\s+/);
      while (names.length !== 2) {
        (names.length > 2 ?
          names.pop : names.push.bind(this, '-'))();
      }
      this.setDataValue('firstname', names.slice(0, -1).join(' '));
      this.setDataValue('lastname', names.slice(-1).join(' '));
    }
  },
  paranoid: true,
  engine: 'INNODB',
  indexes: [{
    name: 'social_profiles_index',
    method: 'BTREE',
    fields: [ 'vkId' ]
  }, {
    name: 'email_index',
    method: 'BTREE',
    fields: [ 'email' ]
  }],
  defaultScope() {
    let lockedGroup = userGroups.groups.locked;
    return {
      where: {
        $and: {
          isBan: false,
          accessGroup: {
            $ne: lockedGroup.mask
          }
        }
      }
    };
  },
  scopes: {
    deleted: {
      where: {
        deletedAt: {
          $ne: null
        }
      }
    },
    banned: {
      where: {
        isBan: true
      }
    },
    accessGroup(...args) {
      let groups = userGroups.utils.resolveAllGroups(...args);
      return {
        where: {
          accessGroup: {
            $in: groups.map(group => group.mask)
          }
        }
      }
    }
  },
  instanceMethods: {
    hasRight(mask) {
      return userGroups.utils.hasRight(
        this.accessGroup,
        mask
      );
    },
    getActiveSubscription() {
      return Subscription.getActiveSubscription(this.uuid);
    },
    getOldId() {
      return OldUser.findOne({
        where: {
          vk_id: this.vkId
        }
      }).then(oldUser => oldUser && oldUser.id);
    }
  }
});

export default User;