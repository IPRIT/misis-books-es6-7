import { typeCheck as isType } from 'type-check';
import { ensureValue } from "../../../../utils";
import * as lodash from 'lodash';
import deap from 'deap';

const OPTS_MIN_LIMIT   = 0;
const OPTS_MAX_LIMIT   = 200;
const OPTS_MIN_OFFSET  = 0;

export function ensureArguments(args = {}) {
  if (!isType('Object', args)) {
    throw new HttpError('Args must presents as object', 400);
  }
  const argsDefaults = {
    query: [ 'String', '' ],
    offset: [ 'Number | String', 0, (actual, defaultValue) => {
      actual = Number(actual);
      if (isNaN(actual)) {
        return defaultValue;
      }
      return Math.max(actual, OPTS_MIN_OFFSET);
    } ],
    limit: [ 'Number | String', 20, (actual, defaultValue) => {
      actual = Number(actual);
      if (isNaN(actual)) {
        return defaultValue;
      }
      return Math.max(OPTS_MIN_LIMIT, Math.min(OPTS_MAX_LIMIT, actual));
    } ],
    categoryIds: [ '[Number]', [ 1 ], actual => lodash.uniq(actual) ],
    authorIds: [ '[Number]', [ ], actual => lodash.uniq(actual) ],
    fields: [ '[String]', [ ], (actual, defaultValue) => {
      if (!actual.length) {
        actual.push(defaultValue);
      }
      const groups = {
        'default': [ 'id', 'name' ],
        'standard': [ 'default', 'shortId' ] //todo: expand fields
      };
      return lodash.uniq(
        lodash.flattenDeep( spread(actual) )
      );
      
      function spread(fields) {
        return fields.map(field => {
          return groups.hasOwnProperty(field) ? spread(groups[ field ]) : field;
        });
      }
    } ]
  };
  let returnValue = {};
  Object.keys(argsDefaults).forEach(argKey => {
    let argumentSetup = argsDefaults[ argKey ];
    if (!argumentSetup) {
      return;
    }
    deap.extend(returnValue, {
      [ argKey ]: ensureValue(args[ argKey ], ...argumentSetup)
    });
  });
  return returnValue;
}