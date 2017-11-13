import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize, throttle } from 'lodash';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'

import path from 'path';

import {
  AnimationSidebar,
  AnimationFooter,
} from 'components';

import {
  moveSprite,
  createKeyframe,
} from 'actions';

import { getFrame } from 'utils';

import styles from './styles.css';

class AnimationPage extends Component {
  constructor(props) {
    super(props);
    
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.moveSprite = throttle(this.moveSprite.bind(this), 50, { leading: true });
    this.getAnimationAndFrame = this.getAnimationAndFrame.bind(this);
    this.state = {
      mouseDown: false,
    };
    this.initialCoords = {
      x: 0,
      y: 0,
    };
  }

  getAnimationAndFrame() {
    const {
      selectedAnimation,
      selectedFrame,
      animations,
    } = this.props;

    const animation = animations[selectedAnimation];
    if (!animation) return { animation: null, frame: null };

    const frame = getFrame(animation.keyframes, selectedFrame);
    if (!frame) return { animation, frame: null };

    return { animation, frame };
  }

  onMouseDown(event) {
    const { animation, frame } = this.getAnimationAndFrame();
    if (!animation || !frame) return null;

    const {
      offsetX: x,
      offsetY: y,
    } = event.nativeEvent;

    if (
      (x < frame.x || x > frame.x + frame.w) ||
      (y < frame.y || y > frame.y + frame.h)
    ) return null;

    this.setState({
      mouseDown: true,
    });
    
    this.initialCoords = { x, y };
  }

  onMouseUp() {
    this.setState({
      mouseDown: false,
    });
  }

  onMouseMove(event) {
    event.persist();

    this.moveSprite(event);
  }

  moveSprite(event) {
    if (!this.state.mouseDown && event.type !== 'click') return

    const {
      offsetX: x_1,
      offsetY: y_1,
    } = event.nativeEvent;

    const x_d = x_1 - this.initialCoords.x
    const y_d = y_1 - this.initialCoords.y;
    
    this.initialCoords = { x: x_1, y: y_1 };

    const {
      dispatch,
    } = this.props;

    const { animation, frame } = this.getAnimationAndFrame();

    if (!animation) return;

    const coord = {
      x: parseInt(frame.x + x_d),
      y: parseInt(frame.y + y_d),
    };

    dispatch(moveSprite(coord));
  }

  renderFrame() {
    const {
      sheets,
      basepath,
      tile,
    } = this.props;

    const { animation, frame } = this.getAnimationAndFrame();
    if (!animation || !frame) return null;

    const sheet = sheets[animation.spritesheet];
    const src = path.resolve(basepath, sheet.src);

    const sheetStyle = {
      background: `url(${src}) no-repeat`,
      position: 'relative',
      height: sheet.rows * tile.height,
      width: sheet.columns * tile.width,
    };

    const frameStyle = {
      position: 'absolute',
      top: `${frame.y}px`,
      left: `${frame.x}px`,
      width: frame.w,
      height: frame.h,
      border: '1px dotted #aaa',
      pointerEvents: 'none',
    };


    return (
      <div
        style={sheetStyle}

        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <div style={frameStyle} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <AnimationSidebar />
        <div className={styles.component}>
          {this.renderFrame()}
        </div>
        <AnimationFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedAnimation: state.global.selectedAnimation,
  selectedFrame: state.global.selectedFrame,
  tile: state.app.tile,
  animations: state.app.animations,
  sheets: state.app.tilesets,
  basepath: state.global.basepath,
}); 

export default compose(
  connect(mapStateToProps),
  withRouter,
)(AnimationPage);
