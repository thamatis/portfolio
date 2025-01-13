const express = require("express");
const RSSParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;
const parser = new RSSParser();

app.use(express.static("public"));

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

app.get("/rss", async (req, res) => {
  const feedUrl = "https://medium.com/feed/@einzberne";
  try {
    const feed = await parser.parseURL(feedUrl);

    const articlesWithImages = await Promise.all(
      feed.items.map(async (item) => {
        const image = await getImageFromMetaTag(item.link); 
        console.log(image);
      })
    );
    res.json(feed.items)
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).send("Error fetching RSS feed");
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
