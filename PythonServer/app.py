from flask import Flask, request, jsonify, render_template
from google import genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api', methods=['POST'])
def handle_request():
    print("Received request")
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        # Process the data (example: echo back the received data)
        client = genai.Client(api_key="AIzaSyB6Z6F1VX17QJLGscr1Qa9x2K3pijONTNs")

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=data["question"],
        )
        print(response.text)
        code = response.text.split("javascript", 1)[1][:-3]  # Get the part after 'javascript
        with open("C:/Users/sanch/OfficeAddinApps/excel-get-started-with-dev-kit/src/taskpane/output.js", "w") as f:
            f.write(code)  
        return jsonify(code), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)