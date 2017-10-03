import React from 'react';

import './Canvas.css';
import RefUnit from '../RefUnit//RefUnit.jsx';
import Forecast from '../Forecast/Forecast.jsx';

import Engine from './Engine.js';

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      cursorRenderer: null,
      unitsRenderer: null,
      rangeRenderer: null,
      lineupUIRenderer: null,
      cursorX: 0,
      cursorY: 0,
    };
    this.images = {};
  }

  async componentDidMount() {
    const { game, cellSize, isOffense } = this.props;
    const { field, units } = game;

    await Engine.preload();
    const engine = new Engine(this.pixiCanvas, field.width, field.height, cellSize);
    engine.renderTerrain(field);
    this.setState({
      initialized: true,
      cursorRenderer: engine.cursorRenderer(),
      unitsRenderer: engine.unitsRenderer(field),
      rangeRenderer: engine.rangeRenderer(field),
      lineupUIRenderer: engine.lineupUIRenderer(),
    }, () => {
      this.state.unitsRenderer.render(units);
      if (game.stateIs('BEFORE')) {
        this.state.lineupUIRenderer.renderInitialPos(field);
      }
      const myUnit = units.filter(unit => unit.offense == isOffense ).first();
      if (myUnit) {
        this.forcusCell(myUnit.cellId);
      }
    });

    // FIXME
    // window.onbeforeunload = () => {
      // return true;
    // };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.initialized) {
      return;
    }
    const { game, ui } = nextProps;
    if (game.units != this.props.game.units) {
      const { units } = nextProps.game;
      this.state.unitsRenderer.render(units);
    }

    const { field } = game;
    const { pickedCell } = ui;
    if (game.stateIs('BEFORE')) {
      // Lineup operation
      if (pickedCell) {
        if (this.props.ui.pickedCell != pickedCell) {
          const [ y, x ] = field.coordinates(pickedCell);
          this.state.lineupUIRenderer.renderPickMarker(x, y);
        }
      } else {
        this.state.lineupUIRenderer.removePickMarker();
      }
    } else {
      this.state.rangeRenderer.remove();
      this.state.rangeRenderer.render(ui);
    }

    // FIXME
    // if (game.won != undefined) {
      // window.onbeforeunload = () => {
        // return null;
      // };
    // }
  }

  forcusCell(cellId) {
    if (!this.screen) {
      return;
    }
    const { game, cellSize } = this.props;
    const x = cellId % game.field.width;
    const y = Math.floor(cellId / game.field.width);
    this.screen.scrollTop = y * cellSize - this.screen.clientHeight/2 + cellSize/2;
    this.screen.scrollLeft = x * cellSize - this.screen.clientWidth/2 + cellSize/2;
  }

  render() {
    const {
      cellSize,
      game,
      ui,
      onSelectCell,
      onHoverCell,
    } = this.props;

    const { field } = game;

    const naviStyle = {};
    if (ui.hoveredCell != null) {
      const vr = this.state.mouseY / window.innerHeight;
      const hr = this.state.mouseX / window.innerWidth;
      naviStyle[vr < 0.5 ? 'top' : 'bottom'] = 20;
      naviStyle[hr < 0.5 ? 'right': 'left'] = 20;
    }

    const width = field.width * cellSize
      , height = field.height * cellSize;
    return (
      <div id="screen-container">
        <div
          id="screen-base"
          width={width}
          height={height}
          ref={div => this.screen = div} 
          onMouseMove={e => {
            if (!this.state.initialized) {
              return;
            }
            const rect = e.target.getBoundingClientRect();
            const offsetX = e.clientX - rect.left
              , offsetY = e.clientY - rect.top;
            const y = Math.floor(offsetY / cellSize)
              , x = Math.floor(offsetX / cellSize);
            if (!field.isActiveCell(y, x)) {
              return;
            }
            this.state.cursorRenderer.render(x, y);
            this.setState({
              mouseX: e.pageX,
              mouseY: e.pageY,
            }, () => {
              const cellId = field.cellId(y, x);
              onHoverCell(cellId);
            });
          }}
          onClick={e => {
            if (onSelectCell && typeof onSelectCell === 'function') {
              const rect = e.target.getBoundingClientRect();
              const offsetX = e.clientX - rect.left
                , offsetY = e.clientY - rect.top;
              const y = Math.floor(offsetY / cellSize)
                , x = Math.floor(offsetX / cellSize);
              if (!field.isActiveCell(y, x)) {
                return;
              }
              const cellId = field.cellId(y, x);
              onSelectCell(cellId);
            }
          }}
        >
          <canvas
            className="screen-layer"
            width={width}
            height={height}
            ref={canvas => { this.pixiCanvas = canvas; }}
          />
        </div>
        {game.won == undefined &&
            <div id="screen-overlay">
              <div id="screen-float-ref" style={naviStyle}>
                {ui.actionForecast ? (
                  <Forecast forecast={ui.actionForecast} />
                ): (
                  <RefUnit unit={ui.hoveredUnit} />
                )}
              </div>
            </div>
        }
      </div>
    );
  }

}

