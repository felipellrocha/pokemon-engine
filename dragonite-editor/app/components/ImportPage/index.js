import React, { PureComponent } from 'react';
import path from 'path';

import { connect } from 'react-redux';
import { compose } from 'recompose';

import {
  InlineSVG,
  ImportFooter,
} from 'components';

import {
  changeTilesetName,
  changeTilesetType,
  addTerrain,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this._handleGoBack = this._handleGoBack.bind(this);
    this._handleChangeTilesetName = this._handleChangeTilesetName.bind(this);
    this._handleChangeTilesetType = this._handleChangeTilesetType.bind(this);
    this._handleCreateTerrain = this._handleCreateTerrain.bind(this);
  }

  _handleGoBack() {
    const {
      history,
    } = this.props;

    history.goBack();
  }

  _handleCreateTerrain(e, index) {
    const {
      offsetX,
      offsetY,
    } = e.nativeEvent;

    const {
      tile,
      dispatch,
      tilesets,
      selectedTerrainType,
    } = this.props;

    const tileset = tilesets[index];

    const tileWidth = (1 / tileset.columns) * e.nativeEvent.target.width;
    const tileHeight = (1 / tileset.rows) * e.nativeEvent.target.height;

    const x = Math.floor(offsetX / tileWidth);
    const y = Math.floor(offsetY / tileHeight);

    dispatch(addTerrain(
      index,
      (y * tileset.columns + x),
      selectedTerrainType
    ));
  }

  _handleChangeTilesetName(event, index) {
    const {
      dispatch,
    } = this.props;

    dispatch(changeTilesetName(index, event.target.value));
  }

  _handleChangeTilesetType(event, index) {
    const {
      dispatch,
    } = this.props;

    dispatch(changeTilesetType(index, event.target.value));
  }

  render() {
    const {
      tile,
      tilesets,
      basepath,
    } = this.props;

    return (
      <div className={styles.component}>
        <h3>
          <span>Tileset Manager</span>
          <InlineSVG className="close" icon="cross" onClick={this._handleGoBack} />
        </h3>
        {tilesets.map((tileset, i) => {
          const src = path.resolve(basepath, tileset.src)
          const terrains = Object.keys(tileset.terrains);

          return (
            <div key={i} className='card'>
              <div className="left">
                <img src={src} onClick={event => this._handleCreateTerrain(event, i)} />
                {terrains.map(tileIndex => {
                  const terrain = tileset.terrains[tileIndex];

                  const style = getTerrain(tileset, terrain, tileIndex);

                  return (
                    <div key={tileIndex} className="terrain" style={style} />
                  )
                })}
              </div>
              <div className="right">
                <div>Path: <strong>{tileset.src}</strong></div>
                <div>Dimensions: <strong>{tileset.columns} x {tileset.rows}</strong></div>
                <div className="divider" />
                <div>Name: <input type="text" value={tileset.name} onChange={event => this._handleChangeTilesetName(event, i)} /></div>
                <div>Type:
                  <select value={tileset.type} onChange={event => this._handleChangeTilesetType(event, i)} >
                    <option value='tile'>Tile</option>
                    <option value='aware'>Aware</option>
                    <option value='image'>Image</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
        <ImportFooter />
      </div>
    );
  }
}

function getTerrain(tileset, terrain, tileIndex) {
  const x = Math.floor(tileIndex % tileset.columns);
  const y = Math.floor(tileIndex / tileset.columns);

  const tileWidth = (1 / tileset.columns) * 100;
  const tileHeight = (1 / tileset.rows) * 100;

  if (terrain.type === '6-animated') {
    return {
      width: `${(2 * tileWidth) * 3}%`,
      height: `${3 * tileHeight}%`,
      left: `${x * tileWidth}%`,
      top: `${y * tileHeight}%`,
    };
  }
  if (terrain.type === '6-tile') {
    return {
      width: `${2 * tileWidth}%`,
      height: `${3 * tileHeight}%`,
      left: `${x * tileWidth}%`,
      top: `${y * tileHeight}%`,
    };
  }
  if (terrain.type === '4-tile') {
    return {
      width: `${2 * tileWidth}%`,
      height: `${2 * tileHeight}%`,
      left: `${x * tileWidth}%`,
      top: `${y * tileHeight}%`,
    };
  }
}

export default compose(
  connect(state => ({
    tilesets: state.app.tilesets,
    tile: state.app.tile,
    basepath: state.global.basepath,
    selectedTerrainType: state.global.selectedTerrainType,
  })),
)(component);
