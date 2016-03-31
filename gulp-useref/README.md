# noconcat issue

https://github.com/jonkemp/gulp-useref/issues/194

a reduced test of gulp-useref

## Version info


```node
node -e 'console.log(process.platform, process.versions)'
```

output:

```javascript
darwin { 
  http_parser: '2.5.2',
  node: '4.4.1',
  v8: '4.5.103.35',
  uv: '1.8.0',
  zlib: '1.2.8',
  ares: '1.10.1-DEV',
  icu: '56.1',
  modules: '46',
  openssl: '1.0.2g' 
  }
```

OS X@10.11.4
npm@2.14.20

## Description

There are two bash files provided, if you like :).

`makecat.sh` install gulp-useref@3.0.8 and other modules, then execute `gulp` task

`makenocat.sh` install gulp-useref@3.0.4 and other modules, then execute `gulp` task

Execute them respectively and check `dist/` dir

