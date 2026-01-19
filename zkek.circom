pragma circom 2.2.3;

// include "./node_modules/circomlib/circuits/"

template ZKek() {
  // inputs
  signal input a;
  signal input b;
  signal input c;

  // constraints 
  c  === a * b;
}

component main{public [a, b]} = ZKek();
