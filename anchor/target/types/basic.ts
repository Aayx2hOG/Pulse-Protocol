/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/basic.json`.
 */
export type Basic = {
  "address": "4Fxm3VkmLo76zuuvuAZYJhtWygDD427zwMpwnMGHHJA4",
  "metadata": {
    "name": "basic",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deactivateFeed",
      "discriminator": [
        182,
        149,
        189,
        108,
        44,
        58,
        204,
        154
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "dataFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  116,
                  97,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "data_feed.feed_id",
                "account": "dataFeed"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeOracle",
      "discriminator": [
        144,
        223,
        131,
        120,
        196,
        253,
        181,
        99
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "reactivateFeed",
      "discriminator": [
        89,
        232,
        198,
        92,
        18,
        23,
        121,
        19
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "dataFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  116,
                  97,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "data_feed.feed_id",
                "account": "dataFeed"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "registerDataFeed",
      "discriminator": [
        254,
        169,
        19,
        250,
        229,
        155,
        181,
        154
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "dataFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  116,
                  97,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "feedId"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feedId",
          "type": "string"
        },
        {
          "name": "feedType",
          "type": {
            "defined": {
              "name": "feedType"
            }
          }
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "setOraclePaused",
      "discriminator": [
        61,
        243,
        64,
        36,
        121,
        38,
        141,
        241
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "transferUpdateAuthority",
      "discriminator": [
        234,
        251,
        113,
        101,
        78,
        104,
        207,
        42
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateDataFeed",
      "discriminator": [
        99,
        73,
        97,
        201,
        176,
        61,
        116,
        139
      ],
      "accounts": [
        {
          "name": "oracleConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "dataFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  116,
                  97,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "data_feed.feed_id",
                "account": "dataFeed"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "i128"
        },
        {
          "name": "valueStr",
          "type": "string"
        },
        {
          "name": "source",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "dataFeed",
      "discriminator": [
        146,
        11,
        109,
        236,
        192,
        89,
        172,
        164
      ]
    },
    {
      "name": "oracleConfig",
      "discriminator": [
        133,
        196,
        152,
        50,
        27,
        21,
        145,
        254
      ]
    }
  ],
  "events": [
    {
      "name": "dataFeedDeactivated",
      "discriminator": [
        221,
        162,
        189,
        136,
        162,
        179,
        187,
        16
      ]
    },
    {
      "name": "dataFeedReactivated",
      "discriminator": [
        204,
        86,
        116,
        33,
        210,
        155,
        48,
        129
      ]
    },
    {
      "name": "dataFeedRegistered",
      "discriminator": [
        108,
        218,
        228,
        121,
        163,
        68,
        48,
        138
      ]
    },
    {
      "name": "dataFeedUpdated",
      "discriminator": [
        78,
        85,
        252,
        246,
        87,
        123,
        170,
        54
      ]
    },
    {
      "name": "oracleInitalized",
      "discriminator": [
        158,
        11,
        215,
        76,
        51,
        161,
        209,
        205
      ]
    },
    {
      "name": "oraclePauseToggled",
      "discriminator": [
        75,
        169,
        119,
        212,
        242,
        216,
        255,
        126
      ]
    },
    {
      "name": "updateAuthorityTransferred",
      "discriminator": [
        129,
        26,
        231,
        44,
        217,
        3,
        56,
        221
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "oraclePaused",
      "msg": "Oracle is paused"
    },
    {
      "code": 6002,
      "name": "feedInactive",
      "msg": "Feed is inactive"
    },
    {
      "code": 6003,
      "name": "feedIdTooLong",
      "msg": "Feed ID too long (max 32 chars)"
    },
    {
      "code": 6004,
      "name": "descriptionTooLong",
      "msg": "Description too long (max 128 chars)"
    },
    {
      "code": 6005,
      "name": "invalidFeedType",
      "msg": "Invalid feed type"
    }
  ],
  "types": [
    {
      "name": "dataFeed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": "string"
          },
          {
            "name": "feedType",
            "type": {
              "defined": {
                "name": "feedType"
              }
            }
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "latestValue",
            "type": "i128"
          },
          {
            "name": "latestValueStr",
            "type": "string"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          },
          {
            "name": "updateCount",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "dataFeedDeactivated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "dataFeedReactivated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "dataFeedRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": "string"
          },
          {
            "name": "feedType",
            "type": {
              "defined": {
                "name": "feedType"
              }
            }
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "dataFeedUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": "string"
          },
          {
            "name": "previousValue",
            "type": "i128"
          },
          {
            "name": "newValue",
            "type": "i128"
          },
          {
            "name": "valueStr",
            "type": "string"
          },
          {
            "name": "source",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "updateCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feedType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "cryptoPrice"
          },
          {
            "name": "weather"
          },
          {
            "name": "exchangeRate"
          },
          {
            "name": "randomNumber"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "oracleConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "totalFeeds",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "oracleInitalized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "oraclePauseToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "updateAuthorityTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAuthority",
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
