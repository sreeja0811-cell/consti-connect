require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is alive and running!");
});

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const NLP_SERVICE_URL = "http://127.0.0.1:8000/analyze"; // Your Python "brain"

// ----------------------------------------------------------------
// --- NEW FUNCTION: Background News Fetch & Analysis ---
// ----------------------------------------------------------------
/**
 * This function takes all the logic you had in your /api/news endpoint
 * and runs it as a background task.
 */
const fetchAndAnalyzeNews = async () => {
  console.log("BACKGROUND TASK: Starting news fetch...");
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      console.error("BACKGROUND TASK: Error - NEWS_API_KEY is not set.");
      return;
    }

    const newsResponse = await fetch(`https://newsapi.org/v2/top-headlines?country=in&category=general&apiKey=${NEWS_API_KEY}`);
    
    if (!newsResponse.ok) {
      console.error("BACKGROUND TASK: Error fetching news:", newsResponse.status, newsResponse.statusText);
      return;
    }

    const newsData = await newsResponse.json();
    const articles = newsData.articles || [];
    let newArticlesCount = 0;

    for (let article of articles) {
      // 1. Check if article already exists
      const { data: existing, error: checkError } = await supabase
        .from("news_articles")
        .select("id")
        .eq("source_url", article.url)
        .limit(1);

      if (checkError) {
        console.error("BACKGROUND TASK: Error checking for duplicate article:", checkError.message);
        continue;
      }
      
      if (existing && existing.length > 0) {
        continue; // Skip, article already in DB
      }

      // 2. Call NLP service to analyze content
      let nlpResult = { matches: [] };
      try {
        const nlpResponse = await fetch(NLP_SERVICE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: article.content || article.description || article.title || "" }),
        });
        if (nlpResponse.ok) {
          nlpResult = await nlpResponse.json();
        } else {
          console.warn(`NLP service failed for article: ${article.title}`);
        }
      } catch (err) {
        console.error("BACKGROUND TASK: Error calling NLP service:", err.message);
      }

      // 3. Insert news article
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

      if (insertError) {
        console.error("BACKGROUND TASK: Error inserting news:", insertError.message);
        continue;
      }

      // 4. Insert links to constitutional articles
      if (nlpResult.matches && nlpResult.matches.length > 0) {
        const linksToInsert = nlpResult.matches.map(match => ({
          news_article_id: insertedNews.id,
          constitutional_article_id: match.id,
          relevance_score: match.similarity,
          explanation: match.explanation || null,
        }));
        
        const { error: linkError } = await supabase.from("article_links").insert(linksToInsert);
        if (linkError) {
          console.error("BACKGROUND TASK: Error inserting article links:", linkError.message);
        }
      }
      newArticlesCount++;
    }
    console.log(`BACKGROUND TASK: Fetch complete. Added ${newArticlesCount} new articles.`);

  } catch (err) {
    console.error("BACKGROUND TASK: Unexpected error in fetchAndAnalyzeNews:", err.message);
  }
};


// Health check
app.get("/", (req, res) => res.send("Backend is alive!"));

// ----------------------------------------------------------------
// --- UPDATED API ENDPOINT: Get News Feed ---
// ----------------------------------------------------------------
/**
 * This endpoint is now VERY FAST. It no longer calls NewsAPI.
 * It only fetches the pre-processed data from our own database.
 */
app.get("/api/news", async (req, res) => {
  try {
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
          constitutional_articles (
            id,
            article_number,
            title,
            full_text,
            similarity: relevance_score
          )
        )
      `)
      .order("published_at", { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error("Error fetching latest articles:", fetchError);
      return res.status(500).json({ error: "Failed to fetch latest articles" });
    }

    // --- Data cleaning to match the frontend's expected structure ---
    // The query above returns matches nested inside `constitutional_articles`.
    // We'll flatten this to match what the frontend expects.
    const cleanedArticles = latestArticles.map(article => {
        const matches = article.article_links.map(link => ({
            ...link.constitutional_articles, // Spread the article details
            similarity: link.relevance_score // Add the similarity score
        }));
        
        // Remove the old nested structure
        delete article.article_links; 
        // Add the new cleaned matches array
        article.matches = matches; 
        return article;
    });

    res.json(cleanedArticles);

  } catch (err) {
    console.error("Unexpected error in /api/news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ----------------------------------------------------------------
// --- API ENDPOINT: Analyze User Text (Unchanged) ---
// ----------------------------------------------------------------
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    const nlpResponse = await fetch(NLP_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!nlpResponse.ok) {
      console.error("NLP service error status:", nlpResponse.status);
      return res.status(502).json({ error: "NLP service error" });
    }

    let nlpResult;
    try {
      nlpResult = await nlpResponse.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON from NLP service:", jsonErr);
      return res.status(502).json({ error: "Invalid JSON from NLP service" });
    }

    if (!nlpResult.matches) nlpResult.matches = [];
    res.json(nlpResult);

  } catch (err) {
    console.error("Error calling NLP service:", err.message);
    res.status(500).json({ error: "Failed to analyze text" });
  }
});

// ----------------------------------------------------------------
// --- UPDATED: Start Server and Scheduled Task ---
// ----------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  
  // Run the fetch function once on startup
  console.log("Running initial news fetch on startup...");
  fetchAndAnalyzeNews();
  
  // Set it to run every hour (3600 * 1000 milliseconds)
  setInterval(fetchAndAnalyzeNews, 3600000);
  console.log("Scheduled news fetch to run every hour.");
});

