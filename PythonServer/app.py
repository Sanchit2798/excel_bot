import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from llm.gemini_code_generator import GeminiCodeGenerator

load_dotenv()

app = Flask(__name__)
CORS(app)

gemini_code_generator = GeminiCodeGenerator(api_key=os.getenv("API_KEY"), model="gemini-2.5-flash")

@app.route('/api', methods=['POST'])
def handle_request():
    print("Received request")
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400
        
        code = gemini_code_generator.generate_code(
            specification=data['question'],
        ) 
        with open(os.getenv("OUTPUT_FILE"), "w") as f:
            f.write(code)  
        return jsonify(code), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)