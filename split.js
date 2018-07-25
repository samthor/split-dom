
import {bisectRight} from './bisect.js';

/**
 * SliceIndex indexes into the text of a DOM tree. Construct with node or innerHTML content.
 */
export class SliceIndex {

  /**
   * @param {string|!Node} src
   */
  constructor(src) {
    if (typeof src === 'string') {
      this._node = document.createElement('div');
      this._node.innerHTML = src;
    } else if (src instanceof Node) {
      this._node = src.cloneNode(true);
    } else {
      throw new Error(`unhandled type: ${src}`);
    }

    this._index = [];

    let at = 0;
    const what = NodeFilter.SHOW_TEXT;
    const walker = document.createTreeWalker(this._node, what);
    for (;;) {
      const node = walker.nextNode();
      if (node === null) {
        break;
      }
      this._index.push({at, node});
      at += node.textContent.length;
    }

    this._index.push({at, node: null});
  }

  /**
   * @param {number=} beginIndex
   * @param {number=} endIndex
   * @return {!DocumentFragment}
   */
  slice(beginIndex=0, endIndex=Infinity) {
    const hintIndex = bisectRight(this._index, beginIndex) - 1;
    return internalSlice(this._node, beginIndex, endIndex, this._index[hintIndex] || null);
  }
}

/**
 * @param {!Node} node
 * @param {number=} beginIndex
 * @param {number=} endIndex
 * @return {!DocumentFragment}
 */
export function slice(node, beginIndex=0, endIndex=Infinity) {
  return internalSlice(node, beginIndex, endIndex);
}

/**
 * @param {!Node} node
 * @param {number} beginIndex to start slice at
 * @param {number} endIndex to end slice at
 * @param {?{node: !Node, at: number}=} hint
 * @return {!DocumentFragment}
 */
function internalSlice(node, beginIndex, endIndex, hint=null) {
  const what = NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT;
  const walker = document.createTreeWalker(node, what);
  const frag = document.createDocumentFragment();
  let curr = frag;  // head of output nodes
  const currentStack = [];  // stack of source nodes

  let at = 0;

  if (hint === null) {
    currentStack.push(node);
  } else {
    if (hint.node === null) {
      return frag;  // nothing to do
    } else if (!node.contains(hint.node)) {
      throw new Error(`hint not contained within source node`);
    } else if (!(hint.node instanceof Text)) {
      throw new Error(`expected hint to be Text, was ${hint.node}`)
    }
    at = hint.at;

    walker.currentNode = hint.node;
    walker.previousNode();

    let helper = hint.node;
    while (helper !== node) {
      helper = helper.parentNode;
      currentStack.unshift(helper);
    }
    for (let i = 1; i < currentStack.length; ++i) {
      const anew = currentStack[i].cloneNode(false);
      curr.appendChild(anew);
      curr = anew;
    }
  }

  while (at < endIndex) {
    const source = walker.nextNode();
    if (source === null) {
      break;
    }

    // first, always check if we've been popped off the stack
    const indexOfParent = currentStack.lastIndexOf(source.parentNode);
    if (indexOfParent === -1) {
      throw new Error(`couldn't find parent of text node`);
    }
    while (indexOfParent + 1 < currentStack.length) {
      curr = curr.parentNode;
      currentStack.pop();
    }

    // text will only be a descendant of whatever we've popped to
    if (source instanceof Text) {
      // append to current location iff we need to
      const t = source.textContent;
      const len = t.length;

      const from = Math.max(0, beginIndex - at);
      const to = Math.max(0, endIndex - at);
      const content = t.slice(from, to);
      if (content.length) {
        curr.appendChild(document.createTextNode(content));
      }

      at += len;
      continue;
    }

    if (!(source instanceof Element)) {
      throw new Error(`unexpected source type: ${source}`)
    }
    const node = source.cloneNode(false);  // do NOT make a deep copy
    curr.appendChild(node);
    curr = node;
    currentStack.push(source);
  }

  return frag;
}