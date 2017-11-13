import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom'

import path from 'path';

import { memoize } from 'lodash';

import { getFrame } from 'utils';

import {
  moveSprite,
  selectSpriteSheets,
  addAnimation,
  selectAnimation,
  changeAnimationName,
  changeAnimationSpritesheet,
  changeAnimationFrameLength,
} from 'actions';

import {
  InlineSVG,
  Button,
  Dialog,
} from 'components';

import styles from './styles.css';

class AnimationSidebar extends PureComponent {
  constructor(props) {
    super(props);

    this.getAnimationAndFrame = this.getAnimationAndFrame.bind(this);
    this.state = {
      dialogIsOpen: false,
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

  toggleDialog() {
    this.setState(state => ({
      dialogIsOpen: !state.dialogIsOpen,
    }))
  }

  render() {
    const {
      sheets,
      animations,
      selectedAnimation,
      basepath,

      addAnimation,
      selectAnimation,
      changeAnimationName,
      changeAnimationSpritesheet,
      changeAnimationFrameLength,

      changeX,
      changeY,
      changeW,
      changeH,
    } = this.props;

    const { animation, frame } = this.getAnimationAndFrame();

    let sheetSource = null;
    let previewStyle = {};
    
    if (animation && frame) {
      sheetSource = path.resolve(basepath, sheets[animation.spritesheet].src);
      previewStyle = {
        background: `url(${sheetSource}) no-repeat`,
        width: frame.w,
        height: frame.h,
        backgroundPosition: `${-frame.x}px ${-frame.y}px`,
      };
    }

    return (
      <div className={styles.component}>
        <h1>Animations</h1>
        <div className="animations separator">
          <h3>Animations</h3>
          {Object.keys(animations).map((key, i) => {
            const animation = animations[key];

            const classes = classnames('animation', {
              selected: selectedAnimation === key,
            });

            return (
              <div
                className={classes}
                key={animation.id}
                onClick={() => selectAnimation(key)}
              >
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={key}
                    onChange={event => changeAnimationName(key, event.target.value)}
                  />
                </div>
                <div>
                  <label>Frame length:</label>
                  <input
                    type="number"
                    value={animation.numberOfFrames}
                    onChange={event => changeAnimationFrameLength(key, event.target.value)}
                  />
                </div>
                <div>
                  <label>Sheet:</label>
                  <select
                    type="select"
                    value={animation.spritesheet}
                    onChange={event => changeAnimationSpritesheet(key, event.target.value)}
                  >
                    {sheets.map((sheet, i) => {
                      return (<option key={sheet.src} value={i}>{sheet.name}</option>);
                    })}
                  </select>
                </div>
              </div>
            )
          })}
          <div className="animation add" onClick={this.toggleDialog}>
            <div>Add another animation</div>
            <InlineSVG icon="plus-circle" />
          </div>
        </div>
        {(animation && frame) &&
          <div className="frame">
            <div>X: <input type="number" value={frame.x} onChange={changeX} /></div>
            <div>Y: <input type="number" value={frame.y} onChange={changeY} /></div>
            <div>Width: <input type="number" value={frame.w} onChange={changeW} /></div>
            <div>Height: <input type="number" value={frame.h} onChange={changeH} /></div>
          </div>
        }
        {sheetSource &&
          <div className="preview">
            <h2>Preview</h2>
            <div style={previewStyle} />
          </div>
        }
        <Dialog
          visible={this.state.dialogIsOpen}
          onContinue={addAnimation}
          onCancel={this.toggleDialog}
        >
          What is the name of the animation?
          <input type="text" autoFocus ref={input => { this.animationName = input; }} />
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  sheets: state.app.tilesets,
  animations: state.app.animations,
  selectedAnimation: state.global.selectedAnimation,
  selectedFrame: state.global.selectedFrame,
  basepath: state.global.basepath,
});

const mapDispatchToProps = (dispatch) => ({
  changeAnimationFrameLength: (name, value) => dispatch(changeAnimationFrameLength(name, value)),
  changeAnimationName: (name, value) => dispatch(changeAnimationName(name, value)),
  changeAnimationSpritesheet: (name, value) => dispatch(changeAnimationSpritesheet(name, value)),
  selectAnimation: (name) => dispatch(selectAnimation(name)),
  addAnimation: () => {
    const name = this.animationName.value;

    if (!name) return;

    dispatch(addAnimation(name));

    this.setState(state => ({
      dialogIsOpen: false,
    }))
    this.animationName.value = "";
  },
  changeX: (event) => {
    const value = event.target.value;
    const coord = { x: parseInt(value) };
    dispatch(moveSprite(coord));
  },
  changeY: (event) => {
    const value = event.target.value;
    const coord = { y: parseInt(value) };
    dispatch(moveSprite(coord));
  },
  changeW: (event) => {
    const value = event.target.value;
    const coord = { w: parseInt(value) };
    dispatch(moveSprite(coord));
  },
  changeH: (event) => {
    const value = event.target.value;
    const coord = { h: parseInt(value) };
    dispatch(moveSprite(coord));
  },
});


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
)(AnimationSidebar);
