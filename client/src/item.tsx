import { useEffect, useState } from "hono/jsx";
import type { Item } from "#/db.ts";

export const ItemCard = ({ item }: { item: Item }) => {
  return (
    <section>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
    </section>
  )
}
