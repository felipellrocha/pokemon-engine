import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'

import classnames from 'classnames';

import {
  Entity,
  EntitySidebar,
  InlineSVG,
  ComponentDraft,
} from 'components';

import {
  addEntity,
  receiveEntities,
} from 'actions';

import {
  Trie,
  Errors,
  DisplayErrors,
} from 'utils';

import IntervalTree from 'node-interval-tree';

import styles from './styles.css';

const renderer = (components) => {
};

class component extends PureComponent {
  state = {
    suggestions: [],
    errors: [],
    position: 0,
    types: new IntervalTree(),
  }

  addEntity = () => {
    this.props.dispatch(addEntity());
  }

  handleReceiveErrors = (errors) => {
    this.setState({
      errors,
    })
  }

  handleFinishParsing = (suggestions, types) => {
    this.setState({
      suggestions,
      types,
    })
  }

  handleChange = ({ text, position }) => {
    //console.log(text);
    this.setState({
      position,
    })
  }

  handleFullParse = (data, text) => {
    this.props.dispatch(receiveEntities(data, text));
    console.log(data);
  }

  render() {
    const {
      entities,
      text,
      tilesets,
      animations,
      addEntity,
      definitions,
      dispatch,
    } = this.props;

    const {
      suggestions,
      errors,
      types,
      position,
    } = this.state;

    const trie = new Trie();

    definitions.forEach(component => {
      trie.add(component.name, component);
    });

    const typeSearch = types.search(position, position);
    const hoveredComponent = typeSearch.filter(c => (c.area === 'component'));
    const hoveredMembers = typeSearch.filter(c => (c.area === 'member')).reduce((prev, c) => {
      prev[c.name] = c;

      return prev;
    }, {});

    return (
      <div className={styles.component}>
        <EntitySidebar />
        <div className="main">
          {/*entities.map((entity, index) => (<Entity key={entity.name} index={index} />))*/}
          <ComponentDraft
            componentTrie={trie}
            tilesets={tilesets}
            animations={animations}
            onReceiveFullParse={this.handleFullParse}
            onFinishParsing={this.handleFinishParsing}
            onReceiveErrors={this.handleReceiveErrors}
            onChange={this.handleChange}
            value={text}
          />
          {(typeSearch.length > 0) && 
            <div className="types">
              {hoveredComponent.map(component => (
                <div className="component">
                  <div className="name">{ component.name }</div>
                  <div className="members">
                    {Object.values(component.members).map(member => {
                      const classes = classnames('member', {
                        highlight: !!hoveredMembers[member.name],
                      });
                      return (
                        <div className={classes} key={ member.name }>{ member.name } : { member.type }</div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          }
          {(errors.filter(error => DisplayErrors[error]).length > 0) && 
            <div className="errors">
              {errors.map(error => {
                console.log(error);
                switch (error) {
                  case Errors.COMPONENT_NOT_FOUND: return (<div>The component you're trying to use was not found.</div>)
                  case Errors.MEMBER_OF_COMPONENT_NOT_FOUND: return (<div>The component you're trying to use does not contain that property.</div>)
                }
              })}
            </div>
          }
        </div>
     </div>
    );
  }
}

const mapStateToProps = state => ({
  entities: state.app.entities,
  animations: state.app.animations,
  text: state.global.entities,
  tilesets: state.app.tilesets,
  definitions: state.global.components,
});

export default compose(
  connect(mapStateToProps),
  withRouter,
)(component);
