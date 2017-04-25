cd client
gnome-terminal -e "webpack -w"
gnome-terminal -e "gulp watch"
cd ../server
gnome-terminal -e "nodemon server.js"
