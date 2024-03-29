import { Chess } from "./chess.js";

export class chessengine {
  constructor(chess_aa, engine_url_api) {
    this.chess_aa = chess_aa;

    // api for an engine running externally
    this.engineAPI;
    if (!engine_url_api || typeof engine_url_api === "string" || engine_url_api instanceof String || engine_url_api instanceof URL) 
      this.engineAPI = null;
    else
      this.engineAPI = engine_url_api;

    // worker running the engine
    this.engine = null;

    // settings/options
    this.options = {};
    this.engineMaxDepth = 30; // to avoid firing too many events when checkmate is found and depth reaches hundreds 

    // The mode of the engine
    if (chess_aa.mode === "play") {
      this.mode = "play";
    }
    else if (chess_aa.mode === "analysis") {
      this.mode = "analysis";
    }
    else {
      throw("mode " + mode + " undefined.");
    }

    // Whether engine has been validated to be working ok
    this.ok = false;

    // state of the engine during analysis
    this.engineOn = false;
    this.engineOnDuringPause = false;
    this.stopped = false;
    this.timeLastMessage = new Array(3).fill(0);
    this.lastMessageNotAnalyzed = new Array(3).fill("");
    
    // state of the engine during play
    this.searchingMove = false;

    // chess instance is required to validate moves and change notation
    this.chess = new Chess(chess_aa.startFen);

    // Event dispatches
    this.dispatcher = document.createElement("div");

    // Setup for event handling of external engine
    if (this.engineAPI) {
      this.engineAPI.engineOnMessage(this.engineOnMessage());
    }

    // listen to events fired by the chess-aa instance
    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.moveMade());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.moveUnmade());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.resetPosition());
    chess_aa.dispatcher.addEventListener("chess-aa-enginemoverequest", this.searchMoveHandler());

    // Pause engine when window is out of focus
    this.pauseOnBlur = true;
    window.addEventListener("blur", this.pauseEngine());
    window.addEventListener("focus", this.unpauseEngine());
  }

  launchEngine(engine_path) {
    this.terminate();
    if (this.engineAPI) { // launch on desktop
      this.engineAPI.engineLaunch(engine_path);
    }
    else {
      if (!engine_path) { // default to stockfish
        engine_path = new URL("stockfish.js", import.meta.url);
      }
      this.engine = new Worker(engine_path);
      this.engine.onmessage = this.engineOnMessage();
      this.uciCmd("uci");
    }
    setTimeout(() => {
      if (!this.ok) {
        console.log("engine does not appear to be working properly");
        this.terminate()
      }
    },5000)
  }

  uciCmd(cmd) {
    // console.log("COMMAND: " + cmd);
    if (this.engine) {
      this.engine.postMessage(cmd);
    }
    else if (this.engineAPI) { // desktop
      this.engineAPI.uciCmd(cmd);
    }
  }

  terminate() {
    this.options = {};
    this.switch(false);
    this.ok = false;
    if (this.engine) {
      this.engine.terminate();
    }
    else if (this.engineAPI) { // desktop
      this.engineAPI.engineTerminate();
    }
  }

  analyzePosition() {
    this.stop();
    let command = "position fen " + this.chess.fen();
    this.uciCmd(command);
    if (this.engineOn) {
      this.stopped = false;
      this.timeLastMessage.fill(0);
      this.lastMessageNotAnalyzed.fill("");
      this.uciCmd("go depth " + this.engineMaxDepth);
    }
  }

  stop() {
    this.stopped = true;
    this.uciCmd("stop");
  }

  stopHandler() {
    let that = this;
    return function(event) {
      that.stop();
    }
  }

  resetPosition() {
    let that = this;
    return function(event) {
      that.stop();
      that.chess.load(event.detail.fen);
      if (that.mode === "analysis") {
        that.analyzePosition();
      }
    }
  }

  moveMade() {
    let that = this;
    return function(event) {
      that.chess.move(event.detail.move);
      if (that.mode === "analysis") {
        that.analyzePosition();
      }
    }
  }

  moveUnmade() {
    let that = this;
    return function(event) {
      that.chess.undo();
      if (that.mode === "analysis") {
        that.analyzePosition();
      }
    }
  }

  validate(line) {
    if (line === "uciok") {
      this.ok = true;
      let uciok = new CustomEvent("chess-aa-engine-uciok",{detail:{options: {...this.options}}});
      this.dispatcher.dispatchEvent(uciok);
    }
    else if (line.startsWith("option")) {
      line = line.split(" ");
      let name;
      let type;
      let value = "";
      let min;
      let max;
      let combo_options = [];
      let reading = "name";
      for (let i=2; i<line.length;++i) {
        if (reading === "name") {
          if (line[i] === "type") {
            reading = "type";
            continue;
          }
          if (name) name += " " + line[i];
          else name = line[i];
        }
        else if (reading === "type") {
          type = line[i];
          if (!["button","check","spin","string","combo"].includes(type)) {
            console.log("Engine: unknown option type",type);
          }
          reading = "value";
        }
        else if (reading === "value") {
          if (line[i] === "default") continue;
          if (type === "spin") {
            value = parseInt(line[i]);
            reading = "min";
          }
          else if (type === "combo") {
            value = line[i];
            reading = "combo_options";
          }
          else if (type === "check") value = line[i] === "true" ? true : false;
          else if (type === "string") value = line[i];
        }
        else if (reading === "min") {
          if (line[i] === "min") continue;
          min = parseInt(line[i]);
          reading = "max";
        }
        else if (reading === "max") {
          if (line[i] === "max") continue;
          max = parseInt(line[i]);
        }
        else if (reading === "combo_options") {
          if (line[i] === "var") continue;
          combo_options.push(line[i]);
        }
      }
      this.options[name] = {type: type};
      if (type === "string" || type === "check") {
        this.options[name].value = value;
      }
      else if (type === "spin") {
        this.options[name].value = value;
        this.options[name].min = min;
        this.options[name].max = max;
      }
      else if (type === "combo") {
        this.options[name].value = value;
        this.options[name].options = combo_options;
      }
    }
  }

  analyze(line) {
    if (this.stopped) return;
    let engineCurrentDepth;
    let engineCurrentScoretype;
    let engineCurrentScore;
    let engineCurrentVariation;
    let multipv;
    let currentTime;
    if (this.chess.game_over()) { // mate or draw
      this.stop();
      engineCurrentDepth = 0;
      engineCurrentScoretype = this.chess.in_checkmate() ? "mate" : "draw";
      engineCurrentScore = 0;
      engineCurrentVariation = [];
      multipv = 0;
    }
    else if (line.startsWith("info")) {
      let info = line.split(/\s+/);
      if (info.includes("pv")) {
        multipv = (parseInt(info[info.indexOf("multipv")+1]) - 1) || 0;
        currentTime = parseInt(info[info.indexOf("time")+1]);
        if (currentTime - this.timeLastMessage[multipv] < 10 ) {// Do not process messages less than 10ms apart
          this.lastMessageNotAnalyzed[multipv] = line;
          return;
        }
        else {
          this.lastMessageNotAnalyzed[multipv] = "";
        }
        engineCurrentDepth = parseInt(info[info.indexOf("depth")+1]);
        engineCurrentScoretype = info[info.indexOf("score")+1];
        engineCurrentScore = parseInt(info[info.indexOf("score")+2]);
        engineCurrentVariation = [];
        let moves = info.slice(info.indexOf("pv")+1);
        let movesmade = 0;
        for (let i=0; i<moves.length; ++i) {
          let move = this.chess.move({ from: moves[i].slice(0,2), to: moves[i].slice(2,4), promotion: moves[i].length === 5 ? moves[i].slice(4) : "" });
          if (!move) {
            break;
          }
          ++movesmade;
          engineCurrentVariation.push(move);
        }
        if (movesmade === 0) {
          return;
        }
        for (let i=0; i<movesmade; ++i) {
          this.chess.undo();
        }
      }
      else {
        return;
      }
    }
    else if (line.startsWith("bestmove")) {
      for (let i=0; i<this.lastMessageNotAnalyzed.length; ++i) {
        if (this.lastMessageNotAnalyzed[i] !== "") {
          this.timeLastMessage[i] = -Infinity;
          this.analyze(this.lastMessageNotAnalyzed[i]);
        }
      }
      return;
    }
    else {
      return;
    }
    let event = new CustomEvent("chess-aa-engineEvaluation", 
      { detail: 
        { 
          turn: this.chess.turn(),
          score: engineCurrentScore,
          scoreType: engineCurrentScoretype,
          depth: engineCurrentDepth,
          variation: engineCurrentVariation,
          multipv: multipv,
          fen: this.chess.fen(),
          time: currentTime
        }
      }
    );
    this.dispatcher.dispatchEvent(event);
    this.timeLastMessage[multipv] = currentTime;
  }

  play(line) {
    if (line.startsWith("bestmove")) {
      let moveString = line.split(" ")[1];
      let move = this.chess.move({ from: moveString.slice(0,2), to: moveString.slice(2,4), promotion: moveString.length === 5 ? moveString.slice(4) : "" });
      if (move) {
        this.chess.undo();
        this.chess_aa.suggestMove(move);
      }
    }
  }

  engineOnMessage() {
    let that = this;
    return function(event, message) {
      let line;
      if (that.engine) {
        line = event.data;
      }
      else { //desktop
        line = message;
      }
      // console.log("OUTPUT: ",line)
      if (!that.ok) {
        that.validate(line);
      }
      else if (that.mode === "analysis") {
        that.analyze(line);
      }
      else if (that.mode === "play") {
        that.play(line);
      }
    };
  }

  switch(on) {
    if (this.mode === "analysis" && this.ok) {
      if (on) {
        this.engineOn = true;
        this.analyzePosition();
        let event = new CustomEvent("chess-aa-engineSwitchOnOff",{detail:{on:true}});
        this.dispatcher.dispatchEvent(event);
      }
      else {
        this.stop();
        this.engineOn = false;
        let event = new CustomEvent("chess-aa-engineSwitchOnOff",{detail:{on:false}});
        this.dispatcher.dispatchEvent(event);
      }
    }
  }

  pauseEngine() {
    let that = this;
    return function() {
      if (that.pauseOnBlur) {
        that.engineOnDuringPause = that.engineOn;
        that.switch(false);
      }
    };
  }

  unpauseEngine() {
    let that = this;
    return function() {
      if (that.pauseOnBlur)
        that.switch(that.engineOnDuringPause);
    };
  }

  setPauseOnBlur(b) {
    if (b === true)
      this.pauseOnBlur = true;
    else if (b === false) {
      this.pauseOnBlur = false;
    }
  }

  getOption(name) {
    if (this.options[name])
      return this.options[name].value;
    else
      return null;
  }

  setOption(name,value) {
    let option = this.options[name];
    if (option) {
      if (option.type === "button") {
        this.uciCmd("setoption name " + name);
      }
      else if (option.type === "check") {
        if (value === true) {
          option.value = value;
          this.uciCmd("setoption name " + name + " value true");
        }
        else if (value === false) {
          option.value = value;
          this.uciCmd("setoption name " + name + " value false");
        }
        else {
          console.log("engine option",name,"needs to be either true or false");
          return false;
        }
      }
      else if (option.type === "string") {
        if (typeof value === "string" || value instanceof String) {
          option.value = value;
          this.uciCmd("setoption name " + name + " value " + value);
        }
        else {
          console.log("engine option",name,"needs to be a string");
          return false;
        }
      }
      else if (option.type === "spin") {
        if (Number.isInteger(value) && value >= option.min && value <= option.max) {
          option.value = value;
          this.uciCmd("setoption name " + name + " value " + value);
        }
        else {
          console.log("engine option",name,"needs to be an integer between",option.min,"and",option.max);
          return false;
        }
      }
      else if (option.type === "combo") {
        if (option["options"].includes(value)) {
          option.value = value;
          this.uciCmd("setoption name " + name + " value " + value);
        }
        else {
          console.log("engine option",name,"needs to be one of ",option["options"]);
          return false;
        }
      }
      let event = new CustomEvent("chess-aa-engineSetoption",{detail:{name:name,value:value}});
      this.dispatcher.dispatchEvent(event);
      return true;
    }
    else {
      console.log("engine option",name,"does not exist");
      return false;
    }
  }

  setMaxDepth(depth) {
    this.engineMaxDepth = depth;
    let event = new CustomEvent("chess-aa-engine-maxdepth",{detail: {depth: depth}});
    this.dispatcher.dispatchEvent(event);
  }

  searchMove(fen) {
    this.stopped = false;
    this.uciCmd("position fen " + fen);
    this.uciCmd("go movetime 1000");
  }

  searchMoveHandler() {
    let that = this;
    return function(event) {
      that.searchMove(event.detail.fen);
    }
  }
}