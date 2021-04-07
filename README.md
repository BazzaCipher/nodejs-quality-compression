# Image optimisation server

This program is part of our Food Photo Journal project for the Hackiethon 2021 hackathon, which is intended to promote healthy eating while working and learning from home. See the [main repo](https://github.com/BazzaCipher/new-super-mario-bros-2) for further information.

This repo contains a Node.js app hosted on Heroku that reduces the size of uploaded images with imagemin, before saving them to Firebase Storage and accessing the Firestore database to assign the user a new random 'foodimal'.