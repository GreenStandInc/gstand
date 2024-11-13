import { useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

function Login() {
  const [count, setCount] = useState(0);
  return (
    <form action="/login" method="post">
      <label for="bskyid">
        BlueSky ID: <input type="text" name="bskyid" />
      </label>
      <input type="submit" value="Log In" />
    </form>
  );
}

function App() {
  return <Login />;
}

const root = document.getElementById("root") as HTMLElement;
render(<App />, root);
