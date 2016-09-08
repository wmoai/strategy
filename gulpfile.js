const gulp = require('gulp')
  , babel = require('gulp-babel')
  , browserify = require('browserify')
  , fs = require('fs')
;

gulp.task('browserify', () => {
  browserify('./public/js/src/container.jsx')
    .transform('babelify')
    .bundle()
    .on('error', function(err){
      console.log('\u001b[31m'+err.message+'\u001b[0m');
    })
    .pipe(fs.createWriteStream('./public/js/dist/container.js'));
});

gulp.task('build', ['browserify']);

gulp.task('watch', () => {
  gulp.watch('./public/js/src/**/*.{js,jsx}', ['browserify']);
});

gulp.task('default', ['build', 'watch']);
