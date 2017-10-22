/*const ITEMS = 'hello there people'.split(' ');

// a "partial" that does a filtered loop - no template BS, just functional programming:
function foo(items) {
    // imagine templates that adhere to your JS styleguide...
    return items.map( p => <li> {p} </li> );        // <-- can be multiline
}

// a simple JSX "view" with a call out ("partial") to generate a list from an Array:
let vdom = (
    <div id="foo">
        <p>Look, a simple JSX DOM renderer!</p>
        <ul>{ foo(ITEMS) }</ul>
    </div>
);

// render() converts our "virtual DOM" (see below) to a real DOM tree:
let dom = render(vdom);

// append the new nodes somewhere:
document.body.appendChild(dom);

// Remember that "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties.
let json = JSON.stringify(vdom, null, '  ');

// The whole process (JSX -> VDOM -> DOM) in one step:
document.body.appendChild(
    render( <pre>{ json }</pre> )
);


*/

"use strict";

/*
 * pView.core.js
 * @CreatedOn: 20-Sep-2017
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @Description:This will create a View Engin Aka - pView, for render JSX virtual DOM to a real DOM. 
 * "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties. nodeName, Attributes, children
 * The whole process (JSX -> VDOM -> DOM) in one step
 */

/** Render Virtual DOM to the real DOM */
function render(vnode) {
  var svgNS = "http://www.w3.org/2000/svg";
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }
  let node = document.createElementNS(svgNS, vnode.nodeName);
  Object.keys(vnode.attributes || {}).forEach(key => {
    let attrVal = key === 'style' ? parseStyleProps(vnode.attributes[key]) : vnode.attributes[key];
    node.setAttribute(key, attrVal);
  });
  (vnode.children || []).forEach(c => node.appendChild(render(c)));
  return node;
}

/** hyperscript generator, gets called by transpiled JSX */
function h(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null;
  return {
    nodeName,
    attributes,
    children
  };
}

/** convert style JSON into string, gets called by transpiled JSX */
function parseStyleProps(objStyle) {
  if (typeof objStyle === "string") {
    return objStyle;
  }
  let sArr = [];
  Object.keys(objStyle).forEach(key => {
    sArr.push(`${key.replace(/([A-Z]+)/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key]}`);
  });
  return sArr.join(';');
}

export { render, h }; 