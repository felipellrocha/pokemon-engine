import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { memoize } from 'lodash';

import path from 'path';

import classnames from 'classnames';

import {
  EMPTY,
  ENTITY,
} from 'utils/constants';

import {
  XYToIndex,
  IndexToXY,
  areCoordinatesInside,
  compareCoordinates,
  sixTile,
  fourTile,
} from 'utils';

import styles from './styles.css';

const COLORS = [
  '#333',
  '#f00',
  '#0f0',
  '#00f',
];

function noop () { }

const getMemberValue = (component) => (key) => component.members[key].value;

const getColor = memoize(function(id) {

  const str = Array.from(id);
  const index = str.reduce((prev, c) => prev + c.charCodeAt(0), 0) % COLORS.length;

  return COLORS[index];
});

class component extends PureComponent {
  constructor(props) {
    super(props);

    this._dispatchAction = this._dispatchAction.bind(this);
    this.renderEmptyTile = this.renderEmptyTile.bind(this);
    this.renderEntityTile = this.renderEntityTile.bind(this);
    this.renderSimpleTile = this.renderSimpleTile.bind(this);
    this.renderSubTile = this.renderSubTile.bind(this);
  }

  _dispatchAction(e) {
    const {
      setIndex,
      tileIndex,
      x,
      y,
      dispatch,
    } = this.props;

    if (this.props.tileAction)
      dispatch(this.props.tileAction({
        setIndex,
        tileIndex,
        x,
        y,
      }));
  }

  renderAwareTile() {
    const {
      tile,
      tilesets,
      setIndex,
      tileIndex,
      grid,
      x,
      y,
      className,
      basepath,
      data,
      hideGrid,
    } = this.props;

    const classes = classnames(styles.component, className, {
      [styles.grid]: !(togglableGrid && hideGrid),
    });

    const tileset = tilesets[setIndex];
    const terrain = tileset.terrains[tileIndex];

    const left = (tileIndex % tileset.columns) * tile.width;
    const top = Math.floor(tileIndex / tileset.columns) * tile.height;
    const src = path.resolve(basepath, tileset.src)

    const style = {
      height: tile.height,
      width: tile.width,
      display: 'flex',
      flexWrap: 'wrap',
    };

    const directions = {
      isNorth: areCoordinatesInside(x, y - 1, grid) && compareCoordinates([x, y], [x, y - 1], data, grid),
      isNorthEast: areCoordinatesInside(x + 1, y - 1, grid) && compareCoordinates([x, y], [x + 1, y - 1], data, grid),
      isEast: areCoordinatesInside(x + 1, y, grid) && compareCoordinates([x, y], [x + 1, y], data, grid),
      isSouthEast: areCoordinatesInside(x + 1, y + 1, grid) && compareCoordinates([x, y], [x + 1, y + 1], data, grid),
      isSouth: areCoordinatesInside(x, y + 1, grid) && compareCoordinates([x, y], [x, y + 1], data, grid),
      isSouthWest: areCoordinatesInside(x - 1, y + 1, grid) && compareCoordinates([x, y], [x - 1, y + 1], data, grid),
      isWest: areCoordinatesInside(x - 1, y, grid) && compareCoordinates([x, y], [x - 1, y], data, grid),
      isNorthWest: areCoordinatesInside(x - 1, y - 1, grid) && compareCoordinates([x, y], [x - 1, y - 1], data, grid),
    };

    const tilingPackage =
      (terrain.type === '6-tile' || terrain.type === '6-animated') ?
      sixTile :
      fourTile;
    
    return (
      <div className={classes} style={style} onClick={this._dispatchAction} onDragStart={noop} onDrop={noop}>
        { this.renderSubTile(left, top, src, tilingPackage.northWestOffset(directions)) }
        { this.renderSubTile(left, top, src, tilingPackage.northEastOffset(directions)) }
        { this.renderSubTile(left, top, src, tilingPackage.southWestOffset(directions)) }
        { this.renderSubTile(left, top, src, tilingPackage.southEastOffset(directions)) }
      </div>
    )
  }

  renderSubTile(left, top, src, offset) {
    const {
      tile,
      tilesets,
      setIndex,
    } = this.props;

    const x = offset[0] * (tile.width / 2);
    const y = offset[1] * (tile.height / 2);

    const tileset = tilesets[setIndex];

    const style = {
      height: tile.height / 2,
      width: tile.width / 2,
      backgroundImage: `url('file://${src}')`,
      backgroundPosition: `-${left + x}px -${top + y}px`,
    };

    return (
      <div style={style}/>
    )
  }


  renderEntityTile() {
    const {
      tile,
      grid,
      basepath,
      tilesets,
      tileIndex: id,
      entities,
      className,
      hideGrid,
      togglableGrid,
      workspaceGrid,
    } = this.props;

    const classes = classnames(
      styles.component,
      styles.entity,
      className, {
      [styles.grid]: !(togglableGrid && hideGrid),
    });

    const style = {
      height: tile.height,
      width: tile.width,
      backgroundColor: getColor(id),
    };

    const entity = entities[id];

    if (workspaceGrid)
    entity.components.forEach(component => {
      const member = getMemberValue(component);

      switch (component.name) {
        case 'SpriteComponent':
          const tileset = tilesets[member('src')];
          const src = path.resolve(basepath, tileset['src']);

          style.height = (member('h') > 0) ? member('h') : style.height;
          style.width = (member('w') > 0) ? member('w') : style.width;
          style.backgroundImage = `url('file://${src}')`;
          style.opacity = 1;
          style.backgroundColor = 'transparent';
        break;
        case 'DimensionComponent':
          //style.resize = 'both';
        break;
        case 'RenderComponent':
          if (member('shouldTileX')) {
            style.position = 'absolute';
            style.right = 0;
            style.left = 0;
            style.width = 'auto';
          }
          if (member('shouldTileY')) {
            style.position = 'absolute';
            style.top = 0;
            style.bottom = 0;
            style.width = 'auto';
          }
        break;
      }
    })

    return (
      <div className={classes} style={style} onClick={this._dispatchAction} onDragStart={noop} onDrop={noop}>
        {entity.name}
      </div>
    )
  }

  renderSimpleTile() {
    const {
      tile,
      tilesets,
      setIndex,
      tileIndex,
      grid,
      className,
      basepath,
      selected,
      hideGrid,
      togglableGrid,
    } = this.props;

    const classes = classnames(styles.component, className, {
      [styles.selected]: selected,
      [styles.grid]: !(togglableGrid && hideGrid),
    });

    const tileset = tilesets[setIndex];

    const left = (tileIndex % tileset.columns) * tile.width;
    const top = Math.floor(tileIndex / tileset.columns) * tile.height;
    const src = path.resolve(basepath, tileset.src)

    const style = {
      height: tile.height,
      width: tile.width,
      backgroundImage: `url('file://${src}')`,
      backgroundPosition: `-${left}px -${top}px`,
    };

    
    return (
      <div className={classes} style={style} onClick={this._dispatchAction} onDragStart={noop} onDrop={noop} />
    )
  }

  renderEmptyTile() {
    const {
      className,
      tile,
      selected,
      hideGrid,
      togglableGrid,
    } = this.props;

    const style = {
      height: tile.height,
      width: tile.width,
    };

    const classes = classnames(styles.component, className, {
      [styles.selected]: selected,
      [styles.grid]: !(togglableGrid && hideGrid),
    });

    return (
      <div className={classes} style={style} onClick={this._dispatchAction} onDragStart={noop} onDrop={noop} />
    )
  }

  render() {
    const {
      setIndex,
      tileIndex,
      tilesets,
      simpleTile,
    } = this.props;

    if (setIndex === EMPTY) return this.renderEmptyTile();
    if (setIndex === ENTITY) return this.renderEntityTile();

    const tileset = tilesets[setIndex];

    if (simpleTile || tileset.type === 'tile') return this.renderSimpleTile();
    if (tileset.type === 'aware') return this.renderAwareTile();
  }
}

export default connect(
  (state, props) => ({
    tile: state.app.tile,
    tilesets: state.app.tilesets,
    entities: state.app.entities,
    grid: state.tilemap.grid,
    basepath: state.global.basepath,
    hideGrid: state.global.hideGrid,
  }),
)(component);
