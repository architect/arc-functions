let test = require('tape')
let { join } = require('path')

let filePath = join(process.cwd(), 'src', 'http', 'proxy', 'format', 'templatize')
let sut = require(filePath)

let buf = b => Buffer.from(b)

test('Module is present', t => {
  t.plan(1)
  t.ok(sut, 'Templatizer module is present')
})

test('Templatizer ignores binary responses', t => {
  t.plan(1)
  let content = 'here is an asset: ${STATIC(\'this-is-fine.gif\')}'
  let response = { body: buf(content) }
  let result = sut({
    isBinary: true,
    response
  })
  t.equal(content, result.body.toString(), 'Templatizer exited early')
})

test('Templatizer passes through non-fingerprinted assets', t => {
  t.plan(6)
  let response = { body: buf('here is an asset: ${STATIC(\'this-is-fine.gif\')}') }
  let result = sut({ response }).body.toString()
  t.notOk(result.includes('${STATIC(\'this-is-fine.gif\')}'), 'Templatizer stripped out STATIC')
  t.ok(result.includes('this-is-fine.gif'), 'Templatizer left in asset reference')

  response = { body: buf('here is an asset: ${arc.static(\'this-is-fine.gif\')}') }
  result = sut({ response }).body.toString()
  t.notOk(result.includes('${arc.static(\'this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes('this-is-fine.gif'), 'Templatizer left in asset reference')

  response = { body: buf('here is an asset: ${arc.static(\'/this-is-fine.gif\')}') }
  result = sut({ response }).body.toString()
  t.notOk(result.includes('${arc.static(\'/this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes('/this-is-fine.gif'), 'Templatizer left in asset reference (including leading slash)')
})

test('Templatizer replaces fingerprinted assets', t => {
  t.plan(6)
  let fingerprinted = 'this-is-fine-abc123.gif'
  let assets = {
    'this-is-fine.gif': fingerprinted
  }
  let response = { body: buf('here is an asset: ${STATIC(\'this-is-fine.gif\')}') }
  let result = sut({ response, assets }).body.toString()
  t.notOk(result.includes('${STATIC(\'this-is-fine.gif\')}'), 'Templatizer stripped out STATIC')
  t.ok(result.includes(fingerprinted), 'Templatizer replaced asset reference with fingerprint')

  response = { body: buf('here is an asset: ${arc.static(\'this-is-fine.gif\')}') }
  result = sut({ response, assets }).body.toString()
  t.notOk(result.includes('${arc.static(\'this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes(fingerprinted), 'Templatizer replaced asset reference with fingerprint')

  // Leading slash
  fingerprinted = '/this-is-fine-abc123.gif'
  response = { body: buf('here is an asset: ${arc.static(\'/this-is-fine.gif\')}') }
  result = sut({ response, assets }).body.toString()
  t.notOk(result.includes('${arc.static(\'/this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes(fingerprinted), 'Templatizer replaced asset reference with fingerprint (including leading slash)')
})

test('Templatizer does not replace fingerprinted assets locally', t => {
  t.plan(6)
  let assets = {
    'this-is-fine.gif': 'this-is-fine-abc123.gif'
  }
  let isLocal = true
  let response = { body: buf('here is an asset: ${STATIC(\'this-is-fine.gif\')}') }
  let result = sut({ response, assets, isLocal }).body.toString()
  t.notOk(result.includes('${STATIC(\'this-is-fine.gif\')}'), 'Templatizer stripped out STATIC')
  t.ok(result.includes('this-is-fine.gif'), 'Templatizer replaced asset reference with fingerprint')

  response = { body: buf('here is an asset: ${arc.static(\'this-is-fine.gif\')}') }
  result = sut({ response, assets, isLocal }).body.toString()
  t.notOk(result.includes('${arc.static(\'this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes('this-is-fine.gif'), 'Templatizer replaced asset reference with fingerprint')

  response = { body: buf('here is an asset: ${arc.static(\'/this-is-fine.gif\')}') }
  result = sut({ response, assets, isLocal }).body.toString()
  t.notOk(result.includes('${arc.static(\'/this-is-fine.gif\')}'), 'Templatizer stripped out arc.static')
  t.ok(result.includes('/this-is-fine.gif'), 'Templatizer replaced asset reference with fingerprint (including leading slash)')
})

test('can interpret js template strings as js', t=> {
  t.plan(1)
  let str = "<div>${ 'cat'.toUpperCase() + (1 + 1) }</div>"
  let response = { body: buf(str) }
  let result = sut({ response }).body.toString()
  t.ok(result === '<div>CAT2</div>', 'haha')
})
