import { filterEntity as filter } from '../../../utils';
import { Edition } from '../../../models';

export default function (req, res, next) {
  const body = req.body;
  Edition.search(body).then(result => {
    res.json(result);
  }).catch(next);
}