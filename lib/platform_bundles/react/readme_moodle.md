# This is a description for downloading Rect bundle files.

In order to have react codes running in Moodle, we need the following React libraries and where to download them:

- react.js : https://esm.sh/react@19.1.1/es2022/react.bundle.mjs
- react-dom-client.js : https://esm.sh/react-dom@19.1.1/es2022/client.bundle.mjs
- jsx-runtime.js : https://esm.sh/react@19.1.1/es2022/jsx-runtime.bundle.mjs
- jsx-dev-runtime.js : https://esm.sh/react@19.1.1/es2022/jsx-dev-runtime.bundle.mjs

## Download script

To make the download process easier, there is a download script called `download-react-bundle-mjs`.

To upgrade or download a different React bundle version, please change the version number of the following dependencies in package.json:
```
"dependencies": {
  "react": "x.x.x",
  "react-dom": "x.x.x"
}
```

Then, run the following command:
```
node lib/platform_bundles/react/download-react-bundle.mjs
```

Last is to update `thirdpartylibs.xml`
