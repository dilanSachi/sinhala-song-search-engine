'use strict'

require('array.prototype.flatmap').shim()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
})

const prettifiedData = require('../../songs_prettify.json')


async function run() {
  await client.indices.create({
    index: 'index_sinhala_songs',
    body: {
      // "settings": {
      //   "analysis": {
      //     "analyzer": {
      //       "my_analyzer": {
      //         "tokenizer": "my_tokenizer"
      //       }
      //     },
      //     "tokenizer": {
      //       "my_tokenizer": {
      //         "type": "edge_ngram",
      //         "min_gram": 2,
      //         "max_gram": 10,
      //         "token_chars": [
      //           "letter",
      //           "digit"
      //         ]
      //       }
      //     }
      //   }
      // },
      "settings": {
        "analysis": {
          "analyzer": {
            "my_analyzer": {
              "type": "custom",
              "tokenizer": "icu_tokenizer",
              "filter": ["customNgram"]
            }
          },
          "filter": {
            "customNgram": {
              "type": "edge_ngram",
              "min_gram": "4",
              "max_gram": "18",
              "side": "front"
            }
          }

        }
      },
      "mappings": {
        "properties": {
          "artist": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          },
          "shares": { "type": "integer" },
          "formattedLyrics": { "type": "text" },
          "unformattedLyrics": { "type": "text" },
          "title": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          },
          "url": { "type": "text" },
          "viewCount": { "type": "integer" },
          "beat": { "type": "text" },
          "writer": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          },
          "genre": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          },
          "key": { "type": "text" },
          "composer": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          },
          "movie": {
            "type": "text",
            "fields": {
              "raw": { 
                "type":  "keyword"
              }
            },
            "analyzer": "my_analyzer"
          }
        }
      }
    }
  }, { ignore: [400] })

  const dataset = prettifiedData;

  const body = dataset.flatMap(doc => [{ index: { _index: 'index_sinhala_songs' } }, doc])

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'index_sinhala_songs' })
  console.log(count)
}

run().catch(console.log)