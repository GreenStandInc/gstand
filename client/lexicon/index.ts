/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, FetchHandler, FetchHandlerOptions } from '@atproto/xrpc'
import { schemas } from './lexicons'
import { CID } from 'multiformats/cid'
import * as AppGstandStoreItem from './types/app/gstand/store/item'
import * as AppGstandStorePayment from './types/app/gstand/store/payment'
import * as AppGstandStoreShop from './types/app/gstand/store/shop'
import * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef'

export * as AppGstandStoreItem from './types/app/gstand/store/item'
export * as AppGstandStorePayment from './types/app/gstand/store/payment'
export * as AppGstandStoreShop from './types/app/gstand/store/shop'
export * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef'

export class AtpBaseClient extends XrpcClient {
  app: AppNS
  com: ComNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.app = new AppNS(this)
    this.com = new ComNS(this)
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
  store: AppGstandStoreNS

  constructor(client: XrpcClient) {
    this._client = client
    this.store = new AppGstandStoreNS(client)
  }
}

export class AppGstandStoreNS {
  _client: XrpcClient
  item: ItemRecord
  shop: ShopRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.item = new ItemRecord(client)
    this.shop = new ShopRecord(client)
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
    records: { uri: string; value: AppGstandStoreItem.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.gstand.store.item',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppGstandStoreItem.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.gstand.store.item',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: AppGstandStoreItem.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.gstand.store.item'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.gstand.store.item', ...params, record },
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
      { collection: 'app.gstand.store.item', ...params },
      { headers },
    )
  }
}

export class ShopRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppGstandStoreShop.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.gstand.store.shop',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppGstandStoreShop.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.gstand.store.shop',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: AppGstandStoreShop.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.gstand.store.shop'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.gstand.store.shop', ...params, record },
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
      { collection: 'app.gstand.store.shop', ...params },
      { headers },
    )
  }
}

export class ComNS {
  _client: XrpcClient
  atproto: ComAtprotoNS

  constructor(client: XrpcClient) {
    this._client = client
    this.atproto = new ComAtprotoNS(client)
  }
}

export class ComAtprotoNS {
  _client: XrpcClient
  repo: ComAtprotoRepoNS

  constructor(client: XrpcClient) {
    this._client = client
    this.repo = new ComAtprotoRepoNS(client)
  }
}

export class ComAtprotoRepoNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }
}
