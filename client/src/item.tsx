import { useEffect, useState } from "hono/jsx";
import type { Item } from "#/db.ts";
import { client } from "./api";

export const ItemCard = ({ item }: { item: Item }) => {
  return (
    <section>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
    </section>
  )
}

export const UpdateItem = ({item, setItem}: {
  item: Item
  setItem: (arg0: Item) => any
}) => {
  return (
    <form onSubmit={(x) => {
      x.preventDefault();
      x.stopPropagation();
      client.api.addItem.$post({form: item});
    }}>
      <label for="name">
        Name: <input onChange={(e) => {
          setItem({...item, name: (e.target as HTMLInputElement).value});
        }} type="text" name="name" value={item.name} />
      </label>
      <label for="description">
        Description: <input onChange={(e) => {
          setItem({...item, description: (e.target as HTMLInputElement).value});
        }} type="text" name="description" value={item.description}/>
      </label>
      <input type="submit" value="Submit" />
    </form>
  )
}
