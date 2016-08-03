# Mirage

A "lite" Bridge client for faster front-end iterations.

## Usage

### Basic Usage (UI-based)

- Run `./index.js` - make sure you're using Node 5+
- You'll be greeted with the configuration panel the first time you start, and you can press F1 to show it at any time later
- Search for a module by its path, then choose it from the list. Right now this is only really useful for components.
- Choose the profile (see below) to use for rendering the component
- Click on Activate Module and wait until it builds and launches it for you.

### Advanced Usage (file-system based)

The UI approach ends up generating a file refered to as the _context file_ 
which Mirage ends up consuming. You may short-circuit that process and just
write the file directly.

You need to place this file under `runners/index.js` - changes to it will not
be tracked in git.

The structure of this file is as follows:

```javascript
exports.profile = String;
exports.subject = Function;
exports.params = Object?;
```

Where:

**`profile`...**

Is a string mapping to the profile to be used (see [below](#available-profiles)).

**`subject`...**

Is the imported module you want to play with. For example:
    
```javascript
exports.subject = require("jsapp/shared/components/BridgeLogo.js");
```

The webpack compiler run by Mirage resolves stuff from Bridge's root, so your
paths must be based off of that.

**`params`...**

Is stuff you can passed through to the profile for configuring your subject.
For React profiles, this means the props that the component gets rendered with.

Keep in mind that you have full flexibility in this script; it's just like 
you're writing code within Bridge so you may import any modules you want and
perform any necessary context set up.

## Available profiles

You can choose the profile to use for executing the subject from the UI or
by setting the `profile` property in your context file.

### `react`

A basic profile that renders the component module onto the primary node.

Example `runner/index.js` for this profile:

```javascript
exports.profile = 'react';
exports.subject = require("jsapp/shared/components/BridgeLogo");
exports.params = {
  hidden: true
};
```

### `react-router`

A profile that renders the component within a React Router context, suitable
for Route Handler components.

Example `runner/index.js` for this profile:

```javascript
exports.profile = 'react-router';
exports.subject = require('jsapp/screens/AuthorCourses/screens/Show/screens/Summary');
exports.params = {
  path: '/author/courses/:courseId',
};
```

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