dockerclean() {
    docker system prune --volumes -f
    docker rmi -f $(docker images)
}

dockerkill() {
    docker kill $(docker ps -q)
}

alias dcu="docker-compose up"
alias dcub="docker-compose up --build"