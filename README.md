[![master](https://github.com/skonves/generator-ts-console/workflows/build/badge.svg?branch=master&event=push)](https://github.com/skonves/generator-ts-console/actions?query=workflow%3Abuild+branch%3Amaster+event%3Apush)

# Typescript Console App Generator

Quickly generate projects using

- Typescript
- Prettier for formatting
- ESLint for linting
- Jest for unit testing

## Quick Start

1. Globally install Yeoman and this generator: `npm install -g yo generator-ts-console`
1. From the root of your new project, run `yo ts-console` and select "Set it up for me"

Note that the README in the newly-minted project will provide instructions for building, testing, running, etc.

Without selecting advanced options you'll get:

- The latest stable version of Typescript
- ESLint as the linter
- Jest as the test library
- CI in the form of a GitHub workflow file

## Advanced options

Selecting "Advanced options" provides more fine-grain control over project configuration. Alternatively, you can
pass options via CLI arguments. Arguments passed via the CLI will override the "Basic" options. This allows you
to use a specific value but for all other options fall back to the basic configuration.

For example, running `yo ts-console --mode=basic --typescript=beta` will install the `beta` version of Typescript
but fall back to the default options for everything else. (Note that you will not be prompted for anything passed
as an argument.)

### Basic or Advanced Mode

Choose between default or user-controlled options. If "Set it up for me" is chosen, then default values will be used, except as overridden by the other options below.

Or from the CLI: `yo ts-console --mode=basic` (options: `basic` or `advanced`)

### Typescript

Choose between any of the current distribution tags (eg. `latest`, `beta`, `rc`, etc).

Or from the CLI: `yo ts-console --typescript=beta` (options: any valid dist-tag)

### Linter

Choose between ESLint and TSLint. (Note that TSLint has technically been deprecated.)

Or from the CLI: `yo ts-console --linter=eslint` (options: `eslint` or `tslint`)

### Testing

Choose between Jest and Mocha/Chai.

Or from the CLI: `yo ts-console --testing=jest` (options: `jest` or `mocha`)

### Continuous Integration

Choose between GitHub Actions, Travis CI, or nothing.

Or from the CLI: `yo ts-console --ci=github` (options: `github`, `travis`, or `none`)

### License

Choose any license supported by [generator-license](https://www.npmjs.com/package/generator-license#supported-licenses).

## Composition

This generator can be composed with other Yeoman generators:

```js
this.composeWith(require.resolve('generator-ts-console/generators/app'), {
  mode: 'basic', // (optional) `basic` or `advanced`
  typescript: 'latest', // (optional) any valid dist-tag
  linter: 'eslint', // (optional) `eslint` or `tslint`
  testing: 'jest', // (optional) `jest` or `mocha`
  ci: 'github', // (optional) `github`, `travis`, or `none`
  // (optional)
  license: {
    name: 'John Doe', // (optional) Owner's name
    email: 'john.doe@example.com', // (optional) Owner's email
    website: 'https://example.com', // (optional) Owner's website
    year: '1945', // (optional) License year (defaults to current year)
    licensePrompt: 'Which license do you want to use?', // (optional) customize license prompt text
    defaultLicense: 'MIT', // (optional) Select a default license
    license: 'MIT', // (optional) Select a license, so no license prompt will happen, in case you want to handle it outside of this generator
  },
});
```
