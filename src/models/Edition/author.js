import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let EditionAuthor = sequelize.define('EditionAuthor', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  lastName: {
    type: Sequelize.TEXT
  },
  firstName: {
    type: Sequelize.STRING
  },
  patronymicName: {
    type: Sequelize.STRING
  }
}, {
  engine: 'MYISAM',
  timestamps: false,
  indexes: [{
    name: 'search_author_index',
    type: 'FULLTEXT',
    fields: [ 'lastName', 'firstName', 'patronymicName' ]
  }],
  getterMethods: {
    fullName() {
      let placeholder = '{lastName} {firstName} {patronymicName}';
      return [ 'lastName', 'firstName', 'patronymicName' ].reduce((placeholder, key) => {
        let regexp = new RegExp(`\{${key}\}`, 'gi');
        return placeholder.replace(regexp, this.getDataValue( key ));
      }, placeholder).trim();
    }
  },
});

export default EditionAuthor;