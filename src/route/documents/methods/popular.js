import { filterEntity as filter } from '../../../utils';
import { Edition } from '../../../models';

export default function (req, res, next) {
  const query = req.query;
  const user = req.user;
  Edition.getPopular(user, query).then(result => {
    res.json(result);
  }).catch(next);
}