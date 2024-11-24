import type { Generated } from 'kysely';

export type Image = {
  id?: number,
  type: string,
  data: Uint8Array,
}

export type Table = {
  id: Generated<number>,
  type: string,
  data: Uint8Array,
};

export const create = ({
  id = undefined,
  type = "",
  data = new Uint8Array()
}: {
  id?: number,
  type?: string,
  data?: Uint8Array
} = {}): Image => {
  return {
    id,
    type,
    data
  };
}
