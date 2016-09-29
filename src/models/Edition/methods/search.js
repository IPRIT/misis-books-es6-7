import { Edition } from '../index';
import { ensureArguments } from '../utils';

export default (args = {}) => {
  let { query, offset, limit, categoryIds, authorIds, fields, types } = ensureArguments(args);
}