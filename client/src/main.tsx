import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";
import { hc } from 'hono/client';
import type { AppType } from "#/index";
import * as Profile from "./lexicon/types/app/bsky/actor/profile";

const client = hc<AppType>("/");

const LoginFooter = ({ profile }: { profile: Profile.Record }) => {
  return (
    <footer className="flex w-screen h-20 bg-green-800 text-white text-3xl shadow-2xl justify-end items-center">
      {
        Profile.isRecord(profile)
          ? <div>
            Welcome {profile.displayName}!
          </div>
          : <form action="/login" method="post">
            <label for="bskyid">
              BlueSky ID: <input className="text-black" type="text" name="bskyid" />
            </label>
            <input type="submit" value="Log In" />
          </form>
      }
    </footer>
  );
}

const App = () => {
  const [profile, setProfile] = useState<Profile.Record>({});
  useEffect(() => {
    (async () => {
      let p = await client.api.profile.$get();
      if (p.ok) return await p.json();
      else return {}
    })().then(setProfile);
  }, [])
  return (
    <div>
      <main>
        <h1 class="text-3xl font-bold underline">
          Hello world!
        </h1>
        {profile.displayName}
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
