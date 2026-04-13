from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

HERITAGE_SITES = [
    {"id": 1, "name": "Taj Mahal", "location": "Agra, India", "type": "Monument"},
    {"id": 2, "name": "Colosseum", "location": "Rome, Italy", "type": "Amphitheatre"},
    {"id": 3, "name": "Machu Picchu", "location": "Peru", "type": "Archaeological Site"},
    {"id": 4, "name": "Great Wall", "location": "China", "type": "Fortification"},
]

@app.route('/api/predict-crowd', methods=['POST'])
def predict_crowd():
    time.sleep(1)
    data = request.get_json()
    site_id = data.get('site_id', 1)
    date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    crowd_levels = ['Low', 'Medium', 'High']
    predicted_level = random.choice(crowd_levels)
    confidence = round(random.uniform(75, 95), 2)
    
    visitor_ranges = {
        'Low': (500, 2000),
        'Medium': (2000, 5000),
        'High': (5000, 10000)
    }
    estimated_visitors = random.randint(*visitor_ranges[predicted_level])
    
    site = next((s for s in HERITAGE_SITES if s['id'] == site_id), HERITAGE_SITES[0])
    
    recommendations = {
        'Low': 'Ideal time to visit! Enjoy peaceful exploration.',
        'Medium': 'Moderate crowds expected. Book tickets in advance.',
        'High': 'Heavy crowds predicted. Consider visiting early morning or late evening.'
    }
    
    response = {
        'success': True,
        'site': site,
        'date': date,
        'prediction': {
            'crowd_level': predicted_level,
            'confidence': confidence,
            'estimated_visitors': estimated_visitors,
            'recommendation': recommendations[predicted_level]
        },
        'hourly_forecast': generate_hourly_forecast(),
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(response)

def generate_hourly_forecast():
    hours = list(range(6, 21))
    forecast = []
    
    for hour in hours:
        if 10 <= hour <= 14:
            crowd = random.randint(60, 90)
        elif 8 <= hour <= 10 or 14 <= hour <= 17:
            crowd = random.randint(40, 70)
        else:
            crowd = random.randint(10, 40)
        
        forecast.append({
            'hour': f"{hour:02d}:00",
            'crowd_percentage': crowd
        })
    
    return forecast

@app.route('/api/restore-image', methods=['POST'])
def restore_image():
    time.sleep(2)
    data = request.get_json()
    image_name = data.get('image_name', 'artifact_001.jpg')
    damage_type = data.get('damage_type', 'scratches')
    
    restoration_quality = round(random.uniform(85, 98), 2)
    processing_time = round(random.uniform(1.5, 3.5), 2)
    
    damage_types_handled = {
        'scratches': 'Surface scratches removed',
        'fading': 'Color and contrast restored',
        'cracks': 'Structural cracks filled',
        'water_damage': 'Water stains removed',
        'missing_parts': 'Missing sections reconstructed'
    }
    
    response = {
        'success': True,
        'image_name': image_name,
        'restoration': {
            'quality_score': restoration_quality,
            'processing_time_seconds': processing_time,
            'damage_detected': damage_type,
            'restoration_applied': damage_types_handled.get(damage_type, 'General restoration'),
            'ai_confidence': round(random.uniform(88, 97), 2)
        },
        'before_after_metrics': {
            'clarity_improvement': f"+{random.randint(30, 50)}%",
            'color_accuracy': f"{random.randint(85, 95)}%",
            'structural_integrity': f"{random.randint(90, 98)}%"
        },
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(response)

@app.route('/api/check-authenticity', methods=['POST'])
def check_authenticity():
    time.sleep(1.5)
    data = request.get_json()
    content_text = data.get('content', 'Sample heritage description')
    category = data.get('category', 'product')
    
    authenticity_score = round(random.uniform(65, 95), 2)
    
    if authenticity_score >= 85:
        level = 'Highly Authentic'
        color = 'green'
    elif authenticity_score >= 70:
        level = 'Moderately Authentic'
        color = 'yellow'
    else:
        level = 'Questionable'
        color = 'red'
    
    possible_red_flags = [
        'Generic cultural references detected',
        'Historical inaccuracies found',
        'Commercial bias in description',
        'Missing cultural context',
        'Stereotypical language used'
    ]
    
    num_flags = random.randint(0, 3) if authenticity_score < 80 else 0
    red_flags = random.sample(possible_red_flags, num_flags)
    
    response = {
        'success': True,
        'analysis': {
            'authenticity_score': authenticity_score,
            'authenticity_level': level,
            'status_color': color,
            'category': category,
            'content_length': len(content_text)
        },
        'nlp_metrics': {
            'cultural_accuracy': round(random.uniform(70, 95), 2),
            'historical_correctness': round(random.uniform(75, 98), 2),
            'language_appropriateness': round(random.uniform(80, 95), 2),
            'commercial_bias_score': round(random.uniform(5, 30), 2)
        },
        'red_flags': red_flags,
        'recommendations': generate_authenticity_recommendations(authenticity_score),
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(response)

def generate_authenticity_recommendations(score):
    if score >= 85:
        return ['Content meets high authenticity standards', 'Suitable for educational purposes']
    elif score >= 70:
        return ['Review cultural references', 'Consult with local experts', 'Add historical context']
    else:
        return ['Major revision needed', 'Verify all cultural claims', 'Remove stereotypical language']

@app.route('/api/dashboard-summary', methods=['GET'])
def dashboard_summary():
    today = datetime.now()
    total_sites = len(HERITAGE_SITES)
    sites_at_risk = random.randint(0, 2)
    sites_optimal = total_sites - sites_at_risk
    weekly_visitors = [random.randint(5000, 15000) for _ in range(7)]
    environmental_risk = random.choice(['Low', 'Medium', 'High'])
    
    risk_factors = {
        'Low': ['All parameters normal', 'No immediate threats'],
        'Medium': ['Increased foot traffic', 'Weather monitoring needed'],
        'High': ['Urgent: Excessive wear detected', 'Immediate conservation required']
    }
    
    ai_metrics = {
        'crowd_predictions': {
            'accuracy': round(random.uniform(85, 95), 2),
            'total_predictions': random.randint(500, 1000)
        },
        'image_restorations': {
            'completed': random.randint(50, 150),
            'average_quality': round(random.uniform(88, 95), 2)
        },
        'authenticity_checks': {
            'performed': random.randint(200, 500),
            'flagged_content': random.randint(10, 50)
        }
    }
    
    response = {
        'success': True,
        'overview': {
            'total_sites_monitored': total_sites,
            'sites_optimal': sites_optimal,
            'sites_at_risk': sites_at_risk,
            'last_updated': today.strftime('%Y-%m-%d %H:%M:%S')
        },
        'crowd_status': {
            'current_level': random.choice(['Low', 'Medium', 'High']),
            'today_visitors': random.randint(3000, 8000),
            'weekly_trend': 'increasing' if random.random() > 0.5 else 'stable'
        },
        'environmental_risk': {
            'level': environmental_risk,
            'factors': risk_factors[environmental_risk],
            'monitoring_active': True
        },
        'ai_performance': ai_metrics,
        'weekly_visitors': weekly_visitors,
        'alerts': generate_alerts(),
        'heritage_sites': HERITAGE_SITES
    }
    
    return jsonify(response)

def generate_alerts():
    possible_alerts = [
        {'type': 'warning', 'message': 'High crowd expected at Taj Mahal this weekend', 'priority': 'medium'},
        {'type': 'success', 'message': 'Image restoration completed for 10 artifacts', 'priority': 'low'},
        {'type': 'info', 'message': 'New authenticity check algorithm deployed', 'priority': 'low'},
        {'type': 'danger', 'message': 'Environmental risk increased at Machu Picchu', 'priority': 'high'},
    ]
    return random.sample(possible_alerts, random.randint(1, 3))

@app.route('/api/heritage-sites', methods=['GET'])
def get_heritage_sites():
    return jsonify({
        'success': True,
        'total': len(HERITAGE_SITES),
        'sites': HERITAGE_SITES
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'api_version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    return jsonify({
        'message': 'HeritageGuard API',
        'version': '1.0.0',
        'description': 'AI-powered cultural heritage preservation and sustainable tourism',
        'endpoints': [
            '/api/predict-crowd',
            '/api/restore-image',
            '/api/check-authenticity',
            '/api/dashboard-summary',
            '/api/heritage-sites',
            '/api/health'
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
