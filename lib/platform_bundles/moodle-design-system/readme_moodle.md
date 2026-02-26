# This is a description for MDS (moodle-design-system) bundle files.

In order to use MDS components, we need to install the package and build both both `index.css` and `index.js` files.

First, install the MDS package with the following command:
```
npm i @moodlehq/design-system
```

Then, we rebuild into core by running:
```
grunt react
```

Last is to update `public/lib/thirdpartylibs.xml`