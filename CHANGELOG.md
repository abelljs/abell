# Changelog

## v0.2.3
- **BREAKING CHANGE**
  `$contentList` changed to `$contentArray`
- Refactoring of how variables are handled internally
- `$contentObj` and `$slug` variables added
- **BREAKING CHANGE**
  `template/content.abell` changed to `[$slug]/index.abell`

## v0.2.2
- **BREAKING CHANGE** 
  Syntax for importing content changed.

```js
{{ import_content '{{meta.$slug}}/index.md' }}
```
⬇️

```js
{{ $importContent(meta.$slug + '/index.md') }}
```

- Update to [abell-renderer v0.1.4](https://github.com/abelljs/abell-renderer/releases/tag/v0.1.4)


## v0.2.1
- **BREAKING CHANGE** 
  Default folder to read content template changed from `[content]/index.abell` to `template/content.abell`.
- Build time reduced. (Pre-calculating directories and contentList before execution)
- More accurate Build times. 
- Error handling on Build Failures.
- Documentation design updates.

## v0.2.0
Migration to [abell-renderer](https://github.com/abelljs/abell-renderer) v0.1.0 

...Detailed ChangeLog at [abell-renderer v0.1.x Changelog](https://github.com/abelljs/abell-renderer/blob/master/CHANGELOG.md#v010)

## v0.1.15

Added build time to logs

## v0.1.14
- Documentations Fixes [#6](https://github.com/abelljs/abell/pull/6) (Thank you [@0xflotus](https://github.com/0xflotus))
- Fixed [#5](https://github.com/abelljs/abell/issues/5) (dev-server content going blank issue 🎉💃)

## v0.1.13
Directory listing fix for node v8 ([#3](https://github.com/abelljs/abell/pull/3) by [@Pika1998](https://github.com/Pika1998))

## v0.1.12
- A little more stable API (still not final though)
- Migration from Mustache to Abell Renderer
- Ability to write JS in HTML inside `{{`, `}}` tags 

## < v0.1.11
- Experimented stuff..