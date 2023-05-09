import yaml from 'js-yaml';

export default {
  json: (file) => JSON.parse(file),
  yml: (file) => yaml.load(file),
  yaml: (file) => yaml.load(file),
};
