require('./Errors.scss');

const React = require('react');
const { arrayOf, string, oneOfType, object } = React.PropTypes;

const MirageErrors = React.createClass({
  propTypes: {
    errorMessages: arrayOf(oneOfType([ string, object ])).isRequired,
  },

  render() {
    if (!this.props.errorMessages.length) {
      return null;
    }

    return (
      <div className="mirage-errors">
        {this.props.errorMessages.map(this.renderError)}
      </div>
    );
  },

  renderError(_e) {
    const error = typeof _e === 'string' ? { message: _e } : _e;

    return (
      <div key={error.message} className="mirage-errors__error">
        {error.message}
        {error.stack && (
          <pre>{error.stack}</pre>
        )}
      </div>
    )
  }
});

module.exports = MirageErrors;
