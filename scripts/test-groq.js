const fs = require('fs');

async function testGroq() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = envFile.split('\n').find(l => l.startsWith('GROQ_API_KEY='));
  const apiKey = apiKeyLine.split('=')[1].trim();

  console.log("Testing with API Key:", apiKey.substring(0, 10) + "...");

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are an AI tutor for geology.' },
        { role: 'user', content: 'What is an anticline?' }
      ],
      stream: false,
    })
  });

  const text = await groqResponse.text();
  console.log("Response:", groqResponse.status, text);
}

testGroq().catch(console.error);
