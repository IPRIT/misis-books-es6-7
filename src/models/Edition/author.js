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
  indexes: [{
    name: 'search_author_index',
    type: 'FULLTEXT',
    fields: [ 'lastName', 'firstName', 'patronymicName' ]
  }],
  timestamps: false
});

export default EditionAuthor;