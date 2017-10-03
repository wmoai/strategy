import { connect } from 'react-redux';
import Component from '../components/App.jsx';

const mapStateToProps = state => {
  return {
    client: state.client
  };
};

const App = connect(
  mapStateToProps,
)(Component);

export default App;
