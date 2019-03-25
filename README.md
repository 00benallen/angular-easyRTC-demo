# angular-easyRTC-demo

This app contains the server and UI code necessary to create an Angular app which uses easyRTC to communicate P2P with other apps.

## Setup

You will need the usual Node setup, likely along with Angular.

Clone this repo, and run `npm i` in the root directory, you will sadly have to manually terminate this program when it stops printing.

## How to run

Run `npm run start` in the root directory of this app, this will start the local easyRTC development server and the Angular app in its local configuration.

You can also run the Angular app standaline with `npm run start-ui` and the server with `npm run start-local-server`

### Contents

#### Angular App
See the [Angular app's readme](angular_app/README.md) for details on usage, but its a standard Angular app

#### Local Development Server
See the [Local easyRTC server's readme](server/server_example/README.md) for details on usage, its a Node.js + Express server for the most part, using the easyRTC libraries for hosting easyRTC stuff along with Socket.io