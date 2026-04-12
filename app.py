from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import json
import csv

app = Flask(__name__)
CORS(app)

# -------------------------------
# Load the dataset
# -------------------------------
df = pd.read_csv('disease_data.csv')

# Separate features and target
X = df.drop('disease', axis=1)
y = df['disease']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train model
model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)

# Load remedies
with open('remedies.json', 'r') as f:
    remedies = json.load(f)

# -------------------------------
# Helper function
# -------------------------------
def get_symptoms():
    symptoms = set()
    with open('disease_data.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            for symptom, value in row.items():
                if symptom != 'disease' and int(value) == 1:
                    symptoms.add(symptom)
    return list(symptoms)

# -------------------------------
# Routes
# -------------------------------

# Homepage
@app.route('/')
def home():
    return render_template('index.html')

# Get symptoms
@app.route('/symptoms', methods=['GET'])
def symptoms():
    return jsonify(get_symptoms())

# 🔥 FIXED Predict Route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        symptoms_input = request.json['symptoms']

        symptoms_data = {
            symptom: 1 if symptom in symptoms_input else 0
            for symptom in X.columns
        }

        symptoms_df = pd.DataFrame([symptoms_data])
        symptoms_scaled = scaler.transform(symptoms_df)

        prediction = model.predict(symptoms_scaled)[0]

        # ✅ Clean display name
        display_name = prediction.replace("_", " ").title()

        return jsonify({
            'disease': prediction,          # for backend use
            'display_name': display_name    # for UI
        })

    except Exception as e:
        print("Prediction Error:", e)
        return jsonify({'error': str(e)})

# 🔥 FIXED Remedies Route
@app.route('/remedies', methods=['POST'])
def get_remedies():
    try:
        disease = request.json['disease']

        # ✅ Fix case mismatch
        disease = disease.lower()

        print("Received disease:", disease)

        remedy = remedies.get(disease)

        if not remedy:
            return jsonify({'remedy': "No remedy found for this disease."})

        return jsonify({'remedy': remedy})

    except Exception as e:
        print("Remedy Error:", e)
        return jsonify({'error': str(e)})

# -------------------------------
# Main
# -------------------------------
if __name__ == '__main__':
    print("Available routes:", app.url_map)
    app.run(debug=True)
