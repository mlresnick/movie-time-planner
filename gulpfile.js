import del from 'del';
import gulp from 'gulp';
import changed from 'gulp-changed';
import sass from 'gulp-sass';

const { dest, src, parallel, series, watch } = gulp; // eslint-disable-line object-curly-newline

function copyChanged(from, to) {
  return src(from).pipe(changed(to)).pipe(dest(to));
}

function createLib() { return copyChanged('lib/**/*.*', 'dist/lib'); }

function generateDocumentation(cb) {
  // TODO

  cb();
}

function cleanDist() {
  return del('dist');
}

function generateCSS() {
  return src(['src/scss/**/*.scss', 'src/scss/**/*.css'])
    .pipe(changed('dist/css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css'));
}

function copySources(cb) {
  copyChanged('src/*.*', 'dist');
  copyChanged('src/js/**/*.*', 'dist/js');

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
