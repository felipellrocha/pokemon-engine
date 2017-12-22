import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import classnames from 'classnames';

import {
  Form,
  InlineSVG,
} from 'components';

import {
  receiveComponent,
  changeEntityName,
  changeComponentValue,
  removeComponent,
} from 'actions';

import styles from './styles.css';

class Entity extends PureComponent {
  constructor(props) {
    super(props);

    this.dragEnter = this.dragEnter.bind(this);
    this.dragLeave = this.dragLeave.bind(this);
    this.drop = this.drop.bind(this);

    this.state = {
      dragOver: false,
      open: false,
    };
  }

  dragOver(event) {
    event.preventDefault();

    event.dataTransfer.dropEffect = 'move';

    return false
  }
  
  dragEnter() {
    this.setState({dragOver: true})
  }

  dragLeave() {
    this.setState({dragOver: false})
  }

  drop(event) {
    const {
      receiveComponent,
    } = this.props;

    this.setState({
      dragOver: false,
      open: true,
    })
    const component = JSON.parse(event.nativeEvent.dataTransfer.getData('text/plain'));
    receiveComponent(component);
  }

  render() {
    const {
      index,
      entities,

      changeComponentValue,
      changeEntityName,
      removeComponent,
    } = this.props;

    const entity = entities[index];

    const classes = classnames(styles.component, {
      'over': this.state.dragOver,
    });

    return (
      <div
        key={index}
        className={classes}
        onDragOver={this.dragOver}
        onDragEnter={this.dragEnter}
        onDragLeave={this.dragLeave}
        onDrop={this.drop} 
      >
        <div className="header" onClick={() => this.setState((state) => ({open: !state.open}))}>
          <input
            className="name"
            value={ entity.name }
            onChange={changeEntityName}
          />
          <div>
            {this.state.open ? 
              <InlineSVG icon="chevron-up" /> :
              <InlineSVG icon="chevron-down" />
            }
          </div>
        </div>
        {this.state.open &&
          <div className="components">
            {entity.components.map((component, i) => {
              return (
                <div key={component.name} className="component">
                  <div className="header">
                    <div className="name">{ component.name }</div>
                    <InlineSVG icon="cross" onClick={() => removeComponent(i)} />
                  </div>
                  <Form
                    fields={component.members}
                    onChange={change => changeComponentValue(i, change.index, change.value)}
                  />
                </div>
              )
            })}
          </div>
        }
      </div>
    )
  }
}

Entity.defaultProps = {
  handleClose: () => { },
};

export default connect(
  state => ({
    entities: state.app.entities,
  }),
  (dispatch, props) => ({
    changeEntityName: (event) => dispatch(changeEntityName(props.index, event.target.value)),
    receiveComponent: (component) => dispatch(receiveComponent(props.index, component)),
    changeComponentValue: (i, j, value) => dispatch(changeComponentValue(props.index, i, j, value)),
    removeComponent: (i) => dispatch(removeComponent(props.index, i)),
  })
)(Entity);

