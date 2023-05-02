---
sidebar_position: 1
---

# Parcube

Parcube is an Android/iOS app that allows a driver to book an instant parking spot on some home owners sidewalk in the desired area.

## Motivation

We have heard many people complain about availability of parking near their place of work or study. This is especially true for highly populated areas such as the GTA or Mississauga. Another thing we see is many empty driveway around UofT that are not occupied by the house owner's car. So we have decided to develop an app to connect people in need of immediate short-term parking and house owners willing to make some extra income by renting their unused driveway.

## Installation

Prerequisites:
- [Node.js](https://nodejs.org/en/)
- Firebase CLI: `curl -sL firebase.tools | bash`

Husky Installation (In `root`):
1. Install node dependencies: `npm ci`
1. Install husky for pre push git hooks: `npm run prepare`

App Installation Steps (In `app/`):
1. Install node dependencies: `cd app && npm ci`
2. Run expo server: `npm start`
3. Install [Android Expo app](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_CA&gl=US) or [ios Expo Go app](https://apps.apple.com/us/app/expo-go/id982107779) and then scan the QR code in the terminal to have the parcube running in your device (on iPhone just scan using your default camera app)
4. Click on the `Add record to firebase` button and a record should be written to the production firestore

Firebase Emulator Installation Steps (In `firebase/functions`):
1. Install cloud functions dependencies `cd firebase/functions && npm ci`
2. Build cloud functions: `npm run build`
3. Run firebase emulator: `cd .. && firebase emulators:start` (note: run this command in the `firebase/functions` folder)
4. View emulator admin page at: `http://127.0.0.1:4000/`
5. Go to `http://127.0.0.1:5001/parcube-db348/us-central1/testWrite` and a record should be written to the local firestore emulator

## Contribution

The process of contribution to this project is described as follows:

- Use gitflow (feature branches, develop branch)
- Branch names of form: "[feat or bug]-[issue name]"
- Create Trello ticket for issues
- Use github pull requests

## Project status

In active development.

## Licence

MIT
