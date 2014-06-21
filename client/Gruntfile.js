module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'compressed',
          compass: true
        },
        files: {
          'assets/css/app.css' : 'assets/sass/app.scss'
        }
      }
    },
    loopback_angular: {
      services: {
        options: {
          input: '../server/app.js',
          output: 'assets/js/lb-services.js',
          apiUrl: 'http://s01.chase.sillevis.net:20001/api'
        }
      },
    },
    watch: {
      css: {
        files: 'assets/**/*.scss',
        tasks: ['sass']
      },
      frontend: {
        files: [
          './assets/js/ionic.js',
          './assets/js/angular/angular.js',
          './assets/js/angular/angular-animate.js',
          './assets/js/angular/angular-route.js',
          './assets/js/angular/angular-touch.js',
          './assets/js/angular/angular-sanitize.js',
          './assets/js/angular/angular-resource.js',
          './assets/js/angular/angular-primus.js',
          './assets/js/ionic-angular.js',
          './assets/js/lb-services.js',
          './assets/js/services.js',
          './assets/js/app.js',
          './assets/js/controllers.js',
          './assets/js/leaflet.js',
          './assets/js/angular/leaflet.js'
        ],
        tasks: ['concat:frontend'],
        options: {
          livereload: true
        }
      },
    },
    concat: {
      options: {
        separator: ';',
      },
      frontend: {
        src: [
          './assets/js/ionic.js',
          './assets/js/angular/angular.js',
          './assets/js/angular/angular-animate.js',
          './assets/js/angular/angular-route.js',
          './assets/js/angular/angular-touch.js',
          './assets/js/angular/angular-sanitize.js',
          './assets/js/angular/angular-resource.js',
          './assets/js/angular/angular-primus.js',
          './assets/js/ionic-angular.js',
          './assets/js/lb-services.js',
          './assets/js/services.js',
          './assets/js/app.js',
          './assets/js/controllers.js',
          './assets/js/leaflet.js',
          './assets/js/angular/leaflet.js'
        ],
        dest: './assets/js/package.js',
      },
    },
    uglify: {
      options: {
        mangle: false
      },
      frontend: {
        files: {
          './assets/js/package.js': './assets/js/package.js',
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-loopback-angular');

  grunt.registerTask('loopback', ['loopback_angular','concat:frontend','uglify:frontend']);
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('minify', ['uglify:frontend']);
};
