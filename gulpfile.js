import del from 'del';
import gulp from 'gulp';
import sass from 'gulp-sass';

const { dest, src, parallel, series, watch } = gulp; // eslint-disable-line object-curly-newline

function createLib(cb) {
  src('lib/**/*.*').pipe(dest('dist/lib'));

  cb();
}

function generateDocumentation(cb) {
  // TODO

  cb();
}

function cleanDist() {
  return del('dist');
}

function generateCSS() {
  return src(['src/scss/**/*.scss', 'src/scss/**/*.css'])
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css'));
}

function copySources(cb) {
  src('src/*.*').pipe(dest('dist'));
  src('src/js/**/*.*').pipe(dest('dist/js'));

  cb();
}


const createDist = parallel(copySources, createLib, generateDocumentation, generateCSS);

export const recreateDist = series(cleanDist, createDist);

export default function startWatch(cb) {
  watch(['src/*.*', 'src/js/**/*.*'], parallel(copySources, generateDocumentation));
  watch(['src/scss/**/*.scss', 'src/scss/**/*.css'], generateCSS);
  watch('lib/**/*.*', createLib);

  cb();
}
