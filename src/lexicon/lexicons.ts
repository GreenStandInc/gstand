/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon'

export const schemaDict = {
  AppGstandUnstableStoreItem: {
    lexicon: 1,
    id: 'app.gstand.unstable.store.item',
    defs: {
      main: {
        type: 'record',
        description: 'A declaration of a GStand shop item',
        key: 'tid',
        record: {
          type: 'object',
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
          },
        },
      },
    },
  },
  AppGstandUnstableStorePayment: {
    lexicon: 1,
    id: 'app.gstand.unstable.store.payment',
    defs: {
      main: {
        type: 'record',
        description: 'A payment type for an item',
        key: 'tid',
        record: {
          type: 'object',
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
  },
} as const satisfies Record<string, LexiconDoc>

export const schemas = Object.values(schemaDict)
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = {
  AppGstandUnstableStoreItem: 'app.gstand.unstable.store.item',
  AppGstandUnstableStorePayment: 'app.gstand.unstable.store.payment',
}
