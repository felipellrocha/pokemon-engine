import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';

import styles from './styles.css';

import parser from 'parser/script.peg';
import renderer from 'parser/script.js';

import {
  ScriptDraft,
} from 'components';


class Form extends PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.renderArray = this.renderArray.bind(this);
    this.renderObject = this.renderObject.bind(this);
    this.renderInput = this.renderInput.bind(this);
  }

  handleChange(value, field, i) {
    const {
      onChange,
    } = this.props;

    const v = (field.type == 'int') ? parseInt(value) : value;
    
    if (onChange) onChange({
      field,
      value: v,
      index: i,
    });
  }

  renderInput(field, i) {
    const {
      tilesets,
      animations,
    } = this.props;

    if (field.type === 'int') {
      const value = field.value ? field.value : 0;
      return (
        <div className="value">
          <input
            type="number"
            value={value}
            onChange={event => this.handleChange(event.target.value, field, i)}
          />
        </div>
      );
    }
    else if (field.type === 'AbilityList') {
    }
    else if (field.type === 'bool') {
      const value = (field.value) ? field.value : false;
      return (
        <div className="value">
          <input
            type="checkbox"
            checked={value}
            onChange={event => this.handleChange(!field.value, field, i)}
          />
        </div>
      );
    }
    else if (field.type === 'AnimationType') {
      const value = field.value ? parseInt(field.value) : 0;
      return (
        <div className="value">
          <select value={value} onChange={event => this.handleChange(parseInt(event.target.value), field, i)}>
            { animations.map((animation, index) => {
              return (
                <option key={animation.id} value={index}>{animation.name}</option>
              );
            })}
          </select>
        </div>
      )
    }
    else if (field.type === 'TextureSource') {
      const value = field.value ? parseInt(field.value) : 0;
      return (
        <div className="value">
          <select value={value} onChange={event => this.handleChange(parseInt(event.target.value), field, i)}>
            { tilesets.map((tileset, index) => {
              return (
                <option key={tileset.src} value={index}>{tileset.name}</option>
              );
            })}
          </select>
        </div>
      )
    }
    else if (field.type === 'ResolverType') {
      const value = field.value ? parseInt(field.value) : 0;
      return (
        <div className="value">
          <div>
            <span>character:</span>
            <input type="checkbox" checked={field.value & 2} onChange={event => {
              this.handleChange(toggleBit(field.value, 2), field, i)
            }} />
          </div>
          <div>
            <span>attack:</span>
            <input type="checkbox" checked={field.value & 4} onChange={event => {
              this.handleChange(toggleBit(field.value, 4), field, i)
            }} />
          </div>
          <div>
            <span>wall:</span>
            <input type="checkbox" checked={field.value & 8} onChange={event => {
              this.handleChange(toggleBit(field.value, 8), field, i)
            }} />
          </div>
        </div>
      )
    }
    else if (field.type === 'point') {
      const value = field.value ? field.value : {
        x: 0,
        y: 0,
      };
      return (
        <div className="value">
          <div>
            <span>X:</span>
            <input
              type="number"
              value={ value.x }
              onChange={event => {
                this.handleChange({
                  ...value,
                  x: parseInt(event.target.value),
                }, field, i)
              }}
            />
          </div>
          <div>
            <span>Y:</span>
            <input
              type="number"
              value={ value.y }
              onChange={event => {
                this.handleChange({
                  ...value,
                  y: parseInt(event.target.value),
                }, field, i)
              }}
            />
          </div>
        </div>
      );
    }
    else if (field.type === 'script') {
      const value = (field.value === 'nullptr' || field.value === null) ?
        [] :
        field.value;
      return (
        <ScriptDraft
          value={renderer(value)}
          onChange={text => {
            try {
              const value = parser.parse(text);
              this.handleChange(value, field, i);
            } catch(e) {}
          }}
        />
      );
    }
    else {
      return (
        <div className="value">
          <input
            type="text"
            value={field.value || ''}
            onChange={event => this.handleChange(event.target.value, field, i)}
          />
        </div>
      );
    }
  }

  renderArray() {
    const {
      fields
    } = this.props;

    return (
      <div
        className={styles.component}
      >
        {fields.map((field, i) => {
          return (
            <div className="field" key={field.name}>
              <label>
                <div><strong>{field.type}</strong></div>
                <div>{field.name}</div>
              </label>
              {this.renderInput(field, i)}
            </div>
          )
        })}
      </div>
    );
  }

  renderObject() {
    const {
      fields
    } = this.props;

    const fieldList = Object.keys(fields);

    return (
      <div
        className={styles.component}
      >
        {fieldList.map(name => {
          const field = fields[name];
          return (
            <div className="field" key={name}>
              <label>
                <div><strong>{field.type}</strong></div>
                <div>{field.name}</div>
              </label>
              {this.renderInput(field, name)}
            </div>
          )
        })}
      </div>
    );
  }

  render() {
    const {
      fields
    } = this.props;

    return Array.isArray(fields) ?
      this.renderArray() :
      this.renderObject();
  }
}

const toggleBit = (value, bit) => {
  const v = value ? parseInt(value) : 0;
  return (v & bit) ? v - bit : v + bit;
}

export default connect(
  state => ({
    tilesets: state.app.tilesets,
    animations: state.app.animations,
  }),
)(Form);
