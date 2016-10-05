const html = require('choo/html')
const choo = require('choo')
const app = choo()

app.model({
  state: {
    count: 0,
    toggled: true
  },
  reducers: {
    update: (data, state) => ({ count: state.count + 1 }),
    toggle: (data, state) => ({ toggled: !state.toggled })
  }
})

const view = (state, prev, send) => {
  return (state.toggled)
  ? html`
    <div>
      <h1>count: ${state.count}</h1>
      <button onclick=${() => send('update')}>Update state</button>
      <button onclick=${() => send('toggle')}>Toggle memo</button>
      ${subView(state, prev, send)}
      ${memoizedSubView(state, prev, send)}
    </div>`
  : html`
    <div>
      <h1>count: ${state.count}</h1>
      <button onclick=${() => send('update', 'world')}>Update state</button>
      <button onclick=${() => send('toggle')}>Toggle memo</button>
      ${subView(state, prev, send)}
    </div>`
}

function subView (state, prev, send) {
  return html`
    <div onload=${(el) => console.log('subView loaded')}>
      subView
    </div>
  `
}

// let's create some empty vars we can reference later
let memoizedEl = null
let mounted = false
function memoizedSubView (state, prev, send) {
  // the first run we got no memoized el yet. Cool, let's create one
  if (!memoizedEl) {
    memoizedEl = html`
      <div
        onunload=${(el) => {
          console.log('memoizedSubView unloaded')
          mounted = false
        }}
        onload=${(el) => console.log('memoizedSubView loaded')}>
        memoizedSubView
      </div>
    `

    // we're going to be returning this el so it'll also be mounted. Let's mark
    // it as such
    mounted = true
    return memoizedEl
  } else if (!mounted) {
    // if our node for some reason was unmounted, onunload sets it as
    // "unmounted". In that case we just return our unmounted node, and the
    // "onload" action will be triggered again
    mounted = true
    return memoizedEl
  } else {
    // welp, if our node is mounted, and exists, we return the proxy node. It
    // means we can make it pretend like it's the already mounted node so we
    // can tell the diffing algorithm to ignore it and not do anything. If we
    // didn't pass this, or passed the actual mounted nodes the "onload" and
    // "onunload" properties would be fired on every render and that's super
    // bad. But yay, we can use this so we do that :D
    const placeholder = html`<template></template>`
    placeholder.isSameNode = (el) => el.isSameNode(memoizedEl)
    return placeholder
  }
}

app.router(['/', view])

const tree = app.start()
document.body.appendChild(tree)
