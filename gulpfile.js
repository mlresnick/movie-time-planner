import del from 'del';
import gulp from 'gulp';
import changed from 'gulp-changed';
import sass from 'gulp-sass';

const { dest, src, parallel, series, watch } = gulp; // eslint-disable-line object-curly-newline

const jsSources = 'src/js/**/*.*';
const libSources = 'lib/**/*.*';
const scssSources = ['src/scss/**/*.scss', 'src/scss/**/*.css'];
const webSources = 'src/*.*';

const cssDestination = 'dist/css';
const jsDestination = 'dist/js';
const libDestination = 'dist/lib';
const webDestination = 'dist';

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
  return src(scssSources)
    .pipe(changed(cssDestination))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(cssDestination));
}

function copySources(cb) {
  copyChanged(rootSources, rootDestination);
  copyChanged(jsSources, jsDestination);

  cb();
}


const createDist = parallel(copySources, createLib, generateDocumentation, generateCSS);

export const recreateDist = series(cleanDist, createDist);

export default function startWatch(cb) {
  watch(webSources, copyWebSources);
  watch(jsSources, parallel(copyJsSources, generateDocumentation));
  watch(scssSources, generateCSS);
  watch(libSources, copyLib);

  cb();
}
