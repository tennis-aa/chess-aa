export class variationbox {
  constructor(main_div, chess_aa) {
    this.chess_aa = chess_aa;
    this.activeAddress = [];

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

    this.dialog = document.createElement("dialog");
    this.dialog.style.border = "none";
    this.dialog.style.borderRadius = "5px";
    this.dialog.style.textAlign = "right";
    this.dialog.style.position = "absolute";
    this.dialog.style.marginTop = "0%";
    this.dialog.style.marginLeft = "0%";
    this.dialog.style.padding = "2px";
    this.dialogDiv = this.dialog.appendChild(document.createElement("div"));
    this.dialogDiv.onclick = function(e) {e.stopPropagation()};
    this.dialogMoveSpan = this.dialogDiv.appendChild(document.createElement("span"));
    this.dialogAnnotation = this.dialogDiv.appendChild(document.createElement("select"));
    let annotations = ["","!", "?", "!!", "!?", "?!","??"];
    for (let i=0; i<annotations.length;++i) {
      let a = this.dialogAnnotation.appendChild(document.createElement("option"));
      a.textContent = annotations[i];
    }
    this.dialogDelete = this.dialogDiv.appendChild(document.createElement("button"));
    this.dialogDelete.textContent = "Delete";
    this.dialog.onclick = this.closeDialogHandler();

    this.div.appendChild(this.dialog);

    this.restart();

    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.addHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.undoHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.restartHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-variationremoval", this.restartHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-addedcomment", this.updateCommentHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-deletedcomment", this.updateCommentHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-clearcomments", this.updateCommentHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-addedannotation", this.updateAnnotationHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-deletedannotation", this.updateAnnotationHandler());
    chess_aa.dispatcher.addEventListener("chess-aa-clearannotations", this.updateAnnotationHandler());
  }

  add(move,newaddress) {
    if (!move) return;
    let address = [...newaddress];
    let addressBefore = [...this.activeAddress];
    let span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
    if (!span) {
      // new move (as opposed to an existing move that was redone)
      span = document.createElement("span");
      span.style.cursor = "pointer";
      span.style.paddingRight = "5px";
      span.setAttribute("data-address",JSON.stringify(address));
      let halfmove = this.chess_aa.variations.halfmoveAt(address);
      let branch = address[address.length-1];
      let openbracket;
      let closingbracket;
      let variationspan;
      let text = "";
      let prevaddress;
      let prev; // the object after which we will place the new move
      if (address.length === 1 && branch === 0) {// First move
        this.variationsDiv.appendChild(span);
        if (halfmove % 2 === 1) {
          text += (halfmove+1)/2 + "." + move.san;
        }
        else {
          text += halfmove/2 + "..." + move.san;
        }
        span.textContent = text;
      }
      else if (branch > 0) {
        let level = this.chess_aa.variations.levelAt(address);
        variationspan = document.createElement("span");
        variationspan.className = "chess-aa-variationbox-variation";
        variationspan.setAttribute("data-address",JSON.stringify(address) + "container");
        openbracket = document.createElement("span");
        closingbracket = document.createElement("span");
        if (level === 1) {
          variationspan.style.display = "block";
          variationspan.style.marginLeft = "2em";
        }
        else {
          openbracket.append("( ");
          closingbracket.textContent = ") ";
        }
        openbracket.setAttribute("data-address",JSON.stringify(address) + "open");
        closingbracket.setAttribute("data-address",JSON.stringify(address) + "close");
        variationspan.appendChild(openbracket);
        variationspan.appendChild(span);
        variationspan.appendChild(closingbracket);

        prevaddress = address.slice(0,address.length-1);
        prevaddress.push(branch-1);
        if (branch === 1) {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
        }
        else {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "container" + "']");
        }
        prev.after(variationspan);

        if (halfmove % 2 === 1) {
          text += (halfmove+1)/2 + "." + move.san;
        }
        else {
          text += halfmove/2 + "..." + move.san;
        }
        span.textContent = text;

        // the following move in the main variation needs to get the three dots for continuation when a new branch is added
        prevaddress.push(0); // prevaddress is now the address to that following move
        if (branch === 1 && halfmove % 2 === 1 && this.chess_aa.variations.addressExists(prevaddress)) {
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
          if (prev) {
            let s = prev.textContent;
            if (!/[0-9]/.test(s[0])) // if s does not have the movenumber alredy
              prev.textContent = ((halfmove+1)/2) + "..." + s;
          }
        }
      }
      else { // branch === 0 && address.length > 1
        prevaddress = address.slice(0,address.length-2);
        let nbranches = this.chess_aa.variations.numberOfBranchesAt(prevaddress);
        if (address[address.length-2] > 0 || nbranches === 1) { // there are no branches between the previous move and the current move
          prevaddress.push(address[address.length-2]);
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
          prev.after(span);
        }
        else { // there is at least one branch between the previous move and the current move
          prevaddress.push(nbranches-1);
          prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "container" + "']");
          if (!prev) {// when restarting, the branch may not be in place yet, so we place it after the previous move
            prevaddress[prevaddress.length-1] = address[address.length - 1];
            prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
          }
          prev.after(span);
        }

        if (halfmove % 2 === 1) {
          text += (halfmove+1)/2 + "." + move.san + " ";
        }
        else if (address[address.length-2] === 0 && nbranches > 1) {
          text += halfmove/2 + "..." + move.san + " ";
        }
        else {
          text += move.san;
        }
        span.textContent = text;
      }

      // events on span 
      let that = this;
      span.onclick = function(event) {
        that.chess_aa.gotoAddress(address);
        that.chess_aa.focus();
      };
      span.oncontextmenu = function(e) {
        that.dialog.style.left = e.clientX + "px";
        that.dialog.style.top = e.clientY + "px";
        that.showDialog(span.textContent, address);
        return false;
      };
      // // You can add a tooltip with the comment using the following event handlers
      // span.onmouseover = function(event) {
      //   that.commentFloatDiv.textContent = that.chess_aa.variations.getCommentsAt(address).join(" ");
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
      prevaddress = address.slice(0,address.length-1);
      if (prevaddress.length > 0) {
        prev = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(prevaddress) + "']");
        prev.style.backgroundColor = "";
      }
    }
    else {
      // highlighting when move is redone instead of added
      span.style.backgroundColor = "yellow";
      if (addressBefore.length > 0) {
        span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(addressBefore) + "']");
        span.style.backgroundColor = "";
      }
    }
    this.activeAddress = [...address];
    this.updateComment();
    this.updateAnnotation(this.activeAddress);
  }

  addHandler() {
    let that = this;
    return function (event) {
      that.add(event.detail.move,event.detail.address);
    }
  }

  remove(address) {
    // chess_aa handles the removal of the variation and fires an event chess-aa-variationremoval
    this.chess_aa.removeVariationAtAddress(address);
  }

  undo() {
    let span;
    if (this.activeAddress.length > 0) {
      span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(this.activeAddress) + "']");
      span.style.backgroundColor = "";
    }
    this.activeAddress.pop();
    this.updateComment();
    if (this.activeAddress.length > 0){
      span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(this.activeAddress) + "']");
      span.style.backgroundColor = "yellow";
    }
  }

  undoHandler() {
    let that = this
    return function(event) {
      that.undo();
    };
  }

  restart() {
    this.variationsDiv.replaceChildren();
    this.activeAddress = [];
    let that = this;
    function recur(movetree,currentAddress) {
      for (let i=0; i<movetree.children.length; ++i) {
        currentAddress.push(i);
        that.add(movetree.children[i].move,currentAddress);
        recur(movetree.children[i],currentAddress);
        currentAddress.pop();
        that.undo();
      }
    }
    recur(this.chess_aa.variations,[]);
    let address = this.chess_aa.variations.address();
    if (address.length > 0) {
      let span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
      span.style.backgroundColor = "yellow";
    }
    this.activeAddress = address;
    this.updateComment();
  }

  restartHandler() {
    let that = this;
    return function(event) {
      that.restart();
    };
  }

  updateComment() {
    this.commentCurrentMoveDiv.textContent = this.chess_aa.variations.getCommentsAt(this.activeAddress).join(" ");
  }

  updateCommentHandler() {
    let that = this;
    return function(event) {
      that.updateComment();
    }
  }
  
  updateAnnotation(address) {
    let span = this.variationsDiv.querySelector("[data-address='" + JSON.stringify(address) + "']");
    let text = span.textContent;
    while (["!","?"].includes(text[text.length - 1])) text = text.slice(0,-1);
    let ann = this.chess_aa.variations.getAnnotationAt(address);
    if (ann && this.chess_aa.variations.typeAnnotation(ann) === "san")
      text += ann;
    span.textContent = text;
  }

  updateAnnotationHandler() {
    let that = this;
    return function(event) {
      that.updateAnnotation(event.detail.address);
    }
  }

  showDialog(move, address) {
    this.dialogMoveSpan.textContent = move + " ";
    let that = this;
    this.dialogDelete.onclick = function (e) {
      that.remove(address);
      that.dialog.close();
      that.chess_aa.focus();
      return false;
    }
    let s = this.chess_aa.variations.getAnnotationAt(address);
    if (s !== null && this.chess_aa.variations.typeAnnotation(s) === "san") {
      this.dialogAnnotation.value = s;
    }
    else {
      this.dialogAnnotation.value = "";
    }
    this.dialogAnnotation.onchange = function (e) {
      let val = that.dialogAnnotation.value;
      if (val === "") {
        that.chess_aa.deleteAnnotationAt(address,0);
      }
      else {
        that.chess_aa.addAnnotationAt(val,address);
      }
      that.dialog.close();
    }
    this.dialog.showModal();
  }

  closeDialogHandler() {
    let that = this;
    return function(e) {
      that.dialog.close();
      that.chess_aa.focus();
    }
  }
}