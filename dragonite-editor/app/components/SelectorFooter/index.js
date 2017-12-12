import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'

import { throttle } from 'lodash';

import {
  EMPTY,
} from 'utils/constants';

import {
  Tile,
  InlineSVG,
  Button,
} from 'components';

import {
  writeFile,
  selectTile,
  selectShape,
  openFile,
  changeZoom,
  changeTilingMethod,
  changeEntityForObject,
  changeObjectDimensions,
  toggleHideGrid,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this.renderTile = this.renderTile.bind(this);
    this.renderObject = this.renderObject.bind(this);
  }

  renderTile() {
    const {
      hideGrid,
      selectedAction,

      handleClear,
      handleGrid,
      handleChangeTileMethod,
    } = this.props;

    return (
      <div className="actions">
        <div className="left">
          <div className="clear" onClick={handleClear}>
            <InlineSVG className={styles.icon} icon="cross" /> Clear tile selection
          </div>
          <div className="clear" onClick={handleGrid}>
            <InlineSVG className={ hideGrid && styles.selectedIcon } icon="page-break" />
            {hideGrid ? 'Show' : 'Hide' } grid
          </div>
        </div>
        <div className="middle">
          <a onClick={() => handleChangeTileMethod('put')}>
            <InlineSVG icon="pencil" className={ selectedAction === 'put' && styles.selectedIcon } />
          </a>
          <a onClick={() => handleChangeTileMethod('paint')}>
            <InlineSVG icon="drop" className={ selectedAction === 'paint' && styles.selectedIcon } />
          </a>
        </div>
      </div>
    )
  }

  renderObject() {
    const {
      entities,
      layers,
      selectedLayer,
      selectedObject,

      handleChangeEntity,
      handleChangeObjectDimensions,
    } = this.props;

    const layer = layers[selectedLayer];
    const object = layer.data[selectedObject] && layer.data[selectedObject][1];

    return (
      <div className="actions">
        <div className="left">

          <div>
            <span>Entity:</span>
            <select onChange={handleChangeEntity} value={object.entity}>
              <option value="" />
              {Object.entries(entities).map(([id, entity]) => {
                return (
                  <option key={id} value={id}>{entity.name}</option>
                )
              })}
            </select>
          </div>

        </div>
        <div className="middle">
          <div>
            <span>X:</span>
            <input
              type="number"
              value={object.rect.x}
              onChange={e => handleChangeObjectDimensions('x', parseInt(e.target.value))}
            />
          </div>

          <div>
            <span>Y:</span>
            <input
              type="number"
              value={object.rect.y}
              onChange={e => handleChangeObjectDimensions('y', parseInt(e.target.value))}
            />
          </div>

          <div>
            <span>W:</span>
            <input
              type="number"
              value={object.rect.w}
              onChange={e => handleChangeObjectDimensions('w', parseInt(e.target.value))}
            />
          </div>

          <div>
            <span>H:</span>
            <input
              type="number"
              value={object.rect.h}
              onChange={e => handleChangeObjectDimensions('h', parseInt(e.target.value))}
            />
          </div>

        </div>
      </div>
    )
  }

  render() {
    const {
      className,
      selectedLayer,
      selectedObject,
      layers,
      zoom,

      handleChangeZoom,
    } = this.props;

    const classes = classnames(styles.component, className);
    const layer = layers[selectedLayer];

    const leftSide = (() => {
      if (layer && layer.type === 'object') {
        if (selectedObject >= 0) return this.renderObject();
        else (<div className="actions" />);
      } else {
        return this.renderTile()
      }
    })();

    return (
      <div className={classes}>
        { leftSide }
        <div className="right">
          <div>Zoom</div>
          <input type="range" min="0" max="1" step="0.05" value={zoom} onChange={handleChangeZoom} />
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      entities: state.app.entities,
      layers: state.tilemap.layers,
      selectedLayer: state.global.selectedLayer,
      selectedObject: state.global.selectedObject,
      selectedAction: state.global.selectedAction,
      zoom: state.global.zoom,
      hideGrid: state.global.hideGrid,
    }),

    dispatch => ({
      handleGrid: () => dispatch(toggleHideGrid()),
      handleChangeTileMethod: (value) => dispatch(changeTilingMethod(value)),
      handleChangeZoom: (e) => dispatch(changeZoom(e.target.value)),
      handleChangeEntity: (e) => {
        dispatch(changeEntityForObject(e.target.value));
      },
      handleChangeObjectDimensions: throttle((property, value) => {
        dispatch(changeObjectDimensions(property, value));
      }, 150, { loading: true}),
      handleClear: () => {
        dispatch(selectTile({setIndex: EMPTY, tileIndex: 0}));
        dispatch(selectShape(1, 1));
      }
    }),
  ),
  withRouter,
)(component);
