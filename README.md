#Back end creation
//create folders
#mkdir controllers db middlewares models routes utils

#env feture nodemon -r dotenv/config 
  "dev": "nodemon -r dotenv/config --experimental-json-module src/index.js"src/index.js
<!-- dev dependency -->
npm i -D prettier

<!-- !Generate the access token JWT -->
<!-- node --Enter
require('crypto').randomBytes(64).toString('hex') -->