// api/rss.js

const RSSParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");

const parser = new RSSParser();

const getImageFromMetaTag = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // ค้นหาค่า content ใน <meta> tag ที่มี property="og:image"
    const imageSrc = $('meta[property="og:image"]').attr('content');
    return imageSrc ? imageSrc : null;  // คืนค่า URL ของภาพ
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

module.exports = async (req, res) => {
  const feedUrl = "https://medium.com/feed/@einzberne"; // เปลี่ยน @username เป็นชื่อผู้ใช้ของคุณ

  try {
    const feed = await parser.parseURL(feedUrl);

    const articlesWithImages = await Promise.all(
      feed.items.map(async (item) => {
        const image = await getImageFromMetaTag(item.link); // ดึงรูปภาพจากลิงก์บทความ
        item.image = image; // เพิ่มข้อมูลภาพเข้าไปในแต่ละบทความ
        return item;
      })
    );

    res.status(200).json(articlesWithImages); // ส่งข้อมูล RSS Items พร้อมรูปภาพ
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).send("Error fetching RSS feed");
  }
};
