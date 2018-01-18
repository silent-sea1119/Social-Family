# SourceA
from __future__ import print_function

import json
import os
from functools import wraps
from os.path import dirname, join

import simplejson as json
from dotenv import find_dotenv, load_dotenv
from flask import Flask, jsonify, redirect, request, session, url_for
from flask_cors import CORS
from flask_oauth import OAuth
from inflection import underscore
from pymongo import MongoClient
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import (IpMessagingGrant, SyncGrant,
                                            VideoGrant)
from twilio.rest import Client

from watson_developer_cloud import NaturalLanguageUnderstandingV1
from watson_developer_cloud.natural_language_understanding_v1 import (EntitiesOptions,
                                                                      Features,
                                                                      KeywordsOptions)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


natural_language_understanding = NaturalLanguageUnderstandingV1(
    version='2017-02-27',
    username='02fb23e9-20d1-47da-bfa8-f380cb1a0bc9',
    password='gk3oevbKk7gD')


def GetLineStr(output):
    alllines = output.split('\n')
    lines = []
    for oneline in alllines:
        lines.append(oneline)
    return lines


def sentiment_output(shuru):
    response = natural_language_understanding.analyze(
        text=shuru,
        features=Features(
            keywords=KeywordsOptions(
                emotion=False,
                sentiment=True,
                limit=1)))
    output = json.dumps(response, indent=2)
    return output


def judgement(inputstring):
    orignalOutput = sentiment_output(inputstring)
    processed1 = GetLineStr(orignalOutput)
    checkmess = processed1[12]
    print(checkmess)
    if "negative" in checkmess:
        return False
    else:
        return True


def word_len(s):
    return len([i for i in s.split(' ') if i])


def inputcheck(inputstring):
    num = word_len(inputstring)
    print(inputstring)
    if (num >= 3):
        try:
            result = judgement(inputstring)
            return result
        except:
            return True
    if (num < 3):
        print('Not enough words')
        return True


# Set up Google SignIn
GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
GOOGLE_CLIENT_SECRET = os.environ['GOOGLE_CLIENT_SECRET']
REDIRECT_URI = os.environ['REDIRECT_URI']
SECRET_KEY = os.environ['SECRET_KEY']

# Set up MongoDB
client = MongoClient(os.environ['MONGODB_URI'])
db = client.SocialFamily
collection = db.user

# Set up Twilio API
TWILIO_ACCOUNT_SID = os.environ['TWILIO_ACCOUNT_SID'],
TWILIO_API_KEY = os.environ['TWILIO_API_KEY'],
TWILIO_API_SECRET = (os.environ['TWILIO_API_SECRET']),
TWILIO_CHAT_SERVICE_SID = os.environ['TWILIO_CHAT_SERVICE_SID'],
TWILIO_SYNC_SERVICE_SID = os.environ['TWILIO_SYNC_SERVICE_SID'],


app = Flask(__name__)
CORS(app)
app.secret_key = SECRET_KEY

oauth = OAuth()

google = oauth.remote_app('google',
                          base_url='https://www.google.com/accounts/',
                          authorize_url='https://accounts.google.com/o/oauth2/auth',
                          request_token_url=None,
                          request_token_params={'scope': 'https://www.googleapis.com/auth/userinfo.email',
                                                'response_type': 'code'},
                          access_token_url='https://accounts.google.com/o/oauth2/token',
                          access_token_method='POST',
                          access_token_params={
                              'grant_type': 'authorization_code'},
                          consumer_key=GOOGLE_CLIENT_ID,
                          consumer_secret=GOOGLE_CLIENT_SECRET)


@app.route('/')
def index():
    return loginWithgoogle()


@app.route('/home')
def home():
    return app.send_static_file('index.html')


@app.route('/login')
def login():
    callback = url_for('authorized', _external=True)
    return google.authorize(callback=callback)


@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('home'))
    return wrap


@app.route('/chat')
@is_logged_in
def chat():
    return app.send_static_file('index.html')


@app.route('/logout')
@is_logged_in
def logout():
    session.clear()
    return redirect(url_for('home'))

# route to store the pin
@app.route('/pin', methods=['POST'])
@is_logged_in
def createPin():
    content = request.get_json() or request.form
    session['isFirstLogin'] = False
    # save content['pin'] to the DB
    # the record is already in the DB
    # I don't check is this first login or not
    # add PIN field name
    filter = {'email': session['user_email']}
    record = {
        'pin': content['pin']
    }
    collection.update(filter, {'$set': record})
    return redirect(url_for('home'))


# route to check the pin
@app.route('/checkpin', methods=['POST'])
@is_logged_in
def checkPin():
    content = request.get_json() or request.form
    # validate input pin by comparing it to the DB record
    filter = {'email': session['user_email']}
    cursor = collection.find(filter)
    for c in cursor:
        if c['pin'] == content['pin']:
            return jsonify(valid=True)
        else:
            return jsonify(valid=False)

# route to process messages
@app.route('/sentiment', methods=['POST'])
@is_logged_in
def checkMessage():
    content = request.get_json() or request.form
    message = content['message']
    # send message to IBM Watson
    status = inputcheck(message)
    if status == True:
        return jsonify(status=True)
    else:
        return jsonify(status=False)


@app.route('/userinfo', methods=['GET'])
@is_logged_in
def userInfo():
    return jsonify(
        user_email=session['user_email'],
        user_name=session['user_name'],
        user_picture=session['user_picture'],
        user_status=session['logged_in'],
        user_isFirsttime=session['isFirstLogin']
    )


@app.route('/token', methods=['GET'])
@is_logged_in
def userToken():
    user_name = session['user_email']
    return generateToken(user_name)


@app.route(REDIRECT_URI)
@google.authorized_handler
def authorized(resp):
    access_token = resp['access_token']
    session['access_token'] = access_token, ''
    return redirect(url_for('index'))


@google.tokengetter
def get_access_token():
    return session.get('access_token')


def loginWithgoogle():
    access_token = session.get('access_token')
    if access_token is None:
        return redirect(url_for('home'))

    access_token = access_token[0]
    from urllib2 import Request, urlopen, URLError

    headers = {'Authorization': 'OAuth ' + access_token}
    req = Request('https://www.googleapis.com/oauth2/v1/userinfo',
                  None, headers)
    try:
        res = urlopen(req)
    except URLError, e:
        if e.code == 401:
            # Unauthorized - bad token
            session.pop('access_token', None)
            return redirect(url_for('login'))
        return res.read()

    session['logged_in'] = True
    user_dict = json.loads(res.read().decode("utf-8"))

    session['user_id'] = user_dict['id']
    session['user_email'] = user_dict['email']
    session['user_name'] = user_dict['name']
    session['user_picture'] = user_dict['picture']

    new_user = {'googleId': user_dict['id'],
                'email': user_dict['email'],
                'picture_link': user_dict['picture']
                }
    if(collection.find({'googleId': user_dict['id']}).count() == 0):
        collection.insert_one(new_user)
        session['isFirstLogin'] = True
        return redirect(url_for('chat'))
    else:
        session['isFirstLogin'] = False
        return redirect(url_for('chat'))


def generateToken(identity):
    # get credentials for environment variables
    account_sid = os.environ['TWILIO_ACCOUNT_SID']
    api_key = os.environ['TWILIO_API_KEY']
    api_secret = os.environ['TWILIO_API_SECRET']
    sync_service_sid = os.environ['TWILIO_SYNC_SERVICE_SID']
    chat_service_sid = os.environ['TWILIO_CHAT_SERVICE_SID']

    # Create access token with credentials
    token = AccessToken(account_sid, api_key, api_secret, identity=identity)

    # Create an Chat grant and add to token
    if chat_service_sid:
        chat_grant = IpMessagingGrant(service_sid=chat_service_sid)
        token.add_grant(chat_grant)

    # Return token info as JSON
    return jsonify(identity=identity, token=token.to_jwt().decode('utf-8'))


if __name__ == '__main__':
    app.run(debug=True)
