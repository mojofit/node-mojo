const gulp = require('gulp');
const ts = require('gulp-typescript');
const gutil = require('gulp-util');
const spawn = require('child_process').spawn;
let node;

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts', 'server']);
});

gulp.task('server', ['scripts'], () => {
  if (node) node.kill();
  node = spawn('node', ['dist/index.js'], {stdio: 'inherit'});
  node.on('close', code => {
    if (code === 8) {
      gutil.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('default', ['watch', 'server']);

// clean up if an error goes unhandled.
process.on('exit', () => {
  if (node) node.kill()
});
