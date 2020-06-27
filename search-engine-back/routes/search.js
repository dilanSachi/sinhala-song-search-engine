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

    var b_artist = 1;
    var b_shares = 1;
    var b_unformatted_lyrics = 1;
    var b_title = 1;
    var b_view_count = 1;
    var b_beat = 1;
    var b_writer = 1;
    var b_genre = 1;
    var b_key = 1;
    var b_composer = 1;
    var b_movie = 1;

    var sorting = 0;
    var range = 0;

    if (query_words.length > 8) {
        b_unformatted_lyrics = b_unformatted_lyrics + 1;
    } else {
        query_words.forEach(word => {
            console.log(word)
            if (named_entities.artist_names.includes(word)) { 
                console.log('unnotside')
                b_artist = b_artist + 1; }
            if (named_entities.writer_names.includes(word)) { b_writer = b_writer + 1; }
            if (named_entities.composer_names.includes(word)) { b_composer = b_composer + 1; }
            if (named_entities.genre_names.includes(word)) { b_genre = b_genre + 1; }
            if (named_entities.movie_names.includes(word)) { b_movie = b_movie + 1; }

            if (keywords.artist.includes(word)) { 
                console.log('unside')
                b_artist = b_artist + 1; }
            if (keywords.composer.includes(word)) { b_composer = b_composer + 1; }
            if (keywords.genre.includes(word)) { b_genre = b_genre + 1; }
            if (keywords.write.includes(word)) { b_writer = b_writer + 1; }

            if (keywords.sorting.includes(word)) { sorting = sorting + 1; }

            if (!isNaN(word)) {
                range = parseInt(word);
            }
        });
    }

    console.log(b_artist)
    console.log(b_writer)
    console.log(b_composer)
    console.log(b_genre)
    console.log(b_movie)
    console.log(sorting)
    console.log(range)
    

    const { body } = await client.search({
        index: 'index_sinhala_songs',
        body: {
            size : 100,
            _source: {
                includes: ["_id", "artist", "title", "writer", "composer"]
            },
            query: {
                multi_match : {
                    query: query,
                    fields: [`artist^${b_artist}`, `movie^${b_movie}`, `title^${b_title}`,
                    `composer^${b_composer}`, `genre^${b_genre}`, `writer^${b_writer}`, `movie^${b_movie}`,
                    `unformattedLyrics^${b_unformatted_lyrics}`]
                }
            }
        }
    });
    // console.log(body.hits.hits);
    console.log(query)

    res.send(body.hits.hits);
});

module.exports = router;