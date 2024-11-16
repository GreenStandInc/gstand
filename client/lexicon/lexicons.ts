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
          properties: {
            name: {
              type: 'string',
              description: "The item's name",
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
  AppGstandStorePayment: {
    lexicon: 1,
    id: 'app.gstand.store.payment',
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
  AppGstandStoreItem: 'app.gstand.store.item',
  AppGstandStorePayment: 'app.gstand.store.payment',
}
