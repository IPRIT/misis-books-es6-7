import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import Promise from 'bluebird';

function ShortHexId() {
  let currentId = 100000;
  let nextPtrOffset = 0xff;
  Promise.resolve().then(() => {
    return Edition.sync();
  }).then(async () => {
    currentId += await Edition.count() * nextPtrOffset;
    console.log('Current count:', currentId);
  }).catch(console.error.bind(console));
  return () => (currentId += nextPtrOffset).toString(16);
}

let Edition = sequelize.define('Edition', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  shortId: {
    type: Sequelize.STRING,
    unique: true,
    defaultValue: ShortHexId()
  },
  elibraryDocumentId: {
    type: Sequelize.INTEGER,
    defaultValue: -1
  },
  elibraryAbsothequeId: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  publicationYear: {
    type: Sequelize.INTEGER(4)
  },
  publisher: {
    type: Sequelize.STRING
  },
  pagesNumber: {
    type: Sequelize.INTEGER(4)
  },
  udc: {
    type: Sequelize.STRING
  },
  downloadsNumber: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  aliases: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'short_id_index',
    method: 'BTREE',
    fields: [ 'shortId' ]
  }, {
    name: 'search_index',
    type: 'FULLTEXT',
    fields: [ 'name', 'aliases' ]
  }, {
    name: 'elibrary_doc_id_index',
    method: 'BTREE',
    fields: [ 'elibraryDocumentId' ]
  }],
  scopes: {
    category(categoryId = 1) {
      if (categoryId === 1) {
        return {};
      }
      return {
        where: { categoryId }
      }
    }
  }
});

export default Edition;