#!/usr/bin/env node

'use strict';

require('babel-core/register');

const Promise = require('bluebird');
const cli = require('commander');
const validator = require('validator');
const chalk = require('chalk');
const exec = require('child_process').exec;
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const rp = require('request-promise');
const jsonValidator = require('is-my-json-valid');

const INSTALL_GLOBAL = 'npm install -g';
const INSTALL_PROJECT = 'npm install -S';
const INSTALL_PROJECT_DEV = 'npm install --save-dev';


function logError(err) {
  console.error(chalk.bgRed('SCHEMA ERROR: '), err);
}

const validateJSON = jsonValidator({
  required: true,
  type: 'object',
  properties: {
    global: {
      required: true,
      type: 'object',
    },
    project: {
      required: true,
      type: 'object',
    },
  },
});

function finishUp() {
  console.log(chalk.green('All done! Get to hacking'));
}

function resolveFavorites(jsonPath) {
  return new Promise((resolve, reject) => {
    if (validator.isURL(jsonPath)) {
      const options = {
        uri: jsonPath,
        json: true,
      };
      return rp(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => reject(err));
    } else {
      return fs.readFileAsync(path.resolve(jsonPath), 'utf8')
        .then(data => resolve(JSON.parse(data)))
        .catch(err => reject(err));
    }
  });
}

const favorites = cli
  .version('0.0.8')
  .usage('favorites install <favorites.json> (can be local or public URL)')
  .option('-v, --verbose', 'Show parsed favorites to be installed')
  .option('-p, --project', 'Install your favorites into a local project')
  .option('-g, --global', 'Install your favorites globally');

favorites.command('install <favorites>')
  .description('install your favorites!')
  .action((jsonFavorites) => {
    if (!jsonFavorites) {
      throw new Error(chalk.red('You must provide a favorites.json file'));
    }
    resolveFavorites(jsonFavorites)
      .then(data => {
        if (favorites.verbose) {
          console.log('Your favorites:\n', data);
        }
        if (validateJSON(data)) {
          console.log(chalk.green('Valid Schema \u2713 '));
          return data[favorites.global ? 'global' : 'project'];
        } else {
          console.error(validateJSON.errors);
          validateJSON.errors.forEach((err) => {
            logError(chalk.red(`field ${err.field} ${err.message}`));
          });
        }
      })
      .catch(err => {
        if (err) {
          throw err;
        }
      })
      .then(parsedFavorites => {
        const devDeps = [];
        const deps = [];
        for (const dep in parsedFavorites.dependencies) {
          if (parsedFavorites.dependencies.hasOwnProperty(dep)) {
            deps.push(`${dep}@${parsedFavorites.dependencies[dep]}`);
          }
        }
        for (const dep in parsedFavorites.devDependencies) {
          if (parsedFavorites.devDependencies.hasOwnProperty(dep)) {
            devDeps.push(`${dep}@${parsedFavorites.devDependencies[dep]}`);
          }
        }
        return [deps, devDeps];
      })
      .spread((deps, devDeps) => {
        console.log(chalk.green('Installing your favorites'));
        let installer;
        if (favorites.global) {
          installer = exec(`${INSTALL_GLOBAL} ${deps.join(' ')}`);
        } else {
          installer = exec(`${INSTALL_PROJECT} ${deps.join(' ')} && ${INSTALL_PROJECT_DEV} ${devDeps.join(' ')}`);
        }
        installer.stdout.pipe(process.stdout);
        installer.stderr.pipe(process.stderr);
        installer.on('close', () => finishUp());
      });
  });

favorites.parse(process.argv);

module.exports = favorites;
