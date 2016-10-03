import Log from 'log4js';
import deap from 'deap';
import crypto from 'crypto';
import { parseDocumentName, parseImageName, AsyncQueue, config } from "../../../utils";
import {
  OldEdition, Edition, EditionAuthor, EditionCategory, User,
  OldUser, OldQuery, Query
} from '../../../models';

const log = Log.getLogger('Version switcher');

export default (req, res, next) => {
  log.info('Switching to 5.0...');
  
  const { pwdSign, pwdSecret } = config.system;
  let { pwd } = req.body;
  let pwdSignComputed = crypto.createHash('md5').update(`${pwd}-.-${pwdSecret}`).digest('hex');
  if (pwdSignComputed !== pwdSign) {
    return next(new HttpError('Access denied', 403));
  }
  
  let startTime = new Date();
  repairOldUsers()
    .then(repairEditions)
    .then(repairOldQueries)
    .then(success)
    .catch(next);
  
  res.json({
    result: 'success'
  });
  
  function success() {
    console.log(`'Elapsed time: ${((new Date().getTime() - startTime.getTime()) / 1000).toFixed(3)} s.`);
  }
};

async function repairEditions() {
  let categories = await insertCategories(1, 11);
  return OldEdition.findAll().map(item => {
    let plainItem = item.get({ plain: true });
    return deap.update(plainItem, {
      author: getAuthors(plainItem.author)
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
  }, { concurrency: 1000 }).tap(items => {
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
  const authorRegexp = /^(?:([a-zA-Zа-яА-ЯёЁ-]+)[ ]([a-zA-Zа-яА-ЯёЁ-]\.)?[ ]?([a-zA-Zа-яА-ЯёЁ-]\.)?)/i;
  const nonAlphabeticRegexp = /([^a-zA-Zа-яА-ЯёЁ._ -])/gi;
  const repeatableWhitespacesRegexp = /(?=\s(\s+))/gi;
  
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

async function repairOldQueries() {
  const rowsNumber = await OldQuery.count();
  const blockSize = 1000;
  let blocksNumber = Math.floor(rowsNumber / blockSize) + Number(rowsNumber % blockSize > 0);
  
  for (let blockNumber = 0; blockNumber < blocksNumber; ++blockNumber) {
    await insertBlock(blockNumber);
  }
  
  function insertBlock(blockNumber) {
    let offset = blockNumber * blockSize;
    return OldQuery.findAll({
      order: [ [ 'id', 'ASC' ] ],
      limit: blockSize,
      offset
    }).then(arr => {
      return arr.sort((a, b) => b.id - a.id)
    }).map(async oldQuery => {
      const { id, user_id, query, time, ip, api } = oldQuery;
      let newQuery = Query.build({
        createdTime: time * 1000,
        isApiQuery: api,
        query, ip
      });
      let newUser = await User.getByOldId(user_id);
      if (newUser) {
        newQuery.userUuid = newUser.uuid;
      }
      console.log(`Current query row: ${id}`);
      return newQuery.save();
    }, { concurrency: 1 });
  }
}

function repairOldUsers() {
  return OldUser.findAll().map(oldUser => {
    return insertUser(oldUser);
  }, { concurrency: 1 });
}

async function insertUser(oldUser) {
  const oldUserObject = oldUser.get({ plain: true });
  let {
    vk_id, photo, first_name, last_name, vk_domain, register_time,
    dl_count, count_queries, recent_activity_time, last_logged_time
  } = oldUserObject;
  let balance = await oldUser.getPaymentSum();
  
  log.info('Creating user...:\t', `[id${vk_id}]: [${first_name} ${last_name}]`);
  
  let newUserObject = {
    firstName: first_name,
    lastName: last_name,
    vkId: vk_id,
    vkDomain: vk_domain,
    vkPhoto: photo,
    email: null,
    balance,
    searchesNumber: count_queries,
    downloadsNumber: dl_count,
    registerTime: register_time * 1000,
    recentActivityTime: recent_activity_time * 1000,
    lastLoggedTime: last_logged_time * 1000
  };
  let user = await User.create(newUserObject).delay(10);
  
  let currentTime = new Date();
  let subscriptionEndsAt = new Date(oldUserObject.end_subscription_time * 1000);
  if (subscriptionEndsAt > currentTime) {
    log.info('Creating subscription...');
    var userSubscription = await user.createSubscription({
      startTime: currentTime.getTime(),
      finishTime: subscriptionEndsAt.getTime(),
      paymentTime: currentTime.getTime()
    });
    log.info('Subscription has been created and valid thru:', new Date(userSubscription.finishTime));
  }
  return user;
}