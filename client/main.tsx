import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";
import { hc } from 'hono/client';
import type { AppType } from "#/index";

const client = hc<AppType>("/");

const Login = ({profile}: {profile: object}) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <pre>{JSON.stringify(profile)}</pre>
      <button type="button" onClick={() => setCount(count + 1)}>
        Value: {count}
      </button>
      <form action="/login" method="post">
        <label for="bskyid">
          BlueSky ID: <input type="text" name="bskyid" />
        </label>
        <input type="submit" value="Log In" />
      </form>
    </div>
  );
}

const App = () => {
  const [profile, setProfile] = useState<object>({});
  useEffect(() => {
    (async () => {
      let profile = await client.api.profile.$get();
      if (profile.ok) return await profile.json();
      else return {}
    })().then(setProfile);

  })
  return <Login profile={profile} />;
}

const root = document.getElementById("root") as HTMLElement;
render(<App />, root);
