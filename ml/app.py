from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from sklearn.linear_model import LinearRegression
import os

app = Flask(__name__)
CORS(app)

# Simple ML model for focus prediction
# In production, you'd train this on real data
# For now, we'll use a simple heuristic-based model

class FocusPredictor:
    def __init__(self):
        # Simple weights-based model
        # Higher typing speed = better focus
        # Higher idle time = worse focus
        # More tab switches = worse focus
        self.weights = {
            'typing_speed': 0.3,  # Positive impact
            'idle_time': -1.0,    # Negative impact (increased from -0.5)
            'tab_switches': -0.3  # Negative impact (increased from -0.2)
        }
        self.baseline_score = 75
    
    def predict(self, typing_speed, idle_time, tab_switches):
        # Normalize inputs
        normalized_typing = min(typing_speed / 60, 1.0)  # Assume 60 WPM is max
        
        # Idle time: use a more aggressive normalization
        # After 30 seconds, start heavily penalizing
        # Cap at 120 seconds for normalization, but allow higher values
        if idle_time <= 30:
            normalized_idle = idle_time / 30  # 0 to 1 for 0-30 seconds
        else:
            # After 30 seconds, increase penalty more aggressively
            normalized_idle = 1.0 + (idle_time - 30) / 30  # 1.0 to 4.0 for 30-120 seconds
        
        normalized_tabs = min(tab_switches / 10, 1.0)  # 10 switches max
        
        # Calculate score
        score = self.baseline_score
        score += normalized_typing * 20 * self.weights['typing_speed']
        
        # Apply idle time penalty (more aggressive)
        if normalized_idle <= 1.0:
            # 0-30 seconds: moderate penalty
            score += normalized_idle * 25 * self.weights['idle_time']
        else:
            # 30+ seconds: heavy penalty
            score += 25 * self.weights['idle_time']  # Base penalty for 30 seconds
            score += (normalized_idle - 1.0) * 40 * self.weights['idle_time']  # Additional heavy penalty
        
        score += normalized_tabs * 15 * self.weights['tab_switches']
        
        # Clamp between 0 and 100
        score = max(0, min(100, score))
        
        # Determine label
        if score >= 80:
            label = 'Focused'
        elif score >= 50:
            label = 'Losing Focus'
        else:
            label = 'Distracted'
        
        return {
            'focus_score': round(score, 2),
            'focus_label': label
        }

predictor = FocusPredictor()

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'ok',
        'message': 'FocusFlow ML Service',
        'endpoints': {
            'health': '/health',
            'predict': '/predict (POST)'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        typing_speed = float(data.get('typing_speed', 0))
        idle_time = float(data.get('idle_time', 0))
        tab_switches = float(data.get('tab_switches', 0))
        
        result = predictor.predict(typing_speed, idle_time, tab_switches)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'ML Service is running'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)  # debug=False for production

