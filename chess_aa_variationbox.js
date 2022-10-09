export class variationbox {
  constructor(main_div, chess_aa) {
    this.chess_aa = chess_aa;
    this.variations = chess_aa.variations.copy(); // we keep track of a moveTree analogous to the chess_aa moveTree to avoid conflicts when moves are made too quickly (several moves are made before the events are handled)

    this.div = document.createElement("div");
    this.div.style.position = "relative";
    this.variationsDiv = document.createElement("div");
    this.commentCurrentMoveDiv = document.createElement("div");
    this.commentCurrentMoveDiv.style.color = "blue";
    this.commentFloatDiv = document.createElement("div");
    this.commentFloatDiv.style.position = "absolute";
    this.commentFloatDiv.style.zIndex = 1000;
    this.commentFloatDiv.style.visibility = "hidden";
    this.commentFloatDiv.style.backgroundColor = "rgba(255,255,255,1)";
    this.commentFloatDiv.style.color = "blue";
    this.div.appendChild(this.variationsDiv);
    this.div.appendChild(this.commentCurrentMoveDiv);
    this.div.appendChild(this.commentFloatDiv);
    main_div.appendChild(this.div);

    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.addHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.undoHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.restartHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-variationremoval", this.restartHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-addedcomment", this.addCommentHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-deletedcomment", this.deleteCommentHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-clearcomments", this.clearCommentsHandler());
  }

  add(move) {
    let addressBefore = this.variations.address();
    if (move && this.variations.add(move)) {
      let span = document.createElement("span");
      span.style.cursor = "pointer";
      span.setAttribute("data-address",JSON.stringify(this.variations.address()));
      let halfmove = this.variations.activeHalfmove();
      let address = this.variations.address();
      let branch = address[address.length-1];
      let openbracket;
      let closingbracket;
      let variationspan;
      let text = "";
      let prevaddress;
      let prev; // the object after which we will place the new move
      if (address.length == 1 && branch == 0) {// First move
        this.variationsDiv.appendChild(span);
        if (halfmove % 2 == 1) {
          text += (halfmove+1)/2 + ". " + move.san + " ";
        }
        else {
          text += halfmove/2 + "... " + move.san + " ";
        }
        span.textContent = text;
      }
      else if (branch > 0) {
        let level = this.variations.level();
        variationspan = document.createElement("span");
        variationspan.className = "chess-aa-variationbox-variation";
        variationspan.setAttribute("data-address",JSON.stringify(this.variations.address()) + "container");
        openbracket = document.createElement("span");
        closingbracket = document.createElement("span");
        if (level == 1) {
          variationspan.style.display = "block";
          variationspan.style.marginLeft = "2em";
        }
        else {
          openbracket.append("( ");
          closingbracket.textContent = ") ";
        }
        openbracket.setAttribute("data-address",JSON.stringify(this.variations.address()) + "open");
        closingbracket.setAttribute("data-address",JSON.stringify(this.variations.address()) + "close");
        variationspan.appendChild(openbracket);
        variationspan.appendChild(span);
        variationspan.appendChild(closingbracket);

        prevaddress = address.slice(0,address.length-1);
        prevaddress.push(branch-1);
        if (branch == 1) {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
        }
        else {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "container" + "']");
        }
        prev.after(variationspan);

        if (halfmove % 2 == 1) {
          text += (halfmove+1)/2 + ". " + move.san + " ";
        }
        else {
          text += halfmove/2 + "... " + move.san + " ";
        }
        span.textContent = text;

        // the following move in the main variation needs to get the three dots for continuation when a new branch is added
        prevaddress.push(0); // prevaddress is now the address to that following move
        if (branch == 1 && halfmove % 2 == 1 && this.variations.addressExists(prevaddress)) {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
          let s = prev.textContent;
          prev.textContent = ((halfmove+1)/2) + "... " + s;
        }
      }
      else { // branch == 0 && address.length > 1
        prevaddress = address.slice(0,address.length-2);
        let nbranches = this.variations.numberOfBranchesAt(prevaddress);
        if (address[address.length-2] > 0 || nbranches == 1) { // there are no branches between the previous move and the current move
          prevaddress.push(address[address.length-2]);
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
          prev.after(span);
        }
        else { // there is at least one branch between the previous move and the current move
          prevaddress.push(nbranches-1);
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "container" + "']");
          prev.after(span);
        }

        if (halfmove % 2 == 1) {
          text += (halfmove+1)/2 + ". " + move.san + " ";
        }
        else if (address[address.length-2] == 0 && nbranches > 1) {
          text += halfmove/2 + "... " + move.san + " ";
        }
        else {
          text += move.san + " ";
        }
        span.textContent = text;
      }

      // events on span 
      let that = this;
      span.onclick = function(event) {
          that.chess_aa.gotoAddress(address);
          that.chess_aa.focus();
      };
      span.oncontextmenu = function() {
        if (confirm("Are you sure you want to delete the move " + that.variations.moveAt(address).san + " and all subsequent moves in the variation?")) {
          that.remove(address);
        }
        that.chess_aa.focus();
        return false;
      };
      // // You can add a tooltip with the comment using the following event handlers
      // span.onmouseover = function(event) {
      //   that.commentFloatDiv.textContent = that.variations.getCommentsAt(address).join(" ");
      //   let rect = that.div.getBoundingClientRect();
      //   let rect2 = span.getBoundingClientRect()
      //   that.commentFloatDiv.style.left = (rect2.right - rect.left) + "px";
      //   that.commentFloatDiv.style.top = (rect2.bottom - rect.top) + "px";
      //   that.commentFloatDiv.style.visibility = "visible";
      // };
      // span.onmouseout = function() {
      //   that.commentFloatDiv.style.visibility = "hidden";
      // }

      // Highlight current move and show comments
      span.style.backgroundColor = "yellow";
      this.commentCurrentMoveDiv.textContent = this.variations.getCommentsAt(address).join(" ");
      prevaddress = address.slice(0,address.length-1);
      if (prevaddress.length > 0) {
        prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
        prev.style.backgroundColor = "";
      }
    }
    else {
      let addressAfter = this.variations.address();
      if (addressAfter.length != addressBefore.length) {
        // highlighting when move is redone instead of added
        let span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(addressAfter) + "']");
        span.style.backgroundColor = "yellow";
        this.commentCurrentMoveDiv.textContent = this.variations.getCommentsAt(addressAfter).join(" ");
        if (addressBefore.length > 0) {
          span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(addressBefore) + "']");
          span.style.backgroundColor = "";
        }
      }
    }
  };

  addHandler() {
    let that = this;
    return function (event) {
      let move = event.detail.move;
      that.add(move);
    }
  }

  remove(address) {
    // chess_aa handles the removal of the variation and fires an event chess-aa-variationremoval
    this.chess_aa.removeVariationAtAddress(address);
  }

  undo() {
    let address = this.variations.address();
    let span;
    if (address.length > 0) {
      span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
      span.style.backgroundColor = "";
      this.variations.undo();
    }
    address = this.variations.address();
    this.commentCurrentMoveDiv.textContent = this.variations.getCommentsAt(address).join(" ");
    if (address.length > 0){
      span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
      span.style.backgroundColor = "yellow";
    }
  }

  undoHandler() {
    let that = this
    return function(event) {
      that.undo();
    };
  }

  restart(newvariations) {
    this.variationsDiv.replaceChildren();
    this.variations.clear();
    this.variations.halfmove = newvariations.halfmove;
    let that = this;
    function recur(movetree) {
      that.add(movetree.root);
      let c = movetree.comment;
      for (let i=0; i<c.length; ++i) {
        that.addComment(c[i]);
      }
      for (let i=0; i<movetree.children.length; ++i) {
        recur(movetree.children[i]);
      }
      that.undo();
    }
    recur(newvariations);
    let address = newvariations.address();
    this.variations.activateAddress(address);
    this.commentCurrentMoveDiv.textContent = this.variations.getCommentsAt(address).join(" ");
    if (address.length > 0) {
      let span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
      span.style.backgroundColor = "yellow";
    }
  }

  restartHandler() {
    let that = this;
    return function(event) {
      that.restart(event.detail.variations);
    };
  }

  addComment(s,address) {
    if (address === undefined) {
      this.variations.addComment(s);
    }
    else {
      this.variations.addCommentAt(s,address);
    }
    this.commentCurrentMoveDiv.textContent = this.variations.getComments().join(" ");
  }

  addCommentHandler() {
    let that = this;
    return function(event) {
      that.addComment(event.detail.comment, event.detail.address);
    };
  }

  deleteComment(address,index) {
    this.variations.deleteCommentAt(address,index);
    this.commentCurrentMoveDiv.textContent = this.variations.getComments().join(" ");
  }

  deleteCommentHandler() {
    let that = this;
    return function(event) {
      that.deleteComment(event.detail.address, event.detail.index);
    };
  }

  clearComments() {
    this.variations.clearComments();
  }

  clearCommentsHandler() {
    let that = this;
    return function(event) {
      that.clearComments();
      this.commentCurrentMoveDiv.textContent = this.variations.getComments().join(" ");
    }
  }
}