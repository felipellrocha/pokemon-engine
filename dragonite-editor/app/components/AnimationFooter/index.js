import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'

import {
  InlineSVG,
  Button,
  Dialog,
} from 'components';

import {
  selectFrame,
  deleteKeyframe,
} from 'actions';

import { getFrame } from 'utils';

import styles from './styles.css';
import button from 'components/Button/styles.css';

class AnimationFooter extends Component {
  constructor(props) {
    super(props);

    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleContextMenu = this.toggleContextMenu.bind(this);
    this.isKeyframe = this.isKeyframe.bind(this);
    this.animate =  this.animate.bind(this);

    this.animation = null;
    this.state = {
      animating: false,
      contextIndex: -1,
    };
  }

  animate() {
    const {
      selectedFrame,
      selectedAnimation,
      animations,
      dispatch,
    } = this.props;

    const animation = animations[selectedAnimation];
    if (!animation) return;

    dispatch(selectFrame((selectedFrame + 1) % animation.numberOfFrames));
  }

  toggleContextMenu(index, event) {
    event.preventDefault();

    this.setState(state => ({
      contextIndex: index,
    }));
  }

  toggleAnimation() {
    if (this.state.animating) {
      clearInterval(this.animation);
    }
    else {
      this.animation = setInterval(this.animate, 1000 / 60);
    }

    this.setState(state => ({
      animating: !state.animating,
    }));
  }

  isKeyframe(index) {
    const {
      animations,
      selectedAnimation,
    } = this.props;

    const animation = animations[selectedAnimation];

    if (!animation) return false;

    const keyframe = animation.keyframes[index];

    return !!(keyframe);
  }

  render() {
    const {
      animations,
      selectedAnimation,
      selectedFrame,
      animating,

      deleteKeyframe,
      selectFrame,
      animate,
    } = this.props;
    
    const animation = animations[selectedAnimation];
    const frame = animation ? getFrame(animation.keyframes, selectedFrame) : undefined;

    const frameCount = (animation && animation.numberOfFrames) ? animation.numberOfFrames : 0;

    const classes = classnames(styles.component);

    const arr = [...Array(frameCount)];

    return (
      <div className={classes}>
        <div className="left">
          <InlineSVG className={animating && 'animating'} icon="play" onClick={this.toggleAnimation} />
          <div className="frames">
            {arr.map((_, i) => {
              const classes = classnames('frame', {
                keyframe: !!(animation.keyframes[i]),
                selected: i === selectedFrame,
              });

              return (
                <div
                  key={i}
                  className={classes}
                  onClick={() => selectFrame(i)}
                  onContextMenu={event => this.toggleContextMenu(i, event)}
                >
                  <div className="indicator" />
                </div>
              )
            })}
          </div>
        </div>
        <Dialog
          visible={this.state.contextIndex >= 0}
          onCancel={event => this.toggleContextMenu(-1, event)}
        >
          <div className="menu">
            <Button
              onClick={() => {
                deleteKeyframe(this.state.contextIndex);
                this.toggleContextMenu(-1, event);
              }}
              className={classnames(button.full, button.frame)}
              disabled={!this.isKeyframe(this.state.contextIndex)}
            >
              Delete keyframe
            </Button>
          </div>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  animations: state.app.animations,

  selectedAnimation: state.global.selectedAnimation,
  selectedFrame: state.global.selectedFrame,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  deleteKeyframe: (index) => dispatch(deleteKeyframe(index)),
  selectFrame: (index) =>  dispatch(selectFrame(index)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
)(AnimationFooter);
