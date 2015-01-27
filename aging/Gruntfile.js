module.exports = function (grunt) {

  var appConfig = grunt.file.readJSON('package.json');

  // Load grunt tasks automatically
  // see: https://github.com/sindresorhus/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  // see: https://npmjs.org/package/time-grunt
  require('time-grunt')(grunt);

  var pathsConfig = function (appName) {
    this.app = appName || appConfig.name;

    return {
      app: this.app,
      css:  'static/css',
      sass:  'static/sass',
      images:  'static/images',
      js:  'static/js',
      staticroot:  'static/',
      bower_components:  '/bower_components',
      vizminjs:  'static/js/viz.min.js',
      homeminjs:  'static/js/home.min.js',
      fontawesome:  'static/sass/vendor/fontawesome/font-awesome.scss'
    }
  };

  grunt.initConfig({

    paths: pathsConfig(),
    pkg: appConfig,

    clean: ['<%= paths.fontawesome %>'],
bower_concat: {
    vendor: {
      dest: '<%= paths.js %>' + '/vendor.js',
      cssDest: '<%= paths.css %>' + '/vendor.css',
      mainFiles: {
        "bootstrap-sass-official": [
          "assets/javascripts/bootstrap/affix.js",
          "assets/javascripts/bootstrap/alert.js",
          "assets/javascripts/bootstrap/button.js",
          "assets/javascripts/bootstrap/carousel.js",
          "assets/javascripts/bootstrap/collapse.js",
          "assets/javascripts/bootstrap/dropdown.js",
          "assets/javascripts/bootstrap/tab.js",
          "assets/javascripts/bootstrap/transition.js",
          "assets/javascripts/bootstrap/scrollspy.js",
          "assets/javascripts/bootstrap/modal.js",
          "assets/javascripts/bootstrap/tooltip.js",
          "assets/javascripts/bootstrap/popover.js"
        ],
        "d3": "d3.min.js",
        "leaflet": [
          "dist/leaflet.js",
          "dist/leaflet.css",
        ],
        "jquery": ["dist/jquery.min.js"],
      },
      exclude: [
        'fontawesome',
        'bootstrap',
        'modernizer',
      ],
      bowerOptions: {
        relative: false
      }
    }
  },

    bowercopy: {
      options: {},
      bootstrap: {
        options: {
            destPrefix: '<%= paths.staticroot %>',
                 },
        files: {
            'sass/vendor/bootstrap': 'bootstrap-sass-official/assets/stylesheets/bootstrap/*.scss',
            'sass/vendor/bootstrap/mixins': 'bootstrap-sass-official/assets/stylesheets/bootstrap/mixins/*.scss',
            'sass/vendor/_bootstrap.scss': 'bootstrap-sass-official/assets/stylesheets/_bootstrap.scss',
            'fonts': 'bootstrap-sass-official/assets/fonts/bootstrap/*.*',
            }
      },
      fontawesome: {
          options: {
              destPrefix: '<%= paths.staticroot %>'
          },
          files: {
              'sass/vendor/fontawesome': 'fontawesome/scss/*.scss',
              'fonts': 'fontawesome/fonts/*.*',
          }
      },
      fontawesomepartial: {
          options: {
              srcPrefix: '<%= paths.sass %>',
              destPrefix: '<%= paths.sass %>'
          },
          files: {
              'vendor/fontawesome/_font-awesome-base.scss': 'vendor/fontawesome/font-awesome.scss'
          }
      }
    },

    // see: https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      gruntfile: {
        files: ['Gruntfile.js']
      },
      compass: {
        files: ['<%= paths.sass %>/**/*.{scss,sass}'],
        tasks: ['compass:server']
      },
      livereload: {
        files: [
          '<%= paths.js %>/**/*.js',
          '<%= paths.sass %>/**/*.{scss,sass}',
          '<%= paths.app %>/**/*.html'
          ],
        options: {
          spawn: false,
          livereload: true,
        },
      },
    },

    // see: https://github.com/gruntjs/grunt-contrib-compass
    compass: {
      options: {
          sassDir: '<%= paths.sass %>',
          cssDir: '<%= paths.css %>',
          imagesDir: '<%= paths.images %>',
          relativeAssets: false,
          assetCacheBuster: false,
          raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          environment: 'production'
        }
      },
      server: {
        options: {
          // debugInfo: true
        }
      }
    },

    // see: https://npmjs.org/package/grunt-bg-shell
    bgShell: {
      _defaults: {
        bg: true
      },
      runTemplate: {
        cmd: 'python -m SimpleHTTPServer 8888'
      }
    }
  });

  grunt.registerTask('serve', [
    'bgShell:runTemplate',
    'watch'
  ]);

  grunt.registerTask('build', [
    'compass:dist'
  ]);

  grunt.registerTask('setup-static', [
    'bowercopy',
    'clean',
    'bower_concat',
    'compass:dist'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
