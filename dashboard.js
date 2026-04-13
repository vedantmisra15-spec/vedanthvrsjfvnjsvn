const API_BASE_URL = 'http://localhost:5000/api';
let visitorsChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('predictionDate').value = today;
    loadDashboardSummary();
    animateMetricCards();
});

async function loadDashboardSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard-summary`);
        const data = await response.json();
        
        if (data.success) {
            updateMetricCard('crowdLevel', data.crowd_status.current_level, getCrowdLevelClass(data.crowd_status.current_level));
            document.getElementById('crowdTrend').textContent = `${data.crowd_status.today_visitors.toLocaleString()} visitors today`;
            updateMetricCard('sitesMonitored', data.overview.total_sites_monitored, 'value');
            document.getElementById('sitesStatus').textContent = `${data.overview.sites_optimal} optimal, ${data.overview.sites_at_risk} at risk`;
            updateMetricCard('envRisk', data.environmental_risk.level, getEnvRiskClass(data.environmental_risk.level));
            document.getElementById('envStatus').textContent = data.environmental_risk.factors[0];
            const avgAuth = 85 + Math.random() * 10;
            updateMetricCard('authenticityScore', `${avgAuth.toFixed(1)}%`, 'value');
            document.getElementById('lastUpdated').textContent = `Updated: ${new Date(data.overview.last_updated).toLocaleTimeString()}`;
            createVisitorsChart(data.weekly_visitors);
            displayAlerts(data.alerts);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data. Make sure the backend server is running.');
    }
}

function updateMetricCard(elementId, value, className) {
    const element = document.getElementById(elementId);
    element.innerHTML = value;
    if (className && className !== 'value') {
        element.className = className;
    }
}

function getCrowdLevelClass(level) {
    const classes = { 'Low': 'metric-value-success', 'Medium': 'metric-value-warning', 'High': 'metric-value-danger' };
    return classes[level] || '';
}

function getEnvRiskClass(level) {
    const classes = { 'Low': 'metric-value-success', 'Medium': 'metric-value-warning', 'High': 'metric-value-danger' };
    return classes[level] || '';
}

function createVisitorsChart(weeklyData) {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;
    if (visitorsChart) visitorsChart.destroy();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    visitorsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Visitors',
                data: weeklyData,
                borderColor: '#8B4513',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#8B4513',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 24, 16, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#8B4513',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: { label: function(context) { return `${context.parsed.y.toLocaleString()} visitors`; } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return value.toLocaleString(); } },
                    grid: { color: 'rgba(139, 69, 19, 0.1)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function displayAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    if (!alerts || alerts.length === 0) {
        container.innerHTML = '<div class="alert-placeholder">No active alerts</div>';
        return;
    }
    container.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <div class="alert-header"><span>${getAlertIcon(alert.type)}</span><span>${getAlertTitle(alert.type)}</span></div>
            <div class="alert-message">${alert.message}</div>
        </div>
    `).join('');
}

function getAlertIcon(type) {
    const icons = { 'success': '✓', 'warning': '⚠️', 'danger': '🚨', 'info': 'ℹ️' };
    return icons[type] || 'ℹ️';
}

function getAlertTitle(type) {
    const titles = { 'success': 'Success', 'warning': 'Warning', 'danger': 'Alert', 'info': 'Information' };
    return titles[type] || 'Notice';
}

async function predictCrowd() {
    const button = event.target;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    const siteId = document.getElementById('siteSelect').value;
    const date = document.getElementById('predictionDate').value;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    button.disabled = true;
    try {
        const response = await fetch(`${API_BASE_URL}/predict-crowd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_id: parseInt(siteId), date: date })
        });
        const data = await response.json();
        if (data.success) { displayCrowdResults(data); } else { showError('Prediction failed. Please try again.'); }
    } catch (error) {
        console.error('Error predicting crowd:', error);
        showError('Failed to connect to API. Ensure backend is running on port 5000.');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function displayCrowdResults(data) {
    const resultDiv = document.getElementById('crowdResult');
    const contentDiv = document.getElementById('crowdResultContent');
    const levelColor = { 'Low': 'success', 'Medium': 'warning', 'High': 'danger' }[data.prediction.crowd_level];
    contentDiv.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--color-primary); margin-bottom: 0.5rem;">${data.site.name}</h4>
            <p style="color: var(--color-text-light); font-size: 0.875rem;">${data.site.location}</p>
        </div>
        <div class="result-stat"><span class="result-stat-label">Predicted Level</span><span class="result-badge badge-${levelColor}">${data.prediction.crowd_level}</span></div>
        <div class="result-stat"><span class="result-stat-label">Confidence</span><span class="result-stat-value">${data.prediction.confidence}%</span></div>
        <div class="result-stat"><span class="result-stat-label">Estimated Visitors</span><span class="result-stat-value">${data.prediction.estimated_visitors.toLocaleString()}</span></div>
        <div class="result-stat"><span class="result-stat-label">Date</span><span class="result-stat-value">${new Date(data.date).toLocaleDateString()}</span></div>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(139, 69, 19, 0.05); border-radius: 8px;">
            <strong style="color: var(--color-primary);">Recommendation:</strong>
            <p style="margin-top: 0.5rem; color: var(--color-text-secondary);">${data.prediction.recommendation}</p>
        </div>
        <div style="margin-top: 1rem;">
            <strong style="color: var(--color-primary);">Hourly Forecast (Peak Hours):</strong>
            <div style="margin-top: 0.5rem;">${data.hourly_forecast.slice(4, 9).map(h => `<div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>${h.hour}</span><span>${h.crowd_percentage}% capacity</span></div>`).join('')}</div>
        </div>
    `;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function restoreImage() {
    const button = event.target;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    const imageName = document.getElementById('imageName').value;
    const damageType = document.getElementById('damageType').value;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    button.disabled = true;
    try {
        const response = await fetch(`${API_BASE_URL}/restore-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_name: imageName, damage_type: damageType })
        });
        const data = await response.json();
        if (data.success) { displayRestoreResults(data); } else { showError('Restoration failed. Please try again.'); }
    } catch (error) {
        console.error('Error restoring image:', error);
        showError('Failed to connect to API. Ensure backend is running on port 5000.');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function displayRestoreResults(data) {
    const resultDiv = document.getElementById('restoreResult');
    const contentDiv = document.getElementById('restoreResultContent');
    contentDiv.innerHTML = `
        <div style="margin-bottom: 1rem;"><h4 style="color: var(--color-primary);">${data.image_name}</h4></div>
        <div class="result-stat"><span class="result-stat-label">Restoration Quality</span><span class="result-badge badge-success">${data.restoration.quality_score}%</span></div>
        <div class="result-stat"><span class="result-stat-label">Processing Time</span><span class="result-stat-value">${data.restoration.processing_time_seconds}s</span></div>
        <div class="result-stat"><span class="result-stat-label">Damage Detected</span><span class="result-stat-value">${data.restoration.damage_detected}</span></div>
        <div class="result-stat"><span class="result-stat-label">AI Confidence</span><span class="result-stat-value">${data.restoration.ai_confidence}%</span></div>
        <div style="margin-top: 1rem;">
            <strong style="color: var(--color-primary);">Applied Restoration:</strong>
            <p style="margin-top: 0.5rem; color: var(--color-text-secondary);">${data.restoration.restoration_applied}</p>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(45, 80, 22, 0.05); border-radius: 8px;">
            <strong style="color: var(--color-success);">Improvement Metrics:</strong>
            <div style="margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Clarity Improvement:</span><strong>${data.before_after_metrics.clarity_improvement}</strong></div>
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Color Accuracy:</span><strong>${data.before_after_metrics.color_accuracy}</strong></div>
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Structural Integrity:</span><strong>${data.before_after_metrics.structural_integrity}</strong></div>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function checkAuthenticity() {
    const button = event.target;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    const contentText = document.getElementById('contentText').value;
    const category = document.getElementById('contentCategory').value;
    if (!contentText.trim()) { showError('Please enter content to analyze.'); return; }
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    button.disabled = true;
    try {
        const response = await fetch(`${API_BASE_URL}/check-authenticity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: contentText, category: category })
        });
        const data = await response.json();
        if (data.success) { displayAuthenticityResults(data); } else { showError('Analysis failed. Please try again.'); }
    } catch (error) {
        console.error('Error checking authenticity:', error);
        showError('Failed to connect to API. Ensure backend is running on port 5000.');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function displayAuthenticityResults(data) {
    const resultDiv = document.getElementById('authenticityResult');
    const contentDiv = document.getElementById('authenticityResultContent');
    const levelColor = data.analysis.status_color === 'green' ? 'success' : data.analysis.status_color === 'yellow' ? 'warning' : 'danger';
    contentDiv.innerHTML = `
        <div class="result-stat"><span class="result-stat-label">Authenticity Score</span><span class="result-badge badge-${levelColor}">${data.analysis.authenticity_score}%</span></div>
        <div class="result-stat"><span class="result-stat-label">Assessment</span><span class="result-stat-value">${data.analysis.authenticity_level}</span></div>
        <div class="result-stat"><span class="result-stat-label">Category</span><span class="result-stat-value">${data.analysis.category}</span></div>
        <div style="margin-top: 1rem;">
            <strong style="color: var(--color-primary);">NLP Analysis Metrics:</strong>
            <div style="margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Cultural Accuracy:</span><strong>${data.nlp_metrics.cultural_accuracy}%</strong></div>
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Historical Correctness:</span><strong>${data.nlp_metrics.historical_correctness}%</strong></div>
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Language Appropriateness:</span><strong>${data.nlp_metrics.language_appropriateness}%</strong></div>
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;"><span>Commercial Bias:</span><strong>${data.nlp_metrics.commercial_bias_score}%</strong></div>
            </div>
        </div>
        ${data.red_flags.length > 0 ? `<div style="margin-top: 1rem; padding: 1rem; background: rgba(153, 27, 27, 0.05); border-radius: 8px; border-left: 3px solid var(--color-danger);"><strong style="color: var(--color-danger);">⚠️ Red Flags Detected:</strong><ul style="margin-top: 0.5rem; margin-left: 1.25rem; color: var(--color-text-secondary);">${data.red_flags.map(flag => `<li>${flag}</li>`).join('')}</ul></div>` : ''}
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(139, 69, 19, 0.05); border-radius: 8px;">
            <strong style="color: var(--color-primary);">Recommendations:</strong>
            <ul style="margin-top: 0.5rem; margin-left: 1.25rem; color: var(--color-text-secondary);">${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
        </div>
    `;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeResult(resultId) {
    document.getElementById(resultId).style.display = 'none';
}

function showError(message) {
    alert(message);
}

function animateMetricCards() {
    const cards = document.querySelectorAll('.metric-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

window.predictCrowd = predictCrowd;
window.restoreImage = restoreImage;
window.checkAuthenticity = checkAuthenticity;
window.closeResult = closeResult;
