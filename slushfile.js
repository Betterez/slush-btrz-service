/*
 * slush-btrz-service
 * https://github.com/Betterez/slush-btrz-service
 *
 * Copyright (c) 2015, Betterez
 * Licensed under the MIT license.
 */
'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  ejs = require('gulp-ejs'),
  conflict = require('gulp-conflict'),
  rename = require('gulp-rename'),
  _ = require('underscore.string'),
  inquirer = require('inquirer'),
  path = require('path');

function format(string) {
  var username = string.toLowerCase();
  return username.replace(/\s/g, '');
}

var defaults = (function () {
  var workingDirName = path.basename(process.cwd()),
    homeDir, osUserName, configFile, user;

  if (process.platform === 'win32') {
    homeDir = process.env.USERPROFILE;
    osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
  } else {
    homeDir = process.env.HOME || process.env.HOMEPATH;
    osUserName = homeDir && homeDir.split('/').pop() || 'root';
  }

  configFile = path.join(homeDir, '.gitconfig');
  user = {};

  if (require('fs').existsSync(configFile)) {
    user = require('iniparser').parseSync(configFile).user;
  }

  return {
    appName: workingDirName,
    userName: osUserName || format(user.name || ''),
    authorName: user.name || '',
    authorEmail: user.email || ''
  };
})();

gulp.task('default', function (done) {
  var prompts = [{
    name: 'appName',
    message: 'What\'s the name of your project?',
    default: defaults.appName
  }, {
    name: 'appDescription',
    message: 'What\'s the description?'
  }, {
    name: 'appVersion',
    message: 'What\'s the version of your project?',
    default: '0.1.0'
  }, {
    name: 'authorName',
    message: 'What\'s the author name?',
    default: defaults.authorName
  }, {
    name: 'authorEmail',
    message: 'What\'s the author email?',
    default: defaults.authorEmail
  }, {
    name: 'userName',
    message: 'What\'s the github username?',
    default: defaults.authorName
  }, {
    name: 'subpath',
    message: 'What\'s the main path for the endpoints for this api?'
  }, {
    name: 'stagingDomain',
    message: 'What\'s the staging domain for the api?'
  }, {
    name: 'sandboxDomain',
    message: 'What\'s the sandbox domain for the api?'
  }, {
    name: 'productionDomain',
    message: 'What\'s the production domain for the api?'
  }, {
    name: 'localhostLeToken',
    message: 'What\'s the localhost Log Entries token for this application?'
  }, {
    name: 'stagingLeToken',
    message: 'What\'s the staging Log Entries token for this application?'
  }, {
    name: 'sandboxLeToken',
    message: 'What\'s the sandbox Log Entries token for this application?'
  }, {
    name: 'productionLeToken',
    message: 'What\'s the production Log Entries token for this application?'
  }, {
    type: 'confirm',
    name: 'moveon',
    message: 'Continue?'
  }];
  //Ask
  inquirer.prompt(prompts,
    function (answers) {
      if (!answers.moveon) {
        return done();
      }
      answers.appNameSlug = _.slugify(answers.appName);
      answers.subpathCaps = _.capitalize(answers.subpath);
      gulp.src(__dirname + '/templates/**')
        .pipe(ejs(answers, {ext: ""}))
        .pipe(conflict('./'))
        .pipe(rename(function (file) {
          if (file.basename[0] === '_') {
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .on('end', function () {
          done();
        });
  });
});
