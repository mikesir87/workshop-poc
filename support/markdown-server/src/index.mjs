import express from "express";
import fs from "fs/promises";
import path from "path";
import markdownit from "markdown-it";
import { engine } from "express-handlebars";
import hljs from 'highlight.js';

const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  const hrefIndex = tokens[idx].attrIndex('href');
  if (hrefIndex >= 0) {
    let href = tokens[idx].attrs[hrefIndex][1];
    if (href.endsWith('.md')) {
      tokens[idx].attrs[hrefIndex][1] = href.slice(0, -3);
    }
  }
  return self.renderToken(tokens, idx, options);
};


const SITE_TITLE = process.env.SITE_TITLE || "Markdown Renderer Sample";
const ROOT_DIR = process.env.ROOT_DIR || "./src/samples";

const app = express();

// Handlebars setup
app.engine("hbs", engine({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", "./src/views");

app.use(express.static(ROOT_DIR));
app.use(express.static("./src/static"));

app.get(/(.*)/, async (req, res, next) => {
  try {
    console.log("Working with request:", req.path);
    const reqPath = req.path.endsWith("/")
      ? req.path.slice(0, -1)
      : req.path;

    const fileName = `${reqPath || "/README"}.md`;
    const mdFile = path.join(ROOT_DIR, fileName);
    try {
      const content = await fs.readFile(mdFile, "utf-8");
      res.render("index", { 
        content: md.render(content), 
        title: `${SITE_TITLE} - ${fileName}`,
        headerTitle: SITE_TITLE,
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).send("Markdown file not found");
      } else {
        next(err);
      }
    }
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
  console.log(`Serving files from ${ROOT_DIR}`);
});

["SIGTERM", "SIGINT"].forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal}. Shutting down server...`);
    process.exit(0);
  });
});
