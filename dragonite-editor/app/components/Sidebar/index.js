import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom'

import path from 'path';

import { memoize } from 'lodash';

import {
  EMPTY,
  ENTITY,
} from 'utils/constants';

import {
  IndexToXY,
  XYToIndex,
} from 'utils';

import {
  selectTilesets,
  selectTile,
  changeLayerName,
  changeLayerType,
  addLayer,
  moveLayerUp,
  moveLayerDown,
  selectLayer,
  toggleLayerVisibility,
  removeLayer,
  viewTilesetEditor,
  receiveTileSelection,
} from 'actions';

import {
  InlineSVG,
  Button,
  Grid,
} from 'components';

import styles from './styles.css';

function noop () { }

class LayerComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.handleSelectLayer = this.handleSelectLayer.bind(this);
    this.handleChangeLayerName = this.handleChangeLayerName.bind(this);
    this.handleChangeLayerType = this.handleChangeLayerType.bind(this);
    this.handleMoveLayerUp = this.handleMoveLayerUp.bind(this);
    this.handleMoveLayerDown = this.handleMoveLayerDown.bind(this);
    this.handleRemoveLayer = this.handleRemoveLayer.bind(this);
    this.handleToggleVisibility = this.handleToggleVisibility.bind(this);
  }


  handleMoveLayerUp() {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(moveLayerUp(index));
  }

  handleMoveLayerDown() {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(moveLayerDown(index));
  }

  handleChangeLayerName(event) {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(changeLayerName(index, event.target.value));
  }

  handleSelectLayer() {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(selectLayer(index));
  }

  handleRemoveLayer() {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(removeLayer(index));
  }

  handleChangeLayerType(event) {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(changeLayerType(index, event.target.value));
  }

  handleToggleVisibility() {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(toggleLayerVisibility(index));
  }

  render() {
    const {
      layer,
      index,
      layersLength,
      selectedLayer,
    } = this.props;

    const classes = classnames('layer', {
      'selected': selectedLayer === index,
      'not-visible': !layer.visible,
    });

    return (
      <div
        className={classes}
        onClick={this.handleSelectLayer}
      >
        <input
          onChange={this.handleChangeLayerName}
          value={ layer.name }
        />
        <div className="actions">
          {index !== 0
            ? <InlineSVG icon='arrow-up' className="action" onClick={this.handleMoveLayerUp} />
            : <div className="action" />}
          {index !== layersLength - 1 
            ? <InlineSVG icon='arrow-down' className="action" onClick={this.handleMoveLayerDown} />
            : <div className="action" />}
          <InlineSVG icon='eye' className="action" onClick={this.handleToggleVisibility} />
          <InlineSVG icon='cross' className="action" onClick={this.handleRemoveLayer} />
          <select value={layer.type} onChange={this.handleChangeLayerType}>
            <option value='tile'>Tile</option>
            <option value='object'>Object</option>
          </select>
        </div>
      </div>
    )
  }
};

const Layer = connect(state => ({
    selectedLayer: state.global.selectedLayer,
  }),
)(LayerComponent);

class component extends PureComponent {
  constructor(props) {
    super(props);

    this.handleSelectTiles = this.handleSelectTiles.bind(this);
    this.handleViewTilesetEditor = this.handleViewTilesetEditor.bind(this);
    this.renderSimpleGrid = this.renderSimpleGrid.bind(this);
    this.renderEntityGrid = this.renderEntityGrid.bind(this);
    this.renderTerrainGrid = this.renderTerrainGrid.bind(this);

    this.handleSelectTile = this.handleSelectTile.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.handleAddLayer = this.handleAddLayer.bind(this);

    this.state = {
      initialIndex: 0,
      selecting: false,
    };
  }

  handleAddLayer() {
    const {
      dispatch,
    } = this.props;

    dispatch(addLayer());
  }

  handleSelectTiles() {
    const {
      dispatch,
    } = this.props;

    dispatch(selectTilesets());
  }

  handleViewTilesetEditor() {
    const {
      dispatch,
      history,
    } = this.props;

    dispatch(viewTilesetEditor(history));
  }

  handleMouseDown(e, layer, grid) {
    const {
      dispatch,
      tile,
    } = this.props;

    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    const index = XYToIndex(
      Math.floor(x / tile.width),
      Math.floor(y / tile.height),
      grid
    );

    this.setState({
      selecting: true,
    });

    dispatch(receiveTileSelection(index, layer, grid, index));
  }

  handleMouseUp() {
    this.setState({
      selecting: false,
    });
  }

  handleSelectTile(e, layer, grid) {
    if (!this.state.selecting && e.type !== 'click') { return }

    const {
      dispatch,
      tile,
    } = this.props;

    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    const index = XYToIndex(
      Math.floor(x / tile.width),
      Math.floor(y / tile.height),
      grid
    );

    const selection = {
      setIndex: layer,
      tileIndex: index,
    };

    dispatch(receiveTileSelection(index, layer, grid));
  }

  renderSimpleGrid(tileset, index) {
    const {
      rows,
      columns,
      src,
      name,
    } = tileset;

    const [
      data,
      grid,
    ] = _getGridData(tileset, rows, columns, index);

    const key = `${rows}_${columns}_${index}`

    return (
      <div key={key}>
        <h3>{ name }</h3>
        <Grid
          data={data}
          grid={grid}
          className={styles.cancelEvents}
          simpleTiles
          selectorGrid

          onMouseMove={event => this.handleSelectTile(event, index, tileset)}
          onMouseDown={event => this.handleMouseDown(event, index, tileset)}
          onMouseUp={this.handleMouseUp}
          onDragStart={noop}
          onDrop={noop}
        />
      </div>
    );
  }

  renderEntityGrid() {
    const {
      entities,
    } = this.props;

    const [
      data,
      grid,
    ] = _getEntityData(entities, 4);

    return (
      <div key='entity-grid'>
        <Grid
          data={data}
          grid={grid}
          tileAction={selectTile}
          tileEvents
        />
      </div>
    );
  }

  renderTerrainGrid(tileset, index) {
    const {
      rows,
      columns,
      src,
      name,
    } = tileset;

    const [
      data,
      grid,
    ] = _getTerrainData(tileset, 4, index);

    const key = `${rows}_${columns}_${index}`

    return (
      <div key={key}>
        <h3>{ name }</h3>
        <Grid
          data={data}
          grid={grid}
          tileAction={selectTile}
          tileEvents
          simpleTiles
        />
      </div>
    );
  }

  render() {
    const {
      name,
      basepath,
      maps,
      tile,
      entities,
      tilesets,
      layers,
      selectedLayer,
      selectedMap,
      selectedTile,
      selectedShape,
    } = this.props;

    const [
      setIndex,
      tileIndex,
    ] = selectedTile;

    const map = maps[selectedMap];
    const tileset = tilesets[setIndex];
    const preview = {};
    
    if (tileset) { 
      const src = path.resolve(basepath, tileset.src);
      const left = (tileIndex % tileset.columns) * tile.width;
      const top = Math.floor(tileIndex / tileset.columns) * tile.height;
      const width = tile.width * selectedShape.columns;
      const height = tile.height * selectedShape.rows;

      preview['backgroundImage'] = `url('file://${src}')`;
      preview['backgroundPosition'] = `-${left}px -${top}px`;
      preview['width'] = `${width}px`;
      preview['height'] = `${height}px`;
    }

    return (
      <div className={styles.component}>
        <h1>{ name }</h1>
        <h2>{ map.name }</h2>
        <div className="separator">
          {layers.map((layer, i) => {
            return (<Layer layer={layer} index={i} layersLength={ layers.length } key={ layer.id } />)
          })}
          <div className="layer add" onClick={this.handleAddLayer}>
            <div>Add another layer</div>
            <InlineSVG icon="plus-circle" />
          </div>
        </div>
        <div className="actions separator">
          <Button onClick={this.handleSelectTiles}>
            Add texture
          </Button>
          <Button onClick={this.handleViewTilesetEditor}>
            View texture editor
          </Button>
        </div>
        <div className="tilesets separator">
          <div className="entities">
            <h4>Entities</h4>
            {this.renderEntityGrid()}
          </div>
          <div className="simple">
            <h4>Tile</h4>
            { tilesets.map((tileset, index) => {
              if (tileset.type === 'tile') return this.renderSimpleGrid(tileset, index)
            })}
          </div>
          <div className="terrains">
            <h4>Terrains</h4>
            { tilesets.map((tileset, index) => {
              if (tileset.type === 'aware') return this.renderTerrainGrid(tileset, index)
            })}
          </div>
          <div className="preview">
            <div style={preview} />
          </div>
        </div>
      </div>
    );
  }
}

const _getGridData = memoize(function(tileset, rows, columns, index) {
  return [
    [...Array(rows * columns)].map((_, i) => [index, i]),
    { rows, columns },
  ];
});

const _getEntityData = memoize(function(entities, columns) {
  const keys = Object.keys(entities);
  const rows = Math.ceil(keys.length / columns);

  return [
    keys.map(id => [ENTITY, id]),
    { rows, columns },
  ];
});

const _getTerrainData = memoize(function(tileset, columns, setIndex) {
  const terrains = Object.keys(tileset.terrains);
  const rows = Math.ceil(terrains.length / columns);

  return [
    [...Array(terrains.length)].map((_, i) => [setIndex, terrains[i]]),
    { rows, columns },
  ];
});

export default compose(
  connect(state => ({
    name: state.app.name,
    maps: state.app.maps,
    tile: state.app.tile,
    entities: state.app.entities,
    tilesets: state.app.tilesets,

    layers: state.tilemap.layers,

    basepath: state.global.basepath,

    selectedMap: state.global.selectedMap,

    selectedTile: state.global.selectedTile,
    selectedShape: state.global.selectedShape,
  })),
  withRouter,
)(component);
