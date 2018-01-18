Group corsework in university

# Introduction and development guide

---

## Introduction
This project was bootstrapped with 
* [Create React App](https://github.com/facebookincubator/create-react-app), 
* [Python-docs-samples](https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/appengine/standard/flask/tutorial) 
* [Material ui](https://material-ui-next.com/). 

In this project, there were four cloud services involved: 
* [The Google Identity Platform](https://developers.google.com/identity/)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 
* [Twilio Programmerable Chat](https://www.twilio.com/chat)
* [IBM Watson Natural Language Classifier](https://www.ibm.com/watson/services/natural-language-classifier/)   

---

## Preparation

### 1 Setting up cloud services
To run the application you'll need to gather all cloud services credentials and configure them in **example.env** and **app.yaml**.


[The Google Identity Platform](https://developers.google.com/identity/)
*  GOOGLE_CLIENT_ID
*  GOOGLE_CLIENT_SECRET
*  REDIRECT_URI  

[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* MONGODB_URI

[Twilio Programmerable Chat](https://www.twilio.com/chat)
* TWILIO_ACCOUNT_SID
* TWILIO_API_KEY
* TWILIO_API_SECRET
* TWILIO_CHAT_SERVICE_SID

[IBM Watson Natural Language Classifier](https://www.ibm.com/watson/services/natural-language-classifier/)   

* VERSION
* USERNAME
* PASSWORD

### 2 Dependencies installing
After setting up all the configurations, the first thing is to install all the dependencies. For Python, we used **Pip** to manage all the backend dependencies. For JavaScript, we used **Npm/Yarn** to do the frontend denpendencies management.
1. Clone the repository
```bash
git clone https://github.com/promer94/SocialFamily.git
```
2. Open the **web_application** and install all the dependencies. 
Before you install the python dependencies, you might to create a virtual enviorment first.  
```bash
pip install virtualenv env
virtualenv env
source env/bin/activate
pip install -r -requirements.txt
```
After all the python dependencies installed, you should be able to run the **app.py**
```bash
python app.py
```
Next step is to install the JavaScript denpendencies.
```bash
npm install
```
It will install all the dependencies decleared in **package.json**. Run
```bash
npm start
```
It will start a dev-server for frontend. Then you should be able to have a quick look about the frontend page.

---
## Development
Thanks to [Create React App](https://github.com/facebookincubator/create-react-app), it provides us with a dev-server that could help us to develop. You should start the development by editing the **src** folder, **app.py** and **app.yaml**. Once you are satisfied with you frontend, run
```bash
npm run build
```
It will produce a folder called **static**. After that you can start the python http server by
```
python app.py
```
To test your application.

We recommend you to use [Visual Studio Code](https://code.visualstudio.com/). There is a list of vscode extensions that might impove your productivity:
* [ESLint for JavaScript lint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) The configuration file is included in this project.
* [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) It can automatically format your code.
* [Sublime Babel](https://marketplace.visualstudio.com/items?itemName=joshpeng.sublime-babel-vscode) Display syntax highlight.
* [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense) Autocomplete filenames
* [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) Python support in vscode.
* [Git Extension Pack](https://marketplace.visualstudio.com/items?itemName=donjayamanne.git-extension-pack) Git support in vscode

For chrome and firefox, we can use [react developer tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) to debug the application.

---
## Deploy
We using google app engine flexiable enviorment to hosting our webapplication. If you want deploy it from your local machine, you need download [google cloud SDK](https://cloud.google.com/sdk/) first. 
1. Clone the repository
```bash
git clone https://github.com/promer94/SocialFamily.git
cd SocialFamily
cd web_application
```
2. Set up virtual enviorment for python and install the denpencies
```bash
pip install virtualenv env
virtualenv env
source env/bin/activate
pip install -r -requirements.txt
```
3. Produce the static folder
```bash
npm install
npm run build
```
4. Initialize the google cloud sdk and deploy
```bash
gcloud init
gcloud app deploy
```
