# Mirage

A "lite" Bridge client for faster front-end iterations.

## Installation

Clone this repository into some directory beneath get_smart like
`packages/mirage` then run `npm install` and make sure you do a
`grunt test:copyfeatures` sometime.

**YOU NEED NODE v5.0+ FOR THIS**

## Usage

### Basic Usage (UI-based)

- Run `./index.js` - make sure you're using Node 5+
- You'll be greeted with the configuration panel the first time you start, and you can press F1 to show it at any time later
- Search for a module by its path, then choose it from the list. Right now this is only really useful for components.
- Choose the profile (see below) to use for rendering the component
- Click on Activate Module and wait until it builds and launches it for you.

### Advanced Usage (file-system based)

The UI approach ends up generating a file refered to as the _context file_ 
which Mirage ends up consuming. You may also define your own context to gain
finer control.

This file lives at `runner/index.js` and changes to it will not be tracked in 
git, so feel free to modify as you wish.

The structure of this file is as follows:

```javascript
exports.enabled = Boolean;
exports.augment = Boolean;
exports.profile = String;
exports.subject = Function;
exports.params = Object;
```

Where:

**`enabled`...**

Can be turned off if you want the UI context to be used instead of this file.

**`augment`...**

Is a convenience flag which, when enabled, will cause the context you define
in this file to "augment" the one generated through the UI (the former 
overriding the latter.)

This exists because I usually choose the file from the UI instead of copying
it and doing the manual `require` labor, and then I just get to customize the
`params` in the context file. With this setting, that use-case works.

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

Is stuff you can pass through to the profile for configuring your subject.
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

## Stylesheets

Edit `runner/index.scss` and import all the stylesheets your subject requires.
This file, like `runner/index.js` (and really, _everything_ inside that 
directory) will not be tracked in git so you may modify as you need.

Example:

```scss
// @file: mirage/runner/index.scss
@import 'components/course_status';

.my-subject {
  // JSON variables are available too:
  background: $dark-grey;
}
```

## Configuration

You can expose any of these options to your environment or define them in a 
file at `/config.js` (which is not tracked in the git repository.)

#### `BRIDGE_API_TOKEN`: !String

Your API token that Mirage will use to authenticate all requests.

**THIS IS A REQUIRED PARAMETER!**

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