'use strict';
const Promise = require('bluebird');


const cli = require('commander');
const exec = require('child_process').exec;
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const validator = require('is-my-json-valid');

const INSTALL_GLOBAL = 'npm install --global';
const INSTALL_PROJECT = 'npm install -S';
const INSTALL_PROJECT_DEV = 'npm install --save-dev';

const validate = validator({
  required: true,
  type: 'object',
  properties: {
    global: {
      required: true,
      type: 'object'
    },
    project: {
      required: true,
      type: 'object'
    },
  }
})

let favorites = cli
  .version('0.0.1')
  .usage('favorites install <favorites.json> (can be local or public URL)')
  .option('-p, --project', 'Install your favorites into a local project')
  .option('-g, --global', 'Install your favorites globally');

favorites.command('install <favorites>')
  .description('install your favorites')
  .action((favorites) => {
    fs
      .readFileAsync(path.resolve(favorites), 'utf8')
      .then(data => {
        return JSON.parse(data);
      })
      .catch(err => {
        if (err) {
          throw err;
        };
      })
      .then(parsedFavorites => {
        console.log(parsedFavorites);
        return parsedFavorites;
      })
      .then(favoriteModules => {
        console.log('global attempt to install: ');
        console.log(favoriteModules);
      })
  });

favorites.parse(process.argv);

module.exports = favorites;
