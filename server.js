const express = require("express");
const RSSParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;
const parser = new RSSParser();

// ใช้ไฟล์ HTML, CSS, JS ที่มีอยู่
app.use(express.static("public"));

const getImageFromTag = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });  // รอให้หน้าเว็บโหลดเสร็จ
  
    // ดึง HTML ที่ถูกโหลดแล้ว
    const content = await page.content();
    const $ = cheerio.load(content);
  
    // ค้นหา <img> tag ที่มี alt="lovepraew"
    const imageSrc = $('img[alt="lovepraew"]');
    console.log(imageSrc)
  
    await browser.close();
  
    return imageSrc ? imageSrc : null;  // คืนค่า src ของภาพ
  };

// const getArticleImage = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//     // หารูปภาพแรกในบทความ (อาจจะเป็นรูปภาพหลัก)
//     // const image = $("img").eq(4).attr("src");
//     // return image ? image : null;
//     const imageSrc = $('img[alt="lovepraew"]').attr('width');

//     return imageSrc ? imageSrc : null;  // คืนค่า URL ของรูปภาพที่ถูกต้อง หรือ null ถ้าไม่พบ
//   } catch (error) {
//     console.error("Error fetching article image:", error);
//     return null;
//   }
// };

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

// API สำหรับดึงข้อมูล RSS Feed
app.get("/rss", async (req, res) => {
  const feedUrl = "https://medium.com/feed/@einzberne"; // เปลี่ยน @username เป็นชื่อผู้ใช้ของคุณ
  try {
    const feed = await parser.parseURL(feedUrl);

    const articlesWithImages = await Promise.all(
      feed.items.map(async (item) => {
        const image = await getImageFromMetaTag(item.link); // ดึงรูปภาพจากลิงก์บทความ
        console.log(image);
      })
    );
    res.json(feed.items); // ส่งข้อมูล RSS Items กลับไปยังหน้าเว็บ
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).send("Error fetching RSS feed");
  }
});

// สั่งให้เซิร์ฟเวอร์ทำงาน
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
