'use strict'
const prettifiedData = require('../../songs_prettify.json')
var fs = require('fs');

var artist_names = [];
var writer_names = [];
var composer_names = [];
var genre_names = [];
var movie_names = [];

function collect_named_entities() {
    prettifiedData.forEach(song => {
        var artists = song.artist;
        if (artists) {
            artists.forEach(artist => {
                var splits = artist.trim().split(' ');
                splits.forEach(split => {
                    if (!artist_names.includes(split.trim())) {
                        artist_names.push(split.trim());
                    }
                });
            });
        }
        var writers = song.writer;
        if (writers) {
            writers.forEach(writer => {
                var splits = writer.trim().split(' ');
                splits.forEach(split => {
                    if (!writer_names.includes(split.trim())) {
                        writer_names.push(split.trim());
                    }
                });
            });
        }
        var composers = song.composer;
        if (composers) {
            composers.forEach(composer => {
                var splits = composer.trim().split(' ');
                splits.forEach(split => {
                    if (!composer_names.includes(split.trim())) {
                        composer_names.push(split.trim());
                    }
                });
            });
        }
        var genres = song.genre;
        if (genres) {
            genres.forEach(genre => {
                var splits = genre.trim().split(' ');
                splits.forEach(split => {
                    if (!genre_names.includes(split.trim())) {
                        genre_names.push(split.trim());
                    }
                });
            });
        }
        if (song.movie) {
            var splits = song.movie.trim().split(' ');
            splits.forEach(split => {
                if (!movie_names.includes(split.trim())) {
                    movie_names.push(split.trim());
                }
            });
        }
    });

    var entities = {
        artist_names,
        writer_names,
        composer_names,
        genre_names,
        movie_names
    }
    var jsonentities = JSON.stringify(entities);
    var fs = require('fs');
    fs.writeFile('../data/named_entities.json', jsonentities, 'utf8', (error) => {console.log(error)});
}

collect_named_entities();