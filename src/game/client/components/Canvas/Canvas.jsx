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
    const { game, cellSize, isOffense, onInit } = this.props;
    const { field, units } = game;

    const engine = new Engine(this.pixiCanvas, field.width, field.height, cellSize);
    await engine.setup();
    engine.renderTerrain(field);
    this.setState({
      initialized: true,
      cursorRenderer: engine.cursorRenderer(),
      unitsRenderer: engine.unitsRenderer(field),
      rangeRenderer: engine.rangeRenderer(field),
      lineupUIRenderer: engine.lineupUIRenderer(),
    }, () => {
      this.state.unitsRenderer.render(units);
      const myUnit = units.filter(unit => unit.offense == isOffense ).first();
      if (myUnit) {
        this.forcusCell(myUnit.cellId);
      }
      onInit();
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

    this.state.rangeRenderer.remove();
    this.state.rangeRenderer.render(ui);

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

  cellPoint(event) {
    const { cellSize } = this.props;
    const rect = event.target.getBoundingClientRect();
    const innerOffsetX = event.clientX - rect.left + event.target.scrollLeft;
    const innerOffsetY = event.clientY - rect.top + event.target.scrollTop;
    return {
      y: Math.floor(innerOffsetY / cellSize),
      x: Math.floor(innerOffsetX / cellSize)
    };
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
            const { x, y } = this.cellPoint(e);
            if (!field.isActiveCell(y, x)) {
              return;
            }
            this.state.cursorRenderer.render(x, y);
            this.setState({
              mouseX: e.pageX,
              mouseY: e.pageY,
            });
            const cellId = field.cellId(y, x);
            onHoverCell(cellId);
          }}
          onClick={e => {
            if (!onSelectCell || typeof onSelectCell !== 'function') {
              return;
            }
            const { x, y } = this.cellPoint(e);
            if (!field.isActiveCell(y, x)) {
              return;
            }
            const cellId = field.cellId(y, x);
            onSelectCell(cellId);
          }}
        >
          <canvas
            id="screen-canvas"
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

