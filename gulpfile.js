import del from 'del';
import gulp from 'gulp';
import changed from 'gulp-changed';
import documentation from 'gulp-documentation';
import sass from 'gulp-sass';

const { dest, src, parallel, series, watch } = gulp; // eslint-disable-line object-curly-newline

const jsSources = 'src/js/**/*.*';
const libSources = 'lib/**/*.*';
const scssSources = ['src/scss/**/*.scss', 'src/scss/**/*.css'];
const webSources = 'src/*.*';

const cssDestination = 'dist/css';
const documentationDestination = 'documentation';
const jsDestination = 'dist/js';
const libDestination = 'dist/lib';
const webDestination = 'dist';

function copyChanged(from, to) {
  return src(from)
    .pipe(changed(to))
    .pipe(dest(to));
}

function copyWebSources() { return copyChanged(webSources, webDestination); }
function copyJsSources() { return copyChanged(jsSources, jsDestination); }
function copyLib() { return copyChanged(libSources, libDestination); }


export function generateDocumentation() {
  return src(jsSources)
    .pipe(documentation('html', { 'sort-order': 'alpha' }))
    .pipe(dest(documentationDestination));
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

const createDist = parallel(
  copyWebSources, copyJsSources, copyLib, generateDocumentation, generateCSS
);

export const recreateDist = series(cleanDist, createDist);

export default function startWatch(cb) {
  watch(webSources, copyWebSources);
  watch(jsSources, parallel(copyJsSources, generateDocumentation));
  watch(scssSources, generateCSS);
  watch(libSources, copyLib);

  cb();
}
