import { Edition } from '../../../models';

export default function (req, res, next) {
  const body = req.body;
  const user = req.user;
  body.ip = req._ip;
  
  Edition.search(user, body).then(result => {
    res.json(result);
  }).catch(next);
}