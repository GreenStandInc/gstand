import type { Generated } from 'kysely';

export type Image = {
  type: string,
  data: Uint8Array,
}

export type Table = {
  id: Generated<number>,
  type: string,
  data: Uint8Array,
};

export const create = ({
  type = "",
  data = new Uint8Array()
}: {
  type?: string,
  data?: Uint8Array
} = {}): Image => {
  return {
    type,
    data
  };
}
