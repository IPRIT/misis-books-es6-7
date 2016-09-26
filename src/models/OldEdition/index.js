import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import { } from '../index';

let OldEdition = sequelize.define('OldEdition', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  doc_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  absotheque_id: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  author: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  year_of_publication: {
    type: Sequelize.INTEGER(4)
  },
  publisher: {
    type: Sequelize.STRING
  },
  number_of_pages: {
    type: Sequelize.INTEGER(4)
  },
  udc: {
    type: Sequelize.STRING
  },
  category: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  dl_count: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  aliases: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  hash: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  dl_url: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  file_url: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  photo_big: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  photo_small: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  file_size: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  file_size_in_bytes: {
    type: Sequelize.BIGINT,
    allowNull: false
  }
}, {
  engine: 'MYISAM',
  timestamps: false,
  indexes: [{
    name: 'doc_id',
    fields: [ 'doc_id' ]
  }, {
    name: 'name',
    type: 'FULLTEXT',
    fields: [ 'name', 'author', 'aliases' ]
  }]
});

export default OldEdition;