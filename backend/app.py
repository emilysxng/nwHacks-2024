from flask import flask

app = Flask(__name__)

@app_route('/')
def index():
    return "Hello World!"

if __name__ == "__main__":
    app.run(debug=True) 