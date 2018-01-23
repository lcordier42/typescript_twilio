#!/bin/bash

set -eux

tmux new-session -d

tmux split-window -t :0.0 -v
tmux split-window -t :0.0 -v
tmux split-window -t :0.0 -v

tmux select-layout tiled

tmux send-keys -t :0.0 'node_modules/.bin/tsc --pretty --watch' C-m
tmux send-keys -t :0.1 'node_modules/.bin/jest --watch' C-m
tmux send-keys -t :0.2 'node_modules/.bin/nodemon --watch server.js server.js' C-m

tmux attach-session
