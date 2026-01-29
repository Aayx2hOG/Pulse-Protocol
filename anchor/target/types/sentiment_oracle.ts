/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sentiment_oracle.json`.
 */
export type SentimentOracle = {
  "address": "4Fxm3VkmLo76zuuvuAZYJhtWygDD427zwMpwnMGHHJA4",
  "metadata": {
    "name": "sentimentOracle",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPrediction",
      "discriminator": [
        186,
        30,
        192,
        149,
        194,
        124,
        119,
        37
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "predictionId"
              }
            ]
          }
        },
        {
          "name": "creator",
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
          "name": "predictionId",
          "type": "string"
        },
        {
          "name": "targetAsset",
          "type": "string"
        },
        {
          "name": "predictionType",
          "type": {
            "defined": {
              "name": "predictionType"
            }
          }
        },
        {
          "name": "targetValue",
          "type": "i64"
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createSentimentFeed",
      "discriminator": [
        116,
        200,
        244,
        201,
        235,
        71,
        185,
        244
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "sentimentFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "assetId"
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
          "name": "assetId",
          "type": "string"
        },
        {
          "name": "assetType",
          "type": {
            "defined": {
              "name": "assetType"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
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
      "name": "pauseOracle",
      "discriminator": [
        170,
        116,
        3,
        121,
        247,
        109,
        147,
        191
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "prediction.prediction_id",
                "account": "prediction"
              }
            ]
          }
        },
        {
          "name": "bet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "prediction.prediction_id",
                "account": "prediction"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "bettor",
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
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "position",
          "type": "bool"
        }
      ]
    },
    {
      "name": "registerAnalyst",
      "discriminator": [
        194,
        2,
        101,
        255,
        26,
        16,
        209,
        153
      ],
      "accounts": [
        {
          "name": "analyst",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
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
          "name": "name",
          "type": "string"
        },
        {
          "name": "modelHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "resolvePrediction",
      "discriminator": [
        199,
        159,
        54,
        235,
        121,
        68,
        53,
        137
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "prediction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  100,
                  105,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "prediction.prediction_id",
                "account": "prediction"
              }
            ]
          }
        },
        {
          "name": "resolver",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "actualValue",
          "type": "i64"
        },
        {
          "name": "proofHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "stakeTokens",
      "discriminator": [
        136,
        126,
        91,
        162,
        40,
        131,
        13,
        127
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "analyst",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitSentiment",
      "discriminator": [
        48,
        133,
        20,
        53,
        129,
        31,
        109,
        220
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "analyst",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "sentimentFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "sentiment_feed.asset_id",
                "account": "sentimentFeed"
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
          "name": "sentimentScore",
          "type": "u8"
        },
        {
          "name": "confidence",
          "type": "u8"
        },
        {
          "name": "reasoningHash",
          "type": "string"
        },
        {
          "name": "sources",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "discriminator": [
        58,
        119,
        215,
        143,
        203,
        223,
        32,
        86
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "analyst",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAnalystReputation",
      "discriminator": [
        160,
        80,
        173,
        33,
        72,
        219,
        249,
        189
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "analyst",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  97,
                  108,
                  121,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "analyst.authority",
                "account": "analyst"
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
          "name": "correct",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "analyst",
      "discriminator": [
        5,
        109,
        170,
        179,
        124,
        13,
        95,
        86
      ]
    },
    {
      "name": "bet",
      "discriminator": [
        147,
        23,
        35,
        59,
        15,
        75,
        155,
        32
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
    },
    {
      "name": "prediction",
      "discriminator": [
        98,
        127,
        141,
        187,
        218,
        33,
        8,
        14
      ]
    },
    {
      "name": "sentimentFeed",
      "discriminator": [
        25,
        119,
        160,
        245,
        24,
        29,
        152,
        178
      ]
    }
  ],
  "events": [
    {
      "name": "betPlaced",
      "discriminator": [
        88,
        88,
        145,
        226,
        126,
        206,
        32,
        0
      ]
    },
    {
      "name": "predictionCreated",
      "discriminator": [
        132,
        136,
        244,
        237,
        14,
        12,
        159,
        159
      ]
    },
    {
      "name": "predictionResolved",
      "discriminator": [
        117,
        60,
        206,
        67,
        119,
        213,
        84,
        17
      ]
    },
    {
      "name": "reputationUpdated",
      "discriminator": [
        26,
        36,
        187,
        150,
        235,
        90,
        106,
        89
      ]
    },
    {
      "name": "sentimentSubmitted",
      "discriminator": [
        106,
        52,
        133,
        243,
        100,
        47,
        92,
        177
      ]
    },
    {
      "name": "stakeDeposited",
      "discriminator": [
        69,
        152,
        144,
        109,
        232,
        34,
        225,
        19
      ]
    },
    {
      "name": "stakeWithdrawn",
      "discriminator": [
        33,
        120,
        159,
        58,
        140,
        255,
        174,
        79
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "paused",
      "msg": "Oracle is paused"
    },
    {
      "code": 6002,
      "name": "nameTooLong",
      "msg": "Name too long"
    },
    {
      "code": 6003,
      "name": "hashTooLong",
      "msg": "Hash too long"
    },
    {
      "code": 6004,
      "name": "assetIdTooLong",
      "msg": "Asset ID too long"
    },
    {
      "code": 6005,
      "name": "predictionIdTooLong",
      "msg": "Prediction ID too long"
    },
    {
      "code": 6006,
      "name": "invalidScore",
      "msg": "Invalid sentiment score"
    },
    {
      "code": 6007,
      "name": "invalidConfidence",
      "msg": "Invalid confidence"
    },
    {
      "code": 6008,
      "name": "tooManySources",
      "msg": "Too many sources"
    },
    {
      "code": 6009,
      "name": "insufficientStake",
      "msg": "Insufficient stake"
    },
    {
      "code": 6010,
      "name": "analystInactive",
      "msg": "Analyst inactive"
    },
    {
      "code": 6011,
      "name": "feedInactive",
      "msg": "Feed inactive"
    },
    {
      "code": 6012,
      "name": "predictionResolved",
      "msg": "Prediction already resolved"
    },
    {
      "code": 6013,
      "name": "deadlinePassed",
      "msg": "Deadline passed"
    },
    {
      "code": 6014,
      "name": "deadlineNotReached",
      "msg": "Deadline not reached"
    },
    {
      "code": 6015,
      "name": "invalidDeadline",
      "msg": "Invalid deadline"
    },
    {
      "code": 6016,
      "name": "oraclePaused",
      "msg": "Oracle is paused"
    }
  ],
  "types": [
    {
      "name": "analyst",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "modelHash",
            "type": "string"
          },
          {
            "name": "reputationScore",
            "type": "u16"
          },
          {
            "name": "totalPredictions",
            "type": "u64"
          },
          {
            "name": "correctPredictions",
            "type": "u64"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "assetType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "cryptocurrency"
          },
          {
            "name": "stock"
          },
          {
            "name": "commodity"
          },
          {
            "name": "forex"
          },
          {
            "name": "nft"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bettor",
            "type": "pubkey"
          },
          {
            "name": "prediction",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "position",
            "type": "bool"
          },
          {
            "name": "placedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "betPlaced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictionId",
            "type": "string"
          },
          {
            "name": "bettor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "position",
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
      "name": "oracleConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "totalFeeds",
            "type": "u64"
          },
          {
            "name": "totalPredictions",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "prediction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictionId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "targetAsset",
            "type": "string"
          },
          {
            "name": "predictionType",
            "type": {
              "defined": {
                "name": "predictionType"
              }
            }
          },
          {
            "name": "targetValue",
            "type": "i64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "outcome",
            "type": {
              "defined": {
                "name": "predictionOutcome"
              }
            }
          },
          {
            "name": "yesStake",
            "type": "u64"
          },
          {
            "name": "noStake",
            "type": "u64"
          },
          {
            "name": "totalParticipants",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "resolvedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "predictionCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictionId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "targetAsset",
            "type": "string"
          },
          {
            "name": "targetValue",
            "type": "i64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "predictionOutcome",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "yes"
          },
          {
            "name": "no"
          },
          {
            "name": "invalid"
          }
        ]
      }
    },
    {
      "name": "predictionResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "predictionId",
            "type": "string"
          },
          {
            "name": "outcome",
            "type": {
              "defined": {
                "name": "predictionOutcome"
              }
            }
          },
          {
            "name": "actualValue",
            "type": "i64"
          },
          {
            "name": "proofHash",
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
      "name": "predictionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "priceAbove"
          },
          {
            "name": "priceBelow"
          },
          {
            "name": "sentimentAbove"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "reputationUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "analyst",
            "type": "pubkey"
          },
          {
            "name": "newScore",
            "type": "u16"
          },
          {
            "name": "correct",
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
      "name": "sentimentFeed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetId",
            "type": "string"
          },
          {
            "name": "assetType",
            "type": {
              "defined": {
                "name": "assetType"
              }
            }
          },
          {
            "name": "sentimentScore",
            "type": "u8"
          },
          {
            "name": "confidence",
            "type": "u8"
          },
          {
            "name": "bullishCount",
            "type": "u64"
          },
          {
            "name": "bearishCount",
            "type": "u64"
          },
          {
            "name": "neutralCount",
            "type": "u64"
          },
          {
            "name": "dataPoints",
            "type": "u64"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          },
          {
            "name": "trend",
            "type": {
              "defined": {
                "name": "trend"
              }
            }
          },
          {
            "name": "volatility",
            "type": "u8"
          },
          {
            "name": "isActive",
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
      "name": "sentimentSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feed",
            "type": "string"
          },
          {
            "name": "analyst",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u8"
          },
          {
            "name": "confidence",
            "type": "u8"
          },
          {
            "name": "weightedScore",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakeDeposited",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "analyst",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalStake",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakeWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "analyst",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "remainingStake",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "trend",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "bullish"
          },
          {
            "name": "bearish"
          },
          {
            "name": "neutral"
          }
        ]
      }
    }
  ]
};
