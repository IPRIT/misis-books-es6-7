import Log from 'log4js';
import { OldEdition, Edition, EditionAuthor, EditionCategory } from '../../../models';
import deap from 'deap';
import { parseDocumentName, parseImageName, AsyncQueue } from "../../../utils";
import * as editions from '../../../models/Edition/methods';

const log = Log.getLogger('Version switcher');

export default (req, res, next) => {
  log.info('Switching...');
  console.log(req.body);
  res.json(editions.search(req.body));
  
  /*let query = req.query.q || "";
  let categories = req.query.categories && req.query.categories.split(',').map(parseInt) || [];
  let authors = req.query.authors && req.query.authors.split(',').map(parseInt) || [];
  let count = req.query.count && Math.max(0, Math.min(200, Number(req.query.count))) || 10;
  let offset = req.query.offset && Math.max(0, Number(req.query.offset)) || 0;
  
  let filters = [{
    attr: 'categoryid',
    values: categories
  }, {
    attr: 'authorid',
    values: authors
  }];
  let limits = {
    offset,
    limit: count
  };
  sphinx.query({ query, filters, limits }).then(result => {
    res.json(result);
  }).catch(next);*/
  
  /*repairEditions().then(() => {
    res.json({
      result: 'success'
    });
  }).catch(next);*/
};

async function repairEditions() {
  let categories = await insertCategories(1, 11);
  return OldEdition.findAll().then(items => {
    return items.map(item => item.get({ plain: true }));
  }).then(items => {
    return items.map(item => {
      return deap.update(item, {
        author: getAuthors(item.author)
      });
    });
  }).map(async item => {
    let newEditionObject = {
      elibraryDocumentId: item.doc_id || -1,
      elibraryAbsothequeId: item.absotheque_id,
      name: item.name,
      publicationYear: item.year_of_publication,
      publisher: item.publisher,
      pagesNumber: item.number_of_pages,
      udc: item.udc,
      downloadsNumber: item.dl_count,
      aliases: item.aliases
    };
    let newEdition = await Edition.create(newEditionObject);
    await newEdition.setEditionCategory(categories[ item.category - 1 ]);
    let authors = [];
    for (let authorObject of item.author) {
      authors.push(await insertAuthor(authorObject));
    }
    await newEdition.addEditionAuthors(authors);
    
    let [ documentName, isLocalHostForDoc ] = parseDocumentName(item.file_url);
    if (documentName) {
      await newEdition.createDocument({
        type: 'document',
        name: documentName,
        externalUri: isLocalHostForDoc ?
          null : item.file_url.replace(documentName, ''),
        size: item.file_size_in_bytes || 0
      });
    }
    let [ coverName, isLocalHostForCover ] = parseImageName(
      item.photo_big || item.photo_small
    );
    if (coverName) {
      await newEdition.createCover({
        type: 'image',
        externalUri: isLocalHostForCover ?
          null : (item.photo_big || item.photo_small).replace(coverName, ''),
        name: coverName
      });
    }
    return newEdition;
  }, { concurrency: 1000 }).then(items => {
    console.log('Editions have been created!', items.length);
  });
}

async function insertCategories(fromId, toId) {
  let categoriesNumber = await EditionCategory.count();
  if (categoriesNumber > 0) {
    return EditionCategory.findAll();
  }
  let categories = [];
  for (let id = fromId; id <= toId; ++id) {
    categories.push(await EditionCategory.create({
      name: getCategoryName(id)
    }));
  }
  return categories;
}

function getCategoryName(categoryId = 8) {
  let names = [
    'Все', // 1
    'Пособия', // 2
    'Дипломы', // 3
    'Сборники научных трудов', // 4
    'Монографии', // 5
    'Книги МИСиС', // 6
    'Авторефераты диссертаций', // 7
    'Разное', // 8
    'Журналы', // 9
    'Документы филиалов МИСиС', // 10
    'УМКД' // 11
  ];
  return names[ (categoryId - 1) % names.length ]
}

function getAuthors(authorString) {
  let authorRegexp = /^(?:([a-zA-Zа-яА-ЯёЁ-]+)[ ]([a-zA-Zа-яА-ЯёЁ-]\.)?[ ]?([a-zA-Zа-яА-ЯёЁ-]\.)?)/i;
  let nonAlphabeticRegexp = /([^a-zA-Zа-яА-ЯёЁ._ -])/gi;
  let repeatableWhitespacesRegexp = /(?=\s(\s+))/gi;
  if (typeof authorString !== 'string') {
    return [];
  }
  let authorsArray = authorString.trim()
    .split(',')
    .map(author => author.replace(nonAlphabeticRegexp, ''))
    .map(author => author.trim())
    .map(author => author.replace(repeatableWhitespacesRegexp, ''))
    .filter(author => author.length > 0);
  return authorsArray.map(author => {
    let matches = author.match(authorRegexp);
    if (!matches) {
      return {
        firstName: '',
        lastName: author,
        patronymicName: ''
      }
    }
    matches = Array.from(matches).slice(1).map(match => match && match.trim() || "");
    let isValidAuthor = matches.every(match => match.length > 0);
    if (!isValidAuthor) {
      return {
        firstName: '',
        lastName: author || 'Unknown',
        patronymicName: ''
      }
    }
    return {
      firstName: matches[1] || '',
      lastName: matches[0] || 'Unknown',
      patronymicName: matches[2] || ''
    };
  });
}

/**
 * Helps mysql store only unique authors
 * due to concurrency issue
 */
let authorsQueue;

function insertAuthor(authorObject) {
  if (!authorsQueue) {
    authorsQueue = new AsyncQueue();
  }
  return authorsQueue.wait(authorObject, authorObject => {
    return EditionAuthor.findOrCreate({
      where: authorObject,
      defaults: authorObject
    }).spread(newAuthor => newAuthor);
  });
}