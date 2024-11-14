import { useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

const Login = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount(count+1)}>
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
  return <Login />;
}

const root = document.getElementById("root") as HTMLElement;
render(<App />, root);
