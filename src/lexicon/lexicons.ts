/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon'

export const schemaDict = {
  AppGstandStoreItem: {
    lexicon: 1,
    id: 'app.gstand.store.item',
    defs: {
      main: {
        type: 'record',
        description: 'A declaration of a GStand shop item',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'description', 'image', 'payment'],
          properties: {
            name: {
              type: 'string',
              maxLength: 500,
              description: "The item's name",
            },
            description: {
              type: 'string',
              maxLength: 10000,
            },
            image: {
              type: 'array',
              items: {
                type: 'blob',
                accept: ['image/png', 'image/jpeg'],
                maxSize: 1000000,
              },
            },
            stock: {
              type: 'integer',
              minimum: 0,
            },
            payment: {
              type: 'array',
              description: 'Prices for the item',
              items: {
                type: 'ref',
                ref: 'lex:app.gstand.store.payment',
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
            updatedAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
    },
  },
  AppGstandStorePayment: {
    lexicon: 1,
    id: 'app.gstand.store.payment',
    defs: {
      main: {
        type: 'object',
        description: 'A payment type for an item',
        properties: {
          price: {
            type: 'integer',
            minimum: 0,
          },
          currency: {
            type: 'string',
          },
          provider: {
            type: 'string',
          },
        },
      },
    },
  },
  AppGstandStoreShop: {
    lexicon: 1,
    id: 'app.gstand.store.shop',
    defs: {
      main: {
        type: 'record',
        description: 'A curated shop page',
        key: 'tid',
        record: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            banner: {
              type: 'blob',
              accept: ['image/png', 'image/jpeg'],
            },
            items: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.strongRef',
              },
            },
          },
        },
      },
    },
  },
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: 'com.atproto.repo.strongRef',
    description: 'A URI with a content-hash fingerprint.',
    defs: {
      main: {
        type: 'object',
        required: ['uri', 'cid'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>

export const schemas = Object.values(schemaDict)
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = {
  AppGstandStoreItem: 'app.gstand.store.item',
  AppGstandStorePayment: 'app.gstand.store.payment',
  AppGstandStoreShop: 'app.gstand.store.shop',
  ComAtprotoRepoStrongRef: 'com.atproto.repo.strongRef',
}
