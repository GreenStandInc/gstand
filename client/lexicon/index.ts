/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, FetchHandler, FetchHandlerOptions } from '@atproto/xrpc'
import { schemas } from './lexicons'
import { CID } from 'multiformats/cid'
import * as AppGstandUnstableStoreItem from './types/app/gstand/unstable/store/item'
import * as AppGstandUnstableStorePayment from './types/app/gstand/unstable/store/payment'

export * as AppGstandUnstableStoreItem from './types/app/gstand/unstable/store/item'
export * as AppGstandUnstableStorePayment from './types/app/gstand/unstable/store/payment'

export class AtpBaseClient extends XrpcClient {
  app: AppNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.app = new AppNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class AppNS {
  _client: XrpcClient
  gstand: AppGstandNS

  constructor(client: XrpcClient) {
    this._client = client
    this.gstand = new AppGstandNS(client)
  }
}

export class AppGstandNS {
  _client: XrpcClient
  unstable: AppGstandUnstableNS

  constructor(client: XrpcClient) {
    this._client = client
    this.unstable = new AppGstandUnstableNS(client)
  }
}

export class AppGstandUnstableNS {
  _client: XrpcClient
  store: AppGstandUnstableStoreNS

  constructor(client: XrpcClient) {
    this._client = client
    this.store = new AppGstandUnstableStoreNS(client)
  }
}

export class AppGstandUnstableStoreNS {
  _client: XrpcClient
  item: ItemRecord
  payment: PaymentRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.item = new ItemRecord(client)
    this.payment = new PaymentRecord(client)
  }
}

export class ItemRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppGstandUnstableStoreItem.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.gstand.unstable.store.item',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppGstandUnstableStoreItem.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.gstand.unstable.store.item',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: AppGstandUnstableStoreItem.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.gstand.unstable.store.item'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.gstand.unstable.store.item', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.gstand.unstable.store.item', ...params },
      { headers },
    )
  }
}

export class PaymentRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppGstandUnstableStorePayment.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.gstand.unstable.store.payment',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppGstandUnstableStorePayment.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.gstand.unstable.store.payment',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: AppGstandUnstableStorePayment.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.gstand.unstable.store.payment'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.gstand.unstable.store.payment', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.gstand.unstable.store.payment', ...params },
      { headers },
    )
  }
}
