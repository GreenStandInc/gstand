/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'

/** A payment type for an item */
export interface Main {
  price?: number
  currency?: string
  provider?: string
  [k: string]: unknown
}

export function isMain(v: unknown): v is Main {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.gstand.store.payment#main' ||
      v.$type === 'app.gstand.store.payment')
  )
}

export function validateMain(v: unknown): ValidationResult {
  return lexicons.validate('app.gstand.store.payment#main', v)
}
