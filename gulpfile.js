'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');

gulp.task('nodemon', function() {
    nodemon({
            script: 'ditto.js',
            ext: 'js',
            env: {
                'NODE_ENV': 'development'
            }
        });
});

gulp.task('default', ['nodemon']);
