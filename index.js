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

let memoizedEl = null
let mounted = false
function memoizedSubView (state, prev, send) {
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
    mounted = true
    return memoizedEl
  } else if (!mounted) {
    mounted = true
    return memoizedEl
  } else {
    const placeholder = html`<template></template>`
    placeholder.isSameNode = (el) => el.isSameNode(memoizedEl)
    return placeholder
  }
}

app.router(['/', view])

const tree = app.start()
document.body.appendChild(tree)
