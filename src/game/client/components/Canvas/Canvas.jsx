import React from 'react';

import './Canvas.css';
import RefUnit from '../RefUnit//RefUnit.jsx';
import Forecast from '../Forecast/Forecast.jsx';
import Intro from '../Intro/index.jsx';
import Notifier from '../Notifier/Notifier.jsx';
import Result from '../Result/Result.jsx';

import GraphicRenderer from '../../GraphicRenderer.js';

const scroller = {
  x: 0,
  y: 0,
  timer: null,
};

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      introduction: false,
      renderer: null,
      mouseX: 0,
      mouseY: 0,
    };
    this.images = {};
  }

  async componentDidMount() {
    const { game, cellSize, isOffense, onInit } = this.props;
    const { field, units } = game;

    const renderer = new GraphicRenderer(this.pixiCanvas, field, cellSize);
    renderer.renderTerrain();
    this.setState({
      initialized: true,
      renderer: renderer
    }, () => {
      this.state.renderer.renderUnits(units);
      const myUnit = units.filter(unit => unit.offense == isOffense ).first();
      if (myUnit) {
        this.forcusCell(myUnit.cellId);
      }
      onInit();
    });

    setTimeout(() => {
      this.setState({introduction: false});
    }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.initialized) {
      return;
    }
    const { game, ui } = nextProps;
    if (game.units != this.props.game.units) {
      const { units } = game;
      this.state.renderer.renderUnits(units);
    }

    this.state.renderer.clearRange();
    this.state.renderer.renderRange(ui);
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

  hover(event) {
    // const { target, pageX, pageY } = event;
    // const rect = target.getBoundingClientRect();
    // const xr = (pageX-rect.left) / target.clientWidth;
    // const yr = (pageY-rect.top) / target.clientHeight;
    // const dx = xr > 0.9 ? 5 : xr < 0.1 ? -5 : 0;
    // const dy = yr > 0.9 ? 5 : yr < 0.1 ? -5 : 0;
    // if (dx === 0 && dy === 0) {
      // clearInterval(scroller.timer);
    // }
    // if (scroller.x !== dx || scroller.y !== dy) {
      // clearInterval(scroller.timer);
      // scroller.timer = setInterval(() => {
        // this.screen.scrollLeft += dx;
        // this.screen.scrollTop += dy;
      // }, 10);
    // }
    // scroller.x = dx;
    // scroller.y = dy;
  }

  render() {
    const {
      cellSize,
      isOffense,
      game,
      ui,
      onSelectCell,
      onHoverCell,
      onReturnRoom,
    } = this.props;

    const { field } = game;

    const naviStyle = {};
    if (ui.hoveredCell != null) {
      const vr = this.state.mouseY / window.innerHeight;
      const hr = this.state.mouseX / window.innerWidth;
      naviStyle[vr < 0.5 ? 'bottom' : 'top'] = 20;
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
            this.setState({
              mouseX: e.pageX,
              mouseY: e.pageY,
            });
            this.hover(e);
            const { x, y } = this.cellPoint(e);
            if (!field.isActiveCell(y, x)) {
              return;
            }
            this.state.renderer.renderCursor(x, y);
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
            ref={canvas => { this.pixiCanvas = canvas; }}
          />
        </div>
        {!game.isEnd &&
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
        {this.state.introduction ? (
          <Intro
            game={game}
            isOffense={isOffense}
          />
        ) : (
          <Notifier
            game={game}
            isOffense={isOffense}
            onEndMyTurn={this.props.onEndMyTurn}
          />
        )}
        <Result
          isEnd={game.isEnd}
          won={game.winner == isOffense}
          onReturnRoom={onReturnRoom}
        />
      </div>
    );
  }

}

