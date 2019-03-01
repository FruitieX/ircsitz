with import <nixpkgs> {};
stdenv.mkDerivation {
  name = "env";

  # needed by node-gyp
  PYTHON = "${pkgs.python2}/bin/python";

  buildInputs = [
    bashInteractive
    unstable-small.nodejs-10_x
    unstable-small.yarn
  ];
}
