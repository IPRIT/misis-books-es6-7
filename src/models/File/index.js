import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import config from '../../utils/config';

let File = sequelize.define('File', {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  type: {
    type: Sequelize.ENUM,
    values: [ 'image', 'document' ],
    allowNull: false
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  externalUri: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Path for external sources'
  },
  size: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  scopes: {
    images: {
      where: {
        type: 'image'
      }
    },
    documents: {
      where: {
        type: 'document'
      }
    }
  },
  getterMethods: {
    absoluteUrl() {
      return this.getAbsoluteUrl();
    },
    relativeUrl() {
      return this.getRelativePath();
    }
  },
  instanceMethods: {
    getAbsoluteUrl() {
      if (this.externalUri) {
        return this.externalUri + this.name;
      }
      let protocol = config.secureProtocol ? 'https' : 'http';
      return `${protocol}://${config.domain}${this.getRelativePath()}`;
    },
    getRelativePath() {
      //todo: inspect case when path is not relative
      let pathMappings = {
        image: 'covers',
        document: 'documents'
      };
      let pathTo = config.storage[ pathMappings[ this.type ] ].directory;
      return `${config.storage.cdnPath}${pathTo}/${this.name}`;
    }
  }
});

export default File;