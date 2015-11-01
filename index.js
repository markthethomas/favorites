'use strict';
const Promise = require('bluebird');


const cli = require('commander');
const chalk = require('chalk');
const exec = require('child_process').exec;
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const validator = require('is-my-json-valid');

const INSTALL_GLOBAL = 'npm install -g';
const INSTALL_PROJECT = 'npm install -S';
const INSTALL_PROJECT_DEV = 'npm install --save-dev';

function logError(err) {
  console.error(chalk.bgRed('SCHEMA ERROR: '), err);
}

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
  .action((jsonFavorites) => {
    fs
      .readFileAsync(path.resolve(jsonFavorites), 'utf8')
      .then(data => {
        let parsedFavorites = JSON.parse(data);
        if (validate(parsedFavorites)) {
          console.log(chalk.green('Valid Schema \u2713 '));
          return parsedFavorites[favorites.global ? 'global' : 'project'];
        } else {
          console.error(validate.errors);
          validate.errors.forEach((err) => {
            logError(chalk.red(`field ${err.field} ${err.message}`));
          })
        }
      })
      .catch(err => {
        if (err) {
          throw err;
        };
      })
      .then(parsedFavorites => {
        let devDeps = [];
        let deps = [];
        for (var dep in parsedFavorites.dependencies) {
          if (parsedFavorites.dependencies.hasOwnProperty(dep)) {
            deps.push(`${dep}@${parsedFavorites.dependencies[dep]}`);
          }
        }
        for (var dep in parsedFavorites.devDependencies) {
          if (parsedFavorites.devDependencies.hasOwnProperty(dep)) {
            devDeps.push(`${dep}@${parsedFavorites.devDependencies[dep]}`);
          }
        }
        return [deps, devDeps];
      })
      .spread((deps, devDeps) => {
        console.log(chalk.green('Installing your favorites'));
        if (favorites.global) {
          exec(`${INSTALL_GLOBAL} ${deps.join(' ')}`).stdout.pipe(process.stdout)
        } else {
          exec(`${INSTALL_PROJECT} ${deps.join(' ')} && ${INSTALL_PROJECT_DEV} ${devDeps.join(' ')}`).stdout.pipe(process.stdout)
        }
      })
  });

favorites.parse(process.argv);

module.exports = favorites;
