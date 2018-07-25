Usage:

```js

import {SliceIndex, slice} from './path/to/split.js';


// #1: SliceIndex

const dom = `<div>Hello <strong>There</strong></div>`;
const index = new SliceIndex(dom);  // accepts node (cloned) or string

index.slice(0, 4);
// `<div>Hell</div>`

index.slice(8);
// `<div><strong>ere</strong></div>`


// #2: slice()

const node = document.createElement('div');
node.innerHTML = dom;
slice(node, 0, 4);  // same as above, but not indexed and without copy

```
