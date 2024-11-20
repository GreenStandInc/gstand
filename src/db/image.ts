import type { Generated } from 'kysely';

export type Table = {
  id: Generated<number>,
  type: string,
  data: Uint8Array,
};
export type Image = {
  type: string,
  data: Uint8Array,
}
