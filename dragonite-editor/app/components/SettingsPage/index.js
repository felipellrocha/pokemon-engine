import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'
import classnames from 'classnames';

import {
  Sidebar,
  InlineSVG,
  SelectorFooter,
} from 'components';

import {
  changeGameName,
  changeTileWidth,
  changeTileHeight,
  changeGridColumns,
  changeGridRows,
  changeMap,
  changeInitialMap,
  createMap,
  updateMapName,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this.goBack = this.goBack.bind(this);
  }

  goBack() {
    const {
      history,
    } = this.props;

    history.goBack();
  }

  render() {
    const {
      gameName,
      tile,
      grid,
      maps,
      initialMap,
      selectedMap,

      selectMap,
      createNewMap,
      updateMapName,
      changeInitialMap,
      changeGameName,
      changeTileWidth,
    } = this.props;

    return (
      <div>
        <Sidebar />
        <div className={styles.component} >
          <h3>
            <span>Settings</span>
            <InlineSVG className="close" icon="cross" onClick={this.goBack} />
          </h3>
          <div className="form">
            <div className="input">
              <label>Game Name</label>
              <input type="text" value={ gameName } onChange={event => changeGameName(event.target.value)} />
            </div>
            <div className="input">
              <label>Tiles</label>
            </div>
            <div className="input-row">
              <div className="input">
                <label>Width</label>
                <input type="number" value={ tile.width } onChange={event => changeTileWidth(event.target.value)} />
              </div>
              <div className="input">
                <label>Height</label>
                <input type="number" value={ tile.height } onChange={event => changeTileHeight(event.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input">
                <label>Maps</label>
              </div>
              <div className="input list">
                {maps.map((m, i) => {
                  const classes = classnames('map', {
                    'selected': selectedMap === i,
                  });

                  return (
                    <div key={m.id} className={classes} onClick={() => selectMap(i)}>
                      <input value={m.name} onChange={event => updateMapName(i, event.target.value)} />
                    </div>
                  );
                })}
                <div className="map add" onClick={createNewMap}>
                  <div>Add another map</div>
                  <InlineSVG icon="plus-circle" />
                </div>
              </div>
            </div>
            <div className="input-row">
              <div className="input">
                <label>Initial map</label>
                <select value={initialMap} onChange={event => changeInitialMap(event.target.value)}>
                  {maps.map((m, i) => {
                    const classes = classnames('map', {
                      'selected': selectedMap === i,
                    });

                    return (<option value={i}>{m.name}</option>);
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      gameName: state.app.name,
      tile: state.app.tile,
      maps: state.app.maps,
      initialMap: state.app.initialMap,
      selectedMap: state.global.selectedMap,
    }),
    dispatch => ({
      updateMapName: (index, value) => dispatch(updateMapName(index, value)),
      createNewMap: () => dispatch(createMap()),
      selectMap: (index) => dispatch(changeMap(index)),
      changeInitialMap: (index) => dispatch(changeInitialMap(index)),
      changeGameName: (value) => dispatch(changeGameName(value)),
      changeTileWidth: (width) => dispatch(changeTileWidth(width)),
      changeTileHeight: (height) => dispatch(changeTileHeight(height)),
    })
  ),
  withRouter,
)(component);
