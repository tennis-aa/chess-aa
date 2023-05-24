export class moveTree {
  #move;
  #children;
  #activeBranch;
  #halfmove;
  #comment;
  #annotation;


  constructor(move = null, halfmove = 0) {
    this.#move = move ? {...move}: null;
    this.#children = [];
    this.#activeBranch = -1;
    this.#halfmove = halfmove;
    this.#comment = [];
    this.#annotation = [];
  }

  // accessing trees (private)

  #treeActive() {
    if (this.#activeBranch === -1) {
      return this;
    }
    else {
      return this.#children[this.#activeBranch].#treeActive();
    }
  }

  #treeAt(address) {
    if (address.length === 0) {
      return this;
    }
    else if (address[0] >= this.#children.length || address[0] < 0) {
      return null;
    }
    else {
      return this.#children[address[0]].#treeAt(address.slice(1));
    }
  }

  // Modify: add, remove, prune, clear

  add(move) {
    let tree = this.#treeActive();
    tree.#children.push(new moveTree(move, tree.#halfmove + 1));
    tree.#activeBranch = tree.#children.length - 1;
  }

  addAt(move,address) {
    let tree = this.#treeAt(address);
    if (tree) {
      tree.push( new moveTree(move, tree.#halfmove + 1) );
      return true;
    }
    else {
      return false;
    }
  }

  remove() {
    if (this.#activeBranch === -1) {
      return true;
    }
    else {
      if (this.#children[this.#activeBranch].remove()) {
        this.#activeBranch = -1;
        this.#children.splice(address[0],1);
      }
      return false;
    }
  }

  removeAt(address) {
    if (address.length === 1 && address[0] < this.#children.length) {
      this.#children.splice(address[0],1);
      if (this.#activeBranch === address[0]) {
        this.#activeBranch = -1;
      }
      else if (this.#activeBranch > address[0]) {
        --this.#activeBranch
      }
      return true;
    }
    else if (address[0] >= this.#children.length || address[0] < 0) {
      return false;
    }
    else {
      return this.#children[address[0]].removeAt(address.slice(1));
    }
  }

  prune() {
    if (this.#children.length > 0) {
      this.#children = this.#children.slice(0,1);
      this.#children[0].prune();
    }
  }

  clear() {
    this.#children.length = 0;
    this.#activeBranch = -1
    this.#move = null;
    this.#comment.length = 0;
    this.#halfmove = 0;
    this.#annotation.length = 0;
  }

  // navigating: undo, redo, activate address

  undo() {
    if (this.#activeBranch === -1) {
      return true;
    }
    else {
      if (this.#children[this.#activeBranch].undo()) {
        this.#activeBranch = -1;
      }
      return false;
    }
  }

  redo(branch) {
    let tree = this.#treeActive();
    if (branch < tree.#children.length && branch >= 0) {
      tree.#activeBranch = branch;
      tree.#children[branch].#activeBranch = -1;
      return true;
    }
    else {
      return false;
    }
  }

  activateAddress(address) {
    if (address.length === 0) {
      this.#activeBranch = -1;
      return true;
    }
    else if (address[0] >= this.#children.length || address[0] < 0) {
      return false;
    }
    else {
      if (this.#children[address[0]].activateAddress(address.slice(1))) {
        this.#activeBranch = address[0];
        return true;
      }
      else
        return false;
    }
  }

  // accessing address

  address() {
    if (this.#activeBranch === -1) {
      return [];
    }
    else {
      let a = this.#children[this.#activeBranch].address();
      a.unshift(this.#activeBranch);
      return a;
    }
  }

  addressLastMain() {
    if (this.#children.length === 0) {
      return [];
    }
    else {
      let a = this.#children[0].addressLastMain();
      a.unshift(0);
      return a;
    }
  }

  addressExists(address) {
    let tree = this.#treeAt(address);
    if (tree) {
      return true;
    }
    return false;
  }

  // accessing moves

  getMove() {
    let tree = this.#treeActive();
    return tree.#move;
  }

  getMoveAt(address) {
    let tree = this.#treeAt(address);
    if (tree) {
      return tree.#move;
    }
    return null;
  }

  getChildMove(branch = 0) {
    let tree = this.#treeActive();
    if (branch < tree.#children.length && branch >= 0){
      return tree.#children[branch].#move;
    }
    else {
      return null;
    }
  }

  getChildrenMoves() {
    let tree = this.#treeActive();
    let result = new Array(tree.#children.length);
    for (let i=0; i < result.length; ++i) {
      result[i] = tree.#children[i].#move;
    }
    return result;
  }

  getChildrenMovesAt(address) {
    let tree = this.#treeAt(address);
    let result = new Array(tree.#children.length);
    for (let i=0; i < result.length; ++i) {
      result[i] = tree.#children[i].#move;
    }
    return result;
  }

  getVariation() {
    let result;
    if (this.#activeBranch === -1) {
      result = [];
    }
    else {
      result = this.#children[this.#activeBranch].getVariation();
    }
    if (this.#move) {
      result.unshift(this.#move);
    }
    return result;
  }

  // comments

  addComment(s) {
    let tree = this.#treeActive();
    tree.#comment.push(s);
  }

  addCommentAt(s,address) {
    let tree = this.#treeAt(address);
    if (tree) {
      tree.#comment.push(s);
      return true;
    }
    return false
  }

  deleteComment(index = null) {
    let tree = this.#treeActive();
    if (index === null) {
      index = tree.#comment.length-1;
    }
    if (index >= 0 && index < tree.#comment.length) {
      tree.#comment.splice(index,1);
      return true;
    }
    return false;
  }

  deleteCommentAt(address,index = null) {
    let tree = this.#treeAt(address);
    if (tree) {
      if (index === null) {
        index = tree.#comment.length-1;
      }
      if (index >= 0 && index < tree.#comment.length) {
        tree.#comment.splice(index,1);
        return true;
      }
    }
    return false;
  }

  deleteAllComments() {
    let tree = this.#treeActive();
    tree.#comment.length = 0;
  }

  deleteAllCommentsAt(address) {
    let tree = this.#treeAt(address);
    if (tree) {
      tree.#comment.length = 0;
      return true;
    }
    return false;
  }

  editComment(s,index=0) {
    let tree = this.#treeActive();
    if (index >= 0 && index < tree.#comment.length) {
      tree.#comment[index] = s;
      return true;
    }
    else
      return false;
  }

  editCommentAt(s,address,index=0) {
    let tree = this.#treeAt(address);
    if (tree && index >= 0 && index < tree.#comment.length) {
      tree.#comment[index] = s;
      return true;
    }
    return false;
  }

  getComment(index=0) {
    let tree = this.#treeActive();
    if (tree.#comment.length > index) {
      return tree.#comment[index];
    }
    else {
      return null;
    }
  }

  getCommentAt(address,index=0) {
    let tree = this.#treeAt(address);
    if (tree && index >= 0 && index < tree.#comment.length) {
      return tree.#comment[index];
    }
    return false;
  }

  getComments() {
    let tree = this.#treeActive();
    return tree.#comment.slice();
  }

  getCommentsAt(address) {
    let tree = this.#treeAt(address);
    if (tree) {
      return tree.#comment.slice();
    }
    return false;
  }

  clearComments() {
    this.#comment.length = 0;
    for (let i=0; i<this.#children.length; ++i) {
      this.#children[i].clearComments();
    }
  }

  // annotations

  typeAnnotation(s) {
    if (["!", "?", "!!", "!?", "?!","??"].includes(s)) return "san";
    else if (s.startsWith("$")) {
      let n = Number(s.slice(1));
      if (n && Number.isInteger(n) && n >= 0 && n < 256) 
        return "nag";
    }
    return null;
  }

  addAnnotation(s) {
    let tree = this.#treeActive();
    let type = this.typeAnnotation(s);
    if (type === null)
      return false;
    else if (type === "san" && tree.#annotation.length > 0) {
      if (this.typeAnnotation(tree.#annotation[0]) === "san") {
        tree.#annotation[0] = s;
      }
      else {
        tree.#annotation.unshift(s);
      }
      return true;
    }
    else {
      tree.#annotation.push(s);
      return true;
    }
  }

  addAnnotationAt(s,address) {
    let tree = this.#treeAt(address);
    let type = this.typeAnnotation(s);
    if (!tree || type === null) return false;
    else if (type === "san" && tree.#annotation.length > 0) {
      if (this.typeAnnotation(tree.#annotation[0]) === "san") {
        tree.#annotation[0] = s;
      }
      else {
        tree.#annotation.unshift(s);
      }
      return true;
    }
    else {
      tree.#annotation.push(s);
      return true;
    }
  }

  deleteAnnotation(index = null) {
    let tree = this.#treeActive();
    if (index === null) {
      index = tree.#annotation.length-1;
    }
    if (tree.#annotation.length > index) {
      tree.#annotation.splice(index,1);
      return true
    }
    else 
      return false;
  }

  deleteAnnotationAt(address,index = null) {
    let tree = this.#treeAt(address);
    if (tree) {
      if (index === null) {
        index = tree.#annotation.length-1;
      }
      if (index >= 0 && index < tree.#annotation.length) {
        tree.#annotation.splice(index,1);
        return true;
      }
    }
    return false;
  }

  deleteAllAnnotations() {
    let tree = this.#treeActive();
    tree.#annotation.length = 0;
  }

  deleteAllAnnotationsAt(address) {
    let tree = this.#treeAt(address);
    if (tree) {
      tree.#annotation.length = 0;
      return true;
    }
    return false;
  }

  getAnnotation(index=0) {
    let tree = this.#treeActive();
    if (tree.#annotation.length > index) {
      return tree.#annotation[index];
    }
    return null;
  }

  getAnnotationAt(address,index=0) {
    let tree = this.#treeAt(address);
    if (tree) {
      if (index >= 0 && index < tree.#annotation.length) {
        return tree.#annotation[index];
      }
    }
    return null;
  }

  getAnnotations() {
    let tree = this.#treeActive();
    return tree.#annotation.slice();
  }

  getAnnotationsAt(address) {
    let tree = this.#treeAt(address);
    if (tree) {
        return tree.#annotation.slice();
    }
    return null;
  }

  clearAnnotations() {
    this.#annotation.length = 0;
    for (let i=0; i<this.#children.length; ++i) {
      this.#children[i].clearAnnotations();
    }
  }

  // accessing other

  halfmoveActive() {
    let tree = this.#treeActive();
    return tree.#halfmove;
  }

  halfmoveAt(address) {
    let tree = this.#treeAt(address);
    return tree.#halfmove;
  }

  numberOfBranches() {
    let tree = this.#treeActive();
    return tree.#children.length;
  }

  numberOfBranchesAt(address) {
    let tree = this.#treeAt(address);
    return tree.#children.length;
  }

  level() {
    if (this.#activeBranch === -1) {
      return 0;
    }
    else if (this.#activeBranch === 0) {
      return this.#children[this.#activeBranch].level();
    }
    else {
      return 1 + this.#children[this.#activeBranch].level();
    }
  }

  levelAt(address) {
    if (address.length === 0) {
      return 0;
    }
    else if (address[0] >= this.#children.length || address[0] < 0) {
      return null;
    }
    else if (address[0] === 0) {
      return this.#children[address[0]].levelAt(address.slice(1));
    }
    else {
      let x = this.#children[address[0]].levelAt(address.slice(1));
      if (x === null)
        return null
      else
        return 1 + x;
    }
  }

  // printing pgn

  toPGN(forceMoveNumber=true) {
    let result = "";
    if (this.#move === null) { // this only happens at the root of the tree
      // we print the comments before the start of the game
      for (let i=0; i<this.#comment.length; ++i) {
        result += "{" + this.#comment[i] + "} ";
      }
    }
    // write main line move
    if (this.#children.length>0) {
      if (this.#children[0].#halfmove % 2 === 1) {
        result += (this.#children[0].#halfmove+1)/2 + ". ";
      }
      else if (forceMoveNumber) {
        result += this.#children[0].#halfmove/2 + "... ";
      }
      result += this.#children[0].#move.san + " ";
      for (let i=0; i<this.#children[0].#annotation.length; ++i) {
        // we skip the space after the move for suffix annotations
        if (i === 0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.#children[0].#annotation[i])) result = result.slice(0,-1);
        result += this.#children[0].#annotation[i] + " ";
      }
      for (let i=0; i<this.#children[0].#comment.length; ++i) {
        result += "{" + this.#children[0].#comment[i] + "} ";
      }
    }
    // write variations
    for (let i=1; i < this.#children.length; ++i) {
      result += "(";
      if (this.#children[i].#halfmove % 2 === 1) {
        result += (this.#children[i].#halfmove+1)/2 + ". ";
      }
      else {
        result += this.#children[i].#halfmove/2 + "... ";
      }
      result += this.#children[i].#move.san + " ";
      for (let j=0; j<this.#children[i].#annotation.length; ++j) {
        // we skip the space after the move for suffix annotations
        if (j===0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.#children[0].#annotation[i])) result = result.slice(0,-1);
        result += this.#children[i].#annotation[j] + " ";
      }
      for (let j=0; j<this.#children[i].#comment.length; ++j) {
        result += "{" + this.#children[i].#comment[j] + "} ";
      }
      // force the move number if there was a comment before the next move
      result += this.#children[i].toPGN(this.#children[i].#comment.length > 0);
      result = result.slice(0,result.length-1);
      result += ") ";
    }
    // continue main line
    if (this.#children.length>0) {
      // if a variation or comment are before the next move, we have to force the move number
      result += this.#children[0].toPGN(this.#children.length>1 || this.#children[0].#comment.length>0);
    }
    return result;
  }

  toPGNMain(withcomments=false,forceMoveNumber=true) {
    let result = "";
    if (withcomments && this.#move === null) { // this only happens at the root of the tree
      // we print the comments before the start of the game
      for (let i=0; i<this.#comment.length; ++i) {
        result += "{" + this.#comment[i] + "} ";
      }
    }
    if (this.#children.length>0) {
      if (this.#children[0].#halfmove % 2 === 1) {
        result += (this.#children[0].#halfmove+1)/2 + ". ";
      }
      else if (forceMoveNumber) {
        result += this.#children[0].#halfmove/2 + "... ";
      }
      result += this.#children[0].#move.san + " ";
      if (withcomments){
        for (let i=0; i<this.#children[0].#annotation.length; ++i) {
          // we skip the space after the move for suffix annotations
          if (i===0 && ["!", "?", "!!", "!?", "?!","??"].includes(this.#children[0].#annotation[i])) result = result.slice(0,-1);
          result += this.#children[0].#annotation[i] + " ";
        }
        for (let i=0; i<this.#children[0].#comment.length; ++i) {
          result += "{" + this.#children[0].#comment[i] + "} ";
        }
      }
      result += this.#children[0].toPGNMain(withcomments,withcomments && this.#children[0].#comment.length>0);
    }
    return result;
  }

  // other utilities

  copy() {
    let copy = new moveTree(this.#move, this.#halfmove);
    copy.#activeBranch = this.#activeBranch;
    copy.#comment = [...this.#comment];
    copy.#annotation = [...this.#annotation];
    for (let i=0; i<this.#children.length; ++i) {
      copy.#children.push(this.#children[i].copy());
    }
    return copy;
  }
}