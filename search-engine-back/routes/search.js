'use strict'

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

var keywords = require("../../data/keywords.json");
var named_entities = require("../../data/named_entities.json");

router.post('/', async function (req, res) {
    var query = req.body.query;
    var query_words = query.trim().split(" ");
    var removing_query_words = [];

    var size = 100;

    var field_type = '';

    var b_artist = 1;
    var b_unformatted_lyrics = 1;
    var b_title = 1;
    var b_writer = 1;
    var b_genre = 1;
    var b_composer = 1;
    var b_movie = 1;
Che
    var sorting = 0;
    var range = 0;
    var sort_method = [];

    if (query_words.length > 8) {
        b_unformatted_lyrics = b_unformatted_lyrics + 2;
        field_type = 'best_fields';
    } else {
        field_type = 'cross_fields';
        query_words.forEach(word => {
            word = word.replace('ගේ', '');
            word = word.replace('යන්ගේ', '');
            if (named_entities.artist_names.includes(word)) {
                b_artist = b_artist + 1;
            }
            if (named_entities.writer_names.includes(word)) {
                b_writer = b_writer + 1;
            }
            if (named_entities.composer_names.includes(word)) {
                b_composer = b_composer + 1;
            }
            if (named_entities.genre_names.includes(word)) {
                b_genre = b_genre + 1;
            }
            if (named_entities.movie_names.includes(word)) {
                b_movie = b_movie + 1;
            }

            if (keywords.artist.includes(word)) {
                b_artist = b_artist + 1;
                removing_query_words.push(word);
            }
            if (keywords.composer.includes(word)) {
                b_composer = b_composer + 1;
                removing_query_words.push(word);
            }
            if (keywords.genre.includes(word)) {
                b_genre = b_genre + 1;
                removing_query_words.push(word);
            }
            if (keywords.write.includes(word)) {
                b_writer = b_writer + 1;
                removing_query_words.push(word);
            }
            if (keywords.song.includes(word)) {
                removing_query_words.push(word);
            }

            if (keywords.sorting.includes(word)) {
                sorting = sorting + 1;
                removing_query_words.push(word);
            }

            if (!isNaN(word)) {
                range = parseInt(word);
                removing_query_words.push(word);
            }
        });
    }
    if (range == 0 && sorting > 0) {
        size = 10;
        sort_method = [{ viewCount: { order: "desc" } }];
    } else if (range > 0 || sorting > 0) {
        size = range;
        sort_method = [{ viewCount: { order: "desc" } }];
    }

    removing_query_words.forEach(word => {
        query = query.replace(word, '');
    });

    var result = await client.search({
        index: 'index_sinhala_songs',
        body: {
            size: size,
            _source: {
                includes: ["artist", "title", "writer", "composer", "genre", "formattedLyrics", "key", "beat"]
            },
            sort: sort_method,
            query: {
                multi_match: {
                    query: query.trim(),
                    fields: [`artist^${b_artist}`, `movie^${b_movie}`, `title^${b_title}`,
                    `composer^${b_composer}`, `genre^${b_genre}`, `writer^${b_writer}`, `movie^${b_movie}`,
                    `unformattedLyrics^${b_unformatted_lyrics}`, `key`, `beat`],
                    operator: "or",
                    type: field_type
                }
            },
            aggs: {
                "genre_filter": {
                    terms: {
                        field: "genre.raw",
                        size: 10
                    }
                },
                "composer_filter": {
                    terms: {
                        field: "composer.raw",
                        size: 10
                    }
                },
                "artist_filter": {
                    terms: {
                        field: "artist.raw",
                        size: 10
                    }
                },
                "writer_filter": {
                    terms: {
                        field: "writer.raw",
                        size: 10
                    }
                }
            }
        }
    });

    res.send({
        aggs: result.body.aggregations,
        hits: result.body.hits.hits
    });
});

module.exports = router;