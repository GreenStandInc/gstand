/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../../../lexicons'
import { isObj, hasProp } from '../../../../../util'
import { CID } from 'multiformats/cid'
import * as AppGstandStorePayment from '../../store/payment'

export interface Record {
  /** The item's name */
  name?: string
  description?: string
  image?: BlobRef[]
  stock?: number
  /** Prices for the item */
  payment?: AppGstandStorePayment.Main[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.gstand.unstable.store.item#main' ||
      v.$type === 'app.gstand.unstable.store.item')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.gstand.unstable.store.item#main', v)
}
