import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';
import styles from './styles.css';

import {
  putDownObject,
  selectObject,
} from 'actions';

import {
  makeRect,
} from 'utils';

class EntityComponent extends Component {
  render() {
    const {
      id,
      rect,
      index,
      entity: entityId,
      disableMouseEvents,
      selectedObject,
      entities,

      handleSelectObject,
    } = this.props;
    
    const style = {
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
    };

    if (disableMouseEvents) rect['pointerEvents'] = 'none';

    const classes = classnames('object', {
      selected: selectedObject === index,
    });

    const entity = entities[entityId];

    return (
      <div
        style={style}
        className={classes}
        onClick={handleSelectObject}
      >
        {entity && entity.name}
      </div>
    )
  }
}

const Entity = connect(
  (state) => ({
    entities: state.app.entities,
    selectedObject: state.global.selectedObject,
  }),
  (dispatch, props) => ({
    handleSelectObject: (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      dispatch(selectObject(props.index))
    },
  }),
)(EntityComponent);

class Objects extends PureComponent {
  constructor(props) {
    super(props);

    this.onMouseMove = this.onMouseMove.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.state = {
      mouseDown: false,
      initial: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
    }
  }

  onMouseMove(e) {
    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    this.setState({
      end: {
        x,
        y,
      }
    });
  }

  onMouseDown(e) {
    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    this.setState({
      mouseDown: true,
      initial: {
        x,
        y,
      },
      end: {
        x,
        y,
      }
    });

  }

  onMouseUp(e) {
    const {
      dispatch,
    } = this.props;

    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    this.setState({
      mouseDown: false,
      end: {
        x,
        y,
      }
    });

    dispatch(putDownObject(this.state.initial, {x, y}));
  }

  render() {
    const {
      grid,
      tile,
      layer,

      selectedLayer,
      selectedObject,
      className,
    } = this.props;

    const {
      mouseDown,
      initial,
      end,
    } = this.state;

    const style = {
      width: grid.columns * tile.width,
      height: grid.rows * tile.height,
    };

    const selectionRect = { };

    if (mouseDown) {
      const {
        x, y, w, h
      } = makeRect(initial, end);

      selectionRect.top = y;
      selectionRect.left = x;

      selectionRect.width = w;
      selectionRect.height = h;
    }

    const classes = classnames(styles.component, className);

    return (
      <div
        style={style}
        className={classes}

        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
      >
        {mouseDown && <div className="selection" style={selectionRect} />}
        {layer.data.map(([setIndex, entity], index) =>
          (<Entity {...entity} index={index} key={entity.id} disableMouseEvents={mouseDown} />)
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    tile: state.app.tile,
    selectedLayer: state.global.selectedLayer,
  })
)(Objects);
