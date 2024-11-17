import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";
import { hc } from 'hono/client';
import type { AppType } from "#/index";
import { type ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import type { AppGstandStoreItem } from "./lexicon";

const client = hc<AppType>("/");

interface CartItem {
  item: AppGstandStoreItem.Record;
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
                type="submit" value="Log In" />
            </form>
            :
            <div className="flex">
              Welcome {profile.displayName}! <img className="h-16" src={profile.avatar} />
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
  return (
    <div className="flex flex-col h-screen">
      <main className="mb-auto flex-grow">
        <h1 class="text-3xl font-bold underline">
          Hello world!
        </h1>
        {profile?.displayName}
        <p />
        Lorem ipsum odor amet, consectetuer adipiscing elit. Aliquet amet per turpis placerat maximus quam. Faucibus dolor nisl volutpat erat mattis habitant. Urna habitant congue ac aenean imperdiet consequat quisque. Viverra dapibus quis; egestas lacinia posuere vulputate. Varius tempus integer habitant vehicula lobortis quis; ligula molestie bibendum. Varius viverra varius posuere proin lacinia; accumsan curae mauris adipiscing. Eros inceptos fermentum ex integer fames purus.
        <p />
        Posuere leo nisi rutrum donec cursus fermentum etiam ultrices. Blandit enim fermentum ullamcorper, elementum placerat vestibulum odio habitasse. Erat urna tempor leo nec lorem iaculis. Curabitur montes vitae vulputate ex porttitor fames. Senectus lacinia fames; mauris semper cubilia suscipit. In commodo rutrum aenean arcu dignissim habitasse cubilia finibus. Inceptos at mattis consequat malesuada finibus ut torquent morbi ac. Lacus dis in congue euismod posuere interdum; tempor porttitor adipiscing?
        <p />
        Sem sed senectus integer semper mollis nulla orci phasellus felis. At fermentum nullam non aliquet vitae. Natoque semper posuere per euismod dictum sed dapibus curabitur mattis? Lobortis nam morbi aptent viverra duis elit nibh eleifend sit. Sollicitudin nullam posuere montes orci dictumst interdum. Auctor quisque facilisis ut facilisis fames magna luctus purus hac. Nam ridiculus posuere ullamcorper, dui urna dui scelerisque tristique.
        <p />
        Metus porttitor dui nec fames penatibus quisque urna! Scelerisque varius porttitor vitae habitant orci erat adipiscing. Fusce semper ligula adipiscing egestas eu arcu erat. Ultrices velit iaculis duis donec nisl fames. Tristique magnis congue arcu class fringilla magnis dui quisque maximus. Felis tortor lorem class placerat id sapien magna nunc. Fermentum libero habitasse cras amet, morbi leo in porta? Massa ex faucibus natoque ante ex massa elementum in.
        <p />
        Sodales convallis rutrum potenti aenean, mi himenaeos. Dapibus ligula viverra; feugiat ex ipsum scelerisque nulla consectetur lacinia. Pellentesque id ridiculus taciti nascetur faucibus mollis vulputate dis. Leo mi massa; nisi nullam maecenas fames praesent non. Dui pulvinar posuere duis litora cras. Donec habitant habitant id; consequat molestie mauris. Diam natoque aptent malesuada nisl aliquam bibendum mattis gravida ipsum. Vehicula sodales dictum accumsan pellentesque metus turpis litora at nam.
      </main>
      <LoginFooter profile={profile} />
    </div>
  );
}

const root = document.getElementById("root") as HTMLElement;
render(<App />, root);
