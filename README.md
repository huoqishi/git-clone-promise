# git-clone-promise

clone a git repository via shell command , promise

## Installation

```
$ npm install git-clone-promise
```

or:

```
$ yarn add git-clone-promise
```

## Usage

```js
const clone = require('git-clone-promise')
// const repo = 'https://github.com/huoqishi/x-html.git'
// or:
const repo = 'git@github.com:huoqishi/x-html.git'
gitClone(repo, './test').then(() => {
   console.log('ok')
})
```

## API

### clone

`clone(repo, savePath, [options])`

clone `repo` to `savePath`, return `promise` on completion.

### options

- `git`:  path to `git` binary; default: `git` (optional).
- `shallow`:  when `true`, clone with depth 1 (optional).
- `checkout`:  revision/branch/tag to check out (optional).

## Copyright & License

© huoqishi & 火骑士空空

Released under the [MIT](https://choosealicense.com/licenses/isc/).