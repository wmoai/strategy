import React from 'react';

import './style.css';

// import StatusBar from '../StatusBar/StatusBar.jsx';
import ControlPannel from '../ControlPannel/index.jsx';
// import RefUnit from '../RefUnit//RefUnit.jsx';
import Forecast from '../Forecast/Forecast.jsx';
import Intro from '../Intro/index.jsx';
import Result from '../Result/Result.jsx';

import Client from '../../../game/client/index.js';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      introduction: true,
      mouseX: 0,
      mouseY: 0,

      turnRemained: null,
      hoveredUnit: null,
      hoveredTerrain: null,
      actionForecast: null,
    };
    this.images = {};
  }

  componentDidMount() {
    const { game, cellSize=40, isOffense, socket, isSolo } = this.props;

    // const rect = this.container.getBoundingClientRect();

    const client = new Client({
      canvas: this.pixiCanvas,
      game,
      cellSize,
      isOffense,
      socket,
      isSolo,
      width: this.screenBase.clientWidth,
      height: this.screenBase.clientHeight,
    });
    client.addEventListener('hover', ({ unit, terrain, forecast }) => {
      this.setState({
        hoveredUnit: unit || this.state.hoveredUnit,
        hoveredTerrain: terrain || this.state.hoveredTerrain,
        actionForecast: forecast,
      });
    });
    client.addEventListener('changeturn', ({ turnRemained }) => {
      this.setState({ turnRemained });
    });
    this.client = client;
    
    this.setState({
      initialized: true,
    });

    setTimeout(() => {
      this.endIntroduction();
    }, 5000);

    this.resizeListener = () => {
      this.client.resize(this.screenBase.clientWidth, this.screenBase.clientHeight);
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

  // cellPoint(clientX, clientY) {
    // return this.client.fieldCoordinates(clientX, clientY);
  // }

  changeScale(deltaY) {
    this.client.zoom(deltaY / 500);
  }

  render() {
    const {
      isOffense,
      game,
      onReturnRoom,
    } = this.props;

    const naviStyle = {};
    // if (this.client) {
      // const { mouseY, mouseX } = this.state;
      // if (this.state.hoveredUnit || this.state.actionForecast) {
        // const vr = this.state.mouseY / window.innerHeight;
        // const hr = this.state.mouseX / window.innerWidth;
        // const { x, y } = this.cellPoint(mouseX, mouseY);
        // console.log(x,y);
        // if (vr < .5) {
          // naviStyle['top'] = this.client.clientYOfCell(y+1.5);
        // } else {
          // naviStyle['bottom'] = this.container.clientHeight - this.client.clientYOfCell(y-.5);
        // }
        // if (hr < .5) {
          // naviStyle['left'] = this.client.clientXOfCell(x);
        // } else {
          // naviStyle['right'] = this.container.clientWidth - this.client.clientXOfCell(x+1);
        // }
      // }
    // }

    return (
      <div id="screen-container">
        <style>{'body {overflow: hidden}'}</style>
        <div id="screen-header">
          <ControlPannel
            unit={this.state.hoveredUnit}
            terrain={this.state.hoveredTerrain}
            isOffense={isOffense}
            turnRemained={this.state.turnRemained}
            forecast={this.state.actionForecast}
          />
        </div>
        <div
          id="screen-base"
          ref={block => this.screenBase = block}
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

