# Mirage

A "lite" Bridge client for faster front-end iterations.

## Usage

## Configuration

You can expose any of these options to your environment or define them in a 
file at `/config.js` (which is not tracked in the git repository.)

#### `BRIDGE_HOST`: String

This must point to the bridge API host so that we can forward all API requests 
to it.

Defaults to: `http://bridgelearning.dev:3000`

#### `BRIDGE_ROOT`: String

Defaults to: an automatically inferred path, assuming Mirage lives in a 
directory under Bridge.

#### `PORT`: Number

Defaults to: 9999

#### `HAPPY`: Boolean

Set to `1` if you want HappyPack to be enabled for (possibly) faster initial
builds.

Defaults to: `false`

#### `WEBPACK_DLLS`: Boolean

Set to `1` if you want Mirage to use Bridge's vendor DLL as well as its own
for faster builds. Highly recommended!

Defaults to: `false`

#### `PROFILE`: Boolean

Set to `1` if you want webpack profiling output.

Defaults to: `false`