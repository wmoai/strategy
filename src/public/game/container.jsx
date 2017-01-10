const React = require('react');
const ReactDOM = require('react-dom');
import MicroContainer from 'react-micro-container';

const socketIOClient = require('socket.io-client');
const socket = socketIOClient('/game');

const Preparation = require('./preparation.jsx');
const UnitSymbol = require ('./unitSymbol.jsx');
const Refunit = require('./refunit.jsx');
const Result = require('./Result.jsx');

const Client = require('./core/Client.js');
const Klass = require('./core/Klass.js');

class Container extends MicroContainer {
  constructor(props) {
    super(props);

    const gid = document.getElementById('gid').value;
    this.state = {
      client: new Client(gid, socket),
      prep: {
        show: false,
        klasses: null,
        sortie: []
      },
      info: {},
      winner: undefined
    };

    socket.on('mirror', data => {
      console.log(data);
      this.setState({
        client: this.state.client.mirror(data)
      });
    });
    socket.on('pnum', pnum => {
      this.setState({
        client: this.state.client.setPnum(pnum)
      });
    });
    socket.on('preparation', data => {
      const klasses = {};
      Object.keys(data.klassList).forEach(klassId => {
        klasses[klassId] = new Klass(data.klassList[klassId]);
      });
      const prep = this.state.prep;
      prep.show = true;
      prep.klasses = klasses;
      this.setState({
        prep: prep
      });
    });
    socket.on('completeAction', data => {
      this.setState({
        client: this.state.client.mirror(data, true)
      });
    });
    socket.on('winner', pnum => {
      console.log(pnum, this.state.client.pnum);
      this.setState({
        winner: pnum
      });
    });

  }
  componentDidMount() {
    this.subscribe({
      addSortie: this.handleAddSortie,
      removeSortie: this.handleRemoveSortie,
      makeSortie: this.handleMakeSortie,
      selectCell: (cellId) => {
        this.setState({
          game: this.state.client.selectCell(cellId)
        });
      },
      hoverCell: this.handleHoverCell,
      returnPortal: this.handleReturnPortal
    });
  }
  handleAddSortie(index) {
    if (this.state.client.game.size <= this.state.prep.sortie.length) {
      return;
    }
    const prep = this.state.prep;
    prep.sortie.push(index);
    this.setState({
      prep: prep
    });
  }
  handleRemoveSortie(index) {
    const prep = this.state.prep;
    prep.sortie.splice(index, 1);
    this.setState({
      prep: prep
    });
  }
  handleMakeSortie() {
    const prep = this.state.prep;
    if (prep.sortie.length == 0 || prep.sortie.length > this.state.client.game.size) {
      return;
    }
    socket.emit('prepared', prep.sortie);
    prep.show = false;
    this.setState({
      prep: prep
    });
  }

  handleHoverCell(cellId) {
    this.setState({
      info: {
        unit: this.state.client.unit(cellId)
      }
    });
  }
  handleReturnPortal() {
    location.href= window.location.origin;
  }

  render() {
    const game = this.state.client.game;
    const field = game.map.field;
    if (!field) {
      return (
        <div>ロード中</div>
      );
    }
    const units = game.map.units;
    const info = this.state.info;
    const movable = this.state.client.mask.movable || {};
    const actionable = this.state.client.mask.actionable || {};

    let preparation = null;
    if (this.state.prep.show) {
      preparation = (
        <Preparation
          dispatch={this.dispatch}
          klasses={this.state.prep.klasses}
          size={game.size}
          sortie={this.state.prep.sortie}/>
      );
    }
    return (
      <div>
        <Result
          dispatch={this.dispatch}
          winner={this.state.winner}
          mypnum={this.state.client.pnum}
        />
        {preparation}
        <table id="field">
          <tbody>
            {field.rows().map((row, y) => {
              return (
                <tr key={y}>
                  {row.map((cell, x) => {
                    const cellId = field.cellId(y, x);
                    let maskClasses = ['overlay'];
                    if (movable[cellId] != undefined) {
                      maskClasses.push('movable');
                    } else if (actionable[cellId]) {
                      if (this.state.client.forcusedUnit.klass.healer) {
                        maskClasses.push('healable');
                      } else {
                        maskClasses.push('attackable');
                      }
                    }
                    let cellClasses = [];
                    if (cell == 1) {
                      cellClasses.push('plains');
                    } else if (cell == 2) {
                      cellClasses.push('forest');
                    } else if (cell == 3) {
                      cellClasses.push('mountain');
                    } else if (cell == 9) {
                      cellClasses.push('water');
                    }
                    return (
                      <td
                        className={cellClasses.join(' ')}
                        key={x}
                        onClick={() => {this.dispatch('selectCell', cellId);}}
                        onMouseOver={() => {this.dispatch('hoverCell', cellId);}}
                      >
                        <div className={maskClasses.join(' ')}></div>
                        <UnitSymbol
                          unit={units[cellId]}
                          pnum={this.state.client.pnum} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <Refunit unit={info.unit} />
      </div>
    );
  }
}

window.onload = () => {
  ReactDOM.render(
    React.createElement(Container),
    document.querySelector('#contents')
  );
};
