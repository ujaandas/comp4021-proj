# T3Dtris

- readme is a WIP!
- i've ported the server from just raw html/cs/js to use ts since i have a lot of oop stuff and wanted to use ts
- as a result, i've also included somewhat more "involved" build procceses to compile js->ts

for dev purposes:

1. run `npm i` like normal to install dependencies from lockfile
2. run `npm run dev` to start the dev server

> note: `npm run dev` is just `npm run build && npm run compile & npm run start`
>
> - this will first build the server once
> - then, using node 19's --watch tag, compile the ts files, and start the server LIVE, so any changes you make to the server.ts or its dependency graph will be reflected in the server
> - tldr; changes made to \*.js or \*.ts files will cause hot reloads, html/css will not

3. open a browser and go to `localhost:3000` to see the server in action
