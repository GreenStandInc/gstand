/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../../../lexicons'
import { isObj, hasProp } from '../../../../../util'
import { CID } from 'multiformats/cid'
import * as AppGstandUnstableStoreItem from './item'

export interface Record {
  name?: string
  banner?: BlobRef
  items?: AppGstandUnstableStoreItem.Main[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.gstand.unstable.store.shop#main' ||
      v.$type === 'app.gstand.unstable.store.shop')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.gstand.unstable.store.shop#main', v)
}
