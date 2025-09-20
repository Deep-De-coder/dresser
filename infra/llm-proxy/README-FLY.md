# Deploy (run these in this folder, outside Vercel)
fly launch --name dresser-llm-proxy --no-deploy
fly secrets set PROXY_KEY=$(openssl rand -hex 24)
fly deploy
curl https://dresser-llm-proxy.fly.dev/health   # should return {"ok":true}
