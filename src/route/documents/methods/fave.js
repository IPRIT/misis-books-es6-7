import { filterEntity as filter } from '../../../utils';
import { User, Edition } from '../../../models';

export function get(req, res, next) {
  const query = req.query;
  const user = req.user;
  
  Edition.getFaves(user, query).then(result => {
    res.json(result);
  }).catch(next);
}

export function post(req, res, next) {
  const body = req.body;
  const user = req.user;
  
  Edition.addFave(user, body).then(result => {
    res.json(result);
  }).catch(next);
}

export function remove(req, res, next) {
  const body = req.body;
  const user = req.user;
  
  Edition.removeFave(user, body).then(result => {
    res.json(result);
  }).catch(next);
}