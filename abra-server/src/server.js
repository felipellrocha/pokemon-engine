import path from 'path';
import express from 'express';
import proxy from 'http-proxy-middleware';

const app = express();

const HOST = '0.0.0.0';
const PORT = '8000';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/health', (req, res) => {
  res.send({
    status: 'ok',
  });
});

app.use('/static', proxy({
  target: 'http://charmander:8000/',
  pathRewrite: {
    '^/static': '/src/images',
  },
}));

app.use('/app', proxy({
  target: 'http://charmander:8000',
  pathRewrite: {
    '^/app': '',
  },
}));

app.use('/engine/src', proxy({
  target: 'http://pikachu:8000',
  pathRewrite: {
    '^/engine': '',
  },
}));

app.use('/engine', proxy({
  target: 'http://pikachu:8000',
  pathRewrite: {
    '^/engine': '/build',
  },
}));

app.get('/stdio.html', proxy({
  target: 'http://pikachu:8000',
  onProxyReq: (_, req) => {
    console.log('stdio', req);
  }
}));

const ws = proxy({
  ws: true,
  target: 'http://pidgeot:8000/',
  pathRewrite: {
    '^/socket': '',
  },
});
app.use('/socket', ws);

app.get('/*', async (req, res) => {
  res.render('app.ejs', {
    host: req.headers.host,
  });
});

console.log(`Listening at ${HOST}:${PORT}`);
const server = app.listen(PORT, HOST);
server.on('upgrade', ws.upgrade);
