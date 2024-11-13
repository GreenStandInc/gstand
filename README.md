# gstand

To install dependencies:

```bash
npm install
```

You have to build the client BEFORE you can test the server.

To test the client (without a server), run:

```bash
npm run ui:dev
```

To build the client, run:

```bash
npm run ui:build
```

Once the UI is build:

To run:

```bash
npm run dev
```
To compile (without running):

```bash
npm run build
```

To run (compiled js file):

```bash
npm run start
```

The dockerfile composes all of this into a single deployable image. 

```
docker build .
```