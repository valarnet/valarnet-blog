---
title: "Migrating Blog From Wordpress To Eleventy"
date: "2022-07-11"
categories: 
  - "valarnet"
tags: 
  - "random"
---

This weekend I migrated my blog from WordPress to Eleventy. The process is so simple it is incredible how easy it has become to spin up new sites. Thanks to Eleventy, Netlify, and all the open source theme developers out there who make that possible!

At a high level, here are some of the steps I took.
- Created a repo for my blog in GitHub and linked it to Netlify.
- I tried out a few themes and landed on the [Eleventy + Stylus Blog Theme.](https://github.com/ar363/eleventy-stylus-blog-theme) I love its simplicity, card layouts, and the options for light and dark modes are great. The steps provided on the theme's GitHub page are pretty straightforward to follow.
- Modified site.js. Changed titles, descriptions, etc. to match how I want them to look. I removed the "hero" section because I didn't need it to be there. The page looks even simpler without it.
- Exported my posts from Wordpress to an xml file format by navigating to **Tools > Export**
- I used this [wordpress-export-to-markdown](https://github.com/lonekorean/wordpress-export-to-markdown) tool to convert the xml to markdown file format. Included the post images in the conversion.
```js
node index.js --addcontentimages=true
```
I had to do some edits to fix broken image links in the markdowns but that wasn't unmanageable for me. There are only a few posts to deal with at this point. Good time to migrate. I do wonder how this experience could turn out for those who have thousands of posts.
- Added the [syntax highlighting tool](https://www.11ty.dev/docs/plugins/syntaxhighlight/) using [CDN.](https://prismjs.com/#basic-usage-cdn) Modified eleventy.js file and added const and plugin lines in the appropriate places.
```js
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = (config) => {
  config.addPlugin(syntaxHighlight);
}
```
Also added the reference in the index file.
```html
  <link href="https://unpkg.com/prismjs@1.20.0/themes/prism-okaidia.css" rel="stylesheet">
```
- Looked at multiple options for comments (Disqus, Google Forms, MongoDB etc.) They were all not as elegant but found utterances beautifully simple. Added comment section using [utterances.](https://github.com/utterance/utterances)  Installed utterances in my repo. It was easy as clicking "Install" and selecting the repo to install to. Also added the follwoing script in _includes/layouts/post.njk to automatically include comment widget under each post.
```njk
<script
  async
  src="https://utteranc.es/client.js"
  repo="valarnet/valarnet-blog"
  issue-term="title"
  theme="github-light"
  crossorigin="anonymous"
></script>
```
- Committed changes, pushed to remote, and deployed the site to Netlify.
- Changed my DNS to Netlify and waited for it to propagate.

An annoying message I continued seeing when committing and pushing changes to my remote blog repo is a falling out of sync between local main branch and origin/main
```bash
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)
```
It's just a simple blog and I do not need to branch it out so far. I just work on the main. I have leaned on a simple four step process to make that annoying message disappear without losing my changes.
```bash
git add .
git commit -m "Made some formatting changes"
git push
Validate the changes have propagated to remote repo (**important step not to lose the changes**)
git fetch
```
My branch and origin/main stay synced and the git status reflects that. Make sure to validate the push has made your changes propagate to to origin/main before doing a git fetch. Otherwise, git fetch can overwrite the local main branch. 

There are some additional things I want to modify over the next few days as I find the time. Some of which are simple tweaks such as same file markdown location linking, the looks and colors in main.css, integrate Netlify analytics, mobile site rendering customizations, minimize post title font size rem, etc.

**Huge appreciation to the Eleventy and Open Source community who make tons of hours of their work available to use freely!** :clap: