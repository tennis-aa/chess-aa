export class moveTree {
  constructor(move = null, halfmove = 0) {
    this.move = move ? {...move}: null;
    this.children = [];
    this.activeBranch = -1;
    this.halfmove = halfmove;
    this.comment = [];
    this.annotation = [];
  }

  add(move) {
    if (this.activeBranch === -1) {
      this.children.push( new moveTree(move, this.halfmove + 1) );
      this.activeBranch = this.children.length - 1;
    }
    else {
      this.children[this.activeBranch].add(move);
    }
  }

  undo() {
    if (this.activeBranch === -1) {
      return true;
    }
    else {
      if (this.children[this.activeBranch].undo()) {
        this.activeBranch = -1;
      }
      return false;
    }
  }

  redo(branch) {
    if (this.activeBranch === -1) {
      if (branch < this.children.length && branch >= 0) {
        this.activeBranch = branch;
        this.children[branch].activeBranch = -1;
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return this.children[this.activeBranch].redo(branch);
    }
  }

  moveAtBranch(branch = 0) {
    if (this.activeBranch === -1) {
      if (branch < this.children.length && branch >= 0){
        return this.children[branch].move;
      }
      else {
        return null;
      }
    }
    else {
      return this.children[this.activeBranch].moveAtBranch(branch);
    }
  }

  clear() {
    this.children.length = 0;
    this.activeBranch = -1
    this.move = null;
    this.comment.length = 0;
    this.halfmove = 0;
    this.annotation.length = 0;
  }

  addAt(move,address) {
    if (address.length === 0) {
      this.children.push( new moveTree(move, this.halfmove + 1) );
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addAt(move,address.slice(1));
    }
  }

  remove() {
    if (this.activeBranch === -1) {
      return true;
    }
    else {
      if (this.children[this.activeBranch].remove()) {
        this.activeBranch = -1;
        this.children.splice(address[0],1);
      }
      return false;
    }
  }

  removeAt(address) {
    if (address.length === 1 && address[0] < this.children.length) {
      this.children.splice(address[0],1);
      if (this.activeBranch === address[0]) {
        this.activeBranch = -1;
      }
      else if (this.activeBranch > address[0]) {
        --this.activeBranch
      }
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].removeAt(address.slice(1));
    }
  }

  address() {
    if (this.activeBranch === -1) {
      return [];
    }
    else {
      let a = this.children[this.activeBranch].address();
      a.unshift(this.activeBranch);
      return a;
    }
  }

  addressLastMain() {
    if (this.children.length === 0) {
      return [];
    }
    else {
      let a = this.children[0].addressLastMain();
      a.unshift(0);
      return a;
    }
  }

  activeMoves() {
    let result;
    if (this.activeBranch === -1) {
      result = [];
    }
    else {
      result = this.children[this.activeBranch].activeMoves();
    }
    if (this.move) {
      result.unshift(this.move);
    }
    return result;
  }

  activeMove() {
    if (this.activeBranch === -1) {
      return this.move;
    }
    else {
      return this.children[this.activeBranch].activeMove();
    }
  }

  moveAt(address) {
    if (address.length === 0) {
      return this.move;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].moveAt(address.slice(1));
    }
  }

  getChildren() {
    if (this.activeBranch === -1) {
      return this.children;
    }
    else {
      return this.children[this.activeBranch].getChildren();
    }
  }

  getChildrenAt(address) {
    if (address.length === 0) {
      return this.children;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getChildrenAt(address.slice(1));
    }
  }

  activeHalfmove() {
    if (this.activeBranch === -1) {
      return this.halfmove;
    }
    else {
      return this.children[this.activeBranch].activeHalfmove();
    }
  }

  halfmoveAt(address) {
    if (address.length === 0) {
      return this.halfmove;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].halfmoveAt(address.slice(1));
    }
  }

  activateAddress(address) {
    if (address.length === 0) {
      this.activeBranch = -1;
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      if (this.children[address[0]].activateAddress(address.slice(1))) {
        this.activeBranch = address[0];
        return true;
      }
      else
        return false;
    }
  }

  addressExists(address) {
    if (address.length===0) {
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addressExists(address.slice(1));
    }
  }

  numberOfBranches() {
    if (this.activeBranch === -1) {
      return this.children.length;
    }
    else {
      return this.children[this.activeBranch].numberOfBranches();
    }
  }

  numberOfBranchesAt(address) {
    if (address.length === 0) {
      return this.children.length;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].numberOfBranchesAt(address.slice(1));
    }
  }

  level() {
    if (this.activeBranch === -1) {
      return 0;
    }
    else if (this.activeBranch === 0) {
      return this.children[this.activeBranch].level();
    }
    else {
      return 1 + this.children[this.activeBranch].level();
    }
  }

  levelAt(address) {
    if (address.length === 0) {
      return 0;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else if (address[0] === 0) {
      return this.children[address[0]].levelAt(address.slice(1));
    }
    else {
      let x = this.children[address[0]].levelAt(address.slice(1));
      if (x === null)
        return null
      else
        return 1 + x;
    }
  }

  copy() {
    let copy = new moveTree(this.move, this.halfmove);
    copy.activeBranch = this.activeBranch;
    copy.comment = [...this.comment];
    copy.annotation = [...this.annotation];
    for (let i=0; i<this.children.length; ++i) {
      copy.children.push(this.children[i].copy());
    }
    return copy;
  }

  toString() {
    let result = "";
    if (this.children.length>0) {
      result += this.children[0].move.san + " ";
    }
    for (let i=1; i < this.children.length; i++) {
      result += "(";
      result += this.children[i].move.san + " " + this.children[i].toString();
      result += ") ";
    }
    if (this.children.length>0) {
      result += this.children[0].toString();
    }
    return result;
  }

  toPGN(forceMoveNumber=true) {
    let result = "";
    if (this.move === null) { // this only happens at the root of the tree
      // we print the comments before the start of the game
      for (let i=0; i<this.comment.length; ++i) {
        result += "{" + this.comment[i] + "} ";
      }
    }
    // write main line move
    if (this.children.length>0) {
      if (this.children[0].halfmove % 2 === 1) {
        result += (this.children[0].halfmove+1)/2 + ". ";
      }
      else if (forceMoveNumber) {
        result += this.children[0].halfmove/2 + "... ";
      }
      result += this.children[0].move.san + " ";
      for (let i=0; i<this.children[0].annotation.length; ++i) {
        // we skip the space after the move for suffix annotations
        if (i === 0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.children[0].annotation[i])) result = result.slice(0,-1);
        result += this.children[0].annotation[i] + " ";
      }
      for (let i=0; i<this.children[0].comment.length; ++i) {
        result += "{" + this.children[0].comment[i] + "} ";
      }
    }
    // write variations
    for (let i=1; i < this.children.length; i++) {
      result += "(";
      if (this.children[i].halfmove % 2 === 1) {
        result += (this.children[i].halfmove+1)/2 + ". ";
      }
      else {
        result += this.children[i].halfmove/2 + "... ";
      }
      result += this.children[i].move.san + " ";
      for (let j=0; j<this.children[i].annotation.length; ++j) {
        // we skip the space after the move for suffix annotations
        if (j===0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.children[0].annotation[i])) result = result.slice(0,-1);
        result += this.children[i].annotation[j] + " ";
      }
      for (let j=0; j<this.children[i].comment.length; ++j) {
        result += "{" + this.children[i].comment[j] + "} ";
      }
      // force the move number if there was a comment before the next move
      result += this.children[i].toPGN(this.children[i].comment.length > 0);
      result = result.slice(0,result.length-1);
      result += ") ";
    }
    // continue main line
    if (this.children.length>0) {
      // if a variation or comment are before the next move, we have to force the move number
      result += this.children[0].toPGN(this.children.length>1 || this.children[0].comment.length>0);
    }
    return result;
  }

  toPGNMain(withcomments=false,forceMoveNumber=true) {
    let result = "";
    if (withcomments && this.move === null) { // this only happens at the root of the tree
      // we print the comments before the start of the game
      for (let i=0; i<this.comment.length; ++i) {
        result += "{" + this.comment[i] + "} ";
      }
    }
    if (this.children.length>0) {
      if (this.children[0].halfmove % 2 === 1) {
        result += (this.children[0].halfmove+1)/2 + ". ";
      }
      else if (forceMoveNumber) {
        result += this.children[0].halfmove/2 + "... ";
      }
      result += this.children[0].move.san + " ";
      if (withcomments){
        for (let i=0; i<this.children[0].annotation.length; ++i) {
          // we skip the space after the move for suffix annotations
          if (i===0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.children[0].annotation[i])) result = result.slice(0,-1);
          result += this.children[0].annotation[i] + " ";
        }
        for (let i=0; i<this.children[0].comment.length; ++i) {
          result += "{" + this.children[0].comment[i] + "} ";
        }
      }
      result += this.children[0].toPGNMain(withcomments,withcomments && this.children[0].comment.length>0);
    }
    return result;
  }

  addComment(s) {
    if (this.activeBranch === -1) {
      this.comment.push(s);
    }
    else {
      this.children[this.activeBranch].addComment(s);
    }
  }

  deleteComment(index) {
    if (this.activeBranch === -1) {
      if (index === null) {
        index = this.comment.length-1;
      }
      if (this.comment.length > index) {
        this.comment.splice(index,1);
      }
    }
    else {
      this.children[this.activeBranch].deleteComment(index);
    }
  }

  deleteAllComments() {
    if (this.activeBranch === -1) {
        this.comment.length = 0;
    }
    else {
      this.children[this.activeBranch].deleteAllComments();
    }
  }

  getComment(index=0) {
    if (this.activeBranch === -1) {
      if (this.comment.length > index) {
        return this.comment[index];
      }
    }
    else {
      return this.children[this.activeBranch].getComment(index);
    }
  }

  getComments() {
    if (this.activeBranch === -1) {
        return this.comment.slice();
    }
    else {
      return this.children[this.activeBranch].getComments();
    }
  }

  addCommentAt(s,address) {
    if (address.length === 0) {
      this.comment.push(s);
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addCommentAt(s,address.slice(1));
    }
  }

  deleteCommentAt(address,index) {
    if (address.length === 0) {
      if (index === null) {
        index = this.comment.length-1;
      }
      if (index < this.comment.length) {
        this.comment.splice(index,1);
        return true;
      }
      else {
        return false;
      }
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteCommentAt(address.slice(1),index);
    }
  }

  deleteAllCommentsAt(address) {
    if (address.length === 0) {
        this.comment.length = 0;
        return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteAllCommentsAt(address.slice(1));
    }
  }

  getCommentAt(address,index=0) {
    if (address.length === 0) {
      if (index < this.comment.length) {
        return this.comment[index];
      }
      else
        return null;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getCommentAt(address.slice(1),index);
    }
  }

  getCommentsAt(address) {
    if (address.length === 0) {
        return this.comment.slice();
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getCommentsAt(address.slice(1));
    }
  }

  clearComments() {
    this.comment.length = 0;
    for (let i=0; i<this.children.length; ++i) {
      this.children[i].clearComments();
    }
  }

  addAnnotation(s) {
    if (!"$?!".includes(s.slice(0,1)))
      return;
    if (this.activeBranch === -1) {
      this.annotation.push(s);
    }
    else {
      this.children[this.activeBranch].addAnnotation(s);
    }
  }

  deleteAnnotation(index) {
    if (this.activeBranch === -1) {
      if (index === null) {
        index = this.annotation.length-1;
      }
      if (this.annotation.length > index) {
        this.annotation.splice(index,1);
      }
    }
    else {
      this.children[this.activeBranch].deleteAnnotation(index);
    }
  }

  deleteAllAnnotations() {
    if (this.activeBranch === -1) {
        this.annotation.length = 0;
    }
    else {
      this.children[this.activeBranch].deleteAllAnnotations();
    }
  }

  getAnnotation(index=0) {
    if (this.activeBranch === -1) {
      if (this.annotation.length > index) {
        return this.annotation[index];
      }
    }
    else {
      return this.children[this.activeBranch].getAnnotation(index);
    }
  }

  getAnnotations() {
    if (this.activeBranch === -1) {
        return this.annotation.slice();
    }
    else {
      return this.children[this.activeBranch].getAnnotations();
    }
  }

  addAnnotationAt(s,address) {
    if (!"$?!".includes(s.slice(0,1)))
      return;
    if (address.length === 0) {
      this.annotation.push(s);
      return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].addAnnotationAt(s,address.slice(1));
    }
  }

  deleteAnnotationAt(address,index) {
    if (address.length === 0) {
      if (index === null) {
        index = this.annotation.length-1;
      }
      if (index < this.annotation.length) {
        this.annotation.splice(index,1);
        return true;
      }
      else {
        return false;
      }
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteAnnotationAt(address.slice(1),index);
    }
  }

  deleteAllAnnotationsAt(address) {
    if (address.length === 0) {
        this.annotation.length = 0;
        return true;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.children[address[0]].deleteAllAnnotationsAt(address.slice(1));
    }
  }

  getAnnotationAt(address,index=0) {
    if (address.length === 0) {
      if (index < this.annotation.length) {
        return this.annotation[index];
      }
      else
        return null;
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getAnnotationAt(address.slice(1),index);
    }
  }

  getAnnotationsAt(address) {
    if (address.length === 0) {
        return this.annotation.slice();
    }
    else if (address[0] >= this.children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.children[address[0]].getAnnotationsAt(address.slice(1));
    }
  }

  clearAnnotations() {
    this.annotation.length = 0;
    for (let i=0; i<this.children.length; ++i) {
      this.children[i].clearAnnotations();
    }
  }

  prune() {
    if (this.children.length > 0) {
      this.children = this.children.slice(0,1);
      this.children[0].prune();
    }
  }
}