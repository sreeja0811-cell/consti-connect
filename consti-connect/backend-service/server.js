require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios"); // Use axios instead of node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/", (req, res) => {
  res.send("Backend is alive and running!");
});

// --- Endpoint: Get Latest News and Link to Constitution Articles ---
app.get("/api/news", async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    // --- THIS IS THE LINE I CHANGED ---
    // It now points to newsapi.org and uses `apiKey` instead of `token`
    const newsResponse = await axios.get(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`);
    // ---------------------------------

    const newsData = newsResponse.data; // .data instead of .json()

    const articles = newsData.articles || [];

    for (let article of articles) {
      // Check for duplicates
      const { data: existing } = await supabase
        .from("news_articles")
        .select("*")
        .eq("source_url", article.url);

      if (existing && existing.length > 0) continue;

      // Analyze article content via Python NLP service
      // Changed to axios.post
      const nlpResponse = await axios.post("http://127.0.0.1:8000/analyze", {
        text: article.content || article.description || "",
      });
      const nlpResult = nlpResponse.data; // .data instead of .json()

      // Insert news article
      const { data: insertedNews, error: insertError } = await supabase
        .from("news_articles")
        .insert({
          title: article.title,
          source_url: article.url,
          content: article.content || article.description || "",
          published_at: article.publishedAt,
        })
        .select()
        .single();
        
      if(insertError) throw insertError;
      if(!insertedNews) throw new Error("Failed to insert news article.");

      // Insert links to constitutional articles
      for (let match of nlpResult.matches || []) {
        await supabase.from("article_links").insert({
          news_article_id: insertedNews.id,
          constitutional_article_id: match.id,
          relevance_score: match.similarity,
          explanation: match.explanation || null,
        });
      }
    }

    // Return latest 20 articles with links
    const { data: latestArticles, error: fetchError } = await supabase
      .from("news_articles")
      .select(`
        id,
        title,
        source_url,
        content,
        published_at,
        article_links (
          relevance_score,
          explanation,
          constitutional_article_id (
            id,
            article_number,
            title,
            full_text
          )
        )
      `)
      .order("published_at", { ascending: false })
      .limit(20);

    if (fetchError) throw fetchError;

    // Format data to match frontend expectations
    const formattedArticles = latestArticles.map(article => {
        const relatedArticles = article.article_links.map(link => ({
            id: link.constitutional_article_id.id,
            number: link.constitutional_article_id.article_number,
            title: link.constitutional_article_id.title,
            summary: link.constitutional_article_id.full_text.substring(0, 150) + "..."
        }));

        return {
            id: article.id,
            title: article.title,
            snippet: article.content ? article.content.substring(0, 200) + "..." : (article.description || "").substring(0, 200) + "...", // Added a fallback to description
            fullContent: article.content,
            publishedAt: article.published_at,
            relatedArticles: relatedArticles
        };
    });

    res.json(formattedArticles);
  } catch (err) {
    console.error("Error in /api/news:", err.message);
    res.status(500).json({ error: "Failed to fetch news", details: err.message });
  }
});

// --- Endpoint: Analyze User Text ---
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    // Changed to axios.post
    const nlpResponse = await axios.post("http://127.0.0.1:8000/analyze", { text });
    const nlpResult = nlpResponse.data; // .data instead of .json()
    
    // Format data to match frontend expectations
    const formattedResults = (nlpResult.matches || []).map(match => ({
        id: match.id,
        number: match.article_number,
        title: match.title,
        summary: match.full_text ? match.full_text.substring(0, 150) + "..." : "No summary available."
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Error in /api/analyze:", err.message);
    res.status(500).json({ error: "Failed to analyze text", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

