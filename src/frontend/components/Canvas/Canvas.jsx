import React from 'react';

import './Canvas.css';
import RefUnit from '../RefUnit//RefUnit.jsx';
import Forecast from '../Forecast/Forecast.jsx';
import Intro from '../Intro/index.jsx';
import Result from '../Result/Result.jsx';

import Client from '../../../game/client/index.js';

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      introduction: true,
      rect: null,
      mouseX: 0,
      mouseY: 0,

      hoveredUnit: null,
      actionForecast: null,
    };
    this.images = {};
  }

  componentDidMount() {
    const { game, cellSize, isOffense, socket, isSolo } = this.props;

    const rect = this.container.getBoundingClientRect();

    this.client = new Client({
      canvas: this.pixiCanvas,
      game,
      cellSize,
      isOffense,
      socket,
      isSolo,
      width: window.innerWidth - (rect.left * 2),
      height: window.innerHeight - rect.top,
      onHoverUnit: unit => {
        if (this.state.hoveredUnit !== unit) {
          this.setState({ hoveredUnit: unit });
        }
      },
    });
    this.setState({
      initialized: true,
      rect,
    }, () => {
      const myUnit = game.units.filter(unit => unit.isOffense == isOffense ).first();
      if (myUnit) {
        this.forcusCell(myUnit.cellId);
      }
    });

    setTimeout(() => {
      this.endIntroduction();
    }, 5000);

    this.resizeListener = () => {
      const rect = this.container.getBoundingClientRect();
      this.client.resize(window.innerWidth - (rect.left * 2), window.innerHeight - rect.top);
      this.setState({ rect });
    };
    window.addEventListener('resize', this.resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    this.client.destroy();
  }

  endIntroduction() {
    if (this.state.introduction) {
      this.setState({introduction: false});
      this.client.run();
    }
  }

  resizeWindow() {
    const rect = this.container.getBoundingClientRect();
    this.client.resize(window.innerWidth - (rect.left * 2), window.innerHeight - rect.top);
    this.client.scroll(0, 0);
    this.setState({ rect });
  }

  forcusCell(cellId) {
    const { y, x } = this.props.game.field.coordinates(cellId);
    this.client.forcusCell(x, y);
  }

  cellPoint(clientX, clientY) {
    const { rect } = this.state;
    return this.client.fieldCoordinates(clientX - rect.left, clientY - rect.top);
  }

  changeScale(deltaY) {
    const { mouseX, mouseY, rect } = this.state;
    this.client.zoom(
      deltaY / 500,
      mouseX - rect.left,
      mouseY - rect.top,
    );
  }

  render() {
    const {
      isOffense,
      game,
      onReturnRoom,
    } = this.props;

    const naviStyle = {};
    if (this.client) {
      const { mouseY, mouseX } = this.state;
      if (this.state.hoveredUnit || this.state.actionForecast) {
        const vr = this.state.mouseY / window.innerHeight;
        const hr = this.state.mouseX / window.innerWidth;
        const { x, y } = this.cellPoint(mouseX, mouseY);
        if (vr < .5) {
          naviStyle['top'] = this.client.clientYOfCell(y+1.5);
        } else {
          naviStyle['bottom'] = this.container.clientHeight - this.client.clientYOfCell(y-.5);
        }
        if (hr < .5) {
          naviStyle['left'] = this.client.clientXOfCell(x);
        } else {
          naviStyle['right'] = this.container.clientWidth - this.client.clientXOfCell(x+1);
        }
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
            this.setState({
              mouseX: e.clientX,
              mouseY: e.clientY,
            });
          }}
          onWheel={e => {
            this.changeScale(e.deltaY);
          }}
        >
          <canvas
            id="screen-canvas"
            ref={canvas => { this.pixiCanvas = canvas; }}
          />
        </div>
        {this.state.introduction &&
            <Intro
              game={game}
              isOffense={isOffense}
              onClick={() => {
                this.endIntroduction();
              }}
            />
        }

        <div id="screen-transparent-overlay">
          <div id="screen-float-ref" style={naviStyle}>
            {this.state.actionForecast ? (
              <Forecast forecast={this.state.actionForecast} />
            ): (
              <RefUnit unit={this.state.hoveredUnit} />
            )}
          </div>
        </div>
        {game.isEnd &&
            <Result
              won={game.winner == isOffense}
              onReturnRoom={onReturnRoom}
            />
        }
      </div>
    );
  }

}

