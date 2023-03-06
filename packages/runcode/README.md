<h1 align="center">vitepress-plugin-runcode</h1>

<p align="center">
  A vitepress plugin that run js code in markdown.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vitepress-plugin-runcode">
    <img src="https://img.shields.io/npm/v/vitepress-plugin-runcode?color=orange&label=" alt="version" />
  </a>
</p>

## Install  

```sh
npm install vitepress-plugin-runcode
```

## Usage

In `.vitepress/theme/index.ts`  

```ts
import RunCode from 'vitepress-plugin-runcode'
// css
import 'vitepress-plugin-runcode/styles.css'

export default {
  enhanceApp({ app }) {
    app.use(RunCode)
  }
}
```

In your markdown  

````md
<RunCode>

```js
const num1 = 8;
const num2 = 10;

console.log(num1 + num2)
```

</RunCode>
````
