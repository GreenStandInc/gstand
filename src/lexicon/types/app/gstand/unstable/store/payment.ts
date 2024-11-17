/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../../../lexicons'
import { isObj, hasProp } from '../../../../../util'
import { CID } from 'multiformats/cid'

export interface Record {
  price?: number
  currency?: string
  provider?: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.gstand.unstable.store.payment#main' ||
      v.$type === 'app.gstand.unstable.store.payment')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.gstand.unstable.store.payment#main', v)
}
