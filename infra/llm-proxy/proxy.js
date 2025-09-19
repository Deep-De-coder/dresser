const fastify = require('fastify')({ logger: true });

// Environment variables
const PROXY_KEY = process.env.PROXY_KEY;
const OLLAMA_INTERNAL_URL = process.env.OLLAMA_INTERNAL_URL || 'http://dresser-ollama.internal:11434';

// Validate API key middleware
fastify.addHook('preHandler', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  
  if (!PROXY_KEY) {
    reply.code(500).send({ error: 'proxy_key_not_configured' });
    return;
  }
  
  if (!apiKey || apiKey !== PROXY_KEY) {
    reply.code(401).send({ error: 'invalid_api_key' });
    return;
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Main LLM proxy endpoint
fastify.post('/llm', async (request, reply) => {
  try {
    const { model, messages, stream = false } = request.body;
    
    if (!model || !messages) {
      reply.code(400).send({ error: 'missing_required_fields' });
      return;
    }
    
    // Forward request to internal Ollama service
    const ollamaResponse = await fetch(`${OLLAMA_INTERNAL_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      }),
      timeout: 30000 // 30 second timeout
    });
    
    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      reply.code(502).send({ 
        error: 'upstream_unreachable',
        details: `Ollama service error: ${ollamaResponse.status} ${errorText}`
      });
      return;
    }
    
    const data = await ollamaResponse.json();
    
    if (!data.message?.content) {
      reply.code(502).send({ 
        error: 'upstream_unreachable',
        details: 'No content in Ollama response'
      });
      return;
    }
    
    return {
      message: {
        role: data.message.role,
        content: data.message.content
      },
      model: data.model,
      done: data.done
    };
    
  } catch (error) {
    fastify.log.error('Proxy error:', error);
    
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      reply.code(502).send({ 
        error: 'upstream_unreachable',
        details: 'Cannot connect to Ollama service'
      });
    } else {
      reply.code(500).send({ 
        error: 'internal_error',
        details: error.message
      });
    }
  }
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 8787;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`LLM Proxy server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
