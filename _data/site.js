module.exports = {
  meta: {
    title: "Ashenafi's Blog",
    description: "Computer networks and security.",
    lang: "en",
    siteUrl: "https://valarnet.com/",
  },
  feed: { // used in feed.xml.njk
    subtitle: "Computer networks and security.",
    filename: "atom.xml",
    path: "/atom.xml",
    id: "https://valarnet.com/",
    authorName: "Ashenafi",
  },
  hero: { // used in hero section of main page ie. index.html.njk
    title: "Welcome to my blog",
    description: "Computer networks and security."
  }
}