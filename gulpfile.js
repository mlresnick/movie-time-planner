import del from 'del';
import gulp from 'gulp';
import sass from 'gulp-sass';

const { dest, src, parallel, series } = gulp; // eslint-disable-line object-curly-newline

function createLib(cb) {
  src('lib/**/*.*').pipe(dest('dist/lib'));
  // [
  //   'framework7/js',
  //   'framework7/css',
  //   'framework7-icons/fonts',
  //   'material-design-icons/iconfont',
  // ].forEach(dir => src(`node_modules/${dir}/*.*`).pipe(dest(`dist/lib/${dir}/`)));

  cb();
}

// TODO
function generateDocumentation(cb) {
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

const recreateDist = series(cleanDist, createDist);
// TODO update taks based on watch results
export default recreateDist;
