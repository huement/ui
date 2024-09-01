<p align="center">
  <img src="logo.png?ver=2" width="400" />
</p>

| ![Version Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fjohnny13%2Fmojo%2Fraw%2Fmain%2Fpackage.json&query=%24.version&style=flat-square&label=VERSION&labelColor=%23505050&color=%238A2BE2) | ![Build Date Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fjohnny13%2Fmojo%2Fraw%2Fmain%2Fpackage.json&query=%24.buildDate&style=flat-square&label=BUILT&labelColor=%23505050&color=%238A2BE2) | ![Build Size Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fjohnny13%2Fmojo%2Fraw%2Fmain%2Fpackage.json&query=%24.buildSize&style=flat-square&label=SIZE&labelColor=%23505050&color=%238A2BE2) | ![Code Name Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fjohnny13%2Fmojo%2Fraw%2Fmain%2Fpackage.json&query=%24.codeName&style=flat-square&label=NAME&labelColor=%23505050&color=%238A2BE2) |

<div style="width: 100%;clear:both;display:block;position:relative">
  <p align="center">
    <strong>@huement/ui</strong> [hui] is content focused, minimal front-end framework, with an emphasis on creating a 'visually pleasing' layout & typographic system.
  </p>
</div>
<br />

Based on Bootstrap 5's sass framework, it really shines when used in a text heavy content setting, such as a blog page, where it can greatly improve the overall reading experience.

**@huement/ui** is **not** a full featured theme for bootstrap 5, nor is it suitable for building complex applications with intricate ui's that process data and allow end users to perform actions. Instead, use it on a blog, or a simple landing page, a one off project index.html page etc.

**hui** is easily configured via `$SCSS_Variables` then build with `npm run css` to produce a CSS file _(and optionally a custom SVG based icon font)_. Simply load that resulting CSS file into whatever HTML5 based application you're developing and you're good to go!

## OVERVIEW

**hui** starts by taking in some JSON config values, and turning those into complex SCSS scripts. Those SCSS files are then used to as your web applications theme. There is also an included builder to create compiled CSS files. You can even further inject the webfont SVG icons as inline images, creating a 1 file UI perfect for embedding on a tiny static project.

## INSTALL

The best way to use **@huement/ui** is to install it via your favorite node package manager (npm, yarn etc) and then import the sass files into your app.

```shell
  $ npm install @huement/ui
  $ yarn add @huement/ui
```

You will always need to import the library, and then optionally you can include to import icons here as well.

```sass
  @import '~@huement/ui/scss/mojo';

  // optionally import the icons
  @import '~@huement/ui/dist/hi/icons';
```

### CSS VARIATION INSTALL

Rather that include the SCSS files and bundling that, you can instead simply add the CSS file to your app's \<head\>. Although you will likely want to build it at least once yourself, once you customize the colors etc. and then include that compiled css file.

### BUILDING A CUSTOM CSS FILE

Building your own version of **@huement/ui** is easy and can be broken up into the following simple steps: Clone the repo, customize the SCSS variables, run the build command.

```shell
  $ git clone @huement/ui hui
  $ cd hui
  $ npm install
  # ... customize scss files ...
  $ npm run build
```

### LIVE DEVELOPMENT MODE

If you are looking to do more than change some colors, you likely want to run the live development server with hot reloading etc to make customizing things much easier. Assuming you have already cloned the reposity are working from its root directory

```shell
  $ npm run dev
```

## • SECTIONS

hui is designed to be SIMPLE! The folder structure is a testament to that principle.

1. **bin** ❱ command line scripts
2. **dist** ❱ finalized output
3. **public** ❱ static files
4. **src** ❱ SCSS framework
5. **tokens** ❱ design variables
6. **web** ❱ documentation & demo content

> NOTES:
> • Everything in the public folder is copied to the /dist/ folder on build.
> • /dist/ is routinely deleted. Never attempt to make a permanent change to anything in that folder directly. Modify /scss/ and rebuild.

---

### SCSS FRAMEWORK

> TODO: this part needs a lot of work

### STYLE + DESIGN TOKENS

1. **tokens/icons** ❱ TODO Fantasticon details
2. **tokens/chords.json** ❱ TODO explain how to generate this
3. **stack.json + color_tokens.json** ❱ TODO sort out the token color files

---

### ⬦ public

So the directory structure goes like this:

```sh
   ━━❪ public ❫
   ━━━▶ demo
   ━━━▶ favicon
   ━━━▶ fonts
```

---

### • web

## INSTALL

...

```
 @huement/ui |  HUEMENT USER INTERFACE
     version |  0.1.*
    codename |  mojo
```
