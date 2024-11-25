/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'
import * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'

export interface Record {
  name?: string
  banner?: BlobRef
  items?: ComAtprotoRepoStrongRef.Main[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.gstand.store.shop#main' ||
      v.$type === 'app.gstand.store.shop')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.gstand.store.shop#main', v)
}
