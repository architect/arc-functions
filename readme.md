[<img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500>](https://www.npmjs.com/package/@architect/functions)

## [`@architect/functions`](https://www.npmjs.com/package/@architect/functions)

> Runtime helper library for serverless apps built with [Architect][npm]

[![GitHub CI status](https://github.com/architect/functions/workflows/Node%20CI/badge.svg)](https://github.com/architect/functions/actions?query=workflow%3A%22Node+CI%22)
<!-- [![codecov](https://codecov.io/gh/architect/functions/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/functions) -->

Check out the full docs: [arc.codes](https://arc.codes)


# API

Given:
```
let arc = require('@architect/functions')
```

The following APIs exists:


## `arc.events.subscribe(fn)`

Used to define a lambda function that will act as an [event][events] handler. Event handlers are defined in your application's Architect project manifest file under the [`@events`][events] pragma. The function code for the accompanying handler to each event should use `arc.events.subscribe` to wrap the handler. For example, given the following project manifest snippet:

```
@events
concerts
```

... the following file will be initialized representing the event handler for the `concerts` event, wherein you need to use `arc.events.subscribe`:

```
// file: src/events/concerts/index.js
let arc = require('@architect/functions')
module.exports = arc.events.subscribe(function(payload, callback) {
  console.log(payload)
  callback()
})
```


## `arc.events.publish(params, callback)`

Publishes `params.payload` to the SNS Topic (event) with name `params.name`. The `params.name` parameter should match the event defined under `@events`. Building on the example we described above, to trigger the `concerts` event handler, we would set `params.name` to be `concerts`.

This allows you to publish events from any function within your application (`@app` `.arc` file namespace) to be handled by the event handler.

When running in local/testing mode, will publish the event to the [sandbox][sandbox].


## `arc.queues.subscribe(params, callback)`

Used to define a lambda function that will act as a [queue][queues] handler. Queue handlers are defined in your application's `.arc` file under the [`@queues`][queues] pragma. The function code for the accompanying handler to each queued item should use `arc.queues.subscribe` to wrap the handler. For example, given the following `.arc` file snippet:

```
@queues
concert-tickets
```

... the following file will be initialized representing the event handler for the `concert-tickets` queue, wherein you need to use `arc.queues.subscribe`:

```
// file: src/queues/concert-tickets/index.js
let arc = require('@architect/functions')
module.exports = arc.queues.subscribe(function(payload, callback) {
  console.log(payload)
  callback()
})
```


## `arc.queues.publish(params, callback)`

Publishes `params.payload` to the SQS Queue (queue) with name `params.name`. The `params.name` parameter should match the queue defined under `@queues`. Building on the example we described above, to trigger the `concert-tickets` queue handler, we would set `params.name` to be `concert-tickets`.

This allows you to publish to queues from any function within your application (`@app` `.arc` file namespace) to be handled by the queue handler.

When running in local/testing mode, will publish the event to the [sandbox][sandbox].


## `arc.static(assetPath, options)`

Returns the fully-qualified URI of a static asset for the project-relative `assetPath` parameter. Takes into account:

- What environment (testing, staging, production) we are running in.
- Whether [fingerprinting][static] is enabled.
- Whether the override environment variable `ARC_STATIC_BUCKET` is present.

`options` is an object with the following currently-supported properties:

- `stagePath`: boolean, prepends `/staging` or `/production` to the asset path; useful if the current app is being run on an naked (non-domain-mapped) API Gateway

- `fullManifest`: boolean, returns an object with the full manifest of static assets instead of a single asset. `arc.static('',{fullManifest:true})` returns `{path:<path>,assets:[<asset1>,<asset2>]}`


## `arc.tables(callback)`

Returns an object that can be used to access data in database tables as defined under `@tables` in your `.arc` file. For example, given the following `.arc` file snippet:

```
@tables
accounts
  accountID *String

messages
  msgID *String
```

Running the following code:

```
let data = await arc.tables()
```

Would yield the following objects:

- `data.accounts`: reference to the `accounts` table
- `data.messages`: reference to the `messages` table

.. which contain the following methods:

- `delete(key, callback)`: deletes the record from the table with key `key` and invokes `callback` with the result
- `get(key, callback)`: retrieves the record from the table with key `key` and invokes `callback` when complete
- `put(item, callback)`: adds `item` to the table and invokes `callback` with the item when complete
- `query(params, callback)`: queries the table using `params` and invokes `callback` with the result
- `scan(params, callback)`: scans the table using `params` and invokes `callback` with the result
- `update(params, callback)`: updates an item in the table using `params` and invokes `callback` when complete


## `arc.ws.send({ id, payload })`

Sends the object present on `payload` to the connection ID on `id`. Payload is passed to `JSON.stringify()` on your behalf. Uses [`postToConnection`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApiGatewayManagementApi.html#postToConnection-property) from the `ApiGatewayManagementApi`. Returns a promise with no data on success.

[npm]: https://www.npmjs.com/package/@architect/functions
[sandbox]: https://www.npmjs.com/package/@architect/sandbox
[events]: https://arc.codes/reference/events
[queues]: https://arc.codes/reference/queues
[static]: https://arc.codes/guides/static-assets
