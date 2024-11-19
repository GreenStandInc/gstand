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

export const UpdateItem = ({ item, setItem }: {
  item: Item
  setItem: (arg0: Item) => any
}) => {
  const [image, setImage] = useState<File>();
  return (
    <form onSubmit={(x) => {
      x.preventDefault();
      x.stopPropagation();
      const form = {
        name: item.name,
        description: item.description,
        image: image ?? "",
      };
      client.api.addItem.$post({ form });
    }}>
      <label for="name">
        Name: <input onChange={(e) => {
          setItem({ ...item, name: (e.target as HTMLInputElement).value });
        }} type="text" name="name" value={item.name} />
      </label>
      <label for="description">
        Description: <input onChange={(e) => {
          setItem({ ...item, description: (e.target as HTMLInputElement).value });
        }} type="text" name="description" value={item.description} />
      </label>
      <label for="image">
        Images: <input onChange={async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) {
            setImage(files[0]);
          }
        }} type="file" name="images" />
      </label>
      <input type="submit" value="Submit" />
    </form>
  )
}
