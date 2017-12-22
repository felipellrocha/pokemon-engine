var parser = require('./parser.js');

console.log(parser.parse(`
player {
  PositionComponent{}
}

enemy {
  DimensionComponent{}
}
`));
