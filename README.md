# Movie Time Planner

Provide a list of local movie times in chronological order. It answers the question "What's playing next?"

A project used to improve knowledge of the node.js/npm ecosystem.

It achieves its goal by scraping a movie listing site. As such, it provides not only browser code but also a small server.

## Getting Started

### Installing

The GitHub repositor must be cloned and rebuilt.

```
git clone https://github.com/mlresnick/movie-time-planner.git
cd movie-time-planner
npm install
npm run gulp recreateDist
```

### Scripts

Use the npm `list` script to list available scripts

```
npm run list
```

### Starting the application

Start the included server
```
npm run startdev
```
Navigate the browser to the port number displayed by the `startdev` script. For example `http://localhost:8080`.

