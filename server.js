const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');


const app = express();
app.use(cors());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', async (req, res) => {
  const fileId = req.query.id;
  if (!fileId) return res.status(400).send('Missing file ID');
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(response.data);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).send('Download failed');
  }
});

// Chinese translation from Cambridge
app.get('/api/chinese', async (req, res) => {
  const word = (req.query.word || '').trim().toLowerCase();
  if (!word) {
    return res.status(400).json({ error: 'Missing word' });
  }

  const url = `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${word}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0'
  };

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const trans = $('.trans.dtrans.dtrans-se').first().text().trim();
    res.json({ word, chinese: trans || 'Not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// English definition from Cambridge
app.get('/api/english', async (req, res) => {
  const word = (req.query.word || '').trim().toLowerCase();
  if (!word) {
    return res.status(400).json({ error: 'Missing word' });
  }

  const url = `https://dictionary.cambridge.org/us/dictionary/english-chinese-simplified/${word}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0'
  };

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    let definition = $('.def.ddef_d.db').first().text().trim();

    // Clean up extra spaces before punctuation
    definition = definition.replace(/\s+([.,;!?])/g, '$1').replace(/\s+/g, ' ').trim();

    res.json({ word, definition: definition || 'Not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
