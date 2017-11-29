import React from 'react';

import './Canvas.css';
import RefUnit from '../RefUnit//RefUnit.jsx';
import Forecast from '../Forecast/Forecast.jsx';
import Intro from '../Intro/index.jsx';
import TurnCall from '../TurnCall/index.jsx';
import Result from '../Result/Result.jsx';

import Renderer from '../../Renderer';

class Dragger {
  constructor() {
    this.isDown = false;
    this.dragging = false;
    this.clientX = null;
    this.clientY = null;
    this.deltaX = null;
    this.deltaY = null;
    this.decelerator = null;
  }
  enter(clientX, clientY) {
    this.isDown = true;
    this.clientX = clientX;
    this.clientY = clientY;
    clearInterval(this.decelerator);
  }
  move(clientX, clientY) {
    if (this.isDown && !this.dragging) {
      const dx = Math.abs(this.clientX - clientX);
      const dy = Math.abs(this.clientY - clientY);
      if (dx > 10 || dy > 10) {
        this.dragging = true;
      }
    }
    if (this.dragging) {
      this.deltaX = this.clientX - clientX;
      this.deltaY = this.clientY - clientY;
      this.clientX = clientX;
      this.clientY = clientY;
    }
  }
  leave(callback) {
    this.isDown = false;
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    clearInterval(this.decelerator);
    if (callback != null && typeof callback === 'function') {
      this.decelerator = setInterval(() => {
        callback();
        this.deltaX *= 0.95;
        this.deltaY *= 0.95;
        if (this.deltaX < 1 && this.deltaY < 1) {
          clearInterval(this.decelerator);
        }
      }, 10);
    }
    return true;
  }
}
const dragger = new Dragger();

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      introduction: true,
      rect: null,
      mouseX: 0,
      mouseY: 0,
    };
    this.images = {};
  }

  componentDidMount() {
    const { game, cellSize, isOffense, onInit } = this.props;

    const rect = this.container.getBoundingClientRect();

    this.renderer = new Renderer({
      canvas: this.pixiCanvas,
      game,
      cellSize,
      width: window.innerWidth - (rect.left * 2),
      height: window.innerHeight - rect.top
    });
    this.setState({
      initialized: true,
      rect,
    }, () => {
      const myUnit = game.units.filter(unit => unit.offense == isOffense ).first();
      if (myUnit) {
        this.forcusCell(myUnit.cellId);
      }
      onInit();
    });

    setTimeout(() => {
      if (this.state.introduction) {
        this.setState({introduction: false});
      }
    }, 5000);
    window.addEventListener('resize', this.resizeWindow.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeWindow.bind(this));
  }

  resizeWindow() {
    const rect = this.container.getBoundingClientRect();
    this.renderer.resize(window.innerWidth - (rect.left * 2), window.innerHeight - rect.top);
    this.renderer.scroll(0, 0);
    this.setState({ rect });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.initialized) {
      return;
    }
    const { game, ui, onEndAnimation } = nextProps;

    if (ui.action != this.props.ui.action) {
      const { action } = ui;
      this.animating = (action != null);
      this.renderer.setAnimation(action, () => {
        // animation callback
        this.animating = false;
        this.renderer.updateUnits(game.units);
        this.renderer.updateRanges(ui.ranges, ui.forcusedUnit);
        onEndAnimation(game.turn);
      });
    }
    if (game.units != this.props.game.units && !this.animating) {
      this.renderer.updateUnits(game.units);
    }
    if (ui.ranges != this.props.ui.ranges && !this.animating) {
      this.renderer.updateRanges(ui.ranges, ui.forcusedUnit);
    }
  }

  forcusCell(cellId) {
    const { y, x } = this.props.game.field.coordinates(cellId);
    this.renderer.forcusCell(x, y);
  }

  cellPoint(clientX, clientY) {
    const { rect } = this.state;
    return this.renderer.fieldCoordinates(clientX - rect.left, clientY - rect.top);
  }

  changeScale(deltaY) {
    const { mouseX, mouseY, rect } = this.state;
    this.renderer.zoom(
      deltaY / 500,
      mouseX - rect.left,
      mouseY - rect.top,
    );
  }

  selectCell(clientX, clientY) {
    const { game, onSelectCell } = this.props;
    const { field } = game;

    const { x, y } = this.cellPoint(clientX, clientY);
    const cellId = field.cellId(y, x);
    onSelectCell(cellId);
  }

  hoverCell(clientX, clientY) {
    const { game, onHoverCell } = this.props;
    const { field } = game;

    this.setState({
      mouseX: clientX,
      mouseY: clientY,
    });
    const { x, y } = this.cellPoint(clientX, clientY);
    if (!field.isActiveCell(y, x)) {
      return;
    }
    this.renderer.updateCursor(x, y);
    const cellId = field.cellId(y, x);
    onHoverCell(cellId);
  }

  render() {
    const {
      isOffense,
      game,
      ui,
      onReturnRoom,
    } = this.props;

    const { mouseY, mouseX } = this.state;
    const naviStyle = {};
    if (ui.hoveredCell != null) {
      const vr = this.state.mouseY / window.innerHeight;
      const hr = this.state.mouseX / window.innerWidth;
      const { x, y } = this.cellPoint(mouseX, mouseY);
      if (vr < .5) {
        naviStyle['top'] = this.renderer.clientYOfCell(y+1.5);
      } else {
        naviStyle['bottom'] = this.container.clientHeight - this.renderer.clientYOfCell(y-.5);
      }
      if (hr < .5) {
        naviStyle['left'] = this.renderer.clientXOfCell(x);
      } else {
        naviStyle['right'] = this.container.clientWidth - this.renderer.clientXOfCell(x+1);
      }
    }

    return (
      <div
        id="screen-container"
        ref={div => this.container = div} 
      >
        <div
          id="screen-base"
          onMouseMove={e => {
            if (!this.state.initialized) {
              return;
            }
            this.hoverCell(e.clientX, e.clientY);
            dragger.move(e.clientX, e.clientY);
            if (dragger.dragging) {
              this.renderer.scroll(dragger.deltaX, dragger.deltaY);
            }

          }}
          onMouseDown={e => dragger.enter(e.clientX, e.clientY)}
          onMouseUp={e => {
            if (dragger.leave(() => {
              this.renderer.scroll(dragger.deltaX, dragger.deltaY);
            })) {
              return;
            }
            this.selectCell(e.clientX, e.clientY);
          }}
          onWheel={e => {
            dragger.leave();
            this.changeScale(e.deltaY);
          }}
          onMouseLeave={() => dragger.leave()}
        >
          <canvas
            id="screen-canvas"
            ref={canvas => { this.pixiCanvas = canvas; }}
          />
        </div>
        {game.isEnd &&
            <Result
              won={game.winner == isOffense}
              onReturnRoom={onReturnRoom}
            />
        }
        {this.state.introduction ? (
          <Intro
            game={game}
            isOffense={isOffense}
            onClick={() => this.setState({introduction: false})}
          />
        ) : (
          <TurnCall
            game={game}
            isOffense={isOffense}
            hidden={game.isEnd}
            onEndMyTurn={this.props.onEndMyTurn}
          />
        )}

        <div id="screen-transparent-overlay">
          <div id="screen-float-ref" style={naviStyle}>
            {ui.actionForecast ? (
              <Forecast forecast={ui.actionForecast} />
            ): (
              <RefUnit unit={ui.hoveredUnit} />
            )}
          </div>
        </div>
      </div>
    );
  }

}

