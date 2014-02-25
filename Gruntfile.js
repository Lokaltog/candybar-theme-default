module.exports = function (grunt) {
	var matchdep = require('matchdep')

	matchdep.filter('grunt-*').forEach(grunt.loadNpmTasks)

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			all: [
				'webroot/static',
				'webroot/views',
			],
		},
		sync: {
			all: {
				files: [{
					cwd: 'app/assets',
					src: '{font,img,etc}/**',
					dest: 'webroot/static/',
				}],
			},
		},
		stylus: {
			all: {
				options: {
					debug: false,
					compress: true,
					'include css': true,
					use: [
						require('nib'),
					],
					'import': [
						'nib',
					],
				},
				files: [{
					'webroot/static/css/main.css': [
						'app/assets/styl/main.styl',
					],
				}],
			},
		},
		jade: {
			all: {
				options: {
					pretty: false,
					data: {
						__min: '.min',
						__debug: false,
					},
				},
				files: [{
					expand: true,
					cwd: 'app/views',
					src: '**/*.jade',
					dest: 'webroot/',
					ext: '.html',
				}],
			},
		},
		cssmin: {
			all: {
				files: [{
					expand: true,
					cwd: 'webroot/static/css',
					src: '**/*.css',
					dest: 'webroot/static/css',
				}],
			},
		},
		htmlmin: {
			all: {
				options: {
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
				},
				files: [{
					expand: true,
					cwd: 'webroot/',
					src: '**/*.html',
					dest: 'webroot/',
				}],
			},
		},
		uglify: {
			all: {
				files: {
					'webroot/static/js/main.js': ['app/assets/js/lib/angular.min.js', 'app/assets/js/main.js'],
				},
			},
		},
		smoosher: {
			all: {
				files: {
					'webroot/index.html': 'webroot/index.html',
				},
			},
		},
	})

	grunt.registerTask('default', [
		'clean',
		'sync',
		'stylus',
		'jade',
		'cssmin',
		'htmlmin',
		'uglify',
		'smoosher',
	])
}
