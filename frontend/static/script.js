console.log("Script loaded");

let symptomCount = 0;

const symptomBoxesContainer = document.getElementById('symptom-boxes');
const resultDiv = document.getElementById('result');
const addSymptomButton = document.getElementById('addSymptomButton');
const predictButton = document.getElementById('predictButton');
const remediesDiv = document.getElementById('remedies');

// Fetch symptoms from backend
fetch('/symptoms')
    .then(response => response.json())
    .then(symptoms => {
        console.log("Symptoms fetched:", symptoms);

        // Add initial symptom boxes
        for (let i = 0; i < 3; i++) {
            addSymptomBox(symptoms);
        }

        // Add symptom button
        addSymptomButton.addEventListener('click', () => {
            addSymptomBox(symptoms);
        });

        // Predict button
        predictButton.addEventListener('click', () => {
            const selectedSymptoms = Array.from(document.querySelectorAll('select'))
                .map(select => select.value)
                .filter(val => val !== "Select a symptom");

            predictDisease(selectedSymptoms);
        });
    })
    .catch(error => {
        console.error('Error fetching symptoms:', error);
    });

// Create dropdown
function addSymptomBox(symptoms) {
    const div = document.createElement('div');
    div.className = 'symptom-box';

    const select = document.createElement('select');

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a symptom';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    symptoms.forEach(symptom => {
        const option = document.createElement('option');
        option.value = symptom;
        option.textContent = symptom;
        select.appendChild(option);
    });

    div.appendChild(select);
    symptomBoxesContainer.appendChild(div);
}

// Predict disease
function predictDisease(selectedSymptoms) {
    console.log("Selected symptoms:", selectedSymptoms);

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symptoms: selectedSymptoms })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Prediction result:", data);

        // Show formatted name
        resultDiv.textContent = `The predicted disease is: ${data.disease}`;

        // 🔥 Use ORIGINAL disease for backend
        fetchRemedies(data.disease);
    })
    .catch(error => {
        console.error('Prediction error:', error);
        resultDiv.textContent = 'An error occurred during prediction.';
    });
}

// 🔥 FIXED REMEDIES FUNCTION
function fetchRemedies(disease) {
    fetch('/remedies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disease: disease })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Remedy result:", data);

        if (data.remedy) {
            remediesDiv.textContent = `Remedy: ${data.remedy}`;
        } else {
            remediesDiv.textContent = 'No remedy found.';
        }
    })
    .catch(error => {
        console.error('Error fetching remedies:', error);
        remediesDiv.textContent = 'An error occurred while fetching remedies.';
    });
}
