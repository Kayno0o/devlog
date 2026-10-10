This directory is a fresh {framework} project, made by {framework}'s own starter. Build the website that `SPEC.md` describes in it, with {framework}.

- {framework}'s documentation is in `docs/`.
- Use `bun` for every command. You may add npm packages with `bun add`; use no other network access.
- Work only inside this directory.
- The site is done when `bun run check` and `bun run build` both pass, and `bun run start` serves the built site on the port given in the `PORT` environment variable. It is started with `PORT`, `HOST` (`127.0.0.1`), `ORIGIN` (the site's own URL, such as `http://localhost:4701`) and `NODE_ENV=production` set, and reached over plain http.
- Stop every server you start before you finish.

Work on your own until the site is done: nobody will answer questions.
