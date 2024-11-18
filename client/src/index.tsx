import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";
import { hc } from 'hono/client';
import type { AppType } from "#/index";
import { type ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import * as strings from "./strings";
import type { ImmutableItem, Item } from "#/db";
import { UpdateItem, ItemCard } from "./item";

const client = hc<AppType>("/");

interface CartItem {
  item: Item,
  quantity: number;
  payment: string;
}
export const createItem = (): Item => {
  return {
    uri: "",
    sellerDid: "",
    name: "",
    description: ""
  }
}

const LoginFooter = ({ profile }: {
  profile: ProfileViewDetailed | undefined,
}) => {
  return (
    <footer className="flex w-screen h-20 bg-green-800 text-white text-3xl shadow-2xl items-center">
      <div className="flex container justify-end">
        {
          profile === undefined ?
            <form action="/login" method="post">
              <label for="bskyid">
                BlueSky ID: <input className="py-1 text-black" type="text" name="bskyid" />
              </label>
              <input className="m-2 px-2 py-1 rounded-full bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                type="submit" value={strings.LogIn} />
            </form>
            :
            <div className="flex">
              {strings.Welcome} {profile.displayName}! <img className="h-16" src={profile.avatar} />
            </div>
        }
      </div>
    </footer>
  );
}

const App = () => {
  const [profile, setProfile] = useState<ProfileViewDetailed>();
  useEffect(() => {
    (async () => {
      const pRes = await client.api.profile.$get();
      if (!pRes.ok) return;
      const p: ProfileViewDetailed = await pRes.json();
      setProfile(p);
    })()
  }, [])

  const [basket, setBasket] = useState<Array<CartItem>>([])
  const [items, setItems] = useState<Array<Item>>([])
  useEffect(() => {
    (async () => {
      const iRes = await client.api.items.$get();
      if (!iRes.ok) return;
      const i: Array<Item> = await iRes.json();
      setItems(i);
    })()
  }, [])

  const [newItem, setNewItem] = useState<Item>(createItem());

  return (
    <div className="flex flex-col h-screen">
      <main className="container mb-auto flex-grow">
        <h2 className="text-center">
          {strings.ForYou}
        </h2>
        {items.map((i) => {
          <div key={i.uri}>
            <ItemCard item={i} />
          </div>
        })}
        <UpdateItem item={newItem} setItem={setNewItem}/>
      </main>
      <LoginFooter profile={profile} />
    </div>
  );
}

const root = document.getElementById("root") as HTMLElement;
render(<App />, root);
