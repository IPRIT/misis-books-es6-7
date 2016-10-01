import { Edition } from '../../../models';

export default function (req, res, next) {
  const { user, params, token } = req;
  let shortId = params.shortId;
  
  Edition.download(user, { shortId }).then(result => {
    let { redirectUrl } = result;
    console.log(`Redirecting to ${redirectUrl}...`);
    res.redirect(`${redirectUrl}?token=${token}`);
  }).catch(next);
}