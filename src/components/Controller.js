require('./Controller.scss');
const React = require('react');
const $ = require('jquery');
const { ajax } = $;
const AVAILABLE_PROFILES = [
  {
    id: 'react',
    name: 'React Component',
    default: true,
  },
  {
    id: 'react-router',
    name: 'React Route Handler'
  }
];

const { string } = React.PropTypes;
const MirageController = React.createClass({
  propTypes: {
    activeModule: string,
    paramsFile: string,
    subjectPath: string,
  },

  getInitialState() {
    return {
      visible: !this.props.subject && !this.props.subjectPath,
      fileList: null,
      fileListFilter: this.props.subjectPath || '',
      selectedModule: this.props.subjectPath || null,
      selectedProfile: null,
      paramSource: this.props.paramsFile ? 'file' : 'inline',
    };
  },

  componentDidMount() {
    this.loadAvailableFiles();
    document.addEventListener('keydown', this.toggle, false);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.paramsFile) {
      this.setState({ paramSource: 'file' });
    }
  },

  componentDidUpdate() {
    if (this.state.fileListFilter.length === 0 && this.state.selectedModule) {
      this.setState({ selectedModule: null });
    }

    $('#application').toggleClass('mirage-application--hidden', this.isVisible());
  },

  componentWillUnmount() {
    document.removeEventListener('keydown', this.toggle, false);
  },

  render() {
    if (!this.isVisible()) {
      return null;
    }

    return (
      <form className="mirage-controller" onSubmit={this.activateModule}>
        <h3>Runner Configuration</h3>

        <fieldset>
          <label>Search for a module:
            {' '}
            <input
              type="text"
              onChange={this.filterModuleList}
              value={this.state.fileListFilter}
              autoFocus
            />
          </label>

          {this.state.fileListFilter.length > 0 && this.state.fileList && (
            <div>
              <h4>Module List</h4>
              <select size={10} onChange={this.trackCandidateModule}>
                {getMatchingFiles(this.state.fileList, this.state.fileListFilter, 30).map(this.renderFile)}
              </select>
            </div>
          )}
        </fieldset>

        <fieldset>
          <label>Profile:{' '}
            <select onChange={this.trackProfile} value={this.state.selectedProfile}>
              {AVAILABLE_PROFILES.map(this.renderProfileOption)}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <div>
            Parameters:
            {' '}
            <label>
              <input
                type="radio"
                name="paramSource"
                value="file"
                checked={this.state.paramSource === 'file'}
                onChange={this.trackParamSource}
              /> From file
            </label>

            {' '}

            <label>
              <input
                type="radio"
                name="paramSource"
                value="inline"
                checked={this.state.paramSource === 'inline'}
                onChange={this.trackParamSource}
              /> Inline
            </label>
          </div>

          {this.state.paramSource === 'inline' && (
            <textarea ref="params" placeholder="JSON parameters go here" />
          )}

          {this.state.paramSource === 'file' && (
            <input
              ref="params"
              type="text"
              placeholder="path/to/js/file.js"
              defaultValue={this.props.paramsFile}
            />
          )}
        </fieldset>

        <div className="mirage-controller__actions">
          <button type="submit" onClick={this.activateModule} disabled={!this.canActivateModule()}>
            Activate Module
          </button>

          <button onClick={this.loadAvailableFiles}>
            {this.state.fileList === null ?
              "Load Available Modules" :
              "Reload Available Modules"
            }
          </button>
        </div>
      </form>
    );
  },

  renderFile(filePath) {
    return (
      <option key={filePath} value={filePath}>{filePath}</option>
    );
  },

  renderProfileOption(profile) {
    return (
      <option key={profile.id} value={profile.id} default={profile.default}>{profile.name}</option>
    );
  },

  toggle(e) {
    if (!e.defaultPrevented && (e.keyCode || e.which) === 112) {
      e.preventDefault();

      this.setState({ visible: !this.state.visible });
    }
  },

  isVisible() {
    return (!this.props.subject && !this.props.subjectPath) || this.state.visible === true;
  },

  filterModuleList(e) {
    this.setState({ fileListFilter: e.target.value });
  },

  trackCandidateModule(e) {
    this.setState({ selectedModule: e.target.value });
  },

  trackProfile(e) {
    this.setState({ selectedProfile: e.target.value });
  },

  trackParamSource(e) {
    this.setState({ paramSource: e.target.value });
  },

  canActivateModule() {
    const { selectedModule } = this.state;

    return (
      selectedModule &&
      selectedModule.length > 0
    );
  },

  activateModule(e) {
    e.preventDefault();

    if (!this.canActivateModule()) {
      return;
    }

    ajax({
      url: '/mirage/activate',
      type: 'POST',
      data: JSON.stringify({
        filePath: this.state.selectedModule,
        profile: this.state.selectedProfile || AVAILABLE_PROFILES.filter(x => x.default)[0].id,
        params: this.state.paramSource === 'inline' ? this.refs.params.value : undefined,
        paramsFile: this.state.paramSource === 'file' ? this.refs.params.value : undefined,
      })
    }).then(() => {
      if (this.isMounted() && this.isVisible()) {
        this.setState({ visible: false });
      }
    });
  },

  loadAvailableFiles() {
    ajax({
      url: '/mirage/ls',
      type: 'GET'
    }).then(fileList => {
      this.setState({ fileList: fileList.sort() });
    }, () => {
      window.alert("Unable to load module listing!");
    });
  }
});

function getMatchingFiles(list, _filter, limit) {
  const filter = _filter.toLowerCase();
  return list.filter(x => x.toLowerCase().indexOf(filter) > -1).slice(0, limit);
}

module.exports = MirageController;
