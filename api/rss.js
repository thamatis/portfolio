// api/rss.js

const RSSParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");

const parser = new RSSParser();

const getImageFromMetaTag = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const imageSrc = $('meta[property="og:image"]').attr('content');
    return imageSrc ? imageSrc : null; 
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

module.exports = async (req, res) => {
  const feedUrl = "https://medium.com/feed/@einzberne"; 

  try {
    const feed = await parser.parseURL(feedUrl);

    const articlesWithImages = await Promise.all(
      feed.items.map(async (item) => {
        const image = await getImageFromMetaTag(item.link); 
        item.image = image; 
        return item;
      })
    );

    res.status(200).json(articlesWithImages); 
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).send("Error fetching RSS feed");
  }
};
