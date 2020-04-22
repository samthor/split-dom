Helper to split DOM nodes at a position within text.
This is not published anywhere.

Create a `SliceIndex` if you'll be doing this a lot, otherwise, you can just use the top-level `slice` method. 

Usage:

```js
import {SliceIndex, slice} from './path/to/split.js';

const dom = `<div>Hello <strong>There</strong></div>`;

// #1: SliceIndex
const index = new SliceIndex(dom);  // accepts node (cloned) or string
index.slice(0, 4);  // `<div>Hell</div>`
index.slice(8);     // `<div><strong>ere</strong></div>`

// #2: slice()
const node = document.createElement('div');
node.innerHTML = dom;
slice(node, 0, 4);  // same as above, but not indexed and without copy
```
