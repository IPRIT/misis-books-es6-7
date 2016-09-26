import deap from 'deap';

export default (obj, filterOptions) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  } else if (!filterOptions) {
    return obj;
  }
  return filterByAttributes(obj, filterOptions);
}

function filterByAttributes(obj, attrs) {
  let [ include, exclude ] = [[], []];
  if (typeof attrs === 'object') {
    include = attrs.include || [];
    exclude = attrs.exclude || [];
  } else if (Array.isArray(attrs)) {
    include = attrs;
  } else if (typeof attrs === 'string') {
    include = attrs.split(',');
  } else {
    return obj;
  }
  let newObj = {};
  if (include.length) {
    include.forEach(attr => {
      if (obj.hasOwnProperty(attr)) {
        newObj[ attr ] = obj[ attr ];
      }
    });
  } else {
    deap.extend(newObj, obj);
  }
  if (exclude.length) {
    exclude.forEach(attr => {
      if (newObj.hasOwnProperty(attr)) {
        delete newObj[ attr ];
      }
    });
  }
  return newObj;
}