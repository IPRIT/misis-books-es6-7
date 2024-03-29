import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import Promise from 'bluebird';
import * as methods from './methods';
import { collate } from "./methods/utils";

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
    name: 'search_index',
    type: 'FULLTEXT',
    fields: [ 'name', 'aliases' ]
  }, {
    name: 'elibrary_doc_id_index_',
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
  },
  classMethods: {
    search(...args) {
      return methods.search(...args);
    },
    collateIds(...args) {
      return collate(...args);
    },
    getFaves(...args) {
      return methods.getFaves(...args);
    },
    addFave(...args) {
      return methods.addFave(...args);
    },
    removeFave(...args) {
      return methods.removeFave(...args);
    },
    getPopular(...args) {
      return methods.getPopular(...args);
    },
    download(...args) {
      return methods.download(...args);
    }
  }
});

export default Edition;