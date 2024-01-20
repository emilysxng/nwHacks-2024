from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import sys

app = Flask(__name__)
CORS(app, origins="*");
socketio = SocketIO(app, cors_allowed_origins="*", cors_credentials=True)

@app.route('/')
def index():
    return "Hello World!"

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('frame')
def handle_frame(data):
    print('Client sent frame')

if __name__ == '__main__':
    print(sys.version)
    socketio.run(app, port=3001)