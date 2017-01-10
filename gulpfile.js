const gulp = require('gulp')
  , browserify = require('browserify')
  , mocha = require('gulp-mocha')
  , fs = require('fs');

function buildPublic(base, out) {
  browserify(base)
    .transform('babelify')
    .bundle()
    .on('error', err => {
      console.log('\u001b[31m'+err.message+'\u001b[0m');
    })
    .pipe(fs.createWriteStream(out));
}

gulp.task('game', () => {
  buildPublic('./src/public/game/container.jsx', './public/js/dist/game.js');
});
gulp.task('matching', () => {
  buildPublic('./src/public/matching/index.js', './public/js/dist/matching.js');
});

gulp.task('build', ['game', 'matching']);

gulp.task('mocha', () => {
  return gulp.src(['test/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'spec'}))
    .on('error', err => {
      console.log('\u001b[31m'+err.message+'\u001b[0m');
    });
});

gulp.task('watch', () => {
  gulp.watch('./src/public/game/**/*.{js,jsx}', ['game']);
  gulp.watch('./src/public/matching/**/*.{js,jsx}', ['matching']);
  gulp.watch('test/**', ['mocha']);
});

gulp.task('default', ['build', 'watch']);



